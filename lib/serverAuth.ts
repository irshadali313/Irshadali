import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { connectDB } from './mongodb';
import Admin, { AdminRole, IAdminDocument } from './models/Admin';
import AdminSession from './models/AdminSession';
import AuditLog from './models/AuditLog';
import LoginAttempt from './models/LoginAttempt';
import SecurityToken, { SecurityTokenType } from './models/SecurityToken';
import { verify as verifyTotp } from 'otplib';
import { verifyPassword } from './password';

export const SESSION_COOKIE = 'admin_session';
export const CSRF_COOKIE = 'admin_csrf';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 8;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
const safeEqual = (left: string, right: string) => {
    const a = Buffer.from(left);
    const b = Buffer.from(right);
    return a.length === b.length && timingSafeEqual(a, b);
};

async function requestContext() {
    const requestHeaders = await headers();
    return {
        ip: requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
        userAgent: requestHeaders.get('user-agent') || undefined,
    };
}

export async function audit(event: string, success: boolean, adminId?: string, metadata?: Record<string, string>) {
    await connectDB();
    const context = await requestContext();
    await AuditLog.create({ adminId, event, success, ...context, metadata });
}

async function consumeLoginAttempt(key: string) {
    await connectDB();
    const now = new Date();
    const record = await LoginAttempt.findOneAndUpdate(
        { key, $or: [{ expiresAt: { $lte: now } }, { expiresAt: { $exists: false } }] },
        { $set: { count: 1, expiresAt: new Date(Date.now() + LOGIN_WINDOW_MS) } },
        { new: true, upsert: false },
    );
    if (record) return record.count <= MAX_LOGIN_ATTEMPTS;
    const current = await LoginAttempt.findOneAndUpdate(
        { key },
        { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(Date.now() + LOGIN_WINDOW_MS) } },
        { new: true, upsert: true },
    );
    return current.count <= MAX_LOGIN_ATTEMPTS;
}

export async function verifyAdminCredentials(email: string, password: string) {
    const allowed = await consumeLoginAttempt(`login:${email.toLowerCase()}:${(await requestContext()).ip}`);
    if (!allowed) {
        await audit('login_rate_limited', false, undefined, { email: email.toLowerCase() });
        return null;
    }

    await connectDB();
    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+passwordHash +mfaSecretEncrypted');
    let valid = false;
    if (admin?.isActive && (!admin.lockedUntil || admin.lockedUntil < new Date())) {
        valid = await verifyPassword(admin.passwordHash, password);
    }
    if (!admin || !valid) {
        await audit('login_failed', false, admin?._id.toString(), { reason: 'invalid_credentials' });
        return null;
    }
    await audit('login_succeeded', true, admin._id.toString());
    return admin;
}

export async function verifyAdminMfa(admin: IAdminDocument, token?: string) {
    if (!admin.mfaEnabled) return true;
    if (!token || !admin.mfaSecretEncrypted) return false;
    return (await verifyTotp({ secret: decryptSecret(admin.mfaSecretEncrypted), token })).valid;
}

export async function createAdminSession(admin: IAdminDocument) {
    await connectDB();
    const token = randomBytes(32).toString('base64url');
    await AdminSession.deleteMany({ adminId: admin._id });
    const context = await requestContext();
    await AdminSession.create({ adminId: admin._id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + SESSION_TTL_MS), ...context });
    const csrf = randomBytes(32).toString('base64url');
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: SESSION_TTL_MS / 1000, path: '/' });
    cookieStore.set(CSRF_COOKIE, csrf, { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: SESSION_TTL_MS / 1000, path: '/' });
}

export async function destroyAdminSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (token) {
        await connectDB();
        const session = await AdminSession.findOne({ tokenHash: hashToken(token) }).select('adminId');
        await AdminSession.deleteOne({ tokenHash: hashToken(token) });
        if (session) await audit('logout', true, session.adminId.toString());
    }
    cookieStore.delete(SESSION_COOKIE);
    cookieStore.delete(CSRF_COOKIE);
}

export async function getCurrentAdmin() {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return null;
    await connectDB();
    const session = await AdminSession.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } });
    if (!session) return null;
    const admin = await Admin.findOne({ _id: session.adminId, isActive: true }).select('_id email role isActive mfaEnabled passwordChangedAt');
    if (!admin) return null;
    await AdminSession.updateOne({ _id: session._id }, { $set: { lastUsedAt: new Date() } });
    return admin;
}

export async function requireAdmin(roles?: AdminRole[]) {
    const admin = await getCurrentAdmin();
    if (!admin || (roles && !roles.includes(admin.role))) throw new Error('UNAUTHORIZED');
    return admin;
}

export async function assertSameOrigin(request: Request) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (!origin || !host || new URL(origin).host !== host) throw new Error('CSRF');
    const csrfHeader = request.headers.get('x-csrf-token');
    const csrfCookie = (await cookies()).get(CSRF_COOKIE)?.value;
    if (!csrfHeader || !csrfCookie || !safeEqual(csrfHeader, csrfCookie)) throw new Error('CSRF');
}

export function createSecurityToken() {
    return randomBytes(32).toString('base64url');
}

export async function issueSecurityToken(adminId: string, type: SecurityTokenType, ttlMs: number) {
    const token = createSecurityToken();
    await SecurityToken.create({ adminId, tokenHash: hashToken(token), type, expiresAt: new Date(Date.now() + ttlMs) });
    return token;
}

export async function consumeSecurityToken(token: string, type: SecurityTokenType) {
    const record = await SecurityToken.findOneAndUpdate(
        { tokenHash: hashToken(token), type, expiresAt: { $gt: new Date() }, usedAt: { $exists: false } },
        { $set: { usedAt: new Date() } },
        { new: true },
    ).select('+tokenHash');
    return record;
}

export async function invalidateAdminSessions(adminId: string) {
    await connectDB();
    await AdminSession.deleteMany({ adminId });
}

function encryptionKey() {
    const value = process.env.ADMIN_MFA_ENCRYPTION_KEY;
    if (!value) throw new Error('ADMIN_MFA_ENCRYPTION_KEY is required');
    const key = Buffer.from(value, 'base64');
    if (key.length !== 32) throw new Error('ADMIN_MFA_ENCRYPTION_KEY must be base64-encoded 32 bytes');
    return key;
}

export function encryptSecret(value: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decryptSecret(value: string) {
    const [iv, tag, encrypted] = value.split('.');
    const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64url'));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64url')), decipher.final()]).toString('utf8');
}

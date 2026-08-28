import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/lib/models/Admin';
import { audit, consumeSecurityToken, invalidateAdminSessions, issueSecurityToken } from '@/lib/serverAuth';
import { hashPassword } from '@/lib/password';
import { sendPasswordResetEmail } from '@/lib/mailer';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        await connectDB();
        const admin = await Admin.findOne({ email: String(email || '').toLowerCase() });
        if (admin) {
            const token = await issueSecurityToken(admin._id.toString(), 'password-reset', 15 * 60 * 1000);
            await sendPasswordResetEmail(admin.email, token);
            await audit('password_reset_requested', true, admin._id.toString());
        }
    } catch { /* Always return the same response to prevent account enumeration. */ }
    return NextResponse.json({ message: 'If the account exists, reset instructions have been sent.' });
}

export async function PUT(request: Request) {
    try {
        const { token, newPassword } = await request.json();
        if (typeof token !== 'string' || typeof newPassword !== 'string' || newPassword.length < 12) return NextResponse.json({ error: 'Invalid reset request' }, { status: 400 });
        await connectDB();
        const record = await consumeSecurityToken(token, 'password-reset');
        if (!record) return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
        await Admin.updateOne({ _id: record.adminId }, { $set: { passwordHash: await hashPassword(newPassword), passwordChangedAt: new Date() } });
        await invalidateAdminSessions(record.adminId.toString());
        await audit('password_reset_completed', true, record.adminId.toString());
        return NextResponse.json({ updated: true });
    } catch { return NextResponse.json({ error: 'Unable to reset password' }, { status: 400 }); }
}
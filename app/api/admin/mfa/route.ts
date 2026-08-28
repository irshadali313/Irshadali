import { NextResponse } from 'next/server';
import { generateSecret, generateURI, verify } from 'otplib';
import { assertSameOrigin, decryptSecret, encryptSecret, requireAdmin } from '@/lib/serverAuth';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/lib/models/Admin';

export async function POST(request: Request) {
    try {
        await assertSameOrigin(request);
        const admin = await requireAdmin();
        const secret = generateSecret();
        await connectDB();
        await Admin.updateOne({ _id: admin._id }, { $set: { mfaSecretEncrypted: encryptSecret(secret), mfaEnabled: false } });
        return NextResponse.json({ uri: generateURI({ issuer: 'Portfolio Admin', label: admin.email, secret }) });
    } catch { return NextResponse.json({ error: 'Unable to start MFA setup' }, { status: 400 }); }
}

export async function PUT(request: Request) {
    try {
        await assertSameOrigin(request);
        const admin = await requireAdmin();
        const { token } = await request.json();
        const current = await Admin.findById(admin._id).select('+mfaSecretEncrypted');
        if (!current?.mfaSecretEncrypted || typeof token !== 'string' || !(await verify({ secret: decryptSecret(current.mfaSecretEncrypted), token })).valid) return NextResponse.json({ error: 'Invalid MFA code' }, { status: 400 });
        await Admin.updateOne({ _id: admin._id }, { $set: { mfaEnabled: true } });
        return NextResponse.json({ enabled: true });
    } catch { return NextResponse.json({ error: 'Unable to verify MFA setup' }, { status: 400 }); }
}
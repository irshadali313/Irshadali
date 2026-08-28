import { NextResponse } from 'next/server';
import { assertSameOrigin, audit, invalidateAdminSessions, requireAdmin } from '@/lib/serverAuth';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/lib/models/Admin';
import { hashPassword, verifyPassword } from '@/lib/password';

export async function PUT(request: Request) {
    try {
        await assertSameOrigin(request);
        const admin = await requireAdmin();
        const { currentPassword, newPassword } = await request.json();
        if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 12) return NextResponse.json({ error: 'Invalid password request' }, { status: 400 });
        const current = await Admin.findById(admin._id).select('+passwordHash');
        if (!current || !(await verifyPassword(current.passwordHash, currentPassword))) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
        await connectDB();
        await Admin.updateOne({ _id: admin._id }, { $set: { passwordHash: await hashPassword(newPassword), passwordChangedAt: new Date() } });
        await invalidateAdminSessions(admin._id.toString());
        await audit('password_changed', true, admin._id.toString());
        return NextResponse.json({ updated: true });
    } catch { return NextResponse.json({ error: 'Unable to change password' }, { status: 400 }); }
}
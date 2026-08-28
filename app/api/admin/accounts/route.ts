import { NextResponse } from 'next/server';
import { assertSameOrigin, audit, requireAdmin } from '@/lib/serverAuth';
import { hashPassword } from '@/lib/password';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/lib/models/Admin';

export async function GET() {
    try {
        await requireAdmin(['superadmin']);
        await connectDB();
        const admins = await Admin.find({}, '_id email role isActive mfaEnabled createdAt updatedAt').lean();
        return NextResponse.json(admins);
    } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
}

export async function POST(request: Request) {
    try {
        const actor = await requireAdmin(['superadmin']);
        await assertSameOrigin(request);
        const { email, password, role = 'admin' } = await request.json();
        if (!/^\S+@\S+\.\S+$/.test(email) || typeof password !== 'string' || password.length < 12 || !['admin', 'developer'].includes(role)) return NextResponse.json({ error: 'Invalid admin account' }, { status: 400 });
        await connectDB();
        const created = await Admin.create({ email: email.toLowerCase(), passwordHash: await hashPassword(password), role });
        await audit('admin_created', true, actor._id.toString(), { role });
        return NextResponse.json({ id: created._id, email: created.email, role: created.role }, { status: 201 });
    } catch { return NextResponse.json({ error: 'Unable to create admin' }, { status: 400 }); }
}

export async function PATCH(request: Request) {
    try {
        const actor = await requireAdmin(['superadmin']);
        await assertSameOrigin(request);
        const { id, role, isActive } = await request.json();
        if (!id || (role !== undefined && !['superadmin', 'admin', 'developer'].includes(role)) || (isActive !== undefined && typeof isActive !== 'boolean')) return NextResponse.json({ error: 'Invalid admin update' }, { status: 400 });
        await connectDB();
        const update = { ...(role === undefined ? {} : { role }), ...(isActive === undefined ? {} : { isActive }) };
        await Admin.updateOne({ _id: id }, { $set: update });
        await audit(role === undefined ? 'admin_disabled_status_changed' : 'admin_role_changed', true, actor._id.toString(), { targetId: id, ...(role ? { role } : {}), ...(isActive === undefined ? {} : { isActive: String(isActive) }) });
        return NextResponse.json({ updated: true });
    } catch { return NextResponse.json({ error: 'Unable to update admin' }, { status: 400 }); }
}
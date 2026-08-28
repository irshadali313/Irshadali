import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PortfolioModel from '@/lib/models/Portfolio';
import { assertSameOrigin, requireAdmin } from '@/lib/serverAuth';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedProjectTypes = ['Static website', 'Dynamic web app', 'E-commerce', 'Custom product', 'Not sure'];

export async function GET() {
    try {
        await requireAdmin();
        await connectDB();
        const doc = await PortfolioModel.findOne({}, { inquiries: 1 }).lean();
        return NextResponse.json(doc?.inquiries || [], { headers: { 'Cache-Control': 'no-store' } });
    } catch {
        return NextResponse.json({ error: 'Failed to load inquiries' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        if (body.website) return NextResponse.json({ submitted: true });

        const values = ['name', 'email', 'projectType', 'budget', 'timeline', 'details'];
        if (values.some((key) => typeof body[key] !== 'string' || !body[key].trim())) {
            return NextResponse.json({ error: 'Please complete all required fields' }, { status: 400 });
        }
        if (!emailPattern.test(body.email) || !allowedProjectTypes.includes(body.projectType)) {
            return NextResponse.json({ error: 'Please provide valid inquiry details' }, { status: 400 });
        }

        await connectDB();
        await PortfolioModel.findOneAndUpdate(
            {},
            { $push: { inquiries: {
                name: body.name.trim(), email: body.email.trim(), company: String(body.company || '').trim(),
                projectType: body.projectType, budget: body.budget.trim(), timeline: body.timeline.trim(), details: body.details.trim(), status: 'new',
            } } },
            { upsert: true, setDefaultsOnInsert: true },
        );
        return NextResponse.json({ submitted: true }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Unable to send your inquiry' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
    await requireAdmin();
    await assertSameOrigin(req);
        const { id, status } = await req.json();
        if (!id || !['new', 'contacted', 'closed'].includes(status)) return NextResponse.json({ error: 'Invalid inquiry update' }, { status: 400 });
        await connectDB();
        await PortfolioModel.updateOne({ 'inquiries._id': id }, { $set: { 'inquiries.$.status': status } });
        return NextResponse.json({ updated: true });
    } catch {
        return NextResponse.json({ error: 'Unable to update inquiry' }, { status: 500 });
    }
}
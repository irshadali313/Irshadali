import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PortfolioModel from '@/lib/models/Portfolio';
import { assertSameOrigin, requireAdmin } from '@/lib/serverAuth';

export async function PUT(req: Request) {
    try {
        await requireAdmin();
        await assertSameOrigin(req);
        await connectDB();
        const { certificates } = await req.json();

        const doc = await PortfolioModel.findOneAndUpdate(
            {},
            { $set: { certificates } },
            { new: true, upsert: true },
        );

        return NextResponse.json(doc?.toObject());
    } catch (err) {
        console.error('[PUT /api/portfolio/certificates]', err);
        return NextResponse.json(
            { error: 'Failed to update certificates' },
            { status: 500 },
        );
    }
}

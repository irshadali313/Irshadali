import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PortfolioModel from '@/lib/models/Portfolio';
import { assertSameOrigin, requireAdmin } from '@/lib/serverAuth';

export async function PUT(req: Request) {
    try {
        await requireAdmin();
        await assertSameOrigin(req);
        await connectDB();
        const body = await req.json();
        const { generalInfo, socialLinks, bannerStats, aboutMe } = body;

        const doc = await PortfolioModel.findOneAndUpdate(
            {},
            { $set: { generalInfo, socialLinks, bannerStats, aboutMe } },
            { new: true, upsert: true, setDefaultsOnInsert: true },
        );

        return NextResponse.json(doc?.toObject());
    } catch (err) {
        console.error('[PUT /api/portfolio/general]', err);
        return NextResponse.json(
            { error: 'Failed to update general info' },
            { status: 500 },
        );
    }
}

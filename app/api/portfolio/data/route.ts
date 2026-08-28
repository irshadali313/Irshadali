import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PortfolioModel from '@/lib/models/Portfolio';
import { SEED_DATA } from '@/lib/seedData';

export async function GET() {
    try {
        await connectDB();
        let doc = await PortfolioModel.findOne({});

        // Auto-seed if no document exists
        if (!doc) {
            doc = await PortfolioModel.create(SEED_DATA);
        }

        return NextResponse.json(doc.toObject(), {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (err) {
        console.error('[GET /api/portfolio/data]', err);
        return NextResponse.json(
            { error: 'Failed to fetch portfolio data' },
            { status: 500 },
        );
    }
}

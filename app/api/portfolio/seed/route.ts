import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PortfolioModel from '@/lib/models/Portfolio';
import { SEED_DATA } from '@/lib/seedData';
import { assertSameOrigin, requireAdmin } from '@/lib/serverAuth';

export async function POST(req: Request) {
    try {
        await requireAdmin(['superadmin']);
        await assertSameOrigin(req);
        await connectDB();

        const url = new URL(req.url);
        const force = url.searchParams.get('force') === 'true';

        const existing = await PortfolioModel.findOne({});

        if (existing && !force) {
            return NextResponse.json({
                message: 'Database already seeded. Use ?force=true to overwrite.',
                seeded: false,
            });
        }

        let importData: any = SEED_DATA;
        try {
            const contentType = req.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const body = await req.json();
                if (body && typeof body === 'object') {
                    const cleanBody = { ...body };
                    delete cleanBody._id;
                    delete cleanBody.__v;
                    delete cleanBody.createdAt;
                    delete cleanBody.updatedAt;
                    importData = cleanBody;
                }
            }
        } catch {
            // Fall back to SEED_DATA
        }

        if (existing && force) {
            await PortfolioModel.deleteMany({});
        }

        const doc = await PortfolioModel.create(importData);

        return NextResponse.json({
            message: 'Database seeded successfully!',
            seeded: true,
            id: doc._id,
        });
    } catch (err) {
        console.error('[POST /api/portfolio/seed]', err);
        return NextResponse.json(
            { error: 'Failed to seed database' },
            { status: 500 },
        );
    }
}

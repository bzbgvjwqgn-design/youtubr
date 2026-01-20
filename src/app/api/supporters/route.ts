import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { supportersPublic } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const creatorId = req.nextUrl.searchParams.get('creatorId');

    if (!creatorId) {
      return NextResponse.json({ error: 'Creator ID required' }, { status: 400 });
    }

    const supporters = await db.query.supportersPublic.findMany({
      where: eq(supportersPublic.creatorId, parseInt(creatorId)),
      orderBy: (supportersPublic, { desc }) => [desc(supportersPublic.lastSupportedAt)],
    });

    return NextResponse.json(supporters);
  } catch (error) {
    console.error('Fetch supporters error:', error);
    return NextResponse.json({ error: 'Failed to fetch supporters' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { supportTiers, creatorProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createSupportTierSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { creatorId, ...tierData } = body;

    if (!creatorId) {
      return NextResponse.json({ error: 'Creator ID required' }, { status: 400 });
    }

    const validation = createSupportTierSchema.safeParse(tierData);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Verify creator exists
    const creator = await db.query.creatorProfiles.findFirst({
      where: eq(creatorProfiles.id, creatorId),
    });

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const [tier] = await db
      .insert(supportTiers)
      .values({
        creatorId,
        ...validation.data,
        amount: validation.data.amount.toString() as any,
      })
      .returning();

    return NextResponse.json(tier, { status: 201 });
  } catch (error) {
    console.error('Create support tier error:', error);
    return NextResponse.json({ error: 'Failed to create support tier' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const creatorId = req.nextUrl.searchParams.get('creatorId');

    if (!creatorId) {
      return NextResponse.json({ error: 'Creator ID required' }, { status: 400 });
    }

    const tiers = await db.query.supportTiers.findMany({
      where: eq(supportTiers.creatorId, parseInt(creatorId)),
    });

    return NextResponse.json(tiers);
  } catch (error) {
    console.error('Fetch support tiers error:', error);
    return NextResponse.json({ error: 'Failed to fetch support tiers' }, { status: 500 });
  }
}

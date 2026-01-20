import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { creatorProfiles, users, payments, subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const creatorId = req.nextUrl.searchParams.get('creatorId');

    if (!creatorId) {
      return NextResponse.json({ error: 'Creator ID required' }, { status: 400 });
    }

    // Get all payments for creator
    const creatorPayments = await db.query.payments.findMany({
      where: eq(payments.creatorId, parseInt(creatorId)),
    });

    // Get all subscriptions for creator
    const creatorSubscriptions = await db.query.subscriptions.findMany({
      where: eq(subscriptions.creatorId, parseInt(creatorId)),
    });

    const totalRevenue = creatorPayments
      .filter((p) => p.status === 'success')
      .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

    const monthlyRevenue = creatorSubscriptions
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + parseFloat(s.amount.toString()), 0);

    return NextResponse.json({
      totalRevenue,
      monthlyRevenue,
      totalPayments: creatorPayments.length,
      activeSubscriptions: creatorSubscriptions.filter((s) => s.status === 'active').length,
    });
  } catch (error) {
    console.error('Fetch analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

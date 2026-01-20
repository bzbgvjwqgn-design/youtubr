import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments, supportersPublic, subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cashfreeClient } from '@/lib/cashfree';

// Cashfree webhook handler (basic)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Cashfree webhook payload may vary; we'll accept order_id and payment_status
    const orderId = body.order_id || body.orderId || body.data?.order_id;
    const paymentStatus = (body.payment_status || body.paymentStatus || body.data?.payment_status || '').toUpperCase();

    if (!orderId) return NextResponse.json({ error: 'Missing order id' }, { status: 400 });

    const payment = await db.query.payments.findFirst({ where: eq(payments.paymentId, orderId) });
    if (!payment) return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });

    if (paymentStatus === 'SUCCESS') {
      await db.update(payments).set({ status: 'success' }).where(eq(payments.id, payment.id));

      // Add public supporter
      if (payment.supporterName) {
        await db.insert(supportersPublic).values({
          creatorId: payment.creatorId,
          supporterName: payment.supporterName,
          amount: payment.amount,
          type: payment.type as any,
          isAnonymous: payment.isAnonymous,
        });
      }

      // Create subscription record if monthly
      if (payment.type === 'monthly') {
        const subscriptionId = `sub_${payment.id}_${Date.now()}`;
        await db.insert(subscriptions).values({
          paymentId: payment.id,
          creatorId: payment.creatorId,
          supporterId: payment.supporterId || 0,
          tierId: payment.tierId,
          amount: payment.amount,
          gatewaySubscriptionId: subscriptionId,
          status: 'active',
          startDate: new Date(),
        });
      }

      return NextResponse.json({ message: 'Processed' });
    }

    if (paymentStatus === 'FAILED') {
      await db.update(payments).set({ status: 'failed' }).where(eq(payments.id, payment.id));
      return NextResponse.json({ message: 'Marked failed' });
    }

    return NextResponse.json({ message: 'Ignored' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}

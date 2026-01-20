import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments, subscriptions, supportersPublic } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cashfreeClient } from '@/lib/cashfree';

export async function POST(req: NextRequest) {
  try {
    const { orderId, paymentId } = await req.json();

    if (!orderId || !paymentId) {
      return NextResponse.json(
        { error: 'Order ID and Payment ID required' },
        { status: 400 }
      );
    }

    // Verify payment with Cashfree
    const verificationResult = await cashfreeClient.verifyPayment({
      orderId,
      paymentId,
    });

    // Find payment record
    const payment = await db.query.payments.findFirst({
      where: eq(payments.paymentId, orderId),
      with: {
        tier: true,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    if (verificationResult.payment_status === 'SUCCESS') {
      // Update payment status
      await db
        .update(payments)
        .set({ status: 'success' })
        .where(eq(payments.id, payment.id));

      // Add to supporters public list
      await db.insert(supportersPublic).values({
        creatorId: payment.creatorId,
        supporterName: payment.supporterName,
        amount: payment.amount,
        type: payment.type as any,
        isAnonymous: payment.isAnonymous,
      });

      // If monthly, create subscription
      if (payment.type === 'monthly') {
        const subscriptionId = `sub_${payment.id}_${Date.now()}`;

        const cashfreeSubscription = await cashfreeClient.createSubscription({
          orderId,
          subscriptionId,
          amount: parseFloat(payment.amount.toString()),
          intervalType: 'MONTHLY',
          intervalCount: 1,
          customerName: payment.supporterName,
          customerPhone: '9999999999',
          returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/callback`,
        });

        const [subscription] = await db
          .insert(subscriptions)
          .values({
            paymentId: payment.id,
            creatorId: payment.creatorId,
            supporterId: payment.supporterId || 0,
            tierId: payment.tierId,
            amount: payment.amount,
            gatewaySubscriptionId: subscriptionId,
            status: 'active',
            startDate: new Date(),
          })
          .returning();
      }

      return NextResponse.json(
        {
          message: 'Payment verified and processed successfully',
          status: 'success',
        },
        { status: 200 }
      );
    } else {
      // Update payment status to failed
      await db
        .update(payments)
        .set({ status: 'failed' })
        .where(eq(payments.id, payment.id));

      return NextResponse.json(
        {
          message: 'Payment verification failed',
          status: 'failed',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments, subscriptions, supportersPublic, supportTiers, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cashfreeClient } from '@/lib/cashfree';
import { createPaymentSchema } from '@/lib/validations';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { creatorId, ...paymentData } = body;

    if (!creatorId) {
      return NextResponse.json({ error: 'Creator ID required' }, { status: 400 });
    }

    const validation = createPaymentSchema.safeParse(paymentData);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { tierId, supporterName, isAnonymous, email, phone } = validation.data;

    // Get tier details
    const tier = await db.query.supportTiers.findFirst({
      where: eq(supportTiers.id, tierId),
    });

    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
    }

    // Create order ID
    const orderId = `order_${creatorId}_${tierId}_${Date.now()}`;

    // Call Cashfree to create order
    const amount = parseFloat(tier.amount.toString());
    const cashfreeOrder = await cashfreeClient.createOrder({
      orderId,
      amount,
      customerName: supporterName,
      customerEmail: email,
      customerPhone: phone,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
      orderNote: `Support for creator ${creatorId}`,
    });

    // Save payment record with pending status
    const [payment] = await db
      .insert(payments)
      .values({
        creatorId,
        tierId,
        amount: amount.toString() as any,
        type: tier.type as any,
        paymentGateway: 'cashfree',
        paymentId: cashfreeOrder.order_id,
        status: 'pending',
        supporterName: isAnonymous ? 'Anonymous' : supporterName,
        isAnonymous,
      })
      .returning();

    return NextResponse.json(
      {
        message: 'Order created successfully',
        orderId: cashfreeOrder.order_id,
        paymentLink: cashfreeOrder.payment_link,
        paymentSessionId: cashfreeOrder.payment_session_id,
        amount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const creatorId = req.nextUrl.searchParams.get('creatorId');
    const status = req.nextUrl.searchParams.get('status');

    let query = db.query.payments.findMany();

    if (creatorId) {
      const payments_records = await db.query.payments.findMany({
        where: eq(payments.creatorId, parseInt(creatorId)),
        with: {
          tier: true,
        },
      });
      return NextResponse.json(payments_records);
    }

    return NextResponse.json(await query);
  } catch (error) {
    console.error('Fetch payments error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

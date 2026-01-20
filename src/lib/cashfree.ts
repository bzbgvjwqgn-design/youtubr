import axios from 'axios';

const CASHFREE_BASE_URL =
  process.env.NEXT_PUBLIC_CASHFREE_MODE === 'PROD'
    ? 'https://api.cashfree.com'
    : 'https://sandbox.cashfree.com';

interface CreateOrderParams {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  orderNote?: string;
  returnUrl: string;
}

interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
}

export const cashfreeClient = {
  async createOrder(params: CreateOrderParams) {
    try {
      const response = await axios.post(
        `${CASHFREE_BASE_URL}/pg/orders`,
        {
          order_id: params.orderId,
          order_amount: params.amount,
          order_currency: 'INR',
          customer_details: {
            customer_name: params.customerName,
            customer_email: params.customerEmail || 'noemail@example.com',
            customer_phone: params.customerPhone,
          },
          order_meta: {
            return_url: params.returnUrl,
          },
          order_note: params.orderNote,
        },
        {
          headers: {
            'X-Client-Id': process.env.NEXT_PUBLIC_CASHFREE_KEY_ID,
            'X-Client-Secret': process.env.CASHFREE_SECRET_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Cashfree order creation error:', error);
      throw error;
    }
  },

  async verifyPayment(params: VerifyPaymentParams) {
    try {
      const response = await axios.get(
        `${CASHFREE_BASE_URL}/pg/orders/${params.orderId}/payments/${params.paymentId}`,
        {
          headers: {
            'X-Client-Id': process.env.NEXT_PUBLIC_CASHFREE_KEY_ID,
            'X-Client-Secret': process.env.CASHFREE_SECRET_KEY,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Cashfree payment verification error:', error);
      throw error;
    }
  },

  async createSubscription(params: {
    orderId: string;
    subscriptionId: string;
    amount: number;
    intervalType: 'MONTHLY' | 'YEARLY';
    intervalCount: number;
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    returnUrl: string;
  }) {
    try {
      const response = await axios.post(
        `${CASHFREE_BASE_URL}/pg/subscriptions`,
        {
          subscription_id: params.subscriptionId,
          plan_id: `plan_monthly_${params.amount}`,
          customer_details: {
            customer_name: params.customerName,
            customer_email: params.customerEmail || 'noemail@example.com',
            customer_phone: params.customerPhone,
          },
          subscription_details: {
            interval_type: params.intervalType,
            interval_count: params.intervalCount,
            total_count: 0,
          },
          order_meta: {
            return_url: params.returnUrl,
          },
        },
        {
          headers: {
            'X-Client-Id': process.env.NEXT_PUBLIC_CASHFREE_KEY_ID,
            'X-Client-Secret': process.env.CASHFREE_SECRET_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Cashfree subscription creation error:', error);
      throw error;
    }
  },

  async cancelSubscription(subscriptionId: string) {
    try {
      const response = await axios.post(
        `${CASHFREE_BASE_URL}/pg/subscriptions/${subscriptionId}/cancel`,
        {},
        {
          headers: {
            'X-Client-Id': process.env.NEXT_PUBLIC_CASHFREE_KEY_ID,
            'X-Client-Secret': process.env.CASHFREE_SECRET_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Cashfree subscription cancellation error:', error);
      throw error;
    }
  },
};

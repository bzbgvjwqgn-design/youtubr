'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function SupportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const creatorId = searchParams.get('creatorId');
  const tierId = searchParams.get('tierId');

  const [creator, setCreator] = useState<any>(null);
  const [tier, setTier] = useState<any>(null);
  const [name, setName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!creatorId) return;
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/creators?creatorId=${creatorId}`)
      .then((r) => r.json())
      .then(setCreator)
      .catch(() => setCreator(null));
  }, [creatorId]);

  useEffect(() => {
    if (!creatorId) return;
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tiers?creatorId=${creatorId}`)
      .then((r) => r.json())
      .then((tiers) => {
        if (!tierId) return setTier(tiers[0]);
        const found = tiers.find((t: any) => String(t.id) === String(tierId));
        setTier(found || tiers[0]);
      })
      .catch(() => setTier(null));
  }, [creatorId, tierId]);

  const handlePay = async () => {
    setError(null);
    if (!creatorId || !tier) return setError('Missing creator or tier');
    if (!isAnonymous && name.trim() === '') return setError('Please enter your name or choose anonymous');
    if (!phone.match(/^[0-9]{10}$/)) return setError('Enter a valid 10-digit Indian phone');

    setLoading(true);
    try {
      const payload = {
        creatorId: Number(creatorId),
        tierId: tier.id,
        supporterName: isAnonymous ? 'Anonymous' : name,
        isAnonymous,
        email: email || undefined,
        phone,
      };

      const res = await fetch('/api/tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create payment');

      // redirect to Cashfree payment link
      if (data.paymentLink) {
        window.location.href = data.paymentLink;
      } else if (data.orderId) {
        // fallback: open cashfree hosted page
        window.location.href = `${process.env.NEXT_PUBLIC_APP_URL}/payment/checkout?orderId=${data.orderId}`;
      } else {
        throw new Error('No payment link returned');
      }
    } catch (err: any) {
      setError(err.message || 'Payment error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-700">
              {creator?.user?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{creator?.user?.name || 'Creator'}</p>
              <p className="text-sm text-gray-500">{creator?.youtubeChannelName}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600">Supporting</p>
            <div className="mt-2 bg-gray-50 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{tier ? tier.title : 'Tier'}</p>
                <p className="text-sm text-gray-500">{tier ? (tier.type === 'monthly' ? 'Monthly' : 'One-time') : ''}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-500">₹{tier ? parseFloat(tier.amount).toLocaleString() : '--'}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <Input label="Your name" value={name} onChange={(e: any) => setName(e.target.value)} placeholder="How should we show your name?" />

            <div className="flex items-center gap-3">
              <input id="anon" type="checkbox" className="w-5 h-5 rounded-md" checked={isAnonymous} onChange={() => setIsAnonymous((s) => !s)} />
              <label htmlFor="anon" className="text-sm text-gray-700">Show as Anonymous</label>
            </div>

            <Input label="Phone (10-digit)" value={phone} onChange={(e: any) => setPhone(e.target.value)} placeholder="9876543210" />
            <Input label="Email (optional)" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="name@example.com" />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="mt-2">
              <Button variant="primary" size="lg" className="w-full" onClick={handlePay} isLoading={loading}>
                Pay ₹{tier ? parseFloat(tier.amount).toLocaleString() : '--'}
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-2">By paying you agree to the creator's public supporters list. Payments via Cashfree.</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button className="text-sm text-gray-500" onClick={() => router.back()}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

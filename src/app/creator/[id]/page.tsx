import React from 'react';
import { CreatorCard } from '@/components/CreatorCard';
import { SupportTierCard } from '@/components/SupportTierCard';
import { Button } from '@/components/Button';

export const dynamic = 'force-dynamic';

async function fetchCreator(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/creators?creatorId=${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch creator');
  return res.json();
}

async function fetchSupporters(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/supporters?creatorId=${id}`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function CreatorPage({ params }: { params: { id: string } }) {
  const creator = await fetchCreator(params.id);
  const supporters = await fetchSupporters(params.id);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="rounded-2xl shadow-md overflow-hidden">
            <div className="h-40 w-full" style={{ background: creator.accentColor || '#FF0000' }} />
            <div className="p-4 -mt-10 relative">
              <img
                src={creator.user.profile_image || '/default-avatar.png'}
                alt={creator.user.name}
                className="w-20 h-20 rounded-full border-4 border-white shadow-md"
              />
              <h2 className="text-xl font-bold mt-3">{creator.user.name}</h2>
              <p className="text-sm text-gray-600">{creator.youtubeChannelName}</p>
              {creator.bio && <p className="text-sm text-gray-700 mt-2">{creator.bio}</p>}
            </div>
          </div>
        </div>

        <section className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Support Tiers</h3>
          <div className="space-y-3">
            {creator.supportTiers?.map((tier: any) => (
              <SupportTierCard
                key={tier.id}
                id={tier.id}
                title={tier.title}
                amount={parseFloat(tier.amount)}
                type={tier.type}
                description={tier.description}
                onSelect={(tierId) => {
                  // navigate to support flow
                  window.location.href = `/support?creatorId=${creator.id}&tierId=${tierId}`;
                }}
              />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">Supporters</h3>
          <div className="space-y-2">
            {supporters.map((s: any) => (
              <div key={s.id} className="bg-white rounded-2xl shadow-sm p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{s.isAnonymous ? 'Anonymous' : s.supporterName}</p>
                  <p className="text-xs text-gray-500">{s.type === 'monthly' ? 'Monthly' : 'One-time'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-500">₹{parseFloat(s.amount).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{new Date(s.lastSupportedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

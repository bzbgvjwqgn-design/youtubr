'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function CreatorSignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [channelName, setChannelName] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);
    if (!name.trim() || !phone.trim() || !channelName.trim() || !channelUrl.trim()) {
      return setError('All fields required');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          youtubeChannelName: channelName,
          youtubeChannelUrl: channelUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Signup failed');

      alert('Account created! You can now create support tiers.');
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Join as Creator</h1>
        <p className="text-gray-600 mb-6">Set up your profile and start accepting support from fans</p>

        <div className="space-y-3">
          <Input label="Full Name" value={name} onChange={(e: any) => setName(e.target.value)} placeholder="Your name" />
          <Input label="Phone" value={phone} onChange={(e: any) => setPhone(e.target.value)} placeholder="10-digit number" />
          <Input label="Email (optional)" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="your@email.com" />
          <Input label="YouTube Channel Name" value={channelName} onChange={(e: any) => setChannelName(e.target.value)} placeholder="e.g. Tech Talks India" />
          <Input label="Channel URL" value={channelUrl} onChange={(e: any) => setChannelUrl(e.target.value)} placeholder="https://youtube.com/@..." />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button variant="primary" size="lg" className="w-full" onClick={handleSignup} isLoading={loading}>
            Create Account
          </Button>
        </div>
      </div>
    </div>
  );
}

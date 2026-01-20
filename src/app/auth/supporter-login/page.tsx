'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';

export default function SupporterLoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Support Creators</h1>
        <p className="text-gray-600 mb-8">Find and support your favorite Indian YouTubers. No account needed!</p>

        <div className="space-y-3">
          <Button variant="primary" size="lg" className="w-full" onClick={() => router.push('/')}>
            Explore Creators
          </Button>
          <p className="text-sm text-gray-500 mt-4">You can support creators directly without creating an account.</p>
        </div>
      </div>
    </div>
  );
}

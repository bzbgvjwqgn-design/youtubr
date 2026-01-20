import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-500">Youtubr</h1>
          <nav className="flex gap-2">
            <Link href="/auth/creator-signup">
              <Button variant="secondary" size="sm">
                Creator
              </Button>
            </Link>
            <Link href="/auth/supporter-login">
              <Button variant="primary" size="sm">
                Support
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Support Your Favorite Indian Creators
          </h2>
          <p className="text-lg text-gray-600">
            Give monthly or one-time support directly to YouTube creators you love. 100% transparent.
          </p>
        </div>

        <div className="space-y-4 mb-12">
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="text-2xl mb-2">🎬</div>
            <h3 className="font-bold text-gray-900 mb-1">For Creators</h3>
            <p className="text-sm text-gray-600">Set up your profile, create support tiers, and earn directly</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="text-2xl mb-2">❤️</div>
            <h3 className="font-bold text-gray-900 mb-1">For Supporters</h3>
            <p className="text-sm text-gray-600">Support creators via UPI, cards, or net banking. Your name is public</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="text-2xl mb-2">🇮🇳</div>
            <h3 className="font-bold text-gray-900 mb-1">India-First</h3>
            <p className="text-sm text-gray-600">Built for Indian creators. Payments via Cashfree</p>
          </div>
        </div>

        <div className="space-y-3">
          <Link href="/auth/creator-signup" className="block">
            <Button variant="primary" size="lg" className="w-full">
              Join as Creator
            </Button>
          </Link>
          <p className="text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/explore" className="text-red-500 font-semibold">
              explore creators
            </Link>
          </p>
        </div>
      </section>

      <footer className="border-t border-gray-100 mt-20 py-8">
        <div className="max-w-md mx-auto px-4 text-center text-sm text-gray-600">
          <p>&copy; 2026 Youtubr. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

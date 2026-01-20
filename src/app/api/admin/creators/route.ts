import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { creatorProfiles, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET: list all creators (with user)
// POST: { creatorId, action: 'approve' | 'suspend' }
export async function GET(req: NextRequest) {
  try {
    const creators = await db.query.creatorProfiles.findMany({
      with: { user: true },
      orderBy: (cp, { desc }) => [desc(cp.createdAt)],
    });
    return NextResponse.json(creators);
  } catch (error) {
    console.error('Admin fetch creators error:', error);
    return NextResponse.json({ error: 'Failed to fetch creators' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { creatorId, action } = body;
    if (!creatorId || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const profile = await db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.id, creatorId) });
    if (!profile) return NextResponse.json({ error: 'Creator not found' }, { status: 404 });

    const userId = profile.userId;

    if (action === 'approve') {
      await db.update(users).set({ isVerified: true }).where(eq(users.id, userId));
      return NextResponse.json({ message: 'Creator approved' });
    }

    if (action === 'suspend') {
      await db.update(users).set({ isBanned: true }).where(eq(users.id, userId));
      return NextResponse.json({ message: 'Creator suspended' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Admin update creator error:', error);
    return NextResponse.json({ error: 'Failed to update creator' }, { status: 500 });
  }
}

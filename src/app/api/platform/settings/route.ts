import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { platformSettings } from '@/db/schema';

// GET: fetch settings
// POST: update settings (admin only - auth not implemented in MVP)
export async function GET() {
  try {
    const settings = await db.query.platformSettings.findFirst();
    return NextResponse.json(settings || {});
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const existing = await db.query.platformSettings.findFirst();
    if (!existing) {
      const [created] = await db.insert(platformSettings).values(body).returning();
      return NextResponse.json(created, { status: 201 });
    }
    await db.update(platformSettings).set(body).where(() => true as any);
    const updated = await db.query.platformSettings.findFirst();
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

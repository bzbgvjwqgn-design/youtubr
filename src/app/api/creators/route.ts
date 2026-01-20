import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, creatorProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { creatorProfileSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = creatorProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, phone, email, youtubeChannelName, youtubeChannelUrl, bio, subscriberCount } =
      validation.data;

    // Check if user exists
    let user = await db.query.users.findFirst({
      where: eq(users.phone, phone),
    });

    if (!user) {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          name,
          phone,
          email,
          role: 'creator',
          authProvider: 'phone',
          isVerified: false,
        })
        .returning();
      user = newUser;
    }

    // Check if creator profile exists
    const existingProfile = await db.query.creatorProfiles.findFirst({
      where: eq(creatorProfiles.userId, user.id),
    });

    if (existingProfile) {
      return NextResponse.json({ error: 'Creator profile already exists' }, { status: 400 });
    }

    // Create creator profile
    const [creatorProfile] = await db
      .insert(creatorProfiles)
      .values({
        userId: user.id,
        youtubeChannelName,
        youtubeChannelUrl,
        bio,
        subscriberCount,
      })
      .returning();

    return NextResponse.json(
      {
        message: 'Creator profile created successfully',
        creator: creatorProfile,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Creator signup error:', error);
    return NextResponse.json({ error: 'Failed to create creator profile' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const creatorId = req.nextUrl.searchParams.get('creatorId');

    if (!creatorId) {
      return NextResponse.json({ error: 'Creator ID required' }, { status: 400 });
    }

    const creator = await db.query.creatorProfiles.findFirst({
      where: eq(creatorProfiles.id, parseInt(creatorId)),
      with: {
        user: true,
        supportTiers: {
          where: (tier) => eq(tier.isActive, true),
        },
      },
    });

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    return NextResponse.json(creator);
  } catch (error) {
    console.error('Fetch creator error:', error);
    return NextResponse.json({ error: 'Failed to fetch creator' }, { status: 500 });
  }
}

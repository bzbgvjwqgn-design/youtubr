import { z } from 'zod';

export const createCreatorSchema = z.object({
  youtubeChannelName: z.string().min(1, 'Channel name required'),
  youtubeChannelUrl: z.string().url('Valid URL required'),
  subscriberCount: z.number().int().optional(),
  bio: z.string().max(500).optional(),
});

export const createSupportTierSchema = z.object({
  type: z.enum(['monthly', 'one_time']),
  amount: z.number().min(10, 'Minimum ₹10 required'),
  title: z.string().min(1, 'Title required').max(100),
  description: z.string().max(500).optional(),
});

export const createPaymentSchema = z.object({
  tierId: z.number(),
  supporterName: z.string().min(1).max(255),
  isAnonymous: z.boolean(),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(15),
});

export const phoneSchema = z.string().regex(/^[0-9]{10}$/, 'Valid Indian phone required');

export const emailSchema = z.string().email('Valid email required');

export const creatorProfileSchema = z.object({
  name: z.string().min(1, 'Name required'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Valid phone required'),
  email: z.string().email().optional(),
  youtubeChannelName: z.string().min(1, 'Channel name required'),
  youtubeChannelUrl: z.string().url('Valid URL required'),
  bio: z.string().max(500).optional(),
  subscriberCount: z.number().int().optional(),
});

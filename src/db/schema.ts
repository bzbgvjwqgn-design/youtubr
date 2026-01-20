import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  boolean,
  decimal,
  varchar,
  enum as pgEnum,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['creator', 'supporter', 'admin']);
export const authProviderEnum = pgEnum('auth_provider', ['google', 'email', 'phone']);
export const supportTypeEnum = pgEnum('support_type', ['monthly', 'one_time']);
export const paymentGatewayEnum = pgEnum('payment_gateway', ['cashfree']);
export const paymentStatusEnum = pgEnum('payment_status', ['success', 'failed', 'pending']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'cancelled', 'paused']);
export const payoutStatusEnum = pgEnum('payout_status', ['pending', 'paid']);

// Users Table
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    role: userRoleEnum('role').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 15 }),
    authProvider: authProviderEnum('auth_provider').notNull(),
    profileImage: text('profile_image'),
    isVerified: boolean('is_verified').default(false),
    isBanned: boolean('is_banned').default(false),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    phoneIdx: index('users_phone_idx').on(table.phone),
  })
);

// Creator Profiles Table
export const creatorProfiles = pgTable(
  'creator_profiles',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull(),
    youtubeChannelName: varchar('youtube_channel_name', { length: 255 }).notNull(),
    youtubeChannelUrl: text('youtube_channel_url'),
    subscriberCount: integer('subscriber_count'),
    bio: text('bio'),
    coverImage: text('cover_image'),
    accentColor: varchar('accent_color', { length: 7 }).default('#FF0000'),
    monthlyGoal: decimal('monthly_goal', { precision: 10, scale: 2 }),
    showSupporters: boolean('show_supporters').default(true),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    userIdFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
    userIdIdx: index('creator_profiles_user_id_idx').on(table.userId),
  })
);

// Support Tiers Table
export const supportTiers = pgTable(
  'support_tiers',
  {
    id: serial('id').primaryKey(),
    creatorId: integer('creator_id').notNull(),
    type: supportTypeEnum('type').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    creatorIdFk: foreignKey({
      columns: [table.creatorId],
      foreignColumns: [creatorProfiles.id],
    }),
    creatorIdIdx: index('support_tiers_creator_id_idx').on(table.creatorId),
  })
);

// Payments Table
export const payments = pgTable(
  'payments',
  {
    id: serial('id').primaryKey(),
    creatorId: integer('creator_id').notNull(),
    supporterId: integer('supporter_id'),
    tierId: integer('tier_id').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    type: supportTypeEnum('type').notNull(),
    paymentGateway: paymentGatewayEnum('payment_gateway').notNull(),
    paymentId: varchar('payment_id', { length: 255 }).notNull(),
    status: paymentStatusEnum('status').notNull(),
    supporterName: varchar('supporter_name', { length: 255 }),
    isAnonymous: boolean('is_anonymous').default(false),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    creatorIdFk: foreignKey({
      columns: [table.creatorId],
      foreignColumns: [creatorProfiles.id],
    }),
    supporterIdFk: foreignKey({
      columns: [table.supporterId],
      foreignColumns: [users.id],
    }),
    tierId: foreignKey({
      columns: [table.tierId],
      foreignColumns: [supportTiers.id],
    }),
    creatorIdIdx: index('payments_creator_id_idx').on(table.creatorId),
    supporterIdIdx: index('payments_supporter_id_idx').on(table.supporterId),
    paymentIdIdx: index('payments_payment_id_idx').on(table.paymentId),
  })
);

// Subscriptions Table
export const subscriptions = pgTable(
  'subscriptions',
  {
    id: serial('id').primaryKey(),
    paymentId: integer('payment_id').notNull(),
    creatorId: integer('creator_id').notNull(),
    supporterId: integer('supporter_id').notNull(),
    tierId: integer('tier_id').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    gatewaySubscriptionId: varchar('gateway_subscription_id', { length: 255 }).notNull(),
    status: subscriptionStatusEnum('status').notNull(),
    startDate: timestamp('start_date'),
    nextBillingDate: timestamp('next_billing_date'),
    cancelledAt: timestamp('cancelled_at'),
  },
  (table) => ({
    paymentIdFk: foreignKey({
      columns: [table.paymentId],
      foreignColumns: [payments.id],
    }),
    creatorIdFk: foreignKey({
      columns: [table.creatorId],
      foreignColumns: [creatorProfiles.id],
    }),
    supporterIdFk: foreignKey({
      columns: [table.supporterId],
      foreignColumns: [users.id],
    }),
    tierId: foreignKey({
      columns: [table.tierId],
      foreignColumns: [supportTiers.id],
    }),
    creatorIdIdx: index('subscriptions_creator_id_idx').on(table.creatorId),
    supporterIdIdx: index('subscriptions_supporter_id_idx').on(table.supporterId),
    gatewaySubIdIdx: index('subscriptions_gateway_subscription_id_idx').on(table.gatewaySubscriptionId),
  })
);

// Supporters Public Table
export const supportersPublic = pgTable(
  'supporters_public',
  {
    id: serial('id').primaryKey(),
    creatorId: integer('creator_id').notNull(),
    supporterName: varchar('supporter_name', { length: 255 }).notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    type: supportTypeEnum('type').notNull(),
    isAnonymous: boolean('is_anonymous').default(false),
    lastSupportedAt: timestamp('last_supported_at').defaultNow(),
  },
  (table) => ({
    creatorIdFk: foreignKey({
      columns: [table.creatorId],
      foreignColumns: [creatorProfiles.id],
    }),
    creatorIdIdx: index('supporters_public_creator_id_idx').on(table.creatorId),
  })
);

// Platform Settings Table
export const platformSettings = pgTable('platform_settings', {
  id: serial('id').primaryKey(),
  platformFeePercent: decimal('platform_fee_percent', { precision: 5, scale: 2 }).default('2.5'),
  payoutCycleDays: integer('payout_cycle_days').default(7),
  minPayoutAmount: decimal('min_payout_amount', { precision: 10, scale: 2 }).default('1000'),
  maintenanceMode: boolean('maintenance_mode').default(false),
});

// Creator Payouts Table
export const creatorPayouts = pgTable(
  'creator_payouts',
  {
    id: serial('id').primaryKey(),
    creatorId: integer('creator_id').notNull(),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
    platformFee: decimal('platform_fee', { precision: 10, scale: 2 }).notNull(),
    payoutAmount: decimal('payout_amount', { precision: 10, scale: 2 }).notNull(),
    status: payoutStatusEnum('status').notNull(),
    payoutReference: varchar('payout_reference', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    creatorIdFk: foreignKey({
      columns: [table.creatorId],
      foreignColumns: [creatorProfiles.id],
    }),
    creatorIdIdx: index('creator_payouts_creator_id_idx').on(table.creatorId),
    statusIdx: index('creator_payouts_status_idx').on(table.status),
  })
);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  creatorProfile: one(creatorProfiles, {
    fields: [users.id],
    references: [creatorProfiles.userId],
  }),
  paymentsAsSupporter: many(payments),
  subscriptions: many(subscriptions),
}));

export const creatorProfilesRelations = relations(creatorProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [creatorProfiles.userId],
    references: [users.id],
  }),
  supportTiers: many(supportTiers),
  payments: many(payments),
  subscriptions: many(subscriptions),
  supportersPublic: many(supportersPublic),
  payouts: many(creatorPayouts),
}));

export const supportTiersRelations = relations(supportTiers, ({ one, many }) => ({
  creator: one(creatorProfiles, {
    fields: [supportTiers.creatorId],
    references: [creatorProfiles.id],
  }),
  payments: many(payments),
  subscriptions: many(subscriptions),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  creator: one(creatorProfiles, {
    fields: [payments.creatorId],
    references: [creatorProfiles.id],
  }),
  supporter: one(users, {
    fields: [payments.supporterId],
    references: [users.id],
  }),
  tier: one(supportTiers, {
    fields: [payments.tierId],
    references: [supportTiers.id],
  }),
  subscription: one(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  payment: one(payments, {
    fields: [subscriptions.paymentId],
    references: [payments.id],
  }),
  creator: one(creatorProfiles, {
    fields: [subscriptions.creatorId],
    references: [creatorProfiles.id],
  }),
  supporter: one(users, {
    fields: [subscriptions.supporterId],
    references: [users.id],
  }),
  tier: one(supportTiers, {
    fields: [subscriptions.tierId],
    references: [supportTiers.id],
  }),
}));

export const supportersPublicRelations = relations(supportersPublic, ({ one }) => ({
  creator: one(creatorProfiles, {
    fields: [supportersPublic.creatorId],
    references: [creatorProfiles.id],
  }),
}));

export const creatorPayoutsRelations = relations(creatorPayouts, ({ one }) => ({
  creator: one(creatorProfiles, {
    fields: [creatorPayouts.creatorId],
    references: [creatorProfiles.id],
  }),
}));

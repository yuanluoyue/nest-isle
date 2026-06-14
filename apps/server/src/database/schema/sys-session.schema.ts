import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const sysSession = pgTable('sys_session', {
  id: uuid('id').defaultRandom().primaryKey(),

  sid: varchar('sid', {
    length: 64,
  }).notNull().unique(),

  userId: uuid('user_id').notNull(),

  userType: varchar('user_type', {
    length: 20,
  }).notNull(),

  ip: varchar('ip', {
    length: 50,
  }),

  country: varchar('country', {
    length: 100,
  }),

  city: varchar('city', {
    length: 100,
  }),

  userAgent: text('user_agent'),

  browser: varchar('browser', {
    length: 50,
  }),

  os: varchar('os', {
    length: 50,
  }),

  device: varchar('device', {
    length: 50,
  }),

  platform: varchar('platform', {
    length: 20,
  }),

  loginAt: timestamp('login_at').defaultNow().notNull(),

  lastActiveAt: timestamp('last_active_at').defaultNow().notNull(),

  logoutAt: timestamp('logout_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

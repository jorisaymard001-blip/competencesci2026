import { pgTable, serial, text, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const pushSubscriptionsTable = pgTable(
  "push_subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    endpointUnique: uniqueIndex("push_subscriptions_endpoint_unique").on(t.endpoint),
  }),
);

export type PushSubscriptionRow = typeof pushSubscriptionsTable.$inferSelect;

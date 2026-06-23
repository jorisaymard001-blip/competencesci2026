import { pgTable, serial, text, integer, pgEnum, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const competitionStatusEnum = pgEnum("competition_status", ["open", "closed", "upcoming"]);

export const competitionsTable = pgTable("competitions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  ministry: text("ministry").notNull(),
  city: text("city").notNull(),
  diploma: text("diploma").notNull(),
  status: competitionStatusEnum("status").notNull(),
  openDate: date("open_date"),
  closeDate: date("close_date"),
  positions: integer("positions").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").array().notNull().default([]),
  process: text("process").array().notNull().default([]),
  contact: text("contact"),
  website: text("website"),
  imageUrl: text("image_url"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCompetitionSchema = createInsertSchema(competitionsTable).omit({ id: true });
export type InsertCompetition = z.infer<typeof insertCompetitionSchema>;
export type Competition = typeof competitionsTable.$inferSelect;

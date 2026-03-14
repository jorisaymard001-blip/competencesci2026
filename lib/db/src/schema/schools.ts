import { pgTable, serial, text, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const schoolTypeEnum = pgEnum("school_type", ["public", "private"]);

export const schoolsTable = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: schoolTypeEnum("type").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  website: text("website"),
  email: text("email"),
  description: text("description").notNull(),
  diplomas: text("diplomas").array().notNull().default([]),
  domains: text("domains").array().notNull().default([]),
  accreditation: text("accreditation"),
  founded: integer("founded"),
});

export const insertSchoolSchema = createInsertSchema(schoolsTable).omit({ id: true });
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type School = typeof schoolsTable.$inferSelect;

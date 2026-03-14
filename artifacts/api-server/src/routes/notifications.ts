import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable, insertNotificationSchema } from "@workspace/db/schema";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const rows = await db
    .select()
    .from(notificationsTable)
    .orderBy(desc(notificationsTable.createdAt));
  res.json(rows);
});

router.post("/", async (req, res) => {
  const parsed = insertNotificationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Données invalides." });
  }
  const [notification] = await db
    .insert(notificationsTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(notification);
});

export default router;

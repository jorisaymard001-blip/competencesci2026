import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { competitionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/competitions", async (req, res) => {
  const { city, diploma, status } = req.query as Record<string, string>;

  let result = await db.select().from(competitionsTable);

  if (city) result = result.filter(c => c.city === city);
  if (diploma) result = result.filter(c => c.diploma === diploma);
  if (status && ["open", "closed", "upcoming"].includes(status)) {
    result = result.filter(c => c.status === status);
  }

  res.json(result);
});

router.get("/competitions/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid ID" });
    return;
  }

  const [comp] = await db.select().from(competitionsTable).where(eq(competitionsTable.id, id));
  if (!comp) {
    res.status(404).json({ message: "Concours introuvable" });
    return;
  }

  res.json(comp);
});

export default router;

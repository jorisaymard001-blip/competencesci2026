import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { schoolsTable } from "@workspace/db/schema";
import { eq, or, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/schools", async (req, res) => {
  const { city, type, diploma } = req.query as Record<string, string>;

  let query = db.select().from(schoolsTable);

  const conditions = [];
  if (city) conditions.push(eq(schoolsTable.city, city));
  if (type && (type === "public" || type === "private")) {
    conditions.push(eq(schoolsTable.type, type as "public" | "private"));
  }
  if (diploma) {
    conditions.push(sql`${diploma} = ANY(${schoolsTable.diplomas})`);
  }

  const schools = conditions.length
    ? await db.select().from(schoolsTable).where(conditions.length === 1 ? conditions[0] : or(...conditions))
    : await db.select().from(schoolsTable);

  // Apply all filters (since drizzle or() doesn't do AND, let's filter in JS for combined filters)
  let result = schools;
  if (city) result = result.filter(s => s.city === city);
  if (type && (type === "public" || type === "private")) {
    result = result.filter(s => s.type === type);
  }
  if (diploma) result = result.filter(s => s.diplomas.includes(diploma));

  res.json(result);
});

router.get("/schools/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid ID" });
    return;
  }

  const [school] = await db.select().from(schoolsTable).where(eq(schoolsTable.id, id));
  if (!school) {
    res.status(404).json({ message: "École introuvable" });
    return;
  }

  res.json(school);
});

router.get("/cities", async (_req, res) => {
  const rows = await db.selectDistinct({ city: schoolsTable.city }).from(schoolsTable).orderBy(schoolsTable.city);
  const cities = rows.map(r => r.city);
  res.json(cities);
});

router.get("/diplomas", async (_req, res) => {
  const rows = await db.select({ diplomas: schoolsTable.diplomas }).from(schoolsTable);
  const all = rows.flatMap(r => r.diplomas);
  const unique = [...new Set(all)].sort();
  res.json(unique);
});

export default router;

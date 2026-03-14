import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "competences-ci-salt").digest("hex");
}

router.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Nom, email et mot de passe sont requis" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Le mot de passe doit faire au moins 6 caractères" });
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim()));
  if (existing.length > 0) {
    return res.status(409).json({ message: "Un compte avec cet email existe déjà" });
  }

  const [user] = await db.insert(usersTable).values({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: hashPassword(password),
  }).returning({ id: usersTable.id, name: usersTable.name, email: usersTable.email });

  res.status(201).json({ user });
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim()));
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ message: "Email ou mot de passe incorrect" });
  }

  res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

export default router;

import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { messagesTable } from "@workspace/db/schema";

const router: IRouter = Router();

router.post("/messages", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  const [saved] = await db.insert(messagesTable).values({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    subject: subject.trim(),
    message: message.trim(),
  }).returning({ id: messagesTable.id });

  res.status(201).json({ id: saved.id, message: "Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais." });
});

export default router;

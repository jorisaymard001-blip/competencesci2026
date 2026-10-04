import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { messagesTable } from "@workspace/db/schema";
import nodemailer from "nodemailer";

const router: IRouter = Router();

const GMAIL_USER = process.env.GMAIL_USER ?? "competencesci2004@gmail.com";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

function createTransporter() {
  if (!GMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
}

router.post("/messages", async (req, res): Promise<void> => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400).json({ message: "Tous les champs sont requis" });
    return;
  }

  // Save to DB
  const [saved] = await db.insert(messagesTable).values({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    subject: subject.trim(),
    message: message.trim(),
  }).returning({ id: messagesTable.id });

  // Send email notification
  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Compétences CI" <${GMAIL_USER}>`,
        to: GMAIL_USER,
        replyTo: email,
        subject: `[Compétences CI] ${subject} — ${name}`,
        html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .card { background: white; border-radius: 12px; max-width: 560px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #F77F00, #E06500); padding: 28px 32px; }
    .header h1 { color: white; margin: 0; font-size: 20px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px; }
    .body { padding: 28px 32px; }
    .field { margin-bottom: 18px; }
    .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #888; margin-bottom: 4px; }
    .value { font-size: 15px; color: #1a1a1a; line-height: 1.5; }
    .message-box { background: #f9f9f9; border-left: 3px solid #F77F00; border-radius: 4px; padding: 14px 16px; }
    .footer { border-top: 1px solid #f0f0f0; padding: 16px 32px; font-size: 12px; color: #aaa; text-align: center; }
    .flag { font-size: 16px; margin-right: 4px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🎓 Nouveau message reçu</h1>
      <p>Via le formulaire de contact de Compétences CI</p>
    </div>
    <div class="body">
      <div class="field">
        <div class="label">Nom</div>
        <div class="value">${name.trim()}</div>
      </div>
      <div class="field">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:${email}" style="color:#F77F00;">${email}</a></div>
      </div>
      <div class="field">
        <div class="label">Sujet</div>
        <div class="value">${subject.trim()}</div>
      </div>
      <div class="field">
        <div class="label">Message</div>
        <div class="value message-box">${message.trim().replace(/\n/g, "<br>")}</div>
      </div>
    </div>
    <div class="footer">
      <span class="flag">🇨🇮</span>Compétences CI — L'orientation en Côte d'Ivoire<br>
      Répondre directement à cet email pour contacter l'utilisateur.
    </div>
  </div>
</body>
</html>
        `.trim(),
        text: `Nouveau message de ${name} (${email})\n\nSujet : ${subject}\n\n${message}`,
      });
    } catch (err) {
      console.error("[messages] Email send error:", err);
    }
  } else {
    console.warn("[messages] GMAIL_APP_PASSWORD not set — email not sent");
  }

  res.status(201).json({ id: saved.id, message: "Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais." });
});

export default router;

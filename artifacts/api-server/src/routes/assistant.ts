import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { AskAssistantBody, AskAssistantResponse } from "@workspace/api-zod";
import type { AssistantQuestionInput } from "@workspace/api-zod";

const router = Router();
const recentRequests = new Map<string, number[]>();

type AssistantContext = NonNullable<AssistantQuestionInput["context"]>;

function localAnswer(question: string, context: AssistantContext = {}) {
  const q = question.toLowerCase();
  if (q.includes("concours") || q.includes("fonction publique")) {
    const open = (context.concours ?? []).filter(item => item.statut === "open").slice(0, 3);
    if (open.length) return `🏆 Concours ouverts trouvés : ${open.map(item => item.nom).filter(Boolean).join(", ")}. Consulte chaque fiche pour vérifier les conditions et la date limite officielle.`;
    return "🏆 Consulte la rubrique Concours pour voir les concours ouverts, leurs niveaux requis et leurs dates limites. Vérifie toujours l’avis officiel avant de déposer ton dossier.";
  }
  if (q.includes("budget") || q.includes("frais") || q.includes("coût")) return "💰 Les frais disponibles sont indiqués dans les fiches écoles et le comparateur. Les montants peuvent évoluer : confirme-les toujours auprès de l’établissement.";
  const terms = q.split(/[^a-zà-ÿ0-9]+/i).filter(term => term.length > 3);
  const relevant = (context.ecoles ?? []).filter(school => {
    const haystack = `${school.nom ?? ""} ${(school.filieres ?? []).join(" ")}`.toLowerCase();
    return terms.some(term => haystack.includes(term));
  }).slice(0, 3);
  if (relevant.length) return `🎓 Établissements à regarder : ${relevant.map(s => `${s.nom}${s.ville ? ` (${s.ville})` : ""}`).join(", ")}. Consulte leurs fiches pour vérifier les filières et conditions d’admission.`;
  return "🤖 Je peux t’aider à trouver une école, un concours, une formation adaptée ou à estimer ton budget en Côte d’Ivoire. Pose une question plus précise !";
}

router.post("/", async (req, res): Promise<void> => {
  const input = AskAssistantBody.safeParse(req.body);
  if (!input.success) {
    const body = req.body ?? {};
    if (typeof body.question !== "string" || !body.question.trim()) {
      res.status(400).json({ error: "Question manquante" });
      return;
    }
    if (typeof body.question === "string" && body.question.length > 1200) {
      res.status(413).json({ error: "Question trop longue (1 200 caractères maximum)." });
      return;
    }
    res.status(400).json({ error: "Requête invalide." });
    return;
  }
  const { question, context } = input.data;
  if (!question.trim()) {
    res.status(400).json({ error: "Question manquante" });
    return;
  }

  const now = Date.now();
  const ip = req.ip || "unknown";
  const recent = (recentRequests.get(ip) ?? []).filter(timestamp => now - timestamp < 60 * 60 * 1000);
  if (recent.length >= 20) {
    res.status(429).json({ error: "Trop de questions. Réessaie dans quelques minutes." });
    return;
  }
  recent.push(now);
  recentRequests.set(ip, recent);
  if (recentRequests.size > 10_000) {
    for (const [key, timestamps] of recentRequests) {
      const fresh = timestamps.filter(timestamp => now - timestamp < 60 * 60 * 1000);
      if (fresh.length) recentRequests.set(key, fresh);
      else recentRequests.delete(key);
    }
  }

  const safeContext: AssistantContext = {
    ecoles: (context?.ecoles ?? []).slice(0, 20).map(s => ({
      nom: s.nom.slice(0, 120),
      ville: s.ville.slice(0, 80),
      type: s.type.slice(0, 30),
      filieres: s.filieres.slice(0, 12).map(d => d.slice(0, 80)),
      frais: s.frais?.slice(0, 80),
    })),
    concours: (context?.concours ?? []).slice(0, 20).map(c => ({
      nom: c.nom.slice(0, 120),
      ville: c.ville.slice(0, 80),
      statut: c.statut.slice(0, 30),
      ministere: c.ministere.slice(0, 120),
      diplome: c.diplome?.slice(0, 80),
    })),
  };

  if (!process.env.ANTHROPIC_API_KEY) {
    res.json(AskAssistantResponse.parse({ response: localAnswer(question, safeContext), mode: "local" }));
    return;
  }

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `Tu es l’assistant officiel de Compétences CI, application d’orientation pour les étudiants ivoiriens.
Données disponibles : ${JSON.stringify(safeContext)}
Réponds uniquement en français, de façon concise et pratique, en maximum trois courts paragraphes. Recommande uniquement les écoles et concours présents dans les données. Utilise quelques emojis. Si tu ne sais pas, dis-le honnêtement. Ne parle que d’orientation en Côte d’Ivoire.`,
      messages: [{ role: "user", content: question.trim() }],
    });
    const text = message.content.find(block => block.type === "text");
    res.json(AskAssistantResponse.parse({ response: text?.type === "text" ? text.text : localAnswer(question, safeContext), mode: "anthropic" }));
  } catch {
    res.json(AskAssistantResponse.parse({ response: localAnswer(question, safeContext), mode: "local", warning: "Le service IA est momentanément indisponible." }));
  }
});

export default router;
import { Router } from "express";
import { db } from "@workspace/db";
import { competitionsTable, schoolsTable, type Competition, type School } from "@workspace/db/schema";
import { AskAssistantBody, AskAssistantResponse } from "@workspace/api-zod";

const router = Router();
const recentRequests = new Map<string, number[]>();

const SCHOOL_CATEGORIES = [
  { label: "génie civil et BTP", terms: ["genie civil", "btp", "construction", "batiment", "travaux publics"] },
  { label: "informatique et numérique", terms: ["informatique", "numerique", "developpement", "programmation", "reseaux", "cybersecurite"] },
  { label: "santé", terms: ["sante", "medecine", "infirmier", "pharmacie", "sage femme", "biologie medicale"] },
  { label: "droit", terms: ["droit", "juridique", "justice", "avocat"] },
  { label: "commerce et gestion", terms: ["commerce", "gestion", "finance", "comptabilite", "marketing", "economie"] },
  { label: "sciences", terms: ["science", "mathematique", "physique", "chimie", "agronomie"] },
] as const;

const STOP_WORDS = new Set([
  "avec", "dans", "des", "deux", "elle", "est", "etre", "faire", "quelle", "quelles",
  "quel", "quels", "pour", "sont", "sur", "une", "vers", "ville", "ecole", "ecoles",
  "concours", "ouvert", "ouverts", "disponible", "disponibles", "trouver", "cherche",
  "chercher", "comment", "inscription", "inscrire", "apres", "niveau", "bac",
]);

function normalize(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function findRequestedCity(question: string, schools: School[], competitions: Competition[]): string | undefined {
  const normalizedQuestion = normalize(question);
  const cities = new Set([
    ...schools.map(school => school.city),
    ...competitions.map(competition => competition.city),
  ]);
  return [...cities].find(city => normalizedQuestion.includes(normalize(city)));
}

function findSchoolCategory(question: string) {
  const normalizedQuestion = normalize(question);
  return SCHOOL_CATEGORIES.find(category =>
    category.terms.some(term => normalizedQuestion.includes(term)),
  );
}

function schoolScore(school: School, questionTerms: string[], categoryTerms: readonly string[] = []): number {
  const fields = [
    school.name,
    school.city,
    school.description,
    ...school.domains,
    ...school.diplomas,
  ];
  const searchable = normalize(fields.join(" "));
  const domainText = normalize([...school.domains, school.description].join(" "));
  let score = 0;

  if (categoryTerms.some(term => domainText.includes(term))) score += 8;
  for (const term of questionTerms) {
    if (searchable.includes(term)) score += 1;
  }
  return score;
}

function schoolLines(schools: School[], question: string, categoryTerms: readonly string[], city?: string): string[] {
  const questionTerms = normalize(question)
    .split(/[^a-z0-9]+/)
    .filter(term => term.length > 2 && !STOP_WORDS.has(term));

  return schools
    .filter(school => !city || normalize(school.city) === normalize(city))
    .map(school => ({ school, score: schoolScore(school, questionTerms, categoryTerms) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.school.name.localeCompare(b.school.name))
    .slice(0, 4)
    .map(({ school }) => {
      const schoolType = school.type === "public" ? "publique" : "privée";
      const domains = school.domains.length ? ` — domaines : ${school.domains.slice(0, 4).join(", ")}` : "";
      const diplomas = school.diplomas.length ? ` — diplômes : ${school.diplomas.slice(0, 3).join(", ")}` : "";
      const verified = school.isVerified === 1 ? " (établissement vérifié)" : "";
      return `• ${school.name} — ${school.city}, école ${schoolType}${verified}${domains}${diplomas}`;
    });
}

function getCurrentCompetitionStatus(competition: Competition, today = new Date().toISOString().slice(0, 10)): Competition["status"] {
  if (competition.status === "closed") return "closed";
  if (competition.closeDate && competition.closeDate < today) return "closed";
  if (competition.openDate && competition.openDate > today) return "upcoming";
  if (competition.status === "upcoming" && competition.openDate && competition.openDate <= today) {
    return "open";
  }
  return competition.status;
}

function competitionLines(
  competitions: Competition[],
  question: string,
  city?: string,
): { lines: string[]; openCount: number } {
  const normalizedQuestion = normalize(question);
  const wantsClosed = /\b(ferme|fermes|clos|termine|passes|anciens)\b/.test(normalizedQuestion);
  const wantsUpcoming = /\b(a venir|prochain|prochains|prochaine|prochaines)\b/.test(normalizedQuestion);
  const wantsOpen = /\b(ouvert|ouverts|ouverte|ouvertes|inscription|inscrire|postuler)\b/.test(normalizedQuestion);
  const diplomaTerms = ["bts", "licence", "master", "doctorat", "bac", "bepc", "cap"];
  const requestedDiploma = diplomaTerms.find(term => normalizedQuestion.includes(term));
  const today = new Date().toISOString().slice(0, 10);
  const available = competitions.filter(competition => {
    const status = getCurrentCompetitionStatus(competition, today);
    const statusMatches = wantsClosed
      ? status === "closed"
      : wantsUpcoming
        ? status === "upcoming"
        : wantsOpen
          ? status === "open"
          : status === "open" || status === "upcoming";
    const cityMatches = !city || normalize(competition.city) === normalize(city);
    const diplomaMatches = !requestedDiploma || normalize(competition.diploma).includes(requestedDiploma);
    return statusMatches && cityMatches && diplomaMatches;
  });

  const sorted = [...available].sort((a, b) => {
    const statusA = getCurrentCompetitionStatus(a, today);
    const statusB = getCurrentCompetitionStatus(b, today);
    if (statusA !== statusB) return statusA === "open" ? -1 : 1;
    return (a.closeDate ?? "9999").localeCompare(b.closeDate ?? "9999");
  });

  return {
    openCount: competitions.filter(competition => getCurrentCompetitionStatus(competition, today) === "open").length,
    lines: sorted.slice(0, 4).map(competition => {
      const currentStatus = getCurrentCompetitionStatus(competition, today);
      const status = currentStatus === "open" ? "ouvert" : currentStatus === "upcoming" ? "à venir" : "clôturé";
      const closeDate = competition.closeDate ? ` — clôture : ${competition.closeDate}` : "";
      const positions = competition.positions > 0 ? ` — ${competition.positions} poste(s)` : "";
      const website = competition.website ? ` — avis officiel : ${competition.website}` : "";
      return `• ${competition.title} — ${competition.ministry}, ${competition.city} (${status}), diplôme : ${competition.diploma}${closeDate}${positions}${website}`;
    }),
  };
}

function answerFromDatabase(question: string, schools: School[], competitions: Competition[]): string {
  const normalizedQuestion = normalize(question);
  const city = findRequestedCity(question, schools, competitions);
  const category = findSchoolCategory(question);
  const asksForCompetitions = /\b(concours|fonction publique|recrutement|candidature)\b/.test(normalizedQuestion);
  const asksAboutFees = /\b(budget|frais|cout|prix|combien)\b/.test(normalizedQuestion);
  const asksAboutBac = /\bbac\s*[cd]\b/.test(normalizedQuestion);

  if (asksForCompetitions) {
    const { lines } = competitionLines(competitions, question, city);
    if (lines.length) {
      return `Voici les concours correspondants présents dans la base${city ? ` pour ${city}` : ""} :\n${lines.join("\n")}\n\nVérifie les conditions et les dates sur l’avis officiel avant de déposer ton dossier.`;
    }
    return `Je ne trouve pas de concours correspondant dans la base${city ? ` pour ${city}` : ""}. Consulte la rubrique Concours et vérifie les avis publiés par les organismes concernés.`;
  }

  if (asksAboutFees) {
    const lines = schoolLines(schools, question, category?.terms ?? [], city);
    const matches = lines.length ? `\n\nÉtablissements du secteur présents dans la base :\n${lines.join("\n")}` : "";
    return `La base ne contient pas de montants de frais de scolarité fiables. Pour obtenir un budget à jour, contacte directement les établissements et demande les frais d’inscription et de formation.${matches}`;
  }

  const lines = schoolLines(schools, question, category?.terms ?? [], city);
  if (lines.length) {
    const area = category?.label ?? "la formation demandée";
    return `Établissements correspondant à ${area}${city ? ` à ${city}` : ""} dans la base :\n${lines.join("\n")}\n\nConsulte les fiches pour les conditions d’admission et les coordonnées à jour.`;
  }

  if (asksAboutBac) {
    return `Les conditions d’admission par série de bac ne sont pas documentées dans la base. Indique le domaine et la ville qui t’intéressent pour que je recherche les établissements correspondants.`;
  }

  const openCount = competitionLines(competitions, "concours ouverts").openCount;
  return `Je peux rechercher parmi ${schools.length} école(s) et ${competitions.length} concours référencés, dont ${openCount} ouvert(s). Précise une filière, un diplôme, un concours ou une ville pour obtenir des résultats ciblés.`;
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
  const { question } = input.data;
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

  try {
    const [schools, competitions] = await Promise.all([
      db.select().from(schoolsTable),
      db.select().from(competitionsTable),
    ]);
    const response = answerFromDatabase(question.trim(), schools, competitions);
    res.json(AskAssistantResponse.parse({ response }));
  } catch {
    res.status(503).json({ error: "Les données d’orientation sont momentanément indisponibles." });
  }
});

export default router;
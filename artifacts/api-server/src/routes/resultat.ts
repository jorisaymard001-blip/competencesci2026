import { Router } from "express";
import * as cheerio from "cheerio";

const router = Router();

router.post("/verifier-resultat", async (req, res) => {
  const { url, numeroCandidat, nomComplet, dateNaissance } = req.body as {
    url?: string;
    numeroCandidat?: string;
    nomComplet?: string;
    dateNaissance?: string;
  };

  if (!url) {
    res.status(400).json({ statut: "erreur", message: "URL manquante" });
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CompetencesCI/1.0; +https://competencesci.ci)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      res.json({ statut: "erreur", message: `Le site a retourné une erreur (${response.status})` });
      return;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Normalise le texte (supprime accents, met en minuscule)
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const pageText = normalize($("body").text());
    const numNorm = normalize(numeroCandidat ?? "");
    const nomNorm = normalize(nomComplet ?? "");

    // Cherche le candidat dans la page
    const foundByNum = numNorm.length > 3 && pageText.includes(numNorm);
    const foundByNom = nomNorm.length > 3 && pageText.includes(nomNorm);
    const estAdmis = foundByNum || foundByNom;

    // Détecte si la page contient des résultats (pas juste la page d'accueil)
    const motsClesResultats = ["admis", "liste", "resultat", "retenu", "candidat", "merit"];
    const pageContientResultats = motsClesResultats.some(mot => pageText.includes(mot));

    if (estAdmis) {
      // Extrait la ligne contenant le candidat pour plus de détails
      let details = "";
      $("tr, li, p, div").each((_, el): boolean | void => {
        const text = normalize($(el).text());
        if (
          (numNorm.length > 3 && text.includes(numNorm)) ||
          (nomNorm.length > 3 && text.includes(nomNorm))
        ) {
          const raw = $(el).text().replace(/\s+/g, " ").trim();
          if (raw.length < 300) details = raw;
          return false; // arrête la recherche
        }
      });

      res.json({ statut: "admis", message: "Félicitations ! Vous êtes admis(e).", details });
    } else if (pageContientResultats) {
      res.json({ statut: "refuse", message: "Votre nom ne figure pas sur la liste publiée." });
    } else {
      res.json({ statut: "en_attente", message: "Les résultats ne semblent pas encore publiés sur ce site." });
    }
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === "AbortError";
    res.json({
      statut: "erreur",
      message: isTimeout
        ? "Le site officiel met trop de temps à répondre."
        : "Impossible d'accéder au site officiel.",
    });
  }
});

export default router;

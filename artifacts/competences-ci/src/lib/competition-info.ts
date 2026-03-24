export interface CompetitionPracticalInfo {
  documents: string[];
  steps: string[];
  conditions: string[];
}

// Generic competition requirements for Côte d'Ivoire public service competitions
export const genericCompetitionInfo: CompetitionPracticalInfo = {
  documents: [
    "Extrait d'acte de naissance (original ou copie certifiée)",
    "Certificat de nationalité ivoirienne",
    "Bulletin n°3 du casier judiciaire (moins de 3 mois)",
    "Diplômes et relevés de notes (copies certifiées conformes)",
    "4 photos d'identité récentes sur fond blanc",
    "Curriculum Vitae (2 pages maximum)",
    "Certificat médical de visite (délivré par médecin agréé)",
  ],
  steps: [
    "Consulter l'ouverture officielle du concours sur le site du ministère",
    "Retirer le dossier de candidature au secrétariat ou en ligne",
    "Rassembler tous les documents requis (originaux + copies certifiées)",
    "Déposer le dossier complet avant la date de clôture",
    "Se présenter aux épreuves écrites le jour J muni de sa pièce d'identité",
    "Attendre les résultats publiés sur le site officiel du concours",
  ],
  conditions: [
    "Être de nationalité ivoirienne",
    "Jouir de ses droits civiques",
    "Satisfaire aux conditions d'âge fixées par le règlement du concours",
    "Être titulaire du diplôme ou niveau d'études exigé",
    "Être en bonne santé physique et mentale",
  ],
};

// Specific overrides per competition title keyword
const specificInfo: Record<string, Partial<CompetitionPracticalInfo>> = {
  "magistrat": {
    conditions: [
      "Être de nationalité ivoirienne",
      "Être titulaire d'une Maîtrise ou Master en Droit",
      "Avoir moins de 35 ans à la date de clôture",
      "Jouir de ses droits civiques",
      "Bonne moralité attestée par le casier judiciaire",
    ],
  },
  "police": {
    conditions: [
      "Être de nationalité ivoirienne",
      "Avoir entre 18 et 30 ans",
      "Être en bonne santé et de bonne moralité",
      "Taille minimale : 1,65 m pour les hommes, 1,60 m pour les femmes",
      "Être titulaire du BEPC ou niveau équivalent (selon grade)",
    ],
    documents: [
      "Extrait d'acte de naissance",
      "Certificat de nationalité ivoirienne",
      "Casier judiciaire vierge",
      "Diplôme exigé (copie certifiée)",
      "4 photos d'identité",
      "Certificat médical (médecin agréé)",
      "Certificat de visite médicale spécifique police",
      "Attestation de bonne conduite",
    ],
  },
  "douane": {
    conditions: [
      "Être de nationalité ivoirienne",
      "Avoir entre 18 et 30 ans",
      "Taille minimale : 1,65 m (hommes), 1,60 m (femmes)",
      "Être de bonne moralité",
      "Être titulaire du BEPC minimum ou Bac selon le grade",
    ],
  },
  "enseignant": {
    documents: [
      "Extrait d'acte de naissance",
      "Certificat de nationalité ivoirienne",
      "Casier judiciaire vierge",
      "Diplômes d'enseignement (Licence/Master selon niveau)",
      "Relevés de notes officiels",
      "4 photos d'identité",
      "Certificat médical",
    ],
  },
  "trésor": {
    conditions: [
      "Être de nationalité ivoirienne",
      "Être titulaire d'une Licence/Master en Économie, Finance, Comptabilité",
      "Être âgé de moins de 35 ans",
      "Jouir de ses droits civiques",
    ],
  },
};

export function getCompetitionInfo(title: string): CompetitionPracticalInfo {
  const lowerTitle = title.toLowerCase();
  const override = Object.entries(specificInfo).find(([key]) =>
    lowerTitle.includes(key)
  );
  if (!override) return genericCompetitionInfo;
  return {
    documents: override[1].documents ?? genericCompetitionInfo.documents,
    steps: override[1].steps ?? genericCompetitionInfo.steps,
    conditions: override[1].conditions ?? genericCompetitionInfo.conditions,
  };
}

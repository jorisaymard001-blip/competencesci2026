export interface DiplomaInfo {
  name: string;
  fullName: string;
  level: string;
  duration: string;
  cost: string;
  description: string;
  careers: string[];
  requirements: string;
}

export const DIPLOMA_DATA: Record<string, DiplomaInfo> = {
  BTS: {
    name: "BTS",
    fullName: "Brevet de Technicien Supérieur",
    level: "Bac+2",
    duration: "2 ans après le Baccalauréat",
    cost: "150 000 – 600 000 FCFA / an",
    description:
      "Le BTS est un diplôme professionnel de niveau Bac+2 qui forme des techniciens supérieurs directement opérationnels dans un domaine précis (informatique, commerce, gestion, génie civil, etc.). Il alterne cours théoriques et stages en entreprise.",
    careers: [
      "Technicien supérieur en entreprise",
      "Assistant de gestion ou commercial",
      "Agent technique spécialisé",
      "Responsable d'une petite équipe",
      "Poursuite d'études en Licence professionnelle",
    ],
    requirements: "Baccalauréat toutes séries (selon la spécialité)",
  },
  Licence: {
    name: "Licence",
    fullName: "Licence universitaire (LMD)",
    level: "Bac+3",
    duration: "3 ans après le Baccalauréat",
    cost: "Gratuit (public) · 300 000 – 800 000 FCFA / an (privé)",
    description:
      "La Licence est le premier grade universitaire du système LMD (Licence-Master-Doctorat). Elle offre une formation générale ou professionnelle dans un domaine académique. Elle est délivrée après 3 années d'études supérieures validées par 180 crédits ECTS.",
    careers: [
      "Accès à la fonction publique (concours de catégorie B)",
      "Assistant administratif ou comptable",
      "Chargé de projet junior",
      "Poursuite en Master",
      "Enseignant dans le secondaire (avec CAPES)",
    ],
    requirements: "Baccalauréat + 3 ans d'études ou DEUG/DUT",
  },
  Master: {
    name: "Master",
    fullName: "Master universitaire (LMD)",
    level: "Bac+5",
    duration: "2 ans après la Licence (Bac+5 total)",
    cost: "Gratuit (public) · 500 000 – 1 500 000 FCFA / an (privé)",
    description:
      "Le Master est un diplôme de niveau Bac+5 qui permet de se spécialiser dans un domaine précis. Il comprend un Master 1 (M1) et un Master 2 (M2) avec mémoire de fin d'études. Il existe en deux parcours : Recherche (pour continuer en Doctorat) et Professionnel (pour entrer dans la vie active).",
    careers: [
      "Cadre supérieur dans l'administration publique",
      "Consultant ou expert dans son domaine",
      "Chef de projet ou manager",
      "Poursuite en Doctorat (recherche)",
      "Enseignant-chercheur (avec HDR)",
    ],
    requirements: "Licence (Bac+3) dans un domaine connexe",
  },
  Doctorat: {
    name: "Doctorat",
    fullName: "Doctorat (Ph.D / Bac+8)",
    level: "Bac+8",
    duration: "3 à 5 ans après le Master",
    cost: "Variable · souvent financé par une bourse de recherche",
    description:
      "Le Doctorat est le plus haut diplôme universitaire. Il consiste en la réalisation d'une thèse originale de recherche sous la direction d'un directeur de thèse. Il est indispensable pour devenir enseignant-chercheur ou chercheur dans un organisme public ou privé.",
    careers: [
      "Enseignant-chercheur à l'université",
      "Chercheur dans un laboratoire public ou privé",
      "Expert international ou consultant senior",
      "Directeur de recherche et développement (R&D)",
      "Haut fonctionnaire d'État",
    ],
    requirements: "Master 2 ou équivalent",
  },
  Ingénieur: {
    name: "Ingénieur",
    fullName: "Diplôme d'Ingénieur",
    level: "Bac+5",
    duration: "5 ans après le Baccalauréat (ou 3 ans après un BTS/DUT)",
    cost: "400 000 – 2 000 000 FCFA / an",
    description:
      "Le diplôme d'Ingénieur est délivré par une grande école d'ingénieurs. Il forme des professionnels capables de concevoir, développer et gérer des systèmes techniques complexes. Il est fortement reconnu par les entreprises publiques et privées en Côte d'Ivoire et en Afrique.",
    careers: [
      "Ingénieur en génie civil, informatique, électrique…",
      "Chef de projet technique",
      "Directeur technique en entreprise",
      "Entrepreneur dans les technologies",
      "Cadre dans les grandes sociétés minières, BTP, télécoms",
    ],
    requirements: "Bac scientifique (C, D, E) · Classes préparatoires ou BTS/DUT",
  },
  DUT: {
    name: "DUT",
    fullName: "Diplôme Universitaire de Technologie",
    level: "Bac+2",
    duration: "2 ans après le Baccalauréat",
    cost: "100 000 – 400 000 FCFA / an",
    description:
      "Le DUT est un diplôme technologique de niveau Bac+2 délivré par un Institut Universitaire de Technologie (IUT). Il combine enseignements théoriques et pratiques, avec des stages obligatoires. Il permet une insertion professionnelle rapide ou une poursuite en Licence professionnelle.",
    careers: [
      "Technicien en informatique, gestion, réseau…",
      "Agent de maîtrise en industrie",
      "Poursuite en Licence professionnelle (Bac+3)",
      "Collaborateur technique en bureau d'études",
    ],
    requirements: "Baccalauréat toutes séries",
  },
  MBA: {
    name: "MBA",
    fullName: "Master of Business Administration",
    level: "Bac+5 à Bac+6",
    duration: "1 à 2 ans (après une expérience professionnelle)",
    cost: "1 000 000 – 5 000 000 FCFA / an",
    description:
      "Le MBA est un diplôme de management international destiné aux professionnels en activité. Il développe des compétences en stratégie, finance, leadership et gestion d'entreprise. Il est délivré par des écoles de commerce reconnues.",
    careers: [
      "Directeur général ou DG adjoint",
      "Directeur financier (CFO) ou commercial",
      "Entrepreneur et fondateur de startup",
      "Consultant en management et stratégie",
      "Cadre dirigeant dans une multinationale",
    ],
    requirements: "Licence ou Master + 2 à 5 ans d'expérience professionnelle",
  },
  DEUG: {
    name: "DEUG",
    fullName: "Diplôme d'Études Universitaires Générales",
    level: "Bac+2",
    duration: "2 ans après le Baccalauréat",
    cost: "Gratuit (public) · 200 000 – 500 000 FCFA / an (privé)",
    description:
      "Le DEUG est un diplôme intermédiaire de l'université correspondant aux deux premières années d'université. Il n'est plus délivré dans le système LMD mais reste reconnu. Il permet de valider le premier cycle universitaire avant de poursuivre en Licence.",
    careers: [
      "Poursuite obligatoire vers la Licence",
      "Accès à certains concours de la fonction publique (catégorie C/B)",
      "Assistant administratif",
    ],
    requirements: "Baccalauréat",
  },
  CAP: {
    name: "CAP",
    fullName: "Certificat d'Aptitude Professionnelle",
    level: "Niveau BEPC+2",
    duration: "2 ans après le BEPC",
    cost: "80 000 – 250 000 FCFA / an",
    description:
      "Le CAP est un diplôme professionnel de niveau secondaire qui forme à un métier manuel ou technique spécifique. Il prépare à une insertion rapide dans le monde du travail dans des secteurs comme la mécanique, la couture, la menuiserie ou la restauration.",
    careers: [
      "Ouvrier qualifié dans un métier technique",
      "Artisan ou auto-entrepreneur",
      "Employé technique en atelier ou chantier",
      "Poursuite vers le BEP ou le Baccalauréat professionnel",
    ],
    requirements: "BEPC ou équivalent",
  },
};

export function getDiplomaInfo(name: string): DiplomaInfo | null {
  return DIPLOMA_DATA[name] ?? null;
}

export const LEVEL_COLORS: Record<string, string> = {
  "Bac+2": "bg-blue-50 text-blue-700 border-blue-200",
  "Bac+3": "bg-green-50 text-green-700 border-green-200",
  "Bac+5": "bg-orange-50 text-orange-700 border-orange-200",
  "Bac+8": "bg-purple-50 text-purple-700 border-purple-200",
  "Bac+5 à Bac+6": "bg-orange-50 text-orange-700 border-orange-200",
  "Niveau BEPC+2": "bg-gray-50 text-gray-700 border-gray-200",
};

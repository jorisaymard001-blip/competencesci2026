export type ArticleSection =
  | { type: "heading"; titre: string }
  | { type: "paragraph"; contenu: string }
  | { type: "info"; contenu: string }
  | { type: "tip"; contenu: string }
  | { type: "warning"; contenu: string }
  | { type: "list"; items: string[] }
  | { type: "stats"; stats: { valeur: string; label: string }[] }
  | { type: "quote"; contenu: string; auteur?: string };

export interface Article {
  id: string;
  title: string;
  emoji: string;
  readTime: string;
  category: string;
  intro: string;
  sections: ArticleSection[];
}

export const articles: Article[] = [
  {
    id: "choisir-filiere",
    title: "Comment choisir sa filière ?",
    emoji: "🎯",
    readTime: "4",
    category: "Orientation",
    intro: "Choisir sa filière est l'une des décisions les plus importantes de ta vie académique. Voici un guide pratique pour faire le bon choix.",
    sections: [
      { type: "heading", titre: "Connais-toi toi-même" },
      { type: "paragraph", contenu: "Avant tout, interroge-toi sur tes matières préférées au lycée, tes centres d'intérêt et tes aptitudes naturelles." },
      { type: "info", contenu: "Un élève passionné par les mathématiques trouvera plus de satisfaction en filière scientifique. Quelqu'un qui aime rédiger sera plus épanoui en lettres ou communication." },

      { type: "heading", titre: "Pense à tes débouchés" },
      { type: "paragraph", contenu: "La filière que tu choisis doit déboucher sur des métiers qui t'intéressent ET qui offrent des opportunités réelles en Côte d'Ivoire." },
      { type: "list", items: ["💻 Numérique & Informatique", "🏥 Santé", "🏗️ Génie Civil & BTP", "💰 Finance & Comptabilité", "🌾 Agriculture modernisée", "🏛️ Métiers de l'État"] },

      { type: "heading", titre: "Tiens compte de tes moyens" },
      { type: "stats", stats: [{ valeur: "50K–200K", label: "FCFA/an — Universités publiques" }, { valeur: "500K–2M", label: "FCFA/an — Écoles privées" }] },
      { type: "info", contenu: "Renseigne-toi sur les bourses disponibles auprès du MESRS. Elles peuvent couvrir une partie de tes frais." },

      { type: "heading", titre: "Renseigne-toi auprès de professionnels" },
      { type: "paragraph", contenu: "Parle à des personnes qui exercent le métier qui t'intéresse. Fais des stages courts ou des visites d'entreprise." },
      { type: "tip", contenu: "Utilise Compétences CI pour explorer les établissements et les filières disponibles dans ta ville !" },

      { type: "heading", titre: "Ne te précipite pas" },
      { type: "warning", contenu: "Si tu n'es pas sûr(e), certaines universités permettent une réorientation en fin de première année. Ne choisis jamais une filière par défaut ou par pression sociale." },
    ],
  },

  {
    id: "apres-bac",
    title: "Que faire après le BAC ?",
    emoji: "🎓",
    readTime: "5",
    category: "Études",
    intro: "Obtenir son baccalauréat est une étape majeure. Voici un panorama complet des options qui s'offrent à toi en Côte d'Ivoire.",
    sections: [
      { type: "heading", titre: "L'université publique" },
      { type: "paragraph", contenu: "Les universités publiques (UFHB, UNA, UPGC…) accueillent les bacheliers sur concours ou sur dossier." },
      { type: "stats", stats: [{ valeur: "50K–100K", label: "FCFA/an — frais de scolarité" }, { valeur: "LMD", label: "Licence 3 ans + Master 2 ans" }] },
      { type: "warning", contenu: "Inconvénient : les effectifs élevés et parfois des grèves peuvent ralentir le cursus. Anticipe en planifiant tes révisions à l'avance." },

      { type: "heading", titre: "Les grandes écoles & établissements privés" },
      { type: "paragraph", contenu: "Des établissements comme l'INP-HB, l'ISTC, l'IAM proposent des formations professionnalisantes à débouchés solides." },
      { type: "stats", stats: [{ valeur: "400K–1,5M", label: "FCFA/an — frais moyens" }, { valeur: "3–5 ans", label: "durée de formation" }] },
      { type: "tip", contenu: "Certaines délivrent des diplômes reconnus à l'international. Vérifie les accréditations avant de t'inscrire." },

      { type: "heading", titre: "Les concours de la fonction publique" },
      { type: "paragraph", contenu: "Certains concours sont accessibles aux bacheliers : police, douanes, armée, auxiliaires de justice…" },
      { type: "info", contenu: "La formation est gratuite et débouche sur un emploi garanti. Surveille les ouvertures de concours directement sur Compétences CI." },

      { type: "heading", titre: "La formation professionnelle (BTS)" },
      { type: "paragraph", contenu: "Le BTS (2 ans après le Bac) est une excellente option pour entrer rapidement sur le marché du travail." },
      { type: "list", items: ["📊 Comptabilité & Gestion", "💻 Informatique", "⚡ Électronique & Maintenance", "📝 Secrétariat & Communication", "🏗️ Génie Civil"] },

      { type: "heading", titre: "L'entrepreneuriat" },
      { type: "paragraph", contenu: "Des structures comme le FAFCI, le FADER ou des incubateurs accompagnent les jeunes qui souhaitent créer leur activité dès la sortie du lycée." },
      { type: "tip", contenu: "Les métiers de l'artisanat et la formation professionnelle courte sont également des voies dignes et porteuses de revenus stables." },
    ],
  },

  {
    id: "reussir-concours",
    title: "Comment réussir un concours ?",
    emoji: "🏆",
    readTime: "5",
    category: "Concours",
    intro: "Les concours de la fonction publique ivoirienne sont très sélectifs. Voici les clés pour maximiser tes chances de réussite.",
    sections: [
      { type: "heading", titre: "Prépare-toi tôt" },
      { type: "paragraph", contenu: "Ne commence pas la préparation deux semaines avant le concours. Les concours testent des connaissances générales ET des connaissances spécifiques à la fonction concernée." },
      { type: "stats", stats: [{ valeur: "6–12", label: "mois de préparation idéale" }, { valeur: "2–3h", label: "de révision par jour minimum" }] },

      { type: "heading", titre: "Consulte les annales" },
      { type: "paragraph", contenu: "Les annales (sujets des années précédentes) sont les meilleures sources de préparation." },
      { type: "info", contenu: "Elles montrent le format des épreuves, le niveau attendu et les thèmes récurrents. Demande-les au secrétariat du ministère ou sur les sites officiels." },

      { type: "heading", titre: "Maîtrise la culture générale ivoirienne" },
      { type: "paragraph", contenu: "Presque tous les concours incluent des épreuves de culture générale." },
      { type: "list", items: ["🇨🇮 Histoire de la Côte d'Ivoire", "🏛️ Institutions politiques ivoiriennes", "🌍 Actualité africaine et internationale", "📰 Presse locale (Fraternité Matin, Abidjan.net)"] },

      { type: "heading", titre: "Soigne ton dossier" },
      { type: "warning", contenu: "Un dossier incomplet ou mal présenté peut entraîner une disqualification directe. Vérifie chaque document, respecte les délais et présente-toi en tenue correcte le jour J." },
      { type: "tip", contenu: "La ponctualité est obligatoire. Arrive 30 minutes avant l'heure officielle pour être serein." },

      { type: "heading", titre: "Entraîne-toi à la rédaction administrative" },
      { type: "paragraph", contenu: "Beaucoup de concours incluent une note de synthèse ou une dissertation administrative. Entraîne-toi à structurer tes idées." },
      { type: "info", contenu: "Structure type : introduction → développement en 2-3 parties → conclusion. La clarté et la concision sont valorisées par les correcteurs." },

      { type: "heading", titre: "Gère le stress le jour J" },
      { type: "paragraph", contenu: "Dors bien la nuit précédente, arrive en avance, et lis attentivement tous les énoncés avant de commencer." },
      { type: "tip", contenu: "Si une question est difficile, passe à la suivante et reviens-y. Gère ton temps : ne bloque jamais plus de 5 minutes sur une seule question." },
    ],
  },

  {
    id: "filieres-demandees",
    title: "Les filières les plus demandées",
    emoji: "📊",
    readTime: "4",
    category: "Marché du travail",
    intro: "Voici un aperçu des filières les plus porteuses en Côte d'Ivoire aujourd'hui et dans les années à venir.",
    sections: [
      { type: "heading", titre: "Informatique & Numérique" },
      { type: "paragraph", contenu: "La transformation numérique de la Côte d'Ivoire crée une forte demande en développeurs web/mobile, data analysts, cybersécurité et administrateurs systèmes." },
      { type: "stats", stats: [{ valeur: "🚀 Fort", label: "potentiel de croissance" }, { valeur: "Top 3", label: "salaires les plus compétitifs" }] },
      { type: "info", contenu: "Des écoles comme l'ESATIC, l'ISI et l'INP-HB forment dans ces domaines avec des partenariats internationaux solides." },

      { type: "heading", titre: "Finance, Comptabilité & Gestion" },
      { type: "paragraph", contenu: "Les entreprises, banques et administrations ont constamment besoin de comptables, auditeurs, financiers et gestionnaires." },
      { type: "tip", contenu: "Le BTS Comptabilité, la Licence et le Master CCA sont des passeports solides. La profession est encadrée par le SYSCOA — une référence reconnue dans toute la zone UEMOA." },

      { type: "heading", titre: "Génie Civil & BTP" },
      { type: "paragraph", contenu: "La construction d'infrastructures (routes, immeubles, barrages) est un secteur en plein essor en Côte d'Ivoire. Les ingénieurs civils, techniciens BTP et géomètres sont très recherchés." },
      { type: "info", contenu: "L'INP-HB de Yamoussoukro est une référence nationale et sous-régionale dans ce domaine avec une forte insertion professionnelle." },

      { type: "heading", titre: "Santé & Paramédical" },
      { type: "paragraph", contenu: "Médecins, pharmaciens, infirmiers, sages-femmes et techniciens de laboratoire sont en déficit chronique sur tout le territoire." },
      { type: "warning", contenu: "La formation médicale est longue (7–10 ans) et exigeante. Assure-toi d'avoir la vocation et les moyens avant de t'engager dans cette voie." },

      { type: "heading", titre: "Agriculture & Agroalimentaire" },
      { type: "paragraph", contenu: "La Côte d'Ivoire reste la première puissance cacaoyère mondiale. Les agronomes, ingénieurs agroalimentaires et techniciens agricoles ont de beaux débouchés." },
      { type: "tip", contenu: "Les multinationales du cacao et du café recrutent régulièrement des profils techniques locaux. C'est un secteur souvent sous-estimé par les étudiants." },

      { type: "heading", titre: "Droit & Administration publique" },
      { type: "paragraph", contenu: "Pour intégrer la fonction publique à un niveau élevé, le droit et l'administration publique ouvrent les portes : magistrature, diplomatie, notariat, conseil juridique." },
      { type: "quote", contenu: "L'ENA est la voie royale pour les hauts fonctionnaires. C'est un concours très sélectif qui demande plusieurs années de préparation.", auteur: "Conseil Compétences CI" },
    ],
  },
];

export function getArticleById(id: string): Article | undefined {
  return articles.find(a => a.id === id);
}

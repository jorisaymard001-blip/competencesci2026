export interface Article {
  id: string;
  title: string;
  emoji: string;
  readTime: string;
  category: string;
  intro: string;
  sections: { heading: string; content: string }[];
}

export const articles: Article[] = [
  {
    id: "choisir-filiere",
    title: "Comment choisir sa filière ?",
    emoji: "🎯",
    readTime: "4 min",
    category: "Orientation",
    intro: "Choisir sa filière est l'une des décisions les plus importantes de votre vie académique. Voici un guide pratique pour faire le bon choix.",
    sections: [
      {
        heading: "1. Connais-toi toi-même",
        content: "Avant tout, interroge-toi sur tes matières préférées au lycée, tes centres d'intérêt et tes aptitudes naturelles. Un élève passionné par les mathématiques trouvera plus de satisfaction en filière scientifique ou technique. Quelqu'un qui aime rédiger et communiquer sera plus épanoui en lettres, sciences humaines ou communication.",
      },
      {
        heading: "2. Pense à tes débouchés",
        content: "La filière que tu choisis doit déboucher sur des métiers qui t'intéressent ET qui offrent des opportunités réelles en Côte d'Ivoire. Les secteurs porteurs actuellement : numérique & informatique, santé, génie civil & BTP, finance & comptabilité, agriculture modernisée, et les métiers de l'État.",
      },
      {
        heading: "3. Tiens compte de tes moyens",
        content: "Certaines filières dans des établissements privés peuvent coûter entre 500 000 et 2 000 000 FCFA par an. Les universités publiques restent plus accessibles (50 000–200 000 FCFA). Renseigne-toi sur les bourses disponibles auprès du MESRS.",
      },
      {
        heading: "4. Renseigne-toi auprès de professionnels",
        content: "Parle à des personnes qui exercent le métier qui t'intéresse. Fais des stages courts ou des visites d'entreprise. Utilise Compétences CI pour explorer les établissements et les filières disponibles dans ta ville.",
      },
      {
        heading: "5. Ne te précipite pas",
        content: "Si tu n'es pas sûr(e), certaines universités permettent une réorientation en fin de première année. L'essentiel est de ne pas choisir une filière par défaut ou par pression sociale.",
      },
    ],
  },
  {
    id: "apres-bac",
    title: "Que faire après le BAC ?",
    emoji: "🎓",
    readTime: "5 min",
    category: "Études",
    intro: "Obtenir son baccalauréat est une étape majeure. Voici un panorama complet des options qui s'offrent à toi en Côte d'Ivoire.",
    sections: [
      {
        heading: "Option 1 : L'université publique",
        content: "Les universités publiques (UFHB, UNA, UPGC, etc.) accueillent les bacheliers sur concours ou sur dossier. Les frais sont modiques (50 000–100 000 FCFA/an). Elles offrent des licences en 3 ans, des masters en 2 ans supplémentaires. Inconvénient : les effectifs élevés et parfois les grèves.",
      },
      {
        heading: "Option 2 : Les grandes écoles et écoles privées",
        content: "Des établissements comme l'INP-HB, l'ISTC, l'IAM, etc. proposent des formations professionnalisantes. Les coûts sont plus élevés (400 000–1 500 000 FCFA/an) mais les débouchés sont souvent meilleurs. Certaines délivrent des diplômes reconnus à l'international.",
      },
      {
        heading: "Option 3 : Les concours de la fonction publique",
        content: "Certains concours sont accessibles aux bacheliers : recrutement dans la police, les douanes, l'armée, les auxiliaires de justice, etc. La formation est gratuite et débouche sur un emploi garanti. Surveille les ouvertures de concours sur Compétences CI.",
      },
      {
        heading: "Option 4 : La formation professionnelle",
        content: "Le BTS (2 ans après le Bac) est une excellente option pour entrer rapidement sur le marché du travail. Des filières comme la comptabilité, le secrétariat, l'informatique, l'électronique ou la maintenance industrielle sont très demandées.",
      },
      {
        heading: "Option 5 : L'entrepreneuriat",
        content: "Des structures comme le FAFCI, le FADER ou des incubateurs peuvent accompagner les jeunes qui souhaitent créer leur activité dès la sortie du lycée. La formation professionnelle courte et les métiers de l'artisanat sont également des voies dignes.",
      },
    ],
  },
  {
    id: "reussir-concours",
    title: "Comment réussir un concours ?",
    emoji: "🏆",
    readTime: "5 min",
    category: "Concours",
    intro: "Les concours de la fonction publique ivoirienne sont très sélectifs. Voici les clés pour maximiser tes chances de réussite.",
    sections: [
      {
        heading: "1. Prépare-toi tôt",
        content: "Ne commence pas la préparation deux semaines avant le concours. Idéalement, démarre 6 à 12 mois à l'avance. Les concours testent des connaissances générales ET des connaissances spécifiques à la fonction concernée.",
      },
      {
        heading: "2. Consulte les annales",
        content: "Les annales (sujets des années précédentes) sont les meilleures sources de préparation. Elles montrent le format des épreuves, le niveau attendu et les thèmes récurrents. Demande-les au secrétariat du ministère ou sur les sites officiels.",
      },
      {
        heading: "3. Maîtrise la culture générale ivoirienne",
        content: "Presque tous les concours incluent des épreuves de culture générale : histoire de la Côte d'Ivoire, institutions politiques, actualité africaine et internationale. Lis régulièrement des journaux comme Fraternité Matin ou Abidjan.net.",
      },
      {
        heading: "4. Soigne ta présentation et ton dossier",
        content: "Un dossier incomplet ou mal présenté peut entraîner une disqualification directe. Vérifie chaque document, respecte les délais et présente-toi en tenue correcte le jour du concours. La ponctualité est obligatoire.",
      },
      {
        heading: "5. Entraîne-toi à la rédaction administrative",
        content: "Beaucoup de concours incluent une note de synthèse ou une dissertation administrative. Entraîne-toi à structurer tes idées : introduction, développement en 2-3 parties, conclusion. La clarté et la concision sont valorisées.",
      },
      {
        heading: "6. Gère le stress",
        content: "Le jour J, dors bien la nuit précédente, arrive en avance, et lis attentivement tous les énoncés avant de commencer. Si une question est difficile, passe à la suivante et reviens-y. Gère ton temps sur chaque épreuve.",
      },
    ],
  },
  {
    id: "filieres-demandees",
    title: "Les filières les plus demandées",
    emoji: "📊",
    readTime: "4 min",
    category: "Marché du travail",
    intro: "Voici un aperçu des filières les plus porteuses en Côte d'Ivoire aujourd'hui et dans les années à venir.",
    sections: [
      {
        heading: "🖥️ Informatique & Numérique",
        content: "La transformation numérique de la Côte d'Ivoire crée une forte demande en développeurs web/mobile, data analysts, cybersécurité, et administrateurs systèmes. Des écoles comme l'ESATIC, l'ISI et l'INP-HB forment dans ces domaines. Les salaires sont parmi les plus compétitifs du marché.",
      },
      {
        heading: "💼 Finance, Comptabilité & Gestion",
        content: "Les entreprises, banques et administrations ont constamment besoin de comptables, auditeurs, financiers et gestionnaires. Le BTS Comptabilité, la Licence et le Master CCA sont des passeports solides. La profession est encadrée par le SYSCOA.",
      },
      {
        heading: "🏗️ Génie Civil & BTP",
        content: "La construction d'infrastructures (routes, immeubles, barrages) est un secteur en plein essor en Côte d'Ivoire. Les ingénieurs civils, techniciens BTP et géomètres sont très recherchés. L'INP-HB est une référence dans ce domaine.",
      },
      {
        heading: "⚕️ Santé & Paramédical",
        content: "Médecins, pharmaciens, infirmiers, sages-femmes et techniciens de laboratoire sont en déficit chronique. L'UFR Sciences Médicales à Abidjan et les instituts de formation des agents de santé forment ces professionnels indispensables.",
      },
      {
        heading: "🌿 Agriculture & Agroalimentaire",
        content: "La Côte d'Ivoire reste la première puissance cacaoyère mondiale. Les agronomes, ingénieurs agroalimentaires, techniciens agricoles et vétérinaires ont de beaux débouchés dans le privé (multinationales) et le public.",
      },
      {
        heading: "⚖️ Droit & Administration publique",
        content: "Pour intégrer la fonction publique à un niveau élevé, le droit et l'administration publique ouvrent les portes : magistrature, diplomatie, notariat, conseil juridique. L'ENA est la voie royale pour les hauts fonctionnaires.",
      },
    ],
  },
];

export function getArticleById(id: string): Article | undefined {
  return articles.find(a => a.id === id);
}

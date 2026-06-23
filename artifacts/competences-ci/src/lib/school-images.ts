const U = "https://images.unsplash.com/";
const Q = "?w=800&q=75&auto=format&fit=crop";

const NAME_MAP: Record<string, string> = {
  "Université Félix Houphouët-Boigny":
    `${U}photo-1562774053-701939374585${Q}`,
  "Institut National Polytechnique Félix Houphouët-Boigny (INP-HB)":
    `${U}photo-1532094349884-543282242985${Q}`,
  "Université Alassane Ouattara":
    `${U}photo-1498243691581-b145c3f54a5a${Q}`,
  "Université Lorougnon Guédé":
    `${U}photo-1580582932707-520aed937b7b${Q}`,
  "Université Jean Lorougnon Guédé - Antenne de Gagnoa":
    `${U}photo-1580582932707-520aed937b7b${Q}`,
  "Université Péléforo Gon Coulibaly":
    `${U}photo-1541339907198-e08756dedf3f${Q}`,
  "École Nationale Supérieure de Statistique et d'Économie Appliquée (ENSEA)":
    `${U}photo-1551288049-bebda4e38f71${Q}`,
  "École Nationale d'Administration (ENA)":
    `${U}photo-1568992687947-868a62a9f521${Q}`,
  "Institut National de la Jeunesse et des Sports (INJS)":
    `${U}photo-1540747913346-19212a4b54d8${Q}`,
  "École Normale Supérieure (ENS)":
    `${U}photo-1523580494863-6f3031224c94${Q}`,
  "Institut National de Formation Professionnelle (INFP)":
    `${U}photo-1504917595217-d4dc5ebe6122${Q}`,
  "Lycée Technique de Cocody":
    `${U}photo-1518770660439-4636190af475${Q}`,
  "Université Virtuelle de Côte d'Ivoire (UVCI)":
    `${U}photo-1584697964328-b1e7f63dbc90${Q}`,
  "Institut des Sciences et Techniques de la Communication (ISTC)":
    `${U}photo-1461749280684-dccba630e2f6${Q}`,
  "École des Mines et de la Géologie (EMG)":
    `${U}photo-1508873696983-2dfd5898f08b${Q}`,
  "Université de Man":
    `${U}photo-1580582932707-520aed937b7b${Q}`,
  "Université de San-Pédro":
    `${U}photo-1562774053-701939374585${Q}`,
  "Écoles Nationales des Postes et Télécommunications (ENPT)":
    `${U}photo-1451187580459-43490279c0fa${Q}`,
  "Institut National de Santé Publique (INSP)":
    `${U}photo-1532938911079-1b06ac7ceec7${Q}`,
  "Centre Ivoirien de Formation des Agents de Douanes (CIFAD)":
    `${U}photo-1568992687947-868a62a9f521${Q}`,
  "Institut des Sciences et de la Gestion (ISG)":
    `${U}photo-1507679799987-c73779587ccf${Q}`,
  "École Supérieure de Commerce et d'Administration des Entreprises (ESCAE)":
    `${U}photo-1454165804606-c3d57bc86b40${Q}`,
  "Institut Africain de Management (IAM)":
    `${U}photo-1507679799987-c73779587ccf${Q}`,
  "PIGIER Côte d'Ivoire":
    `${U}photo-1454165804606-c3d57bc86b40${Q}`,
  "Sup de Co Abidjan":
    `${U}photo-1507679799987-c73779587ccf${Q}`,
  "Institut Supérieur de Technologie (IST)":
    `${U}photo-1517245386807-bb43f82c33c4${Q}`,
  "Institut Supérieur Panafricain d'Économie Coopérative (ISPEC)":
    `${U}photo-1507679799987-c73779587ccf${Q}`,
  "Institut Universitaire d'Abidjan (IUA)":
    `${U}photo-1498243691581-b145c3f54a5a${Q}`,
  "Université Catholique de l'Afrique de l'Ouest (UCAO)":
    `${U}photo-1541339907198-e08756dedf3f${Q}`,
  "Institut Supérieur d'Informatique (ISI)":
    `${U}photo-1517245386807-bb43f82c33c4${Q}`,
  "École Supérieure de Génie Civil (ESGC)":
    `${U}photo-1503387837-b154d5074bd2${Q}`,
  "Institut Supérieur de Management (ISM)":
    `${U}photo-1454165804606-c3d57bc86b40${Q}`,
  "Institut des Hautes Études en Communication (IHEC)":
    `${U}photo-1598300042247-d088f8ab3a91${Q}`,
  "Institut Supérieur de Santé (ISS)":
    `${U}photo-1584432810601-6c7f27d2362b${Q}`,
  "École Supérieure de Droit et des Affaires (ESDA)":
    `${U}photo-1589829085413-56de8ae18c73${Q}`,
  "Institut Universitaire des Technologies (IUT)":
    `${U}photo-1517245386807-bb43f82c33c4${Q}`,
};

const DOMAIN_MAP: Array<{ keywords: string[]; url: string }> = [
  { keywords: ["informatique", "numérique", "réseau", "cybersécurité", "digital"], url: `${U}photo-1517245386807-bb43f82c33c4${Q}` },
  { keywords: ["santé", "médecin", "infirm", "médical", "pharmacie"], url: `${U}photo-1532938911079-1b06ac7ceec7${Q}` },
  { keywords: ["génie civil", "architecture", "btp", "urbanisme"], url: `${U}photo-1503387837-b154d5074bd2${Q}` },
  { keywords: ["communication", "journalisme", "audiovisuel", "médias"], url: `${U}photo-1598300042247-d088f8ab3a91${Q}` },
  { keywords: ["sport", "éducation physique"], url: `${U}photo-1540747913346-19212a4b54d8${Q}` },
  { keywords: ["droit", "juridique", "judiciaire"], url: `${U}photo-1589829085413-56de8ae18c73${Q}` },
  { keywords: ["statistique", "économie", "finance"], url: `${U}photo-1551288049-bebda4e38f71${Q}` },
  { keywords: ["mine", "géologie", "pétrochim"], url: `${U}photo-1508873696983-2dfd5898f08b${Q}` },
  { keywords: ["télécommunication", "télécom", "réseau"], url: `${U}photo-1451187580459-43490279c0fa${Q}` },
  { keywords: ["agriculture", "agronomie"], url: `${U}photo-1500076656116-558758c991c1${Q}` },
  { keywords: ["gestion", "management", "commerce", "marketing"], url: `${U}photo-1507679799987-c73779587ccf${Q}` },
];

const DEFAULT_PUBLIC = `${U}photo-1562774053-701939374585${Q}`;
const DEFAULT_PRIVATE = `${U}photo-1497366216548-37526070297c${Q}`;
const DEFAULT_FALLBACK = `${U}photo-1562774053-701939374585${Q}`;

export function getSchoolImage(school: {
  name: string;
  type?: string;
  imageUrl?: string | null;
  domains?: string[];
}): string {
  if (school.imageUrl) return school.imageUrl;
  if (NAME_MAP[school.name]) return NAME_MAP[school.name];

  const domainsLower = (school.domains ?? []).map(d => d.toLowerCase());
  for (const entry of DOMAIN_MAP) {
    if (entry.keywords.some(kw => domainsLower.some(d => d.includes(kw)))) {
      return entry.url;
    }
  }

  if (school.type === "public") return DEFAULT_PUBLIC;
  if (school.type === "private") return DEFAULT_PRIVATE;
  return DEFAULT_FALLBACK;
}

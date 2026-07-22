const U = "https://images.unsplash.com/";
const Q = "?w=800&q=75&auto=format&fit=crop";

const IMAGES = {
  police:      `${U}photo-1589578527966-fdac0f44566c${Q}`,
  gendarmerie: `${U}photo-1574021003957-81d9d741d8d7${Q}`,
  militaire:   `${U}photo-1541199249251-f713e6145474${Q}`,
  pompier:     `${U}photo-1582719508461-905c673771fd${Q}`,
  health:      `${U}photo-1532938911079-1b06ac7ceec7${Q}`,
  pharmacie:   `${U}photo-1584308666744-24d5c474f2ae${Q}`,
  cafop:       `${U}photo-1580582932707-520aed937b7b${Q}`,
  ens:         `${U}photo-1523580494863-6f3031224c94${Q}`,
  university:  `${U}photo-1562774053-701939374585${Q}`,
  ena:         `${U}photo-1568992687947-868a62a9f521${Q}`,
  customs:     `${U}photo-1518544866330-4e716ab49a3d${Q}`,
  finance:     `${U}photo-1454165804606-c3d57bc86b40${Q}`,
  justice:     `${U}photo-1589829085413-56de8ae18c73${Q}`,
  engineering: `${U}photo-1532094349884-543282242985${Q}`,
  it:          `${U}photo-1517245386807-bb43f82c33c4${Q}`,
  agriculture: `${U}photo-1500076656116-558758c991c1${Q}`,
  statistics:  `${U}photo-1551288049-bebda4e38f71${Q}`,
  sports:      `${U}photo-1540747913346-19212a4b54d8${Q}`,
  diplomatie:  `${U}photo-1503387837-b154d5074bd2${Q}`,
  telecom:     `${U}photo-1451187580459-43490279c0fa${Q}`,
  media:       `${U}photo-1461749280684-dccba630e2f6${Q}`,
  environment: `${U}photo-1441974231531-c6227db76b6e${Q}`,
  transport:   `${U}photo-1449965408869-eaa3f722e40d${Q}`,
  default:     `${U}photo-1568992687947-868a62a9f521${Q}`,
};

type CompEntry = { title: string; ministry?: string | null; imageUrl?: string | null };

export function getCompetitionImage(comp: CompEntry): string {
  if (comp.imageUrl) return comp.imageUrl;

  const text = `${comp.title} ${comp.ministry ?? ""}`.toLowerCase();

  if (text.includes("police") || text.includes("sécurité nationale")) return IMAGES.police;
  if (text.includes("gendarm")) return IMAGES.gendarmerie;
  if (text.includes("militaire") || text.includes("armée") || text.includes("défense") || text.includes("marine")) return IMAGES.militaire;
  if (text.includes("pompier") || text.includes("secours") || text.includes("incendie")) return IMAGES.pompier;

  if (text.includes("infas") || text.includes("infirm") || text.includes("aide-soignant") || text.includes("sage-femme")) return IMAGES.health;
  if (text.includes("santé") && !text.includes("sport")) return IMAGES.health;
  if (text.includes("pharmacie") || text.includes("pharma")) return IMAGES.pharmacie;

  if (text.includes("cafop") || text.includes("instituteur") || text.includes("moniteur d'enseign") || text.includes("éducation nationale")) return IMAGES.cafop;
  if (text.includes("ens ") || text.includes("école normale supérieure") || text.includes("professeur de lyc")) return IMAGES.ens;
  if (text.includes("université") || text.includes("enseignement supérieur") || text.includes("uvci")) return IMAGES.university;

  if (text.includes("ena") || text.includes("administrateur civil") || text.includes("attaché d'administration") || text.includes("secrétaire d'administration")) return IMAGES.ena;
  if (text.includes("douane") || text.includes("douanier") || text.includes("agent des douanes")) return IMAGES.customs;
  if (text.includes("impôt") || text.includes("trésor") || text.includes("recette") || text.includes("budget") || text.includes("fiscalité") || text.includes("finances publiques")) return IMAGES.finance;
  if (text.includes("justice") || text.includes("magistrat") || text.includes("greffier") || text.includes("notaire") || text.includes("tribunal")) return IMAGES.justice;
  if (text.includes("diplomatie") || text.includes("affaires étrangères") || text.includes("ambassade") || text.includes("consul")) return IMAGES.diplomatie;

  if (text.includes("ingénieur") || text.includes("génie civil") || text.includes("btp") || text.includes("mines") || text.includes("infrastructure")) return IMAGES.engineering;
  if (text.includes("informatique") || text.includes("numérique") || text.includes("système d'information") || text.includes("data")) return IMAGES.it;
  if (text.includes("agriculture") || text.includes("agronomie") || text.includes("élevage") || text.includes("pêche") || text.includes("forêt")) return IMAGES.agriculture;
  if (text.includes("statistique") || text.includes("économie") || text.includes("économiste")) return IMAGES.statistics;
  if (text.includes("sport") || text.includes("injs") || text.includes("éducation physique")) return IMAGES.sports;
  if (text.includes("télécommunication") || text.includes("télécom") || text.includes("postes")) return IMAGES.telecom;
  if (text.includes("journaliste") || text.includes("communication") || text.includes("audiovisuel") || text.includes("media") || text.includes("presse")) return IMAGES.media;
  if (text.includes("environnement") || text.includes("eau") || text.includes("assainissement") || text.includes("écologie")) return IMAGES.environment;
  if (text.includes("transport") || text.includes("aviation") || text.includes("aérien") || text.includes("maritime")) return IMAGES.transport;

  return IMAGES.default;
}

export function getCompetitionImageByMinistry(ministry: string): string {
  return getCompetitionImage({ title: "", ministry });
}

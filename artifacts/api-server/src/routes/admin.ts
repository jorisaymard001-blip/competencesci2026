import { Router, type Request, type Response, type NextFunction } from "express";
import { createHmac } from "crypto";
import { db, pool } from "@workspace/db";
import { competitionsTable, schoolsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET ?? "fallback-secret";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

// ── JWT helpers ───────────────────────────────────────────────────────────────

function signToken(payload: Record<string, unknown>): string {
  const h = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const b = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 86_400_000 })).toString("base64url");
  const sig = createHmac("sha256", JWT_SECRET).update(`${h}.${b}`).digest("base64url");
  return `${h}.${b}.${sig}`;
}

function verifyToken(token: string): Record<string, unknown> | null {
  try {
    const [h, b, sig] = token.split(".");
    const expected = createHmac("sha256", JWT_SECRET).update(`${h}.${b}`).digest("base64url");
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(b, "base64url").toString()) as Record<string, unknown>;
    if (typeof payload.exp === "number" && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Admin middleware ──────────────────────────────────────────────────────────

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Non autorisé" });
  }
  const payload = verifyToken(auth.slice(7));
  if (!payload || payload.role !== "admin") {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
  next();
}

// ── Bootstrap admin_articles table ───────────────────────────────────────────

async function ensureArticlesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_articles (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Orientation',
      read_time TEXT NOT NULL DEFAULT '3',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}
ensureArticlesTable().catch(err => console.error("[admin] ensureArticlesTable error:", err));

// ── School image columns migration ────────────────────────────────────────────

const SCHOOL_IMAGE_MAP: Record<string, string> = {
  "Université Félix Houphouët-Boigny": "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=75&auto=format&fit=crop",
  "Institut National Polytechnique Félix Houphouët-Boigny (INP-HB)": "https://images.unsplash.com/photo-1532094349884-543282242985?w=800&q=75&auto=format&fit=crop",
  "Université Alassane Ouattara": "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&q=75&auto=format&fit=crop",
  "Université Lorougnon Guédé": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=75&auto=format&fit=crop",
  "Université Jean Lorougnon Guédé - Antenne de Gagnoa": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=75&auto=format&fit=crop",
  "Université Péléforo Gon Coulibaly": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=75&auto=format&fit=crop",
  "École Nationale Supérieure de Statistique et d'Économie Appliquée (ENSEA)": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=75&auto=format&fit=crop",
  "École Nationale d'Administration (ENA)": "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&q=75&auto=format&fit=crop",
  "Institut National de la Jeunesse et des Sports (INJS)": "https://images.unsplash.com/photo-1540747913346-19212a4b54d8?w=800&q=75&auto=format&fit=crop",
  "École Normale Supérieure (ENS)": "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=75&auto=format&fit=crop",
  "Institut National de Formation Professionnelle (INFP)": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=75&auto=format&fit=crop",
  "Lycée Technique de Cocody": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=75&auto=format&fit=crop",
  "Université Virtuelle de Côte d'Ivoire (UVCI)": "https://images.unsplash.com/photo-1584697964328-b1e7f63dbc90?w=800&q=75&auto=format&fit=crop",
  "Institut des Sciences et Techniques de la Communication (ISTC)": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=75&auto=format&fit=crop",
  "École des Mines et de la Géologie (EMG)": "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?w=800&q=75&auto=format&fit=crop",
  "Université de Man": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=75&auto=format&fit=crop",
  "Université de San-Pédro": "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=75&auto=format&fit=crop",
  "Écoles Nationales des Postes et Télécommunications (ENPT)": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=75&auto=format&fit=crop",
  "Institut National de Santé Publique (INSP)": "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&q=75&auto=format&fit=crop",
  "Centre Ivoirien de Formation des Agents de Douanes (CIFAD)": "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&q=75&auto=format&fit=crop",
  "Institut des Sciences et de la Gestion (ISG)": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=75&auto=format&fit=crop",
  "École Supérieure de Commerce et d'Administration des Entreprises (ESCAE)": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=75&auto=format&fit=crop",
  "Institut Africain de Management (IAM)": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=75&auto=format&fit=crop",
  "PIGIER Côte d'Ivoire": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=75&auto=format&fit=crop",
  "Sup de Co Abidjan": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=75&auto=format&fit=crop",
  "Institut Supérieur de Technologie (IST)": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=75&auto=format&fit=crop",
  "Institut Supérieur Panafricain d'Économie Coopérative (ISPEC)": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=75&auto=format&fit=crop",
  "Centre d'Excellence Professionnelle (CEP)": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=75&auto=format&fit=crop",
  "Institut Universitaire d'Abidjan (IUA)": "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&q=75&auto=format&fit=crop",
  "Université Catholique de l'Afrique de l'Ouest (UCAO)": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=75&auto=format&fit=crop",
  "Institut Supérieur d'Informatique (ISI)": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=75&auto=format&fit=crop",
  "École Supérieure de Génie Civil (ESGC)": "https://images.unsplash.com/photo-1503387837-b154d5074bd2?w=800&q=75&auto=format&fit=crop",
  "Institut Supérieur de Management (ISM)": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=75&auto=format&fit=crop",
  "Institut des Hautes Études en Communication (IHEC)": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=75&auto=format&fit=crop",
  "Institut Supérieur de Santé (ISS)": "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=800&q=75&auto=format&fit=crop",
  "École Supérieure de Droit et des Affaires (ESDA)": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=75&auto=format&fit=crop",
  "Institut Universitaire des Technologies (IUT)": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=75&auto=format&fit=crop",
};

async function ensureSchoolImageColumns() {
  await pool.query(`ALTER TABLE schools ADD COLUMN IF NOT EXISTS image_url TEXT`);
  await pool.query(`ALTER TABLE schools ADD COLUMN IF NOT EXISTS logo_url TEXT`);
  for (const [name, url] of Object.entries(SCHOOL_IMAGE_MAP)) {
    await pool.query(
      `UPDATE schools SET image_url = $1 WHERE name = $2 AND image_url IS NULL`,
      [url, name]
    );
  }
}
ensureSchoolImageColumns().catch(err => console.error("[admin] ensureSchoolImageColumns error:", err));

// ── Competition image columns migration ───────────────────────────────────────

async function ensureCompetitionImageColumns() {
  await pool.query(`ALTER TABLE competitions ADD COLUMN IF NOT EXISTS image_url TEXT`);
  await pool.query(`ALTER TABLE competitions ADD COLUMN IF NOT EXISTS logo_url TEXT`);
}
ensureCompetitionImageColumns().catch(err => console.error("[admin] ensureCompetitionImageColumns error:", err));

// ── Login ─────────────────────────────────────────────────────────────────────

router.post("/admin/login", (req: Request, res: Response) => {
  const { password } = req.body as { password?: string };
  if (!ADMIN_PASSWORD) return res.status(500).json({ message: "Admin non configuré sur le serveur" });
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Mot de passe incorrect" });
  }
  res.json({ token: signToken({ role: "admin" }) });
});

// ── Stats ─────────────────────────────────────────────────────────────────────

router.get("/admin/stats", adminAuth, async (_req: Request, res: Response) => {
  const [comps, schools, artResult] = await Promise.all([
    db.select().from(competitionsTable),
    db.select().from(schoolsTable),
    pool.query("SELECT COUNT(*) AS count FROM admin_articles"),
  ]);
  res.json({
    competitions: comps.length,
    schools: schools.length,
    articles: parseInt(artResult.rows[0]?.count ?? "0"),
  });
});

// ── Competitions CRUD ─────────────────────────────────────────────────────────

router.get("/admin/competitions", adminAuth, async (_req: Request, res: Response) => {
  const rows = await db.select().from(competitionsTable).orderBy(competitionsTable.createdAt);
  res.json(rows);
});

router.post("/admin/competitions", adminAuth, async (req: Request, res: Response) => {
  const { title, ministry, city, diploma, status, openDate, closeDate, positions, description, requirements, process, contact, website, imageUrl, logoUrl } = req.body as Record<string, any>;
  const [comp] = await db.insert(competitionsTable).values({
    title, ministry, city, diploma,
    status: status ?? "upcoming",
    openDate: openDate || null,
    closeDate: closeDate || null,
    positions: parseInt(positions) || 0,
    description: description || "",
    requirements: Array.isArray(requirements) ? requirements : [],
    process: Array.isArray(process) ? process : [],
    contact: contact || null,
    website: website || null,
    imageUrl: imageUrl || null,
    logoUrl: logoUrl || null,
  }).returning();
  res.status(201).json(comp);
});

router.put("/admin/competitions/:id", adminAuth, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { title, ministry, city, diploma, status, openDate, closeDate, positions, description, requirements, process, contact, website, imageUrl, logoUrl } = req.body as Record<string, any>;
  const [comp] = await db.update(competitionsTable).set({
    title, ministry, city, diploma,
    status: status ?? "upcoming",
    openDate: openDate || null,
    closeDate: closeDate || null,
    positions: parseInt(positions) || 0,
    description: description || "",
    requirements: Array.isArray(requirements) ? requirements : [],
    process: Array.isArray(process) ? process : [],
    contact: contact || null,
    website: website || null,
    imageUrl: imageUrl || null,
    logoUrl: logoUrl || null,
  }).where(eq(competitionsTable.id, id)).returning();
  if (!comp) return res.status(404).json({ message: "Introuvable" });
  res.json(comp);
});

router.delete("/admin/competitions/:id", adminAuth, async (req: Request, res: Response) => {
  await db.delete(competitionsTable).where(eq(competitionsTable.id, parseInt(req.params.id)));
  res.json({ success: true });
});

// ── Schools CRUD ──────────────────────────────────────────────────────────────

router.get("/admin/schools", adminAuth, async (_req: Request, res: Response) => {
  const rows = await db.select().from(schoolsTable).orderBy(schoolsTable.createdAt);
  res.json(rows);
});

router.post("/admin/schools", adminAuth, async (req: Request, res: Response) => {
  const { name, type, city, address, phone, website, email, description, diplomas, domains, accreditation, founded, imageUrl, logoUrl } = req.body as Record<string, any>;
  const [school] = await db.insert(schoolsTable).values({
    name, city,
    type: type ?? "private",
    address: address || "",
    phone: phone || null,
    website: website || null,
    email: email || null,
    description: description || "",
    diplomas: Array.isArray(diplomas) ? diplomas : [],
    domains: Array.isArray(domains) ? domains : [],
    accreditation: accreditation || null,
    founded: founded ? parseInt(founded) : null,
    imageUrl: imageUrl || null,
    logoUrl: logoUrl || null,
  }).returning();
  res.status(201).json(school);
});

router.put("/admin/schools/:id", adminAuth, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, type, city, address, phone, website, email, description, diplomas, domains, accreditation, founded, imageUrl, logoUrl } = req.body as Record<string, any>;
  const [school] = await db.update(schoolsTable).set({
    name, city,
    type: type ?? "private",
    address: address || "",
    phone: phone || null,
    website: website || null,
    email: email || null,
    description: description || "",
    diplomas: Array.isArray(diplomas) ? diplomas : [],
    domains: Array.isArray(domains) ? domains : [],
    accreditation: accreditation || null,
    founded: founded ? parseInt(founded) : null,
    imageUrl: imageUrl || null,
    logoUrl: logoUrl || null,
  }).where(eq(schoolsTable.id, id)).returning();
  if (!school) return res.status(404).json({ message: "Introuvable" });
  res.json(school);
});

router.delete("/admin/schools/:id", adminAuth, async (req: Request, res: Response) => {
  await db.delete(schoolsTable).where(eq(schoolsTable.id, parseInt(req.params.id)));
  res.json({ success: true });
});

// ── Articles CRUD ─────────────────────────────────────────────────────────────

router.get("/admin/articles", adminAuth, async (_req: Request, res: Response) => {
  const result = await pool.query("SELECT * FROM admin_articles ORDER BY created_at DESC");
  res.json(result.rows);
});

router.post("/admin/articles", adminAuth, async (req: Request, res: Response) => {
  const { title, content, category, read_time } = req.body as Record<string, string>;
  const result = await pool.query(
    "INSERT INTO admin_articles (title, content, category, read_time) VALUES ($1, $2, $3, $4) RETURNING *",
    [title, content, category || "Orientation", read_time || "3"]
  );
  res.status(201).json(result.rows[0]);
});

router.put("/admin/articles/:id", adminAuth, async (req: Request, res: Response) => {
  const { title, content, category, read_time } = req.body as Record<string, string>;
  const result = await pool.query(
    "UPDATE admin_articles SET title=$1, content=$2, category=$3, read_time=$4 WHERE id=$5 RETURNING *",
    [title, content, category, read_time, req.params.id]
  );
  if (!result.rows[0]) return res.status(404).json({ message: "Introuvable" });
  res.json(result.rows[0]);
});

router.delete("/admin/articles/:id", adminAuth, async (req: Request, res: Response) => {
  await pool.query("DELETE FROM admin_articles WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

// ── Scraping ──────────────────────────────────────────────────────────────────

const SOURCES = [
  { name: "Fonction Publique CI", url: "https://fonctionpublique.ci" },
  { name: "MESRS", url: "https://mesrs.ci" },
  { name: "Infrastructures CI", url: "https://infrastructure.ci" },
];

const KEYWORDS = ["concours", "recrutement", "candidature", "inscription", "avis", "offre d'emploi"];

router.post("/admin/scrape", adminAuth, async (_req: Request, res: Response) => {
  const meta: { source: string; status: string; keywordsFound?: string[]; message?: string }[] = [];
  const detected: { id: string; nom: string; source: string; url: string; dateDetection: string; statut: string; score: number }[] = [];

  for (const source of SOURCES) {
    try {
      const resp = await fetch(source.url, { signal: AbortSignal.timeout(8000) });
      const html = await resp.text();
      const { load } = await import("cheerio");
      const $ = load(html);
      const bodyText = $("body").text().toLowerCase();
      const found = KEYWORDS.filter(k => bodyText.includes(k));

      $("a").each((_: number, el: Element) => {
        const linkText = $(el as any).text().trim();
        const href = $(el as any).attr("href");
        if (found.length > 0 && KEYWORDS.some(k => linkText.toLowerCase().includes(k)) && linkText.length > 12 && linkText.length < 200) {
          detected.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            nom: linkText,
            source: source.name,
            url: href ? (href.startsWith("http") ? href : new URL(href, source.url).href) : source.url,
            dateDetection: new Date().toISOString(),
            statut: "en_attente_validation",
            score: found.length,
          });
        }
      });

      meta.push({ source: source.name, status: "ok", keywordsFound: found });
    } catch (err) {
      meta.push({ source: source.name, status: "error", message: err instanceof Error ? err.message : "Erreur réseau" });
    }
  }

  const unique = Array.from(new Map(detected.map(d => [d.nom, d])).values()).slice(0, 20);
  res.json({ results: unique, meta });
});

export default router;

import { db } from "@workspace/db";
import {
  notificationsTable,
  schoolsTable,
  competitionsTable,
} from "@workspace/db/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";

const RUN_INTERVAL_MS = 5 * 60 * 1000;
const NEW_ITEM_WINDOW_MS = 24 * 60 * 60 * 1000;
const DEADLINE_SOON_DAYS = 3;

async function existsNotification(
  type: string,
  referenceId: number,
): Promise<boolean> {
  const rows = await db
    .select({ id: notificationsTable.id })
    .from(notificationsTable)
    .where(
      and(
        eq(notificationsTable.type, type),
        eq(notificationsTable.referenceId, referenceId),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

async function insertNotif(payload: {
  title: string;
  body: string;
  type: string;
  referenceId: number;
  referenceType: string;
}): Promise<void> {
  await db.insert(notificationsTable).values(payload);
  console.log(
    `[notif-synth] +${payload.type} ref=${payload.referenceType}#${payload.referenceId}`,
  );
}

async function syncNewSchools(): Promise<void> {
  const cutoff = new Date(Date.now() - NEW_ITEM_WINDOW_MS);
  const recent = await db
    .select()
    .from(schoolsTable)
    .where(gte(schoolsTable.createdAt, cutoff));

  for (const s of recent) {
    if (await existsNotification("new_school", s.id)) continue;
    await insertNotif({
      title: "🎓 Nouvelle école disponible",
      body: `${s.name} (${s.city}) a rejoint l'annuaire. Découvre-la !`,
      type: "new_school",
      referenceId: s.id,
      referenceType: "school",
    });
  }
}

async function syncNewCompetitions(): Promise<void> {
  const cutoff = new Date(Date.now() - NEW_ITEM_WINDOW_MS);
  const recent = await db
    .select()
    .from(competitionsTable)
    .where(gte(competitionsTable.createdAt, cutoff));

  for (const c of recent) {
    if (await existsNotification("new_competition", c.id)) continue;
    await insertNotif({
      title: "📢 Nouveau concours disponible !",
      body: `${c.title} (${c.ministry}) — ouvert à ${c.city}.`,
      type: "new_competition",
      referenceId: c.id,
      referenceType: "competition",
    });
  }
}

async function syncDeadlineSoon(): Promise<void> {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const limit = new Date(today.getTime() + DEADLINE_SOON_DAYS * 86_400_000);
  const limitIso = limit.toISOString().slice(0, 10);

  const soon = await db
    .select()
    .from(competitionsTable)
    .where(
      and(
        eq(competitionsTable.status, "open"),
        gte(competitionsTable.closeDate, todayIso),
        lte(competitionsTable.closeDate, limitIso),
      ),
    );

  for (const c of soon) {
    if (await existsNotification("deadline_soon", c.id)) continue;
    const days = c.closeDate
      ? Math.max(
          0,
          Math.ceil(
            (new Date(c.closeDate).getTime() - today.getTime()) / 86_400_000,
          ),
        )
      : DEADLINE_SOON_DAYS;
    await insertNotif({
      title: "⏰ Attention, date limite proche !",
      body: `${c.title} ferme dans ${days} jour${days > 1 ? "s" : ""}. Dépose ton dossier !`,
      type: "deadline_soon",
      referenceId: c.id,
      referenceType: "competition",
    });
  }
}

async function syncClosedCompetitions(): Promise<void> {
  const todayIso = new Date().toISOString().slice(0, 10);
  const expired = await db
    .select()
    .from(competitionsTable)
    .where(
      and(
        eq(competitionsTable.status, "open"),
        lte(competitionsTable.closeDate, todayIso),
      ),
    );

  for (const c of expired) {
    await db
      .update(competitionsTable)
      .set({ status: "closed" })
      .where(eq(competitionsTable.id, c.id));

    if (await existsNotification("competition_closed", c.id)) continue;
    await insertNotif({
      title: "🚫 Concours terminé",
      body: `${c.title} est désormais fermé. Consulte les autres concours ouverts.`,
      type: "competition_closed",
      referenceId: c.id,
      referenceType: "competition",
    });
  }
}

async function runOnce(): Promise<void> {
  try {
    await syncNewSchools();
    await syncNewCompetitions();
    await syncDeadlineSoon();
    await syncClosedCompetitions();
  } catch (err) {
    console.error("[notif-synth] error:", err);
  }
}

let interval: NodeJS.Timeout | null = null;

export function startNotificationSynthesizer(): void {
  if (interval) return;
  console.log("[notif-synth] starting (every 5 min)");
  void runOnce();
  interval = setInterval(() => {
    void runOnce();
  }, RUN_INTERVAL_MS);
}

export function stopNotificationSynthesizer(): void {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

export { runOnce as runNotificationSynthesizerOnce };

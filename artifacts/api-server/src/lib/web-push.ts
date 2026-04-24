import webpush from "web-push";
import { db } from "@workspace/db";
import { pushSubscriptionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const VAPID_PUBLIC_KEY = process.env["VAPID_PUBLIC_KEY"] ?? "";
const VAPID_PRIVATE_KEY = process.env["VAPID_PRIVATE_KEY"] ?? "";
const VAPID_SUBJECT = process.env["VAPID_SUBJECT"] ?? "mailto:competencesci2004@gmail.com";

let configured = false;

export function isWebPushConfigured(): boolean {
  return Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
}

export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}

function ensureConfigured(): void {
  if (configured) return;
  if (!isWebPushConfigured()) {
    throw new Error("VAPID keys not configured. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.");
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  url?: string;
  type?: string;
  referenceId?: number | null;
  referenceType?: string | null;
}

export async function sendPushToAll(payload: PushPayload): Promise<{ sent: number; pruned: number }> {
  if (!isWebPushConfigured()) {
    console.warn("[web-push] Skipped — VAPID keys missing");
    return { sent: 0, pruned: 0 };
  }
  ensureConfigured();

  const subs = await db.select().from(pushSubscriptionsTable);
  if (subs.length === 0) return { sent: 0, pruned: 0 };

  const data = JSON.stringify(payload);
  let sent = 0;
  let pruned = 0;

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          data,
          { TTL: 60 * 60 * 24 },
        );
        sent++;
      } catch (err: unknown) {
        const status =
          typeof err === "object" && err !== null && "statusCode" in err
            ? (err as { statusCode: number }).statusCode
            : 0;
        // 404/410 = subscription gone → prune
        if (status === 404 || status === 410) {
          await db.delete(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.id, s.id));
          pruned++;
        } else {
          console.error(`[web-push] send failed (${status}):`, err);
        }
      }
    }),
  );

  if (sent || pruned) {
    console.log(`[web-push] sent=${sent} pruned=${pruned} total=${subs.length}`);
  }
  return { sent, pruned };
}

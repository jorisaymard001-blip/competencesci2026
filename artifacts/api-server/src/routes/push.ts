import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { pushSubscriptionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getVapidPublicKey, isWebPushConfigured, sendPushToAll } from "../lib/web-push";

const router: IRouter = Router();

router.get("/push/vapid-public-key", (_req, res) => {
  if (!isWebPushConfigured()) {
    res.status(503).json({ error: "Push not configured" });
    return;
  }
  res.json({ publicKey: getVapidPublicKey() });
});

interface SubscribeBody {
  endpoint?: unknown;
  keys?: { p256dh?: unknown; auth?: unknown };
  userId?: unknown;
  userAgent?: unknown;
}

router.post("/push/subscribe", async (req, res) => {
  const body = (req.body ?? {}) as SubscribeBody;
  const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
  const p256dh = typeof body.keys?.p256dh === "string" ? body.keys.p256dh : "";
  const auth = typeof body.keys?.auth === "string" ? body.keys.auth : "";
  const userId = typeof body.userId === "number" ? body.userId : null;
  const userAgent = typeof body.userAgent === "string" ? body.userAgent : null;

  if (!endpoint || !p256dh || !auth) {
    res.status(400).json({ error: "Invalid subscription" });
    return;
  }
  const keys = { p256dh, auth };
  try {
    const existing = await db
      .select()
      .from(pushSubscriptionsTable)
      .where(eq(pushSubscriptionsTable.endpoint, endpoint))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(pushSubscriptionsTable)
        .set({
          p256dh: keys.p256dh,
          auth: keys.auth,
          userId: userId ?? null,
          userAgent: userAgent ?? null,
        })
        .where(eq(pushSubscriptionsTable.endpoint, endpoint));
    } else {
      await db.insert(pushSubscriptionsTable).values({
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId: userId ?? null,
        userAgent: userAgent ?? null,
      });
    }
    console.log(`[push] subscribed user=${userId ?? "anon"}`);
    res.json({ ok: true });
  } catch (err) {
    console.error("[push] subscribe error:", err);
    res.status(500).json({ error: "Subscribe failed" });
  }
});

router.post("/push/unsubscribe", async (req, res) => {
  const endpoint = (req.body?.endpoint ?? "") as string;
  if (!endpoint) {
    res.status(400).json({ error: "Missing endpoint" });
    return;
  }
  try {
    await db.delete(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.endpoint, endpoint));
    res.json({ ok: true });
  } catch (err) {
    console.error("[push] unsubscribe error:", err);
    res.status(500).json({ error: "Unsubscribe failed" });
  }
});

// Manual test trigger (dev): POST /api/push/test
router.post("/push/test", async (_req, res) => {
  const result = await sendPushToAll({
    title: "🔔 Test Compétences CI",
    body: "Si tu vois ce message, les notifications push fonctionnent !",
    tag: "push-test",
    url: "/notifications",
  });
  res.json(result);
});

export default router;

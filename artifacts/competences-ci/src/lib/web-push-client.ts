// ── Web Push (VAPID) — client-side subscription helper ──────────────────────
import { apiUrl } from "@/lib/api-url";

const SUB_ENDPOINT_KEY = "cci_push_endpoint";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export async function getVapidPublicKey(): Promise<string | null> {
  try {
    const res = await fetch(apiUrl("/push/vapid-public-key"));
    if (!res.ok) return null;
    const data = (await res.json()) as { publicKey?: string };
    return data.publicKey ?? null;
  } catch {
    return null;
  }
}

export async function subscribeToPush(userId: number | null): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  if (typeof Notification === "undefined") return false;
  try {
    if (Notification.permission !== "granted") return false;
  } catch {
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      const publicKey = await getVapidPublicKey();
      if (!publicKey) {
        console.warn("[push] VAPID public key unavailable");
        return false;
      }
      const keyBytes = urlBase64ToUint8Array(publicKey);
      const applicationServerKey = new ArrayBuffer(keyBytes.byteLength);
      new Uint8Array(applicationServerKey).set(keyBytes);
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    const json = sub.toJSON();
    const body = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: json.keys?.p256dh ?? "",
        auth: json.keys?.auth ?? "",
      },
      userId,
      userAgent: navigator.userAgent,
    };

    const res = await fetch(apiUrl("/push/subscribe"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      localStorage.setItem(SUB_ENDPOINT_KEY, sub.endpoint);
      console.info("[push] Subscribed");
      return true;
    }
    return false;
  } catch (err) {
    console.warn("[push] Subscribe failed:", err);
    return false;
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe().catch(() => {});
      try {
        await fetch(apiUrl("/push/unsubscribe"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        });
      } catch {}
    }
    localStorage.removeItem(SUB_ENDPOINT_KEY);
  } catch {}
}

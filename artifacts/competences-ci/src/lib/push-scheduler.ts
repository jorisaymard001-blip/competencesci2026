// ── Push Notifications Scheduler ──────────────────────────────────────────────
// Handles real browser/PWA notifications:
// 1. Requests permission gracefully
// 2. Shows app-open alerts for unread/new content
// 3. Schedules strategic daily reminders (morning, noon, evening)
// 4. Re-arms timers across sessions via localStorage
// ─────────────────────────────────────────────────────────────────────────────

const LAST_OPEN_KEY = "cci_last_open_at";
const LAST_REMINDER_KEY = "cci_last_reminder_at";
const PERM_ASKED_KEY = "cci_perm_asked";

// Strategic times of day (24h format) — when daily reminders fire
const STRATEGIC_HOURS = [8, 12, 18, 20];

// Pool of motivational/reminder messages for daily strategic alerts
const DAILY_MESSAGES = [
  { title: "🎓 Compétences CI", body: "Découvre les concours ouverts aujourd'hui — ton avenir n'attend pas !" },
  { title: "📚 Préparez votre dossier", body: "Pensez à certifier vos documents avant les dates de clôture." },
  { title: "🇨🇮 Une nouvelle école ?", body: "De nouveaux établissements ont été ajoutés. Explore l'annuaire !" },
  { title: "🚀 Trouve ta voie", body: "Fais le quiz d'orientation et reçois des recommandations personnalisées." },
  { title: "📋 Concours en cours", body: "Vérifie les dates limites des concours et soumets ton dossier à temps." },
  { title: "💡 Conseils du jour", body: "Découvre nos articles pour bien préparer ton concours." },
];

// ── Permission ───────────────────────────────────────────────────────────────

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

export function getPermission(): NotificationPermission {
  return notificationsSupported() ? Notification.permission : "denied";
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    const result = await Notification.requestPermission();
    localStorage.setItem(PERM_ASKED_KEY, "1");
    return result;
  } catch {
    return "denied";
  }
}

export function hasAskedPermission(): boolean {
  return localStorage.getItem(PERM_ASKED_KEY) === "1";
}

// ── Show notification (via SW for PWA, fallback to Notification API) ─────────

export async function showLocalNotification(opts: {
  title: string;
  body: string;
  tag?: string;
  url?: string;
  icon?: string;
}): Promise<boolean> {
  if (!notificationsSupported() || Notification.permission !== "granted") return false;

  const payload: NotificationOptions = {
    body: opts.body,
    icon: opts.icon ?? "/icon-192.png",
    badge: "/icon-192.png",
    tag: opts.tag ?? "competences-ci",
    data: { url: opts.url ?? "/" },
  };

  try {
    // Prefer service worker registration so notifications survive page close
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      await reg.showNotification(opts.title, payload);
      return true;
    }
    new Notification(opts.title, payload);
    return true;
  } catch {
    return false;
  }
}

// ── App badge (PWA / Android) ────────────────────────────────────────────────

export function setAppBadge(count: number): void {
  try {
    const nav = navigator as Navigator & {
      setAppBadge?: (n: number) => Promise<void>;
      clearAppBadge?: () => Promise<void>;
    };
    if (count > 0 && nav.setAppBadge) nav.setAppBadge(count).catch(() => {});
    else if (nav.clearAppBadge) nav.clearAppBadge().catch(() => {});
  } catch {}
}

// ── App open: greet returning users with unread alerts ───────────────────────

export async function notifyOnAppOpen(unreadCount: number, latestTitle?: string): Promise<void> {
  const now = Date.now();
  const lastOpen = parseInt(localStorage.getItem(LAST_OPEN_KEY) || "0", 10);
  localStorage.setItem(LAST_OPEN_KEY, String(now));

  // Update app badge whatever the case
  setAppBadge(unreadCount);

  if (Notification.permission !== "granted") return;

  // Don't spam: show open-notification only if last open was > 30min ago
  const THIRTY_MIN = 30 * 60 * 1000;
  if (now - lastOpen < THIRTY_MIN) return;

  if (unreadCount > 0) {
    await showLocalNotification({
      title: `🔔 ${unreadCount} notification${unreadCount > 1 ? "s" : ""} en attente`,
      body: latestTitle
        ? `Dernière : ${latestTitle}`
        : "Découvre les nouveautés depuis ta dernière visite.",
      tag: "app-open",
      url: "/notifications",
    });
  }
}

// ── Strategic daily reminders ────────────────────────────────────────────────

function pickDailyMessage(): { title: string; body: string } {
  const idx = Math.floor(Math.random() * DAILY_MESSAGES.length);
  return DAILY_MESSAGES[idx];
}

function nextStrategicTime(now: Date): Date {
  const today = new Date(now);
  for (const h of STRATEGIC_HOURS) {
    const t = new Date(today);
    t.setHours(h, 0, 0, 0);
    if (t.getTime() > now.getTime()) return t;
  }
  // All strategic hours passed → tomorrow morning
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(STRATEGIC_HOURS[0], 0, 0, 0);
  return tomorrow;
}

let scheduledTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleNextDailyReminder(): void {
  if (scheduledTimer) clearTimeout(scheduledTimer);
  const now = new Date();
  const next = nextStrategicTime(now);
  const delay = Math.max(1000, next.getTime() - now.getTime());

  scheduledTimer = setTimeout(async () => {
    const lastReminder = parseInt(localStorage.getItem(LAST_REMINDER_KEY) || "0", 10);
    // Avoid duplicate reminders in the same hour window
    if (Date.now() - lastReminder > 60 * 60 * 1000) {
      const msg = pickDailyMessage();
      await showLocalNotification({
        ...msg,
        tag: `daily-${new Date().getHours()}`,
        url: "/",
      });
      localStorage.setItem(LAST_REMINDER_KEY, String(Date.now()));
    }
    scheduleNextDailyReminder(); // re-arm
  }, delay);
}

// ── Public bootstrap ─────────────────────────────────────────────────────────

export function startPushScheduler(): void {
  if (!notificationsSupported()) return;

  // Re-arm strategic reminders every time the app loads
  if (Notification.permission === "granted") {
    scheduleNextDailyReminder();
  }

  // Re-arm when tab becomes visible after long idle
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && Notification.permission === "granted") {
      scheduleNextDailyReminder();
    }
  });
}

export function stopPushScheduler(): void {
  if (scheduledTimer) {
    clearTimeout(scheduledTimer);
    scheduledTimer = null;
  }
}

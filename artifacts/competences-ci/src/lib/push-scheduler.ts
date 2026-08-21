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
const SETTINGS_KEY = "competences_ci_settings";

function notifsAllowedBySettings(): boolean {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return s.notificationsEnabled !== false;
  } catch {
    return true;
  }
}

// Strategic times of day (24h format) — when daily reminders fire
const STRATEGIC_HOURS = [8, 12, 16, 20];

// Hour-specific motivational messages (3 per slot, picked randomly)
const MESSAGES_BY_HOUR: Record<number, { title: string; body: string }[]> = {
  8: [
    { title: "🌅 Bonne journée !", body: "Chaque matin est une nouvelle chance de construire ton avenir. Consulte les concours ouverts aujourd'hui !" },
    { title: "☀️ Démarre fort !", body: "Les grandes réussites commencent par de petites actions. Explore une nouvelle école ce matin." },
    { title: "🎯 Objectif du jour", body: "Tu es à un concours de changer ta vie. Vérifie les dates de clôture des candidatures !" },
  ],
  12: [
    { title: "🍽️ Pause méridienne", body: "Profite de ta pause pour découvrir les filières disponibles. Ton futur se construit maintenant." },
    { title: "💡 Le saviez-vous ?", body: "Il y a 40 écoles référencées en Côte d'Ivoire. As-tu trouvé celle qui te correspond ?" },
    { title: "📚 Conseil du midi", body: "Prépare tes documents à l'avance. Un dossier complet, c'est 50% du chemin vers la réussite." },
  ],
  16: [
    { title: "⚡ Boost de l'après-midi", body: "Ne laisse pas passer les opportunités ! Vérifie les nouveaux concours ajoutés cette semaine." },
    { title: "🏆 Tu peux le faire !", body: "Des milliers d'Ivoiriens ont réussi leur concours en étant bien préparés. C'est ton tour !" },
    { title: "🔔 Rappel important", body: "As-tu consulté les conditions d'inscription aux concours qui t'intéressent ? Agis maintenant." },
  ],
  20: [
    { title: "🌙 Bilan du soir", body: "Qu'as-tu fait aujourd'hui pour ton avenir ? Il n'est jamais trop tard pour explorer les écoles CI." },
    { title: "✨ Prépare demain", body: "Avant de dormir, note 3 écoles ou concours à explorer demain. La préparation, c'est la clé !" },
    { title: "💪 Tu progresses !", body: "Chaque jour passé sur Compétences CI te rapproche de ta voie idéale. Continue comme ça !" },
  ],
};

// ── Permission ───────────────────────────────────────────────────────────────

export function notificationsSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof Notification !== "undefined" &&
    "serviceWorker" in navigator
  );
}

export function getPermission(): NotificationPermission {
  if (!notificationsSupported()) return "denied";
  try {
    return Notification.permission;
  } catch {
    return "denied";
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  try {
    if (Notification.permission !== "default") return Notification.permission;
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
  if (!notificationsSupported() || getPermission() !== "granted") return false;
  if (!notifsAllowedBySettings()) return false;

  const payload: NotificationOptions = {
    body: opts.body,
    icon: opts.icon ?? "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: opts.tag ?? "competences-ci",
    data: { url: opts.url ?? "/" },
  };

  try {
    // Prefer service worker registration so notifications survive page close
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg && "showNotification" in reg) {
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

  if (getPermission() !== "granted") return;

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

// ── Legacy daily reminders ───────────────────────────────────────────────────
// Les rappels à heures fixes sont volontairement désactivés : les notifications
// doivent être déclenchées par un événement utile (concours, résultat, dossier).

function pickDailyMessage(hour?: number): { title: string; body: string } {
  const pool = hour !== undefined && MESSAGES_BY_HOUR[hour]
    ? MESSAGES_BY_HOUR[hour]
    : Object.values(MESSAGES_BY_HOUR).flat();
  return pool[Math.floor(Math.random() * pool.length)];
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
      const currentHour = new Date().getHours();
      const msg = pickDailyMessage(currentHour);
      await showLocalNotification({
        ...msg,
        tag: `daily-${currentHour}`,
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
  if (!notifsAllowedBySettings()) return;
}

export function stopPushScheduler(): void {
  if (scheduledTimer) {
    clearTimeout(scheduledTimer);
    scheduledTimer = null;
  }
}

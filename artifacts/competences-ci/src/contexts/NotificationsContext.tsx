import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useSettings } from "./SettingsContext";
import {
  showLocalNotification,
  setAppBadge,
  notifyOnAppOpen,
  startPushScheduler,
  stopPushScheduler,
  requestNotificationPermission,
  hasAskedPermission,
} from "@/lib/push-scheduler";
import { subscribeToPush, unsubscribeFromPush } from "@/lib/web-push-client";

const LAST_ACTIVE_KEY = "cci_last_active_at";
const INACTIVITY_NOTIF_KEY = "cci_inactivity_notif_at";
const INACTIVITY_THRESHOLD_MS = 48 * 60 * 60 * 1000;
const INACTIVITY_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  type: string;
  referenceId?: number | null;
  referenceType?: string | null;
  createdAt: string;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  trashedNotifications: AppNotification[];
  savedIds: Set<number>;
  unreadCount: number;
  deleteNotification: (id: number) => void;
  restoreNotification: (id: number) => void;
  saveNotification: (id: number) => void;
  unsaveNotification: (id: number) => void;
  markAllRead: () => void;
  isLoading: boolean;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

const DELETED_KEY = (uid: number) => `notif_deleted_v2_${uid}`;
const SAVED_KEY = (uid: number) => `notif_saved_${uid}`;
const READ_KEY = (uid: number) => `notif_read_ts_${uid}`;

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { notificationsEnabled } = useSettings();
  const [allNotifications, setAllNotifications] = useState<AppNotification[]>([]);
  // deletedMap: id → timestamp when deleted
  const [deletedMap, setDeletedMap] = useState<Record<number, number>>({});
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [lastReadAt, setLastReadAt] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  // track whether first fetch is done so we don't spam push notifs on login
  const firstFetchDone = useRef(false);

  useEffect(() => {
    if (!user) {
      firstFetchDone.current = false;
      return;
    }
    try {
      const del = localStorage.getItem(DELETED_KEY(user.id));
      if (del) {
        const parsed = JSON.parse(del);
        // Clean entries older than 15 days
        const now = Date.now();
        const cleaned: Record<number, number> = {};
        for (const [id, ts] of Object.entries(parsed)) {
          if (now - (ts as number) < FIFTEEN_DAYS_MS) {
            cleaned[Number(id)] = ts as number;
          }
        }
        setDeletedMap(cleaned);
      }
      const sav = localStorage.getItem(SAVED_KEY(user.id));
      if (sav) setSavedIds(new Set(JSON.parse(sav)));
      const ts = localStorage.getItem(READ_KEY(user.id));
      setLastReadAt(ts ? parseInt(ts, 10) : 0);
    } catch {}
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/notifications`);
      if (!res.ok) return;
      const data: AppNotification[] = await res.json();

      setAllNotifications((prev) => {
        const prevIds = new Set(prev.map(n => n.id));
        // Only trigger push notifications after the first fetch
        if (firstFetchDone.current && notificationsEnabled) {
          const newOnes = data.filter(
            (n) => !prevIds.has(n.id) &&
            new Date(n.createdAt).getTime() > lastReadAt
          );
          // Real push via service worker (survives tab close on Android/desktop)
          newOnes.forEach((n) => {
            const url =
              n.referenceType === "school" && n.referenceId ? `/schools/${n.referenceId}` :
              n.referenceType === "competition" && n.referenceId ? `/competitions/${n.referenceId}` :
              "/notifications";
            showLocalNotification({
              title: n.title,
              body: n.body,
              tag: `notif-${n.id}`,
              url,
            });
          });
        }
        firstFetchDone.current = true;
        return data;
      });
    } catch {} finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Permission + scheduler bootstrap
  useEffect(() => {
    if (!isAuthenticated || !notificationsEnabled) {
      stopPushScheduler();
      if (!notificationsEnabled) {
        setAppBadge(0);
        void unsubscribeFromPush();
      }
      return;
    }
    // Ask once per device, then subscribe to real push
    const initPush = async () => {
      let perm = Notification.permission;
      if (!hasAskedPermission() && perm === "default") {
        // Defer slightly so it doesn't pop immediately on login
        await new Promise((r) => setTimeout(r, 1500));
        perm = await requestNotificationPermission();
      }
      if (perm === "granted") {
        await subscribeToPush(user?.id ?? null);
      }
    };
    void initPush();

    // Start strategic-time daily reminders (8h, 12h, 18h, 20h)
    startPushScheduler();
    return () => stopPushScheduler();
  }, [isAuthenticated, notificationsEnabled, user?.id]);

  // ── Inactivity tracker ────────────────────────────────────────────────
  // On app open, if user was away >48h, fire a "come back" notification
  useEffect(() => {
    if (!isAuthenticated) return;

    const now = Date.now();
    const last = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || "0", 10);
    const lastInactivityNotif = parseInt(
      localStorage.getItem(INACTIVITY_NOTIF_KEY) || "0",
      10,
    );

    if (
      last > 0 &&
      now - last > INACTIVITY_THRESHOLD_MS &&
      now - lastInactivityNotif > INACTIVITY_COOLDOWN_MS &&
      notificationsEnabled
    ) {
      showLocalNotification({
        title: "👀 Reviens voir les nouveautés",
        body: "Plusieurs concours et écoles sont peut-être disponibles depuis ta dernière visite.",
        tag: "inactivity",
        url: "/notifications",
      });
      localStorage.setItem(INACTIVITY_NOTIF_KEY, String(now));
    }

    const stamp = () => localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
    stamp();
    const interval = setInterval(stamp, 60_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") stamp();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isAuthenticated, notificationsEnabled]);

  // App-open notification: only fires once per mount
  const openNotifiedRef = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || openNotifiedRef.current) return;
    if (!notificationsEnabled) return;
    if (allNotifications.length === 0) return;
    openNotifiedRef.current = true;
    const unread = allNotifications.filter(
      (n) => !(n.id in deletedMap) && new Date(n.createdAt).getTime() > lastReadAt
    );
    const latest = unread[0]?.title;
    notifyOnAppOpen(unread.length, latest);
  }, [isAuthenticated, allNotifications.length, notificationsEnabled]);

  const saveDeletedMap = (map: Record<number, number>, uid: number) => {
    localStorage.setItem(DELETED_KEY(uid), JSON.stringify(map));
  };

  // Notifications visible (not deleted)
  const visible = allNotifications.filter((n) => !(n.id in deletedMap));
  // Notifications in trash (deleted within 15 days)
  const trashedNotifications = allNotifications.filter((n) => {
    if (!(n.id in deletedMap)) return false;
    return Date.now() - deletedMap[n.id] < FIFTEEN_DAYS_MS;
  });

  const unreadCount = visible.filter(
    (n) => new Date(n.createdAt).getTime() > lastReadAt
  ).length;

  // Sync system app badge (PWA on Android/Chrome) whenever unread changes
  useEffect(() => {
    if (isAuthenticated && notificationsEnabled) setAppBadge(unreadCount);
    else setAppBadge(0);
  }, [unreadCount, isAuthenticated, notificationsEnabled]);

  const deleteNotification = (id: number) => {
    const now = Date.now();
    setDeletedMap((prev) => {
      const next = { ...prev, [id]: now };
      if (user) saveDeletedMap(next, user.id);
      return next;
    });
    // Remove from saved too
    setSavedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      if (user) localStorage.setItem(SAVED_KEY(user.id), JSON.stringify([...next]));
      return next;
    });
  };

  const restoreNotification = (id: number) => {
    setDeletedMap((prev) => {
      const next = { ...prev };
      delete next[id];
      if (user) saveDeletedMap(next, user.id);
      return next;
    });
  };

  const saveNotification = (id: number) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (user) localStorage.setItem(SAVED_KEY(user.id), JSON.stringify([...next]));
      return next;
    });
  };

  const unsaveNotification = (id: number) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      if (user) localStorage.setItem(SAVED_KEY(user.id), JSON.stringify([...next]));
      return next;
    });
  };

  const markAllRead = () => {
    const now = Date.now();
    setLastReadAt(now);
    if (user) localStorage.setItem(READ_KEY(user.id), String(now));
  };

  return (
    <NotificationsContext.Provider value={{
      notifications: visible,
      trashedNotifications,
      savedIds,
      unreadCount,
      deleteNotification,
      restoreNotification,
      saveNotification,
      unsaveNotification,
      markAllRead,
      isLoading,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}

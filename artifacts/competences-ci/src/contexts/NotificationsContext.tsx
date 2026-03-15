import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useAuth } from "./AuthContext";

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
  savedIds: Set<number>;
  unreadCount: number;
  deleteNotification: (id: number) => void;
  saveNotification: (id: number) => void;
  unsaveNotification: (id: number) => void;
  markAllRead: () => void;
  isLoading: boolean;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

const DELETED_KEY = (uid: number) => `notif_deleted_${uid}`;
const SAVED_KEY = (uid: number) => `notif_saved_${uid}`;
const READ_KEY = (uid: number) => `notif_read_ts_${uid}`;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [allNotifications, setAllNotifications] = useState<AppNotification[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [lastReadAt, setLastReadAt] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const prevIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!user) return;
    try {
      const del = localStorage.getItem(DELETED_KEY(user.id));
      if (del) setDeletedIds(new Set(JSON.parse(del)));
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
        const newOnes = data.filter(
          (n) => !prevIdsRef.current.has(n.id) &&
          new Date(n.createdAt).getTime() > lastReadAt
        );
        if (newOnes.length > 0 && "Notification" in window && Notification.permission === "granted") {
          newOnes.forEach((n) => {
            try {
              new Notification(n.title, {
                body: n.body,
                icon: "/favicon.ico",
                tag: `notif-${n.id}`,
              });
            } catch {}
          });
        }
        prevIdsRef.current = new Set(data.map(n => n.id));
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

  useEffect(() => {
    if (!isAuthenticated) return;
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [isAuthenticated]);

  const visible = allNotifications.filter((n) => !deletedIds.has(n.id));
  const unreadCount = visible.filter(
    (n) => new Date(n.createdAt).getTime() > lastReadAt
  ).length;

  const deleteNotification = (id: number) => {
    setDeletedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (user) localStorage.setItem(DELETED_KEY(user.id), JSON.stringify([...next]));
      return next;
    });
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      if (user) localStorage.setItem(SAVED_KEY(user.id), JSON.stringify([...next]));
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
      savedIds,
      unreadCount,
      deleteNotification,
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

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
  unreadCount: number;
  deleteNotification: (id: number) => void;
  keepNotification: (id: number) => void;
  markAllRead: () => void;
  isLoading: boolean;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

const DELETED_KEY = (userId: number) => `notif_deleted_${userId}`;
const READ_KEY = (userId: number) => `notif_read_ts_${userId}`;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [allNotifications, setAllNotifications] = useState<AppNotification[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [lastReadAt, setLastReadAt] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const prevCountRef = useRef<number>(0);

  // Load persisted data for this user
  useEffect(() => {
    if (!user) return;
    const stored = localStorage.getItem(DELETED_KEY(user.id));
    if (stored) setDeletedIds(new Set(JSON.parse(stored)));
    const ts = localStorage.getItem(READ_KEY(user.id));
    if (ts) setLastReadAt(parseInt(ts, 10));
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
          (n) => !prev.some((p) => p.id === n.id) && new Date(n.createdAt).getTime() > lastReadAt
        );
        // Browser notification for new items
        if (newOnes.length > 0 && "Notification" in window && Notification.permission === "granted") {
          newOnes.forEach((n) => {
            new Notification(n.title, {
              body: n.body,
              icon: "/favicon.ico",
              tag: `notif-${n.id}`,
            });
          });
        }
        return data;
      });
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    fetchNotifications();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Request notification permission once logged in
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
  };

  const keepNotification = (_id: number) => {
    // explicitly kept — no-op in current model (not deleted = kept)
  };

  const markAllRead = () => {
    const now = Date.now();
    setLastReadAt(now);
    if (user) localStorage.setItem(READ_KEY(user.id), String(now));
  };

  return (
    <NotificationsContext.Provider value={{
      notifications: visible,
      unreadCount,
      deleteNotification,
      keepNotification,
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

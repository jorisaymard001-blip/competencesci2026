import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useNotifications } from "@/contexts/NotificationsContext";
import { Bell, BellOff, GraduationCap, Briefcase, Info, CheckCheck, Bookmark, Trash2, RotateCcw } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { useLocation } from "wouter";
import { useT } from "@/lib/useT";
import { cn } from "@/lib/utils";

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>, color: string, bg: string }> = {
  new_school: { icon: GraduationCap, color: "text-primary", bg: "bg-primary/10" },
  new_competition: { icon: Briefcase, color: "text-secondary", bg: "bg-secondary/10" },
  general: { icon: Info, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
};

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

function daysRemaining(deletedAt: number): number {
  return Math.max(0, Math.ceil((deletedAt + FIFTEEN_DAYS_MS - Date.now()) / 86_400_000));
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function SwipeableNotif({
  n,
  onDelete,
  onSave,
  isSaved,
  onClick,
}: {
  n: { id: number; title: string; body: string; type: string; referenceId?: number | null; createdAt: string };
  onDelete: () => void;
  onSave: () => void;
  isSaved: boolean;
  onClick: () => void;
}) {
  const cfg = typeConfig[n.type] || typeConfig.general;
  const Icon = cfg.icon;
  const x = useMotionValue(0);
  const bgLeft = useTransform(x, [-120, -40, 0], ["rgba(239,68,68,1)", "rgba(239,68,68,0.6)", "rgba(239,68,68,0)"]);
  const bgRight = useTransform(x, [0, 40, 120], ["rgba(34,197,94,0)", "rgba(34,197,94,0.6)", "rgba(34,197,94,1)"]);
  const opacityLeft = useTransform(x, [-120, -40, 0], [1, 0.6, 0]);
  const opacityRight = useTransform(x, [0, 40, 120], [0, 0.6, 1]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -80) {
      animate(x, -400, { duration: 0.2, onComplete: onDelete });
    } else if (info.offset.x > 80) {
      animate(x, 400, { duration: 0.2, onComplete: onSave });
      setTimeout(onSave, 200);
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden">
      <motion.div style={{ opacity: opacityLeft, backgroundColor: bgLeft }}
        className="absolute inset-0 flex items-center justify-start pl-5 rounded-2xl pointer-events-none">
        <Trash2 className="w-6 h-6 text-white" />
      </motion.div>
      <motion.div style={{ opacity: opacityRight, backgroundColor: bgRight }}
        className="absolute inset-0 flex items-center justify-end pr-5 rounded-2xl pointer-events-none">
        <Bookmark className="w-6 h-6 text-white" />
      </motion.div>
      <motion.div
        drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.4}
        style={{ x }} onDragEnd={handleDragEnd} onClick={onClick}
        className={cn(
          "relative flex items-start gap-3 bg-card border border-border/50 rounded-2xl p-4 shadow-sm cursor-grab active:cursor-grabbing",
          !!n.referenceId && "cursor-pointer"
        )}
        whileTap={{ scale: 0.99 }}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
          <Icon className={`w-5 h-5 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm text-foreground leading-tight flex-1">{n.title}</p>
            {isSaved && <Bookmark className="w-3.5 h-3.5 text-secondary shrink-0 fill-secondary mt-0.5" />}
          </div>
          <p className="text-sm text-muted-foreground leading-snug mt-0.5">{n.body}</p>
          <p className="text-[10px] text-muted-foreground/60 font-medium mt-2">{timeAgo(n.createdAt)}</p>
        </div>
      </motion.div>
    </div>
  );
}

function TrashedNotif({
  n,
  deletedAt,
  onRestore,
}: {
  n: { id: number; title: string; body: string; type: string; createdAt: string };
  deletedAt: number;
  onRestore: () => void;
}) {
  const cfg = typeConfig[n.type] || typeConfig.general;
  const Icon = cfg.icon;
  const days = daysRemaining(deletedAt);

  return (
    <div className="flex items-start gap-3 bg-card border border-border/50 rounded-2xl p-4 shadow-sm opacity-70">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
        <Icon className={`w-5 h-5 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground leading-tight">{n.title}</p>
        <p className="text-sm text-muted-foreground leading-snug mt-0.5">{n.body}</p>
        <p className="text-[10px] text-orange-500 font-medium mt-2">
          {days === 0 ? "Suppression définitive demain" : `Suppression dans ${days} jour${days > 1 ? "s" : ""}`}
        </p>
      </div>
      <button
        onClick={onRestore}
        className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1.5 rounded-xl active:scale-90 transition-transform shrink-0"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Restaurer
      </button>
    </div>
  );
}

type Tab = "all" | "saved" | "trash";

export default function Notifications() {
  const {
    notifications, trashedNotifications, savedIds, unreadCount,
    deleteNotification, restoreNotification,
    saveNotification, unsaveNotification, markAllRead,
  } = useNotifications();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const { t } = useT();

  // Auto-mark as read when the page is viewed
  useEffect(() => {
    if (unreadCount > 0) {
      const timer = setTimeout(() => markAllRead(), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // We need deletedMap from context to show deletedAt for each trashed notif.
  // Get from localStorage directly (simpler approach)
  const getDeletedAt = (id: number): number => {
    try {
      const user = JSON.parse(localStorage.getItem("competences_ci_user") || "null");
      if (!user) return Date.now();
      const map = JSON.parse(localStorage.getItem(`notif_deleted_v2_${user.id}`) || "{}");
      return map[id] ?? Date.now();
    } catch { return Date.now(); }
  };

  const displayed = activeTab === "saved"
    ? notifications.filter(n => savedIds.has(n.id))
    : activeTab === "trash"
    ? trashedNotifications
    : notifications;

  const handleClick = (n: typeof notifications[number]) => {
    if (n.referenceType === "school" && n.referenceId) navigate(`/schools/${n.referenceId}`);
    else if (n.referenceType === "competition" && n.referenceId) navigate(`/competitions/${n.referenceId}`);
  };

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "all", label: t("notif_tab_all"), count: unreadCount > 0 ? unreadCount : undefined },
    { key: "saved", label: t("notif_tab_saved"), count: savedIds.size > 0 ? savedIds.size : undefined },
    { key: "trash", label: t("notif_tab_trash"), count: trashedNotifications.length > 0 ? trashedNotifications.length : undefined },
  ];

  return (
    <Layout title={t("notif_title")} showBack noBottomNav>
      <div className="min-h-screen bg-background">
        {/* Tabs */}
        <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 py-2">
          <div className="flex gap-2 mb-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm font-semibold transition-all",
                  activeTab === tab.key
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    "ml-1.5 text-[10px] px-1.5 rounded-full font-bold",
                    tab.key === "trash" ? "bg-red-100 text-red-600" : "bg-secondary/20 text-secondary"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          {activeTab !== "trash" && (
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">{t("notif_swipe_hint")}</p>
              {unreadCount > 0 && activeTab === "all" && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-primary"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> {t("notif_mark_read")}
                </button>
              )}
            </div>
          )}
          {activeTab === "trash" && (
            <p className="text-[11px] text-muted-foreground">{t("notif_trash_hint")}</p>
          )}
        </div>

        <div className="px-4 py-4 space-y-2">
          <AnimatePresence mode="popLayout">
            {displayed.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center px-8"
              >
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
                  {activeTab === "trash"
                    ? <Trash2 className="w-9 h-9 text-muted-foreground/50" />
                    : <BellOff className="w-9 h-9 text-muted-foreground/50" />
                  }
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  {activeTab === "trash" ? t("notif_trash_empty") : t("notif_empty")}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {activeTab === "trash" ? t("notif_trash_empty_sub") : t("notif_empty_sub")}
                </p>
              </motion.div>
            )}

            {activeTab === "trash"
              ? trashedNotifications.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <TrashedNotif
                      n={n}
                      deletedAt={getDeletedAt(n.id)}
                      onRestore={() => restoreNotification(n.id)}
                    />
                  </motion.div>
                ))
              : displayed.map((n) => {
                  const isSaved = savedIds.has(n.id);
                  return (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      <SwipeableNotif
                        n={n}
                        onDelete={() => deleteNotification(n.id)}
                        onSave={() => isSaved ? unsaveNotification(n.id) : saveNotification(n.id)}
                        isSaved={isSaved}
                        onClick={() => handleClick(n)}
                      />
                    </motion.div>
                  );
                })
            }
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}

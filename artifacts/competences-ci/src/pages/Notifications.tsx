import { useState, useRef } from "react";
import { Layout } from "@/components/Layout";
import { useNotifications } from "@/contexts/NotificationsContext";
import { Bell, BellOff, GraduationCap, Briefcase, Info, CheckCheck, Bookmark, Trash2 } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { useLocation } from "wouter";
import { useT } from "@/lib/useT";
import { cn } from "@/lib/utils";

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>, color: string, bg: string }> = {
  new_school: { icon: GraduationCap, color: "text-primary", bg: "bg-primary/10" },
  new_competition: { icon: Briefcase, color: "text-secondary", bg: "bg-secondary/10" },
  general: { icon: Info, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
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
    const threshold = 80;
    if (info.offset.x < -threshold) {
      animate(x, -400, { duration: 0.2, onComplete: onDelete });
    } else if (info.offset.x > threshold) {
      animate(x, 400, { duration: 0.2, onComplete: onSave });
      setTimeout(onSave, 200);
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Delete hint (left) */}
      <motion.div
        style={{ opacity: opacityLeft, backgroundColor: bgLeft }}
        className="absolute inset-0 flex items-center justify-start pl-5 rounded-2xl pointer-events-none"
      >
        <Trash2 className="w-6 h-6 text-white" />
      </motion.div>
      {/* Save hint (right) */}
      <motion.div
        style={{ opacity: opacityRight, backgroundColor: bgRight }}
        className="absolute inset-0 flex items-center justify-end pr-5 rounded-2xl pointer-events-none"
      >
        <Bookmark className="w-6 h-6 text-white" />
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        style={{ x }}
        onDragEnd={handleDragEnd}
        onClick={onClick}
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
            {isSaved && (
              <Bookmark className="w-3.5 h-3.5 text-secondary shrink-0 fill-secondary mt-0.5" />
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-snug mt-0.5">{n.body}</p>
          <p className="text-[10px] text-muted-foreground/60 font-medium mt-2">{timeAgo(n.createdAt)}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function Notifications() {
  const { notifications, savedIds, unreadCount, deleteNotification, saveNotification, unsaveNotification, markAllRead } = useNotifications();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"all" | "saved">("all");
  const { t } = useT();

  const displayed = activeTab === "saved"
    ? notifications.filter(n => savedIds.has(n.id))
    : notifications;

  const handleClick = (n: typeof notifications[number]) => {
    if (n.referenceType === "school" && n.referenceId) navigate(`/schools/${n.referenceId}`);
    else if (n.referenceType === "competition" && n.referenceId) navigate(`/competitions/${n.referenceId}`);
  };

  return (
    <Layout title={t("notif_title")} showBack noBottomNav>
      <div className="min-h-screen bg-background">
        {/* Tabs */}
        <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 py-2">
          <div className="flex gap-2 mb-2">
            {(["all", "saved"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-sm font-semibold transition-all",
                  activeTab === tab
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tab === "all" ? t("notif_tab_all") : t("notif_tab_saved")}
                {tab === "saved" && savedIds.size > 0 && (
                  <span className="ml-1.5 text-[10px] bg-secondary/20 text-secondary px-1.5 rounded-full font-bold">
                    {savedIds.size}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">{t("notif_swipe_hint")}</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-primary"
              >
                <CheckCheck className="w-3.5 h-3.5" /> {t("notif_mark_read")}
              </button>
            )}
          </div>
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
                  <BellOff className="w-9 h-9 text-muted-foreground/50" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{t("notif_empty")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("notif_empty_sub")}</p>
              </motion.div>
            )}

            {displayed.map((n) => {
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
            })}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}

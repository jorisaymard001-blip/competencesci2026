import { Layout } from "@/components/Layout";
import { useNotifications } from "@/contexts/NotificationsContext";
import { Bell, BellOff, Trash2, GraduationCap, Briefcase, Info, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>, color: string, bg: string }> = {
  new_school: { icon: GraduationCap, color: "text-primary", bg: "bg-primary/10" },
  new_competition: { icon: Briefcase, color: "text-secondary", bg: "bg-secondary/10" },
  general: { icon: Info, color: "text-blue-600", bg: "bg-blue-50" },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function Notifications() {
  const { notifications, unreadCount, deleteNotification, markAllRead, isLoading } = useNotifications();
  const [, navigate] = useLocation();

  const handleNotifClick = (n: typeof notifications[number]) => {
    if (n.referenceType === "school" && n.referenceId) {
      navigate(`/schools/${n.referenceId}`);
    } else if (n.referenceType === "competition" && n.referenceId) {
      navigate(`/competitions/${n.referenceId}`);
    }
  };

  return (
    <Layout title="Notifications" showBack noBottomNav>
      <div className="min-h-screen bg-background">
        {/* Header action */}
        {notifications.length > 0 && (
          <div className="flex justify-end px-5 pt-3 pb-2">
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted"
            >
              <CheckCheck className="w-4 h-4" />
              Tout marquer comme lu
            </button>
          </div>
        )}

        {/* List */}
        <div className="px-4 pb-8 space-y-1">
          <AnimatePresence mode="popLayout">
            {notifications.length === 0 && !isLoading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center px-8"
              >
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-5">
                  <BellOff className="w-9 h-9 text-muted-foreground/50" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">Aucune notification</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Vous recevrez ici les alertes sur les nouveaux concours et écoles ajoutés.
                </p>
              </motion.div>
            )}

            {notifications.map((n) => {
              const cfg = typeConfig[n.type] || typeConfig.general;
              const Icon = cfg.icon;
              const isClickable = !!n.referenceId;

              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                  className="group relative"
                >
                  <div
                    onClick={() => isClickable && handleNotifClick(n)}
                    className={cn(
                      "flex items-start gap-3 bg-card border border-border/50 rounded-2xl p-4 shadow-sm",
                      isClickable && "cursor-pointer active:scale-[0.98] transition-transform"
                    )}
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground leading-tight mb-0.5 pr-8">
                        {n.title}
                      </p>
                      <p className="text-sm text-muted-foreground leading-snug">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground/60 font-medium mt-2">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                    className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Supprimer la notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}

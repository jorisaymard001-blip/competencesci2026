import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, ArrowRight } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useT } from "@/lib/useT";

const SHOWN_KEY = "cci_inapp_toast_last";
const COOLDOWN_MS = 30 * 60 * 1000; // show at most once every 30 minutes

/**
 * Floating in-app toast that appears once on app open if there are unread
 * notifications. Works regardless of browser Notification permission, so the
 * user always sees pending alerts in-app.
 */
export function InAppNotificationToast() {
  const { notifications, unreadCount } = useNotifications();
  const { t } = useT();
  const [, navigate] = useLocation();
  const [visible, setVisible] = useState(false);
  const shownThisMount = useRef(false);

  useEffect(() => {
    if (shownThisMount.current) return;
    if (unreadCount === 0) return;
    if (notifications.length === 0) return;

    // Don't show on the notifications page itself
    if (window.location.pathname.endsWith("/notifications")) return;

    // Cooldown
    const last = parseInt(localStorage.getItem(SHOWN_KEY) || "0", 10);
    if (Date.now() - last < COOLDOWN_MS) return;

    shownThisMount.current = true;
    localStorage.setItem(SHOWN_KEY, String(Date.now()));

    // Slight delay so it doesn't fight initial render
    const tmr = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(tmr);
  }, [unreadCount, notifications.length]);

  // Auto-dismiss after 8s
  useEffect(() => {
    if (!visible) return;
    const tmr = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(tmr);
  }, [visible]);

  const latest = notifications[0];

  return (
    <AnimatePresence>
      {visible && latest && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-1.5rem)] max-w-md"
        >
          <div className="bg-card border border-border/60 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
            <div className="flex items-start gap-3 p-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 relative">
                <Bell className="w-5 h-5 text-primary" />
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                  {t("notif_toast_title")}
                </p>
                <p className="text-sm font-bold text-foreground line-clamp-1">{latest.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{latest.body}</p>
              </div>
              <button
                onClick={() => setVisible(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground active:scale-90 transition-all shrink-0"
                aria-label={t("close")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex border-t border-border/50">
              <button
                onClick={() => setVisible(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
              >
                {t("notif_toast_dismiss")}
              </button>
              <button
                onClick={() => { setVisible(false); navigate("/notifications"); }}
                className="flex-1 py-2.5 text-xs font-bold text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1 border-l border-border/50"
              >
                {t("notif_toast_view")} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

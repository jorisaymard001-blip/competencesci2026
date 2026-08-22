import { ReactNode, useState, useEffect } from "react";
import { Link, useRoute, useLocation } from "wouter";
import {
  Home, GraduationCap, Briefcase, ChevronLeft, Bell, User,
  Compass, ClipboardList, BookOpen, MessageCircle, Info, Scale,
  Moon, Sun, Globe, Menu, X, Heart, LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useT } from "@/lib/useT";
import { InAppNotificationToast } from "./InAppNotificationToast";
import { ComparisonBar } from "./ComparisonBar";

function getStoredAvatar(): { type: "emoji" | "photo"; value: string } {
  try {
    return JSON.parse(localStorage.getItem("competences_ci_avatar") || "null") ?? { type: "emoji", value: "👨" };
  } catch { return { type: "emoji", value: "👨" }; }
}

function Avatar({ size = "sm" }: { size?: "sm" | "md" }) {
  const av = getStoredAvatar();
  const cls = size === "md" ? "w-10 h-10 text-xl" : "w-8 h-8 text-base";
  if (av.type === "photo") {
    return <img src={av.value} alt="profil" className={`${cls} rounded-full object-cover`} />;
  }
  return (
    <div className={`${cls} rounded-full bg-primary/10 flex items-center justify-center`}>
      <span className="leading-none">{av.value}</span>
    </div>
  );
}

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  noBottomNav?: boolean;
  transparentHeader?: boolean;
}

export function Layout({
  children,
  title,
  showBack,
  onBack,
  noBottomNav = false,
  transparentHeader = false,
}: LayoutProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme, language, setLanguage } = useSettings();
  const { t } = useT();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Lock scroll when drawer open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const showHeader = title || showBack || (!showBack && user);

  return (
    <div className="min-h-[100dvh] flex bg-background">

      {/* ── DRAWER (tous écrans) ──────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && user && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[60] bg-black/50"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-[70] w-[85%] max-w-xs bg-card border-r border-border/60 shadow-2xl flex flex-col"
            >
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-muted transition-colors active:scale-95"
                aria-label={t("nav_close")}
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
              <SidebarContent t={t} navigate={(p: string) => { navigate(p); setDrawerOpen(false); }}
                user={user} unreadCount={unreadCount}
                theme={theme} toggleTheme={toggleTheme} language={language} setLanguage={setLanguage} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT WRAPPER ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-[100dvh] min-w-0 overflow-x-hidden w-full">

        {/* ── HEADER ─────────────────────────────────────────────── */}
        {showHeader && (
          <header className={cn(
            "sticky top-0 z-40 w-full transition-all duration-300",
            transparentHeader
              ? "bg-gradient-to-b from-black/50 to-transparent text-white border-none"
              : "bg-background/90 backdrop-blur-xl border-b border-border/50 text-foreground"
          )}>
            <div className="grid grid-cols-[auto_1fr_auto] items-center h-14 md:h-16 px-4 md:px-6 gap-2">

              {/* LEFT: hamburger (no back) OR back arrow */}
              <div className="flex items-center justify-start min-w-[40px]">
                {showBack ? (
                  <button
                    onClick={() => onBack ? onBack() : window.history.back()}
                    className={cn(
                      "p-2 -ml-2 rounded-full transition-colors active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center",
                      transparentHeader ? "hover:bg-white/20" : "hover:bg-muted"
                    )}
                    aria-label={t("back")}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                ) : user ? (
                  <button
                    onClick={() => setDrawerOpen(true)}
                    className={cn(
                      "p-2 -ml-2 rounded-full transition-colors active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center",
                      transparentHeader ? "hover:bg-white/20" : "hover:bg-muted"
                    )}
                    aria-label={t("nav_menu")}
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                ) : null}
              </div>

              {/* CENTER: title (centered) */}
              <div className="text-center min-w-0">
                {title && (
                  <h1 className="font-display font-semibold text-base md:text-lg truncate">
                    {title}
                  </h1>
                )}
              </div>

              {/* RIGHT: bell + avatar */}
              <div className="flex items-center justify-end gap-2 min-w-[40px]">
                {user && (
                  <>
                    <button
                      onClick={() => navigate("/notifications")}
                      className="relative p-2 rounded-full hover:bg-muted transition-colors active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center"
                      aria-label={t("notif_title")}
                    >
                      <Bell className={cn("w-5 h-5", transparentHeader ? "text-white" : "text-muted-foreground")} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-background">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => navigate("/profile")}
                      className="active:scale-95 transition-transform"
                      aria-label={t("profile_title")}
                    >
                      <Avatar size="sm" />
                    </button>
                  </>
                )}
              </div>

            </div>
          </header>
        )}

        {/* ── PAGE CONTENT ───────────────────────────────────────── */}
        <main className={cn(
          "flex-1 w-full flex flex-col relative",
          !noBottomNav && "pb-20 lg:pb-6"
        )}>
          {children}
        </main>

        {/* ── BOTTOM NAV (mobile + tablet, hidden on lg+) ─────────── */}
        {!noBottomNav && <BottomNav />}
      </div>
      <ComparisonBar />

      {/* In-app notification toast (shown on app open if unread) */}
      {user && <InAppNotificationToast />}
    </div>
  );
}

// ── Sidebar/Drawer content (shared between desktop sidebar and mobile drawer) ──

function SidebarContent({
  t, navigate, user, unreadCount, theme, toggleTheme, language, setLanguage,
}: {
  t: (k: any) => string;
  navigate: (path: string) => void;
  user: { name: string; email: string; id: number };
  unreadCount: number;
  theme: string;
  toggleTheme: () => void;
  language: string;
  setLanguage: (l: any) => void;
}) {
  const { logout } = useAuth();

  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border/50">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-display font-bold text-sm text-foreground">Compétences CI</p>
          <p className="text-[10px] text-muted-foreground">{t("nav_app_subtitle")}</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="pb-1 px-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{t("nav_section_main")}</p>
        </div>
        <SidebarLink href="/" icon={Home} label={t("nav_home")} />
        <SidebarLink href="/schools" icon={GraduationCap} label={t("nav_schools")} matchPrefix />
        <SidebarLink href="/competitions" icon={Briefcase} label={t("nav_competitions")} matchPrefix />

        <div className="pt-3 pb-1 px-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{t("nav_section_tools")}</p>
        </div>
        <SidebarLink href="/orientation" icon={Compass} label={t("nav_orientation")} />
        <SidebarLink href="/candidatures" icon={ClipboardList} label={t("nav_candidatures")} />
        <SidebarLink href="/favorites" icon={Heart} label={t("nav_favorites")} />
        <SidebarLink href="/comparer" icon={Scale} label="Comparer des écoles" />
        <SidebarLink href="/documents" icon={FileText} label="Mes documents" />
        <SidebarLink href="/assistant" icon={MessageCircle} label="Assistant" />
        <SidebarLink href="/conseils" icon={BookOpen} label={t("nav_conseils")} />
        <SidebarLink href="/notifications" icon={Bell} label={t("nav_notifications")} badge={unreadCount} />

        <div className="pt-3 pb-1 px-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{t("nav_section_other")}</p>
        </div>
        <SidebarLink href="/profile" icon={User} label={t("nav_profile")} />
        <SidebarLink href="/contact" icon={MessageCircle} label={t("nav_contact")} />
        <SidebarLink href="/about" icon={Info} label={t("nav_about")} />
      </nav>

      {/* Bottom: theme + lang + user */}
      <div className="border-t border-border/50 px-3 py-4 space-y-2">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            {theme === "dark"
              ? <Moon className="w-4 h-4 text-muted-foreground" />
              : <Sun className="w-4 h-4 text-muted-foreground" />}
            <span className="text-sm text-muted-foreground font-medium">
              {theme === "dark" ? t("theme_dark") : t("theme_light")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
              className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors bg-muted px-2 py-1 rounded-md"
            >
              <Globe className="w-3 h-3" />
              {String(language).toUpperCase()}
            </button>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0",
                theme === "dark" ? "bg-primary" : "bg-muted-foreground/30"
              )}
            >
              <div className={cn(
                "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center text-[11px] leading-none",
                theme === "dark" ? "translate-x-[22px]" : "translate-x-0.5"
              )}>
                {theme === "dark" ? "🌙" : "☀️"}
              </div>
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate("/profile")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors"
        >
          <Avatar size="sm" />
          <div className="text-left min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </button>

        <button
          onClick={() => { logout(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          {t("nav_logout")}
        </button>
      </div>
    </>
  );
}

// ── Sidebar nav link ──────────────────────────────────────────────────────────

function SidebarLink({
  href,
  icon: Icon,
  label,
  matchPrefix,
  badge,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  matchPrefix?: boolean;
  badge?: number;
}) {
  const [isExact] = useRoute(href);
  const [isPrefix] = useRoute(`${href}/*?`);
  const active = matchPrefix ? isPrefix : isExact;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon
        className={cn("w-4 h-4 shrink-0", active ? "text-primary" : "text-muted-foreground")}
        strokeWidth={active ? 2.5 : 2}
      />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}

// ── Bottom nav (mobile / tablet) ─────────────────────────────────────────────

function BottomNav() {
  const [isHome] = useRoute("/");
  const [isSchools] = useRoute("/schools/*?");
  const [isCompetitions] = useRoute("/competitions/*?");
  const [isProfile] = useRoute("/profile");
  const { t } = useT();

  const navItems = [
    { href: "/", icon: Home, label: t("nav_home"), active: isHome },
    { href: "/schools", icon: GraduationCap, label: t("nav_schools"), active: isSchools },
    { href: "/competitions", icon: Briefcase, label: t("nav_competitions"), active: isCompetitions },
    { href: "/profile", icon: User, label: t("nav_profile"), active: isProfile },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="bg-background/90 backdrop-blur-xl border-t border-border/60 px-2 py-2 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.06)]">
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-14 relative rounded-xl transition-all active:scale-95 min-w-[56px]",
                item.active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.active && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon
                className="w-5 h-5 mb-0.5 relative z-10"
                strokeWidth={item.active ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium relative z-10 leading-none">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

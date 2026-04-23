import { ReactNode } from "react";
import { Link, useRoute, useLocation } from "wouter";
import {
  Home, GraduationCap, Briefcase, ChevronLeft, Bell, User,
  Compass, ClipboardList, BookOpen, MessageCircle, Info,
  Moon, Sun, Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useT } from "@/lib/useT";

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

  const showHeader = title || showBack || (!showBack && user);

  return (
    <div className="min-h-[100dvh] flex bg-background">

      {/* ── SIDEBAR (lg+) ──────────────────────────────────────────── */}
      {user && (
        <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 xl:w-72 bg-card border-r border-border/60 z-50 shadow-sm">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-border/50">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-foreground">Compétences CI</p>
              <p className="text-[10px] text-muted-foreground">L'orientation en CI</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            <SidebarLink href="/" icon={Home} label="Accueil" />
            <SidebarLink href="/schools" icon={GraduationCap} label="Écoles & Instituts" matchPrefix />
            <SidebarLink href="/competitions" icon={Briefcase} label="Concours" matchPrefix />

            <div className="pt-3 pb-1 px-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Mes outils</p>
            </div>
            <SidebarLink href="/orientation" icon={Compass} label="Trouver ma voie" />
            <SidebarLink href="/candidatures" icon={ClipboardList} label="Mes candidatures" />
            <SidebarLink href="/conseils" icon={BookOpen} label="Conseils" />

            <div className="pt-3 pb-1 px-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Autres</p>
            </div>
            <SidebarLink href="/contact" icon={MessageCircle} label="Contact" />
            <SidebarLink href="/about" icon={Info} label="À propos" />
          </nav>

          {/* Bottom: theme + lang + user */}
          <div className="border-t border-border/50 px-3 py-4 space-y-2">
            <div className="flex items-center justify-between px-3 py-2">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{theme === "dark" ? "Mode clair" : "Mode sombre"}</span>
              </button>
              <button
                onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
                className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors bg-muted px-2 py-1 rounded-md"
              >
                <Globe className="w-3 h-3" />
                {language.toUpperCase()}
              </button>
            </div>

            <button
              onClick={() => navigate("/notifications")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors"
            >
              <Avatar size="sm" />
              <div className="text-left min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </button>
          </div>
        </aside>
      )}

      {/* ── MAIN CONTENT WRAPPER ──────────────────────────────────── */}
      <div className={cn(
        "flex-1 flex flex-col min-h-[100dvh] w-full",
        user && "lg:ml-64 xl:ml-72"
      )}>

        {/* ── HEADER ─────────────────────────────────────────────── */}
        {showHeader && (
          <header className={cn(
            "sticky top-0 z-40 w-full transition-all duration-300",
            transparentHeader
              ? "bg-gradient-to-b from-black/50 to-transparent text-white border-none"
              : "bg-background/90 backdrop-blur-xl border-b border-border/50 text-foreground"
          )}>
            <div className="grid grid-cols-[auto_1fr_auto] items-center h-14 md:h-16 px-4 md:px-6 gap-2">

              {/* LEFT: back arrow on subpages, empty on home */}
              <div className="flex items-center justify-start min-w-[40px]">
                {showBack && (
                  <button
                    onClick={() => onBack ? onBack() : window.history.back()}
                    className={cn(
                      "p-2 -ml-2 rounded-full transition-colors active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center",
                      transparentHeader ? "hover:bg-white/20" : "hover:bg-muted"
                    )}
                    aria-label="Retour"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* CENTER: title (centered) */}
              <div className="text-center min-w-0">
                {title && (
                  <h1 className="font-display font-semibold text-base md:text-lg truncate">
                    {title}
                  </h1>
                )}
              </div>

              {/* RIGHT: bell + avatar (mobile/tablet only — sidebar handles desktop) */}
              <div className="flex items-center justify-end gap-2 min-w-[40px] lg:hidden">
                {user && (
                  <>
                    <button
                      onClick={() => navigate("/notifications")}
                      className="relative p-2 rounded-full hover:bg-muted transition-colors active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center"
                      aria-label="Notifications"
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
                      aria-label="Mon profil"
                    >
                      <Avatar size="sm" />
                    </button>
                  </>
                )}
              </div>

              {/* Desktop bell on subpages */}
              {user && showBack && (
                <div className="hidden lg:flex items-center justify-end col-start-3">
                  <button
                    onClick={() => navigate("/notifications")}
                    className="relative p-2 rounded-full hover:bg-muted transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-background">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                </div>
              )}
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
    </div>
  );
}

// ── Sidebar nav link ──────────────────────────────────────────────────────────

function SidebarLink({
  href,
  icon: Icon,
  label,
  matchPrefix,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  matchPrefix?: boolean;
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
      {label}
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

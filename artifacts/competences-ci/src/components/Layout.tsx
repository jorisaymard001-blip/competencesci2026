import { ReactNode } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { Home, GraduationCap, Briefcase, ChevronLeft, Bell, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useT } from "@/lib/useT";

function getStoredAvatar(): { type: "emoji" | "photo"; value: string } {
  try {
    return JSON.parse(localStorage.getItem("competences_ci_avatar") || "null") ?? { type: "emoji", value: "👨" };
  } catch { return { type: "emoji", value: "👨" }; }
}

function HeaderAvatar() {
  const av = getStoredAvatar();
  if (av.type === "photo") {
    return <img src={av.value} alt="profil" className="w-7 h-7 rounded-full object-cover" />;
  }
  return <span className="text-base leading-none">{av.value}</span>;
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

  const showHeader = title || showBack || (!showBack && user);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative w-full max-w-md mx-auto shadow-2xl overflow-hidden sm:border-x sm:border-border/50">

      {showHeader && (
        <header
          className={cn(
            "sticky top-0 z-40 w-full transition-all duration-300",
            transparentHeader
              ? "bg-gradient-to-b from-black/50 to-transparent text-white border-none"
              : "bg-background/80 backdrop-blur-xl border-b border-border/50 text-foreground"
          )}
        >
          <div className="flex items-center h-16 px-4">
            {showBack && (
              <button
                onClick={() => onBack ? onBack() : window.history.back()}
                className={cn(
                  "p-2 -ml-2 rounded-full transition-colors active:scale-95",
                  transparentHeader ? "hover:bg-white/20" : "hover:bg-muted"
                )}
                aria-label="Retour"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {title && (
              <h1 className={cn(
                "font-display font-semibold text-lg flex-1 truncate",
                showBack ? "ml-2" : "ml-0"
              )}>
                {title}
              </h1>
            )}

            {/* Spacer for pages without title */}
            {!title && !showBack && <div className="flex-1" />}

            {/* Right side: notification bell + profile */}
            {user && !showBack && (
              <div className="ml-auto flex items-center gap-2">
                {/* Bell */}
                <button
                  onClick={() => navigate("/notifications")}
                  className="relative p-2 rounded-full hover:bg-muted transition-colors active:scale-95"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Profile avatar + name */}
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2 bg-muted/60 hover:bg-muted rounded-full pl-1.5 pr-3 py-1.5 transition-colors active:scale-95"
                  aria-label="Mon profil"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    <HeaderAvatar />
                  </div>
                  <span className="text-xs font-semibold text-foreground max-w-[80px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      <main className={cn(
        "flex-1 w-full flex flex-col relative",
        !noBottomNav && "pb-20"
      )}>
        {children}
      </main>

      {!noBottomNav && <BottomNav />}
    </div>
  );
}

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
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-md bg-background/90 backdrop-blur-xl border-t border-border/60 px-2 py-2 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pointer-events-auto">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-14 relative rounded-xl transition-all active:scale-95",
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
                className={cn("w-5 h-5 mb-0.5 relative z-10")}
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

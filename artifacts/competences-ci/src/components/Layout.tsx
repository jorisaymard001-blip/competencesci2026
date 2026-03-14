import { ReactNode } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { Home, GraduationCap, Briefcase, ChevronLeft, Heart, MessageCircle, LogOut, User, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useNotifications } from "@/contexts/NotificationsContext";

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
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { unreadCount } = useNotifications();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative w-full max-w-md mx-auto shadow-2xl overflow-hidden sm:border-x sm:border-border/50">

      {/* Header */}
      {(title || showBack || (!showBack && user)) && (
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

            {!showBack && user && (
              <div className="ml-auto flex items-center gap-1">
                {/* Notification bell */}
                <button
                  onClick={() => navigate("/notifications")}
                  className="relative p-2 rounded-full hover:bg-muted transition-colors active:scale-95"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-1.5 bg-muted/60 rounded-full px-3 py-1.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground max-w-[80px] truncate">{user.name.split(" ")[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors active:scale-95"
                  aria-label="Déconnexion"
                  title="Se déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 w-full flex flex-col relative",
        !noBottomNav && "pb-20"
      )}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {!noBottomNav && <BottomNav />}
    </div>
  );
}

function BottomNav() {
  const [isHome] = useRoute("/");
  const [isSchools] = useRoute("/schools/*?");
  const [isCompetitions] = useRoute("/competitions/*?");
  const [isFavorites] = useRoute("/favorites");
  const [isMessages] = useRoute("/messages");

  const { favoriteSchools, favoriteCompetitions } = useFavorites();
  const totalFavs = favoriteSchools.length + favoriteCompetitions.length;

  const navItems = [
    { href: "/", icon: Home, label: "Accueil", active: isHome },
    { href: "/schools", icon: GraduationCap, label: "Écoles", active: isSchools },
    { href: "/competitions", icon: Briefcase, label: "Concours", active: isCompetitions },
    { href: "/favorites", icon: Heart, label: "Favoris", active: isFavorites, badge: totalFavs },
    { href: "/messages", icon: MessageCircle, label: "Contact", active: isMessages },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-md bg-background/90 backdrop-blur-xl border-t border-border/60 px-2 py-2 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pointer-events-auto">
        <div className="flex justify-between items-center">
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
              <div className="relative">
                <item.icon
                  className={cn("w-5 h-5 mb-0.5 relative z-10", item.active && "fill-primary/20")}
                  strokeWidth={item.active ? 2.5 : 2}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full z-20">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-medium relative z-10 leading-none">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

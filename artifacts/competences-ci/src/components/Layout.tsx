import { ReactNode } from "react";
import { Link, useRoute } from "wouter";
import { Home, GraduationCap, Briefcase, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
  transparentHeader = false
}: LayoutProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative w-full max-w-md mx-auto shadow-2xl overflow-hidden sm:border-x sm:border-border/50">
      
      {/* Header */}
      {(title || showBack) && (
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
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 w-full flex flex-col relative",
        !noBottomNav && "pb-20" // space for bottom nav
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

  const navItems = [
    { href: "/", icon: Home, label: "Accueil", active: isHome },
    { href: "/schools", icon: GraduationCap, label: "Écoles", active: isSchools },
    { href: "/competitions", icon: Briefcase, label: "Concours", active: isCompetitions },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-md bg-background/90 backdrop-blur-xl border-t border-border/60 px-6 py-2 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pointer-events-auto">
        <div className="flex justify-between items-center">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-14 relative rounded-xl transition-all active:scale-95",
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
              <item.icon className={cn("w-6 h-6 mb-1 relative z-10", item.active && "fill-primary/20")} strokeWidth={item.active ? 2.5 : 2} />
              <span className="text-[10px] font-medium relative z-10">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

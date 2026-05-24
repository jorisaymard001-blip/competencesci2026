import { Link } from "wouter";
import { MapPin, Briefcase, Calendar, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { cn, formatDate } from "@/lib/utils";
import type { School, Competition } from "@workspace/api-client-react";

// ── SCHOOL CARD ─────────────────────────────────────────────────────────────

export function SchoolCard({ school, index = 0 }: { school: School; index?: number }) {
  const isPublic = school.type === "public";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3), ease: "easeOut" }}
    >
      <Link
        href={`/schools/${school.id}`}
        className={cn(
          "group block bg-card rounded-2xl p-4 border shadow-sm",
          "hover:shadow-md transition-all duration-200 active:scale-[0.97]",
          isPublic
            ? "border-l-4 border-l-green-500 border-border/50 hover:border-l-green-400"
            : "border-l-4 border-l-primary border-border/50 hover:border-l-primary/70"
        )}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-3">
            <h3 className="font-black text-base text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {school.name}
            </h3>
            <div className="flex items-center text-muted-foreground text-xs mt-1.5 gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{school.city}</span>
            </div>
          </div>
          <span className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0",
            isPublic
              ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
              : "bg-primary/10 text-primary border border-primary/20"
          )}>
            {isPublic ? "Public" : "Privé"}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {school.domains.slice(0, 3).map(domain => (
            <span key={domain} className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
              {domain}
            </span>
          ))}
          {school.domains.length > 3 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
              +{school.domains.length - 3}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ── SCHOOL CARD SKELETON ─────────────────────────────────────────────────────

export function SchoolCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border/50 border-l-4 border-l-border animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="flex-1 pr-3">
          <div className="h-5 w-3/4 bg-muted rounded-lg mb-2" />
          <div className="h-3.5 w-24 bg-muted rounded-lg" />
        </div>
        <div className="h-6 w-14 bg-muted rounded-full" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-20 bg-muted rounded-full" />
        <div className="h-5 w-24 bg-muted rounded-full" />
        <div className="h-5 w-16 bg-muted rounded-full" />
      </div>
    </div>
  );
}

// ── COMPETITION CARD ─────────────────────────────────────────────────────────

export function CompetitionCard({ competition, index = 0 }: { competition: Competition; index?: number }) {
  const statusConfig = {
    open: {
      label: "🟢 Ouvert",
      border: "border-l-green-500",
      badgeCls: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    },
    closed: {
      label: "🔴 Fermé",
      border: "border-l-red-500",
      badgeCls: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    },
    upcoming: {
      label: "🔵 À venir",
      border: "border-l-blue-500",
      badgeCls: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    },
  };

  const status = statusConfig[competition.status as keyof typeof statusConfig] || statusConfig.closed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3), ease: "easeOut" }}
    >
      <Link
        href={`/competitions/${competition.id}`}
        className={cn(
          "group block bg-card rounded-2xl p-4 border border-border/50 shadow-sm",
          "border-l-4 hover:shadow-md transition-all duration-200 active:scale-[0.97]",
          status.border
        )}
      >
        <div className="flex justify-between items-start mb-3">
          <span className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
            status.badgeCls
          )}>
            {status.label}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground text-xs font-medium bg-muted px-2.5 py-1 rounded-full">
            <Briefcase className="w-3 h-3" />
            {competition.positions} postes
          </span>
        </div>

        <h3 className="font-black text-base text-foreground group-hover:text-secondary transition-colors leading-tight mb-1.5">
          {competition.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-4">{competition.ministry}</p>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-primary/70" />
            <span className="truncate max-w-[140px]">{competition.diploma}</span>
          </div>
          {(competition.openDate || competition.closeDate) && (
            <div className="flex items-center text-xs font-medium gap-1">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              {competition.status === "open" ? (
                <span className="text-green-600 dark:text-green-400">Jusqu'au {formatDate(competition.closeDate)}</span>
              ) : competition.status === "upcoming" ? (
                <span className="text-blue-600 dark:text-blue-400">Dès le {formatDate(competition.openDate)}</span>
              ) : (
                <span className="text-muted-foreground">Clôturé</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ── COMPETITION CARD SKELETON ────────────────────────────────────────────────

export function CompetitionCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border/50 border-l-4 border-l-border animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-5 w-20 bg-muted rounded-full" />
        <div className="h-5 w-20 bg-muted rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-muted rounded-lg mb-2" />
      <div className="h-4 w-1/2 bg-muted rounded-lg mb-4" />
      <div className="pt-3 border-t border-border/50 flex justify-between">
        <div className="h-3.5 w-24 bg-muted rounded-lg" />
        <div className="h-3.5 w-28 bg-muted rounded-lg" />
      </div>
    </div>
  );
}

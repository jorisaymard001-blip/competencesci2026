import { Link } from "wouter";
import { MapPin, Briefcase, Calendar, GraduationCap, Scale } from "lucide-react";
import { motion } from "framer-motion";
import { cn, formatDate } from "@/lib/utils";
import type { School, Competition } from "@workspace/api-client-react";
import { getSchoolImage } from "@/lib/school-images";
import { CompetitionCover } from "@/components/CompetitionCover";
import { useComparison } from "@/contexts/ComparisonContext";
import { VerifiedBadge } from "@/components/VerifiedBadge";

// ── SCHOOL CARD ─────────────────────────────────────────────────────────────

export function SchoolCard({ school, index = 0 }: { school: School; index?: number }) {
  const isPublic = school.type === "public";
  const imageUrl = getSchoolImage(school);
  const { add, remove, isSelected } = useComparison();
  const selected = isSelected(school.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3), ease: "easeOut" }}
    >
      <Link
        href={`/schools/${school.id}`}
        className="group block bg-card rounded-2xl border border-border/50 shadow-sm hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg transition-all duration-200 active:scale-[0.97] overflow-hidden"
      >
        <div className="school-card-art relative h-40 overflow-hidden flex items-center justify-center">
          <img
            src={imageUrl}
            alt={school.name}
            className="w-full h-full object-contain p-4"
            onError={e => { (e.currentTarget as HTMLImageElement).src = "/images/establishments/placeholder.svg"; }}
            loading="lazy"
          />
          <span className={cn(
            "absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow",
            isPublic ? "bg-green-500/90 text-white" : "bg-orange-500/90 text-white"
          )}>
            {isPublic ? "Public" : "Privé"}
          </span>
        </div>

        <div className="p-4">
           <div className="flex items-start justify-between gap-2 mb-1.5">
             <h3 className="font-black text-sm text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">{school.name}</h3>
             <VerifiedBadge item={school as any} />
           </div>
          <div className="flex items-center text-muted-foreground text-xs mb-3 gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{school.city}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {school.domains.slice(0, 2).map((domain: string) => (
              <span key={domain} className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
                {domain}
              </span>
            ))}
            {school.domains.length > 2 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                +{school.domains.length - 2}
              </span>
            )}
          </div>
          <button
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              if (selected) remove(school.id);
              else add(school);
            }}
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors",
              selected ? "border-primary bg-primary text-white" : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            )}
          >
            <Scale className="w-3.5 h-3.5" />
            {selected ? "Sélectionnée" : "Comparer"}
          </button>
        </div>
      </Link>
    </motion.div>
  );
}

// ── SCHOOL CARD SKELETON ─────────────────────────────────────────────────────

export function SchoolCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden animate-pulse">
      <div className="h-40 bg-muted" />
      <div className="p-4">
        <div className="h-4 w-3/4 bg-muted rounded-lg mb-2" />
        <div className="h-3 w-24 bg-muted rounded-lg mb-3" />
        <div className="flex gap-1.5">
          <div className="h-5 w-20 bg-muted rounded-full" />
          <div className="h-5 w-24 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ── COMPETITION CARD ─────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  open: {
    label: "🟢 Ouvert",
    badgeCls: "bg-green-500/80 text-white",
    accentCls: "ring-green-500/30",
  },
  closed: {
    label: "🔴 Fermé",
    badgeCls: "bg-red-500/80 text-white",
    accentCls: "ring-red-500/20",
  },
  upcoming: {
    label: "🔵 À venir",
    badgeCls: "bg-blue-500/80 text-white",
    accentCls: "ring-blue-500/30",
  },
} as const;

export function CompetitionCard({ competition, index = 0 }: { competition: Competition; index?: number }) {
  const statusKey = (competition.status as keyof typeof STATUS_CONFIG) in STATUS_CONFIG
    ? (competition.status as keyof typeof STATUS_CONFIG)
    : "closed";
  const status = STATUS_CONFIG[statusKey];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3), ease: "easeOut" }}
    >
      <Link
        href={`/competitions/${competition.id}`}
        className={cn(
          "group block bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-lg",
          "transition-all duration-200 active:scale-[0.97] hover:-translate-y-1 overflow-hidden",
          "ring-1 ring-transparent hover:ring-1",
          status.accentCls
        )}
      >
        {/* Image header */}
        <div className="relative h-28 overflow-hidden bg-muted">
          <CompetitionCover
            competition={competition}
            className="group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Status badge */}
          <span className={cn(
            "absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-sm",
            status.badgeCls
          )}>
            {status.label}
          </span>

          {/* Ministry at bottom of image */}
          <div className="absolute bottom-0 inset-x-0 px-3 pb-2">
            <p className="text-white/85 text-[11px] font-medium line-clamp-2 leading-tight">{competition.ministry}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5">
           <div className="flex items-start justify-between gap-2 mb-3">
             <h3 className="font-black text-sm text-foreground leading-tight line-clamp-2 group-hover:text-secondary transition-colors">{competition.title}</h3>
             <VerifiedBadge item={competition as any} />
           </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-border/50">
            <div className="flex items-center text-xs text-muted-foreground gap-1 min-w-0">
              <GraduationCap className="w-3 h-3 text-primary/70 shrink-0" />
              <span className="truncate max-w-[110px]">{competition.diploma}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {(competition.openDate || competition.closeDate) && (
                <div className="flex items-center text-xs font-medium gap-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  {competition.status === "open" ? (
                    <span className="text-green-600 dark:text-green-400 text-[11px]">{formatDate(competition.closeDate)}</span>
                  ) : competition.status === "upcoming" ? (
                    <span className="text-blue-600 dark:text-blue-400 text-[11px]">{formatDate(competition.openDate)}</span>
                  ) : null}
                </div>
              )}
              <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full text-[11px] font-bold text-foreground">
                <Briefcase className="w-3 h-3 text-primary" />
                {competition.positions}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── COMPETITION CARD SKELETON ────────────────────────────────────────────────

export function CompetitionCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden animate-pulse">
      <div className="h-28 bg-muted" />
      <div className="p-3.5">
        <div className="h-4 w-3/4 bg-muted rounded-lg mb-2" />
        <div className="h-3 w-1/2 bg-muted rounded-lg mb-3" />
        <div className="pt-2.5 border-t border-border/50 flex justify-between">
          <div className="h-3.5 w-24 bg-muted rounded-lg" />
          <div className="h-3.5 w-20 bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  );
}

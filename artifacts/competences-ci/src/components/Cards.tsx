import { Link } from "wouter";
import { Building2, MapPin, GraduationCap, Briefcase, Calendar, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn, formatDate } from "@/lib/utils";
import type { School, Competition } from "@workspace/api-client-react";

// --- SCHOOL CARD ---

export function SchoolCard({ school, index = 0 }: { school: School, index?: number }) {
  const isPublic = school.type === "public";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
    >
      <Link 
        href={`/schools/${school.id}`}
        className="group block bg-card rounded-2xl p-5 border border-border/60 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 active:scale-[0.98]"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-4">
            <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">
              {school.name}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm mt-1.5">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              <span>{school.city}</span>
            </div>
          </div>
          
          <div className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
            isPublic 
              ? "bg-secondary/10 text-secondary" 
              : "bg-primary/10 text-primary"
          )}>
            {isPublic ? "Public" : "Privé"}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {school.domains.slice(0, 3).map(domain => (
            <span key={domain} className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium">
              {domain}
            </span>
          ))}
          {school.domains.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium">
              +{school.domains.length - 3}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// --- COMPETITION CARD ---

export function CompetitionCard({ competition, index = 0 }: { competition: Competition, index?: number }) {
  
  const statusConfig = {
    open: { label: "Ouvert", class: "bg-status-open-bg text-status-open border-status-open/20" },
    closed: { label: "Fermé", class: "bg-status-closed-bg text-status-closed border-status-closed/20" },
    upcoming: { label: "À venir", class: "bg-status-upcoming-bg text-status-upcoming border-status-upcoming/20" }
  };
  
  const status = statusConfig[competition.status as keyof typeof statusConfig] || statusConfig.closed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
    >
      <Link 
        href={`/competitions/${competition.id}`}
        className="group block bg-card rounded-2xl p-5 border border-border/60 shadow-sm hover:shadow-md hover:border-secondary/30 transition-all duration-300 active:scale-[0.98]"
      >
        <div className="flex justify-between items-start mb-3">
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.class}`}>
            {status.label}
          </div>
          <div className="flex items-center text-muted-foreground text-xs font-medium bg-muted px-2 py-1 rounded-md">
            <Briefcase className="w-3 h-3 mr-1.5" />
            {competition.positions} postes
          </div>
        </div>
        
        <h3 className="font-display font-bold text-lg text-foreground group-hover:text-secondary transition-colors leading-tight mb-2">
          {competition.title}
        </h3>
        
        <div className="text-sm font-medium text-muted-foreground mb-4">
          {competition.ministry}
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center text-sm text-muted-foreground">
            <GraduationCap className="w-4 h-4 mr-1.5 text-primary/70" />
            <span className="truncate max-w-[150px]">{competition.diploma}</span>
          </div>
          
          {(competition.openDate || competition.closeDate) && (
            <div className="flex items-center text-xs text-muted-foreground font-medium">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              {competition.status === 'open' ? (
                <span className="text-status-open">Jusqu'au {formatDate(competition.closeDate)}</span>
              ) : competition.status === 'upcoming' ? (
                <span className="text-status-upcoming">Dès le {formatDate(competition.openDate)}</span>
              ) : (
                <span>Clôturé</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

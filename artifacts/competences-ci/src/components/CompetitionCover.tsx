/**
 * CompetitionCover — Rendu visuel d'un concours.
 * Si imageUrl est défini en DB → affiche l'image.
 * Sinon → placeholder stylisé selon l'organisme (aucune dépendance externe).
 */
import { cn } from "@/lib/utils";
import {
  Shield, Building2, BookOpen, Heart, Scale,
  Users, HardHat, Medal, Landmark, Package,
  GraduationCap, Trophy, Sprout,
} from "lucide-react";

type CompEntry = {
  title: string;
  ministry?: string | null;
  imageUrl?: string | null;
};

type CoverConfig = {
  from: string;
  to: string;
  accent: string;
  abbr: string;
  Icon: React.ElementType;
};

function getConfig(comp: CompEntry): CoverConfig {
  const text = `${comp.title} ${comp.ministry ?? ""}`.toLowerCase();

  if (text.includes("police") || text.includes("gardien de la paix"))
    return { from: "#001A57", to: "#003087", accent: "#C8102E", abbr: "DGPN", Icon: Shield };

  if (text.includes("école nationale d'administration") || text.includes("ena"))
    return { from: "#1a3a5c", to: "#2a5278", accent: "#c9a227", abbr: "ENA", Icon: Building2 };

  if (text.includes("douane"))
    return { from: "#1a237e", to: "#283593", accent: "#ffd600", abbr: "DGD", Icon: Package };

  if (
    text.includes("école normale supérieure") ||
    text.includes("ens ") ||
    text.includes("enseignant") ||
    text.includes("professeur")
  )
    return { from: "#004d40", to: "#00695c", accent: "#80cbc4", abbr: "ENS", Icon: BookOpen };

  if (
    text.includes("infas") ||
    text.includes("infirm") ||
    text.includes("sage-femme") ||
    text.includes("sages-femmes")
  )
    return { from: "#006064", to: "#00838f", accent: "#80deea", abbr: "INFAS", Icon: Heart };

  if (text.includes("impôt") || text.includes("fiscal") || text.includes("dgi"))
    return { from: "#1b5e20", to: "#2e7d32", accent: "#a5d6a7", abbr: "DGI", Icon: Landmark };

  if (text.includes("pénitentiaire") || text.includes("infj") || text.includes("garde"))
    return { from: "#b71c1c", to: "#c62828", accent: "#ffcdd2", abbr: "INFJ", Icon: Scale };

  if (text.includes("justice") && !text.includes("pénitentiaire"))
    return { from: "#880e4f", to: "#ad1457", accent: "#f48fb1", abbr: "MJ", Icon: Scale };

  if (
    text.includes("infrastructure") ||
    text.includes("travaux publics") ||
    text.includes("génie civil") ||
    text.includes("technicien supérieur")
  )
    return { from: "#37474f", to: "#455a64", accent: "#ff8f00", abbr: "MIEF", Icon: HardHat };

  if (text.includes("injs") || text.includes("jeunesse et des sports"))
    return { from: "#1b5e20", to: "#33691e", accent: "#f9a825", abbr: "INJS", Icon: Medal };

  if (text.includes("social") || text.includes("solidarité") || text.includes("assistant"))
    return { from: "#4a148c", to: "#6a1b9a", accent: "#ce93d8", abbr: "MAS", Icon: Users };

  if (
    text.includes("administrateur civil") ||
    text.includes("fonction publique") ||
    text.includes("memfpma")
  )
    return { from: "#283593", to: "#303f9f", accent: "#90caf9", abbr: "FP", Icon: Building2 };

  if (text.includes("agriculture") || text.includes("génie rural") || text.includes("agronomie"))
    return { from: "#33691e", to: "#558b2f", accent: "#dce775", abbr: "MINADER", Icon: Sprout };

  if (text.includes("enseignement supérieur") || text.includes("université"))
    return { from: "#01579b", to: "#0277bd", accent: "#81d4fa", abbr: "MESRS", Icon: GraduationCap };

  return { from: "#263238", to: "#37474f", accent: "#90a4ae", abbr: "CI", Icon: Trophy };
}

interface CompetitionCoverProps {
  competition: CompEntry;
  className?: string;
  /** Override the fallback image used when imageUrl fails. */
  fallbackUrl?: string;
}

export function CompetitionCover({ competition, className, fallbackUrl }: CompetitionCoverProps) {
  // If a real image URL is stored in DB, prefer it
  if (competition.imageUrl) {
    return (
      <img
        src={competition.imageUrl}
        alt={competition.title}
        className={cn("w-full h-full object-cover", className)}
        onError={e => {
          const img = e.currentTarget as HTMLImageElement;
          img.style.display = "none";
        }}
        loading="lazy"
      />
    );
  }

  const { from, to, accent, abbr, Icon } = getConfig(competition);

  return (
    <div
      className={cn("w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none", className)}
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
      aria-hidden="true"
    >
      {/* Decorative circles */}
      <div
        className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20"
        style={{ background: accent }}
      />
      <div
        className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full opacity-10"
        style={{ background: accent }}
      />
      {/* Thin accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-60"
        style={{ background: accent }}
      />

      {/* Icon */}
      <Icon
        className="mb-1.5 relative z-10 opacity-60"
        style={{ color: accent, width: 22, height: 22 }}
      />

      {/* Abbreviation */}
      <span
        className="relative z-10 font-black tracking-tight leading-none"
        style={{ color: "#ffffff", fontSize: "clamp(14px, 4vw, 20px)", opacity: 0.95 }}
      >
        {abbr}
      </span>
    </div>
  );
}

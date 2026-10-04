import { useRoute } from "wouter";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useGetCompetition } from "@workspace/api-client-react";
import { Loader2, Calendar, MapPin, Briefcase, GraduationCap, FileText, CheckCircle2, Globe, Phone, Heart, ClipboardList, ListChecks, UserCheck, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/utils";
import { useFavorites } from "@/contexts/FavoritesContext";
import { getCompetitionInfo } from "@/lib/competition-info";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/useT";
import { CompetitionCover } from "@/components/CompetitionCover";
import { useAuth } from "@/contexts/AuthContext";
import { AuthRequiredModal } from "@/components/AuthRequiredModal";
import { ShareButtons } from "@/components/ShareButtons";
import { VerifiedBadge } from "@/components/VerifiedBadge";

export default function CompetitionDetail() {
  const [, params] = useRoute("/competitions/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const { t, language } = useT();

  const { data: comp, isLoading, error } = useGetCompetition(id, {
    query: { enabled: !!id }
  });

  const { isCompetitionFav, toggleCompetition } = useFavorites();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isFav = comp ? isCompetitionFav(comp.id) : false;
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const toggleSection = (s: string) => setExpandedSection(v => v === s ? null : s);

  if (isLoading) {
    return (
      <Layout showBack transparentHeader>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="w-10 h-10 animate-spin text-secondary mb-4" />
        </div>
      </Layout>
    );
  }

  if (error || !comp) {
    return <Layout showBack title={t("comp_error")}><div className="p-6 text-center">{t("comp_error")}</div></Layout>;
  }

  const statusConfig = {
    open: { label: t("competitions_open"), color: "text-green-700", bg: "bg-green-100", border: "border-green-200" },
    closed: { label: t("competitions_closed"), color: "text-red-700", bg: "bg-red-100", border: "border-red-200" },
    upcoming: { label: t("competitions_upcoming"), color: "text-blue-700", bg: "bg-blue-100", border: "border-blue-200" },
  };

  const status = statusConfig[comp.status as keyof typeof statusConfig] || statusConfig.closed;

  const frBadge = language === "en" ? (
    <span className="ml-2 text-[10px] font-medium text-muted-foreground bg-white/20 px-1.5 py-0.5 rounded">
      {t("comp_content_fr")}
    </span>
  ) : null;

  const frBadgeLight = language === "en" ? (
    <span className="ml-2 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
      {t("comp_content_fr")}
    </span>
  ) : null;

  return (
    <Layout showBack noBottomNav>
      <div className="bg-background min-h-screen max-w-4xl mx-auto w-full">

        {/* Header Block */}
        <div className={cn(
          "text-white px-5 md:px-8 pt-8 pb-12 rounded-b-[40px] relative overflow-hidden",
          comp.status === "open"
            ? "bg-gradient-to-br from-green-900 via-slate-900 to-slate-950"
            : comp.status === "upcoming"
            ? "bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950"
            : "bg-gradient-to-br from-slate-700 via-slate-900 to-slate-950"
        )}>
          {/* Background cover: real image if available, otherwise placeholder overlay */}
          {comp.imageUrl ? (
            <img
              src={comp.imageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity pointer-events-none"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay">
              <CompetitionCover competition={comp} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${status.bg} ${status.color} ${status.border}`}>
                {status.label}
              </div>
              <button
                onClick={() => user ? toggleCompetition(comp.id) : setShowAuthModal(true)}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center border transition-all active:scale-90",
                  isFav
                    ? "bg-red-500/20 border-red-400/30 text-red-300"
                    : "bg-white/10 border-white/20 text-white/60 hover:text-red-300"
                )}
                aria-label={isFav ? t("remove_favorite") : t("add_favorite")}
              >
                <Heart className={cn("w-4 h-4 transition-all", isFav && "fill-red-400 text-red-400")} />
              </button>
            </div>

            <h1 className="font-black text-2xl sm:text-3xl leading-tight mb-4 text-balance">
              {comp.title} <VerifiedBadge item={comp as any} />
            </h1>

            <div className="text-white/80 text-sm font-medium mb-6">
              {t("comp_ministry_label")} : <span className="text-white">{comp.ministry}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
                <Calendar className="w-5 h-5 mb-2 text-secondary" />
                <div className="text-[10px] text-white/60 uppercase font-bold tracking-wider mb-1">{t("comp_open_date")}</div>
                <div className="text-sm font-semibold">{formatDate(comp.openDate)}</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
                <Calendar className="w-5 h-5 mb-2 text-orange-400" />
                <div className="text-[10px] text-white/60 uppercase font-bold tracking-wider mb-1">{t("comp_close_date")}</div>
                <div className="text-sm font-semibold">{formatDate(comp.closeDate)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="px-6 -mt-6 relative z-20">
          <div className="bg-card rounded-2xl p-4 shadow-xl shadow-black/5 border border-border/60 flex justify-around">
            <div className="flex flex-col items-center text-center px-2">
              <Briefcase className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-xl font-display font-bold text-foreground">{comp.positions}</span>
              <span className="text-[10px] font-medium uppercase text-muted-foreground">{t("comp_positions_label")}</span>
            </div>
            <div className="w-px bg-border/60" />
            <div className="flex flex-col items-center text-center px-2">
              <GraduationCap className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-sm font-display font-bold text-foreground mt-1 max-w-[100px] truncate">{comp.diploma}</span>
              <span className="text-[10px] font-medium uppercase text-muted-foreground mt-0.5">{t("comp_level")}</span>
            </div>
            <div className="w-px bg-border/60" />
            <div className="flex flex-col items-center text-center px-2">
              <MapPin className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-sm font-display font-bold text-foreground mt-1">{comp.city}</span>
              <span className="text-[10px] font-medium uppercase text-muted-foreground mt-0.5">{t("comp_location")}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 space-y-8">

          <section>
            <h2 className="font-display text-lg font-bold mb-3 flex items-center">
              {t("comp_description")} {frBadgeLight}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {comp.description}
            </p>
          </section>

          {comp.requirements && comp.requirements.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-secondary" /> {t("comp_requirements")} {frBadgeLight}
              </h2>
              <ul className="space-y-3">
                {comp.requirements.map((req, i) => (
                  <li key={i} className="flex items-start text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 mr-3 text-secondary shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {comp.process && comp.process.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold mb-4 flex items-center">
                {t("comp_selection")} {frBadgeLight}
              </h2>
              <div className="relative pl-4 border-l-2 border-muted">
                {comp.process.map((step, i) => (
                  <div key={i} className="mb-6 relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-secondary ring-4 ring-background" />
                    <h3 className="text-sm font-bold text-foreground mb-1">{t("comp_step")} {i + 1}</h3>
                    <p className="text-sm text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(comp.website || comp.contact) && (
            <section className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl p-5">
              <h2 className="font-display text-base font-bold mb-3 text-green-900 dark:text-green-300">{t("comp_more_info")}</h2>
              <div className="space-y-3">
                {comp.website && (
                  <a
                    href={comp.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!comp.website) {
                        e.preventDefault();
                        alert("Le lien d'inscription sera bientôt disponible.");
                      }
                    }}
                    className="flex items-center text-sm font-medium text-green-800 dark:text-green-400 hover:text-green-600"
                  >
                    <Globe className="w-4 h-4 mr-3" /> {t("comp_register_online")}
                  </a>
                )}
                {comp.contact && (
                  <a href={`mailto:${comp.contact}`} className="flex items-center text-sm font-medium text-green-800 dark:text-green-400 hover:text-green-600">
                    <Phone className="w-4 h-4 mr-3" /> {t("comp_contact_label")}: {comp.contact}
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Practical Info */}
          {(() => {
            const info = getCompetitionInfo(comp.title);
            const sections = [
              { id: "docs", label: t("comp_docs"), icon: ClipboardList, color: "text-primary", data: info.documents },
              { id: "steps", label: t("comp_steps_label"), icon: ListChecks, color: "text-secondary", data: info.steps },
              { id: "conditions", label: t("comp_conditions"), icon: UserCheck, color: "text-blue-600", data: info.conditions },
            ];
            return (
              <section>
                <h2 className="font-display text-lg font-bold mb-3 flex items-center">
                  {t("comp_practical")} {frBadgeLight}
                </h2>
                <div className="space-y-2">
                  {sections.map(sec => {
                    const Icon = sec.icon;
                    const isOpen = expandedSection === sec.id;
                    return (
                      <div key={sec.id} className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                        <button
                          onClick={() => toggleSection(sec.id)}
                          className="w-full flex items-center justify-between px-4 py-3.5 active:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${sec.color}`} />
                            <span className="font-semibold text-sm text-foreground">{sec.label}</span>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{sec.data.length}</span>
                          </div>
                          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                              <ul className="px-4 pb-4 space-y-2">
                                {sec.data.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                                    <span className="leading-relaxed">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })()}

          {/* Favorite toggle CTA */}
          <button
            onClick={() => user ? toggleCompetition(comp.id) : setShowAuthModal(true)}
            className={cn(
              "w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all active:scale-[0.98]",
              isFav
                ? "border-red-200 bg-red-50 text-red-500"
                : "border-border bg-card text-muted-foreground hover:border-red-200 hover:text-red-400"
            )}
          >
            <Heart className={cn("w-5 h-5", isFav && "fill-red-500 text-red-500")} />
            {isFav ? t("remove_favorite") : t("add_favorite")}
          </button>

        </div>
        <div className="px-6 pb-5">
          <ShareButtons title={`Concours : ${comp.title}`} />
        </div>

        {/* Apply Button */}
        {comp.status === 'open' && (
          <div className="px-6 pb-8">
            <a
              href={comp.website || "https://www.fonctionpublique.gouv.ci"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!comp.website) {
                  e.preventDefault();
                  alert("Le lien d'inscription sera bientôt disponible. Consultez fonctionpublique.gouv.ci pour plus d'informations.");
                }
              }}
              className="block w-full py-4 rounded-2xl bg-secondary text-white font-bold text-center shadow-lg shadow-secondary/30 active:scale-[0.98] transition-all"
            >
              {comp.website ? t("register_btn_label") : t("register_official")}
            </a>
          </div>
        )}

      </div>
      <AuthRequiredModal open={showAuthModal} onClose={() => setShowAuthModal(false)} action="enregistrer ce concours" />
    </Layout>
  );
}

import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, GraduationCap, Briefcase, BookOpen, Clock, Trash2, ArrowRight, Newspaper } from "lucide-react";
import { useListSchools, useListCompetitions, useListDiplomas } from "@workspace/api-client-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useT } from "@/lib/useT";
import { cn } from "@/lib/utils";
import { articles } from "@/lib/articles";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();
  const { searchHistory, addSearch, clearSearchHistory } = useSettings();
  const { t } = useT();

  const { data: schools = [] } = useListSchools();
  const { data: competitions = [] } = useListCompetitions();
  const { data: diplomas = [] } = useListDiplomas();

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  const q = query.trim().toLowerCase();

  const matchedSchools = q.length < 2 ? [] : schools.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.city.toLowerCase().includes(q) ||
    (s.domains || []).some((d: string) => d.toLowerCase().includes(q))
  ).slice(0, 5);

  const matchedCompetitions = q.length < 2 ? [] : competitions.filter(c =>
    c.title.toLowerCase().includes(q) ||
    (c.ministry || "").toLowerCase().includes(q) ||
    (c.requiredDiploma || "").toLowerCase().includes(q)
  ).slice(0, 5);

  const matchedDiplomas = q.length < 2 ? [] : diplomas.filter(d =>
    d.toLowerCase().includes(q)
  ).slice(0, 4);

  const matchedArticles = q.length < 2 ? [] : articles.filter(article =>
    `${article.title} ${article.intro} ${article.category}`.toLowerCase().includes(q)
  ).slice(0, 4);

  const hasResults = matchedSchools.length > 0 || matchedCompetitions.length > 0 ||
    matchedDiplomas.length > 0 || matchedArticles.length > 0;
  const showHistory = q.length === 0 && searchHistory.length > 0;

  const goTo = (path: string, histQuery: string, type: "school" | "competition") => {
    if (histQuery) addSearch(histQuery, type);
    onClose();
    navigate(path);
  };

  const relaunchSearch = (entry: { query: string; type: "school" | "competition" }) => {
    setQuery(entry.query);
    inputRef.current?.focus();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", bounce: 0.1, duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-[61] bg-background shadow-2xl border-b border-border/50 max-h-[85dvh] flex flex-col"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t("search_global_placeholder")}
                className="flex-1 text-base bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
              {query.length > 0 && (
                <button onClick={() => setQuery("")} className="text-muted-foreground p-1 rounded-lg hover:bg-muted">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="text-sm font-semibold text-primary px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
              >
                {t("back")}
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pb-4">
              {/* Search history */}
              {showHistory && (
                <div className="px-4 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {t("search_recent")}
                    </p>
                    <button
                      onClick={clearSearchHistory}
                      className="flex items-center gap-1 text-xs text-red-500 font-medium"
                    >
                      <Trash2 className="w-3 h-3" /> {t("profile_clear_history")}
                    </button>
                  </div>
                  <div className="space-y-1">
                    {searchHistory.slice(0, 8).map((entry, i) => (
                      <button
                        key={i}
                        onClick={() => relaunchSearch(entry)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left active:scale-[0.98]"
                      >
                        <Clock className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                        <span className="flex-1 text-sm text-foreground truncate">{entry.query}</span>
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0",
                          entry.type === "school" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                        )}>
                          {entry.type === "school" ? t("nav_schools") : t("nav_competitions")}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {q.length >= 2 && !hasResults && (
                <div className="flex flex-col items-center justify-center py-12 text-center px-8">
                  <Search className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-semibold text-foreground mb-1">{t("search_no_results")}</p>
                  <p className="text-xs text-muted-foreground">{t("search_no_results_sub")}</p>
                </div>
              )}

              {/* Schools results */}
              {matchedSchools.length > 0 && (
                <div className="px-4 pt-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" /> {t("nav_schools")}
                  </p>
                  <div className="space-y-1">
                    {matchedSchools.map(s => (
                      <button
                        key={s.id}
                        onClick={() => goTo(`/schools/${s.id}`, q, "school")}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/60 transition-colors text-left active:scale-[0.98]"
                      >
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <GraduationCap className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-tight truncate">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.city} · {s.type === "public" ? t("schools_public") : t("schools_private")}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                      </button>
                    ))}
                  </div>
                  {schools.filter(s => s.name.toLowerCase().includes(q)).length > 5 && (
                    <button
                      onClick={() => goTo(`/schools`, q, "school")}
                      className="mt-1 w-full text-xs text-primary font-semibold text-center py-2 hover:underline"
                    >
                      {t("search_see_all_schools")} →
                    </button>
                  )}
                </div>
              )}

              {/* Competitions results */}
              {matchedCompetitions.length > 0 && (
                <div className="px-4 pt-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> {t("nav_competitions")}
                  </p>
                  <div className="space-y-1">
                    {matchedCompetitions.map(c => (
                      <button
                        key={c.id}
                        onClick={() => goTo(`/competitions/${c.id}`, q, "competition")}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/60 transition-colors text-left active:scale-[0.98]"
                      >
                        <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0">
                          <Briefcase className="w-4 h-4 text-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-tight truncate">{c.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{c.ministry}</p>
                        </div>
                        <span className={cn(
                          "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md shrink-0",
                          c.status === "open" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        )}>
                          {c.status === "open" ? t("competitions_open") : t("competitions_upcoming")}
                        </span>
                      </button>
                    ))}
                  </div>
                  {competitions.filter(c => c.title.toLowerCase().includes(q)).length > 5 && (
                    <button
                      onClick={() => goTo(`/competitions`, q, "competition")}
                      className="mt-1 w-full text-xs text-secondary font-semibold text-center py-2 hover:underline"
                    >
                      {t("search_see_all_competitions")} →
                    </button>
                  )}
                </div>
              )}

              {/* Diplomas results */}
              {matchedDiplomas.length > 0 && (
                <div className="px-4 pt-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> {t("search_diplomas")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {matchedDiplomas.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(`/schools`, d, "school")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-100 dark:border-blue-800 active:scale-95 transition-transform"
                      >
                        <BookOpen className="w-3 h-3" /> {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

               {/* Articles results */}
               {matchedArticles.length > 0 && (
                 <div className="px-4 pt-4">
                   <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                     <Newspaper className="w-3.5 h-3.5" /> {t("search_articles")}
                   </p>
                   <div className="space-y-1">
                     {matchedArticles.map(article => (
                       <button
                         key={article.id}
                         onClick={() => goTo("/conseils", q, "school")}
                         className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/60 transition-colors text-left active:scale-[0.98]"
                       >
                         <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center shrink-0 text-lg">
                           {article.emoji}
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-sm font-semibold text-foreground leading-tight truncate">{article.title}</p>
                           <p className="text-xs text-muted-foreground truncate">{article.category} · {article.readTime} min</p>
                         </div>
                         <ArrowRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                       </button>
                     ))}
                   </div>
                 </div>
               )}

              {/* Suggestions quand vide */}
              {!showHistory && q.length === 0 && (
                <div className="px-4 pt-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{t("search_suggestions")}</p>
                  {[
                    { label: "INPHB", type: "school" as const },
                    { label: "BTS Informatique", type: "school" as const },
                    { label: "Douanes", type: "competition" as const },
                    { label: "Trésor public", type: "competition" as const },
                  ].map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(s.label)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

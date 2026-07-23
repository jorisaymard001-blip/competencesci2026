import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { GlobalSearch } from "@/components/GlobalSearch";
import { Search, ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useListSchools, useListCompetitions } from "@workspace/api-client-react";
import { useT } from "@/lib/useT";

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days >= 0 ? days : null;
}

export default function Home() {
  const [, navigate] = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const { data: schools } = useListSchools();
  const { data: competitions } = useListCompetitions();
  const { t } = useT();

  const openCount = competitions?.filter(c => c.status === "open").length ?? 0;

  const stats = [
    { icon: "🎓", value: schools?.length ?? "40+", label: t("home_stat_schools"),       pill: "bg-primary/10 border-primary/20 dark:bg-primary/15" },
    { icon: "🏆", value: openCount || "–",          label: t("home_stat_competitions"),  pill: "bg-green-500/10 border-green-500/20 dark:bg-green-500/15" },
    { icon: "📍", value: "8",                        label: t("home_stat_cities"),        pill: "bg-blue-500/10 border-blue-500/20 dark:bg-blue-500/15" },
    { icon: "📚", value: "25+",                      label: t("home_stat_programs"),      pill: "bg-violet-500/10 border-violet-500/20 dark:bg-violet-500/15" },
  ];

  const categories = [
    {
      href: "/schools",
      emoji: "🎓",
      title: t("home_schools_card"),
      sub: t("home_schools_sub"),
      iconBg: "bg-primary/15",
      border: "border-primary/20",
      subColor: "text-primary",
    },
    {
      href: "/competitions",
      emoji: "🏆",
      title: t("home_competitions_card"),
      sub: t("home_competitions_sub"),
      iconBg: "bg-green-500/15",
      border: "border-green-500/20",
      subColor: "text-green-600 dark:text-green-400",
    },
    {
      href: "/orientation",
      emoji: "🧭",
      title: t("home_orientation_card"),
      sub: t("home_orientation_sub"),
      iconBg: "bg-violet-500/15",
      border: "border-violet-500/20",
      subColor: "text-violet-600 dark:text-violet-400",
    },
    {
      href: "/conseils",
      emoji: "📚",
      title: t("home_conseils_card"),
      sub: t("home_conseils_sub"),
      iconBg: "bg-blue-500/15",
      border: "border-blue-500/20",
      subColor: "text-blue-600 dark:text-blue-400",
    },
  ];

  // Urgent: open competitions closing within 60 days, sorted by closest deadline
  const urgentCompetitions = (competitions ?? [])
    .filter(c => c.status === "open")
    .map(c => ({ ...c, daysLeft: daysUntil((c as any).closeDate) }))
    .filter(c => c.daysLeft !== null && c.daysLeft <= 60)
    .sort((a, b) => (a.daysLeft ?? 999) - (b.daysLeft ?? 999))
    .slice(0, 3);

  return (
    <Layout>
      <GlobalSearch open={showSearch} onClose={() => setShowSearch(false)} />

      <div className="w-full pb-10 max-w-7xl mx-auto">

        {/* ── Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="px-4 pt-5 pb-4"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-muted border border-border/50 rounded-full px-3 py-1 mb-4">
            <span>🇨🇮</span>
            <span className="text-xs font-semibold text-muted-foreground">{t("home_badge")}</span>
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl font-black leading-tight text-foreground mb-2">
            {t("home_title_1")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
              {t("home_title_2")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            {t("home_subtitle")}
          </p>

          {/* Search bar */}
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center w-full bg-card border border-border/50 rounded-2xl shadow-sm px-4 py-3 gap-3 active:scale-[0.99] transition-all"
          >
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="flex-1 text-left text-sm text-muted-foreground">{t("home_search_placeholder")}</span>
            <div className="bg-primary text-white p-2 rounded-xl shrink-0">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </motion.div>

        {/* ── Stats — grille 2 cols (mobile) / 4 cols (desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-4 mb-1">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className={`${s.pill} border rounded-2xl px-4 py-3 flex items-center gap-3`}
            >
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="font-black text-lg leading-none text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 whitespace-nowrap">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Explorer — 2×2 compact grid */}
        <div className="px-4 mt-5 mb-4">
          <h2 className="font-display font-bold text-lg text-foreground mb-3">{t("home_explore")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.href}
                onClick={() => navigate(cat.href)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                className={`bg-card ${cat.border} border rounded-2xl p-4 text-left active:scale-95 transition-transform`}
              >
                <div className={`w-10 h-10 ${cat.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                  <span className="text-xl">{cat.emoji}</span>
                </div>
                <p className="font-bold text-sm text-foreground leading-tight">{cat.title}</p>
                <p className={`text-xs mt-1 ${cat.subColor}`}>{cat.sub}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Mon Parcours CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="px-4 mb-4"
        >
          <button
            onClick={() => navigate("/candidatures")}
            className="w-full bg-card border border-border/50 rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-all shadow-sm"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-2xl">📋</span>
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground">{t("home_parcours_title")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("home_parcours_sub")}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-primary shrink-0" />
          </button>
        </motion.div>

        {/* ── Concours urgents */}
        {urgentCompetitions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="px-4 mb-4"
          >
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">⚠️</span>
                <p className="text-red-600 dark:text-red-400 font-bold text-sm">{t("home_urgent_title")}</p>
              </div>
              <div className="space-y-2">
                {urgentCompetitions.map(c => (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/competitions/${c.id}`)}
                    className="w-full text-left px-3 py-2.5 bg-red-100/60 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/40 rounded-xl flex justify-between items-center gap-3 active:scale-[0.98] transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground leading-tight truncate">{c.title}</p>
                      <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                        {t("home_urgent_closes_in")} {c.daysLeft} {t("home_urgent_days")}
                        {(c as any).positions ? ` · ${(c as any).positions} postes` : ""}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-primary shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </Layout>
  );
}

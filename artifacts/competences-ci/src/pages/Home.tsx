import { Link, useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Search, GraduationCap, Briefcase, ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useListSchools, useListCompetitions } from "@workspace/api-client-react";
import { useT } from "@/lib/useT";

export default function Home() {
  const [, navigate] = useLocation();
  const { data: schools } = useListSchools();
  const { data: competitions } = useListCompetitions();
  const { t } = useT();

  const stats = [
    { label: t("home_stat_schools"), value: schools?.length || "40+", icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
    { label: t("home_stat_competitions"), value: competitions?.filter(c => c.status === "open").length || "12", icon: Briefcase, color: "text-secondary", bg: "bg-secondary/10" },
  ];

  return (
    <Layout>
      <div className="relative pt-12 pb-8 px-6 overflow-hidden bg-background">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute top-20 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl -translate-x-1/2" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted border border-border text-xs font-semibold text-primary mb-6">
            <span>{t("home_badge")}</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-[1.1] text-foreground mb-4">
            {t("home_title_1")} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">{t("home_title_2")}</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-[90%] mb-8 text-balance">
            {t("home_subtitle")}
          </p>

          <Link href="/schools">
            <div className="flex items-center w-full bg-card rounded-2xl shadow-lg shadow-black/5 border border-border/50 p-2 mb-10">
              <div className="flex-1 flex items-center px-4">
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <span className="text-muted-foreground text-sm">{t("home_search_placeholder")}</span>
              </div>
              <div className="bg-primary text-white p-3 rounded-xl shadow-md">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      <div className="px-6 pb-24 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }} className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="font-display text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-xs font-medium text-muted-foreground leading-tight">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold">{t("home_section_title")}</h2>

          <Link href="/schools">
            <motion.div whileHover={{ scale: 0.98 }} whileTap={{ scale: 0.96 }} className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-card rounded-3xl p-6 border border-orange-100 dark:border-orange-900/30 shadow-sm">
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-1">{t("home_schools_card")}</h3>
                  <p className="text-sm text-muted-foreground">{t("home_schools_sub")}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/competitions">
            <motion.div whileHover={{ scale: 0.98 }} whileTap={{ scale: 0.96 }} className="relative overflow-hidden bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-card rounded-3xl p-6 border border-green-100 dark:border-green-900/30 shadow-sm">
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center mb-4">
                    <Briefcase className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-1">{t("home_competitions_card")}</h3>
                  <p className="text-sm text-muted-foreground">{t("home_competitions_sub")}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-secondary">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        <div className="bg-foreground text-background rounded-3xl p-6 mt-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="w-8 h-8 mb-3 text-primary text-2xl">📄</div>
            <h3 className="font-display font-bold text-lg mb-2">{t("home_promo_title")}</h3>
            <p className="text-sm text-muted-foreground/80 mb-4 line-clamp-2">{t("home_promo_sub")}</p>
            <button onClick={() => navigate("/tips")} className="text-sm font-semibold text-primary flex items-center active:opacity-70 transition-opacity">
              {t("home_promo_btn")} <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

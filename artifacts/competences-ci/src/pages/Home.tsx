import { Link, useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Search, GraduationCap, Briefcase, ArrowRight, BookOpen, ChevronRight, Compass, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import { useListSchools, useListCompetitions } from "@workspace/api-client-react";
import { useT } from "@/lib/useT";

export default function Home() {
  const [, navigate] = useLocation();
  const { data: schools } = useListSchools();
  const { data: competitions } = useListCompetitions();
  const { t } = useT();

  const stats = [
    { label: t("home_stat_schools"), value: schools?.length || "40+", icon: GraduationCap, color: "text-primary", bg: "bg-primary/10" },
    { label: t("home_stat_competitions"), value: competitions?.filter(c => c.status === "open").length || "12", icon: Briefcase, color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Villes couvertes", value: "8", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Filières disponibles", value: "25+", icon: Compass, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20" },
  ];

  const categories = [
    {
      href: "/schools",
      icon: GraduationCap,
      title: t("home_schools_card"),
      subtitle: t("home_schools_sub"),
      gradient: "from-orange-50 to-white dark:from-orange-900/20 dark:to-card",
      border: "border-orange-100 dark:border-orange-900/30",
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      arrowColor: "text-primary",
    },
    {
      href: "/competitions",
      icon: Briefcase,
      title: t("home_competitions_card"),
      subtitle: t("home_competitions_sub"),
      gradient: "from-green-50 to-white dark:from-green-900/20 dark:to-card",
      border: "border-green-100 dark:border-green-900/30",
      iconBg: "bg-secondary/20",
      iconColor: "text-secondary",
      arrowColor: "text-secondary",
    },
    {
      href: "/orientation",
      icon: Compass,
      title: "Trouver ma voie",
      subtitle: "Quiz d'orientation personnalisé",
      gradient: "from-violet-50 to-white dark:from-violet-900/20 dark:to-card",
      border: "border-violet-100 dark:border-violet-900/30",
      iconBg: "bg-violet-100 dark:bg-violet-900/30",
      iconColor: "text-violet-600",
      arrowColor: "text-violet-600",
    },
    {
      href: "/conseils",
      icon: BookOpen,
      title: "Conseils & Articles",
      subtitle: "Guides pour réussir",
      gradient: "from-blue-50 to-white dark:from-blue-900/20 dark:to-card",
      border: "border-blue-100 dark:border-blue-900/30",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600",
      arrowColor: "text-blue-600",
    },
  ];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto w-full">
        {/* Hero */}
        <div className="relative pt-10 pb-8 px-5 md:px-8 lg:px-10 overflow-hidden bg-background">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute top-20 left-0 w-60 h-60 bg-secondary/8 rounded-full blur-3xl -translate-x-1/2 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted border border-border text-xs font-semibold text-primary mb-5">
              🇨🇮 {t("home_badge")}
            </div>

            <div className="lg:flex lg:items-start lg:gap-12">
              <div className="lg:flex-1">
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold leading-[1.1] text-foreground mb-4">
                  {t("home_title_1")}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                    {t("home_title_2")}
                  </span>
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed max-w-lg mb-6 text-balance">
                  {t("home_subtitle")}
                </p>

                <Link href="/schools">
                  <div className="flex items-center w-full max-w-md bg-card rounded-2xl shadow-lg shadow-black/5 border border-border/50 p-2 mb-2 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex-1 flex items-center px-4">
                      <Search className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
                      <span className="text-muted-foreground text-sm">{t("home_search_placeholder")}</span>
                    </div>
                    <div className="bg-primary text-white p-3 rounded-xl shadow-md shrink-0">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              </div>

              {/* Stats grid — shows inline on desktop */}
              <div className="hidden lg:grid lg:grid-cols-2 lg:gap-3 lg:min-w-[300px] mt-2">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                    className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm"
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${stat.bg}`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div className="font-display text-2xl font-bold text-foreground mb-0.5">{stat.value}</div>
                    <div className="text-xs font-medium text-muted-foreground leading-tight">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats grid — mobile only */}
        <div className="px-5 md:px-8 lg:hidden">
          <div className="grid grid-cols-2 gap-3 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="font-display text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-xs font-medium text-muted-foreground leading-tight">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="px-5 md:px-8 lg:px-10 pb-8 lg:pb-10 space-y-5">
          <h2 className="font-display text-xl font-bold">{t("home_section_title")}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <Link key={cat.href} href={cat.href}>
                <motion.div
                  whileHover={{ scale: 0.98 }}
                  whileTap={{ scale: 0.96 }}
                  className={`relative overflow-hidden bg-gradient-to-br ${cat.gradient} rounded-3xl p-5 md:p-6 border ${cat.border} shadow-sm cursor-pointer`}
                >
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <div className={`w-11 h-11 ${cat.iconBg} rounded-2xl flex items-center justify-center mb-3`}>
                        <cat.icon className={`w-5 h-5 ${cat.iconColor}`} />
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground mb-1">{cat.title}</h3>
                      <p className="text-sm text-muted-foreground">{cat.subtitle}</p>
                    </div>
                    <div className={`w-9 h-9 rounded-full bg-white/80 dark:bg-card/80 shadow-sm flex items-center justify-center ${cat.arrowColor} shrink-0 ml-3`}>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* CTA banner */}
          <div className="bg-foreground text-background rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="text-2xl mb-3">📋</div>
              <h3 className="font-display font-bold text-lg mb-2">{t("home_promo_title")}</h3>
              <p className="text-sm text-background/70 mb-4 line-clamp-2">{t("home_promo_sub")}</p>
              <button
                onClick={() => navigate("/candidatures")}
                className="text-sm font-semibold text-primary flex items-center gap-1 min-h-[44px] active:opacity-70 transition-opacity"
              >
                {t("home_promo_btn")} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

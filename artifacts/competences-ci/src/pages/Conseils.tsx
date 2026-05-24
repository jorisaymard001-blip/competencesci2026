import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, BookOpen } from "lucide-react";
import { articles, Article, ArticleSection } from "@/lib/articles";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/useT";

const CATEGORIES = ["Tous", "Orientation", "Études", "Concours", "Marché du travail"];
const CAT_KEYS: Record<string, string> = {
  "Tous": "conseils_cat_all",
  "Orientation": "conseils_cat_orientation",
  "Études": "conseils_cat_studies",
  "Concours": "conseils_cat_competitions",
  "Marché du travail": "conseils_cat_market",
};

const CATEGORY_CLS: Record<string, string> = {
  Orientation: "bg-primary/10 text-primary",
  Études: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Concours: "bg-green-500/10 text-green-700 dark:text-green-400",
  "Marché du travail": "bg-purple-500/10 text-purple-700 dark:text-purple-400",
};

function getSavedArticles(): string[] {
  try { return JSON.parse(localStorage.getItem("savedArticles") || "[]"); }
  catch { return []; }
}

function setSavedArticles(ids: string[]) {
  try { localStorage.setItem("savedArticles", JSON.stringify(ids)); }
  catch {}
}

// ── Article reading view ─────────────────────────────────────────────────────

function ArticleSection({ section, headingIdx }: { section: ArticleSection; headingIdx?: number }) {
  switch (section.type) {
    case "heading":
      return (
        <div className="flex items-center gap-3 mb-3 mt-1">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0">
            {headingIdx}
          </div>
          <h2 className="font-black text-xl text-foreground leading-tight">{section.titre}</h2>
        </div>
      );
    case "paragraph":
      return <p className="text-foreground/80 text-[15px] leading-relaxed">{section.contenu}</p>;
    case "info":
      return (
        <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">💡</span>
            <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">{section.contenu}</p>
          </div>
        </div>
      );
    case "tip":
      return (
        <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-2xl p-4">
          <p className="text-green-700 dark:text-green-400 font-black text-[10px] uppercase tracking-wider mb-2">✅ Conseil pratique</p>
          <p className="text-green-800 dark:text-green-200 text-sm leading-relaxed">{section.contenu}</p>
        </div>
      );
    case "warning":
      return (
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">⚠️</span>
            <p className="text-red-800 dark:text-red-200 text-sm leading-relaxed">{section.contenu}</p>
          </div>
        </div>
      );
    case "list":
      return (
        <div className="space-y-2">
          {section.items.map((item, j) => (
            <div key={j} className="flex items-center gap-3 bg-muted border border-border/60 rounded-xl px-3 py-2.5">
              <div className="w-6 h-6 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-primary text-xs font-black">{j + 1}</span>
              </div>
              <p className="text-foreground/80 text-sm leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      );
    case "stats":
      return (
        <div className="grid grid-cols-2 gap-3">
          {section.stats.map((stat, j) => (
            <div key={j} className="bg-card border border-border/60 rounded-2xl p-4 text-center">
              <p className="text-primary font-black text-xl mb-1">{stat.valeur}</p>
              <p className="text-muted-foreground text-xs leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>
      );
    case "quote":
      return (
        <div className="bg-card border-l-4 border-primary rounded-r-2xl px-4 py-4">
          <p className="text-foreground text-base italic leading-relaxed">"{section.contenu}"</p>
          {section.auteur && <p className="text-primary text-xs font-bold mt-2">— {section.auteur}</p>}
        </div>
      );
    default:
      return null;
  }
}

function ArticleView({
  article,
  onBack,
  onNavigate,
}: {
  article: Article;
  onBack: () => void;
  onNavigate: (a: Article) => void;
}) {
  const { t } = useT();
  const [readingProgress, setReadingProgress] = useState(0);
  const [isSaved, setIsSaved] = useState(() => getSavedArticles().includes(article.id));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReadingProgress(0);
    setIsSaved(getSavedArticles().includes(article.id));
    containerRef.current?.scrollTo({ top: 0 });
  }, [article.id]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const total = el.scrollHeight - el.clientHeight;
    setReadingProgress(total > 0 ? Math.min((el.scrollTop / total) * 100, 100) : 0);
  };

  const toggleSaved = () => {
    setIsSaved(prev => {
      const newVal = !prev;
      const saved = getSavedArticles();
      setSavedArticles(newVal ? [...saved, article.id] : saved.filter(id => id !== article.id));
      return newVal;
    });
  };

  const similarArticles = articles
    .filter(a => a.id !== article.id)
    .sort((a, b) => (a.category === article.category ? -1 : 1) - (b.category === article.category ? -1 : 1))
    .slice(0, 2);

  // Pre-compute heading indices
  let hIdx = 0;
  const sectionsWithIdx = article.sections.map(s => ({
    section: s,
    headingIdx: s.type === "heading" ? ++hIdx : undefined,
  }));

  const isDone = readingProgress >= 98;

  return (
    <motion.div
      ref={containerRef}
      onScroll={handleScroll}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      {/* ── Reading progress bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary transition-all duration-150 origin-left pointer-events-none"
        style={{ width: `${readingProgress}%` }}
      />

      {/* ── Sticky header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={onBack}
            aria-label="Retour"
            className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center press"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-muted-foreground text-xs font-semibold">
            {isDone ? "✅ Article terminé" : `${Math.round(readingProgress)}% lu`}
          </span>
          <button
            onClick={toggleSaved}
            aria-label={isSaved ? "Retirer des sauvegardés" : "Sauvegarder"}
            className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center press text-base"
          >
            {isSaved ? "🔖" : "📄"}
          </button>
        </div>
      </div>

      {/* ── Content */}
      <div className="px-4 py-6 pb-12 max-w-2xl mx-auto">

        {/* Meta */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-4xl">{article.emoji}</span>
          <div>
            <span className={cn("px-3 py-1 rounded-full text-[11px] font-black", CATEGORY_CLS[article.category] ?? "bg-muted text-muted-foreground")}>
              {article.category}
            </span>
            <p className="text-muted-foreground text-xs mt-1.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTime} min {t("conseils_read_time")}
            </p>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-black text-[1.75rem] leading-tight text-foreground mb-5">
          {article.title}
        </h1>

        {/* Intro quote */}
        <div className="border-l-4 border-primary bg-primary/5 rounded-r-2xl px-4 py-4 mb-8">
          <p className="text-foreground/90 text-[15px] italic leading-relaxed font-medium">
            "{article.intro}"
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sectionsWithIdx.map(({ section, headingIdx }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(0.1 + i * 0.025, 0.5) }}
            >
              <ArticleSection section={section} headingIdx={headingIdx} />
            </motion.div>
          ))}
        </div>

        {/* ── Footer */}
        <div className="border-t border-border/50 pt-6 mt-8 space-y-4">

          {/* Congrats card */}
          <div className={cn(
            "rounded-2xl p-5 text-center border transition-all duration-500",
            isDone
              ? "bg-gradient-to-r from-primary/10 via-card to-secondary/10 border-primary/20"
              : "bg-muted/50 border-border/40"
          )}>
            <span className="text-3xl block mb-2">{isDone ? "🎉" : "📖"}</span>
            {isDone ? (
              <>
                <p className="font-black text-foreground mb-1">Article terminé !</p>
                <p className="text-muted-foreground text-sm">Tu as lu « {article.title} » en {article.readTime} min.</p>
              </>
            ) : (
              <p className="text-muted-foreground text-sm font-medium">Continue ta lecture pour finir l'article…</p>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => window.open(`https://wa.me/?text=Article utile : ${article.title} — via Compétences CI`, "_blank")}
              className="bg-green-600 text-white rounded-2xl py-3 font-black text-sm flex items-center justify-center gap-2 press"
            >
              💬 Partager
            </button>
            <button
              onClick={toggleSaved}
              className="bg-muted border border-border text-foreground rounded-2xl py-3 font-black text-sm flex items-center justify-center gap-2 press"
            >
              {isSaved ? "🔖 Sauvegardé" : "📄 Sauvegarder"}
            </button>
          </div>

          {/* Similar articles */}
          {similarArticles.length > 0 && (
            <div>
              <h3 className="font-black text-sm text-foreground uppercase tracking-wide mb-3">📚 Articles similaires</h3>
              <div className="space-y-2">
                {similarArticles.map(a => (
                  <button
                    key={a.id}
                    onClick={() => onNavigate(a)}
                    className="w-full bg-card border border-border/60 rounded-2xl p-3 flex items-center gap-3 text-left press"
                  >
                    <span className="text-2xl">{a.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-foreground leading-snug">{a.title}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">⏱ {a.readTime} min</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-primary shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Article list ─────────────────────────────────────────────────────────────

export default function Conseils() {
  const { t } = useT();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeCategory, setActiveCategory] = useState("Tous");

  const filtered = activeCategory === "Tous" ? articles : articles.filter(a => a.category === activeCategory);

  return (
    <Layout title={t("conseils_title")} showBack noBottomNav>
      <div className="bg-background min-h-screen pb-12">

        {/* Header intro */}
        <div className="px-5 pt-4 pb-5 bg-gradient-to-br from-primary/5 to-secondary/5 border-b border-border/40">
          <p className="text-sm text-muted-foreground leading-relaxed">{t("conseils_intro")}</p>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-border/40">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-black transition-all press",
                activeCategory === cat
                  ? "bg-primary text-white shadow-sm shadow-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {t(CAT_KEYS[cat])}
            </button>
          ))}
        </div>

        {/* Articles */}
        <div className="px-4 py-5 space-y-3">
          {filtered.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <button
                onClick={() => setSelectedArticle(article)}
                className="w-full bg-card border border-border/50 rounded-2xl p-4 shadow-sm text-left active:scale-[0.97] transition-all hover:border-primary/30 press"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-2xl shrink-0">
                    {article.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={cn("text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider", CATEGORY_CLS[article.category] ?? "bg-muted text-muted-foreground")}>
                        {article.category}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                        <Clock className="w-3 h-3" /> {article.readTime} min {t("conseils_read_time")}
                      </span>
                    </div>
                    <h3 className="font-black text-sm text-foreground leading-snug mb-1.5">{article.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{article.intro}</p>
                  </div>
                  <BookOpen className="w-4 h-4 text-primary/40 shrink-0 mt-0.5" />
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedArticle && (
          <ArticleView
            article={selectedArticle}
            onBack={() => setSelectedArticle(null)}
            onNavigate={a => setSelectedArticle(a)}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}

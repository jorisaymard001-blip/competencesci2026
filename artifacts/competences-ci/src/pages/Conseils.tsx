import { useState } from "react";
import { Layout } from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Clock, BookOpen } from "lucide-react";
import { articles, Article } from "@/lib/articles";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/useT";

const CATEGORIES = ["Tous", "Orientation", "Études", "Concours", "Marché du travail"];
const CAT_KEYS: Record<string, any> = {
  "Tous": "conseils_cat_all",
  "Orientation": "conseils_cat_orientation",
  "Études": "conseils_cat_studies",
  "Concours": "conseils_cat_competitions",
  "Marché du travail": "conseils_cat_market",
};

function ArticleView({ article, onBack }: { article: Article; onBack: () => void }) {
  const { t } = useT();
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto max-w-md mx-auto"
    >
      {/* Article header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 h-16 flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors active:scale-95">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-display font-semibold text-base truncate flex-1">{article.title}</h1>
      </div>

      <div className="px-5 py-6 pb-16">
        {/* Article meta */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-4xl">{article.emoji}</span>
          <div>
            <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full",
              article.category === "Orientation" ? "bg-primary/10 text-primary" :
              article.category === "Études" ? "bg-secondary/10 text-secondary" :
              article.category === "Concours" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" :
              "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
            )}>{article.category}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Clock className="w-3 h-3" /> {article.readTime} {t("conseils_read_time")}
            </div>
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold text-foreground leading-tight mb-4">{article.title}</h2>
        <p className="text-base text-muted-foreground leading-relaxed mb-8 border-l-4 border-primary/40 pl-4 italic">
          {article.intro}
        </p>

        <div className="space-y-8">
          {article.sections.map((section, i) => (
            <div key={i}>
              <h3 className="font-display text-lg font-bold text-foreground mb-3">{section.heading}</h3>
              <p className="text-[15px] text-foreground/80 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Conseils() {
  const { t } = useT();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeCategory, setActiveCategory] = useState("Tous");

  const filtered = activeCategory === "Tous" ? articles : articles.filter(a => a.category === activeCategory);

  return (
    <Layout title={t("conseils_title")} showBack noBottomNav>
      <div className="bg-background min-h-screen pb-12">
        {/* Header */}
        <div className="px-5 pt-4 pb-5 bg-gradient-to-br from-primary/5 to-secondary/5 border-b border-border/40">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("conseils_intro")}
          </p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar border-b border-border/40">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                activeCategory === cat
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {t(CAT_KEYS[cat])}
            </button>
          ))}
        </div>

        {/* Articles grid */}
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
                      <span className={cn("text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider",
                        article.category === "Orientation" ? "bg-primary/10 text-primary" :
                        article.category === "Études" ? "bg-secondary/10 text-secondary" :
                        article.category === "Concours" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" :
                        "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      )}>{article.category}</span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                        <Clock className="w-3 h-3" /> {article.readTime} {t("conseils_read_time")}
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
          <ArticleView article={selectedArticle} onBack={() => setSelectedArticle(null)} />
        )}
      </AnimatePresence>
    </Layout>
  );
}

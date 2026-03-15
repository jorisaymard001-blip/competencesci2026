import { Layout } from "@/components/Layout";
import { useLocation } from "wouter";
import { GraduationCap, MessageCircle, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useT } from "@/lib/useT";

export default function About() {
  const [, navigate] = useLocation();
  const { t } = useT();

  return (
    <Layout title={t("about_title")} showBack noBottomNav>
      <div className="pb-12 min-h-screen bg-background">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-6 pt-6 pb-10"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mb-5">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-3 leading-tight">
            {t("about_app_title")}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed text-balance">
            {t("about_desc_1")}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3 text-balance">
            {t("about_desc_2")}
          </p>
        </motion.div>

        <div className="px-5 space-y-6">

          {/* Features */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="font-display text-base font-bold text-foreground mb-3">{t("about_features")}</h2>
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
              {[
                { emoji: "🏫", text: "40 établissements référencés (publics et privés)" },
                { emoji: "📋", text: "15+ concours de la fonction publique ivoirienne" },
                { emoji: "🔍", text: "Filtres par ville, diplôme et type d'établissement" },
                { emoji: "❤️", text: "Système de favoris pour sauvegarder vos recherches" },
                { emoji: "🔔", text: "Notifications pour les nouvelles opportunités" },
                { emoji: "📖", text: "Guide de préparation de dossier" },
              ].map((item, i, arr) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-border/40" : ""}`}>
                  <span className="text-lg w-7 text-center">{item.emoji}</span>
                  <p className="text-sm text-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Creator */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-orange-50 to-green-50 border border-orange-100 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-5 h-5 text-primary" />
              <h2 className="font-display text-base font-bold text-foreground">{t("about_creator_label")}</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("about_creator")}</p>
          </motion.section>

          {/* Contact reference */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="w-5 h-5 text-secondary" />
              <h2 className="font-display text-base font-bold text-foreground">{t("about_contact_label")}</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t("about_contact_text")}</p>
            <button
              onClick={() => navigate("/messages")}
              className="w-full py-3 rounded-xl bg-secondary text-white font-semibold text-sm active:scale-[0.98] transition-all"
            >
              {t("about_contact_btn")}
            </button>
          </motion.section>

          {/* Copyright */}
          <div className="text-center pt-4 pb-2">
            <p className="text-xs text-muted-foreground">{t("about_copyright")}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

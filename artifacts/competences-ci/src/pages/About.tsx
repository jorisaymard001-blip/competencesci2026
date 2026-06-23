import { Layout } from "@/components/Layout";
import { useLocation } from "wouter";
import { GraduationCap, MessageCircle } from "lucide-react";
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
          <h1 className="font-black text-2xl text-foreground mb-3 leading-tight">
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
            <h2 className="font-black text-sm text-foreground uppercase tracking-wide mb-3">{t("about_features")}</h2>
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
            className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-lg">👨‍💻</span>
              </div>
              <div>
                <p className="text-foreground font-bold text-base">Développeur</p>
                <p className="text-muted-foreground text-xs">Conception &amp; développement</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-3">
              Compétences CI a été conçue et développée par <span className="font-semibold text-foreground">Yao Brou Joris Aymard</span>, étudiant en Génie Civil, dans le but de faciliter l'orientation académique et professionnelle des étudiants ivoiriens.
            </p>
            <div className="flex items-center gap-2 pt-3 border-t border-border/40">
              <span className="text-muted-foreground text-xs">© 2026 Compétences CI — Tous droits réservés</span>
            </div>
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
              className="w-full py-3 rounded-xl bg-secondary text-white font-black text-sm active:scale-[0.98] transition-all press"
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

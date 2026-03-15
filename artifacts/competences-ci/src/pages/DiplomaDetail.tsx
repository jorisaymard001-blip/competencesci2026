import { useRoute, useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { getDiplomaInfo, LEVEL_COLORS } from "@/lib/diploma-data";
import { GraduationCap, Clock, Coins, BookOpen, Briefcase, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function DiplomaDetail() {
  const [, params] = useRoute("/diplomas/:name");
  const [, navigate] = useLocation();
  const name = params?.name ? decodeURIComponent(params.name) : "";
  const info = getDiplomaInfo(name);

  if (!info) {
    return (
      <Layout showBack title={name || "Diplôme"} noBottomNav>
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <h2 className="font-display font-bold text-lg text-foreground mb-2">{name}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Ce diplôme est proposé dans cet établissement. Contactez directement l'école pour obtenir les détails sur la durée, les coûts et les débouchés.
          </p>
          <button
            onClick={() => navigate("/messages")}
            className="px-6 py-3 rounded-2xl bg-primary text-white font-semibold text-sm active:scale-95 transition-all"
          >
            Contacter notre équipe
          </button>
        </div>
      </Layout>
    );
  }

  const levelColor = LEVEL_COLORS[info.level] ?? "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <Layout showBack title={info.name} noBottomNav>
      <div className="pb-12">

        {/* Hero block */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/10 to-secondary/5 px-6 pt-4 pb-8 border-b border-border/40"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground leading-tight">{info.fullName}</h1>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border mt-1 ${levelColor}`}>
                Niveau {info.level}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{info.description}</p>
        </motion.div>

        <div className="px-5 py-6 space-y-6">

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm"
            >
              <Clock className="w-5 h-5 text-primary mb-2" />
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Durée</div>
              <div className="text-sm font-semibold text-foreground leading-snug">{info.duration}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm"
            >
              <Coins className="w-5 h-5 text-secondary mb-2" />
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Coût estimé</div>
              <div className="text-sm font-semibold text-foreground leading-snug">{info.cost}</div>
            </motion.div>
          </div>

          {/* Conditions requises */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <h2 className="font-display text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Conditions d'accès
            </h2>
            <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-muted-foreground leading-relaxed">{info.requirements}</p>
            </div>
          </motion.section>

          {/* Débouchés */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="font-display text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-secondary" /> Débouchés professionnels
            </h2>
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
              {info.careers.map((career, i) => (
                <div key={i} className={`flex items-start gap-3 px-4 py-3.5 ${i < info.careers.length - 1 ? "border-b border-border/40" : ""}`}>
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-snug">{career}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* CTA */}
          <button
            onClick={() => navigate("/competitions")}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
          >
            Voir les concours liés →
          </button>
        </div>
      </div>
    </Layout>
  );
}

import { Layout } from "@/components/Layout";
import { CheckCircle2, FileText, Clock, Users, BookOpen, AlertTriangle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

const tips = [
  {
    icon: FileText,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Documents essentiels",
    items: [
      "Certificat de nationalité ivoirienne (original + copie certifiée)",
      "Extrait d'acte de naissance (moins de 3 mois)",
      "Casier judiciaire (bulletin n°3) récent",
      "Diplômes et relevés de notes certifiés conformes",
      "4 photos d'identité sur fond blanc",
      "Curriculum Vitae détaillé (2 pages maximum)",
    ],
  },
  {
    icon: Clock,
    color: "text-secondary",
    bg: "bg-secondary/10",
    title: "Délais à respecter",
    items: [
      "Déposer votre dossier au moins 2 semaines avant la clôture",
      "Vérifier la validité de tous vos documents (< 3 mois pour certains)",
      "Anticiper les délais d'obtention du casier judiciaire (5–10 jours)",
      "Renouveler votre carte nationale d'identité si nécessaire",
    ],
  },
  {
    icon: BookOpen,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Préparer les épreuves",
    items: [
      "Consulter les annales des concours précédents",
      "Réviser les textes réglementaires en vigueur",
      "S'entraîner à la rédaction administrative",
      "Suivre l'actualité ivoirienne et africaine",
    ],
  },
  {
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-50",
    title: "Conseils pratiques",
    items: [
      "Rejoindre des groupes de préparation sur les réseaux sociaux",
      "Constituer un groupe de révision avec des candidats sérieux",
      "Contacter les lauréats des années précédentes pour des conseils",
      "Utiliser les centres de documentation des grandes bibliothèques",
    ],
  },
];

const warnings = [
  "Ne confiez votre dossier qu'aux services officiels de recrutement",
  "Méfiez-vous des intermédiaires proposant des places contre rémunération",
  "Les résultats officiels ne sont publiés que sur les sites des ministères",
];

export default function Tips() {
  return (
    <Layout title="Guide de préparation" showBack noBottomNav>
      <div className="pb-12">
        {/* Hero */}
        <div className="px-5 pt-2 pb-6">
          <div className="bg-gradient-to-br from-orange-50 via-white to-green-50 rounded-3xl p-6 border border-orange-100 mb-2">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Préparez votre dossier
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Suivez ce guide complet pour maximiser vos chances de succès aux concours de la fonction publique ivoirienne.
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="mx-5 mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900 mb-2">Attention à la fraude</p>
              <ul className="space-y-1.5">
                {warnings.map((w, i) => (
                  <li key={i} className="text-xs text-amber-800 flex items-start gap-1.5">
                    <span className="mt-1 shrink-0">•</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Tip sections */}
        <div className="px-5 space-y-6">
          {tips.map((section, i) => (
            <motion.section
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${section.bg}`}>
                  <section.icon className={`w-5 h-5 ${section.color}`} />
                </div>
                <h2 className="font-display text-lg font-bold text-foreground">{section.title}</h2>
              </div>
              <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                {section.items.map((item, j) => (
                  <div
                    key={j}
                    className={`flex items-start gap-3 p-4 ${j !== section.items.length - 1 ? "border-b border-border/40" : ""}`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-snug">{item}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          ))}

          {/* CTA */}
          <div className="pt-2">
            <Link href="/competitions">
              <button className="w-full py-4 rounded-2xl bg-secondary text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-secondary/20 active:scale-[0.98] transition-all">
                Voir les concours ouverts <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/messages">
              <button className="w-full mt-3 py-3.5 rounded-2xl border border-border bg-card text-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                Contacter notre équipe
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

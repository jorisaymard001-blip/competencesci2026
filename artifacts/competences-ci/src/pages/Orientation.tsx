import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useListSchools, useListCompetitions } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Compass, GraduationCap, Briefcase, ChevronRight, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = 0 | 1 | 2 | 3 | 4 | 5;

interface Answers {
  bac: string;
  subjects: string[];
  budget: string;
  city: string;
  goal: string;
}

const BAC_SERIES = ["A (Lettres)", "B (Éco)", "C (Maths)", "D (Sciences)", "E (Technique)", "F (Technique)", "G (Gestion)", "Autre"];
const SUBJECTS = ["Mathématiques", "Sciences", "Informatique", "Droit / Économie", "Lettres / Communication", "Art / Culture", "Commerce / Gestion", "Agriculture"];
const BUDGET_OPTIONS = [
  { value: "low", label: "Faible", sub: "< 200 000 FCFA/an" },
  { value: "medium", label: "Moyen", sub: "200 000 – 600 000 FCFA/an" },
  { value: "high", label: "Élevé", sub: "> 600 000 FCFA/an" },
];
const CITIES = ["Abidjan", "Bouaké", "Daloa", "Korhogo", "San-Pédro", "Yamoussoukro", "Autre"];
const GOALS = [
  { value: "fast", label: "🏃 Travailler rapidement", sub: "Études courtes (BTS, DUT, concours)" },
  { value: "long", label: "📚 Longues études", sub: "Licence, Master, Doctorat, Grande École" },
];

function arr(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") return [v];
  return [];
}

function joinLower(v: unknown): string {
  return arr(v).join(" ").toLowerCase();
}

function scoreSchool(
  school: { name: string; type: string; city: string; diplomas?: unknown; domains?: unknown },
  answers: Answers,
): number {
  let score = 0;
  const name = (school.name || "").toLowerCase();
  const diplomas = joinLower(school.diplomas);
  const domains = joinLower(school.domains);
  const haystack = `${name} ${domains}`;

  if (school.city === answers.city || answers.city === "Autre") score += 2;
  if (school.city === "Abidjan" && answers.city === "Autre") score += 1;

  // Budget
  if (answers.budget === "low" && school.type === "public") score += 4;
  if (answers.budget === "medium") score += 2;
  if (answers.budget === "high" && school.type === "private") score += 2;

  // Goal
  if (answers.goal === "fast" && (diplomas.includes("bts") || diplomas.includes("dut") || diplomas.includes("licence"))) score += 3;
  if (answers.goal === "long" && (diplomas.includes("master") || diplomas.includes("doctorat") || diplomas.includes("ingénieur"))) score += 3;

  // Subject matching (use name + domains)
  if (answers.subjects.includes("Mathématiques") || answers.subjects.includes("Sciences")) {
    if (haystack.includes("polytechnique") || haystack.includes("mines") || haystack.includes("ingéni") || haystack.includes("technique") || haystack.includes("sciences")) score += 3;
  }
  if (answers.subjects.includes("Informatique")) {
    if (haystack.includes("informatique") || haystack.includes("numérique") || haystack.includes("technologie") || haystack.includes("esatic")) score += 3;
  }
  if (answers.subjects.includes("Droit / Économie")) {
    if (haystack.includes("droit") || haystack.includes("économie") || haystack.includes("administration") || haystack.includes("gestion")) score += 3;
  }
  if (answers.subjects.includes("Lettres / Communication")) {
    if (haystack.includes("lettres") || haystack.includes("communication") || haystack.includes("arts") || haystack.includes("istc")) score += 3;
  }
  if (answers.subjects.includes("Commerce / Gestion")) {
    if (haystack.includes("commerce") || haystack.includes("gestion") || haystack.includes("management") || haystack.includes("iam") || haystack.includes("esca")) score += 3;
  }
  if (answers.subjects.includes("Agriculture")) {
    if (haystack.includes("agriculture") || haystack.includes("agronomie") || haystack.includes("nangui")) score += 3;
  }
  if (answers.subjects.includes("Art / Culture")) {
    if (haystack.includes("art") || haystack.includes("culture") || haystack.includes("musique") || haystack.includes("design")) score += 3;
  }

  // BAC series
  if (["C", "D", "E", "F"].some(s => answers.bac.startsWith(s)) && school.type === "public" && (haystack.includes("polytechnique") || haystack.includes("sciences"))) score += 2;
  if (["A", "B"].some(s => answers.bac.startsWith(s)) && (haystack.includes("lettres") || haystack.includes("commerce") || haystack.includes("administration"))) score += 2;

  // Floor: every school gets at least 1 if city matches → ensures non-empty results
  if (score === 0 && (school.city === answers.city || answers.city === "Autre")) score = 1;

  return score;
}

function scoreCompetition(
  comp: { title: string; status: string; diploma?: string | null; ministry?: string },
  answers: Answers,
): number {
  let score = 0;
  const title = (comp.title || "").toLowerCase();
  const ministry = (comp.ministry || "").toLowerCase();
  const diploma = (comp.diploma || "").toLowerCase();
  const haystack = `${title} ${ministry}`;

  if (comp.status === "open") score += 3;
  if (comp.status === "upcoming") score += 1;

  if (answers.goal === "fast") score += 2; // concours always fast track

  if (answers.budget === "low") score += 1; // public competitions are accessible

  // Diploma matching with goal
  if (answers.goal === "fast" && (diploma.includes("bts") || diploma.includes("licence") || diploma.includes("bac"))) score += 2;
  if (answers.goal === "long" && (diploma.includes("master") || diploma.includes("doctorat") || diploma.includes("ingénieur"))) score += 2;

  if (answers.subjects.includes("Droit / Économie")) {
    if (haystack.includes("magistrat") || haystack.includes("trésor") || haystack.includes("impôt") || haystack.includes("douane") || haystack.includes("administrat") || haystack.includes("économie") || haystack.includes("droit")) score += 3;
  }
  if (answers.subjects.includes("Mathématiques") || answers.subjects.includes("Sciences")) {
    if (haystack.includes("génie") || haystack.includes("statistique") || haystack.includes("informatique") || haystack.includes("ingéni") || haystack.includes("polytechnique")) score += 3;
  }
  if (answers.subjects.includes("Informatique")) {
    if (haystack.includes("informatique") || haystack.includes("numérique") || haystack.includes("technologie")) score += 3;
  }
  if (answers.subjects.includes("Lettres / Communication")) {
    if (haystack.includes("enseignant") || haystack.includes("diplomatie") || haystack.includes("greffier") || haystack.includes("éducation") || haystack.includes("communication")) score += 3;
  }
  if (answers.subjects.includes("Commerce / Gestion")) {
    if (haystack.includes("trésor") || haystack.includes("douane") || haystack.includes("impôt") || haystack.includes("finance") || haystack.includes("gestion") || haystack.includes("commerce")) score += 3;
  }
  if (answers.subjects.includes("Agriculture")) {
    if (haystack.includes("agricult") || haystack.includes("rural") || haystack.includes("agronomie")) score += 3;
  }

  return score;
}

export default function Orientation() {
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<Answers>({ bac: "", subjects: [], budget: "", city: "", goal: "" });
  const [showResults, setShowResults] = useState(false);

  const { data: schools = [] } = useListSchools();
  const { data: competitions = [] } = useListCompetitions();

  const handleNext = () => {
    if (step < 5) setStep((s) => (s + 1) as Step);
    else setShowResults(true);
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({ bac: "", subjects: [], budget: "", city: "", goal: "" });
    setShowResults(false);
  };

  const canContinue = (): boolean => {
    if (step === 1) return !!answers.bac;
    if (step === 2) return answers.subjects.length > 0;
    if (step === 3) return !!answers.budget;
    if (step === 4) return !!answers.city;
    if (step === 5) return !!answers.goal;
    return true;
  };

  const recommendedSchools = schools
    .map(s => ({ ...s, score: scoreSchool(s as any, answers) }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const recommendedCompetitions = competitions
    .map(c => ({ ...c, score: scoreCompetition(c as any, answers) }))
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  if (showResults) {
    return (
      <Layout title="Trouver ma voie" showBack noBottomNav onBack={() => setShowResults(false)}>
        <div className="px-4 py-5 pb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Votre profil d'orientation</h2>
            <p className="text-muted-foreground text-sm">Basé sur vos réponses, voici nos recommandations personnalisées</p>
          </motion.div>

          {recommendedSchools.length > 0 && (
            <section className="mb-6">
              <h3 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" /> Établissements recommandés
              </h3>
              <div className="space-y-2">
                {recommendedSchools.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                    <Link href={`/schools/${s.id}`}>
                      <div className="flex items-center gap-3 bg-card border border-border/50 rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-all">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">#{i + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground leading-tight">{s.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.city} · {s.type === "public" ? "Public" : "Privé"}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {recommendedCompetitions.length > 0 && (
            <section className="mb-6">
              <h3 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-secondary" /> Concours correspondants
              </h3>
              <div className="space-y-2">
                {recommendedCompetitions.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }}>
                    <Link href={`/competitions/${c.id}`}>
                      <div className="flex items-center gap-3 bg-card border border-border/50 rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-all">
                        <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase shrink-0 ${c.status === "open" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                          {c.status === "open" ? "Ouvert" : "À venir"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground leading-tight">{c.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{c.ministry}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {recommendedSchools.length === 0 && recommendedCompetitions.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <p className="mb-4">Aucune recommandation spécifique trouvée. Explorez toutes les options disponibles.</p>
              <Link href="/schools"><div className="inline-block bg-primary text-white px-6 py-3 rounded-2xl font-semibold text-sm">Voir toutes les écoles</div></Link>
            </div>
          )}

          <button onClick={handleReset} className="w-full mt-4 py-4 rounded-2xl border-2 border-border text-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
            <RotateCcw className="w-4 h-4" /> Recommencer le quiz
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Trouver ma voie" showBack noBottomNav>
      <div className="px-4 pt-5 pb-12">
        {/* Progress bar */}
        {step > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Question {step}/5</span>
              <span>{Math.round((step / 5) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full"
                animate={{ width: `${(step / 5) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Compass className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Trouvez votre voie idéale</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8 px-4">
                Répondez à 5 questions courtes et nous vous recommandons les meilleures écoles et concours selon votre profil en Côte d'Ivoire.
              </p>
              <button
                onClick={() => setStep(1)}
                className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" /> Commencer le quiz
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <QuizStep key="step1" question="Quelle est votre série au Bac ?" options={BAC_SERIES.map(v => ({ value: v, label: v }))}
              selected={[answers.bac]}
              onSelect={(v) => setAnswers({ ...answers, bac: v })}
              multi={false} onNext={handleNext} canContinue={canContinue()} />
          )}
          {step === 2 && (
            <QuizStep key="step2" question="Quelles sont vos matières préférées ?" options={SUBJECTS.map(v => ({ value: v, label: v }))}
              selected={answers.subjects}
              onSelect={(v) => setAnswers({ ...answers, subjects: answers.subjects.includes(v) ? answers.subjects.filter(s => s !== v) : [...answers.subjects, v] })}
              multi={true} onNext={handleNext} canContinue={canContinue()} />
          )}
          {step === 3 && (
            <QuizStep key="step3" question="Quel est votre budget annuel pour les études ?" options={BUDGET_OPTIONS}
              selected={[answers.budget]}
              onSelect={(v) => setAnswers({ ...answers, budget: v })}
              multi={false} onNext={handleNext} canContinue={canContinue()} />
          )}
          {step === 4 && (
            <QuizStep key="step4" question="Dans quelle ville souhaitez-vous étudier ?" options={CITIES.map(v => ({ value: v, label: v }))}
              selected={[answers.city]}
              onSelect={(v) => setAnswers({ ...answers, city: v })}
              multi={false} onNext={handleNext} canContinue={canContinue()} />
          )}
          {step === 5 && (
            <QuizStep key="step5" question="Quel est votre objectif ?" options={GOALS}
              selected={[answers.goal]}
              onSelect={(v) => setAnswers({ ...answers, goal: v })}
              multi={false} onNext={handleNext} canContinue={canContinue()} isLast />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

function QuizStep({
  question, options, selected, onSelect, multi, onNext, canContinue, isLast = false
}: {
  question: string;
  options: { value: string; label: string; sub?: string }[];
  selected: string[];
  onSelect: (v: string) => void;
  multi: boolean;
  onNext: () => void;
  canContinue: boolean;
  isLast?: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
      <h2 className="font-display text-xl font-bold text-foreground mb-5">{question}</h2>
      {multi && <p className="text-xs text-muted-foreground mb-4">Sélectionnez une ou plusieurs options</p>}
      <div className="space-y-2 mb-8">
        {options.map(opt => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all active:scale-[0.98]",
                isSelected ? "border-primary bg-primary/5 text-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/40"
              )}
            >
              <div className={cn("w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all", isSelected ? "border-primary bg-primary" : "border-muted-foreground/40")}>
                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-foreground">{opt.label}</div>
                {opt.sub && <div className="text-xs text-muted-foreground mt-0.5">{opt.sub}</div>}
              </div>
            </button>
          );
        })}
      </div>
      <button
        onClick={onNext}
        disabled={!canContinue}
        className="w-full py-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLast ? "✨ Voir mes recommandations" : "Continuer →"}
      </button>
    </motion.div>
  );
}

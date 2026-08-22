import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useListSchools, useListCompetitions } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Compass, GraduationCap, Briefcase, ChevronRight, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/useT";

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

interface Answers {
  studyLevel: string;
  bac: string;
  domains: string[];
  subjects: string[];
  budget: string;
  schoolType: string;
  city: string;
  goal: string;
  availability: string;
}

// Internal values (French) are used by the scoring engine — do NOT translate these
const BAC_SERIES_VALUES = ["A (Lettres)", "B (Éco)", "C (Maths)", "D (Sciences)", "E (Technique)", "F (Technique)", "G (Gestion)"];
const STUDY_LEVELS = ["BEPC / Brevet", "BAC (en cours)", "BAC obtenu", "BTS obtenu", "Licence obtenue", "Master obtenu"];
const DOMAIN_VALUES = ["Génie Civil / BTP", "Informatique / Numérique", "Médecine / Santé", "Droit / Administration", "Finance / Commerce", "Agriculture / Environnement", "Éducation / Enseignement", "Sciences / Recherche"];
const SUBJECT_VALUES = ["Mathématiques", "Physique-Chimie", "SVT / Biologie", "Français / Littérature", "Histoire-Géographie", "Économie", "Informatique", "Langues étrangères"];
const CITIES = ["Abidjan", "Bouaké", "Daloa", "Korhogo", "San-Pédro", "Yamoussoukro"];

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

  // City: heavy weight so it always dominates
  if (answers.city && answers.city !== "Autre") {
    if (school.city === answers.city) score += 10;
    else score -= 5; // penalize wrong city
  } else {
    // "Autre" → slight bonus for Abidjan (most schools there)
    if (school.city === "Abidjan") score += 1;
  }

  if (answers.budget === "low" && school.type === "public") score += 4;
  if (answers.budget === "medium") score += 2;
  if (answers.budget === "high" && school.type === "private") score += 2;
  if (answers.schoolType === "public" && school.type === "public") score += 4;
  if (answers.schoolType === "private" && school.type === "private") score += 4;

  if (answers.goal === "fast" && (diplomas.includes("bts") || diplomas.includes("dut") || diplomas.includes("licence"))) score += 3;
  if (answers.goal === "long" && (diplomas.includes("master") || diplomas.includes("doctorat") || diplomas.includes("ingénieur"))) score += 3;

  if (answers.subjects.includes("Mathématiques") || answers.subjects.includes("Physique-Chimie")) {
    if (haystack.includes("polytechnique") || haystack.includes("mines") || haystack.includes("ingéni") || haystack.includes("technique") || haystack.includes("sciences")) score += 3;
  }
  if (answers.subjects.includes("Informatique")) {
    if (haystack.includes("informatique") || haystack.includes("numérique") || haystack.includes("technologie") || haystack.includes("esatic")) score += 3;
  }
  if (answers.subjects.includes("Économie") || answers.domains.some(d => d.includes("Droit"))) {
    if (haystack.includes("droit") || haystack.includes("économie") || haystack.includes("administration") || haystack.includes("gestion")) score += 3;
  }
  if (answers.subjects.includes("Français / Littérature")) {
    if (haystack.includes("lettres") || haystack.includes("communication") || haystack.includes("arts") || haystack.includes("istc")) score += 3;
  }
  if (answers.subjects.includes("Économie") || answers.domains.some(d => d.includes("Finance"))) {
    if (haystack.includes("commerce") || haystack.includes("gestion") || haystack.includes("management") || haystack.includes("iam") || haystack.includes("esca")) score += 3;
  }
  if (answers.domains.some(d => d.includes("Agriculture"))) {
    if (haystack.includes("agriculture") || haystack.includes("agronomie") || haystack.includes("nangui")) score += 3;
  }
  if (answers.domains.some(d => d.includes("Éducation"))) {
    if (haystack.includes("art") || haystack.includes("culture") || haystack.includes("musique") || haystack.includes("design")) score += 3;
  }

  if (["C", "D", "E", "F"].some(s => answers.bac.startsWith(s)) && school.type === "public" && (haystack.includes("polytechnique") || haystack.includes("sciences"))) score += 2;
  if (["A", "B"].some(s => answers.bac.startsWith(s)) && (haystack.includes("lettres") || haystack.includes("commerce") || haystack.includes("administration"))) score += 2;

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

  if (answers.goal === "fast") score += 2;
  if (answers.budget === "low") score += 1;

  if (answers.goal === "fast" && (diploma.includes("bts") || diploma.includes("licence") || diploma.includes("bac"))) score += 2;
  if (answers.goal === "long" && (diploma.includes("master") || diploma.includes("doctorat") || diploma.includes("ingénieur"))) score += 2;

  if (answers.subjects.includes("Droit / Économie")) {
    if (haystack.includes("magistrat") || haystack.includes("trésor") || haystack.includes("impôt") || haystack.includes("douane") || haystack.includes("administrat") || haystack.includes("économie") || haystack.includes("droit")) score += 3;
  }
  if (answers.subjects.includes("Mathématiques") || answers.subjects.includes("Physique-Chimie")) {
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
  const { t } = useT();
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<Answers>({
    studyLevel: "", bac: "", domains: [], subjects: [], budget: "",
    schoolType: "", city: "", goal: "", availability: "",
  });
  const [showResults, setShowResults] = useState(false);

  const { data: schools = [] } = useListSchools();
  const { data: competitions = [] } = useListCompetitions();

  // Translated option lists — values stay French for scoring engine
  const studyLevelOptions = STUDY_LEVELS.map(v => ({ value: v, label: v }));

  const bacOptions = [
    ...BAC_SERIES_VALUES.map(v => ({ value: v, label: v })),
    { value: "Autre", label: t("orient_other") },
  ];

  const subjectOptions = [
    ...SUBJECT_VALUES.map(value => ({ value, label: value })),
  ];
  const domainOptions = DOMAIN_VALUES.map(value => ({ value, label: value }));

  const budgetOptions = [
    { value: "low", label: t("orient_budget_low_label"), sub: t("orient_budget_low_sub") },
    { value: "medium", label: t("orient_budget_medium_label"), sub: t("orient_budget_medium_sub") },
    { value: "high", label: t("orient_budget_high_label"), sub: t("orient_budget_high_sub") },
  ];

  const cityOptions = [
    ...CITIES.map(v => ({ value: v, label: v })),
    { value: "Autre", label: t("orient_other") },
  ];

  const goalOptions = [
    { value: "fast", label: t("orient_goal_fast"), sub: t("orient_goal_fast_sub") },
    { value: "long", label: t("orient_goal_long"), sub: t("orient_goal_long_sub") },
  ];
  const schoolTypeOptions = [
    { value: "public", label: "Public uniquement" },
    { value: "private", label: "Privé uniquement" },
    { value: "both", label: "Les deux m'intéressent" },
  ];
  const availabilityOptions = [
    { value: "now", label: "Dès cette année" },
    { value: "next", label: "L'année prochaine" },
    { value: "later", label: "Dans 2 ans ou plus" },
    { value: "info", label: "Je cherche juste à m'informer" },
  ];

  const handleNext = () => {
    if (step < 9) setStep((s) => (s + 1) as Step);
    else setShowResults(true);
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({ studyLevel: "", bac: "", domains: [], subjects: [], budget: "", schoolType: "", city: "", goal: "", availability: "" });
    setShowResults(false);
  };

  const canContinue = (): boolean => {
    if (step === 1) return !!answers.studyLevel;
    if (step === 2) return !!answers.bac;
    if (step === 3) return answers.domains.length > 0;
    if (step === 4) return answers.subjects.length > 0;
    if (step === 5) return !!answers.budget;
    if (step === 6) return !!answers.schoolType;
    if (step === 7) return !!answers.city;
    if (step === 8) return !!answers.goal;
    if (step === 9) return !!answers.availability;
    return true;
  };

  const recommendedSchools = (() => {
    const scored = schools
      .map(s => ({ ...s, score: scoreSchool(s as any, answers) }))
      .sort((a, b) => b.score - a.score);

    if (answers.city && answers.city !== "Autre") {
      // Hard filter: only schools in the chosen city
      const inCity = scored.filter(s => s.city === answers.city && s.score > 0);
      if (inCity.length > 0) return inCity.slice(0, 5);
      // Fallback: no schools in that city — show best overall
      return scored.filter(s => s.score > 0).slice(0, 5);
    }
    return scored.filter(s => s.score > 0).slice(0, 5);
  })();

  const recommendedCompetitions = competitions
    .map(c => ({ ...c, score: scoreCompetition(c as any, answers) }))
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  if (showResults) {
    return (
      <Layout title={t("orient_title")} showBack noBottomNav onBack={() => setShowResults(false)}>
        <div className="px-4 py-5 pb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">{t("orient_results_title")}</h2>
            <p className="text-muted-foreground text-sm">{t("orient_results_sub")}</p>
          </motion.div>

          {recommendedSchools.length > 0 && (
            <section className="mb-6">
              <h3 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" /> {t("orient_recommended_schools")}
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
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {s.city} · {s.type === "public" ? t("orient_results_school_public") : t("orient_results_school_private")}
                          </p>
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
                <Briefcase className="w-5 h-5 text-secondary" /> {t("orient_recommended_comps")}
              </h3>
              <div className="space-y-2">
                {recommendedCompetitions.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }}>
                    <Link href={`/competitions/${c.id}`}>
                      <div className="flex items-center gap-3 bg-card border border-border/50 rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-all">
                        <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase shrink-0 ${c.status === "open" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                          {c.status === "open" ? t("competitions_open") : t("competitions_upcoming")}
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
              <p className="mb-4">{t("orient_no_match")}</p>
              <Link href="/schools">
                <div className="inline-block bg-primary text-white px-6 py-3 rounded-2xl font-semibold text-sm">
                  {t("orient_see_all_schools")}
                </div>
              </Link>
            </div>
          )}

          <button onClick={handleReset} className="w-full mt-4 py-4 rounded-2xl border-2 border-border text-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
            <RotateCcw className="w-4 h-4" /> {t("orient_restart")}
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t("orient_title")} showBack noBottomNav>
      <div className="px-4 pt-5 pb-12">
        {/* Progress bar */}
        {step > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{t("orient_question")} {step}/9</span>
              <span>{Math.round((Math.min(step, 9) / 9) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full"
                animate={{ width: `${(Math.min(step, 9) / 9) * 100}%` }}
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
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">{t("orient_intro_title")}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8 px-4">
                {t("orient_intro_text")}
              </p>
              <button
                onClick={() => setStep(1)}
                className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" /> {t("orient_start")}
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <QuizStep
              key="step1"
              question="Quel est ton niveau d'études actuel ?"
              options={studyLevelOptions}
              selected={[answers.studyLevel]}
              onSelect={(v) => setAnswers({ ...answers, studyLevel: v })}
              multi={false} onNext={handleNext} canContinue={canContinue()}
              continueLabel={t("orient_continue")} multiHint={t("orient_multi_hint")}
            />
          )}
          {step === 2 && (
            <QuizStep
              key="step2"
              question={t("orient_q_bac")}
              options={bacOptions}
              selected={[answers.bac]}
              onSelect={(v) => setAnswers({ ...answers, bac: v })}
              multi={false} onNext={handleNext} canContinue={canContinue()}
              continueLabel={t("orient_continue")} multiHint={t("orient_multi_hint")}
            />
          )}
          {step === 3 && (
            <QuizStep
              key="step3" question="Quels domaines t'intéressent le plus ?"
              options={domainOptions} selected={answers.domains}
              onSelect={(v) => setAnswers({ ...answers, domains: answers.domains.includes(v) ? answers.domains.filter(s => s !== v) : [...answers.domains, v] })}
              multi={true} onNext={handleNext} canContinue={canContinue()}
              continueLabel={t("orient_continue")} multiHint={t("orient_multi_hint")}
            />
          )}
          {step === 4 && (
            <QuizStep
              key="step4" question={t("orient_q_subjects")} options={subjectOptions}
              selected={answers.subjects}
              onSelect={(v) => setAnswers({ ...answers, subjects: answers.subjects.includes(v) ? answers.subjects.filter(s => s !== v) : [...answers.subjects, v] })}
              multi={true} onNext={handleNext} canContinue={canContinue()}
              continueLabel={t("orient_continue")} multiHint={t("orient_multi_hint")}
            />
          )}
          {step === 5 && (
            <QuizStep
              key="step5" question={t("orient_q_budget")} options={budgetOptions}
              selected={[answers.budget]} onSelect={(v) => setAnswers({ ...answers, budget: v })}
              multi={false} onNext={handleNext} canContinue={canContinue()}
              continueLabel={t("orient_continue")} multiHint={t("orient_multi_hint")}
            />
          )}
          {step === 6 && (
            <QuizStep
              key="step6" question="Quel type d'établissement préfères-tu ?"
              options={schoolTypeOptions} selected={[answers.schoolType]}
              onSelect={(v) => setAnswers({ ...answers, schoolType: v })}
              multi={false} onNext={handleNext} canContinue={canContinue()}
              continueLabel={t("orient_continue")} multiHint={t("orient_multi_hint")}
            />
          )}
          {step === 7 && (
            <QuizStep
              key="step7" question={t("orient_q_city")} options={cityOptions}
              selected={[answers.city]} onSelect={(v) => setAnswers({ ...answers, city: v })}
              multi={false} onNext={handleNext} canContinue={canContinue()}
              continueLabel={t("orient_continue")} multiHint={t("orient_multi_hint")}
            />
          )}
          {step === 8 && (
            <QuizStep
              key="step8" question={t("orient_q_goal")} options={goalOptions}
              selected={[answers.goal]} onSelect={(v) => setAnswers({ ...answers, goal: v })}
              multi={false} onNext={handleNext} canContinue={canContinue()}
              continueLabel={t("orient_continue")} multiHint={t("orient_multi_hint")}
            />
          )}
          {step === 9 && (
            <QuizStep
              key="step9" question="Quand veux-tu commencer tes études ?"
              options={availabilityOptions} selected={[answers.availability]}
              onSelect={(v) => setAnswers({ ...answers, availability: v })}
              multi={false} onNext={handleNext} canContinue={canContinue()} isLast
              continueLabel={t("orient_continue")} lastLabel={t("orient_see_results")}
              multiHint={t("orient_multi_hint")}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

function QuizStep({
  question, options, selected, onSelect, multi, onNext, canContinue, isLast = false,
  continueLabel, lastLabel, multiHint,
}: {
  question: string;
  options: { value: string; label: string; sub?: string }[];
  selected: string[];
  onSelect: (v: string) => void;
  multi: boolean;
  onNext: () => void;
  canContinue: boolean;
  isLast?: boolean;
  continueLabel: string;
  lastLabel?: string;
  multiHint: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
      <h2 className="font-display text-xl font-bold text-foreground mb-5">{question}</h2>
      {multi && <p className="text-xs text-muted-foreground mb-4">{multiHint}</p>}
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
        {isLast ? (lastLabel ?? continueLabel) : continueLabel}
      </button>
    </motion.div>
  );
}

import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, GraduationCap, Briefcase, Trash2, Check, X, Clock,
  BarChart3, FileText, ChevronDown, ChevronUp, ExternalLink,
  RefreshCw, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useT } from "@/lib/useT";

type Status = "en_cours" | "inscrit" | "admis" | "refuse";

interface VerifResult {
  statut: "admis" | "refuse" | "en_attente" | "erreur";
  message: string;
  details?: string;
  checkedAt: string;
}

interface Candidature {
  id: string;
  type: "concours" | "ecole";
  nomConcours: string;
  institution: string;
  annee: string;
  numeroCandidat: string;
  nomComplet: string;
  dateNaissance: string;
  urlResultats: string;
  datePublication: string;
  status: Status;
  addedAt: string;
  notes?: string;
  verif?: VerifResult | null;
  timelineStep?: number;
  timelineDates?: Record<number, string>;
}

const TIMELINE_STEPS = [
  { id: 1, label: "Candidature envoyée", icon: "📝" },
  { id: 2, label: "Dossier reçu", icon: "📨" },
  { id: 3, label: "Convocation au concours", icon: "🧪" },
  { id: 4, label: "Épreuve passée", icon: "✏️" },
  { id: 5, label: "Admissible", icon: "✅" },
  { id: 6, label: "Épreuve orale", icon: "🎤" },
  { id: 7, label: "Résultat final", icon: "🎉" },
] as const;

function getTimelineStep(candidature: Candidature) {
  if (candidature.timelineStep) return candidature.timelineStep;
  if (candidature.status === "admis" || candidature.status === "refuse") return 7;
  if (candidature.status === "inscrit") return 2;
  return 1;
}

const STATUS_CONFIG: Record<Status, {
  labelKey: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  en_cours: { labelKey: "cand_status_pending",    color: "text-blue-700 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-900/20",   border: "border-blue-200 dark:border-blue-700",   icon: Clock },
  inscrit:  { labelKey: "cand_status_registered", color: "text-primary",                       bg: "bg-primary/10",                    border: "border-primary/30",                      icon: Check },
  admis:    { labelKey: "cand_status_admitted",   color: "text-secondary",                     bg: "bg-secondary/10",                  border: "border-secondary/30",                    icon: Check },
  refuse:   { labelKey: "cand_status_rejected",   color: "text-red-600 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-900/20",     border: "border-red-200 dark:border-red-700",     icon: X },
};

const STORAGE_KEY = (uid: number) => `competences_ci_candidatures_v2_${uid}`;
const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") + "/api";

export default function Candidatures() {
  const { user } = useAuth();
  const { t, language } = useT();
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ id: string; draft: string } | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);

  const locale = language === "en" ? "en-US" : "fr-CI";

  useEffect(() => {
    if (!user) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY(user.id));
      if (stored) setCandidatures(JSON.parse(stored));
    } catch {}
  }, [user?.id]);

  // Auto-vérification quotidienne
  useEffect(() => {
    if (!user || candidatures.length === 0) return;
    const autoVerify = async () => {
      const today = new Date();
      let changed = false;
      const updated = [...candidatures];
      for (let i = 0; i < updated.length; i++) {
        const c = updated[i];
        if (!c.urlResultats) continue;
        if (c.status === "admis" || c.status === "refuse") continue;
        const datePubli = c.datePublication ? new Date(c.datePublication) : null;
        if (datePubli && datePubli > today) continue;
        const lastCheck = c.verif?.checkedAt ? new Date(c.verif.checkedAt) : null;
        if (lastCheck && today.getTime() - lastCheck.getTime() < 20 * 60 * 60 * 1000) continue;
        try {
          const res = await verifyOne(c);
          updated[i] = { ...c, verif: res };
          if (res.statut === "admis") updated[i].status = "admis";
          if (res.statut === "refuse") updated[i].status = "refuse";
          changed = true;
        } catch {}
      }
      if (changed) save(updated);
    };
    autoVerify();
  }, [user?.id]);

  const save = (updated: Candidature[]) => {
    setCandidatures(updated);
    if (user) localStorage.setItem(STORAGE_KEY(user.id), JSON.stringify(updated));
  };

  const deleteItem = (id: string) => {
    save(candidatures.filter(c => c.id !== id));
    setConfirmDeleteId(null);
    setExpandedId(null);
  };

  const updateStatus = (id: string, status: Status) =>
    save(candidatures.map(c => c.id === id ? {
      ...c,
      status,
      timelineStep: status === "admis" || status === "refuse"
        ? 7
        : status === "inscrit" ? Math.max(getTimelineStep(c), 2) : c.timelineStep,
    } : c));

  const advanceTimeline = (id: string) => {
    save(candidatures.map(c => {
      if (c.id !== id) return c;
      const next = Math.min(getTimelineStep(c) + 1, TIMELINE_STEPS.length);
      return {
        ...c,
        timelineStep: next,
        timelineDates: { ...(c.timelineDates ?? {}), [next]: new Date().toISOString() },
        status: next === TIMELINE_STEPS.length ? "admis" : c.status,
      };
    }));
  };

  const saveNotes = () => {
    if (!editingNotes) return;
    save(candidatures.map(c => c.id === editingNotes.id ? { ...c, notes: editingNotes.draft } : c));
    setEditingNotes(null);
  };

  const verifyOne = async (c: Candidature): Promise<VerifResult> => {
    const resp = await fetch(`${API_BASE}/verifier-resultat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: c.urlResultats,
        numeroCandidat: c.numeroCandidat,
        nomComplet: c.nomComplet,
        dateNaissance: c.dateNaissance,
      }),
    });
    const data = await resp.json();
    return { ...data, checkedAt: new Date().toISOString() };
  };

  const handleVerify = async (id: string) => {
    const c = candidatures.find(c => c.id === id);
    if (!c || !c.urlResultats) return;
    setVerifying(id);
    try {
      const result = await verifyOne(c);
      save(candidatures.map(item =>
        item.id === id
          ? {
              ...item,
              verif: result,
              status: result.statut === "admis" ? "admis" : result.statut === "refuse" ? "refuse" : item.status,
            }
          : item
      ));
    } catch {
      save(candidatures.map(item =>
        item.id === id
          ? { ...item, verif: { statut: "erreur", message: t("cand_result_error"), checkedAt: new Date().toISOString() } }
          : item
      ));
    } finally {
      setVerifying(null);
    }
  };

  const stats = {
    total: candidatures.length,
    admis: candidatures.filter(c => c.status === "admis").length,
    en_attente: candidatures.filter(c => c.status === "inscrit" || c.status === "en_cours").length,
    refuse: candidatures.filter(c => c.status === "refuse").length,
  };

  return (
    <Layout title={t("cand_title")} showBack noBottomNav>
      <div className="pb-12 bg-background min-h-screen">

        {/* Stats */}
        <AnimatePresence>
          {candidatures.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="px-4 pt-4 grid grid-cols-4 gap-2 mb-4"
            >
              {[
                { label: t("cand_total"),         value: stats.total,      color: "text-foreground" },
                { label: t("cand_pending"),        value: stats.en_attente, color: "text-blue-600 dark:text-blue-400" },
                { label: t("cand_admitted"),       value: stats.admis,      color: "text-secondary" },
                { label: t("cand_stats_rejected"), value: stats.refuse,     color: "text-red-500" },
              ].map((s, i) => (
                <div key={i} className="bg-card border border-border/50 rounded-2xl p-2.5 text-center shadow-sm">
                  <div className={`text-xl font-bold font-display ${s.color}`}>{s.value}</div>
                  <div className="text-[9px] text-muted-foreground font-medium mt-0.5 leading-tight">{s.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-4 pb-4">
          <button
            onClick={() => setShowAdd(true)}
            className="w-full py-3.5 rounded-2xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/20 active:scale-[0.98] transition-all mb-4"
          >
            <Plus className="w-5 h-5" /> {t("cand_add")}
          </button>

          <AnimatePresence mode="popLayout">
            {candidatures.length === 0 && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 px-6">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-5">
                  <BarChart3 className="w-9 h-9 text-muted-foreground/50" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{t("cand_empty_title")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("cand_empty_sub")}</p>
              </motion.div>
            )}

            {candidatures.map((c) => {
              const cfg = STATUS_CONFIG[c.status];
              const StatusIcon = cfg.icon;
              const isExpanded = expandedId === c.id;
              const isVerifying = verifying === c.id;
              const isEditingNotes = editingNotes?.id === c.id;

              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-card border border-border/50 rounded-2xl shadow-sm mb-3 overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 p-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      c.type === "ecole" ? "bg-primary/10" : "bg-secondary/10"
                    )}>
                      {c.type === "ecole"
                        ? <GraduationCap className="w-5 h-5 text-primary" />
                        : <Briefcase className="w-5 h-5 text-secondary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground leading-tight">{c.nomConcours}</p>
                      {c.institution && <p className="text-xs text-muted-foreground mt-0.5">{c.institution}</p>}
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {c.annee} · {t("cand_added_on")} {new Date(c.addedAt).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <div className={cn("flex items-center gap-1 px-2 py-1 rounded-xl border text-[10px] font-bold shrink-0", cfg.bg, cfg.color, cfg.border)}>
                      <StatusIcon className="w-3 h-3" />
                      {t(cfg.labelKey)}
                    </div>
                  </div>

                  {/* Status selector */}
                  <div className="px-4 pb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([key, config]) => (
                        <button key={key} onClick={() => updateStatus(c.id, key)}
                          className={cn(
                            "px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all active:scale-95",
                            c.status === key ? `${config.bg} ${config.color} ${config.border}` : "bg-muted border-border text-muted-foreground"
                          )}>
                          {t(config.labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Progression timeline */}
                  <div className="mx-4 mb-4 rounded-2xl border border-border/50 bg-muted/20 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold text-foreground">Progression du dossier</p>
                      <span className="text-[10px] font-bold text-primary">
                        Étape {getTimelineStep(c)}/{TIMELINE_STEPS.length}
                      </span>
                    </div>
                    <div className="space-y-0">
                      {TIMELINE_STEPS.map((step, index) => {
                        const currentStep = getTimelineStep(c);
                        const isDone = step.id <= currentStep;
                        const isCurrent = step.id === currentStep;
                        const date = c.timelineDates?.[step.id];
                        return (
                          <div key={step.id} className="flex gap-3 min-h-12">
                            <div className="flex flex-col items-center">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm",
                                isDone ? "bg-primary text-white" : "bg-muted border border-border text-muted-foreground"
                              )}>
                                {isDone ? <Check className="w-4 h-4" /> : step.icon}
                              </div>
                              {index < TIMELINE_STEPS.length - 1 && (
                                <div className={cn("w-0.5 flex-1 min-h-4", step.id < currentStep ? "bg-primary" : "bg-border")} />
                              )}
                            </div>
                            <div className="pb-3 pt-1">
                              <p className={cn("text-xs font-semibold", isDone ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
                              {date && <p className="text-[10px] text-muted-foreground">{new Date(date).toLocaleDateString(locale)}</p>}
                              {isCurrent && step.id < TIMELINE_STEPS.length && (
                                <button onClick={() => advanceTimeline(c.id)} className="mt-1.5 text-[10px] font-bold text-primary hover:underline">
                                  Marquer comme terminé →
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Verify button */}
                  {c.urlResultats && (
                    <div className="px-4 pb-3">
                      <button
                        onClick={() => handleVerify(c.id)}
                        disabled={isVerifying}
                        className={cn(
                          "w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition-all active:scale-[0.98]",
                          "bg-orange-500/10 border-orange-400/30 text-orange-600 dark:text-orange-400",
                          isVerifying && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        <RefreshCw className={cn("w-4 h-4", isVerifying && "animate-spin")} />
                        {isVerifying ? t("cand_verify_checking") : t("cand_verify_btn")}
                      </button>

                      {/* Verification result */}
                      <AnimatePresence>
                        {c.verif && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-2"
                          >
                            {c.verif.statut === "admis" && (
                              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-3 flex items-start gap-2">
                                <span className="text-2xl leading-none">🎉</span>
                                <div>
                                  <p className="text-green-700 dark:text-green-400 font-bold text-sm">{t("cand_result_admis_title")}</p>
                                  {c.verif.details && <p className="text-green-600 dark:text-green-500 text-xs mt-0.5 leading-relaxed">{c.verif.details}</p>}
                                </div>
                              </div>
                            )}
                            {c.verif.statut === "refuse" && (
                              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3 flex items-start gap-2">
                                <span className="text-2xl leading-none">😔</span>
                                <div>
                                  <p className="text-red-600 dark:text-red-400 font-bold text-sm">{t("cand_result_refuse_title")}</p>
                                  <p className="text-red-500 dark:text-red-500 text-xs mt-0.5">{t("cand_result_refuse_sub")}</p>
                                </div>
                              </div>
                            )}
                            {c.verif.statut === "en_attente" && (
                              <div className="bg-muted border border-border rounded-xl p-3 flex items-center gap-2">
                                <span className="text-xl leading-none">⏳</span>
                                <p className="text-muted-foreground text-xs">
                                  {c.datePublication
                                    ? `${t("cand_result_pending_prefix")} ${new Date(c.datePublication).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}`
                                    : c.verif.message}
                                </p>
                              </div>
                            )}
                            {c.verif.statut === "erreur" && (
                              <div className="bg-muted border border-border rounded-xl p-3 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                                <p className="text-muted-foreground text-xs">{c.verif.message}</p>
                              </div>
                            )}
                            {c.verif.checkedAt && (
                              <p className="text-[10px] text-muted-foreground/50 mt-1 px-1">
                                {t("cand_result_checked")} {new Date(c.verif.checkedAt).toLocaleString(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Notes + details toggle */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    className="w-full px-4 py-2.5 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground hover:bg-muted/30 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      {t("cand_notes_label")}
                      {c.notes && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 space-y-3">
                          {/* Candidate info recap */}
                          <div className="bg-muted/50 rounded-xl px-3 py-2.5 space-y-1 text-xs text-muted-foreground">
                            {c.numeroCandidat && <p><span className="font-medium">{t("cand_form_numero")} :</span> {c.numeroCandidat}</p>}
                            {c.nomComplet && <p><span className="font-medium">{t("cand_form_nom_complet")} :</span> {c.nomComplet}</p>}
                            {c.dateNaissance && <p><span className="font-medium">{t("cand_form_date_naissance")} :</span> {c.dateNaissance}</p>}
                            {c.urlResultats && (
                              <a href={c.urlResultats} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1 text-primary font-medium mt-1">
                                <ExternalLink className="w-3 h-3" /> {t("cand_form_url")}
                              </a>
                            )}
                          </div>

                          {/* Notes */}
                          {isEditingNotes ? (
                            <div className="space-y-2">
                              <textarea
                                autoFocus
                                value={editingNotes.draft}
                                onChange={e => setEditingNotes({ ...editingNotes, draft: e.target.value })}
                                placeholder={t("cand_notes_placeholder")}
                                rows={3}
                                className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none"
                              />
                              <div className="flex gap-2">
                                <button onClick={saveNotes} className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-bold active:scale-[0.97] transition-all">
                                  {t("cand_save_notes")}
                                </button>
                                <button onClick={() => setEditingNotes(null)} className="px-4 py-2 rounded-xl bg-muted border border-border text-xs font-semibold text-muted-foreground active:scale-[0.97] transition-all">
                                  {t("cancel")}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingNotes({ id: c.id, draft: c.notes ?? "" })}
                              className="w-full text-left px-3 py-2.5 rounded-xl bg-muted border border-border text-sm text-muted-foreground min-h-[44px] active:opacity-70 transition-opacity"
                            >
                              {c.notes || <span className="italic opacity-50">{t("cand_notes_placeholder")}</span>}
                            </button>
                          )}

                          {/* Delete */}
                          <div className="flex justify-end">
                            {confirmDeleteId === c.id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{t("cand_delete_confirm")}</span>
                                <button onClick={() => deleteItem(c.id)} className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-bold active:scale-95">
                                  {t("cand_delete_yes")}
                                </button>
                                <button onClick={() => setConfirmDeleteId(null)} className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-bold active:scale-95">
                                  {t("cand_delete_no")}
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setConfirmDeleteId(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors active:scale-90">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <AddModal
            onClose={() => setShowAdd(false)}
            onAdd={(item) => {
              save([{ id: Date.now().toString(), ...item, status: "en_cours", addedAt: new Date().toISOString() }, ...candidatures]);
              setShowAdd(false);
            }}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}

type FormData = {
  type: "concours" | "ecole";
  nomConcours: string;
  institution: string;
  annee: string;
  numeroCandidat: string;
  nomComplet: string;
  dateNaissance: string;
  urlResultats: string;
  datePublication: string;
  notes: string;
};

function AddModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (item: Omit<Candidature, "id" | "status" | "addedAt">) => void;
}) {
  const { t } = useT();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormData>({
    type: "concours",
    nomConcours: "",
    institution: "",
    annee: new Date().getFullYear().toString(),
    numeroCandidat: "",
    nomComplet: "",
    dateNaissance: "",
    urlResultats: "",
    datePublication: "",
    notes: "",
  });

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.nomConcours.trim()) return;
    onAdd({
      type: form.type,
      nomConcours: form.nomConcours.trim(),
      institution: form.institution.trim(),
      annee: form.annee,
      numeroCandidat: form.numeroCandidat.trim(),
      nomComplet: form.nomComplet.trim(),
      dateNaissance: form.dateNaissance,
      urlResultats: form.urlResultats.trim(),
      datePublication: form.datePublication,
      notes: form.notes.trim() || undefined,
    } as Omit<Candidature, "id" | "status" | "addedAt">);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50";
  const labelClass = "block text-xs font-semibold text-muted-foreground mb-1.5";
  const sectionClass = "text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-background rounded-t-3xl w-full max-w-md flex flex-col"
        style={{ maxHeight: "92dvh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle + title */}
        <div className="px-6 pt-4 pb-3 shrink-0 border-b border-border/50">
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display font-bold text-lg">{t("cand_modal_title")}</h3>
            <div className="flex gap-1">
              {[1, 2].map(s => (
                <div key={s} className={cn("w-6 h-1.5 rounded-full transition-all", step >= s ? "bg-primary" : "bg-muted")} />
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable form */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

              {/* Type */}
              <div className="flex gap-2 mb-5">
                {(["concours", "ecole"] as const).map(typ => (
                  <button key={typ} onClick={() => set("type", typ)}
                    className={cn("flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all",
                      form.type === typ ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground"
                    )}>
                    {typ === "concours" ? t("cand_type_concours") : t("cand_type_ecole")}
                  </button>
                ))}
              </div>

              <p className={sectionClass}>
                <Briefcase className="w-3.5 h-3.5" /> {t("cand_form_section_dossier")}
              </p>

              {/* Nom du concours */}
              <div>
                <label className={labelClass}>{t("cand_form_nom_concours")} *</label>
                <input value={form.nomConcours} onChange={e => set("nomConcours", e.target.value)}
                  placeholder={t("cand_form_nom_concours_ph")} className={inputClass} autoFocus />
              </div>

              {/* Institution */}
              <div>
                <label className={labelClass}>{t("cand_form_institution")}</label>
                <input value={form.institution} onChange={e => set("institution", e.target.value)}
                  placeholder={t("cand_form_institution_ph")} className={inputClass} />
              </div>

              {/* Année */}
              <div>
                <label className={labelClass}>{t("cand_form_annee")}</label>
                <select value={form.annee} onChange={e => set("annee", e.target.value)} className={inputClass}>
                  {["2027", "2026", "2025", "2024"].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              {/* Numéro candidat */}
              <div>
                <label className={labelClass}>{t("cand_form_numero")}</label>
                <input value={form.numeroCandidat} onChange={e => set("numeroCandidat", e.target.value)}
                  placeholder={t("cand_form_numero_ph")} className={inputClass} />
              </div>

              {/* Nom complet */}
              <div>
                <label className={labelClass}>{t("cand_form_nom_complet")}</label>
                <input value={form.nomComplet} onChange={e => set("nomComplet", e.target.value)}
                  placeholder={t("cand_form_nom_complet_ph")} className={inputClass} />
              </div>

              {/* Date de naissance */}
              <div>
                <label className={labelClass}>{t("cand_form_date_naissance")}</label>
                <input type="date" value={form.dateNaissance} onChange={e => set("dateNaissance", e.target.value)} className={inputClass} />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className={sectionClass}>
                <FileText className="w-3.5 h-3.5" /> {t("cand_form_section_resultats")}
              </p>

              {/* URL résultats */}
              <div>
                <label className={labelClass}>{t("cand_form_url")}</label>
                <input type="url" value={form.urlResultats} onChange={e => set("urlResultats", e.target.value)}
                  placeholder={t("cand_form_url_ph")} className={inputClass} />
                <p className="text-[10px] text-muted-foreground mt-1 px-1">
                  Utilisé pour la vérification automatique des résultats
                </p>
              </div>

              {/* Date publication */}
              <div>
                <label className={labelClass}>{t("cand_form_date_publi")}</label>
                <input type="date" value={form.datePublication} onChange={e => set("datePublication", e.target.value)} className={inputClass} />
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass}>{t("cand_notes_label")}</label>
                <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
                  placeholder={t("cand_notes_placeholder")} rows={3}
                  className={cn(inputClass, "resize-none")} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="px-6 pb-8 pt-3 border-t border-border/50 shrink-0 flex gap-3">
          {step === 2 && (
            <button onClick={() => setStep(1)}
              className="px-4 py-3.5 rounded-2xl border border-border font-semibold text-sm text-muted-foreground active:scale-[0.98] transition-all">
              ← 
            </button>
          )}
          {step === 1 ? (
            <button onClick={() => setStep(2)} disabled={!form.nomConcours.trim()}
              className="flex-1 py-3.5 rounded-2xl bg-primary text-white font-bold text-sm disabled:opacity-40 active:scale-[0.98] transition-all">
              {t("orient_continue")} →
            </button>
          ) : (
            <button onClick={handleSubmit}
              className="flex-1 py-3.5 rounded-2xl bg-primary text-white font-bold text-sm active:scale-[0.98] transition-all">
              {t("cand_add_btn")}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

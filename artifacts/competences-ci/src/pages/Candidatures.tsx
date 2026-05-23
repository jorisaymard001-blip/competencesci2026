import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, GraduationCap, Briefcase, ChevronRight, Trash2,
  Check, X, Clock, BarChart3, FileText, Search, ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useT } from "@/lib/useT";
import { useListSchools, useListCompetitions } from "@workspace/api-client-react";

type Status = "en_cours" | "inscrit" | "admis" | "refuse";
type ItemType = "school" | "competition";

interface Candidature {
  id: string;
  type: ItemType;
  name: string;
  subtitle?: string;
  referenceId: number;
  status: Status;
  addedAt: string;
  notes?: string;
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

const STORAGE_KEY = (uid: number) => `competences_ci_candidatures_${uid}`;

export default function Candidatures() {
  const { user } = useAuth();
  const { t, language } = useT();
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ id: string; draft: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY(user.id));
      if (stored) setCandidatures(JSON.parse(stored));
    } catch {}
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
    save(candidatures.map(c => c.id === id ? { ...c, status } : c));

  const saveNotes = () => {
    if (!editingNotes) return;
    save(candidatures.map(c => c.id === editingNotes.id ? { ...c, notes: editingNotes.draft } : c));
    setEditingNotes(null);
  };

  const stats = {
    total: candidatures.length,
    admis: candidatures.filter(c => c.status === "admis").length,
    en_attente: candidatures.filter(c => c.status === "inscrit" || c.status === "en_cours").length,
    refuse: candidatures.filter(c => c.status === "refuse").length,
  };

  const locale = language === "en" ? "en-US" : "fr-CI";

  return (
    <Layout title={t("cand_title")} showBack noBottomNav>
      <div className="pb-12 bg-background min-h-screen">

        {/* Stats banner */}
        <AnimatePresence>
          {candidatures.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="px-4 pt-4 grid grid-cols-4 gap-2 mb-4"
            >
              {[
                { label: t("cand_total"),          value: stats.total,      color: "text-foreground" },
                { label: t("cand_pending"),         value: stats.en_attente, color: "text-blue-600 dark:text-blue-400" },
                { label: t("cand_admitted"),        value: stats.admis,      color: "text-secondary" },
                { label: t("cand_stats_rejected"),  value: stats.refuse,     color: "text-red-500" },
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
          {/* Add button */}
          <button
            onClick={() => setShowAdd(true)}
            className="w-full py-3.5 rounded-2xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/20 active:scale-[0.98] transition-all mb-4"
          >
            <Plus className="w-5 h-5" /> {t("cand_add")}
          </button>

          <AnimatePresence mode="popLayout">
            {/* Empty state */}
            {candidatures.length === 0 && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 px-6">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-5">
                  <BarChart3 className="w-9 h-9 text-muted-foreground/50" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{t("cand_empty_title")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">{t("cand_empty_sub")}</p>
                <div className="flex gap-3 justify-center">
                  <Link href="/schools">
                    <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold">
                      <GraduationCap className="w-4 h-4" /> {t("nav_schools")}
                    </div>
                  </Link>
                  <Link href="/competitions">
                    <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary/10 text-secondary text-sm font-semibold">
                      <Briefcase className="w-4 h-4" /> {t("nav_competitions")}
                    </div>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Cards */}
            {candidatures.map((c) => {
              const cfg = STATUS_CONFIG[c.status];
              const StatusIcon = cfg.icon;
              const isExpanded = expandedId === c.id;
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
                  {/* Header row */}
                  <div className="flex items-start gap-3 p-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      c.type === "school" ? "bg-primary/10" : "bg-secondary/10"
                    )}>
                      {c.type === "school"
                        ? <GraduationCap className="w-5 h-5 text-primary" />
                        : <Briefcase className="w-5 h-5 text-secondary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground leading-tight">{c.name}</p>
                      {c.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{c.subtitle}</p>}
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {t("cand_added_on")} {new Date(c.addedAt).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div className={cn("flex items-center gap-1 px-2 py-1 rounded-xl border text-[10px] font-bold shrink-0", cfg.bg, cfg.color, cfg.border)}>
                      <StatusIcon className="w-3 h-3" />
                      {t(cfg.labelKey)}
                    </div>
                  </div>

                  {/* Status selector */}
                  <div className="px-4 pb-3 pt-0">
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => updateStatus(c.id, key)}
                          className={cn(
                            "px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all active:scale-95",
                            c.status === key
                              ? `${config.bg} ${config.color} ${config.border}`
                              : "bg-muted border-border text-muted-foreground"
                          )}
                        >
                          {t(config.labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expand toggle */}
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

                  {/* Expanded: notes + actions */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 space-y-3">
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
                                <button
                                  onClick={saveNotes}
                                  className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-bold active:scale-[0.97] transition-all"
                                >
                                  {t("cand_save_notes")}
                                </button>
                                <button
                                  onClick={() => setEditingNotes(null)}
                                  className="px-4 py-2 rounded-xl bg-muted border border-border text-xs font-semibold text-muted-foreground active:scale-[0.97] transition-all"
                                >
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

                          {/* Actions row */}
                          <div className="flex items-center justify-between">
                            <Link href={c.type === "school" ? `/schools/${c.referenceId}` : `/competitions/${c.referenceId}`}>
                              <div className="flex items-center gap-1 text-xs font-semibold text-primary active:opacity-70">
                                {t("cand_view_details")} <ChevronRight className="w-3.5 h-3.5" />
                              </div>
                            </Link>

                            {confirmDeleteId === c.id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{t("cand_delete_confirm")}</span>
                                <button
                                  onClick={() => deleteItem(c.id)}
                                  className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-bold active:scale-95"
                                >
                                  {t("cand_delete_yes")}
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-bold active:scale-95"
                                >
                                  {t("cand_delete_no")}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(c.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors active:scale-90"
                              >
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

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && (
          <AddModal
            onClose={() => setShowAdd(false)}
            onAdd={(item) => {
              const newItem: Candidature = {
                id: Date.now().toString(),
                ...item,
                status: "en_cours",
                addedAt: new Date().toISOString(),
              };
              save([newItem, ...candidatures]);
              setShowAdd(false);
            }}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}

function AddModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (item: { type: ItemType; name: string; subtitle?: string; referenceId: number }) => void;
}) {
  const { t } = useT();
  const [type, setType] = useState<ItemType>("competition");
  const [query, setQuery] = useState("");

  const { data: schools = [] } = useListSchools();
  const { data: competitions = [] } = useListCompetitions();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (type === "competition") {
      const list = q
        ? competitions.filter(c => c.title.toLowerCase().includes(q) || (c.ministry ?? "").toLowerCase().includes(q))
        : competitions.slice(0, 8);
      return list.map(c => ({ id: c.id, name: c.title, subtitle: c.ministry ?? undefined }));
    } else {
      const list = q
        ? schools.filter(s => s.name.toLowerCase().includes(q) || (s.city ?? "").toLowerCase().includes(q))
        : schools.slice(0, 8);
      return list.map(s => ({ id: s.id, name: s.name, subtitle: s.city ?? undefined }));
    }
  }, [type, query, schools, competitions]);

  const handleSelect = (item: { id: number; name: string; subtitle?: string }) => {
    onAdd({ type, name: item.name, subtitle: item.subtitle, referenceId: item.id });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-background rounded-t-3xl w-full max-w-md flex flex-col"
        style={{ maxHeight: "85dvh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle + title */}
        <div className="px-6 pt-4 pb-3 shrink-0">
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
          <h3 className="font-display font-bold text-lg mb-4">{t("cand_modal_title")}</h3>

          {/* Type toggle */}
          <div className="flex gap-2 mb-4">
            {(["competition", "school"] as const).map(typ => (
              <button
                key={typ}
                onClick={() => { setType(typ); setQuery(""); }}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all",
                  type === typ
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted text-muted-foreground"
                )}
              >
                {typ === "competition" ? t("cand_type_competition") : t("cand_type_school")}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={type === "competition" ? t("cand_name_competition") : t("cand_name_school")}
              className="w-full pl-9 pr-4 py-3 rounded-xl bg-muted border border-border text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              autoFocus
            />
          </div>
        </div>

        {/* Results list — scrollable */}
        <div className="overflow-y-auto flex-1 px-6 pb-8">
          {results.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">{t("cand_no_results")}</div>
          ) : (
            <div className="space-y-2 pt-1">
              {results.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-3 bg-card border border-border/50 rounded-2xl px-4 py-3.5 text-left active:scale-[0.98] transition-all hover:border-primary/40"
                >
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                    type === "school" ? "bg-primary/10" : "bg-secondary/10"
                  )}>
                    {type === "school"
                      ? <GraduationCap className="w-4 h-4 text-primary" />
                      : <Briefcase className="w-4 h-4 text-secondary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground leading-tight truncate">{item.name}</p>
                    {item.subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.subtitle}</p>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

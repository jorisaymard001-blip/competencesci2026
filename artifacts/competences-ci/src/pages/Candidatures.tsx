import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, GraduationCap, Briefcase, ChevronRight, Trash2, Check, X, Clock, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

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

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  en_cours: { label: "En cours", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-700", icon: Clock },
  inscrit: { label: "Inscrit(e)", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", icon: Check },
  admis: { label: "Admis(e) ✓", color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/30", icon: Check },
  refuse: { label: "Refusé(e)", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-700", icon: X },
};

const STORAGE_KEY = (uid: number) => `competences_ci_candidatures_${uid}`;

export default function Candidatures() {
  const { user } = useAuth();
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

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

  const deleteItem = (id: string) => save(candidatures.filter(c => c.id !== id));
  const updateStatus = (id: string, status: Status) => save(candidatures.map(c => c.id === id ? { ...c, status } : c));

  const stats = {
    total: candidatures.length,
    admis: candidatures.filter(c => c.status === "admis").length,
    inscrit: candidatures.filter(c => c.status === "inscrit").length,
    en_cours: candidatures.filter(c => c.status === "en_cours").length,
  };

  return (
    <Layout title="Mes candidatures" showBack noBottomNav>
      <div className="pb-12 bg-background min-h-screen">

        {/* Stats banner */}
        {candidatures.length > 0 && (
          <div className="px-4 pt-4 grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Total", value: stats.total, color: "text-foreground" },
              { label: "En attente", value: stats.inscrit + stats.en_cours, color: "text-primary" },
              { label: "Admis(e)", value: stats.admis, color: "text-secondary" },
            ].map((s, i) => (
              <div key={i} className="bg-card border border-border/50 rounded-2xl p-3 text-center shadow-sm">
                <div className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="px-4 pb-4">
          <button
            onClick={() => setShowAdd(true)}
            className="w-full py-3.5 rounded-2xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/20 active:scale-[0.98] transition-all mb-4"
          >
            <Plus className="w-5 h-5" /> Ajouter une candidature
          </button>

          <AnimatePresence mode="popLayout">
            {candidatures.length === 0 && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 px-6">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-5">
                  <BarChart3 className="w-9 h-9 text-muted-foreground/50" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">Aucune candidature</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ajoutez vos candidatures pour suivre leur avancement.
                </p>
              </motion.div>
            )}

            {candidatures.map((c) => {
              const cfg = STATUS_CONFIG[c.status];
              const StatusIcon = cfg.icon;
              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm mb-3"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${c.type === "school" ? "bg-primary/10" : "bg-secondary/10"}`}>
                      {c.type === "school" ? <GraduationCap className="w-5 h-5 text-primary" /> : <Briefcase className="w-5 h-5 text-secondary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground leading-tight">{c.name}</p>
                      {c.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{c.subtitle}</p>}
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        Ajouté le {new Date(c.addedAt).toLocaleDateString("fr-CI", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <button onClick={() => deleteItem(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors active:scale-90">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Status selector */}
                  <div className="mt-3 pt-3 border-t border-border/40">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Statut</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => updateStatus(c.id, key)}
                          className={cn(
                            "px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all active:scale-95",
                            c.status === key ? `${config.bg} ${config.color} ${config.border}` : "bg-muted border-border text-muted-foreground"
                          )}
                        >
                          {config.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Link href={c.type === "school" ? `/schools/${c.referenceId}` : `/competitions/${c.referenceId}`}>
                    <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary active:opacity-70">
                      Voir la fiche <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Add modal */}
        <AnimatePresence>
          {showAdd && (
            <AddModal
              onClose={() => setShowAdd(false)}
              onAdd={(item) => {
                const newItem: Candidature = {
                  id: Date.now().toString(),
                  type: item.type,
                  name: item.name,
                  subtitle: item.subtitle,
                  referenceId: item.referenceId,
                  status: "en_cours",
                  addedAt: new Date().toISOString(),
                };
                save([newItem, ...candidatures]);
                setShowAdd(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

function AddModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (item: { type: ItemType; name: string; subtitle?: string; referenceId: number }) => void;
}) {
  const [type, setType] = useState<ItemType>("competition");
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [refId, setRefId] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({ type, name: name.trim(), subtitle: subtitle.trim() || undefined, referenceId: parseInt(refId) || 0 });
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
        className="bg-background rounded-t-3xl w-full max-w-md p-6 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
        <h3 className="font-display font-bold text-lg mb-4">Ajouter une candidature</h3>

        <div className="flex gap-2 mb-4">
          {(["competition", "school"] as const).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all",
                type === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground"
              )}>
              {t === "competition" ? "🏛️ Concours" : "🎓 École"}
            </button>
          ))}
        </div>

        <div className="space-y-3 mb-5">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={type === "competition" ? "Nom du concours..." : "Nom de l'école..."}
            className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
          />
          <input
            type="text"
            value={subtitle}
            onChange={e => setSubtitle(e.target.value)}
            placeholder="Ministère / Ville (optionnel)"
            className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
          />
          <input
            type="number"
            value={refId}
            onChange={e => setRefId(e.target.value)}
            placeholder="ID de référence (optionnel, pour lien vers la fiche)"
            className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-sm disabled:opacity-40 active:scale-[0.98] transition-all"
        >
          Ajouter
        </button>
      </motion.div>
    </motion.div>
  );
}

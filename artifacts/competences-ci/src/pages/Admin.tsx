import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, GraduationCap, Trophy, BookOpen, Wifi,
  LogOut, Plus, Pencil, Trash2, X, Check, Loader2, Eye, EyeOff,
  RefreshCw, Building2, AlertCircle, ShieldAlert, Link as LinkIcon, Copy, ImageOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

const API = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") + "/api";
const TOKEN_KEY = "cci_admin_token";

type Tab = "competitions" | "schools" | "articles" | "scraping" | "quality";

// ── Helpers ───────────────────────────────────────────────────────────────────

function useAdminFetch(token: string) {
  return useCallback(async (path: string, opts: RequestInit = {}) => {
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...opts.headers },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Erreur réseau" }));
      throw new Error(err.message ?? "Erreur");
    }
    return res.json();
  }, [token]);
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ msg, type, onDone }: { msg: string; type: "ok" | "err"; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
      className={cn("fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold shadow-xl",
        type === "ok" ? "bg-green-600 text-white" : "bg-red-600 text-white")}>
      {type === "ok" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {msg}
    </motion.div>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────

function Modal({ title, onClose, onSave, saving, children }: {
  title: string; onClose: () => void; onSave: () => void; saving: boolean; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="font-black text-white text-lg">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white press">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4">{children}</div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-800">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm press">Annuler</button>
          <button onClick={onSave} disabled={saving}
            className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-black text-sm press disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-500 outline-none transition-colors";
const selectCls = `${inputCls} cursor-pointer`;

// ── Status badges ─────────────────────────────────────────────────────────────

const STATUS_CLS: Record<string, string> = {
  open: "bg-green-500/20 text-green-400 border border-green-500/30",
  upcoming: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  closed: "bg-slate-600/40 text-slate-400 border border-slate-600/40",
  public: "bg-green-500/20 text-green-400 border border-green-500/30",
  private: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
};
const STATUS_LABEL: Record<string, string> = {
  open: "Ouvert", upcoming: "À venir", closed: "Fermé", public: "Public", private: "Privé",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider", STATUS_CLS[status] ?? "bg-slate-700 text-slate-400")}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

// ── Competitions Tab ──────────────────────────────────────────────────────────

type Competition = Record<string, any>;

function CompetitionsTab({ fetch: apiFetch, onToast }: { fetch: (p: string, o?: RequestInit) => Promise<any>; onToast: (m: string, t: "ok" | "err") => void }) {
  const [items, setItems] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; item: Competition | null }>({ open: false, item: null });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Competition>({});
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await apiFetch("/admin/competitions")); }
    catch { onToast("Erreur de chargement", "err"); }
    finally { setLoading(false); }
  }, [apiFetch, onToast]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ status: "upcoming", positions: 0 }); setModal({ open: true, item: null }); };
  const openEdit = (item: Competition) => { setForm({ ...item }); setModal({ open: true, item }); };
  const closeModal = () => setModal({ open: false, item: null });

  const save = async () => {
    if (!form.title || !form.ministry) return onToast("Titre et ministère requis", "err");
    setSaving(true);
    try {
      if (modal.item) await apiFetch(`/admin/competitions/${modal.item.id}`, { method: "PUT", body: JSON.stringify(form) });
      else await apiFetch("/admin/competitions", { method: "POST", body: JSON.stringify(form) });
      onToast(modal.item ? "Concours modifié" : "Concours ajouté", "ok");
      closeModal(); load();
    } catch (e: any) { onToast(e.message, "err"); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    setDeleting(id);
    try { await apiFetch(`/admin/competitions/${id}`, { method: "DELETE" }); onToast("Supprimé", "ok"); load(); }
    catch (e: any) { onToast(e.message, "err"); }
    finally { setDeleting(null); }
  };

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-slate-400 text-sm">{items.length} concours</p>
        <button onClick={openAdd} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl font-black text-sm press">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <StatusBadge status={item.status} />
                  {Number(item.isVerified) === 1 && <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-cyan-300">Vérifié</span>}
                  <span className="text-slate-500 text-xs">{item.positions} postes</span>
                </div>
                <p className="font-bold text-white text-sm leading-snug line-clamp-1">{item.title}</p>
                <p className="text-slate-500 text-xs mt-0.5">{item.ministry}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(item)} className="w-8 h-8 bg-slate-700 rounded-xl flex items-center justify-center text-slate-300 hover:text-white press">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => del(item.id)} disabled={deleting === item.id}
                  className="w-8 h-8 bg-red-900/40 rounded-xl flex items-center justify-center text-red-400 hover:text-red-300 press disabled:opacity-50">
                  {deleting === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {modal.open && (
          <Modal title={modal.item ? "Modifier le concours" : "Nouveau concours"} onClose={closeModal} onSave={save} saving={saving}>
            <Field label="Titre *"><input className={inputCls} value={form.title ?? ""} onChange={e => set("title", e.target.value)} placeholder="Titre du concours" /></Field>
            <Field label="Ministère *"><input className={inputCls} value={form.ministry ?? ""} onChange={e => set("ministry", e.target.value)} placeholder="Ministère" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ville"><input className={inputCls} value={form.city ?? ""} onChange={e => set("city", e.target.value)} placeholder="Abidjan" /></Field>
              <Field label="Niveau requis"><input className={inputCls} value={form.diploma ?? ""} onChange={e => set("diploma", e.target.value)} placeholder="BEPC, BAC…" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Statut">
                <select className={selectCls} value={form.status ?? "upcoming"} onChange={e => set("status", e.target.value)}>
                  <option value="upcoming">À venir</option>
                  <option value="open">Ouvert</option>
                  <option value="closed">Fermé</option>
                </select>
              </Field>
              <Field label="Postes"><input type="number" className={inputCls} value={form.positions ?? 0} onChange={e => set("positions", e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date ouverture"><input type="date" className={inputCls} value={form.openDate ?? ""} onChange={e => set("openDate", e.target.value)} /></Field>
              <Field label="Date clôture"><input type="date" className={inputCls} value={form.closeDate ?? ""} onChange={e => set("closeDate", e.target.value)} /></Field>
            </div>
            <Field label="Description"><textarea className={`${inputCls} resize-none`} rows={3} value={form.description ?? ""} onChange={e => set("description", e.target.value)} placeholder="Description du concours…" /></Field>
            <Field label="Vérification">
              <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-sm text-slate-200">
                <input type="checkbox" checked={Number(form.isVerified) === 1} onChange={e => {
                  set("isVerified", e.target.checked ? 1 : 0);
                  set("verifiedAt", e.target.checked ? (form.verifiedAt || new Date().toISOString()) : null);
                  set("verificationSource", e.target.checked ? (form.verificationSource || "Vérification manuelle") : null);
                }} />
                Vérifié après contrôle manuel
              </label>
              {Number(form.isVerified) === 1 && <input className={inputCls} value={form.verificationSource ?? "Vérification manuelle"} onChange={e => set("verificationSource", e.target.value)} aria-label="Source de vérification" placeholder="Source de vérification" />}
            </Field>
            <Field label="Site web"><input className={inputCls} value={form.website ?? ""} onChange={e => set("website", e.target.value)} placeholder="https://…" /></Field>
            <Field label="Contact"><input className={inputCls} value={form.contact ?? ""} onChange={e => set("contact", e.target.value)} placeholder="Email ou téléphone" /></Field>
            <Field label="Image concours (URL)"><input className={inputCls} value={form.imageUrl ?? ""} onChange={e => set("imageUrl", e.target.value)} placeholder="https://images.unsplash.com/…" /></Field>
            <Field label="Logo organisme (URL)"><input className={inputCls} value={form.logoUrl ?? ""} onChange={e => set("logoUrl", e.target.value)} placeholder="https://…/logo.png" /></Field>
            {(form.imageUrl || form.logoUrl) && (
              <div className="flex gap-3">
                {form.imageUrl && <img src={form.imageUrl} alt="Aperçu image" className="h-20 w-32 object-cover rounded-xl border border-slate-700" onError={e => (e.currentTarget.style.display = "none")} />}
                {form.logoUrl && <img src={form.logoUrl} alt="Aperçu logo" className="h-20 w-20 object-contain rounded-xl border border-slate-700 bg-white p-1" onError={e => (e.currentTarget.style.display = "none")} />}
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Schools Tab ───────────────────────────────────────────────────────────────

type School = Record<string, any>;

function SchoolsTab({ fetch: apiFetch, onToast }: { fetch: (p: string, o?: RequestInit) => Promise<any>; onToast: (m: string, t: "ok" | "err") => void }) {
  const [items, setItems] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; item: School | null }>({ open: false, item: null });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<School>({});
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await apiFetch("/admin/schools")); }
    catch { onToast("Erreur de chargement", "err"); }
    finally { setLoading(false); }
  }, [apiFetch, onToast]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ type: "private" }); setModal({ open: true, item: null }); };
  const openEdit = (item: School) => { setForm({ ...item, domains: (item.domains ?? []).join(", "), diplomas: (item.diplomas ?? []).join(", ") }); setModal({ open: true, item }); };
  const closeModal = () => setModal({ open: false, item: null });

  const save = async () => {
    if (!form.name || !form.city) return onToast("Nom et ville requis", "err");
    setSaving(true);
    const payload = {
      ...form,
      domains: typeof form.domains === "string" ? form.domains.split(",").map((s: string) => s.trim()).filter(Boolean) : form.domains ?? [],
      diplomas: typeof form.diplomas === "string" ? form.diplomas.split(",").map((s: string) => s.trim()).filter(Boolean) : form.diplomas ?? [],
    };
    try {
      if (modal.item) await apiFetch(`/admin/schools/${modal.item.id}`, { method: "PUT", body: JSON.stringify(payload) });
      else await apiFetch("/admin/schools", { method: "POST", body: JSON.stringify(payload) });
      onToast(modal.item ? "École modifiée" : "École ajoutée", "ok");
      closeModal(); load();
    } catch (e: any) { onToast(e.message, "err"); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    setDeleting(id);
    try { await apiFetch(`/admin/schools/${id}`, { method: "DELETE" }); onToast("Supprimé", "ok"); load(); }
    catch (e: any) { onToast(e.message, "err"); }
    finally { setDeleting(null); }
  };

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-slate-400 text-sm">{items.length} établissements</p>
        <button onClick={openAdd} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl font-black text-sm press">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={item.type} />
                  {Number(item.isVerified) === 1 && <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-cyan-300">Vérifié</span>}
                  <span className="text-slate-500 text-xs">{item.city}</span>
                </div>
                <p className="font-bold text-white text-sm leading-snug line-clamp-1">{item.name}</p>
                <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{(item.domains ?? []).slice(0, 3).join(" · ")}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(item)} className="w-8 h-8 bg-slate-700 rounded-xl flex items-center justify-center text-slate-300 hover:text-white press">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => del(item.id)} disabled={deleting === item.id}
                  className="w-8 h-8 bg-red-900/40 rounded-xl flex items-center justify-center text-red-400 hover:text-red-300 press disabled:opacity-50">
                  {deleting === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {modal.open && (
          <Modal title={modal.item ? "Modifier l'école" : "Nouvelle école"} onClose={closeModal} onSave={save} saving={saving}>
            <Field label="Nom *"><input className={inputCls} value={form.name ?? ""} onChange={e => set("name", e.target.value)} placeholder="Nom de l'établissement" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ville *"><input className={inputCls} value={form.city ?? ""} onChange={e => set("city", e.target.value)} placeholder="Abidjan" /></Field>
              <Field label="Type">
                <select className={selectCls} value={form.type ?? "private"} onChange={e => set("type", e.target.value)}>
                  <option value="private">Privé</option>
                  <option value="public">Public</option>
                </select>
              </Field>
            </div>
            <Field label="Adresse"><input className={inputCls} value={form.address ?? ""} onChange={e => set("address", e.target.value)} placeholder="Adresse complète" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Téléphone"><input className={inputCls} value={form.phone ?? ""} onChange={e => set("phone", e.target.value)} /></Field>
              <Field label="Année fondation"><input type="number" className={inputCls} value={form.founded ?? ""} onChange={e => set("founded", e.target.value)} placeholder="2000" /></Field>
            </div>
            <Field label="Domaines (séparés par virgule)"><input className={inputCls} value={form.domains ?? ""} onChange={e => set("domains", e.target.value)} placeholder="Informatique, Gestion, Droit" /></Field>
            <Field label="Diplômes (séparés par virgule)"><input className={inputCls} value={form.diplomas ?? ""} onChange={e => set("diplomas", e.target.value)} placeholder="Licence, Master, BTS" /></Field>
            <Field label="Description"><textarea className={`${inputCls} resize-none`} rows={3} value={form.description ?? ""} onChange={e => set("description", e.target.value)} /></Field>
            <Field label="Vérification">
              <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-sm text-slate-200">
                <input type="checkbox" checked={Number(form.isVerified) === 1} onChange={e => {
                  set("isVerified", e.target.checked ? 1 : 0);
                  set("verifiedAt", e.target.checked ? (form.verifiedAt || new Date().toISOString()) : null);
                  set("verificationSource", e.target.checked ? (form.verificationSource || "Vérification manuelle") : null);
                }} />
                Vérifié après contrôle manuel
              </label>
              {Number(form.isVerified) === 1 && <input className={inputCls} value={form.verificationSource ?? "Vérification manuelle"} onChange={e => set("verificationSource", e.target.value)} aria-label="Source de vérification" placeholder="Source de vérification" />}
            </Field>
            <Field label="Site web"><input className={inputCls} value={form.website ?? ""} onChange={e => set("website", e.target.value)} placeholder="https://…" /></Field>
            <Field label="Email"><input className={inputCls} value={form.email ?? ""} onChange={e => set("email", e.target.value)} placeholder="contact@ecole.ci" /></Field>
            <Field label="Image école (URL)"><input className={inputCls} value={form.imageUrl ?? ""} onChange={e => set("imageUrl", e.target.value)} placeholder="https://images.unsplash.com/…" /></Field>
            <Field label="Logo (URL)"><input className={inputCls} value={form.logoUrl ?? ""} onChange={e => set("logoUrl", e.target.value)} placeholder="https://…/logo.png" /></Field>
            {(form.imageUrl || form.logoUrl) && (
              <div className="flex gap-3">
                {form.imageUrl && <img src={form.imageUrl} alt="Aperçu image" className="h-20 w-32 object-cover rounded-xl border border-slate-700" onError={e => (e.currentTarget.style.display = "none")} />}
                {form.logoUrl && <img src={form.logoUrl} alt="Aperçu logo" className="h-20 w-20 object-contain rounded-xl border border-slate-700 bg-white p-1" onError={e => (e.currentTarget.style.display = "none")} />}
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Articles Tab ──────────────────────────────────────────────────────────────

type Article = Record<string, any>;

function ArticlesTab({ fetch: apiFetch, onToast }: { fetch: (p: string, o?: RequestInit) => Promise<any>; onToast: (m: string, t: "ok" | "err") => void }) {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; item: Article | null }>({ open: false, item: null });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Article>({});
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await apiFetch("/admin/articles")); }
    catch { onToast("Erreur de chargement", "err"); }
    finally { setLoading(false); }
  }, [apiFetch, onToast]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ category: "Orientation", read_time: "3" }); setModal({ open: true, item: null }); };
  const openEdit = (item: Article) => { setForm({ ...item }); setModal({ open: true, item }); };
  const closeModal = () => setModal({ open: false, item: null });

  const save = async () => {
    if (!form.title || !form.content) return onToast("Titre et contenu requis", "err");
    setSaving(true);
    try {
      if (modal.item) await apiFetch(`/admin/articles/${modal.item.id}`, { method: "PUT", body: JSON.stringify(form) });
      else await apiFetch("/admin/articles", { method: "POST", body: JSON.stringify(form) });
      onToast(modal.item ? "Article modifié" : "Article ajouté", "ok");
      closeModal(); load();
    } catch (e: any) { onToast(e.message, "err"); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    setDeleting(id);
    try { await apiFetch(`/admin/articles/${id}`, { method: "DELETE" }); onToast("Supprimé", "ok"); load(); }
    catch (e: any) { onToast(e.message, "err"); }
    finally { setDeleting(null); }
  };

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const CAT_CLS: Record<string, string> = {
    Orientation: "bg-orange-500/20 text-orange-400",
    Études: "bg-blue-500/20 text-blue-400",
    Concours: "bg-green-500/20 text-green-400",
    "Marché du travail": "bg-purple-500/20 text-purple-400",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-slate-400 text-sm">{items.length} articles</p>
        <button onClick={openAdd} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl font-black text-sm press">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Aucun article créé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider", CAT_CLS[item.category] ?? "bg-slate-600 text-slate-400")}>
                    {item.category}
                  </span>
                  <span className="text-slate-500 text-xs">⏱ {item.read_time} min</span>
                </div>
                <p className="font-bold text-white text-sm leading-snug line-clamp-1">{item.title}</p>
                <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{item.content}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(item)} className="w-8 h-8 bg-slate-700 rounded-xl flex items-center justify-center text-slate-300 hover:text-white press">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => del(item.id)} disabled={deleting === item.id}
                  className="w-8 h-8 bg-red-900/40 rounded-xl flex items-center justify-center text-red-400 press disabled:opacity-50">
                  {deleting === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {modal.open && (
          <Modal title={modal.item ? "Modifier l'article" : "Nouvel article"} onClose={closeModal} onSave={save} saving={saving}>
            <Field label="Titre *"><input className={inputCls} value={form.title ?? ""} onChange={e => set("title", e.target.value)} placeholder="Titre de l'article" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Catégorie">
                <select className={selectCls} value={form.category ?? "Orientation"} onChange={e => set("category", e.target.value)}>
                  <option>Orientation</option>
                  <option>Études</option>
                  <option>Concours</option>
                  <option>Marché du travail</option>
                </select>
              </Field>
              <Field label="Temps lecture (min)">
                <input type="number" className={inputCls} value={form.read_time ?? "3"} onChange={e => set("read_time", e.target.value)} min="1" max="30" />
              </Field>
            </div>
            <Field label="Contenu *">
              <textarea className={`${inputCls} resize-none`} rows={8} value={form.content ?? ""} onChange={e => set("content", e.target.value)} placeholder="Rédigez votre article ici…" />
            </Field>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Scraping Tab ──────────────────────────────────────────────────────────────

const SOURCES = [
  { name: "Fonction Publique CI", url: "https://fonctionpublique.ci", icon: "🏛️" },
  { name: "MESRS", url: "https://mesrs.ci", icon: "🎓" },
  { name: "Infrastructures CI", url: "https://infrastructure.ci", icon: "🏗️" },
];

function ScrapingTab({ fetch: apiFetch, onToast }: { fetch: (p: string, o?: RequestInit) => Promise<any>; onToast: (m: string, t: "ok" | "err") => void }) {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [meta, setMeta] = useState<any[]>([]);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const scrape = async () => {
    setRunning(true); setResults([]); setMeta([]);
    try {
      const data = await apiFetch("/admin/scrape", { method: "POST" });
      setResults(data.results ?? []);
      setMeta(data.meta ?? []);
      setLastRun(new Date().toLocaleTimeString("fr-FR"));
      onToast(`${data.results?.length ?? 0} résultat(s) détecté(s)`, "ok");
    } catch (e: any) { onToast(e.message, "err"); }
    finally { setRunning(false); }
  };

  const dismiss = (id: string) => setDismissed(prev => new Set([...prev, id]));
  const visible = results.filter(r => !dismissed.has(r.id));

  return (
    <div className="space-y-6">
      {/* Sites surveillés */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">🤖 Sites surveillés</h3>
        <div className="space-y-2">
          {SOURCES.map(src => {
            const srcMeta = meta.find(m => m.source === src.name);
            return (
              <div key={src.name} className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl px-4 py-3">
                <span className="text-2xl">{src.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">{src.name}</p>
                  <p className="text-slate-500 text-xs truncate">{src.url}</p>
                </div>
                <div className="shrink-0">
                  {!srcMeta ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-700 text-slate-400">En attente</span>
                  ) : srcMeta.status === "ok" ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-green-500/20 text-green-400">✓ OK — {srcMeta.keywordsFound?.length ?? 0} mots-clés</span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-500/20 text-red-400">Inaccessible</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button onClick={scrape} disabled={running}
          className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl font-black text-sm press disabled:opacity-50">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {running ? "Analyse en cours…" : "Lancer la vérification"}
        </button>
        {lastRun && <p className="text-slate-500 text-xs">Dernière vérif : {lastRun}</p>}
      </div>

      {/* Results */}
      {visible.length > 0 && (
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
            🔍 {visible.length} résultat(s) détecté(s)
          </h3>
          <div className="space-y-3">
            {visible.map(item => (
              <div key={item.id} className="bg-slate-800/60 border border-orange-500/20 rounded-2xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-500/20 text-orange-400 mb-1.5 inline-block">
                      {item.source} — score {item.score}
                    </span>
                    <p className="font-bold text-white text-sm leading-snug">{item.nom}</p>
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      className="text-orange-400 text-xs hover:underline truncate block mt-0.5">{item.url}</a>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { onToast("Concours validé et publié", "ok"); dismiss(item.id); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white rounded-xl font-black text-xs press">
                    <Check className="w-3.5 h-3.5" /> Valider et publier
                  </button>
                  <button onClick={() => dismiss(item.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-700 text-slate-300 rounded-xl font-black text-xs press">
                    <X className="w-3.5 h-3.5" /> Ignorer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!running && results.length === 0 && lastRun && (
        <div className="text-center py-8">
          <Wifi className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">Aucun nouveau concours détecté lors de cette vérification.</p>
        </div>
      )}
    </div>
  );
}

// ── Data Quality Tab ──────────────────────────────────────────────────────────

type QualityIssue = {
  id: string;
  severity: "error" | "warning";
  category: string;
  message: string;
  detail?: string;
};

function DataQualityTab({ fetch: apiFetch, onToast }: { fetch: (p: string, o?: RequestInit) => Promise<any>; onToast: (m: string, t: "ok" | "err") => void }) {
  const [issues, setIssues] = useState<QualityIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  const analyze = useCallback(async () => {
    setLoading(true);
    try {
      const [schools, competitions] = await Promise.all([
        apiFetch("/admin/schools"),
        apiFetch("/admin/competitions"),
      ]);

      const found: QualityIssue[] = [];

      // ── School checks ──────────────────────────────────────────────────────
      // Duplicates by name
      const schoolNames = new Map<string, number[]>();
      for (const s of schools) {
        const key = s.name.toLowerCase().trim();
        if (!schoolNames.has(key)) schoolNames.set(key, []);
        schoolNames.get(key)!.push(s.id);
      }
      for (const [name, ids] of schoolNames) {
        if (ids.length > 1) {
          found.push({
            id: `school-dup-${ids.join("-")}`,
            severity: "error",
            category: "Écoles — Doublons",
            message: `Doublon détecté : "${name}"`,
            detail: `IDs concernés : ${ids.join(", ")}`,
          });
        }
      }

      // Schools without website
      const schoolsNoWeb = schools.filter((s: any) => !s.website);
      if (schoolsNoWeb.length > 0) {
        found.push({
          id: "school-no-website",
          severity: "warning",
          category: "Écoles — Informations",
          message: `${schoolsNoWeb.length} école(s) sans site web`,
          detail: schoolsNoWeb.map((s: any) => s.name).join(" · "),
        });
      }

      // Schools without image
      const schoolsNoImg = schools.filter((s: any) => !s.imageUrl && !s.logoUrl);
      if (schoolsNoImg.length > 0) {
        found.push({
          id: "school-no-image",
          severity: "warning",
          category: "Écoles — Images",
          message: `${schoolsNoImg.length} école(s) sans image stockée en base`,
          detail: "Ces écoles utilisent le mapping local ou un placeholder. Ajoutez une imageUrl ou logoUrl pour un affichage optimal.",
        });
      }

      // ── Competition checks ─────────────────────────────────────────────────
      // Duplicates by title
      const compTitles = new Map<string, number[]>();
      for (const c of competitions) {
        const key = c.title.toLowerCase().trim();
        if (!compTitles.has(key)) compTitles.set(key, []);
        compTitles.get(key)!.push(c.id);
      }
      for (const [title, ids] of compTitles) {
        if (ids.length > 1) {
          found.push({
            id: `comp-dup-${ids.join("-")}`,
            severity: "error",
            category: "Concours — Doublons",
            message: `Doublon détecté : "${title}"`,
            detail: `IDs concernés : ${ids.join(", ")}`,
          });
        }
      }

      // Competitions without website
      const compsNoWeb = competitions.filter((c: any) => !c.website);
      if (compsNoWeb.length > 0) {
        found.push({
          id: "comp-no-website",
          severity: "error",
          category: "Concours — Liens",
          message: `${compsNoWeb.length} concours sans lien officiel`,
          detail: compsNoWeb.map((c: any) => c.title).join(" · "),
        });
      }

      // Open competitions without website
      const openCompsNoWeb = competitions.filter((c: any) => c.status === "open" && !c.website);
      if (openCompsNoWeb.length > 0) {
        found.push({
          id: "open-comp-no-website",
          severity: "error",
          category: "Concours — Liens urgents",
          message: `${openCompsNoWeb.length} concours OUVERT(S) sans lien d'inscription`,
          detail: openCompsNoWeb.map((c: any) => c.title).join(" · "),
        });
      }

      // Competitions without imageUrl in DB (using auto-generated placeholder)
      const compsNoImg = competitions.filter((c: any) => !c.imageUrl);
      if (compsNoImg.length > 0) {
        found.push({
          id: "comp-no-image",
          severity: "warning",
          category: "Concours — Images",
          message: `${compsNoImg.length} concours affichent un placeholder généré automatiquement`,
          detail: "Vous pouvez ajouter une imageUrl ou logoUrl pour un affichage personnalisé (logo officiel, visuel de l'organisme).",
        });
      }

      if (found.length === 0) {
        found.push({
          id: "all-ok",
          severity: "warning" as const,
          category: "Résultat",
          message: "✅ Aucune anomalie détectée",
          detail: `${schools.length} écoles et ${competitions.length} concours vérifiés — tout est correct.`,
        });
      }

      setIssues(found);
      setRan(true);
      onToast(`${found.filter(i => i.id !== "all-ok").length} anomalie(s) détectée(s)`, found.some(i => i.severity === "error" && i.id !== "all-ok") ? "err" : "ok");
    } catch (e: any) {
      onToast(e.message, "err");
    } finally {
      setLoading(false);
    }
  }, [apiFetch, onToast]);

  const errors = issues.filter(i => i.severity === "error" && i.id !== "all-ok");
  const warnings = issues.filter(i => i.severity === "warning" && i.id !== "all-ok");

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">🔬 Vérifications automatiques</h3>
        <ul className="space-y-1 text-slate-400 text-sm">
          <li className="flex items-center gap-2"><Copy className="w-3.5 h-3.5 text-red-400" /> Doublons (écoles &amp; concours)</li>
          <li className="flex items-center gap-2"><LinkIcon className="w-3.5 h-3.5 text-orange-400" /> Liens officiels manquants</li>
          <li className="flex items-center gap-2"><ImageOff className="w-3.5 h-3.5 text-yellow-400" /> Images absentes en base de données</li>
        </ul>
      </div>

      {/* Run button */}
      <button
        onClick={analyze}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-xl font-black text-sm press disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
        {loading ? "Analyse en cours…" : "Lancer l'analyse qualité"}
      </button>

      {/* Results */}
      {ran && !loading && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className={cn("rounded-2xl p-4 text-center border", errors.length > 0 ? "bg-red-900/20 border-red-500/30" : "bg-slate-800/50 border-slate-700/50")}>
              <p className={cn("text-2xl font-black", errors.length > 0 ? "text-red-400" : "text-slate-400")}>{errors.length}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">Erreurs</p>
            </div>
            <div className={cn("rounded-2xl p-4 text-center border", warnings.length > 0 ? "bg-yellow-900/20 border-yellow-500/30" : "bg-slate-800/50 border-slate-700/50")}>
              <p className={cn("text-2xl font-black", warnings.length > 0 ? "text-yellow-400" : "text-slate-400")}>{warnings.length}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">Avertissements</p>
            </div>
          </div>

          {/* Issue list */}
          <div className="space-y-2">
            {issues.map(issue => (
              <div
                key={issue.id}
                className={cn(
                  "rounded-2xl p-4 border",
                  issue.id === "all-ok"
                    ? "bg-green-900/20 border-green-500/30"
                    : issue.severity === "error"
                    ? "bg-red-900/15 border-red-500/25"
                    : "bg-yellow-900/10 border-yellow-500/20"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {issue.id === "all-ok" ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : issue.severity === "error" ? (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-0.5">{issue.category}</p>
                    <p className="text-sm font-bold text-white leading-snug">{issue.message}</p>
                    {issue.detail && (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{issue.detail}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!ran && !loading && (
        <div className="text-center py-12">
          <ShieldAlert className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Lancez l'analyse pour détecter les anomalies.</p>
        </div>
      )}
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────

function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Erreur");
      localStorage.setItem(TOKEN_KEY, data.token);
      onLogin(data.token);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚙️</span>
          </div>
          <h1 className="font-black text-2xl text-white mb-1">Admin Panel</h1>
          <p className="text-slate-500 text-sm">Compétences CI — Accès sécurisé</p>
        </div>

        <form onSubmit={submit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">
              Mot de passe admin
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white pr-11 focus:border-orange-500 outline-none transition-colors text-sm"
                placeholder="••••••••••••"
                autoFocus
              />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {error}
              </motion.p>
            )}
          </div>
          <button type="submit" disabled={loading || !password}
            className="w-full py-3 bg-orange-500 text-white font-black rounded-xl press disabled:opacity-40 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Se connecter
          </button>
        </form>

        <p className="text-center text-slate-600 text-xs mt-6">🇨🇮 Compétences CI — Panneau d'administration</p>
      </motion.div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "competitions", label: "Concours", icon: Trophy },
  { id: "schools", label: "Écoles", icon: Building2 },
  { id: "articles", label: "Articles", icon: BookOpen },
  { id: "scraping", label: "Scraping", icon: Wifi },
  { id: "quality", label: "Qualité", icon: ShieldAlert },
];

function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const apiFetch = useAdminFetch(token);
  const [tab, setTab] = useState<Tab>("competitions");
  const [stats, setStats] = useState<{ competitions: number; schools: number; articles: number } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = useCallback((msg: string, type: "ok" | "err") => setToast({ msg, type }), []);

  useEffect(() => {
    apiFetch("/admin/stats").then(setStats).catch(() => {});
  }, [apiFetch]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="font-black text-white text-sm leading-none">Admin Panel</p>
              <p className="text-slate-500 text-[10px] mt-0.5">Compétences CI</p>
            </div>
          </div>
          <button onClick={onLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-400 transition-colors bg-slate-800 px-3 py-2 rounded-xl press">
            <LogOut className="w-3.5 h-3.5" /> Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: "🏫", label: "Écoles", val: stats.schools },
              { icon: "📋", label: "Concours", val: stats.competitions },
              { icon: "📖", label: "Articles", val: stats.articles },
            ].map(s => (
              <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="font-black text-orange-500 text-xl">{s.val}</p>
                <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-0.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black transition-all press",
                tab === t.id ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white")}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {tab === "competitions" && <CompetitionsTab fetch={apiFetch} onToast={showToast} />}
            {tab === "schools" && <SchoolsTab fetch={apiFetch} onToast={showToast} />}
            {tab === "articles" && <ArticlesTab fetch={apiFetch} onToast={showToast} />}
            {tab === "scraping" && <ScrapingTab fetch={apiFetch} onToast={showToast} />}
            {tab === "quality" && <DataQualityTab fetch={apiFetch} onToast={showToast} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function Admin() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  const handleLogin = (t: string) => setToken(t);
  const handleLogout = () => { localStorage.removeItem(TOKEN_KEY); setToken(null); };

  return (
    <AnimatePresence mode="wait">
      {token ? (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <AdminDashboard token={token} onLogout={handleLogout} />
        </motion.div>
      ) : (
        <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <AdminLogin onLogin={handleLogin} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

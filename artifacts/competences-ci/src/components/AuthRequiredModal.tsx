import { Link } from "wouter";
import { X, Lock } from "lucide-react";

export function AuthRequiredModal({ open, onClose, action = "continuer" }: { open: boolean; onClose: () => void; action?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-3 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl bg-background p-6 shadow-2xl" onClick={event => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10"><Lock className="h-5 w-5 text-primary" /></div><button onClick={onClose} aria-label="Fermer"><X className="h-5 w-5 text-muted-foreground" /></button></div>
        <h2 className="mb-2 text-xl font-black">Connecte-toi pour {action}</h2>
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground">La consultation reste libre. Un compte est nécessaire pour enregistrer tes favoris, candidatures et documents.</p>
        <div className="grid grid-cols-2 gap-2"><Link href="/login" onClick={onClose} className="rounded-xl bg-primary py-3 text-center text-sm font-bold text-white">Se connecter</Link><Link href="/register" onClick={onClose} className="rounded-xl border border-border py-3 text-center text-sm font-bold text-foreground">Créer un compte</Link></div>
      </div>
    </div>
  );
}
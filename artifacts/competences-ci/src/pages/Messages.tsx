import { useState, FormEvent } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useSendMessage } from "@workspace/api-client-react";
import { MessageCircle, Mail, FileText, Send, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const SUBJECTS = [
  "Question sur une école",
  "Question sur un concours",
  "Signaler une erreur",
  "Demande de partenariat",
  "Autre",
];

export default function Messages() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { mutate, isPending } = useSendMessage({
    mutation: {
      onSuccess: () => {
        setSuccess(true);
        setMessage("");
        setSubject("");
      },
      onError: (err: any) => {
        setError(err?.message || "Erreur lors de l'envoi. Veuillez réessayer.");
      },
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !subject || !message) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    mutate({ data: { name, email, subject, message } });
  };

  return (
    <Layout title="Nous contacter">
      <div className="px-4 pt-6 pb-8 space-y-6">

        {/* Info Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
          <MessageCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-0.5">Une question ?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Notre équipe répond à vos questions sur les écoles, les concours et l'orientation en Côte d'Ivoire.
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-12 px-6"
            >
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-5">
                <CheckCircle2 className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2 text-foreground">Message envoyé !</h3>
              <p className="text-muted-foreground text-sm text-balance mb-6">
                Merci pour votre message. Nous vous répondrons dans les plus brefs délais à <strong>{email}</strong>.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-8 py-3 rounded-2xl bg-primary text-white font-semibold active:scale-95 transition-all"
              >
                Envoyer un autre message
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-2xl px-4 py-3">
                  {error}
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Votre nom</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Kouamé Aya"
                  className="w-full px-4 py-3.5 rounded-2xl bg-muted/50 border border-border/80 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email de réponse
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.ci"
                  className="w-full px-4 py-3.5 rounded-2xl bg-muted/50 border border-border/80 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Sujet
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {SUBJECTS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSubject(s)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95",
                        subject === s
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-muted border-border/60 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {subject === "Autre" && (
                  <input
                    type="text"
                    value={subject === "Autre" ? "" : subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Précisez votre sujet..."
                    className="w-full px-4 py-3.5 rounded-2xl bg-muted/50 border border-border/80 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                )}
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Votre message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Décrivez votre question ou demande en détail..."
                  className="w-full px-4 py-3.5 rounded-2xl bg-muted/50 border border-border/80 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Envoyer le message <Send className="w-5 h-5" /></>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

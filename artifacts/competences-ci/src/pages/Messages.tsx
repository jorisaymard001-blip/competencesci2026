import { useState, FormEvent } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useSendMessage } from "@workspace/api-client-react";
import { MessageCircle, Mail, FileText, Send, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/useT";

export default function Messages() {
  const { t } = useT();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const SUBJECTS: { key: string; label: string }[] = [
    { key: "school", label: t("messages_subject_school") },
    { key: "comp", label: t("messages_subject_comp") },
    { key: "error", label: t("messages_subject_error") },
    { key: "partner", label: t("messages_subject_partner") },
    { key: "other", label: t("messages_subject_other") },
  ];

  const { mutate, isPending } = useSendMessage({
    mutation: {
      onSuccess: () => {
        setSuccess(true);
        setMessage("");
        setSubject("");
        setCustomSubject("");
      },
      onError: (err: any) => {
        setError(err?.message || t("messages_error"));
      },
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const finalSubject = subject === "other" ? customSubject.trim() : subject;
    if (!name || !email || !finalSubject || !message) {
      setError(t("messages_required"));
      return;
    }
    const subjLabel = SUBJECTS.find((s) => s.key === subject)?.label ?? "";
    mutate({ data: { name, email, subject: subject === "other" ? customSubject : subjLabel, message } });
  };

  return (
    <Layout title={t("messages_title")}>
      <div className="px-4 pt-6 pb-8 space-y-6">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
          <MessageCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-0.5">{t("messages_banner_title")}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{t("messages_banner_text")}</p>
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
              <h3 className="font-display font-bold text-xl mb-2 text-foreground">{t("messages_success_title")}</h3>
              <p className="text-muted-foreground text-sm text-balance mb-6">
                {t("messages_success_sub")} <strong>{email}</strong>.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-8 py-3 rounded-2xl bg-primary text-white font-semibold active:scale-95 transition-all"
              >
                {t("messages_send_another")}
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

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">{t("messages_name")}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("messages_name_ph")}
                  className="w-full px-4 py-3.5 rounded-2xl bg-muted/50 border border-border/80 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {t("messages_email")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("messages_email_ph")}
                  className="w-full px-4 py-3.5 rounded-2xl bg-muted/50 border border-border/80 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" /> {t("messages_subject")}
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSubject(s.key)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95",
                        subject === s.key
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-muted border-border/60 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {subject === "other" && (
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder={t("messages_subject_other_ph")}
                    className="w-full px-4 py-3.5 rounded-2xl bg-muted/50 border border-border/80 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">{t("messages_message")}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder={t("messages_msg_ph")}
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
                  <>
                    {t("messages_send")} <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

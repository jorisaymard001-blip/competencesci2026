import { useState, FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLogin } from "@workspace/api-client-react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useT } from "@/lib/useT";

export default function Login() {
  const { t } = useT();
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const { mutate, isPending } = useLogin({
    mutation: {
      onSuccess: (data) => {
        login(data.user);
        navigate("/");
      },
      onError: (err: any) => {
        const msg = err?.message ?? "";
        // Ne jamais afficher du HTML brut ou des messages techniques
        const isClean = msg && !msg.includes("<") && !msg.includes("DOCTYPE") && msg.length < 200;
        setError(isClean ? msg : t("login_error"));
      },
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    mutate({ data: { email, password } });
  };

  return (
    <div className="auth-page min-h-[100dvh] flex items-start sm:items-center justify-center bg-background sm:bg-muted/30 px-0 sm:px-4 py-0 sm:py-8">
      <div className="auth-card w-full max-w-md sm:rounded-3xl sm:shadow-2xl sm:border sm:border-border/50 bg-background sm:bg-card overflow-hidden">

        {/* Header */}
        <div className="auth-hero relative px-6 pt-16 pb-12 sm:rounded-t-3xl overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-orange-500/20 mb-5 border border-white/10">
              <img src="/icon-192x192.png" alt="Compétences CI" className="w-full h-full object-cover" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2 text-white">{t("login_welcome")}</h1>
            <p className="text-white/60 text-sm">{t("login_subtitle")}</p>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 px-6 pt-8 pb-10">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-2xl px-4 py-3 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">{t("login_email")}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t("login_email_placeholder")}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-muted/50 border border-border/80 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">{t("login_password")}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-muted/50 border border-border/80 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 hover:-translate-y-0.5 hover:shadow-xl text-white font-bold shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2 press"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>{t("login_btn")} <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </motion.form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t("login_no_account")}{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                {t("login_register")}
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground">
              🇨🇮 {t("login_footer")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

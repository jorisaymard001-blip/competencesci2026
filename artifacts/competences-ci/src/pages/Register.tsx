import { useState, FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useRegister } from "@workspace/api-client-react";
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const { mutate, isPending } = useRegister({
    mutation: {
      onSuccess: (data) => {
        login(data.user);
        navigate("/");
      },
      onError: (err: any) => {
        setError(err?.message || "Erreur lors de l'inscription");
      },
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères");
      return;
    }
    mutate({ data: { name, email, password } });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background w-full max-w-md mx-auto shadow-2xl overflow-hidden sm:border-x sm:border-border/50">
      {/* Header */}
      <div className="relative bg-secondary text-white px-6 pt-16 pb-12 rounded-b-[40px] overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5 border border-white/20">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Créer un compte</h1>
          <p className="text-white/70 text-sm">Rejoignez Compétences CI</p>
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
            <label className="text-sm font-semibold text-foreground">Nom complet</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Kouamé Aya"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-muted/50 border border-border/80 text-sm outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/50 transition-all"
                autoComplete="name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.ci"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-muted/50 border border-border/80 text-sm outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/50 transition-all"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-muted/50 border border-border/80 text-sm outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/50 transition-all"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground pl-1">Minimum 6 caractères</p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 rounded-2xl bg-secondary text-white font-bold shadow-lg shadow-secondary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Créer mon compte <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </motion.form>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

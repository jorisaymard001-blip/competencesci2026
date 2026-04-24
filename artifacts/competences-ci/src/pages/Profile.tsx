import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useSettings, formatDuration } from "@/contexts/SettingsContext";
import {
  User, Heart, MessageCircle, Settings, Info, Share2,
  LogOut, ChevronRight, Sun, Moon, Globe, Clock,
  Search, Trash2, Camera, Check, GraduationCap, Briefcase,
  Timer, Calendar, BarChart3, Compass, ClipboardList, BookOpen, Bell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/useT";

const AVATARS = [
  { id: "boy", label: "Garçon", emoji: "👦" },
  { id: "girl", label: "Fille", emoji: "👧" },
  { id: "man", label: "Homme", emoji: "👨" },
  { id: "woman", label: "Femme", emoji: "👩" },
];

function getStoredAvatar(): { type: "emoji" | "photo"; value: string } {
  try {
    return JSON.parse(localStorage.getItem("competences_ci_avatar") || "null") ?? { type: "emoji", value: "👨" };
  } catch { return { type: "emoji", value: "👨" }; }
}

function Avatar({ size = "lg" }: { size?: "sm" | "lg" }) {
  const av = getStoredAvatar();
  const sz = size === "lg" ? "w-20 h-20 text-4xl" : "w-8 h-8 text-lg";
  if (av.type === "photo") {
    return <img src={av.value} alt="avatar" className={`${sz} rounded-full object-cover ring-4 ring-background shadow-md`} />;
  }
  return (
    <div className={`${sz} rounded-full bg-primary/10 border-4 border-background shadow-md flex items-center justify-center`}>
      <span>{av.value}</span>
    </div>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const { favoriteSchools, favoriteCompetitions } = useFavorites();
  const { theme, toggleTheme, language, setLanguage, notificationsEnabled, setNotificationsEnabled, searchHistory, clearSearchHistory, getTodaySeconds, getThisYearSeconds } = useSettings();
  const [, navigate] = useLocation();

  const [avatar, setAvatar] = useState(getStoredAvatar);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [, forceUpdate] = useState(0);

  const saveAvatar = (av: typeof avatar) => {
    setAvatar(av);
    localStorage.setItem("competences_ci_avatar", JSON.stringify(av));
    forceUpdate(n => n + 1);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      saveAvatar({ type: "photo", value: data });
      setShowAvatarPicker(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleShare = () => {
    const msg = "Découvrez Compétences CI, l'application qui aide à trouver des écoles, concours et formations en Côte d'Ivoire. 🇨🇮";
    if (navigator.share) {
      navigator.share({ title: "Compétences CI", text: msg, url: window.location.origin });
    } else {
      navigator.clipboard.writeText(msg + "\n" + window.location.origin);
      alert("Lien copié dans le presse-papiers !");
    }
  };

  const todaySecs = getTodaySeconds();
  const yearSecs = getThisYearSeconds();
  const { t } = useT();

  return (
    <Layout title={t("profile_title")} noBottomNav showBack onBack={() => navigate("/")}>
      <div className="pb-12 bg-background min-h-screen">

        {/* Profile header */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/5 px-5 py-8 flex flex-col items-center text-center border-b border-border/40">
          <div className="relative mb-4">
            <Avatar size="lg" />
            <button
              onClick={() => setShowAvatarPicker(true)}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">{user?.name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
          <div className="flex gap-4 mt-4 text-center">
            <div className="bg-white/60 dark:bg-white/10 rounded-xl px-4 py-2 min-w-[70px]">
              <div className="text-lg font-bold text-primary">{favoriteSchools.length}</div>
              <div className="text-[10px] text-muted-foreground">{t("nav_schools")}</div>
            </div>
            <div className="bg-white/60 dark:bg-white/10 rounded-xl px-4 py-2 min-w-[70px]">
              <div className="text-lg font-bold text-secondary">{favoriteCompetitions.length}</div>
              <div className="text-[10px] text-muted-foreground">{t("nav_competitions")}</div>
            </div>
          </div>
        </div>

        {/* Avatar picker modal */}
        <AnimatePresence>
          {showAvatarPicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
              onClick={() => setShowAvatarPicker(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="bg-background rounded-t-3xl w-full max-w-md p-6"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="font-display font-bold text-lg mb-5 text-center">Choisir une photo</h3>
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {AVATARS.map(av => (
                    <button
                      key={av.id}
                      onClick={() => { saveAvatar({ type: "emoji", value: av.emoji }); setShowAvatarPicker(false); }}
                      className={cn(
                        "flex flex-col items-center py-3 px-1 rounded-2xl border-2 transition-all active:scale-90",
                        avatar.value === av.emoji ? "border-primary bg-primary/10" : "border-border bg-muted/40"
                      )}
                    >
                      <span className="text-3xl mb-1">{av.emoji}</span>
                      <span className="text-[10px] font-medium text-muted-foreground">{av.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full py-3.5 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" /> Importer depuis la galerie
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-4 py-5 space-y-4">

          {/* Outils */}
          <Section title={t("nav_section_tools")}>
            <MenuItem
              icon={<Compass className="w-5 h-5 text-violet-600" />}
              iconBg="bg-violet-50 dark:bg-violet-900/20"
              label={t("profile_orient_label")}
              subtitle={t("profile_orient_sub")}
              onPress={() => navigate("/orientation")}
            />
            <MenuItem
              icon={<ClipboardList className="w-5 h-5 text-blue-600" />}
              iconBg="bg-blue-50 dark:bg-blue-900/20"
              label={t("profile_cand_label")}
              subtitle={t("profile_cand_sub")}
              onPress={() => navigate("/candidatures")}
            />
            <MenuItem
              icon={<BookOpen className="w-5 h-5 text-green-600" />}
              iconBg="bg-green-50 dark:bg-green-900/20"
              label={t("profile_articles_label")}
              subtitle={t("profile_articles_sub")}
              onPress={() => navigate("/conseils")}
              last
            />
          </Section>

          {/* Mes favoris */}
          <Section title={t("profile_favorites")}>
            <MenuItem
              icon={<GraduationCap className="w-5 h-5 text-primary" />}
              iconBg="bg-primary/10"
              label={t("profile_saved_schools")}
              badge={favoriteSchools.length > 0 ? String(favoriteSchools.length) : undefined}
              onPress={() => navigate("/favorites")}
            />
            <MenuItem
              icon={<Briefcase className="w-5 h-5 text-secondary" />}
              iconBg="bg-secondary/10"
              label={t("profile_saved_competitions")}
              badge={favoriteCompetitions.length > 0 ? String(favoriteCompetitions.length) : undefined}
              onPress={() => navigate("/favorites")}
              last
            />
          </Section>

          {/* Contact */}
          <Section title={t("profile_contact")}>
            <MenuItem
              icon={<MessageCircle className="w-5 h-5 text-blue-600" />}
              iconBg="bg-blue-50"
              label={t("profile_send_message")}
              subtitle={t("profile_send_sub")}
              onPress={() => navigate("/messages")}
              last
            />
          </Section>

          {/* Paramètres */}
          <Section title={t("profile_settings")}>
            {/* Langue */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("profile_language")}</p>
                </div>
              </div>
              <div className="flex bg-muted rounded-xl overflow-hidden border border-border/50">
                {(["fr", "en"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-bold transition-all",
                      language === l ? "bg-primary text-white" : "text-muted-foreground"
                    )}
                  >
                    {l === "fr" ? "🇫🇷 FR" : "🇬🇧 EN"}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications toggle */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/40">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", notificationsEnabled ? "bg-orange-50 dark:bg-orange-900/20" : "bg-muted")}>
                  <Bell className={cn("w-5 h-5", notificationsEnabled ? "text-orange-500" : "text-muted-foreground")} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{t("profile_notifs")}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{t("profile_notifs_sub")}</p>
                </div>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0",
                  notificationsEnabled ? "bg-primary" : "bg-muted-foreground/30"
                )}
                aria-label="Toggle notifications"
              >
                <div className={cn(
                  "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300",
                  notificationsEnabled ? "translate-x-6" : "translate-x-0.5"
                )} />
              </button>
            </div>

            {/* Mode */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", theme === "dark" ? "bg-slate-800" : "bg-yellow-50")}>
                  {theme === "dark" ? <Moon className="w-5 h-5 text-slate-300" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                </div>
                <p className="text-sm font-semibold text-foreground">{t("profile_display")}</p>
              </div>
              <button
                onClick={toggleTheme}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors duration-300",
                  theme === "dark" ? "bg-primary" : "bg-muted-foreground/30"
                )}
              >
                <div className={cn(
                  "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300",
                  theme === "dark" ? "translate-x-6" : "translate-x-0.5"
                )} />
              </button>
            </div>

            {/* Historique */}
            <div className="border-b border-border/40">
              <button
                onClick={() => setShowHistory(h => !h)}
                className="w-full flex items-center justify-between px-4 py-3.5 active:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Search className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{t("profile_history")}</p>
                    <p className="text-xs text-muted-foreground">{searchHistory.length} {searchHistory.length > 1 ? t("profile_searches_plural") : t("profile_searches")}</p>
                  </div>
                </div>
                <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", showHistory && "rotate-90")} />
              </button>
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3">
                      {searchHistory.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2 text-center">{t("profile_no_history")}</p>
                      ) : (
                        <>
                          {searchHistory.slice(0, 8).map((entry, i) => (
                            <div key={i} className="flex items-center gap-2 py-1.5">
                              <Search className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                              <span className="text-sm text-foreground flex-1 truncate">{entry.query}</span>
                              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-md",
                                entry.type === "school" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                              )}>{entry.type === "school" ? t("nav_schools") : t("nav_competitions")}</span>
                            </div>
                          ))}
                          <button
                            onClick={clearSearchHistory}
                            className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs text-red-500 font-medium py-2 rounded-xl hover:bg-red-50 transition-colors active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> {t("profile_clear_history")}
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Temps d'utilisation */}
            <div className="px-4 py-3.5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Timer className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-sm font-semibold text-foreground">{t("profile_usage")}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/50 rounded-xl p-2.5 text-center">
                  <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <div className="text-xs font-bold text-foreground">{formatDuration(todaySecs)}</div>
                  <div className="text-[10px] text-muted-foreground">{t("profile_today")}</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-2.5 text-center">
                  <Calendar className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <div className="text-xs font-bold text-foreground">{formatDuration(Math.floor(yearSecs / 30))}</div>
                  <div className="text-[10px] text-muted-foreground">{t("profile_daily_avg")}</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-2.5 text-center">
                  <BarChart3 className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <div className="text-xs font-bold text-foreground">{formatDuration(yearSecs)}</div>
                  <div className="text-[10px] text-muted-foreground">{t("profile_year")}</div>
                </div>
              </div>
            </div>
          </Section>

          {/* Autres */}
          <Section title={t("profile_app")}>
            <MenuItem
              icon={<Share2 className="w-5 h-5 text-teal-600" />}
              iconBg="bg-teal-50"
              label={t("profile_share")}
              subtitle={t("profile_share_sub")}
              onPress={handleShare}
            />
            <MenuItem
              icon={<Info className="w-5 h-5 text-blue-600" />}
              iconBg="bg-blue-50"
              label={t("profile_about")}
              onPress={() => navigate("/about")}
              last
            />
          </Section>

          {/* Déconnexion */}
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl border-2 border-red-100 bg-red-50 text-red-600 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <LogOut className="w-5 h-5" /> {t("profile_logout")}
          </button>

          <p className="text-center text-xs text-muted-foreground pb-4">{t("profile_version")}</p>
        </div>
      </div>
    </Layout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1 mb-2">{title}</p>
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        {children}
      </div>
    </div>
  );
}

function MenuItem({
  icon, iconBg, label, subtitle, badge, onPress, last = false
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  subtitle?: string;
  badge?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <button
      onClick={onPress}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3.5 active:bg-muted/50 transition-colors text-left",
        !last && "border-b border-border/40"
      )}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
      </div>
      {badge && (
        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
    </button>
  );
}

import { useRoute, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useGetSchool } from "@workspace/api-client-react";
import { Loader2, MapPin, Globe, Phone, Mail, Award, BookOpen, GraduationCap, Building2, ChevronRight, Heart, Info, Banknote, Star, Send } from "lucide-react";
import { getDiplomaInfo } from "@/lib/diploma-data";
import { getSchoolCost, getDefaultCost, formatCFA } from "@/lib/school-costs";
import { motion, AnimatePresence } from "framer-motion";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Review { userId: number; userName: string; rating: number; comment: string; date: string; }
function getReviews(schoolId: number): Review[] {
  try { return JSON.parse(localStorage.getItem(`school_reviews_${schoolId}`) || "[]"); } catch { return []; }
}
function saveReview(schoolId: number, reviews: Review[]) {
  localStorage.setItem(`school_reviews_${schoolId}`, JSON.stringify(reviews));
}

function StarRating({ value, onChange, size = "md" }: { value: number; onChange?: (v: number) => void; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "w-4 h-4" : "w-7 h-7";
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} onClick={() => onChange?.(i)} className={onChange ? "active:scale-90 transition-transform" : "cursor-default"} disabled={!onChange}>
          <Star className={cn(sz, "transition-colors", i <= value ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30")} />
        </button>
      ))}
    </div>
  );
}

export default function SchoolDetail() {
  const [, params] = useRoute("/schools/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;

  const { data: school, isLoading, error } = useGetSchool(id, {
    query: { enabled: !!id }
  });

  const [, navigate] = useLocation();
  const { isSchoolFav, toggleSchool } = useFavorites();
  const { user } = useAuth();
  const isFav = school ? isSchoolFav(school.id) : false;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (school) setReviews(getReviews(school.id));
  }, [school?.id]);

  const handleSubmitReview = () => {
    if (!user || myRating === 0) return;
    const newReview: Review = { userId: user.id, userName: user.name.split(" ")[0], rating: myRating, comment: myComment.trim(), date: new Date().toISOString() };
    const updated = [newReview, ...reviews.filter(r => r.userId !== user.id)];
    saveReview(school!.id, updated);
    setReviews(updated);
    setMyRating(0); setMyComment(""); setShowReviewForm(false);
  };

  if (isLoading) {
    return (
      <Layout showBack transparentHeader>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        </div>
      </Layout>
    );
  }

  if (error || !school) {
    return (
      <Layout showBack title="Erreur">
        <div className="p-6 text-center">
          <p className="text-muted-foreground">École introuvable.</p>
        </div>
      </Layout>
    );
  }

  const isPublic = school.type === "public";

  return (
    <Layout showBack noBottomNav transparentHeader>

      {/* Decorative Header */}
      <div className="absolute top-0 inset-x-0 h-80 bg-foreground overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-pattern.png`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="relative z-10 pt-20 pb-12 px-4 md:px-6 max-w-4xl mx-auto w-full">
        {/* Main Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-6 shadow-xl border border-border/50 mb-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isPublic ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
              {isPublic ? "Établissement Public" : "Établissement Privé"}
            </div>
            <div className="flex items-center gap-2">
              {school.founded && (
                <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                  Fondé en {school.founded}
                </div>
              )}
              {/* Favorite Button */}
              <button
                onClick={() => toggleSchool(school.id)}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center border transition-all active:scale-90",
                  isFav
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "bg-muted border-border text-muted-foreground hover:text-red-400"
                )}
                aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart className={cn("w-4 h-4 transition-all", isFav && "fill-red-500 text-red-500")} />
              </button>
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground mb-3 leading-tight">
            {school.name}
          </h1>

          <div className="flex items-start text-muted-foreground text-sm mb-6">
            <MapPin className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
            <span>{school.address}, {school.city}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-5 border-t border-border/50">
            {school.phone && (
              <a href={`tel:${school.phone}`} className="flex items-center text-sm font-medium text-foreground hover:text-primary transition-colors">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-2 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                Appeler
              </a>
            )}
            {school.website && (
              <a href={school.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-medium text-foreground hover:text-primary transition-colors">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-2 shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                Site Web
              </a>
            )}
            {school.email && (
              <a href={`mailto:${school.email}`} className="flex items-center text-sm font-medium text-foreground hover:text-primary transition-colors col-span-2 mt-1">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-2 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                {school.email}
              </a>
            )}
          </div>
        </motion.div>

        <div className="space-y-6">

          {/* About Section */}
          <section>
            <h2 className="font-display text-lg font-bold mb-3 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-primary" /> À propos
            </h2>
            <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {school.description}
              </p>

              {school.accreditation && (
                <div className="mt-4 pt-4 border-t border-border/50 flex items-start">
                  <Award className="w-5 h-5 mr-3 text-secondary shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Accréditation</h4>
                    <p className="text-sm text-muted-foreground">{school.accreditation}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Domains Section */}
          <section>
            <h2 className="font-display text-lg font-bold mb-3 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-primary" /> Domaines de formation
            </h2>
            <div className="flex flex-wrap gap-2">
              {school.domains.map((domain, i) => (
                <span key={i} className="px-3 py-1.5 bg-orange-50 text-orange-800 border border-orange-100 rounded-xl text-sm font-medium">
                  {domain}
                </span>
              ))}
            </div>
          </section>

          {/* Diplomas Section */}
          <section>
            <h2 className="font-display text-lg font-bold mb-1 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-primary" /> Diplômes préparés
            </h2>
            <p className="text-xs text-muted-foreground mb-3">Appuyez sur un diplôme pour voir les détails</p>
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
              {school.diplomas.map((diploma, i) => {
                const hasInfo = !!getDiplomaInfo(diploma);
                return (
                  <button
                    key={i}
                    onClick={() => navigate(`/diplomas/${encodeURIComponent(diploma)}`)}
                    className={`w-full p-4 flex items-center justify-between active:bg-muted/50 transition-colors text-left ${i !== school.diplomas.length - 1 ? 'border-b border-border/50' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">{diploma}</span>
                      {hasInfo && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-semibold">Détails</span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-primary/60" />
                  </button>
                );
              })}
            </div>
          </section>

          {/* Costs Section */}
          {(() => {
            const cost = getSchoolCost(school.name) || getDefaultCost(school.type as "public" | "private");
            return (
              <section>
                <h2 className="font-display text-lg font-bold mb-3 flex items-center">
                  <Banknote className="w-5 h-5 mr-2 text-green-600" /> Coût de la formation
                </h2>
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                  {cost.tuitionMin !== undefined && (
                    <div className="flex items-center justify-between p-4 border-b border-border/40">
                      <span className="text-sm font-medium text-foreground">Frais de scolarité</span>
                      <span className="text-sm font-bold text-primary">
                        {cost.tuitionMin === 0 ? "Gratuit" : cost.tuitionMin === cost.tuitionMax
                          ? formatCFA(cost.tuitionMin)
                          : `${formatCFA(cost.tuitionMin)} – ${formatCFA(cost.tuitionMax!)}`}
                        <span className="text-xs font-normal text-muted-foreground">/an</span>
                      </span>
                    </div>
                  )}
                  {cost.registrationFee !== undefined && (
                    <div className="flex items-center justify-between p-4 border-b border-border/40">
                      <span className="text-sm font-medium text-foreground">Frais d'inscription</span>
                      <span className="text-sm font-bold text-foreground">
                        {cost.registrationFee === 0 ? "Gratuit" : formatCFA(cost.registrationFee)}
                      </span>
                    </div>
                  )}
                  {cost.notes && (
                    <div className="flex items-start gap-2 p-4">
                      <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">{cost.notes}</p>
                    </div>
                  )}
                </div>
              </section>
            );
          })()}

          {/* Reviews Section */}
          <section>
            <h2 className="font-display text-lg font-bold mb-3 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" /> Avis des étudiants
              {reviews.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}/5 · {reviews.length} avis)
                </span>
              )}
            </h2>

            {reviews.length > 0 ? (
              <div className="space-y-3 mb-3">
                {reviews.slice(0, 3).map((r, i) => (
                  <div key={i} className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {r.userName[0]}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground">{r.userName}</div>
                        <StarRating value={r.rating} size="sm" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{new Date(r.date).toLocaleDateString("fr-CI", { day: "numeric", month: "short" })}</span>
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-muted/40 border border-border/30 rounded-2xl p-4 text-center mb-3">
                <p className="text-sm text-muted-foreground">Aucun avis pour cet établissement. Soyez le premier !</p>
              </div>
            )}

            <button
              onClick={() => setShowReviewForm(v => !v)}
              className="w-full py-3 rounded-2xl border-2 border-primary/30 text-primary font-semibold text-sm active:scale-[0.98] transition-all"
            >
              {showReviewForm ? "Annuler" : "Laisser un avis"}
            </button>

            <AnimatePresence>
              {showReviewForm && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pt-4 space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-2">Votre note</p>
                      <StarRating value={myRating} onChange={setMyRating} />
                    </div>
                    <textarea
                      value={myComment}
                      onChange={e => setMyComment(e.target.value)}
                      rows={3}
                      placeholder="Partagez votre expérience (optionnel)..."
                      className="w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none"
                    />
                    <button
                      onClick={handleSubmitReview}
                      disabled={myRating === 0}
                      className="w-full py-3.5 rounded-2xl bg-primary text-white font-semibold text-sm disabled:opacity-40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Publier mon avis
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Favorite Toggle CTA */}
          <button
            onClick={() => toggleSchool(school.id)}
            className={cn(
              "w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all active:scale-[0.98]",
              isFav
                ? "border-red-200 bg-red-50 text-red-500"
                : "border-border bg-card text-muted-foreground hover:border-red-200 hover:text-red-400"
            )}
          >
            <Heart className={cn("w-5 h-5", isFav && "fill-red-500 text-red-500")} />
            {isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
          </button>

        </div>
      </div>
    </Layout>
  );
}

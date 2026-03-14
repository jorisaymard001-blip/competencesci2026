import { useRoute } from "wouter";
import { Layout } from "@/components/Layout";
import { useGetSchool } from "@workspace/api-client-react";
import { Loader2, MapPin, Globe, Phone, Mail, Award, BookOpen, GraduationCap, Building2, ChevronRight, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useFavorites } from "@/contexts/FavoritesContext";
import { cn } from "@/lib/utils";

export default function SchoolDetail() {
  const [, params] = useRoute("/schools/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;

  const { data: school, isLoading, error } = useGetSchool(id, {
    query: { enabled: !!id }
  });

  const { isSchoolFav, toggleSchool } = useFavorites();
  const isFav = school ? isSchoolFav(school.id) : false;

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

      <div className="relative z-10 pt-20 px-4 pb-12">
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
            <h2 className="font-display text-lg font-bold mb-3 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-primary" /> Diplômes préparés
            </h2>
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
              {school.diplomas.map((diploma, i) => (
                <div key={i} className={`p-4 flex items-center justify-between ${i !== school.diplomas.length - 1 ? 'border-b border-border/50' : ''}`}>
                  <span className="font-medium text-sm text-foreground">{diploma}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                </div>
              ))}
            </div>
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

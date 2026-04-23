import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useListSchools, useListCompetitions } from "@workspace/api-client-react";
import { SchoolCard } from "@/components/Cards";
import { CompetitionCard } from "@/components/Cards";
import { Heart, GraduationCap, Briefcase } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/useT";

export default function Favorites() {
  const { t } = useT();
  const { favoriteSchools, favoriteCompetitions } = useFavorites();
  const [activeTab, setActiveTab] = useState<"schools" | "competitions">("schools");

  const { data: allSchools = [] } = useListSchools();
  const { data: allCompetitions = [] } = useListCompetitions();

  const schools = allSchools.filter(s => favoriteSchools.includes(s.id));
  const competitions = allCompetitions.filter(c => favoriteCompetitions.includes(c.id));

  const totalFavs = favoriteSchools.length + favoriteCompetitions.length;

  return (
    <Layout title={t("favorites_title")}>
      {/* Tabs */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("schools")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95",
              activeTab === "schools"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-muted text-muted-foreground"
            )}
          >
            <GraduationCap className="w-4 h-4" />
            {t("favorites_tab_schools")}
            {favoriteSchools.length > 0 && (
              <span className={cn(
                "w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center",
                activeTab === "schools" ? "bg-primary text-white" : "bg-muted-foreground/20 text-muted-foreground"
              )}>
                {favoriteSchools.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("competitions")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95",
              activeTab === "competitions"
                ? "bg-secondary/10 text-secondary border border-secondary/20"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Briefcase className="w-4 h-4" />
            {t("favorites_tab_comps")}
            {favoriteCompetitions.length > 0 && (
              <span className={cn(
                "w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center",
                activeTab === "competitions" ? "bg-secondary text-white" : "bg-muted-foreground/20 text-muted-foreground"
              )}>
                {favoriteCompetitions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="px-4 py-6">
        {totalFavs === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-5">
              <Heart className="w-8 h-8 text-red-300" />
            </div>
            <h3 className="font-display font-bold text-xl mb-2 text-foreground">{t("favorites_empty")}</h3>
            <p className="text-muted-foreground text-sm text-balance mb-8">
              {t("favorites_empty_sub")}
            </p>
            <div className="flex gap-3 w-full">
              <Link href="/schools" className="flex-1">
                <button className="w-full py-3 rounded-2xl bg-primary/10 text-primary font-semibold text-sm active:scale-95 transition-all">
                  {t("nav_schools")}
                </button>
              </Link>
              <Link href="/competitions" className="flex-1">
                <button className="w-full py-3 rounded-2xl bg-secondary/10 text-secondary font-semibold text-sm active:scale-95 transition-all">
                  {t("nav_competitions")}
                </button>
              </Link>
            </div>
          </div>
        ) : activeTab === "schools" ? (
          <div className="space-y-4">
            {schools.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">Aucune école en favori.</p>
                <Link href="/schools">
                  <button className="mt-4 px-6 py-2 bg-primary/10 text-primary font-semibold rounded-full text-sm active:scale-95">
                    Explorer les écoles
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">{schools.length} école{schools.length !== 1 ? 's' : ''} sauvegardée{schools.length !== 1 ? 's' : ''}</p>
                {schools.map((school, i) => (
                  <SchoolCard key={school.id} school={school} index={i} />
                ))}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {competitions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">Aucun concours en favori.</p>
                <Link href="/competitions">
                  <button className="mt-4 px-6 py-2 bg-secondary/10 text-secondary font-semibold rounded-full text-sm active:scale-95">
                    Voir les concours
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">{competitions.length} concours sauvegardé{competitions.length !== 1 ? 's' : ''}</p>
                {competitions.map((comp, i) => (
                  <CompetitionCard key={comp.id} competition={comp} index={i} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

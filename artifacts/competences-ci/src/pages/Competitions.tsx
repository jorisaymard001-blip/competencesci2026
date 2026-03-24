import { useState } from "react";
import { Layout } from "@/components/Layout";
import { CompetitionCard } from "@/components/Cards";
import { FilterDrawer, FilterSection, FilterSelect } from "@/components/FilterDrawer";
import { useFilters } from "@/hooks/use-filters";
import { SlidersHorizontal, Loader2, Search } from "lucide-react";
import { useListCompetitions, useListCities, useListDiplomas, type ListCompetitionsParams } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

export default function Competitions() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { filters, updateFilter, clearFilters } = useFilters<ListCompetitionsParams>({});
  
  const { data: competitions, isLoading, error } = useListCompetitions(filters);
  const { data: cities = [] } = useListCities();
  const { data: diplomas = [] } = useListDiplomas();

  const [localFilters, setLocalFilters] = useState<ListCompetitionsParams>(filters);

  // Tabs for status filtering on top
  const tabs = [
    { id: undefined, label: "Tous" },
    { id: "open", label: "Ouverts" },
    { id: "upcoming", label: "À venir" },
    { id: "closed", label: "Fermés" },
  ];

  const applyFilters = () => {
    Object.keys(localFilters).forEach(key => {
      // @ts-ignore
      updateFilter(key, localFilters[key]);
    });
    if (!localFilters.city) updateFilter("city", undefined);
    if (!localFilters.diploma) updateFilter("diploma", undefined);
  };

  const activeFiltersCount = (filters.city ? 1 : 0) + (filters.diploma ? 1 : 0);

  return (
    <Layout title="Concours Publics">
      
      {/* Status Tabs Header */}
      <div className="sticky top-14 md:top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 pt-2 pb-3">
        <div className="px-4 md:px-6 max-w-6xl mx-auto flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {tabs.map(tab => {
            const isActive = filters.status === tab.id;
            return (
              <button
                key={tab.id || 'all'}
                onClick={() => updateFilter("status", tab.id as any)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 active:scale-95",
                  isActive 
                    ? "bg-secondary text-white shadow-md shadow-secondary/20" 
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        
        <div className="px-4 md:px-6 max-w-6xl mx-auto mt-3 flex justify-between items-center">
          <div className="text-sm font-medium text-muted-foreground">
            {competitions?.length || 0} résultat{competitions?.length !== 1 ? 's' : ''}
          </div>
          <button 
            onClick={() => { setLocalFilters(filters); setIsFilterOpen(true); }}
            className="flex items-center text-sm font-semibold text-primary"
          >
            <SlidersHorizontal className="w-4 h-4 mr-1.5" />
            Filtrer {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 py-6 max-w-6xl mx-auto w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-secondary mb-4" />
          </div>
        ) : error ? (
          <div className="text-center py-10 px-4 bg-destructive/5 rounded-2xl border border-destructive/20 text-destructive">
            <p className="font-semibold">Une erreur est survenue</p>
          </div>
        ) : competitions?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Aucun concours</h3>
            <p className="text-muted-foreground text-sm text-balance">
              Aucun concours ne correspond à ces critères actuellement.
            </p>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="mt-6 px-6 py-2 bg-secondary/10 text-secondary font-semibold rounded-full">
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {competitions?.map((comp, i) => (
              <CompetitionCard key={comp.id} competition={comp} index={i} />
            ))}
          </div>
        )}
      </div>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={applyFilters}
        onReset={() => setLocalFilters(prev => ({ ...prev, city: undefined, diploma: undefined }))}
        title="Filtrer les concours"
      >
        <FilterSection title="Lieu de composition (Ville)">
          <FilterSelect 
            placeholder="Toutes les villes"
            options={cities}
            value={localFilters.city}
            onChange={(v) => setLocalFilters(prev => ({ ...prev, city: v }))}
          />
        </FilterSection>

        <FilterSection title="Niveau Requis">
          <FilterSelect 
            placeholder="Tous les niveaux"
            options={diplomas}
            value={localFilters.diploma}
            onChange={(v) => setLocalFilters(prev => ({ ...prev, diploma: v }))}
          />
        </FilterSection>
      </FilterDrawer>
      
    </Layout>
  );
}

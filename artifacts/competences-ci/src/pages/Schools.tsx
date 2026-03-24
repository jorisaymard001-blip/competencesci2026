import { useState } from "react";
import { Layout } from "@/components/Layout";
import { SchoolCard } from "@/components/Cards";
import { FilterDrawer, FilterSection, FilterSelect, FilterPills } from "@/components/FilterDrawer";
import { useFilters } from "@/hooks/use-filters";
import { Search, SlidersHorizontal, Loader2, MapPin } from "lucide-react";
import { useListSchools, useListCities, useListDiplomas, type ListSchoolsParams } from "@workspace/api-client-react";

export default function Schools() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { filters, updateFilter, clearFilters } = useFilters<ListSchoolsParams>({});
  
  // Queries
  const { data: schools, isLoading, error } = useListSchools(filters);
  const { data: cities = [] } = useListCities();
  const { data: diplomas = [] } = useListDiplomas();

  // Local state for the drawer before applying
  const [localFilters, setLocalFilters] = useState<ListSchoolsParams>(filters);

  const openFilters = () => {
    setLocalFilters(filters);
    setIsFilterOpen(true);
  };

  const applyFilters = () => {
    // Sync local to url/main state
    Object.keys(localFilters).forEach(key => {
      // @ts-ignore
      updateFilter(key as keyof ListSchoolsParams, localFilters[key]);
    });
    // Clean up empty ones
    const keys = ["city", "type", "diploma"] as const;
    keys.forEach(k => {
      if (!localFilters[k]) updateFilter(k, undefined);
    });
  };

  // Filter visually by search query (since API doesn't have a text search param in the spec)
  const filteredSchools = schools?.filter(s => 
    searchQuery === "" || 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.domains.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== "").length;

  return (
    <Layout title="Écoles & Instituts">
      
      {/* Sticky Header with Search & Filter Trigger */}
      <div className="sticky top-14 md:top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="px-4 md:px-6 py-3 max-w-6xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Rechercher une école..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/50 border border-border/80 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            />
          </div>
          <button 
            onClick={openFilters}
            className="flex items-center justify-center w-11 h-11 bg-muted/50 border border-border/80 rounded-xl relative active:scale-95 transition-transform"
          >
            <SlidersHorizontal className="w-4 h-4 text-foreground" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-background">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 py-6 max-w-6xl mx-auto w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground font-medium">Chargement des écoles...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 px-4 bg-destructive/5 rounded-2xl border border-destructive/20 text-destructive">
            <p className="font-semibold">Une erreur est survenue</p>
            <p className="text-sm mt-1">Impossible de charger la liste des écoles.</p>
          </div>
        ) : filteredSchools?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Aucun résultat</h3>
            <p className="text-muted-foreground text-sm text-balance">
              Essayez de modifier vos filtres ou votre terme de recherche.
            </p>
            {activeFiltersCount > 0 && (
              <button 
                onClick={clearFilters}
                className="mt-6 px-6 py-2.5 bg-primary/10 text-primary font-semibold rounded-full active:scale-95 min-h-[44px]"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="text-sm font-medium text-muted-foreground px-1 mb-4">
              {filteredSchools?.length} établissement{filteredSchools?.length !== 1 ? 's' : ''} trouvé{filteredSchools?.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSchools?.map((school, i) => (
                <SchoolCard key={school.id} school={school} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={applyFilters}
        onReset={() => setLocalFilters({})}
      >
        <FilterSection title="Type d'établissement">
          <FilterPills 
            options={[
              { value: "public", label: "Public" },
              { value: "private", label: "Privé" }
            ]}
            value={localFilters.type}
            onChange={(v) => setLocalFilters(prev => ({ ...prev, type: v as any }))}
          />
        </FilterSection>

        <FilterSection title="Ville">
          <FilterSelect 
            placeholder="Toutes les villes"
            options={cities}
            value={localFilters.city}
            onChange={(v) => setLocalFilters(prev => ({ ...prev, city: v }))}
          />
        </FilterSection>

        <FilterSection title="Niveau de Diplôme">
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

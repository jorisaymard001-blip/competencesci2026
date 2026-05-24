import { useState } from "react";
import { Layout } from "@/components/Layout";
import { CompetitionCard, CompetitionCardSkeleton } from "@/components/Cards";
import { FilterDrawer, FilterSection, FilterSelect } from "@/components/FilterDrawer";
import { useFilters } from "@/hooks/use-filters";
import { SlidersHorizontal, Search } from "lucide-react";
import { useListCompetitions, useListCities, useListDiplomas, type ListCompetitionsParams } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/useT";

const TABS = [
  { id: undefined,   label: "Tous",    emoji: "📋", activeCls: "bg-primary text-white shadow-primary/20" },
  { id: "open",      label: "Ouverts", emoji: "🟢", activeCls: "bg-green-500 text-white shadow-green-500/20" },
  { id: "upcoming",  label: "À venir", emoji: "🔵", activeCls: "bg-blue-500 text-white shadow-blue-500/20" },
  { id: "closed",    label: "Fermés",  emoji: "🔴", activeCls: "bg-slate-500 text-white shadow-slate-500/20" },
] as const;

export default function Competitions() {
  const { t } = useT();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { filters, updateFilter, clearFilters } = useFilters<ListCompetitionsParams>({});

  const { data: competitions, isLoading, error } = useListCompetitions(filters);
  const { data: cities = [] } = useListCities();
  const { data: diplomas = [] } = useListDiplomas();
  const [localFilters, setLocalFilters] = useState<ListCompetitionsParams>(filters);

  const applyFilters = () => {
    if (!localFilters.city) updateFilter("city", undefined);
    else updateFilter("city", localFilters.city);
    if (!localFilters.diploma) updateFilter("diploma", undefined);
    else updateFilter("diploma", localFilters.diploma);
  };

  const activeFiltersCount = (filters.city ? 1 : 0) + (filters.diploma ? 1 : 0);

  return (
    <Layout title={t("competitions_title")}>

      {/* ── Status Tabs */}
      <div className="sticky top-14 md:top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="px-4 md:px-6 pt-3 pb-3 max-w-6xl mx-auto">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            {TABS.map(tab => {
              const isActive = filters.status === tab.id;
              return (
                <button
                  key={tab.id ?? "all"}
                  onClick={() => updateFilter("status", tab.id as any)}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-black",
                    "transition-all duration-200 press shadow-md",
                    isActive ? tab.activeCls : "bg-card border border-border/60 text-muted-foreground"
                  )}
                >
                  <span className="text-xs">{tab.emoji}</span>
                  {tab.label}
                  {isActive && competitions?.length !== undefined && (
                    <span className="bg-white/20 text-inherit text-[10px] px-1.5 py-0.5 rounded-full font-black ml-0.5">
                      {competitions.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-2">
            {!isLoading && (
              <p className="text-xs font-semibold text-muted-foreground">
                {competitions?.length ?? 0} {t("competitions_count_many")}
              </p>
            )}
            <button
              onClick={() => { setLocalFilters(filters); setIsFilterOpen(true); }}
              className="flex items-center gap-1.5 text-sm font-bold text-primary press active:opacity-70"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t("competitions_filter")}
              {activeFiltersCount > 0 && (
                <span className="bg-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Content */}
      <div className="px-4 md:px-6 py-5 max-w-6xl mx-auto w-full">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <CompetitionCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-10 px-4 bg-destructive/5 rounded-2xl border border-destructive/20 text-destructive">
            <p className="font-bold">{t("schools_error_title")}</p>
          </div>
        ) : competitions?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-black text-lg mb-2">{t("competitions_no_results")}</h3>
            <p className="text-muted-foreground text-sm">{t("competitions_no_results_sub")}</p>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="mt-5 px-6 py-2.5 bg-secondary/10 text-secondary font-bold rounded-full press active:scale-95">
                {t("schools_clear_filters")}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {competitions?.map((comp, i) => (
              <CompetitionCard key={comp.id} competition={comp} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* ── Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={applyFilters}
        onReset={() => setLocalFilters(prev => ({ ...prev, city: undefined, diploma: undefined }))}
        title={t("competitions_filter_title")}
      >
        <FilterSection title={t("competitions_filter_city")}>
          <FilterSelect
            placeholder={t("schools_all_cities")}
            options={cities}
            value={localFilters.city}
            onChange={v => setLocalFilters(prev => ({ ...prev, city: v }))}
          />
        </FilterSection>
        <FilterSection title={t("competitions_filter_diploma")}>
          <FilterSelect
            placeholder={t("competitions_all_levels")}
            options={diplomas}
            value={localFilters.diploma}
            onChange={v => setLocalFilters(prev => ({ ...prev, diploma: v }))}
          />
        </FilterSection>
      </FilterDrawer>
    </Layout>
  );
}

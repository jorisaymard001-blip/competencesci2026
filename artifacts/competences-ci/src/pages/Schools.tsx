import { useState } from "react";
import { Layout } from "@/components/Layout";
import { SchoolCard, SchoolCardSkeleton } from "@/components/Cards";
import { FilterDrawer, FilterSection, FilterSelect } from "@/components/FilterDrawer";
import { useFilters } from "@/hooks/use-filters";
import { Search, SlidersHorizontal } from "lucide-react";
import { useListSchools, useListCities, useListDiplomas, type ListSchoolsParams } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/useT";

const TYPE_FILTERS = [
  { value: undefined,   label: "Tous" },
  { value: "public",    label: "Public" },
  { value: "private",   label: "Privé" },
] as const;

export default function Schools() {
  const { t } = useT();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickType, setQuickType] = useState<"public" | "private" | undefined>(undefined);

  const { filters, updateFilter, clearFilters } = useFilters<ListSchoolsParams>({});
  const { data: schools, isLoading, error } = useListSchools({ ...filters, type: quickType ?? filters.type });
  const { data: cities = [] } = useListCities();
  const { data: diplomas = [] } = useListDiplomas();
  const [localFilters, setLocalFilters] = useState<ListSchoolsParams>(filters);

  const openFilters = () => { setLocalFilters(filters); setIsFilterOpen(true); };
  const applyFilters = () => {
    (["city", "type", "diploma"] as const).forEach(k => updateFilter(k, localFilters[k] as any));
  };

  const filteredSchools = schools?.filter(s =>
    searchQuery === "" ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.domains.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && v !== "").length;

  return (
    <Layout title={t("schools_title")}>

      {/* ── Sticky search + filter bar */}
      <div className="sticky top-14 md:top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="px-4 md:px-6 pt-3 pb-0 max-w-6xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("schools_search")}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border/80 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={openFilters}
            className="relative flex items-center justify-center w-11 h-11 bg-card border border-border/80 rounded-xl active:scale-95 transition-transform press"
          >
            <SlidersHorizontal className="w-4 h-4 text-foreground" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-background">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Quick type pills */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.label}
              onClick={() => setQuickType(f.value as any)}
              className={cn(
                "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 press",
                (quickType ?? undefined) === f.value
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-card border border-border/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content */}
      <div className="px-4 md:px-6 py-5 max-w-6xl mx-auto w-full">
        {isLoading ? (
          <div>
            <div className="h-4 w-24 bg-muted rounded-lg animate-pulse mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => <SchoolCardSkeleton key={i} />)}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-10 px-4 bg-destructive/5 rounded-2xl border border-destructive/20 text-destructive">
            <p className="font-bold">{t("schools_error_title")}</p>
            <p className="text-sm mt-1">{t("schools_error_sub")}</p>
          </div>
        ) : filteredSchools?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-black text-lg mb-2">{t("schools_no_results")}</h3>
            <p className="text-muted-foreground text-sm">{t("schools_no_results_sub")}</p>
            {(activeFiltersCount > 0 || quickType) && (
              <button
                onClick={() => { clearFilters(); setQuickType(undefined); }}
                className="mt-5 px-6 py-2.5 bg-primary/10 text-primary font-bold rounded-full active:scale-95 press"
              >
                {t("schools_clear_filters")}
              </button>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-4 px-0.5">
              {filteredSchools?.length} {filteredSchools?.length !== 1 ? t("schools_count_many") : t("schools_count_one")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredSchools?.map((school, i) => (
                <SchoolCard key={school.id} school={school} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={applyFilters}
        onReset={() => setLocalFilters({})}
      >
        <FilterSection title={t("schools_filter_city")}>
          <FilterSelect
            placeholder={t("schools_all_cities")}
            options={cities}
            value={localFilters.city}
            onChange={v => setLocalFilters(prev => ({ ...prev, city: v }))}
          />
        </FilterSection>
        <FilterSection title={t("schools_filter_diploma")}>
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

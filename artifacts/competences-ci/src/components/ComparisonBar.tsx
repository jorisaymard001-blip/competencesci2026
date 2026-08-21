import { useLocation } from "wouter";
import { Scale, X } from "lucide-react";
import { useComparison } from "@/contexts/ComparisonContext";

export function ComparisonBar() {
  const { schools, remove, clear } = useComparison();
  const [, navigate] = useLocation();
  if (schools.length === 0) return null;

  return (
    <div className="fixed bottom-16 lg:bottom-4 left-3 right-3 z-40 max-w-2xl mx-auto">
      <div className="rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-xl shadow-2xl p-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Scale className="w-4 h-4 text-primary" />
            Comparer des écoles ({schools.length}/3)
          </p>
          <button onClick={clear} className="text-xs text-muted-foreground hover:text-foreground">
            Tout effacer
          </button>
        </div>
        <div className="flex gap-2 mb-3">
          {schools.map(school => (
            <div key={school.id} className="min-w-0 flex-1 flex items-center gap-1 rounded-xl bg-muted px-2 py-2">
              <span className="truncate text-xs font-semibold text-foreground">{school.name}</span>
              <button onClick={() => remove(school.id)} aria-label={`Retirer ${school.name}`} className="shrink-0 text-muted-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button
          disabled={schools.length < 2}
          onClick={() => navigate("/comparer")}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          {schools.length < 2 ? "Sélectionnez encore une école" : "Comparer maintenant →"}
        </button>
      </div>
    </div>
  );
}
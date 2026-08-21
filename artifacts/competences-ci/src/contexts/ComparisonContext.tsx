import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { School } from "@workspace/api-client-react";

interface ComparisonContextValue {
  schools: School[];
  add: (school: School) => boolean;
  remove: (id: number) => void;
  clear: () => void;
  isSelected: (id: number) => boolean;
}

const ComparisonContext = createContext<ComparisonContextValue | null>(null);
const STORAGE_KEY = "competences_ci_comparison";

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [schools, setSchools] = useState<School[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(saved) ? saved.slice(0, 3) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schools));
  }, [schools]);

  const add = (school: School) => {
    if (schools.some(item => item.id === school.id)) return true;
    if (schools.length >= 3) return false;
    setSchools(current => [...current, school]);
    return true;
  };

  return (
    <ComparisonContext.Provider
      value={{
        schools,
        add,
        remove: id => setSchools(current => current.filter(school => school.id !== id)),
        clear: () => setSchools([]),
        isSelected: id => schools.some(school => school.id === id),
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) throw new Error("useComparison must be used within ComparisonProvider");
  return context;
}
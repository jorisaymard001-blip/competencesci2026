import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface FavoritesContextType {
  favoriteSchools: number[];
  favoriteCompetitions: number[];
  toggleSchool: (id: number) => void;
  toggleCompetition: (id: number) => void;
  isSchoolFav: (id: number) => boolean;
  isCompetitionFav: (id: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

function getKey(userId: number, type: string) {
  return `favs_${type}_${userId}`;
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [favoriteSchools, setFavoriteSchools] = useState<number[]>([]);
  const [favoriteCompetitions, setFavoriteCompetitions] = useState<number[]>([]);

  // Load from localStorage when user changes
  useEffect(() => {
    if (user) {
      try {
        const schools = JSON.parse(localStorage.getItem(getKey(user.id, "schools")) || "[]");
        const comps = JSON.parse(localStorage.getItem(getKey(user.id, "competitions")) || "[]");
        setFavoriteSchools(schools);
        setFavoriteCompetitions(comps);
      } catch {
        setFavoriteSchools([]);
        setFavoriteCompetitions([]);
      }
    } else {
      setFavoriteSchools([]);
      setFavoriteCompetitions([]);
    }
  }, [user]);

  const toggleSchool = (id: number) => {
    if (!user) return;
    setFavoriteSchools(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(getKey(user.id, "schools"), JSON.stringify(next));
      return next;
    });
  };

  const toggleCompetition = (id: number) => {
    if (!user) return;
    setFavoriteCompetitions(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(getKey(user.id, "competitions"), JSON.stringify(next));
      return next;
    });
  };

  const isSchoolFav = (id: number) => favoriteSchools.includes(id);
  const isCompetitionFav = (id: number) => favoriteCompetitions.includes(id);

  return (
    <FavoritesContext.Provider value={{
      favoriteSchools,
      favoriteCompetitions,
      toggleSchool,
      toggleCompetition,
      isSchoolFav,
      isCompetitionFav,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}

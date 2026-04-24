import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

type Theme = "light" | "dark";
type Language = "fr" | "en";

interface SearchEntry {
  query: string;
  type: "school" | "competition";
  timestamp: number;
}

interface UsageData {
  totalSeconds: number;
  lastSessionStart: number | null;
  byDay: Record<string, number>; // ISO date → seconds
}

interface SettingsContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (l: Language) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
  searchHistory: SearchEntry[];
  addSearch: (query: string, type: SearchEntry["type"]) => void;
  clearSearchHistory: () => void;
  usageData: UsageData;
  getTodaySeconds: () => number;
  getThisYearSeconds: () => number;
}

const SETTINGS_KEY = "competences_ci_settings";
const USAGE_KEY = "competences_ci_usage";
const SEARCH_KEY = "competences_ci_search_history";

const SettingsContext = createContext<SettingsContextType | null>(null);

function applyTheme(theme: Theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      return s.theme ?? "light";
    } catch { return "light"; }
  });

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      return s.language ?? "fr";
    } catch { return "fr"; }
  });

  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      return s.notificationsEnabled ?? true;
    } catch { return true; }
  });

  const [searchHistory, setSearchHistory] = useState<SearchEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(SEARCH_KEY) || "[]");
    } catch { return []; }
  });

  const [usageData, setUsageData] = useState<UsageData>(() => {
    try {
      return JSON.parse(localStorage.getItem(USAGE_KEY) || "null") ?? {
        totalSeconds: 0,
        lastSessionStart: null,
        byDay: {},
      };
    } catch {
      return { totalSeconds: 0, lastSessionStart: null, byDay: {} };
    }
  });

  const sessionStartRef = useRef<number>(Date.now());

  // Apply theme on mount + change
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ theme, language, notificationsEnabled }));
  }, [theme, language, notificationsEnabled]);

  // Track usage time
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const start = Date.now();
    sessionStartRef.current = start;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setUsageData((prev) => {
        const updated = {
          ...prev,
          totalSeconds: prev.totalSeconds + 1,
          byDay: {
            ...prev.byDay,
            [today]: (prev.byDay[today] ?? 0) + 1,
          },
        };
        localStorage.setItem(USAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  const setLanguage = (l: Language) => {
    setLanguageState(l);
  };

  const setNotificationsEnabled = (v: boolean) => {
    setNotificationsEnabledState(v);
  };

  const addSearch = (query: string, type: SearchEntry["type"]) => {
    if (!query.trim()) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((e) => !(e.query === query && e.type === type));
      const updated = [{ query, type, timestamp: Date.now() }, ...filtered].slice(0, 20);
      localStorage.setItem(SEARCH_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_KEY);
  };

  const getTodaySeconds = () => {
    const today = new Date().toISOString().slice(0, 10);
    return usageData.byDay[today] ?? 0;
  };

  const getThisYearSeconds = () => {
    const year = new Date().getFullYear().toString();
    return Object.entries(usageData.byDay)
      .filter(([date]) => date.startsWith(year))
      .reduce((acc, [, secs]) => acc + secs, 0);
  };

  return (
    <SettingsContext.Provider value={{
      theme,
      toggleTheme,
      language,
      setLanguage,
      notificationsEnabled,
      setNotificationsEnabled,
      searchHistory,
      addSearch,
      clearSearchHistory,
      usageData,
      getTodaySeconds,
      getThisYearSeconds,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}

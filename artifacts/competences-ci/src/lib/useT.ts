import { useSettings } from "@/contexts/SettingsContext";
import { translations, TranslationKey } from "./i18n";

export function useT() {
  const { language } = useSettings();

  function t(key: TranslationKey): string {
    const dict = translations[language] as Record<string, string>;
    return dict[key] ?? (translations.fr as Record<string, string>)[key] ?? key;
  }

  return { t, language };
}

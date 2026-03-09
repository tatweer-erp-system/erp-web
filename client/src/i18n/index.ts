import { en } from "./en";
import { ar } from "./ar";

export type SupportedLang = "en" | "ar";

const translations: Record<SupportedLang, Record<string, string>> = { en, ar };

/**
 * Translate a key to the given language, falling back to English.
 * Usage: t("Dashboard", "ar") → "لوحة التحكم"
 */
export function t(key: string, lang: string): string {
  const langKey = (lang in translations ? lang : "en") as SupportedLang;
  return translations[langKey][key] ?? translations.en[key] ?? key;
}

export { en, ar };

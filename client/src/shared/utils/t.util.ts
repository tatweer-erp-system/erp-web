import { ar } from "@/i18n/ar";
import { en } from "@/i18n/en";

type SupportedLang = "ar" | "en";

const dictionaries: Record<SupportedLang, Record<string, string>> = { ar, en };

/**
 * Translates a key to the specified language.
 *
 * Lookup order:
 * 1. Requested language dictionary
 * 2. English dictionary (fallback)
 * 3. Raw key (if no translation found)
 *
 * @param key - The i18n translation key (flat dot-notation).
 * @param lang - The target language (`"ar"` or `"en"`).
 * @returns The translated string.
 */
export function t(key: string, lang: SupportedLang): string {
  return dictionaries[lang]?.[key] ?? dictionaries.en[key] ?? key;
}

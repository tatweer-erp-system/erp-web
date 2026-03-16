type SupportedLang = "ar" | "en";

const LOCALE_MAP: Record<SupportedLang, string> = {
  ar: "ar-SA",
  en: "en-US",
};

/**
 * Formats a number with locale-aware grouping separators.
 *
 * @param value - The numeric value to format.
 * @param lang - The target locale (`"ar"` or `"en"`).
 * @param maximumFractionDigits - Maximum decimal places (defaults to 2).
 * @returns Formatted number string.
 */
export function formatNumber(
  value: number,
  lang: SupportedLang,
  maximumFractionDigits: number = 2
): string {
  return new Intl.NumberFormat(LOCALE_MAP[lang], {
    maximumFractionDigits,
  }).format(value);
}

/**
 * Formats a decimal value as a locale-aware percentage string.
 *
 * Expects a fractional value (e.g. 0.15 for 15%).
 *
 * @param value - The fractional value to format as percentage.
 * @param lang - The target locale (`"ar"` or `"en"`).
 * @param maximumFractionDigits - Maximum decimal places (defaults to 1).
 * @returns Formatted percentage string.
 */
export function formatPercentage(
  value: number,
  lang: SupportedLang,
  maximumFractionDigits: number = 1
): string {
  return new Intl.NumberFormat(LOCALE_MAP[lang], {
    style: "percent",
    maximumFractionDigits,
  }).format(value);
}

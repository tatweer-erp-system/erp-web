type SupportedLang = "ar" | "en";

const LOCALE_MAP: Record<SupportedLang, string> = {
  ar: "ar-SA",
  en: "en-US",
};

/**
 * Formats a numeric value as a locale-aware currency string.
 *
 * Defaults to SAR (Saudi Riyal) as the base currency.
 *
 * @param value - The monetary amount to format.
 * @param lang - The target locale (`"ar"` or `"en"`).
 * @param currencyCode - ISO 4217 currency code (defaults to `"SAR"`).
 * @returns Formatted currency string (e.g. "SAR 1,250.00" or "١٬٢٥٠٫٠٠ ر.س.").
 */
export function formatCurrency(
  value: number,
  lang: SupportedLang,
  currencyCode: string = "SAR"
): string {
  return new Intl.NumberFormat(LOCALE_MAP[lang], {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Parses a currency string back into a numeric value.
 *
 * Strips all non-numeric characters except digits, decimal points, and minus signs.
 * Returns `NaN` if the string cannot be parsed.
 *
 * @param formattedValue - The formatted currency string to parse.
 * @returns The numeric value, or `NaN` if unparseable.
 */
export function parseCurrency(formattedValue: string): number {
  const cleaned = formattedValue
    .replace(/[^\d.\-\u0660-\u0669]/g, "")
    .replace(/[\u0660-\u0669]/g, char => String(char.charCodeAt(0) - 0x0660));

  return parseFloat(cleaned);
}

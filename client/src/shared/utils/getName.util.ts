import { useLangStore } from "@/stores/lang.store";

type BilingualRecord = {
  nameEn?: string | null;
  nameAr?: string | null;
};

/**
 * Returns the appropriate name (Arabic or English) based on the current UI language.
 *
 * Falls back to the other language if the preferred one is missing.
 * Returns an empty string for null/undefined records.
 *
 * @param record - Object containing `nameEn` and/or `nameAr` fields, or null/undefined.
 * @returns The resolved display name string.
 */
export function getName(record: BilingualRecord | null | undefined): string {
  if (!record) return "";

  const lang = useLangStore.getState().lang;

  if (lang === "ar") {
    return record.nameAr ?? record.nameEn ?? "";
  }

  return record.nameEn ?? record.nameAr ?? "";
}

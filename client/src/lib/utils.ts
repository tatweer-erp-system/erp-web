import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getStorageItem, STORAGE_KEYS } from "@/lib/storage";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getName(
  record: { nameEn?: string; nameAr?: string } | null | undefined
): string {
  if (!record) return "";
  const lang = getStorageItem(STORAGE_KEYS.LANGUAGE) ?? "en";
  if (lang === "ar") return record.nameAr ?? record.nameEn ?? "";
  return record.nameEn ?? record.nameAr ?? "";
}

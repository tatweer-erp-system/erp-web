import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ar";

dayjs.extend(relativeTime);

type SupportedLang = "ar" | "en";

/**
 * Formats a date as a locale-aware short date string (e.g. "2026-03-17" or "17/03/2026").
 *
 * @param date - The date value to format.
 * @param lang - The target locale (`"ar"` or `"en"`).
 * @returns Formatted date string.
 */
export function formatDate(
  date: string | number | Date,
  lang: SupportedLang
): string {
  return dayjs(date)
    .locale(lang)
    .format(lang === "ar" ? "DD/MM/YYYY" : "YYYY-MM-DD");
}

/**
 * Formats a date with time as a locale-aware string.
 *
 * @param date - The date value to format.
 * @param lang - The target locale (`"ar"` or `"en"`).
 * @returns Formatted date-time string.
 */
export function formatDateTime(
  date: string | number | Date,
  lang: SupportedLang
): string {
  return dayjs(date)
    .locale(lang)
    .format(lang === "ar" ? "DD/MM/YYYY hh:mm A" : "YYYY-MM-DD hh:mm A");
}

/**
 * Returns a human-readable relative time string (e.g. "3 hours ago" or "منذ 3 ساعات").
 *
 * @param date - The date value to compare against now.
 * @param lang - The target locale (`"ar"` or `"en"`).
 * @returns Relative time string.
 */
export function formatRelative(
  date: string | number | Date,
  lang: SupportedLang
): string {
  return dayjs(date).locale(lang).fromNow();
}

/**
 * Checks whether a given date is in the past.
 *
 * @param date - The date value to check.
 * @returns `true` if the date is before the current moment.
 */
export function isExpired(date: string | number | Date): boolean {
  return dayjs(date).isBefore(dayjs());
}

/**
 * Calculates the number of days from now until the given date.
 *
 * Returns a negative number if the date is in the past.
 *
 * @param date - The target date.
 * @returns Number of days until the date (negative if past).
 */
export function daysUntil(date: string | number | Date): number {
  return dayjs(date).startOf("day").diff(dayjs().startOf("day"), "day");
}

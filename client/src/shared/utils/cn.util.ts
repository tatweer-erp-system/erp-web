import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines conditional class names with Tailwind CSS conflict resolution.
 *
 * Wraps `clsx` for conditional class composition and `tailwind-merge`
 * to intelligently resolve conflicting Tailwind utility classes.
 *
 * @param inputs - Class values (strings, arrays, objects, or falsy values).
 * @returns A single merged class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

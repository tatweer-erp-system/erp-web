import { useLangStore, selectDirection } from "@/stores/lang.store";

type Direction = "rtl" | "ltr";

/**
 * Returns the current layout direction (`'rtl'` or `'ltr'`) from the language store.
 *
 * Use this in components that need direction awareness without importing the store directly.
 */
export function useDirection(): Direction {
  return useLangStore(selectDirection);
}

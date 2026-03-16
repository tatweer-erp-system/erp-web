import {
  useLangStore,
  selectLang,
  selectDirection,
  selectSetLang,
  selectToggleLang,
} from "@/stores/lang.store";

type LangResult = {
  lang: "ar" | "en";
  setLang: (lang: "ar" | "en") => void;
  toggleLang: () => void;
  direction: "rtl" | "ltr";
};

/**
 * Hook for components that need to read and change the current language.
 *
 * For components that only need to read language/direction, prefer {@link useTranslation}.
 */
export function useLang(): LangResult {
  const lang = useLangStore(selectLang);
  const direction = useLangStore(selectDirection);
  const setLang = useLangStore(selectSetLang);
  const toggleLang = useLangStore(selectToggleLang);

  return { lang, setLang, toggleLang, direction };
}

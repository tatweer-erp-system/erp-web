import { useLangStore, selectLang, selectDirection } from "@/stores/lang.store";
import { t } from "@/shared/utils/t.util";

type TranslationResult = {
  t: typeof t;
  lang: "ar" | "en";
  direction: "rtl" | "ltr";
};

/**
 * Primary i18n hook for components.
 *
 * Returns the `t` translation function, the current language, and the layout direction.
 *
 * @example
 * ```tsx
 * const { t, lang } = useTranslation();
 * return <span>{t('invoice.title', lang)}</span>;
 * ```
 */
export function useTranslation(): TranslationResult {
  const lang = useLangStore(selectLang);
  const direction = useLangStore(selectDirection);

  return { t, lang, direction };
}

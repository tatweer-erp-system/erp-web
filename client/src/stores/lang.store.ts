import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ───────────────────────────────────────────────────────────────────

type Lang = "ar" | "en";
type Direction = "rtl" | "ltr";

type LangState = {
  lang: Lang;
  direction: Direction;
};

type LangActions = {
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DIRECTION_MAP: Record<Lang, Direction> = {
  ar: "rtl",
  en: "ltr",
} as const;

function applyToDocument(lang: Lang): void {
  const dir = DIRECTION_MAP[lang];
  document.dir = dir;
  document.documentElement.lang = lang;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useLangStore = create<LangState & LangActions>()(
  persist(
    set => ({
      lang: "ar",
      direction: "rtl",

      setLang: lang => {
        applyToDocument(lang);
        set({ lang, direction: DIRECTION_MAP[lang] });
      },

      toggleLang: () => {
        set(state => {
          const next: Lang = state.lang === "ar" ? "en" : "ar";
          applyToDocument(next);
          return { lang: next, direction: DIRECTION_MAP[next] };
        });
      },
    }),
    {
      name: "erp-lang",
      onRehydrateStorage: () => state => {
        if (state) {
          applyToDocument(state.lang);
        }
      },
    }
  )
);

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectLang = (state: LangState & LangActions) => state.lang;
export const selectDirection = (state: LangState & LangActions) =>
  state.direction;
export const selectSetLang = (state: LangState & LangActions) => state.setLang;
export const selectToggleLang = (state: LangState & LangActions) =>
  state.toggleLang;

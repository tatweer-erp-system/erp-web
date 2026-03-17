/**
 * Zustand store for UI preference settings (layout, CRUD style, PIN style, etc.).
 * Persists all preferences to localStorage.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ───────────────────────────────────────────────────────────────────

type PinStyle = 1 | 2 | 3;
type DefinitionsLayout = "vertical" | "horizontal";
type SettingsLayout = "vertical" | "horizontal";
type DefinitionsCrudStyle = "drawer" | "modal";

type UiState = {
  pinStyle: PinStyle;
  definitionsLayout: DefinitionsLayout;
  settingsLayout: SettingsLayout;
  definitionsCrudStyle: DefinitionsCrudStyle;
};

type UiActions = {
  setPinStyle: (style: PinStyle) => void;
  setDefinitionsLayout: (layout: DefinitionsLayout) => void;
  setSettingsLayout: (layout: SettingsLayout) => void;
  setDefinitionsCrudStyle: (style: DefinitionsCrudStyle) => void;
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useUiStore = create<UiState & UiActions>()(
  persist(
    set => ({
      pinStyle: 3,
      definitionsLayout: "vertical",
      settingsLayout: "vertical",
      definitionsCrudStyle: "drawer",

      setPinStyle: pinStyle => set({ pinStyle }),
      setDefinitionsLayout: definitionsLayout => set({ definitionsLayout }),
      setSettingsLayout: settingsLayout => set({ settingsLayout }),
      setDefinitionsCrudStyle: definitionsCrudStyle =>
        set({ definitionsCrudStyle }),
    }),
    {
      name: "erp-ui-preferences",
    }
  )
);

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectPinStyle = (state: UiState & UiActions) => state.pinStyle;
export const selectDefinitionsLayout = (state: UiState & UiActions) =>
  state.definitionsLayout;
export const selectSettingsLayout = (state: UiState & UiActions) =>
  state.settingsLayout;
export const selectDefinitionsCrudStyle = (state: UiState & UiActions) =>
  state.definitionsCrudStyle;

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { detectBrowserLanguage } from "../utils/languages";

export type WeekStart = "monday" | "sunday";
export type SupportedLanguage = "es" | "en";

interface SettingsState {
  language: SupportedLanguage;
  autoDetectLanguage: boolean;
  weekStartsOn: WeekStart;
  setLanguage: (lang: SupportedLanguage) => void;
  setAutoDetectLanguage: (auto: boolean) => void;
  setWeekStartsOn: (day: WeekStart) => void;
  getResolvedLanguage: () => SupportedLanguage;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      language: detectBrowserLanguage(),
      autoDetectLanguage: true,
      weekStartsOn: "monday",

      setLanguage: (language) => {
        set({ language, autoDetectLanguage: false });
        if (typeof document !== "undefined") {
          document.documentElement.lang = language;
        }
      },
      setAutoDetectLanguage: (autoDetectLanguage) => {
        if (autoDetectLanguage) {
          const detected = detectBrowserLanguage();
          set({ autoDetectLanguage: true, language: detected });
          if (typeof document !== "undefined") {
            document.documentElement.lang = detected;
          }
        } else {
          set({ autoDetectLanguage: false });
        }
      },
      setWeekStartsOn: (weekStartsOn) => set({ weekStartsOn }),
      getResolvedLanguage: () => {
        const state = get();
        if (state.autoDetectLanguage) {
          return detectBrowserLanguage();
        }
        return state.language === "en" ? "en" : "es";
      },
    }),
    {
      name: "settings-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.autoDetectLanguage) {
            state.language = detectBrowserLanguage();
          }
          if (typeof document !== "undefined") {
            const activeLang = state.autoDetectLanguage
              ? detectBrowserLanguage()
              : state.language === "en"
                ? "en"
                : "es";
            document.documentElement.lang = activeLang;
          }
        }
      },
    },
  ),
);

// Listen to browser language change in real time
if (typeof window !== "undefined") {
  window.addEventListener("languagechange", () => {
    const state = useSettingsStore.getState();
    if (state.autoDetectLanguage) {
      const detected = detectBrowserLanguage();
      useSettingsStore.setState({ language: detected });
      if (typeof document !== "undefined") {
        document.documentElement.lang = detected;
      }
    }
  });

  // Ensure initial html lang is synced
  const initial = useSettingsStore.getState().getResolvedLanguage();
  if (typeof document !== "undefined") {
    document.documentElement.lang = initial;
  }
}

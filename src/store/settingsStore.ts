import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WeekStart = "monday" | "sunday";

interface SettingsState {
  language: string;
  autoDetectLanguage: boolean;
  weekStartsOn: WeekStart;
  setLanguage: (lang: string) => void;
  setAutoDetectLanguage: (auto: boolean) => void;
  setWeekStartsOn: (day: WeekStart) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: "es",
      autoDetectLanguage: true,
      weekStartsOn: "monday",

      setLanguage: (language) => set({ language }),
      setAutoDetectLanguage: (autoDetectLanguage) =>
        set({ autoDetectLanguage }),
      setWeekStartsOn: (weekStartsOn) => set({ weekStartsOn }),
    }),
    {
      name: "settings-storage", // llave en localStorage, mismo patrón que theme-storage
    },
  ),
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { flushSync } from "react-dom";

export type ThemeMode = "system" | "light" | "dark";

export const getEffectiveTheme = (mode: ThemeMode): "dark" | "light" => {
  if (typeof window === "undefined") return "dark";
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return mode;
};

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: "dark", // Valor por defecto

      setThemeMode: (mode: ThemeMode) => {
        const currentMode = get().themeMode;
        const prevEffective = getEffectiveTheme(currentMode);
        const nextEffective = getEffectiveTheme(mode);

        // Si no hay cambio real de tema visual y el modo es idéntico, salir
        if (prevEffective === nextEffective && currentMode === mode) {
          return;
        }

        // Si solo cambió de system a light/dark pero el tema visual es el mismo
        if (prevEffective === nextEffective) {
          set({ themeMode: mode });
          return;
        }

        const doc = typeof document !== "undefined" ? (document as any) : null;
        const isReducedMotion =
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // Si no soporta View Transitions o tiene movimiento reducido
        if (
          !doc ||
          typeof doc.startViewTransition !== "function" ||
          isReducedMotion
        ) {
          set({ themeMode: mode });
          if (doc) {
            if (nextEffective === "dark") {
              doc.documentElement.classList.add("dark");
            } else {
              doc.documentElement.classList.remove("dark");
            }
          }
          return;
        }

        // Desactivar transiciones CSS parciales durante la captura de pantalla
        doc.documentElement.classList.add("theme-transitioning");

        try {
          const transition = doc.startViewTransition(() => {
            try {
              flushSync(() => {
                set({ themeMode: mode });
              });
            } catch {
              set({ themeMode: mode });
            }

            if (nextEffective === "dark") {
              doc.documentElement.classList.add("dark");
            } else {
              doc.documentElement.classList.remove("dark");
            }
          });

          transition.finished?.finally(() => {
            doc.documentElement.classList.remove("theme-transitioning");
          });
        } catch {
          doc.documentElement.classList.remove("theme-transitioning");
          set({ themeMode: mode });
          if (nextEffective === "dark") {
            doc.documentElement.classList.add("dark");
          } else {
            doc.documentElement.classList.remove("dark");
          }
        }
      },

      toggleTheme: () => {
        const current = get().themeMode;
        const effective = getEffectiveTheme(current);
        const next = effective === "dark" ? "light" : "dark";
        get().setThemeMode(next);
      },
    }),
    {
      name: "theme-storage", // Nombre exacto de la llave en localStorage
    },
  ),
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { flushSync } from "react-dom";

export type ThemeMode = "system" | "light" | "dark";

export type ThemeClickOrigin =
  | React.MouseEvent
  | MouseEvent
  | { clientX: number; clientY: number }
  | { x: number; y: number };

export const getEffectiveTheme = (mode: ThemeMode): "dark" | "light" => {
  if (typeof window === "undefined") return "dark";
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return mode;
};

// Seguimiento global de la última posición del puntero/toque
let lastPointerPosition: { x: number; y: number } | null = null;

if (typeof window !== "undefined") {
  window.addEventListener(
    "pointerdown",
    (e: PointerEvent) => {
      lastPointerPosition = { x: e.clientX, y: e.clientY };
    },
    { passive: true, capture: true },
  );
}

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode, origin?: ThemeClickOrigin) => void;
  toggleTheme: (origin?: ThemeClickOrigin) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: "dark", // Valor por defecto

      setThemeMode: (mode: ThemeMode, origin?: ThemeClickOrigin) => {
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

        // Determinar coordenadas de origen del click
        let originX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
        let originY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;

        if (origin) {
          if ("clientX" in origin && typeof origin.clientX === "number") {
            originX = origin.clientX;
            originY = origin.clientY;
          } else if ("x" in origin && typeof origin.x === "number") {
            originX = origin.x;
            originY = origin.y;
          }
        } else if (lastPointerPosition) {
          originX = lastPointerPosition.x;
          originY = lastPointerPosition.y;
        }

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

        // Calcular el radio máximo necesario desde el punto del click hasta la esquina más lejana
        const endRadius =
          Math.hypot(
            Math.max(originX, window.innerWidth - originX),
            Math.max(originY, window.innerHeight - originY),
          ) + 16;

        // Establecer variables CSS para la animación en el DOM
        doc.documentElement.style.setProperty("--theme-x", `${originX}px`);
        doc.documentElement.style.setProperty("--theme-y", `${originY}px`);
        doc.documentElement.style.setProperty("--theme-r", `${endRadius}px`);

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

          // Animación a velocidad reducida (800ms) originada desde el punto del click
          transition.ready
            ?.then(() => {
              try {
                doc.documentElement.animate(
                  {
                    clipPath: [
                      `circle(0px at ${originX}px ${originY}px)`,
                      `circle(${endRadius}px at ${originX}px ${originY}px)`,
                    ],
                  },
                  {
                    duration: 800, // Velocidad reducida, animación suave y visible
                    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                    pseudoElement: "::view-transition-new(root)",
                  },
                );
              } catch {
                // Si el navegador usa las reglas CSS @keyframes directamente
              }
            })
            .catch(() => {});

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

      toggleTheme: (origin?: ThemeClickOrigin) => {
        const current = get().themeMode;
        const effective = getEffectiveTheme(current);
        const next = effective === "dark" ? "light" : "dark";
        get().setThemeMode(next, origin);
      },
    }),
    {
      name: "theme-storage", // Nombre exacto de la llave en localStorage
    },
  ),
);

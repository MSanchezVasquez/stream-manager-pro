import React, { useEffect } from "react";
import { useThemeStore } from "../store/themeStore";

export const ThemeController: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const themeMode = useThemeStore((state) => state.themeMode);

  useEffect(() => {
    const applyTheme = () => {
      let activeTheme = "dark";

      if (themeMode === "system") {
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        activeTheme = systemPrefersDark ? "dark" : "light";
      } else {
        activeTheme = themeMode;
      }

      // 1. Cambiar la clase de Tailwind
      const root = document.documentElement;
      if (activeTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme();

    // 2. Si está en 'system', escuchar cambios del sistema operativo
    if (themeMode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [themeMode]);

  // Retorna los hijos directamente, sin envolverlos en ningún Contexto pesado
  return <>{children}</>;
};

export interface LanguageOption {
  code: "es" | "en";
  shortCode: string;
  name: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "es", shortCode: "ES", name: "Español" },
  { code: "en", shortCode: "EN", name: "English" },
];

/**
 * Detects the browser/system language automatically.
 * Returns 'es' if browser is set to Spanish, otherwise 'en'.
 */
export function detectBrowserLanguage(): "es" | "en" {
  if (typeof window === "undefined" || !navigator) return "es";

  const candidates: string[] = [];
  if (navigator.languages && Array.isArray(navigator.languages)) {
    candidates.push(...navigator.languages);
  }
  if (navigator.language) {
    candidates.push(navigator.language);
  }
  if ((navigator as any).userLanguage) {
    candidates.push((navigator as any).userLanguage);
  }

  for (const raw of candidates) {
    const lang = (raw || "").toLowerCase().trim();
    if (lang.startsWith("es")) return "es";
    if (lang.startsWith("en")) return "en";
  }

  // If none matched, check primary language or default to en
  const primary = (navigator.language || "").toLowerCase().trim();
  if (primary.startsWith("es")) return "es";
  return "en";
}

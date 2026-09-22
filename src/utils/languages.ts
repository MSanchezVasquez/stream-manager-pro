export interface LanguageOption {
  code: string;
  shortCode: string;
  name: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "es", shortCode: "ES", name: "Español" },
  { code: "es-LATAM", shortCode: "MX", name: "Español (Latinoamérica)" },
  { code: "en-US", shortCode: "US", name: "English (US)" },
  { code: "en-UK", shortCode: "GB", name: "English (UK)" },
  { code: "ar", shortCode: "SA", name: "العَرَبِيةُ" },
  { code: "az", shortCode: "AZ", name: "Azərbaycan" },
  { code: "bn", shortCode: "BD", name: "বাংলা" },
  { code: "cs", shortCode: "CS", name: "Český" },
  { code: "da", shortCode: "DA", name: "Dansk" },
  { code: "de", shortCode: "DE", name: "Deutsch" },
  { code: "el", shortCode: "GR", name: "Ελληνικά" },
  { code: "fr", shortCode: "FR", name: "Français" },
  { code: "hi", shortCode: "HI", name: "Hindī" },
  { code: "hr", shortCode: "HR", name: "Hrvatski" },
  { code: "hu", shortCode: "HU", name: "Magyar" },
  { code: "it", shortCode: "IT", name: "Italiano" },
  { code: "ja", shortCode: "JP", name: "日本語" },
  { code: "ko", shortCode: "KR", name: "한국어" },
  { code: "nl", shortCode: "NL", name: "Nederlands" },
  { code: "pl", shortCode: "PL", name: "Polski" },
  { code: "pt", shortCode: "PT", name: "Português" },
  { code: "ru", shortCode: "RU", name: "Русский" },
  { code: "tr", shortCode: "TR", name: "Türkçe" },
  { code: "zh", shortCode: "ZH", name: "中文" },
];

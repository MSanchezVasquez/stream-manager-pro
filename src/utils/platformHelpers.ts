import { CSSProperties } from "react";
import { StreamingPlatform, Client } from "../types";
import { useSettingsStore } from "../store/settingsStore";

function resolveLang(lang?: "es" | "en"): "es" | "en" {
  if (lang) return lang;
  try {
    return useSettingsStore.getState().getResolvedLanguage() || "es";
  } catch {
    return "es";
  }
}

export const ALL_STREAMING_PLATFORMS: StreamingPlatform[] = [
  "Netflix Premium",
  "Netflix Perfil Privado",
  "Disney+ Premium",
  "Disney+ Estándar",
  "HBO Max Estándar",
  "HBO Max Platino",
  "Youtube Premium",
  "Prime Video",
  "Paramount Plus",
  "Spotify Premium",
  "Crunchyroll Fan",
  "DGO",
  "Apple TV",
  "Vix Premium",
  "Flujo TV",
  "Telelatino",
  "Movistar TV",
  "Otro",
];

export interface PlatformConfig {
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  iconName: string;
}

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  "Netflix Premium": {
    name: "Netflix Premium",
    color: "#E50914",
    bgColor: "bg-red-500/10 dark:bg-red-950/40",
    textColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-500/30",
    iconName: "Tv",
  },
  "Netflix Perfil Privado": {
    name: "Netflix Perfil Privado",
    color: "#E50914",
    bgColor: "bg-red-500/10 dark:bg-red-950/40",
    textColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-500/30",
    iconName: "Tv",
  },
  "Disney+ Premium": {
    name: "Disney+ Premium",
    color: "#00D2FF",
    bgColor: "bg-cyan-500/10 dark:bg-cyan-950/40",
    textColor: "text-cyan-600 dark:text-cyan-400",
    borderColor: "border-cyan-500/30",
    iconName: "Sparkles",
  },
  "Disney+ Estándar": {
    name: "Disney+ Estándar",
    color: "#0072D2",
    bgColor: "bg-sky-500/10 dark:bg-sky-950/40",
    textColor: "text-sky-600 dark:text-sky-400",
    borderColor: "border-sky-500/30",
    iconName: "Sparkles",
  },
  "HBO Max Estándar": {
    name: "HBO Max Estándar",
    color: "#9933CC",
    bgColor: "bg-gray-500/10 dark:bg-black/40",
    textColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-gray-500/30",
    iconName: "Film",
  },
  "HBO Max Platino": {
    name: "HBO Max Platino",
    color: "#B8B8C0",
    bgColor: "bg-slate-400/10 dark:bg-slate-300/10",
    textColor: "text-slate-600 dark:text-slate-300",
    borderColor: "border-slate-400/30",
    iconName: "Film",
  },
  "Youtube Premium": {
    name: "Youtube Premium",
    color: "#FF0000",
    bgColor: "bg-rose-500/10 dark:bg-rose-950/40",
    textColor: "text-rose-600 dark:text-rose-400",
    borderColor: "border-rose-500/30",
    iconName: "PlayCircle",
  },
  "Prime Video": {
    name: "Prime Video",
    color: "#00A8E1",
    bgColor: "bg-sky-500/10 dark:bg-sky-950/40",
    textColor: "text-sky-500 dark:text-sky-300",
    borderColor: "border-sky-500/30",
    iconName: "Video",
  },
  "Paramount Plus": {
    name: "Paramount Plus",
    color: "#0064FF",
    bgColor: "bg-blue-600/10 dark:bg-blue-900/40",
    textColor: "text-blue-500 dark:text-blue-300",
    borderColor: "border-blue-500/30",
    iconName: "Clapperboard",
  },
  "Spotify Premium": {
    name: "Spotify Premium",
    color: "#1DB954",
    bgColor: "bg-emerald-500/10 dark:bg-emerald-950/40",
    textColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-500/30",
    iconName: "Music",
  },
  "Crunchyroll Fan": {
    name: "Crunchyroll Fan",
    color: "#F47521",
    bgColor: "bg-amber-500/10 dark:bg-amber-950/40",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-500/30",
    iconName: "Flame",
  },
  DGO: {
    name: "DGO",
    color: "#00A1E4",
    bgColor: "bg-teal-500/10 dark:bg-teal-950/40",
    textColor: "text-teal-600 dark:text-teal-400",
    borderColor: "border-teal-500/30",
    iconName: "Radio",
  },
  "Apple TV": {
    name: "Apple TV",
    color: "#A2AAAD",
    bgColor: "bg-zinc-500/10 dark:bg-zinc-800/40",
    textColor: "text-zinc-700 dark:text-zinc-300",
    borderColor: "border-zinc-500/30",
    iconName: "Tv2",
  },
  "Vix Premium": {
    name: "Vix Premium",
    color: "#FF4500",
    bgColor: "bg-orange-500/10 dark:bg-orange-950/40",
    textColor: "text-orange-600 dark:text-orange-400",
    borderColor: "border-orange-500/30",
    iconName: "Tv",
  },
  "Flujo TV": {
    name: "Flujo TV",
    color: "#06B6D4",
    bgColor: "bg-cyan-500/10 dark:bg-cyan-950/40",
    textColor: "text-cyan-600 dark:text-cyan-400",
    borderColor: "border-cyan-500/30",
    iconName: "Tv",
  },
  Telelatino: {
    name: "Telelatino",
    color: "#F59E0B",
    bgColor: "bg-amber-500/10 dark:bg-amber-950/40",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-500/30",
    iconName: "Tv",
  },
  "Movistar TV": {
    name: "Movistar TV",
    color: "#00A9E0",
    bgColor: "bg-sky-500/10 dark:bg-sky-950/40",
    textColor: "text-sky-600 dark:text-sky-400",
    borderColor: "border-sky-500/30",
    iconName: "Tv",
  },
  Otro: {
    name: "Otro",
    color: "#6B7280",
    bgColor: "bg-slate-500/10 dark:bg-slate-800/40",
    textColor: "text-slate-600 dark:text-slate-400",
    borderColor: "border-slate-500/30",
    iconName: "Tv",
  },
};

export function getPlatformConfig(platformName: string): PlatformConfig {
  const norm = platformName.trim();
  if (PLATFORM_CONFIGS[norm]) return PLATFORM_CONFIGS[norm];

  // Partial match helper
  for (const key of Object.keys(PLATFORM_CONFIGS)) {
    if (
      norm.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(norm.toLowerCase())
    ) {
      return PLATFORM_CONFIGS[key];
    }
  }

  return {
    name: platformName,
    color: "#6366F1",
    bgColor: "bg-indigo-500/10 dark:bg-indigo-950/40",
    textColor: "text-indigo-600 dark:text-indigo-400",
    borderColor: "border-indigo-500/30",
    iconName: "Tv",
  };
}

/**
 * Normaliza y devuelve el nombre visual preferido de la plataforma.
 * P. ej. convierte "Amazon Prime Video" a "Prime Video".
 */
export function getPlatformDisplayName(platformName: string): string {
  if (!platformName) return "";
  const trimmed = platformName.trim();
  if (
    trimmed === "Amazon Prime Video" ||
    trimmed.toLowerCase() === "amazon prime video" ||
    trimmed.toLowerCase() === "amazon prime"
  ) {
    return "Prime Video";
  }
  const conf = getPlatformConfig(trimmed);
  return conf.name || trimmed;
}

/**
 * Returns class names and inline styles for a platform badge based on platform config.
 * Supports both Tailwind class strings and hex/rgb color codes in bgColor and borderColor.
 */
export function getPlatformBadgeProps(platConfig: PlatformConfig) {
  const isCustomBg = Boolean(
    platConfig.bgColor &&
    (platConfig.bgColor.startsWith("#") ||
      platConfig.bgColor.startsWith("rgb")),
  );
  const isCustomBorder = Boolean(
    platConfig.borderColor &&
    (platConfig.borderColor.startsWith("#") ||
      platConfig.borderColor.startsWith("rgb")),
  );

  const className = [
    "px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 text-slate-800 dark:text-[#E4E4E7] whitespace-nowrap shrink-0",
    !isCustomBg && platConfig.bgColor ? platConfig.bgColor : "",
    !isCustomBorder && platConfig.borderColor ? platConfig.borderColor : "",
  ]
    .filter(Boolean)
    .join(" ");

  const style: CSSProperties = {};

  if (isCustomBg) {
    style.backgroundColor = platConfig.bgColor;
  } else if (!platConfig.bgColor) {
    style.backgroundColor = `${platConfig.color}12`;
  }

  if (isCustomBorder) {
    style.borderColor = platConfig.borderColor;
  } else if (!platConfig.borderColor) {
    style.borderColor = `${platConfig.color}40`;
  }

  return { className, style };
}

/**
 * Parses date string in DD/MM/YYYY, DD/MM/YY or YYYY-MM-DD format
 */
export function parseDateString(dateStr: string): Date | null {
  if (!dateStr || dateStr === "–/–/–" || dateStr === "//") return null;
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      let day = parseInt(parts[0], 10);
      let month = parseInt(parts[1], 10) - 1;
      let year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
      const d = new Date(year, month, day);
      return isNaN(d.getTime()) ? null : d;
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats a Date object to DD/MM/YYYY string
 */
export function formatDateToString(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Adds a given number of days to a date string (DD/MM/YYYY) and returns the formatted new date
 */
export function addDaysToDateString(dateStr: string, days: number): string {
  const parsed = parseDateString(dateStr) || new Date();
  const res = new Date(parsed.getTime() + days * 24 * 60 * 60 * 1000);
  return formatDateToString(res);
}

export type PeriodUnit = "days" | "months" | "years";

/**
 * Adds a given quantity of days, months, or years to a date string (DD/MM/YYYY)
 */
export function addPeriodToDateString(
  dateStr: string,
  value: number,
  unit: PeriodUnit,
): string {
  const parsed = parseDateString(dateStr) || new Date();
  const res = new Date(parsed.getTime());

  if (unit === "days") {
    res.setDate(res.getDate() + value);
  } else if (unit === "months") {
    const originalDay = res.getDate();
    res.setMonth(res.getMonth() + value);
    if (res.getDate() < originalDay) {
      res.setDate(0);
    }
  } else if (unit === "years") {
    res.setFullYear(res.getFullYear() + value);
  }

  return formatDateToString(res);
}

/**
 * Returns a human-friendly string for subscription period
 */
export function formatSubscriptionPeriod(
  periodUnit?: "days" | "months" | "years",
  periodValue?: number,
  periodDays?: number,
  lang?: "es" | "en",
): string {
  const l = resolveLang(lang);
  const isEn = l === "en";

  if (periodUnit === "months" && periodValue) {
    if (isEn) {
      return periodValue === 1 ? "1 month" : `${periodValue} months`;
    }
    return periodValue === 1 ? "1 mes" : `${periodValue} meses`;
  }
  if (periodUnit === "years" && periodValue) {
    if (isEn) {
      return periodValue === 1 ? "1 year" : `${periodValue} years`;
    }
    return periodValue === 1 ? "1 año" : `${periodValue} años`;
  }
  if (periodUnit === "days" && periodValue) {
    if (isEn) {
      return periodValue === 1 ? "1 day" : `${periodValue} days`;
    }
    return periodValue === 1 ? "1 día" : `${periodValue} días`;
  }
  const days = periodDays || 30;
  if (isEn) {
    return days === 1 ? "1 day" : `${days} days`;
  }
  return days === 1 ? "1 día" : `${days} días`;
}

/**
 * Computes difference in days between two date strings (cutDate - hireDate)
 */
export function getDaysDifference(startDateStr: string, endDateStr: string): number {
  const start = parseDateString(startDateStr);
  const end = parseDateString(endDateStr);
  if (!start || !end) return 30;
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Calculates remaining days from a date string formatted like DD/MM/YY or YYYY-MM-DD
 */
export function getDaysRemaining(dateStr: string): number {
  if (!dateStr || dateStr === "–/–/–" || dateStr === "//") return 999;

  let targetDate: Date;

  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      let day = parseInt(parts[0], 10);
      let month = parseInt(parts[1], 10) - 1;
      let year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
      targetDate = new Date(year, month, day);
    } else {
      targetDate = new Date(dateStr);
    }
  } else {
    targetDate = new Date(dateStr);
  }

  if (isNaN(targetDate.getTime())) return 999;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatCutDateStatus(
  dateStr: string,
  lang?: "es" | "en",
): {
  label: string;
  days: number;
  colorClass: string;
  badge: string;
} {
  const l = resolveLang(lang);
  const isEn = l === "en";
  const days = getDaysRemaining(dateStr);

  if (days === 999) {
    return {
      label: isEn ? "No cut date" : "Sin fecha de corte",
      days,
      colorClass: "text-slate-500 dark:text-slate-400",
      badge:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    };
  }

  if (days < 0) {
    const absDays = Math.abs(days);
    const dayWord = isEn
      ? absDays === 1
        ? "day"
        : "days"
      : absDays === 1
        ? "día"
        : "días";
    return {
      label: isEn
        ? `Expired ${absDays} ${dayWord} ago`
        : `Vencido hace ${absDays} ${dayWord}`,
      days,
      colorClass: "text-red-600 dark:text-red-400 font-bold",
      badge:
        "bg-red-500/15 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-500/30",
    };
  }

  if (days === 0) {
    return {
      label: isEn ? "Expires Today!" : "¡Vence Hoy!",
      days,
      colorClass: "text-amber-600 dark:text-amber-400 font-bold animate-pulse",
      badge:
        "bg-amber-500/20 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-500/40",
    };
  }

  if (days <= 5) {
    let dayWord = "";
    if (isEn) {
      dayWord = days === 1 ? "Expires tomorrow" : `Expires in ${days} days`;
    } else {
      dayWord = days === 1 ? "Vence mañana" : `Vence en ${days} días`;
    }
    return {
      label: dayWord,
      days,
      colorClass: "text-amber-600 dark:text-amber-400 font-medium",
      badge:
        "bg-amber-500/10 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-500/30",
    };
  }

  return {
    label: isEn ? `${days} days remaining` : `${days} días restantes`,
    days,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    badge:
      "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/30",
  };
}

/**
 * Format a WhatsApp reminder message for client renewal
 */
export function generateWhatsAppMessage(
  clientName: string,
  serviceName: string,
  cutDate: string,
  email?: string,
  password?: string,
  profileName?: string,
  pin?: string,
  lang?: "es" | "en",
): string {
  const l = resolveLang(lang);
  const isEn = l === "en";
  const days = getDaysRemaining(cutDate);

  if (isEn) {
    let timeAlert = "";
    if (days < 0) {
      timeAlert = `your *${serviceName}* service *EXPIRED* on ${cutDate}.`;
    } else if (days === 0) {
      timeAlert = `your *${serviceName}* service expires *TODAY* (${cutDate}).`;
    } else {
      timeAlert = `your *${serviceName}* service expires in *${days} days* (Cut date: ${cutDate}).`;
    }

    let credentialsText = "";
    if (email) credentialsText += `\n📧 *Email:* ${email}`;
    if (password) credentialsText += `\n🔑 *Password:* ${password}`;
    if (profileName) credentialsText += `\n👤 *Profile:* ${profileName}`;
    if (pin) credentialsText += `\n🔒 *PIN:* ${pin}`;

    return `Hello *${clientName}* 👋\n\nThis is a friendly reminder that ${timeAlert}\n${credentialsText}\n\nTo renew or for any inquiries, simply reply to this message. Thank you for choosing our service! 🚀`;
  }

  let timeAlert = "";
  if (days < 0) {
    timeAlert = `su servicio *${serviceName}* ha *VENCIDO* el ${cutDate}.`;
  } else if (days === 0) {
    timeAlert = `su servicio *${serviceName}* vence *HOY* (${cutDate}).`;
  } else {
    timeAlert = `su servicio *${serviceName}* vence en *${days} días* (Fecha de corte: ${cutDate}).`;
  }

  let credentialsText = "";
  if (email) credentialsText += `\n📧 *Correo:* ${email}`;
  if (password) credentialsText += `\n🔑 *Contraseña:* ${password}`;
  if (profileName) credentialsText += `\n👤 *Perfil:* ${profileName}`;
  if (pin) credentialsText += `\n🔒 *PIN:* ${pin}`;

  return `Hola *${clientName}* 👋\n\nLe recordamos que ${timeAlert}\n${credentialsText}\n\nPara renovar o ante cualquier consulta, responda a este mensaje. ¡Gracias por preferir nuestro servicio! 🚀`;
}

export type ClientHealthLevel =
  | "healthy"
  | "expiring_today"
  | "near_expiration"
  | "expired"
  | "no_profiles"
  | "inactive";

export interface ClientAccountHealth {
  level: ClientHealthLevel;
  label: string;
  badgeClass: string;
  dotClass: string;
  borderClass: string;
  tooltip: string;
  minDaysRemaining: number;
  expiredCount: number;
  expiringCount: number;
  activeCount: number;
}

/**
 * Evaluates the overall health status of a client based on their linked profiles and cut-off dates
 */
export function getClientAccountHealth(
  client: Client,
  lang?: "es" | "en",
): ClientAccountHealth {
  const l = resolveLang(lang);
  const isEn = l === "en";

  if (client.status === "inactive") {
    return {
      level: "inactive",
      label: isEn ? "Inactive" : "Inactivo",
      badgeClass:
        "bg-slate-100 text-slate-600 dark:bg-[#1A1A20] dark:text-[#94949E] border border-slate-200 dark:border-[#2D2D33]",
      dotClass: "bg-slate-400 dark:bg-slate-500",
      borderClass: "border-slate-200 dark:border-[#1F1F23]",
      tooltip: isEn
        ? "Client marked as inactive or cancelled"
        : "Cliente marcado como inactivo o cancelado",
      minDaysRemaining: 999,
      expiredCount: 0,
      expiringCount: 0,
      activeCount: 0,
    };
  }

  const subs = client.subscriptions || [];

  if (subs.length === 0) {
    return {
      level: "no_profiles",
      label: isEn ? "No profiles" : "Sin perfiles",
      badgeClass:
        "bg-slate-100 text-slate-500 dark:bg-[#1A1A20] dark:text-[#94949E] border border-slate-200 dark:border-[#2D2D33]",
      dotClass: "bg-slate-400",
      borderClass: "border-slate-200 dark:border-[#1F1F23]",
      tooltip: isEn
        ? "No services or profiles linked"
        : "Sin servicios ni perfiles vinculados",
      minDaysRemaining: 999,
      expiredCount: 0,
      expiringCount: 0,
      activeCount: 0,
    };
  }

  let expiredCount = 0;
  let expiringTodayCount = 0;
  let nearExpirationCount = 0;
  let activeCount = 0;
  let minDaysRemaining = 999;
  let minExpiredDays = 0;

  for (const sub of subs) {
    if (sub.status === "inactive") continue;

    const days = getDaysRemaining(sub.cutDate);

    if (sub.status === "expired" || days < 0) {
      expiredCount++;
      if (days < minExpiredDays) {
        minExpiredDays = days;
      }
    } else if (days === 0) {
      expiringTodayCount++;
      if (0 < minDaysRemaining) {
        minDaysRemaining = 0;
      }
    } else if (days <= 5) {
      nearExpirationCount++;
      if (days < minDaysRemaining) {
        minDaysRemaining = days;
      }
    } else {
      activeCount++;
      if (days < minDaysRemaining) {
        minDaysRemaining = days;
      }
    }
  }

  // 1. Any expired profiles?
  if (expiredCount > 0) {
    const isSingle = subs.length === 1;
    let label = "";
    if (isEn) {
      label = isSingle
        ? minExpiredDays < 0 && minExpiredDays > -99
          ? `Expired ${Math.abs(minExpiredDays)}d ago`
          : "Expired"
        : expiredCount === 1
          ? "1 expired profile"
          : `${expiredCount} expired profiles`;
    } else {
      label = isSingle
        ? minExpiredDays < 0 && minExpiredDays > -99
          ? `Vencido hace ${Math.abs(minExpiredDays)}d`
          : "Vencido"
        : expiredCount === 1
          ? "1 perfil vencido"
          : `${expiredCount} perfiles vencidos`;
    }

    return {
      level: "expired",
      label,
      badgeClass:
        "bg-red-500/10 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-500/30 font-bold",
      dotClass: "bg-red-500 shadow-sm shadow-red-500/50",
      borderClass: "border-slate-200 dark:border-[#1F1F23]",
      tooltip: isEn
        ? `Attention: client has ${expiredCount} ${expiredCount === 1 ? "expired profile" : "expired profiles"}`
        : `Atención: cuenta con ${expiredCount} ${expiredCount === 1 ? "perfil vencido" : "perfiles vencidos"}`,
      minDaysRemaining: minExpiredDays,
      expiredCount,
      expiringCount: expiringTodayCount + nearExpirationCount,
      activeCount,
    };
  }

  // 2. Any profile expiring today?
  if (expiringTodayCount > 0) {
    return {
      level: "expiring_today",
      label: isEn ? "Expires Today!" : "¡Vence Hoy!",
      badgeClass:
        "bg-amber-500/20 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-500/40 font-bold animate-pulse",
      dotClass: "bg-amber-500 animate-ping",
      borderClass: "border-slate-200 dark:border-[#1F1F23]",
      tooltip: isEn
        ? "Priority: profile expires today"
        : "Prioritario: perfil vence el día de hoy",
      minDaysRemaining: 0,
      expiredCount: 0,
      expiringCount: expiringTodayCount + nearExpirationCount,
      activeCount,
    };
  }

  // 3. Any profile near expiration (1 - 5 days)?
  if (nearExpirationCount > 0) {
    let label = "";
    if (isEn) {
      label =
        minDaysRemaining === 1
          ? "Expires tomorrow"
          : `Expires in ${minDaysRemaining}d`;
    } else {
      label =
        minDaysRemaining === 1
          ? "Vence mañana"
          : `Vence en ${minDaysRemaining}d`;
    }

    return {
      level: "near_expiration",
      label,
      badgeClass:
        "bg-amber-500/10 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-500/30 font-semibold",
      dotClass: "bg-amber-500",
      borderClass: "border-slate-200 dark:border-[#1F1F23]",
      tooltip: isEn
        ? `Next cut date: ${minDaysRemaining} day(s) remaining`
        : `Próximo corte: ${minDaysRemaining} día(s) restante(s)`,
      minDaysRemaining,
      expiredCount: 0,
      expiringCount: nearExpirationCount,
      activeCount,
    };
  }

  // 4. All profiles active and healthy
  return {
    level: "healthy",
    label: isEn ? "Up to date" : "Al día",
    badgeClass:
      "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/30 font-semibold",
    dotClass: "bg-emerald-500",
    borderClass: "border-slate-200 dark:border-[#1F1F23]",
    tooltip: isEn
      ? `All profiles active and up to date (${activeCount} service(s))`
      : `Todos los perfiles activos y al día (${activeCount} servicio(s))`,
    minDaysRemaining,
    expiredCount: 0,
    expiringCount: 0,
    activeCount,
  };
}


import { CSSProperties } from 'react';
import { StreamingPlatform } from '../types';

export interface PlatformConfig {
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  iconName: string;
}

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  'Netflix': {
    name: 'Netflix',
    color: '#E50914',
    bgColor: 'bg-red-500/10 dark:bg-red-950/40',
    textColor: 'text-red-600 dark:text-red-400',
    borderColor: 'border-red-500/30',
    iconName: 'Tv'
  },
  'Disney+ Premium': {
    name: 'Disney+ Premium',
    color: '#00D2FF',
    bgColor: 'bg-cyan-500/10 dark:bg-cyan-950/40',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    borderColor: 'border-cyan-500/30',
    iconName: 'Sparkles'
  },
  'Disney+ Estándar': {
    name: 'Disney+ Estándar',
    color: '#0072D2',
    bgColor: 'bg-sky-500/10 dark:bg-sky-950/40',
    textColor: 'text-sky-600 dark:text-sky-400',
    borderColor: 'border-sky-500/30',
    iconName: 'Sparkles'
  },
  'HBO Max': {
    name: 'HBO Max',
    color: '#9933CC',
    bgColor: 'bg-gray-500/10 dark:bg-black/40',
    textColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-gray-500/30',
    iconName: 'Film'
  },
  'Youtube Premium': {
    name: 'Youtube Premium',
    color: '#FF0000',
    bgColor: 'bg-rose-500/10 dark:bg-rose-950/40',
    textColor: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-500/30',
    iconName: 'PlayCircle'
  },
  'Amazon Prime Video': {
    name: 'Amazon Prime Video',
    color: '#00A8E1',
    bgColor: 'bg-sky-500/10 dark:bg-sky-950/40',
    textColor: 'text-sky-500 dark:text-sky-300',
    borderColor: 'border-sky-500/30',
    iconName: 'Video'
  },
  'Paramount+': {
    name: 'Paramount+',
    color: '#0064FF',
    bgColor: 'bg-blue-600/10 dark:bg-blue-900/40',
    textColor: 'text-blue-500 dark:text-blue-300',
    borderColor: 'border-blue-500/30',
    iconName: 'Clapperboard'
  },
  'Spotify Premium': {
    name: 'Spotify Premium',
    color: '#1DB954',
    bgColor: 'bg-emerald-500/10 dark:bg-emerald-950/40',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-500/30',
    iconName: 'Music'
  },
  'Crunchyroll': {
    name: 'Crunchyroll',
    color: '#F47521',
    bgColor: 'bg-amber-500/10 dark:bg-amber-950/40',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-500/30',
    iconName: 'Flame'
  },
  'DGO': {
    name: 'DGO',
    color: '#00A1E4',
    bgColor: 'bg-teal-500/10 dark:bg-teal-950/40',
    textColor: 'text-teal-600 dark:text-teal-400',
    borderColor: 'border-teal-500/30',
    iconName: 'Radio'
  },
  'Apple TV': {
    name: 'Apple TV',
    color: '#A2AAAD',
    bgColor: 'bg-zinc-500/10 dark:bg-zinc-800/40',
    textColor: 'text-zinc-700 dark:text-zinc-300',
    borderColor: 'border-zinc-500/30',
    iconName: 'Tv2'
  },
  'Vix Premium': {
    name: 'Vix Premium',
    color: '#FF4500',
    bgColor: 'bg-orange-500/10 dark:bg-orange-950/40',
    textColor: 'text-orange-600 dark:text-orange-400',
    borderColor: 'border-orange-500/30',
    iconName: 'Tv'
  }
};

export function getPlatformConfig(platformName: string): PlatformConfig {
  const norm = platformName.trim();
  if (PLATFORM_CONFIGS[norm]) return PLATFORM_CONFIGS[norm];

  // Partial match helper
  for (const key of Object.keys(PLATFORM_CONFIGS)) {
    if (norm.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(norm.toLowerCase())) {
      return PLATFORM_CONFIGS[key];
    }
  }

  return {
    name: platformName,
    color: '#6366F1',
    bgColor: 'bg-indigo-500/10 dark:bg-indigo-950/40',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    borderColor: 'border-indigo-500/30',
    iconName: 'Tv'
  };
}

/**
 * Returns class names and inline styles for a platform badge based on platform config.
 * Supports both Tailwind class strings and hex/rgb color codes in bgColor and borderColor.
 */
export function getPlatformBadgeProps(platConfig: PlatformConfig) {
  const isCustomBg = Boolean(
    platConfig.bgColor && (platConfig.bgColor.startsWith('#') || platConfig.bgColor.startsWith('rgb'))
  );
  const isCustomBorder = Boolean(
    platConfig.borderColor && (platConfig.borderColor.startsWith('#') || platConfig.borderColor.startsWith('rgb'))
  );

  const className = [
    'px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 text-slate-800 dark:text-[#E4E4E7]',
    !isCustomBg && platConfig.bgColor ? platConfig.bgColor : '',
    !isCustomBorder && platConfig.borderColor ? platConfig.borderColor : ''
  ].filter(Boolean).join(' ');

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
 * Calculates remaining days from a date string formatted like DD/MM/YY or YYYY-MM-DD
 */
export function getDaysRemaining(dateStr: string): number {
  if (!dateStr || dateStr === '–/–/–' || dateStr === '//') return 999;

  let targetDate: Date;

  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
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

export function formatCutDateStatus(dateStr: string): { label: string; days: number; colorClass: string; badge: string } {
  const days = getDaysRemaining(dateStr);

  if (days === 999) {
    return {
      label: 'Sin fecha de corte',
      days,
      colorClass: 'text-slate-500 dark:text-slate-400',
      badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    };
  }

  if (days < 0) {
    return {
      label: `Vencido hace ${Math.abs(days)} día(s)`,
      days,
      colorClass: 'text-red-600 dark:text-red-400 font-bold',
      badge: 'bg-red-500/15 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-500/30'
    };
  }

  if (days === 0) {
    return {
      label: '¡Vence Hoy!',
      days,
      colorClass: 'text-amber-600 dark:text-amber-400 font-bold animate-pulse',
      badge: 'bg-amber-500/20 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-500/40'
    };
  }

  if (days <= 5) {
    return {
      label: `Vence en ${days} día(s)`,
      days,
      colorClass: 'text-amber-600 dark:text-amber-400 font-medium',
      badge: 'bg-amber-500/10 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-500/30'
    };
  }

  return {
    label: `${days} días restantes`,
    days,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/30'
  };
}

/**
 * Format a WhatsApp reminder message for client renewal
 */
export function generateWhatsAppMessage(clientName: string, serviceName: string, cutDate: string, email?: string, password?: string, profileName?: string, pin?: string): string {
  const days = getDaysRemaining(cutDate);
  let timeAlert = '';
  if (days < 0) {
    timeAlert = `su servicio *${serviceName}* ha *VENCIDO* el ${cutDate}.`;
  } else if (days === 0) {
    timeAlert = `su servicio *${serviceName}* vence *HOY* (${cutDate}).`;
  } else {
    timeAlert = `su servicio *${serviceName}* vence en *${days} días* (Fecha de corte: ${cutDate}).`;
  }

  let credentialsText = '';
  if (email) credentialsText += `\n📧 *Correo:* ${email}`;
  if (password) credentialsText += `\n🔑 *Contraseña:* ${password}`;
  if (profileName) credentialsText += `\n👤 *Perfil:* ${profileName}`;
  if (pin) credentialsText += `\n🔒 *PIN:* ${pin}`;

  return `Hola *${clientName}* 👋\n\nLe recordamos que ${timeAlert}\n${credentialsText}\n\nPara renovar o ante cualquier consulta, responda a este mensaje. ¡Gracias por preferir nuestro servicio! 🚀`;
}

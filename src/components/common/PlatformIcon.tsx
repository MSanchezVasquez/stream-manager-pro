import React from "react";
import { Tv } from "lucide-react";

interface PlatformIconProps {
  platform: string;
  className?: string;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({
  platform = "",
  className = "w-4 h-4",
}) => {
  const norm = platform.toLowerCase().trim();

  // 1. Netflix (Netflix Premium, Netflix Perfil Privado)
  if (norm.includes("netflix")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        {/* Left vertical bar */}
        <path d="M5 2h3.6v20H5z" fill="#B81D24" />
        {/* Right vertical bar */}
        <path d="M15.4 2H19v20h-3.6z" fill="#B81D24" />
        {/* Diagonal ribbon bar with drop shadow effect */}
        <path d="M5 2h3.8l6.6 20h-3.8L5 2z" fill="#E50914" />
      </svg>
    );
  }

  // 2. Disney+ (Disney+ Premium, Disney+ Estándar)
  if (norm.includes("disney")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        {/* Arching shooting star swoosh */}
        <path
          d="M2.5 17.5C4 10.2 10.5 4.5 19 3.5c1.8-.2 2.8.5 2.8 1.4 0 1.2-1.8 1.8-3.4 2.2C11.5 8.5 6.5 12.2 4.2 18.5c-.3.8-1 .8-1.7-.5v-.5z"
          fill="#00D2FF"
        />
        {/* Disney stylized D loop */}
        <path
          d="M7.5 7h3.8c3.2 0 5.2 2 5.2 5s-2 5-5.2 5H7.5V7zm2.4 7.6h1.4c1.8 0 2.8-1.1 2.8-2.6s-1-2.6-2.8-2.6H9.9v5.2z"
          fill="#00D2FF"
        />
        {/* Plus sign */}
        <path
          d="M19 10.5v3.5m-1.75-1.75h3.5"
          stroke="#00D2FF"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // 3. HBO Max (HBO Max Estándar, HBO Max Platino, Max)
  if (norm.includes("hbo") || norm.includes("max")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="5" fill="#9933CC" />
        {/* H */}
        <path d="M3.5 7.5h2v3.5h3V7.5h2v9h-2v-3.5h-3V16.5h-2v-9z" fill="#FFFFFF" />
        {/* B */}
        <path
          d="M11.5 7.5h3.2c1.3 0 2.3.6 2.3 1.8 0 .8-.5 1.3-1.2 1.6 1 .3 1.5.9 1.5 1.9 0 1.3-1 2.2-2.5 2.2h-3.3v-9zm2 3.2h1c.4 0 .7-.3.7-.7s-.3-.7-.7-.7h-1v1.4zm0 3.8h1.2c.5 0 .8-.3.8-.8s-.3-.8-.8-.8h-1.2v1.6z"
          fill="#FFFFFF"
        />
        {/* O with bullseye */}
        <circle cx="19" cy="12" r="3.5" fill="#FFFFFF" />
        <circle cx="19" cy="12" r="1.8" fill="#9933CC" />
        <circle cx="19" cy="12" r="0.7" fill="#FFFFFF" />
      </svg>
    );
  }

  // 4. YouTube Premium / YouTube
  if (norm.includes("youtube") || norm.includes("yt")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="2" y="4" width="20" height="16" rx="4.5" fill="#FF0000" />
        <path d="M10 8.5l6 3.5-6 3.5v-7z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 5. Prime Video (Amazon Prime Video)
  if (norm.includes("prime") || norm.includes("amazon")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="5" fill="#00A8E1" />
        {/* Play triangle */}
        <path d="M9.5 7.5l5.5 3.5-5.5 3.5v-7z" fill="#FFFFFF" />
        {/* Prime smile curved arrow */}
        <path
          d="M4.5 16.5c3.8 2.4 8.2 2.4 12.2.2.4-.2.7.2.5.5-4.2 2.6-9.2 2.6-13.2-.1-.4-.3 0-.8.5-.6z"
          fill="#FFFFFF"
        />
        <path
          d="M17.4 15.6c-.2.5-.7 1.3-1.1 1.7-.2.2 0 .5.3.4.9-.3 2-.7 2.5-1.4.4-.6.2-1.2-.3-1.5-.3-.2-.5-.1-.4.2.2.3-.3.7-1 1z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // 6. Paramount Plus (Mountain with arch of stars)
  if (norm.includes("paramount")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="5" fill="#0064FF" />
        {/* Paramount Mountain Peak */}
        <path
          d="M12 5.5l-6.5 13h13L12 5.5zm0 3.8l3.8 7.6H8.2L12 9.3z"
          fill="#FFFFFF"
        />
        <path d="M12 10.5l2.2 4.5h-4.4l2.2-4.5z" fill="#FFFFFF" />
        {/* Stars arching over peak */}
        <circle cx="12" cy="3.5" r="0.8" fill="#FFFFFF" />
        <circle cx="9.2" cy="4.2" r="0.7" fill="#FFFFFF" />
        <circle cx="14.8" cy="4.2" r="0.7" fill="#FFFFFF" />
        <circle cx="6.8" cy="5.8" r="0.7" fill="#FFFFFF" />
        <circle cx="17.2" cy="5.8" r="0.7" fill="#FFFFFF" />
        <circle cx="5" cy="8.2" r="0.7" fill="#FFFFFF" />
        <circle cx="19" cy="8.2" r="0.7" fill="#FFFFFF" />
        <circle cx="4" cy="11.2" r="0.7" fill="#FFFFFF" />
        <circle cx="20" cy="11.2" r="0.7" fill="#FFFFFF" />
        {/* Plus sign badge */}
        <path
          d="M19 16.5v4m-2-2h4"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // 7. Spotify Premium
  if (norm.includes("spotify")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="11" fill="#1DB954" />
        <path
          d="M6.8 9.5c3.2-1 7.2-.8 10.4.8.4.2.5.7.3 1-.2.4-.7.5-1 .3-2.8-1.4-6.4-1.6-9.2-.7-.4.1-.8-.1-.9-.5-.2-.4 0-.8.4-.9zm.5 3c2.8-.8 6.2-.6 8.9.8.3.2.4.6.2.9-.2.3-.6.4-.9.2-2.4-1.2-5.3-1.4-7.8-.7-.3.1-.7-.1-.8-.4-.1-.3.1-.7.4-.8zm.8 3c2.3-.6 5-.5 7.1.6.3.1.4.5.2.8-.1.3-.5.4-.8.2-1.9-.9-4.2-1-6.1-.5-.3.1-.6-.1-.7-.4-.1-.3.1-.6.4-.7z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // 8. Crunchyroll Fan / Crunchyroll
  if (norm.includes("crunchyroll") || norm.includes("crunchy")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="11" fill="#F47521" />
        {/* Crescent eye */}
        <path
          d="M12 4.5c4.1 0 7.5 3.4 7.5 7.5s-3.4 7.5-7.5 7.5c-1.5 0-3-.5-4.2-1.3 2.8-.6 4.9-3.1 4.9-6.2 0-3-2-5.6-4.9-6.2 1.2-.8 2.7-1.3 4.2-1.3z"
          fill="#FFFFFF"
        />
        {/* Inner pupil */}
        <circle cx="10" cy="12" r="2.8" fill="#F47521" />
      </svg>
    );
  }

  // 9. DGO / DirecTV GO
  if (norm.includes("dgo") || norm.includes("directv")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="5" fill="#00A1E4" />
        {/* D */}
        <path
          d="M5 7h3.8c2.4 0 4.2 1.8 4.2 5s-1.8 5-4.2 5H5V7zm2 8h1.8c1.3 0 2.2-.9 2.2-3s-.9-3-2.2-3H7v6z"
          fill="#FFFFFF"
        />
        {/* GO */}
        <path
          d="M17.5 7c-2.4 0-4 1.8-4 5s1.6 5 4 5c1.4 0 2.6-.6 3.2-1.6l-1.5-1c-.4.6-1 1-1.7 1-1.3 0-2.2-1.1-2.2-3.4s.9-3.4 2.2-3.4c.8 0 1.4.4 1.8 1.1l1.5-1C20.1 7.7 18.9 7 17.5 7z"
          fill="#F5821F"
        />
      </svg>
    );
  }

  // 10. Apple TV
  if (norm.includes("apple")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="5" fill="#1C1C1E" />
        {/* Apple Logo */}
        <path
          d="M8.2 14.8c-.4.7-.9 1.4-1.6 1.4-.7 0-.9-.4-1.7-.4s-1.1.4-1.7.4c-.7 0-1.3-.8-1.7-1.4-1-1.4-1.7-4-.7-5.7.5-.8 1.3-1.4 2.2-1.4.7 0 1.2.4 1.7.4.5 0 1.1-.4 1.8-.4.7 0 1.5.4 1.9 1-.1 0-1.1.7-1.1 2 0 1.6 1.4 2.2 1.4 2.2-.2.6-.5 1.1-.8 1.5z"
          fill="#FFFFFF"
        />
        <path
          d="M7 6.8c.3-.4.5-1 .4-1.6-.5 0-1.1.3-1.4.7-.3.4-.5 1-.4 1.6.6 0 1.1-.3 1.4-.7z"
          fill="#FFFFFF"
        />
        {/* "tv" text */}
        <path
          d="M12.5 9h3v1.2h-.9v5.3h-1.2v-5.3h-.9V9zm4 1.8l1.3 4.7h-1.2l-.7-2.8-.7 2.8H14l1.3-4.7h1.2z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // 11. Vix Premium / Vix
  if (norm.includes("vix")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="5" fill="#FF4500" />
        {/* V */}
        <path
          d="M4.5 7.5h2.2l2.2 6.5 2.2-6.5h2.2L9.8 16.5H8.2L4.5 7.5z"
          fill="#FFFFFF"
        />
        {/* i */}
        <circle cx="14.5" cy="8" r="1.1" fill="#FFFFFF" />
        <path d="M13.5 10.2h2v6.3h-2v-6.3z" fill="#FFFFFF" />
        {/* X */}
        <path
          d="M16.5 10.2h1.8l1.3 2.8 1.3-2.8h1.8l-2.1 3.2 2.3 3.1h-1.8l-1.5-2.8-1.5 2.8H16.5l2.3-3.1-2.3-3.2z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // 12. Flujo TV
  if (norm.includes("flujo")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
          <linearGradient id="flujo_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="5" fill="url(#flujo_grad)" />
        {/* Streaming flow waves + play button */}
        <path
          d="M5.5 8.5c1.8 0 3.2 1.5 3.2 3.5s-1.4 3.5-3.2 3.5"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M9 6.5c3 0 5.5 2.5 5.5 5.5s-2.5 5.5-5.5 5.5"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeOpacity="0.75"
        />
        <path d="M14 9l5 3-5 3V9z" fill="#FFFFFF" />
      </svg>
    );
  }

  // 13. Telelatino
  if (norm.includes("telelatino") || norm.includes("tele latino")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
          <linearGradient id="tl_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="5" fill="url(#tl_grad)" />
        {/* TV screen frame */}
        <rect
          x="3.5"
          y="5.5"
          width="17"
          height="13"
          rx="2.5"
          stroke="#FFFFFF"
          strokeWidth="1.6"
        />
        {/* "TL" mark */}
        <path
          d="M6.5 9h3v1.3h-.9v4.2h-1.2v-4.2h-.9V9zm4 0h1.2v4.2h2.2v1.3h-3.4V9z"
          fill="#FFFFFF"
        />
        <circle cx="16.5" cy="12" r="1.3" fill="#FFFFFF" />
      </svg>
    );
  }

  // 14. Movistar TV
  if (norm.includes("movistar")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="5" fill="#00A9E0" />
        {/* Movistar wavy M */}
        <path
          d="M4.5 16.5C4.5 13 6 8 8.8 8c1.6 0 2.5 1.5 3.2 3.2.7-1.7 1.6-3.2 3.2-3.2 2.8 0 4.3 5 4.3 8.5 0 .8-.5 1-1.2 1-.8 0-1.1-.4-1.2-1-.3-2.8-1.1-6.5-2.2-6.5-.9 0-1.5 2-2 4.2-.2 1-.8 1.3-1.4 1.3s-1.2-.3-1.4-1.3c-.5-2.2-1.1-4.2-2-4.2-1.1 0-1.9 3.7-2.2 6.5-.1.6-.4 1-1.2 1-.7 0-1.2-.2-1.2-1z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // 15. NBA League Pass / NBA
  if (norm.includes("nba")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="5" fill="#1D428A" />
        {/* Right red block */}
        <path d="M12 2h7a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5h-7V2z" fill="#C8102E" />
        {/* Jerry West basketball player silhouette */}
        <circle cx="11" cy="5.8" r="1.3" fill="#FFFFFF" />
        <path
          d="M10.2 7.8c-.8.8-1.3 2-1.8 3.5l1.6.8c.4-1.2.8-2.2 1.4-2.8l-1.2-1.5zm2.8 1.2l-1.8 3.2 2 3.8-1.6 5h1.8l1.4-4.2-1.8-3.5 1.4-2.8c.6.6 1 1.4 1.4 2.2l1.5-.9c-.6-1.3-1.3-2.3-2.2-3l-2.1-1z"
          fill="#FFFFFF"
        />
        <circle cx="6.8" cy="15.8" r="1.4" fill="#FFFFFF" />
      </svg>
    );
  }

  // Generic fallback: Lucide Tv
  return <Tv className={className} />;
};

import React from "react";

interface FlagProps {
  size?: number;
  className?: string;
}

export const SpainFlag: React.FC<FlagProps> = ({ size = 20, className = "" }) => {
  const id = React.useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-full shadow-xs ${className}`}
      aria-label="Bandera de España"
    >
      <defs>
        <clipPath id={`circle-spain-${id}`}>
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>
      <g clipPath={`url(#circle-spain-${id})`}>
        {/* Top Red Stripe */}
        <rect width="32" height="8" fill="#C60B1E" />
        {/* Middle Yellow Stripe */}
        <rect y="8" width="32" height="16" fill="#FFC400" />
        {/* Bottom Red Stripe */}
        <rect y="24" width="32" height="8" fill="#C60B1E" />

        {/* Coat of Arms (Escudo de España) on the yellow stripe, slightly left */}
        <g transform="translate(6.5, 9.5)">
          {/* Royal Crown */}
          <path
            d="M3 1.8 C3 0.6 4.5 0.3 5.5 0.3 C6.5 0.3 8 0.6 8 1.8 L9 3.5 H2 Z"
            fill="#C60B1E"
          />
          <circle cx="5.5" cy="0.4" r="0.6" fill="#FFC400" />
          <line x1="2.5" y1="3.5" x2="8.5" y2="3.5" stroke="#FFC400" strokeWidth="0.8" />

          {/* Pillars of Hercules */}
          <rect x="0.8" y="3.5" width="1.1" height="7.5" rx="0.5" fill="#E2E8F0" />
          <rect x="9.1" y="3.5" width="1.1" height="7.5" rx="0.5" fill="#E2E8F0" />
          <path d="M0.3 6.8 Q1.3 5.8 2.3 6.8" stroke="#C60B1E" strokeWidth="0.6" fill="none" />
          <path d="M8.7 6.8 Q9.7 5.8 10.7 6.8" stroke="#C60B1E" strokeWidth="0.6" fill="none" />

          {/* Shield */}
          <path
            d="M2.8 3.5 H8.2 V8.2 C8.2 10.2 5.5 11.5 5.5 11.5 C5.5 11.5 2.8 10.2 2.8 8.2 Z"
            fill="#C60B1E"
            stroke="#990000"
            strokeWidth="0.4"
          />
          {/* Quarters of Castile, León, Aragon, Navarre */}
          <rect x="3.1" y="3.8" width="2.3" height="2.3" fill="#C60B1E" />
          <rect x="5.6" y="3.8" width="2.3" height="2.3" fill="#FFFFFF" />
          <rect x="3.1" y="6.3" width="2.3" height="2.3" fill="#FFC400" />
          <rect x="5.6" y="6.3" width="2.3" height="2.3" fill="#C60B1E" />

          {/* Center Inescutcheon (House of Bourbon-Anjou) */}
          <ellipse cx="5.5" cy="6.2" rx="1" ry="1.2" fill="#003399" />
          <circle cx="5.5" cy="6.2" r="0.5" fill="#FFC400" />
        </g>
      </g>
      {/* Crisp border for dark & light mode */}
      <circle cx="16" cy="16" r="15.5" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
      <circle cx="16" cy="16" r="15.5" stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none" />
    </svg>
  );
};

const Star: React.FC<{ cx: number | string; cy: number | string; r: number | string }> = ({
  cx,
  cy,
  r,
}) => {
  const ncx = Number(cx);
  const ncy = Number(cy);
  const nr = Number(r);
  return (
    <polygon
      points={`
        ${ncx},${ncy - nr}
        ${ncx + nr * 0.38},${ncy - nr * 0.28}
        ${ncx + nr * 0.95},${ncy - nr * 0.28}
        ${ncx + nr * 0.49},${ncy + nr * 0.12}
        ${ncx + nr * 0.67},${ncy + nr * 0.72}
        ${ncx},${ncy + nr * 0.36}
        ${ncx - nr * 0.67},${ncy + nr * 0.72}
        ${ncx - nr * 0.49},${ncy + nr * 0.12}
        ${ncx - nr * 0.95},${ncy - nr * 0.28}
        ${ncx - nr * 0.38},${ncy - nr * 0.28}
      `}
      fill="#FFFFFF"
    />
  );
};

export const USFlag: React.FC<FlagProps> = ({ size = 20, className = "" }) => {
  const id = React.useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-full shadow-xs ${className}`}
      aria-label="Bandera de Estados Unidos"
    >
      <defs>
        <clipPath id={`circle-us-${id}`}>
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>
      <g clipPath={`url(#circle-us-${id})`}>
        {/* Background White base */}
        <rect width="32" height="32" fill="#FFFFFF" />

        {/* 13 Red & White stripes */}
        <rect y="0" width="32" height="2.46" fill="#B22234" />
        <rect y="4.92" width="32" height="2.46" fill="#B22234" />
        <rect y="9.84" width="32" height="2.46" fill="#B22234" />
        <rect y="14.76" width="32" height="2.46" fill="#B22234" />
        <rect y="19.68" width="32" height="2.46" fill="#B22234" />
        <rect y="24.60" width="32" height="2.46" fill="#B22234" />
        <rect y="29.52" width="32" height="2.48" fill="#B22234" />

        {/* Navy Blue Canton */}
        <rect x="0" y="0" width="16" height="17.22" fill="#002868" />

        {/* 5-Pointed White Stars in Blue Field */}
        <g>
          {/* Row 1 */}
          <Star cx="3" cy="2.8" r="0.95" />
          <Star cx="6.5" cy="2.8" r="0.95" />
          <Star cx="10" cy="2.8" r="0.95" />
          <Star cx="13.5" cy="2.8" r="0.95" />

          {/* Row 2 */}
          <Star cx="4.8" cy="5.8" r="0.95" />
          <Star cx="8.3" cy="5.8" r="0.95" />
          <Star cx="11.8" cy="5.8" r="0.95" />

          {/* Row 3 */}
          <Star cx="3" cy="8.8" r="0.95" />
          <Star cx="6.5" cy="8.8" r="0.95" />
          <Star cx="10" cy="8.8" r="0.95" />
          <Star cx="13.5" cy="8.8" r="0.95" />

          {/* Row 4 */}
          <Star cx="4.8" cy="11.8" r="0.95" />
          <Star cx="8.3" cy="11.8" r="0.95" />
          <Star cx="11.8" cy="11.8" r="0.95" />

          {/* Row 5 */}
          <Star cx="3" cy="14.8" r="0.95" />
          <Star cx="6.5" cy="14.8" r="0.95" />
          <Star cx="10" cy="14.8" r="0.95" />
          <Star cx="13.5" cy="14.8" r="0.95" />
        </g>
      </g>
      {/* Crisp border for dark & light mode */}
      <circle cx="16" cy="16" r="15.5" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
      <circle cx="16" cy="16" r="15.5" stroke="rgba(0,0,0,0.15)" strokeWidth="1" fill="none" />
    </svg>
  );
};

export const LanguageFlag: React.FC<{
  code: "es" | "en" | string;
  size?: number;
  className?: string;
}> = ({ code, size = 22, className = "" }) => {
  if (code === "es") {
    return <SpainFlag size={size} className={className} />;
  }
  return <USFlag size={size} className={className} />;
};

import React from "react";
import { AppLogo } from "./AppLogo";
import {
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Smartphone,
  CheckCircle2,
} from "lucide-react";

interface FooterProps {
  onNavigateTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#2242cc] text-white transition-colors duration-300 shadow-inner mt-auto">
      {/* Top Tier: Brand, Store Badges, Navigation Links & Social Media */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Brand & App Download Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onNavigateTab("dashboard")}
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <AppLogo className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-2">
                  StreamManager
                  <span className="text-[10px] uppercase tracking-wider bg-white text-[#2242cc] px-1.5 py-0.5 rounded font-black">
                    PRO
                  </span>
                </span>
                <p className="text-[11px] text-white/70 font-medium">
                  Control de Cuentas & Suscripciones
                </p>
              </div>
            </div>

            {/* Sofascore-style App Badges */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 hover:bg-black/40 transition-colors cursor-pointer select-none">
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a2.22 2.22 0 0 1-.61-1.566V3.38c0-.6.23-1.16.609-1.566zm11.234 11.233l2.42 2.42-12.78 7.379 10.36-9.799zm2.42-2.094l2.846 1.643a1.44 1.44 0 0 1 0 2.493l-2.846 1.644-2.226-2.226 2.226-2.226l.001-.001zm-4.646-2.094L4.483 1.154l12.78 7.38-2.42 2.42-.224-.094z" />
                </svg>
                <div className="text-left leading-tight">
                  <span className="text-[8px] uppercase tracking-wider text-white/70 block font-semibold">
                    DISPONIBLE EN
                  </span>
                  <span className="text-xs font-bold text-white block">
                    Google Play
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 hover:bg-black/40 transition-colors cursor-pointer select-none">
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.65-.8 1.09-1.92.97-3.04-1.02.04-2.23.68-2.94 1.5-.57.65-1.07 1.79-.93 2.89 1.14.09 2.26-.58 2.9-1.35z" />
                </svg>
                <div className="text-left leading-tight">
                  <span className="text-[8px] uppercase tracking-wider text-white/70 block font-semibold">
                    DESCARGAR EN
                  </span>
                  <span className="text-xs font-bold text-white block">
                    App Store
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Links (Right) */}
          <div className="flex items-center gap-2.5">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-transform hover:scale-105"
              title="Facebook"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-transform hover:scale-105"
              title="X / Twitter"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-transform hover:scale-105"
              title="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-transform hover:scale-105"
              title="TikTok"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.76 1.44-.04 2.71-.97 3.14-2.33.19-.58.26-1.19.25-1.8V.02h.02z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Middle Banner: Slogan / Responsabilidad */}
      <div className="border-t border-white/15 bg-black/10 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 text-xs text-white/90">
          <span className="w-5 h-5 rounded-full border border-white/80 flex items-center justify-center text-[10px] font-bold shrink-0">
            18+
          </span>
          <p className="font-medium tracking-wide">
            Gestión segura y responsable de suscripciones streaming.
          </p>
          <div className="ml-auto hidden md:flex items-center gap-2 text-[11px] text-white/75">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Base de datos en tiempo real cifrada y protegida</span>
          </div>
        </div>
      </div>

      {/* Bottom Tier: Copyright & Legal Links */}
      <div className="border-t border-white/15 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/80">
          <p className="font-normal">
            &copy; {currentYear} StreamManager Pro &ndash; Todos los derechos reservados.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-white/80 font-medium">
            <a href="#privacy" className="hover:text-white transition-colors">
              Política de privacidad
            </a>
            <a href="#cookies" className="hover:text-white transition-colors">
              Política de cookies
            </a>
            <a href="#accessibility" className="hover:text-white transition-colors">
              Política de accesibilidad
            </a>
            <a href="#terms" className="hover:text-white transition-colors">
              Términos y condiciones
            </a>
            <a href="#security" className="hover:text-white transition-colors">
              Seguridad
            </a>
            <a href="#editorial" className="hover:text-white transition-colors">
              Pie editorial
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../../utils/usePWAInstall';
import { useTranslation } from '../../utils/translations';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'popover' | 'sidebar' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'navbar',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { resolvedLanguage } = useTranslation();
  const isEn = resolvedLanguage === 'en';

  // Si ya está ejecutándose como aplicación instalada, no mostrar nada
  if (isInstalled) {
    return null;
  }

  // Si no es instalable y no es iOS, ocultar
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleAction = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const renderContent = () => {
    if (variant === 'popover') {
      return (
        <button
          type="button"
          onClick={handleAction}
          className={`w-full px-5 py-2.5 text-sm flex items-center justify-between text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-[#1F1F26] transition-colors cursor-pointer border-t border-slate-100 dark:border-[#25252D] ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-xs leading-tight">
                {isEn ? 'Install Application' : 'Instalar Aplicación'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {isEn ? 'Use as a desktop or mobile app' : 'Usar como app de escritorio o móvil'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            PWA
          </span>
        </button>
      );
    }

    if (variant === 'sidebar') {
      return (
        <button
          type="button"
          onClick={handleAction}
          className={`w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 active:scale-[0.99] text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-200 dark:border-white/10 transition-all cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="truncate">
            {isEn ? 'Install App' : 'Instalar App'}
          </span>
          <span className="ml-auto text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
            PRO
          </span>
        </button>
      );
    }

    // Default: navbar icon button or pill
    return (
      <button
        type="button"
        onClick={handleAction}
        title={isEn ? 'Install StreamManager PRO' : 'Instalar StreamManager PRO en este dispositivo'}
        aria-label={isEn ? 'Install App' : 'Instalar App'}
        className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg sm:rounded-xl bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 active:bg-white/25 text-white transition-all cursor-pointer border border-white/15 dark:border-white/10 text-xs font-semibold shrink-0 active:scale-95 ${className}`}
      >
        <Download className="w-3.5 h-3.5 text-white" />
        <span className="hidden md:inline">
          {isEn ? 'Install App' : 'Instalar App'}
        </span>
      </button>
    );
  };

  return (
    <>
      {renderContent()}

      {/* Guía modal de instalación para iOS Safari */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#16161C] border border-slate-200 dark:border-[#2D2D35] p-5 shadow-2xl relative animate-scale-in text-slate-900 dark:text-white">
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm">
                  {isEn ? 'Install on iPhone / iPad' : 'Instalar en iPhone o iPad'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Safari iOS
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-3.5 rounded-xl border border-slate-200/60 dark:border-white/10">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/15 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  1
                </div>
                <p className="leading-snug">
                  {isEn ? (
                    <>Toca el botón <strong>Compartir</strong> (<Share2 className="w-3.5 h-3.5 inline mx-0.5" />) en la barra inferior de Safari.</>
                  ) : (
                    <>Toca el botón <strong>Compartir</strong> (<Share2 className="w-3.5 h-3.5 inline mx-0.5" />) en la barra de Safari.</>
                  )}
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/15 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  2
                </div>
                <p className="leading-snug">
                  {isEn ? (
                    <>Desliza hacia abajo y selecciona <strong>Agregar a pantalla de inicio</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5" />).</>
                  ) : (
                    <>Desplaza y pulsa <strong>Agregar a pantalla de inicio</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5" />).</>
                  )}
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/15 flex items-center justify-center shrink-0 font-bold text-[10px]">
                  3
                </div>
                <p className="leading-snug">
                  {isEn ? (
                    <>Toca <strong>Agregar</strong> en la esquina superior derecha.</>
                  ) : (
                    <>Toca <strong>Agregar</strong> para instalar el icono en tu pantalla.</>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-black text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              {isEn ? 'Understood' : 'Entendido'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

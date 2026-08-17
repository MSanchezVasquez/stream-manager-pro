import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import gsap from "gsap";
import { CircularSpinner } from "../common/LoadingSpinners";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Animations when modal opens and Ultimate Scroll Lock
  useEffect(() => {
    // Capturamos el contenedor principal de React
    const rootEl = document.getElementById("root");

    if (isOpen) {
      // 1. Bloqueo infalible con !important en todos los niveles
      document.documentElement.style.setProperty(
        "overflow",
        "hidden",
        "important",
      );
      document.body.style.setProperty("overflow", "hidden", "important");
      if (rootEl) rootEl.style.setProperty("overflow", "hidden", "important");

      setIsLoggingOut(false);

      if (backdropRef.current) {
        gsap.fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.25 },
        );
      }
      if (modalRef.current) {
        gsap.fromTo(
          modalRef.current,
          { scale: 0.9, opacity: 0, y: 10 },
          { scale: 1, opacity: 1, y: 0, duration: 0.25, ease: "power2.out" },
        );
      }
    } else {
      // 2. Restaurar estilos al cerrar
      document.documentElement.style.removeProperty("overflow");
      document.body.style.removeProperty("overflow");
      if (rootEl) rootEl.style.removeProperty("overflow");
    }

    // 3. Limpieza de seguridad si el modal desaparece
    return () => {
      document.documentElement.style.removeProperty("overflow");
      document.body.style.removeProperty("overflow");
      if (rootEl) rootEl.style.removeProperty("overflow");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onConfirm();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Dark backdrop overlay with soft opacity */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/15 dark:bg-black/35 backdrop-brightness-[0.75] transition-all duration-300"
      />

      {/* Centered Modal dialog matching user screenshot */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-[360px] bg-white dark:bg-[#1E1E26] rounded-[28px] p-6 shadow-2xl border border-slate-100 dark:border-[#2D2D38] space-y-4"
      >
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Cerrar sesión
        </h3>

        <p className="text-sm text-slate-700 dark:text-[#D4D4DC] font-normal leading-relaxed">
          ¿Estás seguro de que quieres cerrar sesión?
        </p>

        <div className="flex items-center justify-end gap-2 pt-3">
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 active:scale-95 transition-all uppercase tracking-wider hover:cursor-pointer"
          >
            CERRAR
          </button>
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleConfirmLogout}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 active:scale-95 transition-all uppercase tracking-wider flex items-center gap-2 hover:cursor-pointer"
          >
            {isLoggingOut && (
              <CircularSpinner size={14} className="text-blue-500" />
            )}
            CERRAR SESIÓN
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

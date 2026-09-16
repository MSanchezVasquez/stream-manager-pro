import React from "react";
import { Lock, LockOpen } from "lucide-react";
import { useVaultStore } from "../../store/vaultStore";

interface VaultStatusBadgeProps {
  onClick?: () => void;
  className?: string;
}

/**
 * Pequeño indicador de estado del vault de cifrado, pensado para vivir en
 * el Navbar. Muestra:
 * - Candado cerrado (ámbar) si el vault está configurado pero bloqueado
 * - Candado abierto (verde) si está desbloqueado
 * - Nada si el usuario nunca configuró un vault (modo legado sin cifrar)
 *
 * onClick es opcional: úsalo para reabrir el VaultUnlockModal manualmente
 * (por ejemplo, si el usuario quiere desbloquear sin recargar la página).
 */
export const VaultStatusBadge: React.FC<VaultStatusBadgeProps> = ({
  onClick,
  className = "",
}) => {
  const { hasVaultConfigured, isUnlocked, isCheckingStatus } = useVaultStore();

  if (isCheckingStatus || !hasVaultConfigured) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      title={
        isUnlocked
          ? "Vault desbloqueado: las contraseñas se muestran en claro"
          : "Vault bloqueado: haz clic para ingresar tu passphrase"
      }
      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
        isUnlocked
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-amber-500/15 text-amber-300 animate-pulse"
      } ${onClick ? "cursor-pointer hover:opacity-80" : "cursor-default"} ${className}`}
    >
      {isUnlocked ? (
        <LockOpen className="w-3 h-3" />
      ) : (
        <Lock className="w-3 h-3" />
      )}
      <span className="hidden sm:inline">
        {isUnlocked ? "Vault Activo" : "Vault Bloqueado"}
      </span>
    </button>
  );
};

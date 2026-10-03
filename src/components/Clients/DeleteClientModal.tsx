import React from "react";
import { createPortal } from "react-dom";
import { Trash2, UserX, Sparkles } from "lucide-react";
import { Client } from "../../types";
import { isSubscriptionFromFreeProfile } from "../../store/dataStore";
import { CircularSpinner } from "../common/LoadingSpinners";
import { useTranslation } from "../../utils/translations";

interface DeleteClientModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
  isDeleting: boolean;
  freeProfiles: any[];
}

export const DeleteClientModal: React.FC<DeleteClientModalProps> = ({
  client,
  isOpen,
  onClose,
  onConfirmDelete,
  isDeleting,
  freeProfiles,
}) => {
  const { t } = useTranslation();
  if (!isOpen || !client) return null;

  const isDeactivating = client.status === "active";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/15 dark:bg-black/35 backdrop-brightness-[0.75] transition-all duration-300 animate-fade-in"
        onClick={() => !isDeleting && onClose()}
      />
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#25252D] shadow-2xl p-6 relative z-10 animate-scale-in">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${
            isDeactivating
              ? "bg-amber-500/10 text-amber-500"
              : "bg-red-500/10 text-red-500"
          }`}
        >
          {isDeactivating ? (
            <UserX className="w-6 h-6" />
          ) : (
            <Trash2 className="w-6 h-6" />
          )}
        </div>
        <h3 className="text-lg font-bold text-center text-slate-900 dark:text-[#E4E4E7] mb-2 font-space">
          {isDeactivating
            ? t("deleteModal.deactivateTitle")
            : t("deleteModal.deleteTitle")}
        </h3>
        <p className="text-sm text-center text-slate-500 dark:text-[#94949E] mb-4 leading-relaxed">
          {isDeactivating
            ? t("deleteModal.deactivateDesc", { name: client.name })
            : t("deleteModal.deleteDesc", { name: client.name })}
        </p>

        {!isDeactivating &&
          client.subscriptions.some((sub) =>
            isSubscriptionFromFreeProfile(sub, freeProfiles),
          ) && (
            <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5 text-left">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-700 dark:text-amber-300 mb-0.5">
                  {t("deleteModal.inventoryRestoreTitle")}
                </span>
                <span>
                  {t("deleteModal.inventoryRestoreDesc")}
                </span>
              </div>
            </div>
          )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D35] text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors cursor-pointer"
          >
            {t("deleteModal.cancel")}
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirmDelete}
            className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isDeactivating
                ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20"
                : "bg-red-600 hover:bg-red-500 shadow-red-600/20"
            }`}
          >
            {isDeleting && <CircularSpinner size={16} className="text-white" />}
            {isDeactivating
              ? t("deleteModal.moveToInactive")
              : t("deleteModal.delete")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

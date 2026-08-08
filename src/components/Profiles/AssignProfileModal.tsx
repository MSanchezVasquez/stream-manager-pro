import React, { useState } from 'react';
import { X, UserCheck, Sparkles } from 'lucide-react';
import { PlatformIcon } from '../common/PlatformIcon';
import { FreeProfile } from '../../types';
import { useData } from '../../context/DataContext';
import { CircularSpinner } from '../common/LoadingSpinners';

interface AssignProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FreeProfile;
}

export const AssignProfileModal: React.FC<AssignProfileModalProps> = ({
  isOpen,
  onClose,
  profile
}) => {
  const { clients, assignFreeProfileToClient } = useData();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeClients = clients.filter((c) => c.status === 'active');

  const handleAssign = async () => {
    if (!selectedClientId) {
      alert('Seleccione un cliente de la lista');
      return;
    }

    setIsAssigning(true);
    try {
      const success = await assignFreeProfileToClient(profile, selectedClientId);
      if (success) {
        onClose();
      } else {
        alert('Ocurrió un error al asignar el perfil.');
      }
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 dark:bg-black/35 backdrop-brightness-[0.75] transition-all duration-300 animate-fade-in">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-[#E4E4E7] hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-[#E4E4E7]">
              Asignar Perfil Libre
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94949E] flex items-center gap-1.5">
              <PlatformIcon platform={profile.serviceName} className="w-4 h-4" />
              <span>{profile.serviceName} - {profile.email}</span>
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E] mb-1.5">
              Seleccionar Cliente Activo:
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-[#E4E4E7] text-xs font-medium focus:ring-2 focus:ring-amber-500"
            >
              <option value="">-- Elija un cliente --</option>
              {activeClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.subscriptions.length} servicios)
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
            💡 Al asignar, se creará un servicio para este cliente y se reducirá el stock disponible ({profile.quantity} disponible(s)).
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#2D2D33] text-slate-600 dark:text-[#94949E] text-xs font-semibold hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={isAssigning}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/20 transition-all flex items-center gap-1.5 disabled:opacity-60"
          >
            {isAssigning ? (
              <CircularSpinner size={16} className="text-white" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
            <span>Confirmar Asignación</span>
          </button>
        </div>
      </div>
    </div>
  );
};

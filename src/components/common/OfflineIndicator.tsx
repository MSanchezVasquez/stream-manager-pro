import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { useTranslation } from '../../utils/translations';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { resolvedLanguage } = useTranslation();
  const isEn = resolvedLanguage === 'en';

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 dark:bg-amber-600/95 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white shadow-xl border border-amber-400/40 animate-slide-in-up">
      <WifiOff className="w-4 h-4 shrink-0 text-white animate-pulse" />
      <span>
        {isEn
          ? 'Offline Mode — Using local cache'
          : 'Modo sin conexión — Usando datos en caché'}
      </span>
    </div>
  );
};

import { useEffect } from 'react';

let lockCount = 0;

/**
 * Hook universal para bloquear completamente el scroll de fondo (desktop, tablet y móvil)
 * cuando cualquier modal está abierto, con contador de referencias para modales anidados.
 */
export function useBodyScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    const rootEl = document.getElementById('root');

    if (lockCount === 0) {
      document.documentElement.style.setProperty('overflow', 'hidden', 'important');
      document.body.style.setProperty('overflow', 'hidden', 'important');
      document.documentElement.style.setProperty('overscroll-behavior', 'none', 'important');
      document.body.style.setProperty('overscroll-behavior', 'none', 'important');
      document.documentElement.classList.add('modal-scroll-locked');
      document.body.classList.add('modal-scroll-locked');

      if (rootEl) {
        rootEl.style.setProperty('overflow', 'hidden', 'important');
        rootEl.style.setProperty('overscroll-behavior', 'none', 'important');
      }
    }
    lockCount++;

    return () => {
      lockCount--;
      if (lockCount <= 0) {
        lockCount = 0;
        document.documentElement.style.removeProperty('overflow');
        document.body.style.removeProperty('overflow');
        document.documentElement.style.removeProperty('overscroll-behavior');
        document.body.style.removeProperty('overscroll-behavior');
        document.documentElement.classList.remove('modal-scroll-locked');
        document.body.classList.remove('modal-scroll-locked');

        if (rootEl) {
          rootEl.style.removeProperty('overflow');
          rootEl.style.removeProperty('overscroll-behavior');
        }
      }
    };
  }, [isOpen]);
}

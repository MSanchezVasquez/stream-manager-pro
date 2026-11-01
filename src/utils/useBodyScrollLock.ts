import { useEffect } from 'react';

let lockCount = 0;

function isInsideScrollableContainer(target: HTMLElement | null): boolean {
  while (target && target !== document.body && target !== document.documentElement) {
    if (target.scrollHeight > target.clientHeight) {
      const overflowY = window.getComputedStyle(target).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') {
        return true;
      }
    }
    target = target.parentElement;
  }
  return false;
}

const preventWheel = (e: WheelEvent) => {
  if (!isInsideScrollableContainer(e.target as HTMLElement | null)) {
    e.preventDefault();
  }
};

const preventTouchMove = (e: TouchEvent) => {
  if (!isInsideScrollableContainer(e.target as HTMLElement | null)) {
    e.preventDefault();
  }
};

const preventKeyScroll = (e: KeyboardEvent) => {
  const scrollKeys = ['Space', 'PageUp', 'PageDown', 'Home', 'End'];
  if (scrollKeys.includes(e.code)) {
    const target = e.target as HTMLElement | null;
    const isInput =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable);
    if (!isInput && !isInsideScrollableContainer(target)) {
      e.preventDefault();
    }
  }
};

/**
 * Hook universal para bloquear el scroll de fondo cuando cualquier modal está abierto,
 * sin alterar el overflow de #root ni el documento, preservando intactos todos los elementos
 * con position: sticky (como la barra superior Navbar y el menú lateral Sidebar).
 */
export function useBodyScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    if (lockCount === 0) {
      document.body.classList.add('modal-scroll-locked');
      window.addEventListener('wheel', preventWheel, { passive: false });
      window.addEventListener('touchmove', preventTouchMove, { passive: false });
      window.addEventListener('keydown', preventKeyScroll, { passive: false });
    }
    lockCount++;

    return () => {
      lockCount--;
      if (lockCount <= 0) {
        lockCount = 0;
        document.body.classList.remove('modal-scroll-locked');
        window.removeEventListener('wheel', preventWheel);
        window.removeEventListener('touchmove', preventTouchMove);
        window.removeEventListener('keydown', preventKeyScroll);
      }
    };
  }, [isOpen]);
}

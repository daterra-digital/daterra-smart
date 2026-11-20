// src/features/perfis/components/useDropdownPortalPosition.ts
import { useEffect, useState, useCallback, type CSSProperties, type RefObject } from 'react';

export interface DropdownPortalPosition {
  openUp: boolean;
  portalStyle: CSSProperties | null;
}

export function useDropdownPortalPosition(
  triggerRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  enabled = true,
  estimatedHeight = 280
): DropdownPortalPosition {
  const [openUp, setOpenUp] = useState(false);
  const [portalStyle, setPortalStyle] = useState<CSSProperties | null>(null);

  const updatePosition = useCallback(() => {
    if (!isOpen || !triggerRef.current || typeof window === 'undefined') return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const spaceBelow = vh - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const flipUp = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
    const width = Math.min(Math.max(rect.width, 200), vw - 16);
    const left = Math.max(8, Math.min(rect.left, vw - width - 8));

    setOpenUp(flipUp);
    if (!enabled) {
      setPortalStyle(null);
      return;
    }

    setPortalStyle(
      flipUp
        ? { position: 'fixed', left, bottom: vh - rect.top + 6, width, zIndex: 50 }
        : { position: 'fixed', left, top: rect.bottom + 6, width, zIndex: 50 }
    );
  }, [isOpen, triggerRef, enabled, estimatedHeight]);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      setPortalStyle(null);
      return;
    }
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  return { openUp, portalStyle };
}

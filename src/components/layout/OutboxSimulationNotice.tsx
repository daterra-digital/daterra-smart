import React, { useEffect, useId, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronDown, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import {
  getOutboxSyncStatus,
  getPendingMutationsCount,
  type OutboxSyncStatus
} from '../../services/outbox/outboxService';
import {
  getOutboxSyncCopy,
  shouldShowOutboxBanner,
  shouldShowOutboxSyncIndicator
} from './outboxSyncNoticeLogic';

export interface OutboxSimulationNoticeProps {
  variant?: 'banner' | 'desktop' | 'mobile';
  pendingCountOverride?: number;
  statusOverride?: OutboxSyncStatus;
}

export const OutboxSimulationNotice: React.FC<OutboxSimulationNoticeProps> = ({
  variant = 'banner',
  pendingCountOverride,
  statusOverride
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const status = statusOverride ?? getOutboxSyncStatus();
  const effectiveUserId = user?.id || user?.uid;

  const livePendingCount = useLiveQuery(
    async () => {
      if (pendingCountOverride !== undefined) return pendingCountOverride;
      return getPendingMutationsCount(effectiveUserId);
    },
    [effectiveUserId, pendingCountOverride],
    0
  );

  const pendingCount = pendingCountOverride ?? livePendingCount ?? 0;

  useEffect(() => {
    if (variant !== 'desktop' || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [variant, isOpen]);

  const copy = getOutboxSyncCopy(pendingCount, status);
  const detailText = t(copy.detailKey, copy.detailFallback);

  if (variant === 'banner') {
    if (!shouldShowOutboxBanner(pendingCount, status)) {
      return null;
    }
    return (
      <p
        role="status"
        className="text-xs bg-amber-50 border border-amber-300 text-amber-950 rounded-xl px-3 py-2 font-medium leading-relaxed"
      >
        {detailText}
      </p>
    );
  }

  if (!shouldShowOutboxSyncIndicator(pendingCount, status)) {
    return null;
  }

  const shortText = pendingCount > 0
    ? `${t(copy.shortKey, copy.shortFallback.replace(` (${pendingCount})`, ''))} (${pendingCount})`
    : t(copy.shortKey, copy.shortFallback);

  if (variant === 'mobile') {
    return (
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-300 text-xs font-extrabold flex items-center justify-between gap-2 touch-target cursor-pointer transition-colors"
        >
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{shortText}</span>
          </span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        {isOpen && (
          <div
            id={panelId}
            role="status"
            className="mt-1.5 rounded-xl bg-white text-slate-900 border border-amber-300 px-3.5 py-2.5 text-xs font-medium leading-relaxed shadow-md"
          >
            {detailText}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="min-h-[48px] px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-300 text-[11px] font-extrabold flex items-center gap-1.5 touch-target cursor-pointer transition-colors"
      >
        <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{shortText}</span>
      </button>
      {isOpen && (
        <div
          id={panelId}
          role="status"
          className="absolute right-0 mt-2 w-72 rounded-xl bg-white text-slate-900 border border-amber-300 shadow-xl p-3 text-xs font-medium leading-relaxed z-50"
        >
          {detailText}
        </div>
      )}
    </div>
  );
};

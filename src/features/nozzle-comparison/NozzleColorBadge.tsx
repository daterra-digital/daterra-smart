import React from 'react';
import type { Nozzle } from './nozzleComparison.types';
import { getNozzleColorPresentation, formatPt } from './nozzleComparison.calculations';

export interface NozzleColorBadgeProps {
  nozzle?: Nozzle | null;
  colorName?: string | null;
  isoCode?: string | null;
  isIsoNozzle?: boolean;
  flowReference?: number;
  referencePressure?: number;
  size?: 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';
  showFlow?: boolean;
  showIso?: boolean;
  compact?: boolean;
  sideLabel?: string;
  className?: string;
}

export const NozzleColorBadge: React.FC<NozzleColorBadgeProps> = ({
  nozzle,
  colorName,
  isoCode,
  isIsoNozzle,
  flowReference,
  referencePressure,
  size = 'medium',
  showFlow,
  showIso = true,
  compact = false,
  sideLabel,
  className = ''
}) => {
  const pres = React.useMemo(() => {
    if (nozzle) {
      return getNozzleColorPresentation(nozzle);
    }
    return getNozzleColorPresentation(
      colorName,
      isIsoNozzle ?? Boolean(isoCode),
      isoCode,
      flowReference,
      referencePressure
    );
  }, [nozzle, colorName, isIsoNozzle, isoCode, flowReference, referencePressure]);

  const resolvedSize = size === 'small' || size === 'sm' ? 'sm' : size === 'large' || size === 'lg' ? 'lg' : 'md';

  const ariaDescription = sideLabel
    ? `Cor do ${sideLabel}: ${pres.badgeAriaLabel}`
    : pres.badgeAriaLabel;

  // Tamanho GRANDE (para NozzleComparisonCard e Resumo do Seletor)
  if (resolvedSize === 'lg') {
    return (
      <div
        aria-label={ariaDescription}
        className={`flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl ${className}`}
      >
        <div
          className={`w-7 h-7 rounded-full shrink-0 shadow-sm border-2 ${pres.borderClass}`}
          style={{ backgroundColor: pres.hex }}
          aria-hidden="true"
        />
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-sm font-black text-slate-900">
              {pres.colorName}
            </span>
            {showIso && (
              <span className="text-xs font-bold text-slate-500 font-mono-numbers">
                {pres.isIso
                  ? `(Código ISO: ${pres.isoCodeText})`
                  : '(Código ISO: Não aplicável)'}
              </span>
            )}
          </div>
          {showFlow !== false && pres.nominalFlow !== undefined && (
            <div className="text-xs font-bold text-slate-600 font-mono-numbers">
              Débito nominal: <strong className="text-slate-900">{formatPt(pres.nominalFlow, 2)} L/min</strong>
              {pres.referencePressure && (
                <span className="font-normal text-slate-500"> a {formatPt(pres.referencePressure, 1)} bar</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Tamanho PEQUENO (para alternativas e badges compactos)
  if (resolvedSize === 'sm') {
    return (
      <div
        aria-label={ariaDescription}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl ${className}`}
      >
        <div
          className={`w-4 h-4 rounded-full shrink-0 border ${pres.borderClass} shadow-xs`}
          style={{ backgroundColor: pres.hex }}
          aria-hidden="true"
        />
        <span className="text-xs font-black text-slate-900">
          {pres.colorName}
        </span>
        {showIso && pres.isIso && (
          <span className="text-[10px] font-bold text-slate-500 font-mono-numbers">
            ISO {pres.isoCodeText}
          </span>
        )}
        {showFlow && pres.nominalFlow !== undefined && !compact && (
          <span className="text-[11px] font-bold text-slate-600 font-mono-numbers">
            · {formatPt(pres.nominalFlow, 2)} L/min
          </span>
        )}
      </div>
    );
  }

  // Tamanho MÉDIO (padrão)
  return (
    <div
      aria-label={ariaDescription}
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl ${className}`}
    >
      <div
        className={`w-5 h-5 rounded-full shrink-0 border-2 ${pres.borderClass} shadow-xs`}
        style={{ backgroundColor: pres.hex }}
        aria-hidden="true"
      />
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
        <span className="text-xs font-black text-slate-900">
          {pres.colorName}
        </span>
        {showIso && (
          <span className="text-[11px] font-bold text-slate-500 font-mono-numbers">
            {pres.isIso
              ? `(ISO ${pres.isoCodeText})`
              : '(ISO: Não aplicável)'}
          </span>
        )}
        {showFlow && pres.nominalFlow !== undefined && (
          <span className="text-xs font-bold text-slate-700 font-mono-numbers">
            · {formatPt(pres.nominalFlow, 2)} L/min
          </span>
        )}
      </div>
    </div>
  );
};

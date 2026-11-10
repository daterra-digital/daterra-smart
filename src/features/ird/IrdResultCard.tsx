import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { IrdDropletSource, IrdResult, IrdRiskClass } from './irdTypes.ts';
import { IRD_CLASS_BANDS, IRD_LEGAL_DISCLAIMER } from './irdConfig.ts';

interface IrdResultCardProps {
  readonly result: IrdResult | null;
  readonly isLoading: boolean;
}

const CLASS_BADGE_CSS: Record<IrdRiskClass, string> = {
  BAIXO: 'bg-emerald-300 text-slate-950',
  MODERADO: 'bg-amber-300 text-slate-950',
  ELEVADO: 'bg-orange-400 text-slate-950',
  CRITICO_BLOQUEADO: 'bg-rose-500 text-white'
};

const SUB_ITEMS: ReadonlyArray<{ key: 'meteo' | 'espectro' | 'operacao' | 'exposicao'; label: string }> = [
  { key: 'meteo', label: 'Meteorologia' },
  { key: 'espectro', label: 'Espectro' },
  { key: 'operacao', label: 'Operação' },
  { key: 'exposicao', label: 'Exposição' }
];

function formatDropletOriginLabel(source: IrdDropletSource): string {
  if (
    source === 'calibration_profile' ||
    source === 'manufacturer_spec' ||
    source === 'lab_certificate' ||
    source === 'user_declared'
  ) {
    return 'Medição do utilizador';
  }
  if (source === 'conservative_fallback') return 'Fallback conservador';
  return 'Catálogo';
}

function getBarColor(score: number): string {
  if (score <= 25) return 'bg-emerald-300';
  if (score <= 50) return 'bg-amber-300';
  if (score <= 75) return 'bg-orange-400';
  return 'bg-rose-400';
}

export const IrdResultCard: React.FC<IrdResultCardProps> = ({ result, isLoading }) => {
  const isCalculated = result?.status === 'CALCULATED';
  const score = isCalculated ? result.irdScore : null;
  const riskClass = result?.irdClass ?? 'CRITICO_BLOQUEADO';
  const badgeLabel = isCalculated ? IRD_CLASS_BANDS[riskClass].labelPt : 'DADOS INCOMPLETOS';
  const markerLeft = score !== null ? `${Math.min(98, Math.max(2, score))}%` : '0%';

  return (
    <section
      role="status"
      aria-live="polite"
      aria-label="Resultado do Índice de Risco de Deriva"
      className="bg-[#114037] text-white rounded-3xl p-5 sm:p-6 shadow-floating space-y-4"
    >
      {isLoading ? (
        <div className="space-y-3 animate-pulse" aria-busy="true">
          <div className="h-4 w-48 bg-white/25 rounded" />
          <div className="h-16 w-36 bg-white/25 rounded-2xl" />
          <div className="h-3.5 w-full bg-white/20 rounded-full" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-emerald-100 font-bold">
                Índice Composto (Escala 1–100)
              </span>
              <div className="flex items-center gap-3.5">
                <span className="font-mono-numbers text-6xl sm:text-7xl font-extrabold leading-none tracking-tight text-white">
                  {score !== null ? score : '--'}
                </span>
                <div className="space-y-1">
                  <span
                    className={`inline-block px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wide ${
                      isCalculated ? CLASS_BADGE_CSS[riskClass] : 'bg-slate-200 text-slate-900'
                    }`}
                  >
                    {badgeLabel}
                  </span>
                  <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    {result?.legalVerdict === 'PERMITIDO_CONFORME_ROTULO' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-amber-300 shrink-0" />
                    )}
                    <span>
                      {isCalculated ? result.legalVerdict.replace(/_/g, ' · ') : 'BLOQUEADO · FAIL-CLOSED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {isCalculated && (
              <div className="bg-white/10 border border-white/20 rounded-2xl px-3.5 py-2.5 text-xs space-y-1">
                <div className="text-emerald-100 font-semibold">Origem do diâmetro usado:</div>
                <div className="font-extrabold text-white text-sm">
                  {formatDropletOriginLabel(result.derived.dropletSource)} · Confiança {result.derived.dropletConfidence}
                </div>
              </div>
            )}
          </div>

          {/* Régua semafórica 0-100 */}
          <div className="space-y-1.5">
            <div className="relative h-4 rounded-full overflow-hidden flex bg-white/20" aria-label="Régua semafórica de 0 a 100">
              <div className="w-1/4 bg-emerald-400" />
              <div className="w-1/4 bg-amber-300" />
              <div className="w-1/4 bg-orange-400" />
              <div className="w-1/4 bg-rose-500" />
              {score !== null && (
                <div
                  className="absolute top-0 bottom-0 w-2 bg-white ring-2 ring-slate-950 rounded"
                  style={{ left: `calc(${markerLeft} - 4px)` }}
                />
              )}
            </div>
            <div className="flex justify-between text-xs font-mono-numbers font-bold text-emerald-50">
              <span>1 BAIXO</span>
              <span>26 MODERADO</span>
              <span>51 ELEVADO</span>
              <span>76–100 CRÍTICO</span>
            </div>
          </div>

          {isCalculated && (
            <div className="pt-2 border-t border-white/15 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                Decomposição secundária por fator
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SUB_ITEMS.map((item) => {
                  const val = result.subIndices[item.key];
                  return (
                    <div key={item.key} className="bg-white/10 rounded-xl px-3 py-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-emerald-100 font-semibold">{item.label}</span>
                        <span className="font-mono-numbers font-bold text-white">{val.toFixed(1)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                        <div className={`h-full ${getBarColor(val)}`} style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {result && result.blocks.length > 0 && (
            <div role="alert" className="bg-rose-950/70 border border-rose-300/60 rounded-2xl p-3 text-xs sm:text-sm space-y-1 text-white">
              <div className="font-extrabold flex items-center gap-1.5 text-rose-200">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Bloqueio Ativo (Fail-Closed):</span>
              </div>
              {result.blocks.map((b) => (
                <p key={b.code}>• {b.messagePt}</p>
              ))}
            </div>
          )}

          {isCalculated && result.warnings.some((w) => w.severity === 'warning') && (
            <div className="bg-black/25 border border-white/15 rounded-2xl px-3.5 py-2.5 text-xs space-y-1 text-emerald-50">
              {result.warnings
                .filter((w) => w.severity === 'warning')
                .map((w) => (
                  <p key={w.code}>• {w.messagePt}</p>
                ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-100 border-t border-white/15 pt-2.5">
            <span>
              Indicador heurístico ({IRD_LEGAL_DISCLAIMER.isIso22866Certified ? '' : 'não é certificação legal nem ISO 22866'}).
            </span>
            <strong>O rótulo DGAV/SIFITO prevalece sempre.</strong>
          </div>
        </>
      )}
    </section>
  );
};

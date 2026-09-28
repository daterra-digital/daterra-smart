import React from 'react';
import { Gauge, RefreshCw, Pencil } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext.tsx';

export interface CalibracaoPhaseBSectionProps {
  travelSpeedKmH?: number | string;
  workingWidthM?: number | string;
  activeNozzleCount?: number | string;
  workingWidthSource?: 'auto-row-spacing' | 'manual';
  rowSpacingM?: number | string;
  phaseAVolume?: number;
  totalFlowRequiredLMin?: number;
  flowPerNozzleLMin?: number;
  theoreticalTimePerHaMinutes?: number;
  phaseBState?: 'complete' | 'missing_phase_a' | 'missing_speed' | 'missing_width' | 'no_nozzle_count';
  onSpeedChange: (speed: number | string) => void;
  onWidthChange: (width: number | string, source?: 'auto-row-spacing' | 'manual') => void;
  onOpenKeypad?: (fieldId: string) => void;
  isDesktop?: boolean;
}

export const CalibracaoPhaseBSection: React.FC<CalibracaoPhaseBSectionProps> = ({
  travelSpeedKmH,
  workingWidthM,
  workingWidthSource = 'auto-row-spacing',
  rowSpacingM,
  onSpeedChange,
  onWidthChange,
  onOpenKeypad,
  isDesktop = false
}) => {
  const { t } = useLanguage();

  const speedPresets = [4.0, 5.0, 6.0, 7.0, 8.0];
  const widthPresets = [2.0, 2.5, 3.0, 3.5];

  const speedNum =
    travelSpeedKmH !== undefined && travelSpeedKmH !== '' ? Number(travelSpeedKmH) : undefined;
  const widthNum =
    workingWidthM !== undefined && workingWidthM !== '' ? Number(workingWidthM) : undefined;
  const rowSpacingNum =
    rowSpacingM !== undefined && rowSpacingM !== '' ? Number(rowSpacingM) : undefined;

  const isManualWidth = workingWidthSource === 'manual';
  const canResetWidth =
    isManualWidth &&
    rowSpacingNum !== undefined &&
    widthNum !== undefined &&
    Math.abs(widthNum - rowSpacingNum) > 0.001;

  const formatNumber = (val: number, decimals: number) => {
    return new Intl.NumberFormat('pt-PT', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(val);
  };

  return (
    <div className="space-y-3 my-1">
      {/* Secção de Entradas da Fase B — Ajuste Operacional */}
      <div className="bg-white rounded-2xl md:rounded-3xl p-3 sm:p-3.5 border border-slate-200/80 shadow-soft space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#114037]/10 flex items-center justify-center text-[#114037]">
              <Gauge className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-800 tracking-tight">
                {t('calibracaoPulverizador.phaseB.title', 'Fase B — Ajuste operacional')}
              </h3>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#114037]/10 text-[#114037]">
            {t('calibracaoPulverizador.phaseB.badge', 'Operacional')}
          </span>
        </div>

        <p className="text-[11.5px] text-slate-600 leading-tight">
          {t(
            'calibracaoPulverizador.phaseB.subtitle',
            'Indique a velocidade de trabalho para calcular o débito total que o pulverizador deve fornecer.'
          )}
        </p>

        {/* Campos Tácteis de Entrada */}
        <div className={isDesktop ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-2.5'}>
          {/* Campo 1: Velocidade de avanço */}
          <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="input-travelSpeedKmH" className="text-xs font-bold text-slate-700">
                {t('calibracaoPulverizador.phaseB.travelSpeed', 'Velocidade de avanço')}
              </label>
              <button
                type="button"
                onClick={() => onOpenKeypad?.('travelSpeedKmH')}
                className="flex items-center gap-1.5 text-xs font-bold font-mono-numbers px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-900 shadow-2xs hover:border-[#114037] cursor-pointer touch-target"
                aria-label={t('calibracaoPulverizador.phaseB.editSpeed', 'Editar velocidade')}
              >
                <span>{speedNum !== undefined ? formatNumber(speedNum, 1) : '—'}</span>
                <span className="text-[#1D734B] font-semibold">km/h</span>
                <Pencil className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* Atalhos Rápidos de Velocidade */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-0.5">
                {t('calibracaoPulverizador.phaseB.shortcuts', 'Atalhos:')}
              </span>
              {speedPresets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onSpeedChange(p)}
                  className={`px-2 py-0.5 text-xs font-bold rounded-lg transition-all font-mono-numbers cursor-pointer touch-target ${
                    speedNum === p
                      ? 'bg-[#114037] text-white shadow-xs'
                      : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {formatNumber(p, 1)}
                </button>
              ))}
            </div>
          </div>

          {/* Campo 2: Largura de trabalho */}
          <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="input-workingWidthM" className="text-xs font-bold text-slate-700 block">
                  {t('calibracaoPulverizador.phaseB.workingWidth', 'Largura de trabalho')}
                </label>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  {t(
                    'calibracaoPulverizador.phaseB.workingWidthHelp',
                    'Normalmente corresponde à distância entre duas linhas tratadas numa passagem.'
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onOpenKeypad?.('workingWidthM')}
                className="flex items-center gap-1.5 text-xs font-bold font-mono-numbers px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-900 shadow-2xs hover:border-[#114037] cursor-pointer touch-target shrink-0 ml-2"
                aria-label={t('calibracaoPulverizador.phaseB.editWidth', 'Editar largura de trabalho')}
              >
                <span>{widthNum !== undefined ? formatNumber(widthNum, 2) : '—'}</span>
                <span className="text-[#1D734B] font-semibold">m</span>
                <Pencil className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* Ação de reposição ao valor da entrelinha se for manual */}
            {canResetWidth && rowSpacingNum !== undefined && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => onWidthChange(rowSpacingNum, 'auto-row-spacing')}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#1D734B] hover:text-[#114037] bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/60 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>
                    {t(
                      'calibracaoPulverizador.phaseB.useRowSpacingAction',
                      `Usar a distância entrelinhas: ${formatNumber(rowSpacingNum, 2)} m`
                    )}
                  </span>
                </button>
              </div>
            )}

            {/* Atalhos Rápidos de Largura */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                {t('calibracaoPulverizador.phaseB.shortcuts', 'Atalhos:')}
              </span>
              {widthPresets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onWidthChange(p, 'manual')}
                  className={`px-2 py-0.5 text-xs font-bold rounded-lg transition-all font-mono-numbers cursor-pointer touch-target ${
                    widthNum === p
                      ? 'bg-[#114037] text-white shadow-xs'
                      : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {formatNumber(p, 2)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

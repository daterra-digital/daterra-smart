import React from 'react';
import { Pencil } from 'lucide-react';
import type { CalibrationKeypadField } from './irdKeypadMeta.ts';
import type { IrdExposureBlockState, IrdSensitiveZoneCategory, IrdTriStateStatus } from './irdOriginTypes.ts';

interface IrdQuickExposureStepProps {
  readonly exposure: IrdExposureBlockState;
  readonly onChangeExposure: (next: IrdExposureBlockState) => void;
  readonly onOpenKeypad: (field: Extract<CalibrationKeypadField, 'distanceToSensitiveAreaM' | 'labelMinBufferM'>) => void;
}

const ZONE_OPTIONS: ReadonlyArray<{ id: IrdSensitiveZoneCategory; label: string }> = [
  { id: 'watercourse', label: 'Curso de água ou massa hídrica' },
  { id: 'neighboring_crop', label: 'Cultura ou parcela vizinha' },
  { id: 'habitation_public', label: 'Habitação, via ou zona pública' },
  { id: 'apiary_pollinators', label: 'Apiário ou zona apícola' },
  { id: 'protected_area', label: 'Área natural ou protegida' },
  { id: 'other_multiple', label: 'Outra ou múltiplas zonas sensíveis' }
];

const DOWNWIND_LABELS: Record<IrdTriStateStatus, string> = { yes: 'Sim', no: 'Não', unknown: 'Não sei' };

export const IrdQuickExposureStep: React.FC<IrdQuickExposureStepProps> = ({
  exposure,
  onChangeExposure,
  onOpenKeypad
}) => (
  <div className="space-y-3">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <span className="block text-xs font-bold text-slate-800">Distância à zona sensível (m)</span>
        <div className="flex items-center gap-1.5">
          <button id="ird-p-dist" type="button" onClick={() => onOpenKeypad('distanceToSensitiveAreaM')} className="touch-target flex-1 text-left rounded-xl border border-slate-300 bg-white hover:bg-slate-50 p-2.5 flex items-center justify-between gap-2 cursor-pointer">
            <strong className="font-mono-numbers text-sm font-extrabold text-slate-950">{typeof exposure.distanceToSensitiveAreaM === 'number' ? `${exposure.distanceToSensitiveAreaM} m` : 'Não confirmada (conservador)'}</strong>
            <Pencil className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
          </button>
          {typeof exposure.distanceToSensitiveAreaM === 'number' && (
            <button type="button" onClick={() => onChangeExposure({ ...exposure, distanceToSensitiveAreaM: null })} className="touch-target px-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer">Limpar</button>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800">Distância exigida no rótulo (m)</span>
          <button type="button" onClick={() => onChangeExposure({ ...exposure, labelBufferKnown: !exposure.labelBufferKnown, labelMinBufferM: !exposure.labelBufferKnown ? exposure.labelMinBufferM : null })} className="text-[11px] font-bold text-[#114037] underline cursor-pointer">
            {exposure.labelBufferKnown ? 'Marcar não conhecida' : 'Introduzir distância'}
          </button>
        </div>
        {exposure.labelBufferKnown ? (
          <button id="ird-p-buf" type="button" onClick={() => onOpenKeypad('labelMinBufferM')} className="touch-target w-full text-left rounded-xl border border-slate-300 bg-white hover:bg-slate-50 p-2.5 flex items-center justify-between gap-2 cursor-pointer">
            <strong className="font-mono-numbers text-sm font-extrabold text-slate-950">{typeof exposure.labelMinBufferM === 'number' ? `${exposure.labelMinBufferM} m` : 'Introduzir (m)'}</strong>
            <Pencil className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
          </button>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-700">Não conhecida (aplica referência protetora mínima)</div>
        )}
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <span className="block text-xs font-bold text-slate-800">Alvo sensível a sotavento</span>
        <div role="radiogroup" aria-label="Alvo sensível a sotavento" className="flex flex-wrap gap-2">
          {(['yes', 'no', 'unknown'] as const).map((st) => (
            <button key={st} type="button" role="radio" aria-checked={exposure.downwindStatus === st} onClick={() => onChangeExposure({ ...exposure, downwindStatus: st })} className={`touch-target px-3.5 py-1.5 rounded-xl border text-xs font-extrabold cursor-pointer ${exposure.downwindStatus === st ? 'bg-[#114037] text-white border-[#114037]' : 'bg-white text-slate-800 border-slate-300'}`}>
              {DOWNWIND_LABELS[st]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="ird-zone-category" className="block text-xs font-bold text-slate-800 mb-1">Tipo de zona sensível (Apenas informativo)</label>
        <select id="ird-zone-category" value={exposure.sensitiveZoneCategory} onChange={(e) => onChangeExposure({ ...exposure, sensitiveZoneCategory: e.target.value as IrdSensitiveZoneCategory | '' })} className="touch-target w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-semibold text-slate-900">
          <option value="">Não especificado</option>
          {ZONE_OPTIONS.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}
        </select>
      </div>
    </div>
  </div>
);

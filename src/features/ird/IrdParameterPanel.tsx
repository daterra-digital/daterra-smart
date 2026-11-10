import React, { useMemo, useState } from 'react';
import type { Nozzle } from '../nozzle-comparison/nozzleComparison.types.ts';
import type {
  IrdApplicationDomain,
  IrdExposureInput,
  IrdNozzleInput,
  IrdOperationInput
} from './irdTypes.ts';

export type ParameterKeypadField =
  | 'workingPressureBar'
  | 'travelSpeedKmh'
  | 'boomOrReleaseHeightM'
  | 'distanceToSensitiveAreaM'
  | 'labelMinBufferM';

interface IrdParameterPanelProps {
  readonly cultureLabel: string;
  readonly windDirectionLabel: string;
  readonly catalogNozzles: readonly Nozzle[];
  readonly selectedNozzleId: string;
  readonly nozzle: IrdNozzleInput;
  readonly operation: IrdOperationInput;
  readonly exposure: IrdExposureInput;
  readonly onChangeCultureLabel: (val: string) => void;
  readonly onSelectNozzle: (nozzleId: string) => void;
  readonly onChangeOperation: (patch: Partial<IrdOperationInput>) => void;
  readonly onToggleAirSleeve: () => void;
  readonly onToggleDownwind: () => void;
  readonly onOpenKeypad: (field: ParameterKeypadField) => void;
  readonly onClearOptionalExposure: (field: 'distanceToSensitiveAreaM' | 'labelMinBufferM') => void;
}

const CULTURE_OPTIONS = [
  'Cultura arvense / Cereal', 'Vinha · Em desenvolvimento', 'Vinha · Floração / Vegetação plena',
  'Pomar · Pomoideas / Prunóideas', 'Olival', 'Hortícola ao ar livre'
] as const;

export const IrdParameterPanel: React.FC<IrdParameterPanelProps> = ({
  cultureLabel, windDirectionLabel, catalogNozzles, selectedNozzleId, nozzle, operation, exposure,
  onChangeCultureLabel, onSelectNozzle, onChangeOperation, onToggleAirSleeve, onToggleDownwind, onOpenKeypad, onClearOptionalExposure
}) => {
  const [brandFilter, setBrandFilter] = useState<string>('');
  const brands = useMemo(() => Array.from(new Set(catalogNozzles.map((n) => n.brand))).sort(), [catalogNozzles]);
  const visibleNozzles = useMemo(() => (brandFilter ? catalogNozzles.filter((n) => n.brand === brandFilter) : catalogNozzles).slice(0, 150), [catalogNozzles, brandFilter]);

  const numericRows: ReadonlyArray<{ id: string; label: string; field: ParameterKeypadField; val: number | null | undefined; unit: string; optional?: boolean }> = [
    { id: 'ird-p-press', label: 'Pressão de trabalho', field: 'workingPressureBar', val: nozzle.workingPressureBar, unit: 'bar' },
    { id: 'ird-p-speed', label: 'Velocidade de avanço', field: 'travelSpeedKmh', val: operation.travelSpeedKmh, unit: 'km/h' },
    { id: 'ird-p-height', label: 'Altura de aplicação', field: 'boomOrReleaseHeightM', val: operation.boomOrReleaseHeightM, unit: 'm' },
    { id: 'ird-p-dist', label: 'Distância a zona sensível', field: 'distanceToSensitiveAreaM', val: exposure.distanceToSensitiveAreaM, unit: 'm', optional: true },
    { id: 'ird-p-buf', label: 'Zona tampão do rótulo SIFITO', field: 'labelMinBufferM', val: exposure.labelMinBufferM, unit: 'm', optional: true }
  ];

  return (
    <section aria-labelledby="ird-params-heading" className="bg-white/95 rounded-2xl p-4 border border-slate-200 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 id="ird-params-heading" className="text-sm font-bold text-slate-800">Valores Introduzidos — Operação &amp; Exposição</h2>
        <span className="text-xs font-semibold text-slate-600">Toque para editar</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label htmlFor="ird-culture" className="block text-xs font-bold text-slate-700 mb-1">Cultura / estádio fenológico</label>
          <select id="ird-culture" value={cultureLabel} onChange={(e) => onChangeCultureLabel(e.target.value)} className="touch-target w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs sm:text-sm font-semibold text-slate-900">
            {CULTURE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="ird-domain" className="block text-xs font-bold text-slate-700 mb-1">Equipamento / tipo de aplicação</label>
          <select id="ird-domain" value={operation.applicationDomain} onChange={(e) => onChangeOperation({ applicationDomain: e.target.value as IrdApplicationDomain })} className="touch-target w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs sm:text-sm font-semibold text-slate-900">
            <option value="horizontal_boom">Pulverizador de barras horizontais</option>
            <option value="orchard_airblast">Atomizador / culturas arbóreas</option>
            <option value="manual_lance">Aplicação manual com lança</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <label htmlFor="ird-nozzle-brand" className="block text-xs font-bold text-slate-700 mb-1">Marca do bico (catálogo local)</label>
          <select id="ird-nozzle-brand" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="touch-target w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-semibold text-slate-900">
            <option value="">Todas ({brands.length})</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="ird-nozzle-select" className="block text-xs font-bold text-slate-700 mb-1">Bico selecionado</label>
          <select id="ird-nozzle-select" value={selectedNozzleId} onChange={(e) => onSelectNozzle(e.target.value)} className="touch-target w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs sm:text-sm font-semibold text-slate-900">
            <option value="">Sem bico selecionado (fallback conservador)</option>
            {visibleNozzles.map((n) => <option key={n.id} value={n.id}>{n.brand} {n.modelNorm} ({n.nozzleType})</option>)}
          </select>
        </div>
      </div>

      <div className="divide-y divide-slate-200/80">
        {numericRows.map((r) => (
          <div key={r.id} className="flex items-center gap-2 py-1">
            <button id={r.id} type="button" onClick={() => onOpenKeypad(r.field)} className="touch-target flex-1 flex items-center justify-between gap-2 px-2 rounded-xl text-left hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#3CA64C]">
              <span className="text-xs sm:text-sm font-semibold text-slate-700">{r.label}</span>
              <span className="font-mono-numbers text-sm font-bold text-slate-950">{typeof r.val === 'number' ? `${r.val} ${r.unit}` : 'Introduzir'} ✏️</span>
            </button>
            {r.optional && typeof r.val === 'number' && (
              <button type="button" onClick={() => onClearOptionalExposure(r.field as 'distanceToSensitiveAreaM' | 'labelMinBufferM')} className="touch-target px-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">Limpar</button>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {operation.applicationDomain === 'horizontal_boom' && (
          <button type="button" aria-pressed={Boolean(nozzle.hasAirSleeve)} onClick={onToggleAirSleeve} className={`touch-target px-3.5 rounded-xl border text-xs font-bold ${nozzle.hasAirSleeve ? 'bg-[#eef8f0] border-[#114037] text-[#114037]' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
            Manga de ar: {nozzle.hasAirSleeve ? 'Ativa' : 'Sem manga'}
          </button>
        )}
        <button type="button" aria-pressed={exposure.hasDownwindSensitiveTarget} onClick={onToggleDownwind} className={`touch-target px-3.5 rounded-xl border text-xs font-bold ${exposure.hasDownwindSensitiveTarget ? 'bg-amber-100 border-amber-400 text-amber-950' : 'bg-slate-50 border-slate-300 text-slate-800'}`}>
          Vento {windDirectionLabel || 'local'} · Alvo sensível a sotavento: {exposure.hasDownwindSensitiveTarget ? 'Sim' : 'Não'}
        </button>
      </div>
    </section>
  );
};

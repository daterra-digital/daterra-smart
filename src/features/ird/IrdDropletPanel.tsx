import React from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import type { IrdDataConfidence, IrdNozzleInput, IrdUserMeasurementSource } from './irdTypes.ts';
import type { ResolvedNozzleDriftProfile } from './irdNozzleAdapter.ts';

export type IrdDropletUiMode = 'rotary' | 'conventional';

interface IrdDropletPanelProps {
  readonly isOpen: boolean;
  readonly mode: IrdDropletUiMode;
  readonly nozzle: IrdNozzleInput;
  readonly resolvedProfile: ResolvedNozzleDriftProfile | null;
  readonly onToggleOpen: () => void;
  readonly onModeChange: (mode: IrdDropletUiMode) => void;
  readonly onChangeFields: (patch: Partial<IrdNozzleInput>) => void;
  readonly onOpenKeypad: (field: 'representativeDropletDiameterUm' | 'measuredDv10Um' | 'measuredDv50Um' | 'measuredDv90Um' | 'measurementPressureBar') => void;
  readonly onClear: () => void;
}

export const IrdDropletPanel: React.FC<IrdDropletPanelProps> = ({
  isOpen,
  mode,
  nozzle,
  resolvedProfile,
  onToggleOpen,
  onModeChange,
  onChangeFields,
  onOpenKeypad,
  onClear
}) => {
  const renderValBtn = (
    id: string,
    label: string,
    field: 'representativeDropletDiameterUm' | 'measuredDv10Um' | 'measuredDv50Um' | 'measuredDv90Um' | 'measurementPressureBar',
    val: number | null | undefined,
    unit: string
  ) => (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-slate-800 mb-1">
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => onOpenKeypad(field)}
        className="touch-target w-full rounded-xl border border-slate-400 bg-white px-3 text-left font-mono-numbers text-sm sm:text-base font-bold text-slate-900 flex items-center justify-between hover:border-[#3CA64C] focus:outline-none focus:ring-2 focus:ring-[#3CA64C]"
      >
        <span>{typeof val === 'number' ? val : '—'}</span>
        <span className="text-xs font-sans font-semibold text-slate-600">{unit} ✏️</span>
      </button>
    </div>
  );

  return (
    <section aria-labelledby="ird-droplet-heading" className="bg-white/95 rounded-2xl p-4 border border-slate-200 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h2 id="ird-droplet-heading" className="text-sm font-bold text-slate-800">
            Diâmetro de gota (opcional)
          </h2>
          <p className="text-xs text-slate-700">
            Sem introdução de valores, é utilizada a <strong>hierarquia do catálogo oficial</strong>.
          </p>
        </div>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="ird-droplet-panel"
          onClick={onToggleOpen}
          className="touch-target px-4 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#3CA64C]"
        >
          <span>{isOpen ? 'Ocultar diâmetro de gota' : '+ Introduzir diâmetro de gota'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div id="ird-droplet-panel" className="pt-3 border-t border-slate-200 space-y-3.5">
          <div role="radiogroup" aria-label="Modo de medição de gota" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              role="radio"
              aria-checked={mode === 'rotary'}
              onClick={() => onModeChange('rotary')}
              className={`touch-target px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-extrabold ${
                mode === 'rotary' ? 'border-2 border-[#114037] bg-[#eef8f0] text-[#114037]' : 'border border-slate-300 bg-white text-slate-900'
              }`}
            >
              Modo A: Bico rotativo / drone
              <span className="block text-xs font-medium text-slate-700">Diâmetro representativo único (µm)</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={mode === 'conventional'}
              onClick={() => onModeChange('conventional')}
              className={`touch-target px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-extrabold ${
                mode === 'conventional' ? 'border-2 border-[#114037] bg-[#eef8f0] text-[#114037]' : 'border border-slate-300 bg-white text-slate-900'
              }`}
            >
              Modo B: Bico convencional
              <span className="block text-xs font-medium text-slate-700">DV10, DV50 e DV90 opcionais (µm)</span>
            </button>
          </div>

          {mode === 'rotary' ? (
            <div>
              {renderValBtn('ird-rep-diam', 'Diâmetro representativo (µm)', 'representativeDropletDiameterUm', nozzle.representativeDropletDiameterUm, 'µm')}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {renderValBtn('ird-dv10', 'DV10 (µm)', 'measuredDv10Um', nozzle.measuredDv10Um, 'µm')}
              {renderValBtn('ird-dv50', 'DV50 (µm)', 'measuredDv50Um', nozzle.measuredDv50Um, 'µm')}
              {renderValBtn('ird-dv90', 'DV90 (µm)', 'measuredDv90Um', nozzle.measuredDv90Um, 'µm')}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label htmlFor="ird-meas-source" className="block text-xs font-bold text-slate-800 mb-1">
                Fonte da medição
              </label>
              <select
                id="ird-meas-source"
                value={nozzle.measurementSource || 'calibration_profile'}
                onChange={(e) => onChangeFields({ measurementSource: e.target.value as IrdUserMeasurementSource })}
                className="touch-target w-full rounded-xl border border-slate-400 bg-white px-3 text-xs sm:text-sm font-semibold text-slate-900"
              >
                <option value="calibration_profile">Perfil de calibração</option>
                <option value="manufacturer_spec">Ficha do fabricante</option>
                <option value="lab_certificate">Ensaio laboratorial</option>
                <option value="user_declared">Declaração em campo</option>
              </select>
            </div>

            {renderValBtn('ird-meas-pressure', 'Pressão de ref. (bar)', 'measurementPressureBar', nozzle.measurementPressureBar, 'bar')}

            <div>
              <label htmlFor="ird-meas-date" className="block text-xs font-bold text-slate-800 mb-1">
                Data da medição
              </label>
              <input
                id="ird-meas-date"
                type="date"
                value={nozzle.measurementDate || ''}
                onChange={(e) => onChangeFields({ measurementDate: e.target.value || null })}
                className="touch-target w-full rounded-xl border border-slate-400 bg-white px-3 font-mono-numbers text-xs sm:text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <label htmlFor="ird-meas-conf" className="font-bold">Confiança declarada:</label>
              <select
                id="ird-meas-conf"
                value={nozzle.measurementConfidence || ''}
                onChange={(e) => onChangeFields({ measurementConfidence: (e.target.value || null) as IrdDataConfidence | null })}
                className="touch-target rounded-xl border border-slate-300 bg-slate-50 px-2.5 text-xs font-bold text-slate-900"
              >
                <option value="">Automática</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Média</option>
                <option value="REDUZIDA">Reduzida</option>
              </select>
              {resolvedProfile && (
                <span className="font-semibold text-[#114037]">
                  Resolvido: {resolvedProfile.resolutionTier}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClear}
              className="touch-target px-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Limpar medição
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

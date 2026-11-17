import React, { useState } from 'react';
import { Pencil, AlertCircle, BookOpen } from 'lucide-react';
import type { Nozzle } from '../nozzle-comparison/nozzleComparison.types.ts';
import type { IrdApplicationDomain } from './irdTypes.ts';
import type { ResolvedNozzleDriftProfile } from './irdNozzleAdapter.ts';
import type { AnyIrdKeypadField } from './irdKeypadMeta.ts';
import type { IrdGuideTopicId } from './irdGuideSections.ts';
import type {
  IrdCalibrationBlockState, IrdCultureBlockState, IrdEquipmentBlockState,
  IrdExposureBlockState, IrdHeightCharacterizationMode, IrdNozzleBlockState, IrdTriStateStatus
} from './irdOriginTypes.ts';
import { IrdQuickAccordions, type IrdQuickAccordionState } from './IrdQuickAccordions.tsx';

interface IrdQuickEvalPanelProps {
  readonly catalogNozzles: readonly Nozzle[];
  readonly culture: IrdCultureBlockState;
  readonly equipment: IrdEquipmentBlockState;
  readonly nozzle: IrdNozzleBlockState;
  readonly calibration: IrdCalibrationBlockState;
  readonly exposure: IrdExposureBlockState;
  readonly resolvedProfile: ResolvedNozzleDriftProfile | null;
  readonly accordions?: IrdQuickAccordionState;
  readonly onToggleAccordion?: (key: keyof IrdQuickAccordionState) => void;
  readonly onOpenGuideTopic?: (topic: IrdGuideTopicId) => void;
  readonly onChangeCulture: React.Dispatch<React.SetStateAction<IrdCultureBlockState>>;
  readonly onChangeEquipment: React.Dispatch<React.SetStateAction<IrdEquipmentBlockState>>;
  readonly onChangeNozzle: React.Dispatch<React.SetStateAction<IrdNozzleBlockState>>;
  readonly onChangeCalibration: React.Dispatch<React.SetStateAction<IrdCalibrationBlockState>>;
  readonly onChangeExposure: React.Dispatch<React.SetStateAction<IrdExposureBlockState>>;
  readonly onOpenKeypad: (field: AnyIrdKeypadField) => void;
}

const FAMILIES: ReadonlyArray<{ id: IrdApplicationDomain; label: string }> = [
  { id: 'horizontal_boom', label: 'Culturas baixas — barras' },
  { id: 'orchard_airblast', label: 'Arbóreas / copa — atomizador' },
  { id: 'manual_lance', label: 'Aplicação manual — lança / pistola' }
];
const AIR_OPTS: ReadonlyArray<{ id: IrdTriStateStatus; label: string }> = [
  { id: 'yes', label: 'Sim' }, { id: 'no', label: 'Não' }, { id: 'unknown', label: 'Desconhecido' }
];
const ORCHARD_HEIGHT_MODES: ReadonlyArray<{ id: IrdHeightCharacterizationMode; label: string }> = [
  { id: 'canopy_release', label: 'Altura de libertação ao alvo / copa (m)' },
  { id: 'soil_boom', label: 'Altura da barra / difusores ao solo (m)' },
  { id: 'culture_profile_canopy', label: 'Altura de copa — requer evolução futura' },
  { id: 'descriptive_unavailable', label: 'Modo descritivo (medição exata indisponível)' }
];
const MANUAL_HEIGHT_MODES: ReadonlyArray<{ id: IrdHeightCharacterizationMode; label: string }> = [
  { id: 'canopy_release', label: 'Altura de libertação ao alvo / folhagem (m)' },
  { id: 'soil_boom', label: 'Altura da lança / barra ao solo (m)' },
  { id: 'descriptive_unavailable', label: 'Modo descritivo (medição exata indisponível)' }
];

const getHeightModes = (dom: IrdApplicationDomain) => dom === 'orchard_airblast' ? ORCHARD_HEIGHT_MODES : MANUAL_HEIGHT_MODES;

export const IrdQuickEvalPanel: React.FC<IrdQuickEvalPanelProps> = ({
  catalogNozzles, culture, equipment, nozzle, calibration, exposure, resolvedProfile,
  accordions, onToggleAccordion, onOpenGuideTopic,
  onChangeCulture, onChangeEquipment, onChangeNozzle, onChangeCalibration, onChangeExposure, onOpenKeypad
}) => {
  const [localAcc, setLocalAcc] = useState<IrdQuickAccordionState>({ nozzle: false, expo: false, context: false });
  const accState = accordions ?? localAcc;
  const toggleAcc = onToggleAccordion ?? ((k: keyof IrdQuickAccordionState) => setLocalAcc((p) => ({ ...p, [k]: !p[k] })));

  const dom = equipment.manual.applicationDomain;
  const m = calibration.manual;
  const domainModes = getHeightModes(dom);
  const heightLabel = dom === 'horizontal_boom' ? 'Altura da barra (m)' : domainModes.find((h) => h.id === m.heightMode)?.label ?? 'Altura de aplicação (m)';
  const isNonNumericHeight = dom !== 'horizontal_boom' && (m.heightMode === 'descriptive_unavailable' || m.heightMode === 'culture_profile_canopy');

  const selectFamily = (nextDom: IrdApplicationDomain) => {
    onChangeEquipment((prev) => ({ ...prev, manual: { ...prev.manual, applicationDomain: nextDom } }));
    const nextModes = getHeightModes(nextDom);
    onChangeCalibration((prev) => {
      const nextHMode: IrdHeightCharacterizationMode = nextDom === 'horizontal_boom'
        ? 'horizontal_boom_ground'
        : nextModes.some((item) => item.id === prev.manual.heightMode) ? prev.manual.heightMode : 'canopy_release';
      return { ...prev, manual: { ...prev.manual, heightMode: nextHMode } };
    });
  };

  return (
    <div className="space-y-4">
      <section aria-label="Nível 2: Núcleo obrigatório manual" className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-soft space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-[#114037]">Nível 2 · Avaliação Rápida Manual</h2>
            <p className="text-xs text-slate-600">Apenas o mínimo necessário para avaliar; aprofunde em opcional se pretender maior precisão.</p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-[#114037] border border-emerald-200">Origem: Manual</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Família de equipamento">
          {FAMILIES.map((f) => (
            <button key={f.id} type="button" role="radio" aria-checked={dom === f.id} onClick={() => selectFamily(f.id)} className={`touch-target text-left rounded-xl border px-3 py-2 text-xs font-extrabold cursor-pointer ${dom === f.id ? 'border-2 border-[#114037] bg-[#eef8f0] text-[#114037]' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'}`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button id="ird-p-press" type="button" onClick={() => onOpenKeypad('workingPressureBar')} className={`touch-target text-left rounded-xl border p-3 flex items-center justify-between gap-2 cursor-pointer ${typeof m.workingPressureBar !== 'number' ? 'border-amber-400 bg-amber-50' : 'border-slate-300 bg-white hover:bg-slate-50'}`}>
            <div><span className="block text-[11px] font-semibold text-slate-600">1. Pressão de trabalho (obrigatório)</span><strong className="font-mono-numbers text-sm font-extrabold text-slate-950">{typeof m.workingPressureBar === 'number' ? `${m.workingPressureBar} bar` : 'Introduzir (bar)'}</strong></div>
            <Pencil className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
          </button>

          <button id="ird-p-speed" type="button" onClick={() => onOpenKeypad('travelSpeedKmh')} className={`touch-target text-left rounded-xl border p-3 flex items-center justify-between gap-2 cursor-pointer ${typeof m.travelSpeedKmh !== 'number' ? 'border-amber-400 bg-amber-50' : 'border-slate-300 bg-white hover:bg-slate-50'}`}>
            <div><span className="block text-[11px] font-semibold text-slate-600">2. Velocidade de avanço (obrigatório)</span><strong className="font-mono-numbers text-sm font-extrabold text-slate-950">{typeof m.travelSpeedKmh === 'number' ? `${m.travelSpeedKmh} km/h` : 'Introduzir (km/h)'}</strong></div>
            <Pencil className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
          </button>

          {!isNonNumericHeight ? (
            <button id="ird-p-height" type="button" onClick={() => onOpenKeypad('boomOrReleaseHeightM')} className={`touch-target text-left rounded-xl border p-3 flex items-center justify-between gap-2 cursor-pointer ${typeof m.boomOrReleaseHeightM !== 'number' ? 'border-amber-400 bg-amber-50' : 'border-slate-300 bg-white hover:bg-slate-50'}`}>
              <div><span className="block text-[11px] font-semibold text-slate-600">3. {heightLabel} (obrigatório)</span><strong className="font-mono-numbers text-sm font-extrabold text-slate-950">{typeof m.boomOrReleaseHeightM === 'number' ? `${m.boomOrReleaseHeightM} m` : 'Introduzir (m)'}</strong></div>
              <Pencil className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
            </button>
          ) : (
            <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 font-semibold flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{m.heightMode === 'culture_profile_canopy' ? 'Altura de copa: sem conversão automática no motor atual (bloqueia).' : 'Sem medição numérica (bloqueia sem inventar 0,5 m).'}</span>
            </div>
          )}
        </div>

        {dom !== 'horizontal_boom' && (
          <div>
            <label htmlFor="ird-height-mode" className="block text-xs font-bold text-slate-700 mb-1">Modo de caracterização da altura</label>
            <select id="ird-height-mode" value={m.heightMode} onChange={(e) => onChangeCalibration((prev) => ({ ...prev, manual: { ...prev.manual, heightMode: e.target.value as IrdHeightCharacterizationMode } }))} className="touch-target w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-semibold text-slate-900">
              {domainModes.map((hm) => <option key={hm.id} value={hm.id}>{hm.label}</option>)}
            </select>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800">Assistência / transporte de ar</span>
            {onOpenGuideTopic && (
              <button type="button" onClick={() => onOpenGuideTopic('air_assist')} aria-label="Saber mais sobre assistência de ar" className="text-[11px] font-extrabold text-[#114037] underline inline-flex items-center gap-1 cursor-pointer">
                <BookOpen className="w-3 h-3" aria-hidden="true" /><span>Saber mais</span>
              </button>
            )}
          </div>
          <div role="radiogroup" aria-label="Assistência de ar" className="flex flex-wrap gap-2">
            {AIR_OPTS.map((opt) => (
              <button key={opt.id} type="button" role="radio" aria-checked={equipment.manual.airAssistStatus === opt.id} onClick={() => onChangeEquipment((prev) => ({ ...prev, manual: { ...prev.manual, airAssistStatus: opt.id } }))} className={`touch-target px-3.5 py-1.5 rounded-xl border text-xs font-extrabold cursor-pointer ${equipment.manual.airAssistStatus === opt.id ? 'bg-[#114037] text-white border-[#114037]' : 'bg-white text-slate-800 border-slate-300'}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-600">Só barra horizontal com Sim aplica fator 0,85; Desconhecido mantém avaliação conservadora.</p>
        </div>

        <div>
          <label htmlFor="ird-culture-manual" className="block text-xs font-bold text-slate-700 mb-1">Parcela / cultura (opcional · identificação no histórico; não altera o índice)</label>
          <input id="ird-culture-manual" type="text" value={culture.manualLabel} onChange={(e) => onChangeCulture((prev) => ({ ...prev, manualLabel: e.target.value }))} placeholder="Ex: Talhão Sul" className="touch-target w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900" />
        </div>
      </section>

      <IrdQuickAccordions
        openState={accState} onToggle={toggleAcc} onOpenGuideTopic={onOpenGuideTopic}
        catalogNozzles={catalogNozzles} culture={culture} nozzle={nozzle} calibration={calibration} exposure={exposure}
        resolvedProfile={resolvedProfile} onChangeNozzle={onChangeNozzle} onChangeCalibration={onChangeCalibration}
        onChangeExposure={onChangeExposure} onOpenKeypad={onOpenKeypad}
      />
    </div>
  );
};

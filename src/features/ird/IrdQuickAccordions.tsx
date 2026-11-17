import React from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import type { Nozzle } from '../nozzle-comparison/nozzleComparison.types.ts';
import type { ResolvedNozzleDriftProfile } from './irdNozzleAdapter.ts';
import type { AnyIrdKeypadField } from './irdKeypadMeta.ts';
import type { IrdGuideTopicId } from './irdGuideSections.ts';
import type {
  IrdCalibrationBlockState, IrdCultureBlockState, IrdExposureBlockState, IrdNozzleBlockState
} from './irdOriginTypes.ts';
import { IrdNozzleCascadeField } from './IrdNozzleCascadeField.tsx';
import { IrdDropletPanel, type IrdDropletUiMode } from './IrdDropletPanel.tsx';
import { IrdQuickExposureStep } from './IrdQuickExposureStep.tsx';
import { IrdCertifiedReductionPanel } from './IrdCertifiedReductionPanel.tsx';

export interface IrdQuickAccordionState {
  readonly nozzle: boolean;
  readonly expo: boolean;
  readonly context: boolean;
}

interface IrdQuickAccordionsProps {
  readonly openState: IrdQuickAccordionState;
  readonly onToggle: (key: keyof IrdQuickAccordionState) => void;
  readonly onOpenGuideTopic?: (topic: IrdGuideTopicId) => void;
  readonly catalogNozzles: readonly Nozzle[];
  readonly culture: IrdCultureBlockState;
  readonly nozzle: IrdNozzleBlockState;
  readonly calibration: IrdCalibrationBlockState;
  readonly exposure: IrdExposureBlockState;
  readonly resolvedProfile: ResolvedNozzleDriftProfile | null;
  readonly onChangeNozzle: React.Dispatch<React.SetStateAction<IrdNozzleBlockState>>;
  readonly onChangeCalibration: React.Dispatch<React.SetStateAction<IrdCalibrationBlockState>>;
  readonly onChangeExposure: React.Dispatch<React.SetStateAction<IrdExposureBlockState>>;
  readonly onOpenKeypad: (field: AnyIrdKeypadField) => void;
}

export const IrdQuickAccordions: React.FC<IrdQuickAccordionsProps> = ({
  openState, onToggle, onOpenGuideTopic, catalogNozzles, culture, nozzle, calibration, exposure,
  resolvedProfile, onChangeNozzle, onChangeCalibration, onChangeExposure, onOpenKeypad
}) => {
  const m = calibration.manual;
  const learnBtn = (topic: IrdGuideTopicId, aria: string) => onOpenGuideTopic ? (
    <button type="button" onClick={() => onOpenGuideTopic(topic)} aria-label={aria} className="text-[11px] font-extrabold text-[#114037] underline inline-flex items-center gap-1 cursor-pointer">
      <BookOpen className="w-3 h-3" aria-hidden="true" /><span>Saber mais</span>
    </button>
  ) : null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-soft divide-y divide-slate-200 overflow-hidden">
      <div>
        <button type="button" aria-expanded={openState.nozzle} aria-controls="ird-q-acc-nozzle" onClick={() => onToggle('nozzle')} className="touch-target w-full px-5 py-4 flex items-center justify-between gap-2 text-left hover:bg-slate-50 cursor-pointer">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-[#114037]">Acordeão 1 · Bico e espectro de gotas</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#114037] text-[10px] font-bold">Influencia IRD · 30%</span>
            </div>
            <div className="text-[11px] text-slate-600">{nozzle.manualCascade.catalogNozzleId ? 'Bico selecionado no catálogo local' : 'Opcional (atualmente fallback conservador classe F)'}</div>
          </div>
          {openState.nozzle ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
        </button>
        {openState.nozzle && (
          <div id="ird-q-acc-nozzle" className="px-5 pb-5 pt-2 space-y-4">
            <div className="flex justify-end">{learnBtn('droplet_spectrum', 'Saber mais sobre bico e espectro de gotas')}</div>
            <IrdNozzleCascadeField
              cascade={nozzle.manualCascade} catalog={catalogNozzles}
              onChangeCascade={(updater) => onChangeNozzle((prev) => ({ ...prev, manualCascade: typeof updater === 'function' ? updater(prev.manualCascade) : updater }))}
            />
            <IrdDropletPanel
              isOpen={m.isDropletOpen} mode={m.dropletMode as IrdDropletUiMode} resolvedProfile={resolvedProfile}
              nozzle={{ nozzleType: !nozzle.manualCascade.catalogNozzleId && m.dropletMode === 'rotary' ? 'rotativo' : undefined, workingPressureBar: m.workingPressureBar, representativeDropletDiameterUm: m.representativeDropletDiameterUm, measuredDv10Um: m.measuredDv10Um, measuredDv50Um: m.measuredDv50Um, measuredDv90Um: m.measuredDv90Um, measurementSource: m.measurementSource, measurementPressureBar: m.measurementPressureBar, measurementDate: m.measurementDate, measurementConfidence: m.measurementConfidence }}
              onToggleOpen={() => onChangeCalibration((prev) => ({ ...prev, manual: { ...prev.manual, isDropletOpen: !prev.manual.isDropletOpen } }))}
              onModeChange={(dropletMode) => onChangeCalibration((prev) => ({ ...prev, manual: { ...prev.manual, dropletMode, representativeDropletDiameterUm: null, measuredDv10Um: null, measuredDv50Um: null, measuredDv90Um: null } }))}
              onChangeFields={(patch) => onChangeCalibration((prev) => ({ ...prev, manual: { ...prev.manual, ...patch } }))}
              onOpenKeypad={onOpenKeypad}
              onClear={() => onChangeCalibration((prev) => ({ ...prev, manual: { ...prev.manual, representativeDropletDiameterUm: null, measuredDv10Um: null, measuredDv50Um: null, measuredDv90Um: null, measurementSource: 'user_declared', measurementPressureBar: null, measurementDate: null, measurementConfidence: null } }))}
            />
          </div>
        )}
      </div>

      <div>
        <button type="button" aria-expanded={openState.expo} aria-controls="ird-q-acc-expo" onClick={() => onToggle('expo')} className="touch-target w-full px-5 py-4 flex items-center justify-between gap-2 text-left hover:bg-slate-50 cursor-pointer">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-[#114037]">Acordeão 2 · Exposição e zonas sensíveis</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#114037] text-[10px] font-bold">Influencia IRD · 15%</span>
            </div>
            <div className="text-[11px] text-slate-600">{typeof exposure.distanceToSensitiveAreaM === 'number' ? `Distância confirmada: ${exposure.distanceToSensitiveAreaM} m` : 'Opcional (atualmente distância não confirmada · conservador)'}</div>
          </div>
          {openState.expo ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
        </button>
        {openState.expo && (
          <div id="ird-q-acc-expo" className="px-5 pb-5 pt-2 space-y-2">
            <div className="flex justify-end">{learnBtn('exposure', 'Saber mais sobre exposição e zonas sensíveis')}</div>
            <IrdQuickExposureStep exposure={exposure} onChangeExposure={onChangeExposure} onOpenKeypad={onOpenKeypad} />
          </div>
        )}
      </div>

      <div>
        <button type="button" aria-expanded={openState.context} aria-controls="ird-q-acc-ctx" onClick={() => onToggle('context')} className="touch-target w-full px-5 py-4 flex items-center justify-between gap-2 text-left hover:bg-slate-50 cursor-pointer">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-[#114037]">Acordeão 3 · Contexto, cultura e redução certificada</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">Não altera o índice nesta versão</span>
            </div>
            <div className="text-[11px] text-slate-600">{nozzle.certifiedReduction.status === 'documented' ? 'Redução declarada para rastreabilidade' : 'Opcional · apenas registo documental e identificação'}</div>
          </div>
          {openState.context ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
        </button>
        {openState.context && (
          <div id="ird-q-acc-ctx" className="px-5 pb-5 pt-2 space-y-3">
            <p className="text-[11px] text-slate-600">Contexto atual para histórico: <strong>{culture.manualLabel.trim() || 'Parcela não identificada'}</strong>. Informação registada apenas para rastreabilidade; não desconta pontos.</p>
            <IrdCertifiedReductionPanel
              value={nozzle.certifiedReduction}
              onChange={(patch) => onChangeNozzle((prev) => ({ ...prev, certifiedReduction: { ...prev.certifiedReduction, ...patch } }))}
              onOpenKeypad={onOpenKeypad}
            />
          </div>
        )}
      </div>
    </div>
  );
};

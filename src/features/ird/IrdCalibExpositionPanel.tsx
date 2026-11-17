import React from 'react';
import { Pencil, AlertCircle } from 'lucide-react';
import type { ProfileCalibration } from '../../db/types.ts';
import type { ResolvedNozzleDriftProfile } from './irdNozzleAdapter.ts';
import type { CalibrationKeypadField } from './irdKeypadMeta.ts';
import type { IrdCalibrationBlockState, IrdExposureBlockState, IrdSensitiveZoneCategory, IrdTriStateStatus } from './irdOriginTypes.ts';
import { extractCalibrationSafely } from './irdProfileMappers.ts';
import { IrdAccordionItem } from './IrdAccordionItem.tsx';
import { IrdOriginToggle } from './IrdOriginToggle.tsx';
import { IrdDropletPanel, type IrdDropletUiMode } from './IrdDropletPanel.tsx';

interface IrdCalibExpositionPanelProps {
  readonly openAccordion: string | null;
  readonly onToggleAccordion: (id: string) => void;
  readonly userId: string | null;
  readonly calibrations: readonly ProfileCalibration[];
  readonly calibration: IrdCalibrationBlockState;
  readonly exposure: IrdExposureBlockState;
  readonly calibrationGapsPt: readonly string[];
  readonly resolvedProfile: ResolvedNozzleDriftProfile | null;
  readonly onChangeCalibration: (next: IrdCalibrationBlockState) => void;
  readonly onCopyCalibrationToManual: () => void;
  readonly onChangeExposure: (next: IrdExposureBlockState) => void;
  readonly onOpenKeypad: (field: CalibrationKeypadField | 'representativeDropletDiameterUm' | 'measuredDv10Um' | 'measuredDv50Um' | 'measuredDv90Um' | 'measurementPressureBar') => void;
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

export const IrdCalibExpositionPanel: React.FC<IrdCalibExpositionPanelProps> = ({
  openAccordion, onToggleAccordion, userId, calibrations, calibration, exposure, calibrationGapsPt,
  resolvedProfile, onChangeCalibration, onCopyCalibrationToManual, onChangeExposure, onOpenKeypad
}) => {
  const selectedCal = calibration.mode === 'profile' ? calibrations.find((c) => String(c.id) === calibration.selectedProfileId) : undefined;
  const safeCal = extractCalibrationSafely(selectedCal);
  const m = calibration.manual;

  const calibSummary = calibration.mode === 'profile'
    ? (selectedCal ? `${selectedCal.working_pressure_bar} bar · ${selectedCal.working_speed_kmh} km/h (Perfil)` : 'Perfil não selecionado')
    : (typeof m.workingPressureBar === 'number' ? `${m.workingPressureBar} bar · ${m.travelSpeedKmh ?? '—'} km/h · ${m.boomOrReleaseHeightM ?? '—'} m` : 'Por preencher (Manual)');
  const expoSummary = `Rótulo: ${exposure.labelBufferKnown ? (typeof exposure.labelMinBufferM === 'number' ? `${exposure.labelMinBufferM} m` : 'Por introduzir') : 'Não conhecida'} · Sotavento: ${DOWNWIND_LABELS[exposure.downwindStatus]}`;

  return (
    <>
      <IrdAccordionItem id="calibracao" title="4. Calibração e aplicação" badgeLabel="Influencia IRD" summary={calibSummary} isOpen={openAccordion === 'calibracao'} onToggle={() => onToggleAccordion('calibracao')}>
        <IrdOriginToggle
          blockId="Calibração" mode={calibration.mode} hasProfiles={calibrations.length > 0} isLoggedIn={Boolean(userId)}
          canCopyToManual={Boolean(selectedCal)} emptyText="Sem perfis de calibração guardados." settingsTab="calibracao"
          onChangeMode={(mode) => onChangeCalibration({ ...calibration, mode })} onCopyToManual={onCopyCalibrationToManual}
        />
        {calibration.mode === 'profile' ? (
          calibrations.length > 0 && (
            <div className="space-y-2.5">
              <label htmlFor="ird-profile-cal" className="block text-xs font-bold text-slate-700">Perfil de calibração guardado</label>
              <select id="ird-profile-cal" value={calibration.selectedProfileId} onChange={(e) => onChangeCalibration({ ...calibration, selectedProfileId: e.target.value })} className="touch-target w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs sm:text-sm font-semibold text-slate-900">
                <option value="">-- Selecione um perfil guardado --</option>
                {calibrations.map((c) => <option key={c.id} value={String(c.id)}>{c.equipment_name || `Calibração #${c.id}`} · {c.working_pressure_bar} bar · {c.working_speed_kmh} km/h</option>)}
              </select>
              {selectedCal && safeCal && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs space-y-1.5 text-slate-800">
                  <div><strong>Resumo (só leitura):</strong> Pressão <span className="font-mono-numbers font-bold">{safeCal.workingPressureBar ?? '—'} bar</span> · Velocidade <span className="font-mono-numbers font-bold">{safeCal.workingSpeedKmh ?? '—'} km/h</span></div>
                  {safeCal.legacyDropletNotePt && <p className="text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-2">{safeCal.legacyDropletNotePt}</p>}
                </div>
              )}
              {calibrationGapsPt.map((g, idx) => (
                <div key={idx} className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-950 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" /><span>{g}</span>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'ird-p-press', field: 'workingPressureBar' as const, label: 'Pressão de trabalho', val: m.workingPressureBar, unit: 'bar' },
                { id: 'ird-p-speed', field: 'travelSpeedKmh' as const, label: 'Velocidade de avanço', val: m.travelSpeedKmh, unit: 'km/h' },
                { id: 'ird-p-height', field: 'boomOrReleaseHeightM' as const, label: 'Altura de aplicação', val: m.boomOrReleaseHeightM, unit: 'm' }
              ].map((item) => (
                <button key={item.id} id={item.id} type="button" onClick={() => onOpenKeypad(item.field)} className={`touch-target text-left rounded-xl border p-2.5 flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-[#3CA64C] cursor-pointer ${typeof item.val !== 'number' ? 'border-amber-400 bg-amber-50' : 'border-slate-300 bg-white hover:bg-slate-50'}`}>
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-600">{item.label}</span>
                    <strong className="font-mono-numbers text-sm font-extrabold text-slate-950">{typeof item.val === 'number' ? `${item.val} ${item.unit}` : 'Introduzir'}</strong>
                  </div>
                  <Pencil className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                </button>
              ))}
            </div>
            <IrdDropletPanel
              isOpen={m.isDropletOpen} mode={m.dropletMode as IrdDropletUiMode}
              nozzle={{ workingPressureBar: m.workingPressureBar, representativeDropletDiameterUm: m.representativeDropletDiameterUm, measuredDv10Um: m.measuredDv10Um, measuredDv50Um: m.measuredDv50Um, measuredDv90Um: m.measuredDv90Um, measurementSource: m.measurementSource, measurementPressureBar: m.measurementPressureBar, measurementDate: m.measurementDate, measurementConfidence: m.measurementConfidence }}
              resolvedProfile={resolvedProfile}
              onToggleOpen={() => onChangeCalibration({ ...calibration, manual: { ...m, isDropletOpen: !m.isDropletOpen } })}
              onModeChange={(dropletMode) => onChangeCalibration({ ...calibration, manual: { ...m, dropletMode, representativeDropletDiameterUm: null, measuredDv10Um: null, measuredDv50Um: null, measuredDv90Um: null } })}
              onChangeFields={(patch) => onChangeCalibration({ ...calibration, manual: { ...m, ...patch } })}
              onOpenKeypad={onOpenKeypad}
              onClear={() => onChangeCalibration({ ...calibration, manual: { ...m, representativeDropletDiameterUm: null, measuredDv10Um: null, measuredDv50Um: null, measuredDv90Um: null, measurementSource: null, measurementPressureBar: null, measurementDate: null, measurementConfidence: null } })}
            />
          </div>
        )}
      </IrdAccordionItem>

      <IrdAccordionItem id="exposicao" title="5. Exposição e zonas sensíveis" badgeLabel="Influencia IRD" summary={expoSummary} isOpen={openAccordion === 'exposicao'} onToggle={() => onToggleAccordion('exposicao')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <span className="block text-xs font-bold text-slate-800">Distância à zona sensível (m)</span>
            <div className="flex items-center gap-1.5">
              <button id="ird-p-dist" type="button" onClick={() => onOpenKeypad('distanceToSensitiveAreaM')} className="touch-target flex-1 text-left rounded-xl border border-slate-300 bg-white hover:bg-slate-50 p-2.5 flex items-center justify-between gap-2 cursor-pointer">
                <strong className="font-mono-numbers text-sm font-extrabold text-slate-950">{typeof exposure.distanceToSensitiveAreaM === 'number' ? `${exposure.distanceToSensitiveAreaM} m` : 'Não confirmada'}</strong>
                <Pencil className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
              </button>
              {typeof exposure.distanceToSensitiveAreaM === 'number' && <button type="button" onClick={() => onChangeExposure({ ...exposure, distanceToSensitiveAreaM: null })} className="touch-target px-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer">Limpar</button>}
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
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-700">Não conhecida (aplica referência protetora mínima sem zerar risco)</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
      </IrdAccordionItem>
    </>
  );
};

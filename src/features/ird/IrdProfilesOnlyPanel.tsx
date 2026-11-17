import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, AlertTriangle, Copy, ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { ProfileCalibration, ProfileCulture, ProfileEquipment, ProfileNozzle } from '../../db/types.ts';
import type { Nozzle } from '../nozzle-comparison/nozzleComparison.types.ts';
import type { IrdApplicationDomain } from './irdTypes.ts';
import type { IrdCalibrationBlockState, IrdCultureBlockState, IrdEquipmentBlockState, IrdNozzleBlockState, IrdTriStateStatus } from './irdOriginTypes.ts';
import { extractCalibrationSafely, mapEquipmentProfileToIrd, matchNozzleProfileToCatalog } from './irdProfileMappers.ts';

interface IrdProfilesOnlyPanelProps {
  readonly userId: string | null;
  readonly cultures: readonly ProfileCulture[];
  readonly equipments: readonly ProfileEquipment[];
  readonly profileNozzles: readonly ProfileNozzle[];
  readonly calibrations: readonly ProfileCalibration[];
  readonly catalogNozzles: readonly Nozzle[];
  readonly culture: IrdCultureBlockState;
  readonly equipment: IrdEquipmentBlockState;
  readonly nozzle: IrdNozzleBlockState;
  readonly calibration: IrdCalibrationBlockState;
  readonly blockingGapsPt: readonly string[];
  readonly isCultAccordionOpen?: boolean;
  readonly onToggleCultAccordion?: () => void;
  readonly onChangeCulture: (next: IrdCultureBlockState) => void;
  readonly onChangeEquipment: (next: IrdEquipmentBlockState) => void;
  readonly onChangeNozzle: (next: IrdNozzleBlockState) => void;
  readonly onChangeCalibration: (next: IrdCalibrationBlockState) => void;
  readonly onSwitchToQuickManual: () => void;
}

const DOMAIN_PT: Record<IrdApplicationDomain, string> = { horizontal_boom: 'Barras horizontais', orchard_airblast: 'Atomizador / copa', manual_lance: 'Lança / pistola manual' };
const AIR_PT: Record<IrdTriStateStatus, string> = { yes: 'Sim', no: 'Não', unknown: 'Desconhecido' };

export const IrdProfilesOnlyPanel: React.FC<IrdProfilesOnlyPanelProps> = ({
  userId, cultures, equipments, profileNozzles, calibrations, catalogNozzles,
  culture, equipment, nozzle, calibration, blockingGapsPt, isCultAccordionOpen, onToggleCultAccordion,
  onChangeCulture, onChangeEquipment, onChangeNozzle, onChangeCalibration, onSwitchToQuickManual
}) => {
  const [localCultOpen, setLocalCultOpen] = useState(false);
  const cultOpen = isCultAccordionOpen ?? localCultOpen;
  const toggleCult = onToggleCultAccordion ?? (() => setLocalCultOpen((v) => !v));

  const activeCult = cultures.find((c) => String(c.id) === culture.selectedProfileId);
  const activeEq = equipments.find((e) => String(e.id) === equipment.selectedProfileId);
  const mappedEq = useMemo(() => mapEquipmentProfileToIrd(activeEq), [activeEq]);
  const activeNoz = profileNozzles.find((n) => String(n.id) === nozzle.selectedProfileId);
  const nozMatch = useMemo(() => matchNozzleProfileToCatalog(activeNoz, catalogNozzles), [activeNoz, catalogNozzles]);
  const activeCal = calibrations.find((c) => String(c.id) === calibration.selectedProfileId);
  const safeCal = useMemo(() => extractCalibrationSafely(activeCal), [activeCal]);

  return (
    <section aria-label="Nível 3: Avaliação detalhada exclusivamente por perfis" className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-soft space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-[#114037]">Nível 3 · Avaliação Detalhada por Perfis</h2>
          <p className="text-xs text-slate-600">Usa exclusivamente perfis guardados (Cultura → Equipamento → Bico → Calibração), sem inputs manuais concorrentes.</p>
        </div>
        <button type="button" onClick={onSwitchToQuickManual} className="touch-target px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-[#114037] text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer">
          <Copy className="w-3.5 h-3.5" aria-hidden="true" /><span>Mudar para Avaliação Rápida Manual</span>
        </button>
      </div>

      {!userId ? (
        <div role="alert" className="rounded-2xl bg-amber-50 border border-amber-300 p-4 text-xs font-bold text-amber-950">
          Inicie sessão para aceder aos perfis guardados da sua exploração ou mude para Avaliação Rápida Manual.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="rounded-2xl border border-slate-200 p-3 space-y-2 bg-slate-50/60">
            <div className="flex items-center justify-between"><label htmlFor="ird-p3-cult" className="text-xs font-extrabold text-slate-900">1. Cultura</label><Link to="/definicoes?tab=cultura" className="text-[11px] font-bold text-[#114037] inline-flex items-center gap-1 underline">Definições <ExternalLink className="w-3 h-3" /></Link></div>
            <select id="ird-p3-cult" value={culture.selectedProfileId} onChange={(e) => onChangeCulture({ ...culture, mode: 'profile', selectedProfileId: e.target.value })} className="touch-target w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900">
              <option value="">{cultures.length ? '-- Selecionar cultura --' : 'Sem perfis de cultura'}</option>
              {cultures.map((c) => <option key={c.id} value={String(c.id)}>{c.name} · {c.crop_type}</option>)}
            </select>
            {activeCult && (
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <button type="button" aria-expanded={cultOpen} aria-controls="ird-p3-cult-acc" onClick={toggleCult} className="touch-target w-full px-3 py-2 flex items-center justify-between text-left text-[11px] font-bold text-[#114037] hover:bg-slate-50 cursor-pointer">
                  <span>Cultura, estádio e geometria (leitura)</span>
                  {cultOpen ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
                </button>
                {cultOpen && (
                  <div id="ird-p3-cult-acc" className="px-3 pb-2.5 pt-1 border-t border-slate-100 text-[11px] text-slate-700 space-y-0.5">
                    <div><strong>Cultura:</strong> {activeCult.crop_type}{activeCult.variety ? ` (${activeCult.variety})` : ''}</div>
                    {activeCult.phenological_stage && <div><strong>Estádio:</strong> {activeCult.phenological_stage}</div>}
                    {activeCult.training_system && <div><strong>Condução:</strong> {activeCult.training_system}</div>}
                    {(activeCult.row_distance_m || activeCult.canopy_height_m || activeCult.canopy_width_m) && (
                      <div><strong>Geometria:</strong> entrelinha {activeCult.row_distance_m ?? '—'} m · copa {activeCult.canopy_height_m ?? '—'} × {activeCult.canopy_width_m ?? '—'} m</div>
                    )}
                    <div className="text-[10px] text-slate-500">Apenas informativo; cobertura/copa ainda não entra no cálculo IRD v1.0.0 (TODO futuro).</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 p-3 space-y-2 bg-slate-50/60">
            <div className="flex items-center justify-between"><label htmlFor="ird-p3-eq" className="text-xs font-extrabold text-slate-900">2. Equipamento</label><Link to="/definicoes?tab=equipamento" className="text-[11px] font-bold text-[#114037] inline-flex items-center gap-1 underline">Definições <ExternalLink className="w-3 h-3" /></Link></div>
            <select id="ird-p3-eq" value={equipment.selectedProfileId} onChange={(e) => onChangeEquipment({ ...equipment, mode: 'profile', selectedProfileId: e.target.value })} className="touch-target w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900">
              <option value="">{equipments.length ? '-- Selecionar equipamento --' : 'Sem perfis de equipamento'}</option>
              {equipments.map((eq) => <option key={eq.id} value={String(eq.id)}>{eq.name}{eq.distribution_type ? ` (${eq.distribution_type})` : ''}</option>)}
            </select>
            {activeEq && mappedEq && <div className="text-[11px] text-slate-700">Domínio: {DOMAIN_PT[mappedEq.applicationDomain]} · Altura barra: {mappedEq.defaultHeightM ? `${mappedEq.defaultHeightM} m` : 'não definida'} · Ar: {AIR_PT[mappedEq.airAssistStatus]}</div>}
          </div>

          <div className="rounded-2xl border border-slate-200 p-3 space-y-2 bg-slate-50/60">
            <div className="flex items-center justify-between"><label htmlFor="ird-p3-noz" className="text-xs font-extrabold text-slate-900">3. Bico</label><Link to="/definicoes?tab=bicos" className="text-[11px] font-bold text-[#114037] inline-flex items-center gap-1 underline">Definições <ExternalLink className="w-3 h-3" /></Link></div>
            <select id="ird-p3-noz" value={nozzle.selectedProfileId} onChange={(e) => onChangeNozzle({ ...nozzle, mode: 'profile', selectedProfileId: e.target.value, profileConfirmedCatalogId: '' })} className="touch-target w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900">
              <option value="">{profileNozzles.length ? '-- Selecionar bico --' : 'Sem perfis de bicos'}</option>
              {profileNozzles.map((n) => <option key={n.id} value={String(n.id)}>{n.manufacturer} {n.model}</option>)}
            </select>
            {activeNoz && nozMatch.status !== 'exact' && nozMatch.candidates.length > 0 && (
              <select aria-label="Confirmar variante exata do bico" value={nozzle.profileConfirmedCatalogId} onChange={(e) => onChangeNozzle({ ...nozzle, profileConfirmedCatalogId: e.target.value })} className="touch-target w-full rounded-xl border border-amber-300 bg-amber-50 px-3 text-xs font-semibold text-amber-950">
                <option value="">-- Confirmar variante ({nozMatch.candidates.length}) --</option>
                {nozMatch.candidates.map((c) => <option key={c.id} value={c.id}>{c.brand} {c.modelNorm}</option>)}
              </select>
            )}
            {activeNoz && nozMatch.status === 'none' && (
              <p role="status" className="text-[11px] font-semibold text-amber-950 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1.5">
                Estado: none — &quot;{nozMatch.rawLabel}&quot; sem correspondência no catálogo local. Edite o perfil ou use Avaliação Rápida Manual.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 p-3 space-y-2 bg-slate-50/60">
            <div className="flex items-center justify-between"><label htmlFor="ird-p3-cal" className="text-xs font-extrabold text-slate-900">4. Calibração</label><Link to="/definicoes?tab=calibracao" className="text-[11px] font-bold text-[#114037] inline-flex items-center gap-1 underline">Definições <ExternalLink className="w-3 h-3" /></Link></div>
            <select id="ird-p3-cal" value={calibration.selectedProfileId} onChange={(e) => onChangeCalibration({ ...calibration, mode: 'profile', selectedProfileId: e.target.value })} className="touch-target w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900">
              <option value="">{calibrations.length ? '-- Selecionar calibração --' : 'Sem perfis de calibração'}</option>
              {calibrations.map((c) => <option key={c.id} value={String(c.id)}>{c.equipment_name || `#${c.id}`} · {c.working_pressure_bar} bar · {c.working_speed_kmh} km/h</option>)}
            </select>
            {safeCal && <div className="text-[11px] text-slate-700">Pressão: {safeCal.workingPressureBar ?? '—'} bar · Vel.: {safeCal.workingSpeedKmh ?? '—'} km/h{safeCal.legacyDropletNotePt ? ' · Gota legada informativa (não convertida)' : ''}</div>}
          </div>
        </div>
      )}

      {blockingGapsPt.length > 0 && (
        <div role="alert" className="rounded-2xl bg-amber-50 border border-amber-300 p-3.5 text-xs text-amber-950 space-y-1">
          <div className="font-extrabold flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" /><span>Lacunas para concluir o Nível 3 exclusivamente por perfis:</span></div>
          {blockingGapsPt.map((g, i) => <p key={i}>• {g}</p>)}
        </div>
      )}

      <div role="note" className="rounded-2xl bg-slate-100 border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 flex items-start gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#114037]" aria-hidden="true" />
        <span><strong>Exposição em modo conservador:</strong> a exposição está a ser tratada de forma conservadora porque não existem dados da aplicação do dia nos perfis guardados (TODO evolução futura); não são inventadas distâncias.</span>
      </div>
    </section>
  );
};

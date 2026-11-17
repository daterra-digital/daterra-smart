import React from 'react';
import type { ProfileCulture, ProfileEquipment } from '../../db/types.ts';
import type { IrdApplicationDomain } from './irdTypes.ts';
import type { IrdCultureBlockState, IrdEquipmentBlockState, IrdTriStateStatus } from './irdOriginTypes.ts';
import { mapEquipmentProfileToIrd } from './irdProfileMappers.ts';
import { IrdAccordionItem } from './IrdAccordionItem.tsx';
import { IrdOriginToggle } from './IrdOriginToggle.tsx';

interface IrdCultureEquipSectionProps {
  readonly openAccordion: string | null;
  readonly onToggleAccordion: (id: string) => void;
  readonly userId: string | null;
  readonly cultures: readonly ProfileCulture[];
  readonly equipments: readonly ProfileEquipment[];
  readonly culture: IrdCultureBlockState;
  readonly equipment: IrdEquipmentBlockState;
  readonly onChangeCulture: (next: IrdCultureBlockState) => void;
  readonly onCopyCultureToManual: () => void;
  readonly onChangeEquipment: (next: IrdEquipmentBlockState) => void;
  readonly onCopyEquipmentToManual: () => void;
}

const DOMAIN_FAMILIES: ReadonlyArray<{ id: IrdApplicationDomain; label: string; hint: string }> = [
  { id: 'horizontal_boom', label: 'Culturas baixas — pulverizador de barras', hint: 'Herdade, cereais, hortícolas e culturas herbáceas' },
  { id: 'orchard_airblast', label: 'Culturas arbóreas e arbustivas — pulverizador dirigido à copa', hint: 'Vinha, olival, pomar de frutos e arbustivas' },
  { id: 'manual_lance', label: 'Aplicação manual — pulverizador de lança ou pistola', hint: 'Pulverização localizada ou costal com lança/pistola' }
];

const AIR_LABELS: Record<IrdTriStateStatus, string> = { yes: 'Sim', no: 'Não', unknown: 'Não sei' };

export const IrdCultureEquipSection: React.FC<IrdCultureEquipSectionProps> = ({
  openAccordion, onToggleAccordion, userId, cultures, equipments,
  culture, equipment, onChangeCulture, onCopyCultureToManual, onChangeEquipment, onCopyEquipmentToManual
}) => {
  const activeCult = culture.mode === 'profile' ? cultures.find((c) => String(c.id) === culture.selectedProfileId) : undefined;
  const activeEq = equipment.mode === 'profile' ? equipments.find((e) => String(e.id) === equipment.selectedProfileId) : undefined;
  const mappedEq = mapEquipmentProfileToIrd(activeEq);

  const cultSummary = culture.mode === 'profile'
    ? (activeCult ? `${activeCult.name} (Perfil · ${activeCult.crop_type})` : 'Perfil não selecionado')
    : (culture.manualLabel.trim() ? `${culture.manualLabel.trim()} (Manual)` : 'Manual (opcional)');

  const activeFamLabel = DOMAIN_FAMILIES.find((d) => d.id === (equipment.mode === 'profile' ? (mappedEq?.applicationDomain ?? 'horizontal_boom') : equipment.manual.applicationDomain))?.label ?? 'Equipamento';
  const eqSummary = equipment.mode === 'profile'
    ? (activeEq ? `${activeEq.name} (Perfil)` : 'Perfil não selecionado')
    : `${activeFamLabel.split(' — ')[0]} (Manual)`;

  const activeDomain = equipment.manual.applicationDomain;

  return (
    <>
      <IrdAccordionItem id="cultura" title="1. Cultura" badgeLabel="Apenas informativo" summary={cultSummary} isOpen={openAccordion === 'cultura'} onToggle={() => onToggleAccordion('cultura')}>
        <IrdOriginToggle
          blockId="Cultura" mode={culture.mode} hasProfiles={cultures.length > 0} isLoggedIn={Boolean(userId)}
          canCopyToManual={Boolean(activeCult)} emptyText="Sem perfis de cultura guardados." settingsTab="cultura"
          onChangeMode={(mode) => onChangeCulture({ ...culture, mode })} onCopyToManual={onCopyCultureToManual}
        />
        {culture.mode === 'profile' ? (
          cultures.length > 0 && (
            <div className="space-y-2">
              <label htmlFor="ird-culture-profile" className="block text-xs font-bold text-slate-700">Perfil de cultura guardado</label>
              <select id="ird-culture-profile" value={culture.selectedProfileId} onChange={(e) => onChangeCulture({ ...culture, selectedProfileId: e.target.value })} className="touch-target w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs sm:text-sm font-semibold text-slate-900">
                <option value="">-- Selecione um perfil guardado --</option>
                {cultures.map((c) => <option key={c.id} value={String(c.id)}>{c.name} · {c.crop_type}</option>)}
              </select>
              {activeCult && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700">
                  <strong>Resumo (só leitura):</strong> {activeCult.name} · {activeCult.crop_type}{activeCult.variety ? ` (${activeCult.variety})` : ''}{activeCult.phenological_stage ? ` · ${activeCult.phenological_stage}` : ''}
                </div>
              )}
            </div>
          )
        ) : (
          <div>
            <label htmlFor="ird-culture-manual" className="block text-xs font-bold text-slate-700 mb-1">Identificação da cultura / parcela (opcional)</label>
            <input id="ird-culture-manual" type="text" value={culture.manualLabel} onChange={(e) => onChangeCulture({ ...culture, manualLabel: e.target.value })} placeholder="Ex: Olival encosta norte" className="touch-target w-full rounded-xl border border-slate-300 bg-white px-3 text-xs sm:text-sm font-medium text-slate-900" />
          </div>
        )}
        <p className="text-[11px] text-slate-600">Campo descritivo para o histórico; não altera a pontuação IRD nem substitui a caracterização de exposição e zonas sensíveis, que varia por parcela e operação.</p>
      </IrdAccordionItem>

      <IrdAccordionItem id="equipamento" title="2. Equipamento" badgeLabel="Influencia IRD" summary={eqSummary} isOpen={openAccordion === 'equipamento'} onToggle={() => onToggleAccordion('equipamento')}>
        <IrdOriginToggle
          blockId="Equipamento" mode={equipment.mode} hasProfiles={equipments.length > 0} isLoggedIn={Boolean(userId)}
          canCopyToManual={Boolean(activeEq)} emptyText="Sem perfis de equipamento guardados." settingsTab="equipamento"
          onChangeMode={(mode) => onChangeEquipment({ ...equipment, mode })} onCopyToManual={onCopyEquipmentToManual}
        />
        {equipment.mode === 'profile' ? (
          equipments.length > 0 && (
            <div className="space-y-2">
              <label htmlFor="ird-equip-profile" className="block text-xs font-bold text-slate-700">Perfil de equipamento guardado</label>
              <select id="ird-equip-profile" value={equipment.selectedProfileId} onChange={(e) => onChangeEquipment({ ...equipment, selectedProfileId: e.target.value })} className="touch-target w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs sm:text-sm font-semibold text-slate-900">
                <option value="">-- Selecione um perfil guardado --</option>
                {equipments.map((eq) => <option key={eq.id} value={String(eq.id)}>{eq.name}{eq.distribution_type ? ` (${eq.distribution_type})` : ''}</option>)}
              </select>
              {activeEq && mappedEq && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs space-y-1 text-slate-800">
                  <div><strong>Resumo (só leitura):</strong> {DOMAIN_FAMILIES.find((d) => d.id === mappedEq.applicationDomain)?.label}</div>
                  {mappedEq.applicationDomain === 'horizontal_boom' && !mappedEq.isAmbiguousDistribution && (
                    <div>Assistência de ar na barra: <strong>{AIR_LABELS[mappedEq.airAssistStatus]}</strong></div>
                  )}
                  {mappedEq.notePt && <p className="text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-2 font-medium">{mappedEq.notePt}</p>}
                </div>
              )}
            </div>
          )
        ) : (
          <div className="space-y-3">
            <div role="radiogroup" aria-label="Família de equipamento de aplicação" className="grid grid-cols-1 gap-2">
              {DOMAIN_FAMILIES.map((fam) => {
                const selected = activeDomain === fam.id;
                return (
                  <button key={fam.id} type="button" role="radio" aria-checked={selected} onClick={() => onChangeEquipment({ ...equipment, manual: { applicationDomain: fam.id, airAssistStatus: 'unknown' } })} className={`touch-target text-left rounded-xl border p-3 cursor-pointer ${selected ? 'border-2 border-[#114037] bg-[#eef8f0]' : 'border-slate-300 bg-white hover:bg-slate-50'}`}>
                    <span className="block text-xs sm:text-sm font-extrabold text-slate-900">{fam.label}</span>
                    <span className="block text-[11px] text-slate-600">{fam.hint}</span>
                  </button>
                );
              })}
            </div>

            {activeDomain !== 'manual_lance' && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                <div className="text-xs font-bold text-slate-800">
                  {activeDomain === 'horizontal_boom' ? 'Assistência de ar na barra (manga ou cortina de ar)' : 'Fluxo / assistência de ar própria na aplicação à copa'}
                </div>
                <div role="radiogroup" aria-label="Estado da assistência de ar" className="flex flex-wrap gap-2">
                  {(['yes', 'no', 'unknown'] as const).map((st) => (
                    <button key={st} type="button" role="radio" aria-checked={equipment.manual.airAssistStatus === st} onClick={() => onChangeEquipment({ ...equipment, manual: { ...equipment.manual, airAssistStatus: st } })} className={`touch-target px-3.5 py-1.5 rounded-xl border text-xs font-extrabold cursor-pointer ${equipment.manual.airAssistStatus === st ? 'bg-[#114037] text-white border-[#114037]' : 'bg-white text-slate-800 border-slate-300'}`}>
                      {AIR_LABELS[st]}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-600">
                  {activeDomain === 'horizontal_boom'
                    ? 'A opção "Não sei" mantém avaliação conservadora sem redução operacional; "Não" confirma ausência de manga de ar.'
                    : 'Fluxo de ventilador/defletores é registado apenas como contexto da copa e não aplica o fator de manga de ar de barras.'}
                </p>
              </div>
            )}
          </div>
        )}
      </IrdAccordionItem>
    </>
  );
};

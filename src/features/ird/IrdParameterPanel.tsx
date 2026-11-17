import React, { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { ProfileCalibration, ProfileCulture, ProfileEquipment, ProfileNozzle } from '../../db/types.ts';
import type { Nozzle } from '../nozzle-comparison/nozzleComparison.types.ts';
import type { ResolvedNozzleDriftProfile } from './irdNozzleAdapter.ts';
import type { AnyIrdKeypadField } from './irdKeypadMeta.ts';
import type {
  IrdCalibrationBlockState,
  IrdCultureBlockState,
  IrdEquipmentBlockState,
  IrdExposureBlockState,
  IrdNozzleBlockState
} from './irdOriginTypes.ts';
import { matchNozzleProfileToCatalog } from './irdProfileMappers.ts';
import { IrdAccordionItem } from './IrdAccordionItem.tsx';
import { IrdOriginToggle } from './IrdOriginToggle.tsx';
import { IrdCultureEquipSection } from './IrdCultureEquipSection.tsx';
import { IrdNozzleCascadeField } from './IrdNozzleCascadeField.tsx';
import { IrdCertifiedReductionPanel } from './IrdCertifiedReductionPanel.tsx';
import { IrdCalibExpositionPanel } from './IrdCalibExpositionPanel.tsx';

interface IrdParameterPanelProps {
  readonly openAccordion: string | null;
  readonly onToggleAccordion: (id: string) => void;
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
  readonly exposure: IrdExposureBlockState;
  readonly calibrationGapsPt: readonly string[];
  readonly resolvedProfile: ResolvedNozzleDriftProfile | null;
  readonly onChangeCulture: (next: IrdCultureBlockState) => void;
  readonly onCopyCultureToManual: () => void;
  readonly onChangeEquipment: (next: IrdEquipmentBlockState) => void;
  readonly onCopyEquipmentToManual: () => void;
  readonly onChangeNozzle: (next: IrdNozzleBlockState) => void;
  readonly onCopyNozzleToManual: () => void;
  readonly onChangeCalibration: (next: IrdCalibrationBlockState) => void;
  readonly onCopyCalibrationToManual: () => void;
  readonly onChangeExposure: (next: IrdExposureBlockState) => void;
  readonly onOpenKeypad: (field: AnyIrdKeypadField) => void;
}

export const IrdParameterPanel: React.FC<IrdParameterPanelProps> = (p) => {
  const activeProfNoz = p.nozzle.mode === 'profile'
    ? p.profileNozzles.find((n) => String(n.id) === p.nozzle.selectedProfileId)
    : undefined;
  const nozzleMatch = useMemo(() => matchNozzleProfileToCatalog(activeProfNoz, p.catalogNozzles), [activeProfNoz, p.catalogNozzles]);

  const resolvedCatNozzle = useMemo(() => {
    if (p.nozzle.mode === 'profile') {
      if (nozzleMatch.status === 'exact') return nozzleMatch.matchedNozzle;
      return p.nozzle.profileConfirmedCatalogId ? p.catalogNozzles.find((n) => n.id === p.nozzle.profileConfirmedCatalogId) : undefined;
    }
    return p.nozzle.manualCascade.catalogNozzleId ? p.catalogNozzles.find((n) => n.id === p.nozzle.manualCascade.catalogNozzleId) : undefined;
  }, [p.nozzle, nozzleMatch, p.catalogNozzles]);

  const nozzleSummary = resolvedCatNozzle
    ? `${resolvedCatNozzle.brand} ${resolvedCatNozzle.modelNorm} (${p.nozzle.mode === 'profile' ? 'Perfil' : 'Manual'})`
    : activeProfNoz
      ? `${activeProfNoz.manufacturer} ${activeProfNoz.model} (Confirmar)`
      : 'Fallback conservador (sem seleção)';

  return (
    <section aria-label="Contexto operacional progressivo" className="bg-white rounded-3xl border border-slate-200 shadow-soft divide-y divide-slate-200 overflow-hidden">
      <IrdCultureEquipSection
        openAccordion={p.openAccordion} onToggleAccordion={p.onToggleAccordion} userId={p.userId}
        cultures={p.cultures} equipments={p.equipments} culture={p.culture} equipment={p.equipment}
        onChangeCulture={p.onChangeCulture} onCopyCultureToManual={p.onCopyCultureToManual}
        onChangeEquipment={p.onChangeEquipment} onCopyEquipmentToManual={p.onCopyEquipmentToManual}
      />

      <IrdAccordionItem id="bico" title="3. Bico" badgeLabel="Influencia IRD" summary={nozzleSummary} isOpen={p.openAccordion === 'bico'} onToggle={() => p.onToggleAccordion('bico')}>
        <IrdOriginToggle
          blockId="Bico" mode={p.nozzle.mode} hasProfiles={p.profileNozzles.length > 0} isLoggedIn={Boolean(p.userId)}
          canCopyToManual={Boolean(activeProfNoz)} emptyText="Sem perfis de bicos guardados." settingsTab="bicos"
          onChangeMode={(mode) => p.onChangeNozzle({ ...p.nozzle, mode })} onCopyToManual={p.onCopyNozzleToManual}
        />

        {p.nozzle.mode === 'profile' ? (
          p.profileNozzles.length > 0 && (
            <div className="space-y-2.5">
              <label htmlFor="ird-profile-nozzle" className="block text-xs font-bold text-slate-700">Perfil de bico guardado</label>
              <select
                id="ird-profile-nozzle" value={p.nozzle.selectedProfileId}
                onChange={(e) => p.onChangeNozzle({ ...p.nozzle, selectedProfileId: e.target.value, profileConfirmedCatalogId: '' })}
                className="touch-target w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs sm:text-sm font-semibold text-slate-900"
              >
                <option value="">-- Selecione um perfil guardado --</option>
                {p.profileNozzles.map((n) => <option key={n.id} value={String(n.id)}>{n.manufacturer} {n.model} ({n.nozzle_type})</option>)}
              </select>

              {activeProfNoz && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-800 space-y-1">
                  <div><strong>Resumo (só leitura):</strong> {activeProfNoz.manufacturer} {activeProfNoz.model} · {activeProfNoz.nozzle_type} · {activeProfNoz.color || 'Cor N/D'}</div>
                  {nozzleMatch.status === 'exact' && nozzleMatch.matchedNozzle && (
                    <div className="text-[#114037] font-bold">Correspondência única no catálogo local: {nozzleMatch.matchedNozzle.brand} {nozzleMatch.matchedNozzle.modelNorm}</div>
                  )}
                </div>
              )}

              {activeProfNoz && nozzleMatch.status !== 'exact' && (
                <div className="space-y-2">
                  <div role="alert" className="rounded-xl bg-amber-50 border border-amber-300 p-3 text-xs text-amber-950 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Correspondência ambígua ou inexistente no catálogo local para "{nozzleMatch.rawLabel}" ({nozzleMatch.candidates.length} candidato(s)): confirme abaixo ou copie para introdução manual.</span>
                  </div>
                  {nozzleMatch.candidates.length > 0 && (
                    <div>
                      <label htmlFor="ird-profile-confirm-cat" className="block text-xs font-bold text-slate-700 mb-1">Confirmar variante exata do perfil</label>
                      <select
                        id="ird-profile-confirm-cat" value={p.nozzle.profileConfirmedCatalogId}
                        onChange={(e) => p.onChangeNozzle({ ...p.nozzle, profileConfirmedCatalogId: e.target.value })}
                        className="touch-target w-full rounded-xl border border-amber-300 bg-white px-3 text-xs font-semibold text-slate-900"
                      >
                        <option value="">-- Pendente de confirmação (usar fallback conservador) --</option>
                        {nozzleMatch.candidates.map((c) => <option key={c.id} value={c.id}>{c.brand} {c.modelNorm} ({c.nozzleType})</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        ) : (
          <IrdNozzleCascadeField
            cascade={p.nozzle.manualCascade} catalog={p.catalogNozzles}
            onChangeCascade={(updater) => p.onChangeNozzle({ ...p.nozzle, manualCascade: typeof updater === 'function' ? updater(p.nozzle.manualCascade) : updater })}
          />
        )}

        <IrdCertifiedReductionPanel
          value={p.nozzle.certifiedReduction}
          onChange={(patch) => p.onChangeNozzle({ ...p.nozzle, certifiedReduction: { ...p.nozzle.certifiedReduction, ...patch } })}
          onOpenKeypad={p.onOpenKeypad}
        />
      </IrdAccordionItem>

      <IrdCalibExpositionPanel
        openAccordion={p.openAccordion} onToggleAccordion={p.onToggleAccordion} userId={p.userId}
        calibrations={p.calibrations} calibration={p.calibration} exposure={p.exposure}
        calibrationGapsPt={p.calibrationGapsPt} resolvedProfile={p.resolvedProfile}
        onChangeCalibration={p.onChangeCalibration} onCopyCalibrationToManual={p.onCopyCalibrationToManual}
        onChangeExposure={p.onChangeExposure} onOpenKeypad={p.onOpenKeypad}
      />
    </section>
  );
};

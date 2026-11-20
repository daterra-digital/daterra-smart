// src/features/perfis/components/CultureMeasurementsAccordion.tsx
// Cartão Bento 5 ("Medições de vegetação e compatibilidade") + formulário para o Editor Focado (<= 200 LOC).

import React from 'react';
import { AlertTriangle, Pencil, Ruler } from 'lucide-react';
import type { CanopyDensityTierId, CanopyThicknessTierId, ProfileCropMoment } from '../../../db/types.ts';
import type { CultureMomentDraftState, CultureV11FormState } from '../services/cultureFormState';
import type { CultureKeypadField } from '../services/cultureKeypadHelpers';
import { evaluateCultureMomentMetrics } from '../services/cultureEngineCompatibility';
import { DENSITY_3D_OPTIONS, TARGET_2D_OPTIONS, THICKNESS_3D_OPTIONS } from '../data/cultureGeometryOptions';
import { CultureGeometryPanel } from './CultureGeometryPanel';
import { SearchableRoundedDropdown } from './SearchableRoundedDropdown';
import { NumericKeypadField } from './NumericKeypadField';

export type MeasurementKeypadField = CultureKeypadField;

export interface CultureMeasurementsAccordionProps {
  mode?: 'card' | 'editor';
  form: CultureV11FormState;
  activeMoment?: ProfileCropMoment;
  momentDraft: CultureMomentDraftState;
  hasPendingCustomOption: boolean;
  fieldErrors: Record<string, string>;
  onEditMeasurements?: () => void;
  onOpenKeypad: (field: MeasurementKeypadField) => void;
  onClearFormField: (field: 'rowDistance') => void;
  onUpdateMoment: (patch: Partial<CultureMomentDraftState>) => void;
  onUpdateForm?: (patch: Partial<CultureV11FormState>) => void;
}

const parsePos = (v: string): number | undefined => {
  const n = Number(v.trim().replace(',', '.'));
  return v.trim() && Number.isFinite(n) && n > 0 ? n : undefined;
};

const THICKNESS_LABELS: Record<CanopyThicknessTierId, string> = {
  estreita: 'Estreita (< 0,50 m)',
  media: 'Média (0,50 a 0,80 m)',
  larga: 'Larga (> 0,80 m)'
};

export const CultureMeasurementsAccordion: React.FC<CultureMeasurementsAccordionProps> = ({
  mode = 'card', form, activeMoment, momentDraft, hasPendingCustomOption, fieldErrors,
  onEditMeasurements, onOpenKeypad, onClearFormField, onUpdateMoment, onUpdateForm
}) => {
  const rowDistanceM = parsePos(form.rowDistance);
  const canopyHeightM = mode === 'editor' ? parsePos(momentDraft.canopyHeight) : (activeMoment?.canopyHeightM ?? parsePos(momentDraft.canopyHeight));
  const canopyWidthM = mode === 'editor' ? parsePos(momentDraft.canopyWidth) : (activeMoment?.canopyWidthM ?? parsePos(momentDraft.canopyWidth));
  const laiVal = mode === 'editor' ? parsePos(momentDraft.lai) : (activeMoment?.lai ?? parsePos(momentDraft.lai));
  const densityVal = mode === 'editor' ? momentDraft.densityTier : (activeMoment?.densityTier ?? momentDraft.densityTier);
  const thicknessVal = mode === 'editor' ? momentDraft.thicknessTierManual : (activeMoment?.thicknessTierManual ?? momentDraft.thicknessTierManual);

  const metrics = evaluateCultureMomentMetrics({
    rowDistanceM, canopyHeightM, canopyWidthM,
    cultureKey: form.cropKey, conductionKey: form.conductionOptionId, hasPendingCustomOption
  });

  const eppoBanner = (metrics.lwaBilateral !== null || metrics.trvPure !== null) && (
    <div className="p-4 rounded-2xl bg-[#114037] text-white space-y-2">
      <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono-numbers">
        {metrics.lwaBilateral !== null && (
          <span className="px-2.5 py-1 rounded-xl bg-white/10">LWA: <strong>{metrics.lwaBilateral.toLocaleString('pt-PT')} m²/ha</strong></span>
        )}
        {metrics.trvPure !== null && (
          <span className="px-2.5 py-1 rounded-xl bg-white/10">TRV: <strong>{metrics.trvPure.toLocaleString('pt-PT')} m³/ha</strong></span>
        )}
        {metrics.recommendedSprayVolumeLHa !== null && (
          <span className="px-2.5 py-1 rounded-xl bg-[#3CA64C] text-white font-extrabold">
            Volume Calda Recomendado EPPO: {metrics.recommendedSprayVolumeLHa.toLocaleString('pt-PT')} L/ha
            {metrics.recommendedSprayVolumeMinLHa && metrics.recommendedSprayVolumeMaxLHa
              ? ` (${metrics.recommendedSprayVolumeMinLHa}–${metrics.recommendedSprayVolumeMaxLHa} L/ha)` : ''}
          </span>
        )}
      </div>
      <p className="text-[11px] text-emerald-100">
        As faces tratadas (1 ou 2 faces) e parâmetros operacionais definem-se na calculadora no momento da aplicação.
      </p>
    </div>
  );

  if (mode === 'editor') {
    const isVinhaWithWidth = form.cropKey === 'vinha' && canopyWidthM !== undefined;
    const thickOpt = THICKNESS_3D_OPTIONS.find((o) => o.id === momentDraft.thicknessTierManual);
    const densOpt = DENSITY_3D_OPTIONS.find((o) => o.id === momentDraft.densityTier);
    return (
      <div className="space-y-4">
        <CultureGeometryPanel form={form} fieldErrors={fieldErrors} onUpdate={onUpdateForm ?? (() => {})} onOpenKeypad={onOpenKeypad} />
        {form.geometryMode !== '2D' && (
          <>
            <NumericKeypadField label="Distância entrelinha (m)" value={form.rowDistance} unit="m"
              helperText="Dimensão estrutural da parcela; alterar no futuro não muda momentos anteriores."
              errorMsg={fieldErrors.rowDistance} onOpenKeypad={() => onOpenKeypad('rowDistance')} onClear={() => onClearFormField('rowDistance')} />
            <NumericKeypadField label="Altura da vegetação / copa (m)" value={momentDraft.canopyHeight} unit="m"
              errorMsg={fieldErrors.canopyHeight} onOpenKeypad={() => onOpenKeypad('canopyHeight')} onClear={() => onUpdateMoment({ canopyHeight: '' })} />
            <NumericKeypadField label="Largura / espessura da copa (m)" value={momentDraft.canopyWidth} unit="m"
              errorMsg={fieldErrors.canopyWidth} onOpenKeypad={() => onOpenKeypad('canopyWidth')} onClear={() => onUpdateMoment({ canopyWidth: '' })} />
            {isVinhaWithWidth && metrics.derivedThicknessTier ? (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-[#114037] font-semibold">
                Espessura LWA-V sugerida pela largura medida: <span className="font-black">{THICKNESS_LABELS[metrics.derivedThicknessTier]}</span>
              </div>
            ) : (
              <SearchableRoundedDropdown label="Espessura qualitativa da parede foliar" placeholder="Não indicada"
                value={thickOpt?.label ?? ''} selectedId={momentDraft.thicknessTierManual || ''} options={THICKNESS_3D_OPTIONS}
                onClear={() => onUpdateMoment({ thicknessTierManual: undefined })}
                onSelectOption={(opt) => onUpdateMoment({ thicknessTierManual: opt.id as CanopyThicknessTierId })} />
            )}
            <SearchableRoundedDropdown label="Densidade da copa" placeholder="Não indicada"
              value={densOpt?.label ?? ''} selectedId={momentDraft.densityTier || ''} options={DENSITY_3D_OPTIONS}
              onClear={() => onUpdateMoment({ densityTier: undefined })}
              onSelectOption={(opt) => onUpdateMoment({ densityTier: opt.id as CanopyDensityTierId })} />
            <NumericKeypadField label="Índice de Área Foliar (LAI)" value={momentDraft.lai} helperText="Opcional."
              errorMsg={fieldErrors.lai} onOpenKeypad={() => onOpenKeypad('lai')} onClear={() => onUpdateMoment({ lai: '' })} />
            {eppoBanner}
          </>
        )}
      </div>
    );
  }

  const hasParcel = Boolean(form.editingCultureId || form.cropKey || form.name);
  const effThickness = thicknessVal ?? metrics.derivedThicknessTier;
  const h2d = Number(form.cropHeight2dCm.trim().replace(',', '.'));
  const boomTargetCm = form.cropHeight2dCm.trim() && Number.isFinite(h2d) && h2d > 0 ? Math.round(h2d + 50) : null;
  const cells = form.geometryMode === '2D'
    ? [
        { label: 'Modo', value: '2D (Arvense / Hortícola)' },
        { label: 'Altura média', value: form.cropHeight2dCm ? `${form.cropHeight2dCm} cm` : 'Não medida' },
        { label: 'Altura barra alvo', value: boomTargetCm !== null ? `${boomTargetCm} cm` : 'H + 50 cm' },
        { label: 'Cobertura / IAF', value: form.groundCover2dPct ? `${form.groundCover2dPct}%` : 'Não indicada' },
        { label: 'Alvo', value: TARGET_2D_OPTIONS.find((o) => o.id === form.applicationTarget2d)?.label || 'Não indicado' },
        { label: 'Volume ref. 2D', value: form.referenceVolume2dLha ? `${form.referenceVolume2dLha} L/ha` : 'Não indicado' }
      ]
    : [
        { label: 'Entrelinha', value: rowDistanceM !== undefined ? `${String(rowDistanceM).replace('.', ',')} m` : 'Não indicada' },
        { label: 'Altura copa', value: canopyHeightM !== undefined ? `${String(canopyHeightM).replace('.', ',')} m` : 'Não medida' },
        { label: 'Largura copa', value: canopyWidthM !== undefined ? `${String(canopyWidthM).replace('.', ',')} m` : 'Não medida' },
        { label: 'Espessura', value: effThickness ? THICKNESS_LABELS[effThickness] : 'Não indicada' },
        { label: 'Densidade', value: densityVal ? densityVal.charAt(0).toUpperCase() + densityVal.slice(1) : 'Não indicada' },
        { label: 'LAI', value: laiVal !== undefined ? String(laiVal).replace('.', ',') : 'Não indicado' }
      ];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-soft border border-slate-200 flex flex-col justify-between space-y-4 h-full">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Ruler className="w-4 h-4 text-[#1D734B] shrink-0" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#114037]">Medições de vegetação e compatibilidade</h4>
              <p className="text-[11px] text-slate-500">Entrelinha, dimensões do momento ativo e índices EPPO</p>
            </div>
          </div>
          {onEditMeasurements && (
            <button type="button" disabled={!hasParcel} onClick={onEditMeasurements}
              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold text-[#114037] flex items-center gap-1 shrink-0 disabled:opacity-40">
              <Pencil className="w-3.5 h-3.5 text-[#1D734B]" />
              <span>Editar</span>
            </button>
          )}
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono-numbers">
          {cells.map((c) => (
            <div key={c.label} className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
              <dt className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">{c.label}</dt>
              <dd className="font-bold text-slate-800 break-words leading-snug mt-0.5">{c.value}</dd>
            </div>
          ))}
        </dl>
        {eppoBanner}
        {metrics.warnings.length > 0 && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
            {metrics.warnings.map((w, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] font-semibold text-amber-950">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

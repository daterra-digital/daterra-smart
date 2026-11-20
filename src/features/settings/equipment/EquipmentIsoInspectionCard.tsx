// src/features/settings/equipment/EquipmentIsoInspectionCard.tsx
import React from 'react';
import { AlertTriangle, CheckCircle2, Pencil, ShieldCheck } from 'lucide-react';
import type { EquipmentRecord } from '../../../schemas/equipment.schema.ts';
import { evaluateEquipmentIppStatus } from '../../../lib/equipment-ipp-rules.ts';
import { formatIsoCivilToDdMmYyyy } from '../../perfis/services/cultureDateUtils.ts';

export interface EquipmentIsoInspectionCardProps {
  equipment?: EquipmentRecord;
  countryCode?: string;
  onEdit: () => void;
}

function summarizePump(eq?: EquipmentRecord): string {
  if (!eq) return '—';
  const pf = eq.pumpAndFilters;
  const parts = [pf?.pumpManufacturer, pf?.pumpModel, pf?.pumpType].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : 'Não indicada';
}

function summarizeControls(eq?: EquipmentRecord): string {
  if (!eq) return '—';
  const ctrl = eq.controlsAndRegulation;
  const parts = [
    ctrl?.commandManufacturer,
    ctrl?.commandModel,
    ctrl?.sectionsCount ? `${ctrl.sectionsCount} secções` : ''
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : 'Não indicados';
}

function summarizeManometer(eq?: EquipmentRecord): string {
  if (!eq) return '—';
  const m = eq.manometer;
  const typeLabel = m?.manometerType === 'DIGITAL' ? 'Digital' : 'Analógico';
  const parts = [
    typeLabel,
    m?.manometerType !== 'DIGITAL' && m?.diameterMm ? `Ø ${m.diameterMm} mm` : '',
    m?.maxScaleValueBar
      ? `máx. ${String(m.maxScaleValueBar).replace('.', ',')} bar`
      : m?.maxPressureBar
        ? `máx. ${String(m.maxPressureBar).replace('.', ',')} bar`
        : ''
  ].filter(Boolean);
  return parts.join(' · ');
}

export const EquipmentIsoInspectionCard: React.FC<EquipmentIsoInspectionCardProps> = ({
  equipment,
  countryCode = 'PT',
  onEdit
}) => {
  const hasEq = Boolean(equipment);
  const ipp = equipment ? evaluateEquipmentIppStatus(equipment, { countryCode }) : null;
  const rawDate = equipment?.iso16122Inspection.lastInspectionDate || null;
  const dateDisplay = rawDate
    ? `${formatIsoCivilToDdMmYyyy(rawDate.slice(0, 10))}${ipp?.dueMonthYear ? ` (válida até ${ipp.dueMonthYear})` : ''}`
    : ipp?.status === 'YEAR_ALERT' && equipment?.manufactureYear
      ? `Não registada (Ano ${equipment.manufactureYear})`
      : 'Não registada';

  const cells = [
    { label: 'Bomba', value: summarizePump(equipment) },
    { label: 'Comandos', value: summarizeControls(equipment) },
    { label: 'Manómetro', value: summarizeManometer(equipment) },
    { label: 'Última inspeção IPP', value: hasEq ? dateDisplay : '—' }
  ];

  const bannerColors =
    ipp?.badgeTone === 'emerald'
      ? 'bg-emerald-50/80 border-emerald-200 text-[#114037]'
      : ipp?.badgeTone === 'rose'
        ? 'bg-rose-50/80 border-rose-200 text-rose-900'
        : 'bg-amber-50/80 border-amber-200 text-amber-900';

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-soft border border-slate-200 flex flex-col justify-between space-y-3 h-full">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShieldCheck className="w-4 h-4 text-[#1D734B] shrink-0" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#114037]">
                Características do Pulverizador
              </h4>
              <p className="text-[11px] text-slate-500">
                Bomba, comandos, manómetro e inspeção
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={!hasEq}
            onClick={onEdit}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold text-[#114037] flex items-center gap-1 shrink-0 disabled:opacity-40"
          >
            <Pencil className="w-3.5 h-3.5 text-[#1D734B]" />
            <span>Editar</span>
          </button>
        </div>

        {equipment && ipp && (
          <div className={`px-3 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold ${bannerColors}`}>
            {ipp.badgeTone === 'emerald' ? (
              <CheckCircle2 className="w-4 h-4 text-[#3CA64C] shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{ipp.summaryMessage}</span>
          </div>
        )}

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {cells.map((c) => (
            <div key={c.label} className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {c.label}
              </dt>
              <dd className="font-bold text-slate-900 break-words leading-snug mt-0.5">
                {c.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

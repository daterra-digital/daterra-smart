// src/features/settings/equipment/EquipmentIdentificationCard.tsx
import React from 'react';
import { Layers, Pencil } from 'lucide-react';
import type { EquipmentRecord } from '../../../schemas/equipment.schema.ts';
import { EQUIPMENT_TYPE_META } from './equipmentFormHelpers.ts';

export interface EquipmentIdentificationCardProps {
  equipment?: EquipmentRecord;
  onEdit: () => void;
}

function formatAuxiliaryTanks(eq?: EquipmentRecord): string {
  if (!eq) return '—';
  const list: string[] = [];
  if (eq.handWashTank) list.push('Lava-mãos');
  if (eq.circuitFlushTank) list.push('Lava-circuitos');
  if (eq.chemicalInductor) list.push('Incorporador');
  return list.length > 0 ? list.join(' · ') : 'Não configurados';
}

export const EquipmentIdentificationCard: React.FC<EquipmentIdentificationCardProps> = ({
  equipment,
  onEdit
}) => {
  const hasEq = Boolean(equipment);
  const typeMeta = equipment ? EQUIPMENT_TYPE_META[equipment.type] : undefined;
  const brandModel =
    [equipment?.manufacturer, equipment?.model].filter(Boolean).join(' · ') || 'Não indicado';
  const serialYear =
    [
      equipment?.serialNumber,
      equipment?.manufactureYear !== undefined ? String(equipment.manufactureYear) : undefined
    ]
      .filter(Boolean)
      .join(' · ') || 'Não indicado';

  const items = [
    { label: 'Nome / Referência', value: equipment?.name || '—' },
    { label: 'Tipologia', value: typeMeta ? `${typeMeta.badge} · ${typeMeta.label}` : '—' },
    { label: 'Fabricante · Modelo', value: hasEq ? brandModel : '—' },
    { label: 'Nº Série · Ano', value: hasEq ? serialYear : '—' },
    {
      label: 'Capacidade depósito (L)',
      value: equipment ? `${equipment.tankCapacityL.toLocaleString('pt-PT')} L` : '—'
    },
    { label: 'Depósitos auxiliares', value: formatAuxiliaryTanks(equipment) }
  ];

  const associatedNozzles = equipment?.associatedNozzleIds ?? [];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-soft border border-slate-200 flex flex-col justify-between space-y-3 h-full">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Layers className="w-4 h-4 text-[#1D734B] shrink-0" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#114037]">
                Identificação da máquina
              </h4>
              <p className="text-[11px] text-slate-500">
                Referência, fabricante, capacidade do depósito e bicos associados
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

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {items.map((it) => (
            <div key={it.label} className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {it.label}
              </dt>
              <dd className="font-bold text-slate-900 break-words leading-snug mt-0.5">
                {it.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Bicos associados ({associatedNozzles.length})
          </span>
          {associatedNozzles.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {associatedNozzles.map((nz) => (
                <span
                  key={nz}
                  className="px-2.5 py-1 rounded-lg bg-[#114037] text-white text-[11px] font-bold"
                >
                  {nz}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs font-semibold text-slate-500">
              Nenhum bico associado na ficha desta máquina.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

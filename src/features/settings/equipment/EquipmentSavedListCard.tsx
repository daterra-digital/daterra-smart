// src/features/settings/equipment/EquipmentSavedListCard.tsx
import React from 'react';
import { BookOpen, CheckCircle2, PlusCircle, Trash2, Wrench } from 'lucide-react';
import type { EquipmentRecord } from '../../../schemas/equipment.schema.ts';
import { evaluateEquipmentIppStatus, type IppEvaluationResult } from '../../../lib/equipment-ipp-rules.ts';
import { EQUIPMENT_TYPE_META } from './equipmentFormHelpers.ts';

export interface EquipmentSavedListCardProps {
  equipments: EquipmentRecord[];
  selectedId?: string;
  countryCode?: string;
  onOpenGuide: () => void;
  onCreateNew: () => void;
  onSelect: (equipment: EquipmentRecord) => void;
  onDelete: (equipment: EquipmentRecord) => void;
}

const TONE_CLASSES: Record<IppEvaluationResult['badgeTone'], string> = {
  emerald: 'bg-emerald-100 text-[#114037]',
  amber: 'bg-amber-100 text-amber-900',
  rose: 'bg-rose-100 text-rose-800',
  slate: 'bg-slate-200 text-slate-700'
};

export const EquipmentSavedListCard: React.FC<EquipmentSavedListCardProps> = ({
  equipments,
  selectedId,
  countryCode = 'PT',
  onOpenGuide,
  onCreateNew,
  onSelect,
  onDelete
}) => (
  <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-soft border border-slate-200 flex flex-col justify-between space-y-3 h-full">
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-[#114037]">
            Equipamentos guardados ({equipments.length})
          </h4>
          <p className="text-[11px] text-slate-500">
            Toque numa máquina da frota para consultar ou editar
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenGuide}
            className="min-h-[48px] px-4 py-2 rounded-2xl border border-[#114037]/20 bg-emerald-50/70 hover:bg-emerald-50 text-xs font-extrabold text-[#114037] flex items-center gap-2 touch-target"
          >
            <BookOpen className="w-4 h-4 text-[#1D734B]" />
            <span>Guia Técnico</span>
          </button>
          <button
            type="button"
            onClick={onCreateNew}
            className="min-h-[48px] px-4 py-2 rounded-2xl bg-[#114037] hover:bg-[#195a4d] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-2xs touch-target"
          >
            <PlusCircle className="w-4 h-4 text-[#3CA64C]" />
            <span>+ Novo Equipamento</span>
          </button>
        </div>
      </div>

      {equipments.length === 0 ? (
        <div className="py-6 text-center space-y-1.5">
          <p className="text-xs font-semibold text-slate-600">
            Ainda não existem equipamentos registados na frota.
          </p>
          <p className="text-[11px] text-slate-400">
            Utilize o botão &ldquo;+ Novo Equipamento&rdquo; acima para configurar o primeiro pulverizador.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {equipments.map((eq) => {
            const isSelected = selectedId === eq.id;
            const meta = EQUIPMENT_TYPE_META[eq.type] ?? {
              badge: '3D',
              label: eq.type,
              shortLabel: eq.type
            };
            const brandModel = [eq.manufacturer, eq.model].filter(Boolean).join(' · ');
            const details = [
              brandModel,
              `Depósito ${eq.tankCapacityL.toLocaleString('pt-PT')} L`,
              `${String(eq.defaultPressureBar).replace('.', ',')} bar`,
              eq.type === 'MANUAL_LANCE'
                ? `${eq.lanceCount ?? eq.workingWidthM} lança(s)`
                : `${String(eq.defaultSpeedKmh).replace('.', ',')} km/h`
            ]
              .filter(Boolean)
              .join(' • ');
            const ipp = evaluateEquipmentIppStatus(eq, { countryCode });

            return (
              <div
                key={eq.id}
                onClick={() => onSelect(eq)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 ${
                  isSelected
                    ? 'border-[#3CA64C] bg-emerald-50/50 ring-1 ring-[#3CA64C]/40'
                    : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Wrench className="w-3.5 h-3.5 text-[#1D734B] shrink-0" />
                    <span className="font-extrabold text-slate-900 text-xs break-words">
                      {eq.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-[#114037] text-white text-[10px] font-mono-numbers font-bold">
                      {meta.badge} · {meta.shortLabel}
                    </span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full bg-[#114037] text-white text-[10px] font-bold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-[#3CA64C]" />
                        <span>Ativo</span>
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${TONE_CLASSES[ipp.badgeTone]}`}
                    >
                      {ipp.badgeText}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 break-words">{details}</p>
                </div>

                <div
                  className="flex items-center gap-1.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onDelete(eq)}
                    className="min-h-[36px] min-w-[36px] p-1.5 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors flex items-center justify-center"
                    title="Eliminar Equipamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);

// src/features/perfis/components/CultureSavedList.tsx
// Cartão Bento 1 ("Culturas guardadas"): cabeçalho com Guia Técnico + Nova Cultura e listagem em linha única (<= 200 LOC).

import React from 'react';
import { CalendarPlus, CheckCircle2, PlusCircle, Sprout, Trash2 } from 'lucide-react';
import type { ProfileCulture } from '../../../db/types.ts';
import { CultureTechnicalGuideButton } from './CultureCoreFieldsCard';

export interface CultureSavedListProps {
  cultures: ProfileCulture[];
  editingCultureId?: number;
  deleteError?: string;
  onOpenGuide?: () => void;
  onCreateNewCulture?: () => void;
  onEditCulture: (culture: ProfileCulture, openMomentForm?: boolean) => void;
  onDeleteCulture: (culture: ProfileCulture) => void;
}

export const CultureSavedList: React.FC<CultureSavedListProps> = ({
  cultures,
  editingCultureId,
  deleteError,
  onOpenGuide,
  onCreateNewCulture,
  onEditCulture,
  onDeleteCulture
}) => (
  <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-soft border border-slate-200 flex flex-col justify-between space-y-3 h-full">
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-[#114037]">
            Culturas guardadas ({cultures.length})
          </h4>
          <p className="text-[11px] text-slate-500">Toque numa parcela para ver os seus dados</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onOpenGuide && <CultureTechnicalGuideButton onOpenGuide={onOpenGuide} />}
          {onCreateNewCulture && (
            <button
              type="button"
              onClick={onCreateNewCulture}
              className="min-h-[48px] px-4 py-2 rounded-2xl bg-[#114037] hover:bg-[#195a4d] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-2xs touch-target"
            >
              <PlusCircle className="w-4 h-4 text-[#3CA64C]" />
              <span>+ Nova Cultura</span>
            </button>
          )}
        </div>
      </div>

      {deleteError && (
        <div role="alert" className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
          {deleteError}
        </div>
      )}

      {cultures.length === 0 ? (
        <div className="py-6 text-center space-y-1.5">
          <p className="text-xs font-semibold text-slate-600">
            Ainda não existem perfis de Cultura guardados nesta conta.
          </p>
          <p className="text-[11px] text-slate-400">
            Utilize o botão &ldquo;+ Nova Cultura&rdquo; acima para criar a primeira parcela.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {cultures.map((c) => {
            const isSelected = editingCultureId === c.id;
            const areaDisplay = c.area_ha !== undefined ? `${String(c.area_ha).replace('.', ',')} ha` : 'Sem área';
            const rowDisplay = c.row_distance_m !== undefined ? `Entrelinha ${String(c.row_distance_m).replace('.', ',')} m` : '';
            const details = [c.crop_type, c.variety, areaDisplay, rowDisplay].filter(Boolean).join(' • ');

            return (
              <div
                key={c.id}
                onClick={() => onEditCulture(c, false)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 ${
                  isSelected
                    ? 'border-[#3CA64C] bg-emerald-50/50 ring-1 ring-[#3CA64C]/40'
                    : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Sprout className="w-3.5 h-3.5 text-[#1D734B] shrink-0" />
                    <span className="font-extrabold text-slate-900 text-xs break-words">{c.name}</span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full bg-[#114037] text-white text-[10px] font-bold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-[#3CA64C]" />
                        <span>Ativa</span>
                      </span>
                    )}
                    {c.last_spray_volume_lha !== undefined && (
                      <span className="px-2 py-0.5 rounded-lg font-mono-numbers font-bold bg-[#114037] text-white text-[10px]">
                        Calda EPPO: {c.last_spray_volume_lha.toLocaleString('pt-PT')} L/ha
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 break-words">{details}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onEditCulture(c, true)}
                    className="min-h-[36px] px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-[11px] font-bold text-[#114037] flex items-center gap-1 whitespace-nowrap"
                    title="Registar novo momento"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-[#3CA64C] shrink-0" />
                    <span>+ Momento</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCulture(c)}
                    className="min-h-[36px] min-w-[36px] p-1.5 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors flex items-center justify-center"
                    title="Eliminar Cultura"
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

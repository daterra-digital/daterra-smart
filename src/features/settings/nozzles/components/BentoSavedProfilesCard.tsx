// src/features/settings/nozzles/components/BentoSavedProfilesCard.tsx
import React from 'react';
import { Plus, BookOpen, Trash2, CheckCircle2 } from 'lucide-react';
import type { NozzleProfile } from '../../../../schemas/nozzle-profile.schema.ts';
import { getEquipmentTypeLabelPt } from '../../../../lib/equipment-math.ts';

interface BentoSavedProfilesCardProps {
  profiles: NozzleProfile[];
  selectedProfileId: string;
  onSelectProfile: (id: string) => void;
  onNewProfile: () => void;
  onOpenGuide: () => void;
  onDeleteProfile: (id: string) => void;
}

export const BentoSavedProfilesCard: React.FC<BentoSavedProfilesCardProps> = ({
  profiles,
  selectedProfileId,
  onSelectProfile,
  onNewProfile,
  onOpenGuide,
  onDeleteProfile
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft flex flex-col justify-between h-full space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">
              Configurações Guardadas
            </span>
            <h3 className="text-base font-black text-slate-900 leading-tight">
              Perfis de Bicos Guardados
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenGuide}
              className="min-h-[44px] px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer touch-target"
              title="Guia Técnico ISO 10625"
            >
              <BookOpen className="w-4 h-4 text-[#3CA64C]" />
              <span>Guia Técnico</span>
            </button>
            <button
              type="button"
              onClick={onNewProfile}
              className="min-h-[44px] px-3.5 bg-[#114037] hover:bg-[#1D734B] text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer touch-target shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#3CA64C]" />
              <span>+ Novo Perfil</span>
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {profiles.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">
              Nenhum perfil de bicos registado. Clique em &quot;+ Novo Perfil&quot; para iniciar.
            </p>
          ) : (
            profiles.map((p) => {
              const isSelected = p.id === selectedProfileId;
              const typeLabel = getEquipmentTypeLabelPt(p.equipmentType);
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProfile(p.id)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/80 border-[#3CA64C] shadow-2xs'
                      : 'bg-[#FAFBFB] border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#114037] text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-slate-900 truncate block">{p.name}</span>
                      <span className="text-[11px] text-slate-500 font-medium block truncate">
                        {typeLabel} · {p.activeSlotsCount}/{p.totalSlotsCount} bicos ·{' '}
                        <strong className="font-mono text-[#114037]">
                          {p.totalActiveFlowLMin.toFixed(2).replace('.', ',')} L/min
                        </strong>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProfile(p.id);
                    }}
                    className="min-h-[40px] min-w-[40px] rounded-xl hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="Eliminar Perfil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

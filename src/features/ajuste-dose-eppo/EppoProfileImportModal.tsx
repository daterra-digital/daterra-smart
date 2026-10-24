import React from 'react';
import { X, Sprout, Tractor, ChevronRight } from 'lucide-react';
import type { ProfileCulture, ProfileEquipment } from '../../db/db';

interface EppoProfileImportModalProps {
  isOpen: boolean;
  type: 'culture' | 'equipment';
  cultures: ProfileCulture[];
  equipments: ProfileEquipment[];
  onSelectCulture: (culture: ProfileCulture) => void;
  onSelectEquipment: (equipment: ProfileEquipment) => void;
  onClose: () => void;
}

export const EppoProfileImportModal: React.FC<EppoProfileImportModalProps> = ({
  isOpen,
  type,
  cultures,
  equipments,
  onSelectCulture,
  onSelectEquipment,
  onClose
}) => {
  if (!isOpen) return null;

  const isCulture = type === 'culture';
  const title = isCulture ? 'Importar Perfil de Cultura' : 'Importar Perfil de Pulverizador';
  const subtitle = isCulture
    ? 'Selecione a cultura registada para preencher a geometria (LWA/TRV)'
    : 'Selecione o equipamento para preencher a capacidade do depósito';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#114037] flex items-center justify-center">
              {isCulture ? <Sprout className="w-5 h-5" /> : <Tractor className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-black text-[#114037] uppercase tracking-wide">{title}</h3>
              <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {isCulture ? (
            cultures.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400 font-medium">
                Nenhuma cultura registada. Pode introduzir as medidas manualmente.
              </p>
            ) : (
              cultures.map((c) => (
                <button
                  key={c.id ?? c.name}
                  type="button"
                  onClick={() => { onSelectCulture(c); onClose(); }}
                  className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-[#3CA64C] hover:bg-emerald-50/40 transition-all flex items-center justify-between group touch-target cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{c.name}</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {c.crop_type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                      <span>Entrelinha: <strong>{c.row_distance_m ?? 2.5} m</strong></span>
                      <span>•</span>
                      <span>Altura: <strong>{c.canopy_height_m ?? 1.5} m</strong></span>
                      {c.canopy_width_m && (
                        <>
                          <span>•</span>
                          <span>Largura: <strong>{c.canopy_width_m} m</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#3CA64C]" />
                </button>
              ))
            )
          ) : equipments.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400 font-medium">
              Nenhum pulverizador registado. Pode introduzir a capacidade manualmente.
            </p>
          ) : (
            equipments.map((e) => (
              <button
                key={e.id ?? e.name}
                type="button"
                onClick={() => { onSelectEquipment(e); onClose(); }}
                className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-[#3CA64C] hover:bg-emerald-50/40 transition-all flex items-center justify-between group touch-target cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{e.name}</span>
                    {e.model && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {e.model}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Depósito: <strong className="text-[#114037]">{e.tank_capacity_l} L</strong>
                    {e.pump_type ? ` • Bomba: ${e.pump_type}` : ''}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#3CA64C]" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

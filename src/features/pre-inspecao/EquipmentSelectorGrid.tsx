import React from 'react';
import {
  Tractor,
  Fan,
  SprayCan,
  Factory,
  Wind,
  Plane,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  EQUIPMENT_OPTIONS,
  type EquipmentIconName,
  type EquipmentOption,
  type EquipmentTypeId
} from './preInspectionData';

const ICON_MAP: Record<EquipmentIconName, React.ComponentType<{ className?: string }>> = {
  Tractor,
  Fan,
  SprayCan,
  Factory,
  Wind,
  Plane
};

export interface EquipmentSelectorGridProps {
  selectedEquipment: EquipmentTypeId;
  onSelectEquipment: (equipmentId: EquipmentTypeId) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const EquipmentSelectorGrid: React.FC<EquipmentSelectorGridProps> = ({
  selectedEquipment,
  onSelectEquipment,
  isExpanded,
  onToggleExpand
}) => {
  const activeOption: EquipmentOption =
    EQUIPMENT_OPTIONS.find((opt) => opt.id === selectedEquipment) || EQUIPMENT_OPTIONS[0];
  const ActiveIcon = ICON_MAP[activeOption.iconName];

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all">
      {/* Cabeçalho do Seletor de Equipamento */}
      <div
        onClick={onToggleExpand}
        className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${
              isExpanded
                ? 'bg-[#114037] text-[#8ffa94]'
                : 'bg-emerald-50 text-[#114037] border border-emerald-200'
            }`}
          >
            <ActiveIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C] block">
              Ecrã 1 • Tipologia de Pulverizador
            </span>
            <h2 className="text-sm sm:text-base font-black text-slate-900 truncate">
              Seleção de Equipamento ({activeOption.title})
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeOption.normativeRef && (
            <span className="hidden sm:inline-block text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
              {activeOption.normativeRef}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1">
            <span>{isExpanded ? 'Ocultar' : 'Trocar'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </span>
        </div>
      </div>

      {/* Grelha Visual de Equipamentos (3 colunas em Desktop) */}
      {isExpanded && (
        <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-slate-100 space-y-3 animate-fade-in">
          <p className="text-xs text-slate-500 font-medium">
            Selecione o tipo de equipamento de aplicação de produtos fitofarmacêuticos a inspecionar:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EQUIPMENT_OPTIONS.map((option) => {
              const IconComponent = ICON_MAP[option.iconName];
              const isDisabled = Boolean(option.disabled);
              const isSelected = !isDisabled && option.id === selectedEquipment;

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) {
                      onSelectEquipment(option.id);
                    }
                  }}
                  className={`w-full p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 touch-target ${
                    isDisabled
                      ? 'bg-white text-slate-700 border-slate-200 opacity-50 cursor-not-allowed'
                      : isSelected
                        ? 'bg-emerald-900 text-white border-emerald-900 shadow-md cursor-pointer'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-xs cursor-pointer'
                  }`}
                >
                  <div className="flex items-start justify-between w-full gap-2">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isSelected
                          ? 'bg-white/15 text-[#8ffa94]'
                          : 'bg-emerald-50 text-[#114037] border border-emerald-100'
                      }`}
                    >
                      <IconComponent className="w-8 h-8" />
                    </div>

                    {isDisabled ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 border border-slate-300">
                        Em Breve
                      </span>
                    ) : (
                      option.normativeRef && (
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isSelected
                              ? 'bg-[#3CA64C] text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                          <span>{option.normativeRef}</span>
                        </span>
                      )
                    )}
                  </div>

                  <div>
                    <span className="text-sm sm:text-base font-extrabold block leading-snug">
                      {option.title}
                    </span>
                    <span
                      className={`text-xs block mt-0.5 ${
                        isSelected ? 'text-emerald-100/90' : 'text-slate-500'
                      }`}
                    >
                      {option.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

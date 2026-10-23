// src/features/agri-chat/components/ExplorationProfileDropdowns.tsx
import React from 'react';
import type { ProfileCulture, ProfileEquipment, ProfileNozzle, ProfileCalibration } from '../../../db/db';
import type { ActiveExplorationContext } from '../types';

interface ExplorationProfileDropdownsProps {
  cultures: ProfileCulture[];
  equipments: ProfileEquipment[];
  nozzles: ProfileNozzle[];
  calibrations: ProfileCalibration[];
  activeContext: ActiveExplorationContext;
  onUpdateContext: (updates: Partial<ActiveExplorationContext>) => void;
  layout?: 'vertical' | 'grid';
}

export const ExplorationProfileDropdowns: React.FC<ExplorationProfileDropdownsProps> = ({
  cultures,
  equipments,
  nozzles,
  calibrations,
  activeContext,
  onUpdateContext,
  layout = 'vertical'
}) => {
  const containerClass = layout === 'vertical'
    ? 'space-y-3 pt-1'
    : 'mt-3 pt-3 border-t border-emerald-900/15 grid grid-cols-1 sm:grid-cols-2 gap-3';

  return (
    <div className={containerClass}>
      {/* 1. Cultura / Parcela */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
          Cultura / Parcela
        </label>
        <select
          value={activeContext.cultureId || ''}
          onChange={(e) => {
            const cult = cultures.find((c) => String(c.id) === e.target.value);
            onUpdateContext({
              cultureId: cult?.id,
              cultureName: cult?.name,
              cropType: cult?.crop_type,
              variety: cult?.variety,
              rowDistanceM: cult?.row_distance_m,
              canopyHeightM: cult?.canopy_height_m,
              canopyWidthM: cult?.canopy_width_m,
              trainingSystem: cult?.training_system
            });
          }}
          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs focus:border-daterra-accent outline-none min-h-[42px]"
        >
          <option value="">Selecione Parcela...</option>
          {cultures.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.crop_type} • {c.row_distance_m}m)
            </option>
          ))}
        </select>
      </div>

      {/* 2. Pulverizador */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
          Pulverizador
        </label>
        <select
          value={activeContext.equipmentId || ''}
          onChange={(e) => {
            const eq = equipments.find((item) => String(item.id) === e.target.value);
            onUpdateContext({
              equipmentId: eq?.id,
              equipmentName: eq?.name,
              tankCapacityL: eq?.tank_capacity_l,
              pumpType: eq?.pump_type
            });
          }}
          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs focus:border-daterra-accent outline-none min-h-[42px]"
        >
          <option value="">Selecione Pulverizador...</option>
          {equipments.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.name} ({eq.tank_capacity_l}L)
            </option>
          ))}
        </select>
      </div>

      {/* 3. Bicos */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
          Bicos Instalados
        </label>
        <select
          value={activeContext.nozzleName || ''}
          onChange={(e) => {
            const noz = nozzles.find((n) => `${n.manufacturer} ${n.model}` === e.target.value);
            onUpdateContext({
              nozzleName: noz ? `${noz.manufacturer} ${noz.model}` : e.target.value,
              nozzleColor: noz?.color
            });
          }}
          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs focus:border-daterra-accent outline-none min-h-[42px]"
        >
          <option value="">Selecione Bicos...</option>
          {nozzles.map((n, idx) => {
            const fullName = `${n.manufacturer} ${n.model}`;
            return (
              <option key={idx} value={fullName}>
                {fullName} ({n.color || 'Padrão'})
              </option>
            );
          })}
        </select>
      </div>

      {/* 4. Calibração */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
          Calibração de Trabalho
        </label>
        <select
          onChange={(e) => {
            const cal = calibrations.find((c) => String(c.id) === e.target.value);
            if (cal) {
              onUpdateContext({
                calibrationSpeedKmh: cal.working_speed_kmh,
                calibrationPressureBar: cal.working_pressure_bar,
                calibrationVolumeLHa: cal.calculated_spray_volume_lha
              });
            }
          }}
          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs focus:border-daterra-accent outline-none min-h-[42px]"
        >
          <option value="">Selecione Calibração...</option>
          {calibrations.map((cal, idx) => (
            <option key={idx} value={cal.id}>
              {cal.equipment_name || 'Regulação'} ({cal.working_pressure_bar} bar • {cal.working_speed_kmh} km/h)
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

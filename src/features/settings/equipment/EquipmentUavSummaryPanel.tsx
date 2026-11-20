// src/features/settings/equipment/EquipmentUavSummaryPanel.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { EquipmentRecord } from '../../../schemas/equipment.schema.ts';

export const EquipmentUavSummaryPanel: React.FC<{ equipment?: EquipmentRecord; effectiveWidthM: number }> = ({
  equipment,
  effectiveWidthM
}) => {
  const uav = equipment?.uavDetails;
  const swath = uav?.swathWidthM ?? effectiveWidthM;
  const flightH = uav?.flightHeightM;
  const isHighFlight = flightH !== undefined && flightH > 3.0;
  const isCda = (uav?.atomizationSystem ?? 'CENTRIFUGAL_CDA') === 'CENTRIFUGAL_CDA';
  const isHighRpm = isCda && uav?.cdaDiscRpm !== undefined && uav.cdaDiscRpm > 12000;
  const isWingtip = uav?.nozzlePlacement === 'WINGTIP';
  const fmt = (n?: number) => (n !== undefined ? String(n).replace('.', ',') : '—');

  return (
    <div className="p-4 rounded-2xl bg-[#114037] text-white space-y-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">
          Perfil de Pulverização UAV · Drone ({uav?.rotorCount ?? 4} rotores{uav?.terrainFollowingRadar !== false ? ' · Radar ativo' : ''})
        </span>
        <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-bold">Limite legal ≤ 15 km/h</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono-numbers">
        <div className="p-2.5 rounded-xl bg-white/10">
          <span className="text-[10px] font-sans text-emerald-200 block">Swath / Altura de Voo</span>
          <span className="text-sm font-black text-[#3CA64C]">{fmt(swath)} m · {flightH !== undefined ? `${fmt(flightH)} m` : '2,0 m'}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white/10">
          <span className="text-[10px] font-sans text-emerald-200 block">Atomização &amp; Espectro</span>
          <span className="text-xs font-black">
            {isCda ? `CDA ${uav?.cdaDiscRpm ? `${uav.cdaDiscRpm.toLocaleString('pt-PT')} RPM` : '— RPM'}` : `Hidráulica ${fmt(equipment?.defaultPressureBar)} bar`}
            {uav?.dropletDv50Um ? ` · Dv0,5 ${uav.dropletDv50Um} µm` : ''}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-white/10">
          <span className="text-[10px] font-sans text-emerald-200 block">Bicos &amp; Classe</span>
          <span className="text-xs font-black">
            {isWingtip ? 'Wingtip (Extremidades)' : 'Under-rotor'} · {uav?.weightClass === 'LIGHT_LT_15L' ? '< 15 L' : '≥ 20 L'}
          </span>
        </div>
      </div>
      {(isHighFlight || isHighRpm || isWingtip) && (
        <div className="p-2.5 rounded-xl bg-amber-400/20 border border-amber-300/40 text-[11px] font-semibold text-amber-100 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
          <span>
            {[
              isHighFlight ? 'Voo > 3,0 m reduz downwash' : '',
              isHighRpm ? 'CDA > 12.000 RPM (< 100 µm)' : '',
              isWingtip ? 'Wingtip sujeito a vórtices de hélice' : ''
            ].filter(Boolean).join(' · ')}.
          </span>
        </div>
      )}
    </div>
  );
};

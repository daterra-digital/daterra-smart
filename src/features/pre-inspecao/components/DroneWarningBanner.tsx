import React from 'react';
import { AlertTriangle, Plane } from 'lucide-react';
import { MANDATORY_DRONE_WARNING } from '../data/equipmentConfigs';

export const DroneWarningBanner: React.FC = () => {
  return (
    <div
      role="alert"
      className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-2 animate-fade-in shadow-xs"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
          <Plane className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
            Enquadramento Específico • Drones / UAV
          </span>
          <h3 className="text-xs sm:text-sm font-extrabold text-amber-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Aviso Regulamentar Obrigatório</span>
          </h3>
        </div>
      </div>
      <p className="text-xs text-amber-900 font-semibold leading-relaxed pl-1 sm:pl-10">
        &ldquo;{MANDATORY_DRONE_WARNING}&rdquo;
      </p>
    </div>
  );
};

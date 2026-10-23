// src/features/weather/components/WeatherContextBar.tsx
import React from 'react';
import { Tractor, Sparkles } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db/db';

export interface WeatherEquipmentContext {
  nozzleType: string;
  hasAirSleeve: boolean;
  workingPressureBar: number;
}

interface WeatherContextBarProps {
  context: WeatherEquipmentContext;
  onContextChange: (newCtx: WeatherEquipmentContext) => void;
}

export const WeatherContextBar: React.FC<WeatherContextBarProps> = ({
  context,
  onContextChange
}) => {
  const profileNozzles = useLiveQuery(() => db.profiles_nozzles.toArray()) || [];
  const profileEquipment = useLiveQuery(() => db.profiles_equipment.toArray()) || [];

  return (
    <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-daterra-primary text-white flex items-center justify-center">
            <Tractor className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
              <span>Contexto Ativo da Máquina & Calibração</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Cruzamento em Tempo Real
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              O semáforo e as recomendações técnicas reagem aos bicos e pulverizador selecionados.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Bico */}
          <select
            value={context.nozzleType}
            onChange={(e) => onContextChange({ ...context, nozzleType: e.target.value })}
            className="bg-white border border-slate-300 text-slate-800 text-xs rounded-xl px-3 py-2 font-bold shadow-2xs focus:ring-2 focus:ring-emerald-500"
          >
            <option value="air_induction">Bico Indução Ar (Gotas Grossas &gt; 350 µm)</option>
            <option value="standard">Bico Fenda Convencional (Gotas Finas &lt; 200 µm)</option>
            {profileNozzles.map((n) => (
              <option key={n.id} value={n.nozzle_type || 'standard'}>
                {n.manufacturer} {n.model} ({n.color})
              </option>
            ))}
          </select>

          {/* Seletor de Assistência de Ar / Manga */}
          <select
            value={context.hasAirSleeve ? 'yes' : 'no'}
            onChange={(e) => onContextChange({ ...context, hasAirSleeve: e.target.value === 'yes' })}
            className="bg-white border border-slate-300 text-slate-800 text-xs rounded-xl px-3 py-2 font-bold shadow-2xs focus:ring-2 focus:ring-emerald-500"
          >
            <option value="yes">Pulverizador c/ Manga de Ar</option>
            <option value="no">Atomizador Aberto (Sem Manga)</option>
            {profileEquipment.filter(eq => eq.has_air_sleeve).map(eq => (
              <option key={eq.id} value="yes">
                {eq.name} (Manga de Ar Ativa)
              </option>
            ))}
          </select>

          {/* Seletor de Pressão de Trabalho */}
          <select
            value={context.workingPressureBar.toString()}
            onChange={(e) => onContextChange({ ...context, workingPressureBar: parseFloat(e.target.value) })}
            className="bg-white border border-slate-300 text-slate-800 text-xs rounded-xl px-3 py-2 font-bold shadow-2xs focus:ring-2 focus:ring-emerald-500"
          >
            <option value="2.5">Pressão: 2.5 bar (Recomendada)</option>
            <option value="3.5">Pressão: 3.5 bar (Intermédia)</option>
            <option value="4.5">Pressão: 4.5 bar (Alta / Microgotas)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

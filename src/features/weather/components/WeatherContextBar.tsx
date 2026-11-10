// src/features/weather/components/WeatherContextBar.tsx
import React from 'react';
import { Tractor, Sparkles, Info } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db/db';
import type { ProfileNozzle, ProfileEquipment } from '../../../db/types';
import { useAuth } from '../../../context/AuthContext';

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
  const { user } = useAuth();
  const effectiveUserId = user?.id || user?.uid || '';
  const profileNozzles = useLiveQuery<ProfileNozzle[]>(
    () => (effectiveUserId ? db.profiles_nozzles.where('userId').equals(effectiveUserId).toArray() : []),
    [effectiveUserId]
  ) || [];
  const profileEquipment = useLiveQuery<ProfileEquipment[]>(
    () => (effectiveUserId ? db.profiles_equipment.where('userId').equals(effectiveUserId).toArray() : []),
    [effectiveUserId]
  ) || [];

  // Limiares reais aplicados por evaluateSprayWindow()
  const isAirInduction = context.nozzleType.toLowerCase().includes('ind') ||
    context.nozzleType === 'air_induction';
  const hasAirSleeve = !!context.hasAirSleeve;

  const maxWindSafe = hasAirSleeve ? 16 : isAirInduction ? 14 : 10;
  const maxWindLimit = hasAirSleeve ? 20 : isAirInduction ? 18 : 14;
  const maxGustsLimit = 25; // Limite de rajadas no código

  return (
    <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-3xl p-5 shadow-xs space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-daterra-primary text-white flex items-center justify-center shrink-0">
            <Tractor className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
              <span>Contexto Ativo da Máquina & Calibração</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Cruzamento em Tempo Real
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Os limiares de vento e tolerância à evaporação ajustam-se aos bicos e pulverizador selecionados.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Bico — Apenas texto e etiqueta */}
          <div className="flex items-center bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 mr-2">Bico:</span>
            <select
              value={context.nozzleType}
              onChange={(e) => onContextChange({ ...context, nozzleType: e.target.value })}
              className="bg-transparent text-slate-800 text-xs font-bold focus:outline-none"
            >
              <option value="air_induction">Indução de Ar (&gt; 350 µm)</option>
              <option value="standard">Fenda Convencional (&lt; 200 µm)</option>
              {profileNozzles.map((n) => (
                <option key={n.id} value={n.nozzle_type || 'standard'}>
                  {n.manufacturer} {n.model} ({n.color})
                </option>
              ))}
            </select>
          </div>

          {/* Seletor de Assistência de Ar / Manga */}
          <div className="flex items-center bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 mr-2">Pulverizador:</span>
            <select
              value={context.hasAirSleeve ? 'yes' : 'no'}
              onChange={(e) => onContextChange({ ...context, hasAirSleeve: e.target.value === 'yes' })}
              className="bg-transparent text-slate-800 text-xs font-bold focus:outline-none"
            >
              <option value="yes">Com Manga de Ar</option>
              <option value="no">Sem Manga de Ar</option>
              {profileEquipment.filter(eq => eq.has_air_sleeve).map(eq => (
                <option key={eq.id} value="yes">
                  {eq.name} (Manga de Ar)
                </option>
              ))}
            </select>
          </div>

          {/* Seletor de Pressão de Trabalho */}
          <div className="flex items-center bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 mr-2">Pressão:</span>
            <select
              value={context.workingPressureBar.toString()}
              onChange={(e) => onContextChange({ ...context, workingPressureBar: parseFloat(e.target.value) })}
              className="bg-transparent text-slate-800 text-xs font-bold focus:outline-none"
            >
              <option value="2.5">2.5 bar (Recomendada)</option>
              <option value="3.5">3.5 bar (Intermédia)</option>
              <option value="4.5">4.5 bar (Alta)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Faixa Informativa dos Limiares Ativos Aplicados por evaluateSprayWindow() */}
      <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-700">
        <span className="flex items-center gap-1 font-semibold">
          <Info className="w-3.5 h-3.5 text-emerald-700" />
          <span>Limiares do Perfil Ativo:</span>
        </span>
        <span>
          Vento favorável: <strong>&le; {maxWindSafe} km/h</strong>
        </span>
        <span className="text-slate-300">•</span>
        <span>
          Vento moderado (atenção): <strong>{maxWindSafe} a {maxWindLimit} km/h</strong>
        </span>
        <span className="text-slate-300">•</span>
        <span>
          Vento crítico (adiar): <strong>&gt; {maxWindLimit} km/h</strong> ou rajadas <strong>&gt; {maxGustsLimit} km/h</strong>
        </span>
      </div>
    </div>
  );
};

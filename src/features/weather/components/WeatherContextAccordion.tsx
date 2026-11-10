// src/features/weather/components/WeatherContextAccordion.tsx
import React, { useState, useEffect } from 'react';
import { Tractor, ChevronDown, ChevronUp, RotateCcw, Info, CheckCircle2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db/db';
import type { ProfileCulture, ProfileEquipment, ProfileNozzle, ProfileCalibration } from '../../../db/types';
import { useAuth } from '../../../context/AuthContext';
import type { ActiveMachineContext } from '../weatherWeekAggregator';
import { ContextSelectField } from './ContextSelectField';

interface WeatherContextAccordionProps {
  context: ActiveMachineContext | null;
  onContextChange: (ctx: ActiveMachineContext | null) => void;
}

export const WeatherContextAccordion: React.FC<WeatherContextAccordionProps> = ({ context, onContextChange }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { user } = useAuth();
  const effectiveUserId = user?.id || user?.uid || '';

  // Limpa seleções ativas se o utilizador fechar sessão ou alternar de conta
  useEffect(() => {
    if (!effectiveUserId && context !== null) {
      onContextChange(null);
    }
  }, [effectiveUserId, context, onContextChange]);

  // Carrega exclusivamente os perfis do utilizador autenticado (SEC-REM-01, sem fallback local-user)
  const cultures = useLiveQuery<ProfileCulture[]>(async () => {
    if (!effectiveUserId) return [];
    return db.profiles_cultures.where('userId').equals(effectiveUserId).toArray();
  }, [effectiveUserId]) || [];
  const equipments = useLiveQuery<ProfileEquipment[]>(async () => {
    if (!effectiveUserId) return [];
    return db.profiles_equipment.where('userId').equals(effectiveUserId).toArray();
  }, [effectiveUserId]) || [];
  const nozzles = useLiveQuery<ProfileNozzle[]>(async () => {
    if (!effectiveUserId) return [];
    return db.profiles_nozzles.where('userId').equals(effectiveUserId).toArray();
  }, [effectiveUserId]) || [];
  const calibrations = useLiveQuery<ProfileCalibration[]>(async () => {
    if (!effectiveUserId) return [];
    return db.profiles_calibrations.where('userId').equals(effectiveUserId).toArray();
  }, [effectiveUserId]) || [];

  const hasAnyContext = !!(context?.cultureId || context?.equipmentId || context?.nozzleId || context?.calibrationId);

  const handleEquipmentChange = (eqIdStr: string) => {
    if (!eqIdStr) {
      onContextChange({ ...context, equipmentId: null, equipmentName: null, hasAirSleeve: undefined, calibrationId: null, calibrationName: null, workingPressureBar: null });
      return;
    }
    const eqId = parseInt(eqIdStr, 10);
    const eq = equipments.find(item => item.id === eqId);
    const updatedNozzle = context?.nozzleId ? nozzles.find(n => n.id === context.nozzleId) : null;
    onContextChange({
      ...context, equipmentId: eqId, equipmentName: eq?.name || null, hasAirSleeve: !!eq?.has_air_sleeve,
      nozzleId: updatedNozzle ? updatedNozzle.id : null, nozzleName: updatedNozzle ? `${updatedNozzle.manufacturer} ${updatedNozzle.model}` : null,
      nozzleType: updatedNozzle ? updatedNozzle.nozzle_type : null, calibrationId: null, calibrationName: null, workingPressureBar: null
    });
  };

  const handleNozzleChange = (nozIdStr: string) => {
    if (!nozIdStr) {
      onContextChange({ ...context, nozzleId: null, nozzleName: null, nozzleType: null, calibrationId: null, calibrationName: null, workingPressureBar: null });
      return;
    }
    const nozId = parseInt(nozIdStr, 10);
    const noz = nozzles.find(item => item.id === nozId);
    onContextChange({
      ...context, nozzleId: nozId, nozzleName: noz ? `${noz.manufacturer} ${noz.model}` : null,
      nozzleType: noz?.nozzle_type || null, calibrationId: null, calibrationName: null,
      workingPressureBar: noz?.working_pressure_bar ?? null
    });
  };

  const handleCalibrationChange = (calIdStr: string) => {
    if (!calIdStr) {
      onContextChange({ ...context, calibrationId: null, calibrationName: null, workingPressureBar: context?.nozzleId ? nozzles.find(n => n.id === context.nozzleId)?.working_pressure_bar ?? null : null });
      return;
    }
    const calId = parseInt(calIdStr, 10);
    const cal = calibrations.find(item => item.id === calId);
    onContextChange({
      ...context, calibrationId: calId, calibrationName: cal ? `Calibração #${cal.id} (${cal.calculated_spray_volume_lha} L/ha)` : null,
      workingPressureBar: cal?.working_pressure_bar ?? null, dropletSizeUm: cal?.droplet_size_um ?? null
    });
  };

  const maxWindSafe = context?.hasAirSleeve ? 16 : context?.nozzleType?.toLowerCase().includes('ind') ? 14 : 10;
  const maxWindLimit = context?.hasAirSleeve ? 20 : context?.nozzleType?.toLowerCase().includes('ind') ? 18 : 14;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden transition-all">
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#eef8f0] text-daterra-primary flex items-center justify-center shrink-0">
            <Tractor className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Contexto da Exploração</span>
              {hasAnyContext ? (
                <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ativo
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  Não selecionado
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 truncate max-w-lg">
              {hasAnyContext
                ? [context?.cultureName, context?.equipmentName, context?.nozzleName, context?.workingPressureBar ? `${context.workingPressureBar} bar` : null].filter(Boolean).join(' • ')
                : 'Avaliação meteorológica de referência. Expanda para selecionar os seus perfis.'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {hasAnyContext && (
            <button
              onClick={() => onContextChange(null)}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
              title="Repor para condições de referência"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            className="px-3 py-1.5 text-xs font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <span>{isExpanded ? 'Recolher' : 'Selecionar Perfis'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 pt-0 border-t border-slate-100 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-3">
            <ContextSelectField
              label="Cultura"
              value={context?.cultureId ?? ''}
              onChange={(val) => {
                const id = val ? parseInt(val, 10) : null;
                const c = cultures.find(item => item.id === id);
                onContextChange({ ...context, cultureId: id, cultureName: c?.name || null });
              }}
              options={cultures.map(c => ({ id: c.id, label: `${c.name} (${c.crop_type})` }))}
              placeholder="Sem cultura selecionada"
            />
            <ContextSelectField
              label="Pulverizador"
              value={context?.equipmentId ?? ''}
              onChange={handleEquipmentChange}
              options={equipments.map(eq => ({ id: eq.id, label: `${eq.name}${eq.has_air_sleeve ? ' (c/ Manga)' : ' (s/ Manga)'}` }))}
              placeholder="Sem equipamento selecionado"
            />
            <ContextSelectField
              label="Bico"
              value={context?.nozzleId ?? ''}
              onChange={handleNozzleChange}
              options={nozzles
                .filter(n => !context?.equipmentId || n.equipment_id === context.equipmentId)
                .map(n => ({ id: n.id, label: `${n.manufacturer} ${n.model} (${n.color})` }))}
              placeholder="Sem bico selecionado"
            />
            <ContextSelectField
              label="Calibração"
              value={context?.calibrationId ?? ''}
              onChange={handleCalibrationChange}
              options={calibrations
                .filter(c => (!context?.equipmentId || c.equipment_id === context.equipmentId) && (!context?.nozzleId || c.nozzle_id === context.nozzleId))
                .map(c => ({ id: c.id, label: `Calibração #${c.id} (${c.calculated_spray_volume_lha || '—'} L/ha • ${c.working_pressure_bar || '—'} bar)` }))}
              placeholder="Sem calibração selecionada"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Info className="w-3.5 h-3.5 text-emerald-700" />
              <span>Limiares: Vento favorável &le; {maxWindSafe} km/h • Vento limite &gt; {maxWindLimit} km/h ou rajadas &gt; 25 km/h</span>
            </span>
            <span className="text-slate-400">Perfis guardados no IndexedDB</span>
          </div>
        </div>
      )}
    </div>
  );
};

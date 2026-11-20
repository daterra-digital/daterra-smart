// src/features/settings/nozzles/components/BentoSlotDetailCard.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import type { NozzleProfile } from '../../../../schemas/nozzle-profile.schema.ts';
import { areAllActiveNozzlesIdentical, computeBilateralStats, computeSlotGroupStats, inferPrimaryCount, isSlotConfigured } from '../services/nozzleProfileMath.ts';
import { buildRampGroups, computeBoomSectorDeviationPct, computeBoomSectorSummaries } from '../services/nozzleBoom2dHelpers.ts';
import { computeTunnelRampDeviation, getTunnelSideShortLabel, type TunnelRampFilter } from '../services/nozzleTunnelHelpers.ts';
import { computePneumaticArmDeviation, getPneumaticArmLabel, type PneumaticArmFilter } from '../services/nozzlePneumaticHelpers.ts';
import { computeCannonDeviation, getCannonGroupLabel, getCannonSlotBadge, type CannonGroupFilter } from '../services/nozzleCannonHelpers.ts';
import { computeDroneBilateralDeviation, isDroneSlotLeft, type DroneFlankFilter } from '../services/nozzleDroneHelpers.ts';
import { computeManualLanceDeviation, getManualSlotBadge } from '../services/nozzleManualHelpers.ts';
import { BentoSlotCharacteristicsRow } from './BentoSlotCharacteristicsRow.tsx';
import { TunnelRampFilterBar } from './TunnelRampFilterBar.tsx';
import { PneumaticArmFilterBar } from './PneumaticArmFilterBar.tsx';
import { CannonGroupFilterBar } from './CannonGroupFilterBar.tsx';
import { DroneFlankFilterBar } from './DroneFlankFilterBar.tsx';
import { BentoSlotSummaryCards } from './BentoSlotSummaryCards.tsx';

interface BentoSlotDetailCardProps {
  profile: NozzleProfile;
  selectedIndex: number;
  boomSectorFilter?: number | 'ALL';
  tunnelRampFilter?: TunnelRampFilter;
  pneumaticArmFilter?: PneumaticArmFilter;
  cannonGroupFilter?: CannonGroupFilter;
  droneFlankFilter?: DroneFlankFilter;
  onChangeBoomSectorFilter?: (filter: number | 'ALL') => void;
  onChangeTunnelRampFilter?: (filter: TunnelRampFilter) => void;
  onChangePneumaticArmFilter?: (filter: PneumaticArmFilter) => void;
  onChangeCannonGroupFilter?: (filter: CannonGroupFilter) => void;
  onChangeDroneFlankFilter?: (filter: DroneFlankFilter) => void;
  onSelectSlot: (index: number) => void;
  onOpenDrawerForSlot: (index: number) => void;
  onOpenMeasuredFlowKeypad: (index: number) => void;
  onToggleSlotActive: (index: number) => void;
}

const INITIAL_LIMIT = 8;

export const BentoSlotDetailCard: React.FC<BentoSlotDetailCardProps> = ({
  profile, selectedIndex, boomSectorFilter = 'ALL', tunnelRampFilter = 'LEFT_OUTER', pneumaticArmFilter = 'LEFT_1', cannonGroupFilter = 'MAIN', droneFlankFilter = 'ALL', onChangeBoomSectorFilter, onChangeTunnelRampFilter, onChangePneumaticArmFilter, onChangeCannonGroupFilter, onChangeDroneFlankFilter, onSelectSlot, onOpenDrawerForSlot, onOpenMeasuredFlowKeypad, onToggleSlotActive
}) => {
  const isBoom2D = profile.equipmentType === '2D_HORIZONTAL', isTunnel3d = profile.equipmentType === '3D_TUNNEL', isPneumatic3d = profile.equipmentType === '3D_PNEUMATIC', isCannon3d = profile.equipmentType === '3D_CANNON', isDroneUav = profile.equipmentType === 'UAV_DRONE', isManualLance = profile.equipmentType === 'MANUAL_LANCE';
  const boomSectors = isBoom2D ? inferPrimaryCount('2D_HORIZONTAL', profile.slots, profile.boomSectors) : 0;
  const sectorSummaries = useMemo(() => (isBoom2D ? computeBoomSectorSummaries(profile.slots, boomSectors) : []), [isBoom2D, profile.slots, boomSectors]);
  const boomSectorDev = useMemo(() => (isBoom2D ? computeBoomSectorDeviationPct(profile.slots, boomSectors) : 0), [isBoom2D, profile.slots, boomSectors]);
  const isBoomCompliant = boomSectorDev < 10;
  const tunnelDev = useMemo(() => (isTunnel3d ? computeTunnelRampDeviation(profile.slots, profile.tunnelOrientation ?? 'BOTH') : null), [isTunnel3d, profile.slots, profile.tunnelOrientation]);
  const pneuDev = useMemo(() => (isPneumatic3d ? computePneumaticArmDeviation(profile.slots, inferPrimaryCount('3D_PNEUMATIC', profile.slots, profile.pneumaticArms)) : null), [isPneumatic3d, profile.slots, profile.pneumaticArms]);
  const cannonDev = useMemo(() => (isCannon3d ? computeCannonDeviation(profile.slots) : null), [isCannon3d, profile.slots]);
  const droneDev = useMemo(() => (isDroneUav ? computeDroneBilateralDeviation(profile.slots) : null), [isDroneUav, profile.slots]);
  const manualDev = useMemo(() => (isManualLance ? computeManualLanceDeviation(profile.slots) : null), [isManualLance, profile.slots]);

  const [showAllSlots, setShowAllSlots] = useState(false);
  useEffect(() => { setShowAllSlots(false); }, [profile.id, boomSectorFilter, tunnelRampFilter, pneumaticArmFilter, cannonGroupFilter, droneFlankFilter]);

  const rampGroups = useMemo(() => buildRampGroups(profile), [profile]);
  const isGrouped3D = rampGroups.length > 0;
  const [activeGroupId, setActiveGroupId] = useState<string>(rampGroups[0]?.id ?? '');

  useEffect(() => {
    if (!isGrouped3D || rampGroups.length === 0 || (isTunnel3d && tunnelRampFilter === 'ALL') || (isPneumatic3d && pneumaticArmFilter === 'ALL')) return;
    const ownerGroup = rampGroups.find((g) => g.slots.some((s) => s.slotIndex === selectedIndex));
    if (ownerGroup) { setActiveGroupId(ownerGroup.id); return; }
    setActiveGroupId(rampGroups[0].id);
    if (rampGroups[0].slots[0]) onSelectSlot(rampGroups[0].slots[0].slotIndex);
  }, [isGrouped3D, isTunnel3d, isPneumatic3d, tunnelRampFilter, pneumaticArmFilter, rampGroups, selectedIndex, onSelectSlot]);

  const activeGroup = rampGroups.find((g) => g.id === (isTunnel3d ? tunnelRampFilter : isPneumatic3d ? pneumaticArmFilter : activeGroupId)) ?? rampGroups[0];
  const boomFiltered = useMemo(() => {
    if (!isBoom2D) return [];
    return boomSectorFilter === 'ALL' ? profile.slots : profile.slots.filter((s) => (s.sectorIndex ?? 1) === boomSectorFilter);
  }, [isBoom2D, profile.slots, boomSectorFilter]);

  const isTunnelAll = isTunnel3d && tunnelRampFilter === 'ALL';
  const isPneumaticAll = isPneumatic3d && pneumaticArmFilter === 'ALL';
  const isCannonAll = isCannon3d && cannonGroupFilter === 'ALL';
  const isDroneAll = isDroneUav && droneFlankFilter === 'ALL';
  const droneHalf = Math.ceil(profile.slots.length / 2);
  const dronePool = droneFlankFilter === 'LEFT' ? profile.slots.slice(0, droneHalf) : droneFlankFilter === 'RIGHT' ? profile.slots.slice(droneHalf) : profile.slots;
  const cannonMain = useMemo(() => (isCannon3d ? profile.slots.filter((s) => s.sectionSide === 'CANNON_MAIN') : []), [isCannon3d, profile.slots]);
  const cannonDefl = useMemo(() => (isCannon3d ? profile.slots.filter((s) => s.sectionSide === 'CANNON_DEFLECTOR') : []), [isCannon3d, profile.slots]);
  const cannonPool = cannonGroupFilter === 'MAIN' ? cannonMain : cannonGroupFilter === 'DEFLECTOR' ? cannonDefl : profile.slots;
  const listPool = isBoom2D ? boomFiltered : isCannon3d ? cannonPool : isDroneUav ? dronePool : (isTunnelAll || isPneumaticAll) ? profile.slots : isGrouped3D ? (activeGroup?.slots ?? []) : profile.slots;
  const hasMoreSlots = (isBoom2D || isTunnelAll || isPneumaticAll || isCannon3d || isDroneUav || isManualLance) && !showAllSlots && listPool.length > INITIAL_LIMIT;
  const visibleSlots = hasMoreSlots ? listPool.slice(0, INITIAL_LIMIT) : listPool;

  const stats = useMemo(() => computeSlotGroupStats(profile.slots), [profile.slots]);
  const bilateral = useMemo(() => computeBilateralStats(profile.slots), [profile.slots]);
  const showAverageSummary = isBoom2D || isCannon3d || isDroneUav || isManualLance || (isGrouped3D && areAllActiveNozzlesIdentical(profile.slots));
  const midAlert = isBoom2D ? !isBoomCompliant : isTunnel3d && tunnelDev ? !tunnelDev.isCompliant : isPneumatic3d && pneuDev ? !pneuDev.isCompliant : isCannon3d && cannonDev ? !cannonDev.isCompliant : isDroneUav && droneDev ? !droneDev.isCompliant : isManualLance && manualDev ? !manualDev.isCompliant : stats.hasIso16122Alert;

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft flex flex-col justify-between space-y-4">
      <div className="space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-3 flex-wrap">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">
              Características da Configuração · {profile.referencePressureBar.toFixed(1).replace('.', ',')} bar
            </span>
            <h3 className="text-base font-black text-slate-900 leading-tight">Lista de Configurações de Bicos</h3>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {isBoom2D && onChangeBoomSectorFilter && (
              <>
                {sectorSummaries.map((sec) => (
                  <button key={sec.sectorIndex} type="button" onClick={() => { onChangeBoomSectorFilter(sec.sectorIndex); if (sec.slots[0]) onSelectSlot(sec.slots[0].slotIndex); }} className={`min-h-[36px] px-3 rounded-xl text-xs font-extrabold cursor-pointer border transition-colors touch-target tabular-nums ${boomSectorFilter === sec.sectorIndex ? 'bg-[#114037] text-white border-[#114037]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}>
                    {sec.label} ({sec.nozzleCount})
                  </button>
                ))}
                <button type="button" onClick={() => onChangeBoomSectorFilter('ALL')} className={`min-h-[36px] px-3 rounded-xl text-xs font-extrabold cursor-pointer border transition-colors touch-target tabular-nums ${boomSectorFilter === 'ALL' ? 'bg-[#114037] text-white border-[#114037]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}>
                  Todos ({profile.slots.length})
                </button>
              </>
            )}

            {isTunnel3d && tunnelDev && onChangeTunnelRampFilter && (
              <TunnelRampFilterBar rampGroups={rampGroups} totalSlots={profile.slots.length} activeFilter={tunnelRampFilter} deviation={tunnelDev} onSelectFilter={(filter, firstIdx) => { onChangeTunnelRampFilter(filter); if (firstIdx !== undefined) onSelectSlot(firstIdx); }} />
            )}
            {isPneumatic3d && pneuDev && onChangePneumaticArmFilter && (
              <PneumaticArmFilterBar armGroups={rampGroups} totalSlots={profile.slots.length} activeFilter={pneumaticArmFilter} deviation={pneuDev} onSelectFilter={(filter, firstIdx) => { onChangePneumaticArmFilter(filter); if (firstIdx !== undefined) onSelectSlot(firstIdx); }} />
            )}
            {isCannon3d && cannonDev && onChangeCannonGroupFilter && (
              <CannonGroupFilterBar mainCount={cannonMain.length} deflectorCount={cannonDefl.length} mainFirstIdx={cannonMain[0]?.slotIndex} deflectorFirstIdx={cannonDefl[0]?.slotIndex} activeFilter={cannonGroupFilter} deviation={cannonDev} onSelectFilter={(filter, firstIdx) => { onChangeCannonGroupFilter(filter); if (firstIdx !== undefined) onSelectSlot(firstIdx); }} />
            )}
            {isDroneUav && droneDev && onChangeDroneFlankFilter && (
              <DroneFlankFilterBar totalSlots={profile.slots.length} leftFirstIdx={0} rightFirstIdx={droneHalf} activeFilter={droneFlankFilter} bilateralDeviationPct={droneDev.bilateralDeviationPct} isCompliant={droneDev.isCompliant} onSelectFilter={(filter, firstIdx) => { onChangeDroneFlankFilter(filter); if (firstIdx !== undefined) onSelectSlot(firstIdx); }} />
            )}

            {isManualLance && manualDev && (
              <>
                <span className="min-h-[36px] px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-extrabold inline-flex items-center tabular-nums">
                  {manualDev.activeCount}/{manualDev.totalCount} pistolas/lanças ativas
                </span>
                <span title="Desvio médio entre lanças ativas (limite normativo ISO 16122: < 10%)" className={`min-h-[36px] px-3 py-1 rounded-xl text-white text-[11px] font-extrabold inline-flex items-center gap-1.5 shadow-2xs shrink-0 whitespace-nowrap tabular-nums ${manualDev.isCompliant ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                  {manualDev.isCompliant ? <Check className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                  <span>Desvio Lanças: {manualDev.avgDeviationPct.toFixed(1).replace('.', ',')}% · ISO 16122 (&lt; 10%)</span>
                </span>
              </>
            )}

            {isGrouped3D && !isTunnel3d && !isPneumatic3d && !isCannon3d && !isDroneUav && !isManualLance && rampGroups.map((g) => {
              const groupFlow = g.slots.filter((s) => s.isActive && isSlotConfigured(s)).reduce((acc, s) => acc + (s.measuredFlowLMin ?? s.flowAtPressureLMin), 0);
              return (
                <button key={g.id} type="button" onClick={() => { setActiveGroupId(g.id); if (g.slots[0]) onSelectSlot(g.slots[0].slotIndex); }} className={`min-h-[36px] px-3.5 rounded-xl text-xs font-extrabold cursor-pointer border transition-colors touch-target tabular-nums ${activeGroup?.id === g.id ? 'bg-[#114037] text-white border-[#114037]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}>
                  {g.label} ({g.slots.length}) · {groupFlow.toFixed(2).replace('.', ',')} L/min
                </button>
              );
            })}

            {(isBoom2D || (isGrouped3D && !isTunnel3d && !isPneumatic3d)) && (
              <span title={isBoom2D ? 'Desvio médio entre setores da barra horizontal (limite normativo ISO 16122: < 10%)' : undefined} className={`min-h-[36px] px-3 py-1 rounded-xl text-white text-[11px] font-extrabold inline-flex items-center gap-1.5 shadow-2xs shrink-0 whitespace-nowrap tabular-nums ${(isBoom2D ? isBoomCompliant : bilateral.isCompliant) ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                {(isBoom2D ? isBoomCompliant : bilateral.isCompliant) ? <Check className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                <span>
                  {isBoom2D
                    ? `Desvio Setores: ${boomSectorDev.toFixed(1).replace('.', ',')}% · ISO 16122 (< 10%)`
                    : (bilateral.isCompliant ? `Desvio Esq. vs. Dir.: ${bilateral.bilateralDeviationPct.toFixed(1).replace('.', ',')}% · Conforme ISO 16122 (< 10%)` : `Desvio Esq. vs. Dir.: ${bilateral.bilateralDeviationPct.toFixed(1).replace('.', ',')}% (Limite ISO 16122: < 10%)`)}
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden max-h-[460px] overflow-y-auto pr-1">
          {visibleSlots.map((slot) => (
            <BentoSlotCharacteristicsRow
              key={slot.slotIndex} slot={slot}
              positionBadge={isBoom2D || isDroneUav ? `B${slot.slotIndex + 1}` : isCannon3d ? getCannonSlotBadge(slot, slot.slotIndex) : isManualLance ? getManualSlotBadge(slot, slot.slotIndex) : `N${slot.levelIndex ?? (slot.slotIndex + 1)}`}
              rampLabel={isTunnelAll ? getTunnelSideShortLabel(slot.sectionSide) : isPneumaticAll ? getPneumaticArmLabel(slot.sectionSide, slot.armIndex ?? 1) : isCannonAll ? getCannonGroupLabel(slot.sectionSide) : isDroneAll ? (isDroneSlotLeft(slot.slotIndex, profile.slots.length) ? 'Esquerda' : 'Direita') : undefined}
              isSelected={slot.slotIndex === selectedIndex} hideToggle={false}
              onSelect={() => onSelectSlot(slot.slotIndex)} onEditNozzle={() => onOpenDrawerForSlot(slot.slotIndex)}
              onEditMeasuredFlow={() => onOpenMeasuredFlowKeypad(slot.slotIndex)} onToggleActive={() => onToggleSlotActive(slot.slotIndex)}
            />
          ))}
        </div>

        {hasMoreSlots && (
          <button type="button" onClick={() => setShowAllSlots(true)} className="w-full min-h-[44px] px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#114037] font-extrabold text-xs flex items-center justify-center cursor-pointer transition-colors tabular-nums">
            Carregar todos os bicos ({listPool.length})
          </button>
        )}
      </div>

      {showAverageSummary && (
        <BentoSlotSummaryCards
          avgTabulatedFlowLMin={stats.avgTabulatedFlowLMin}
          totalFlowLMin={stats.totalFlowLMin}
          midLabel={isBoom2D ? 'Desvio Médio Entre Setores' : isTunnel3d ? 'Desvio Médio Entre Rampas (ISO 16122)' : isPneumatic3d ? 'Desvio Médio Entre Braços (ISO 16122)' : isDroneUav ? 'Desvio Médio Esq. vs. Dir. (ISO 16122)' : isManualLance ? 'Desvio Médio Entre Lanças (ISO 16122)' : 'Desvio Médio (ISO 16122)'}
          midValue={isBoom2D ? `${boomSectorDev.toFixed(1).replace('.', ',')}%` : isTunnel3d && tunnelDev ? `${tunnelDev.avgDeviationPct.toFixed(1).replace('.', ',')}%` : isPneumatic3d && pneuDev ? `${pneuDev.avgDeviationPct.toFixed(1).replace('.', ',')}%` : isCannon3d && cannonDev ? `${cannonDev.avgDeviationPct.toFixed(1).replace('.', ',')}%` : isDroneUav && droneDev ? `${droneDev.bilateralDeviationPct.toFixed(1).replace('.', ',')}%` : isManualLance && manualDev ? `${manualDev.avgDeviationPct.toFixed(1).replace('.', ',')}%` : (stats.avgDeviationPct !== null ? `${stats.avgDeviationPct > 0 ? '+' : ''}${String(stats.avgDeviationPct).replace('.', ',')}%` : '—')}
          midAlert={midAlert}
        />
      )}
    </div>
  );
};

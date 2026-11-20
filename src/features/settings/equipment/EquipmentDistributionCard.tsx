// src/features/settings/equipment/EquipmentDistributionCard.tsx
import React from 'react';
import { AlertTriangle, CheckCircle2, Pencil, Wind } from 'lucide-react';
import { THREE_D_EQUIPMENT_TYPES, type EquipmentRecord } from '../../../schemas/equipment.schema.ts';
import {
  calculateEffectiveBoomWidthM,
  calculateOptimalAirflow,
  getVentilationAlert,
  type VentilationAlertStatus
} from '../../../lib/equipment-math.ts';
import { EquipmentUavSummaryPanel } from './EquipmentUavSummaryPanel.tsx';

export interface EquipmentDistributionCardProps {
  equipment?: EquipmentRecord;
  activeCultureName?: string;
  activeTrvM3ha?: number;
  onEdit: () => void;
}

const ALERT_META: Record<VentilationAlertStatus, { badge: string; message: string; pillClass: string }> = {
  UNDER: {
    badge: 'Subventilação (< -20%)',
    message: 'Caudal de ar inferior ao recomendado para penetrar na copa (risco de subcobertura interna).',
    pillClass: 'bg-amber-400 text-slate-950'
  },
  OPTIMAL: {
    badge: 'Ventilação Ótima (±20%)',
    message: 'Caudal de ar equilibrado com o volume de copa (TRV) e a velocidade de avanço.',
    pillClass: 'bg-[#3CA64C] text-white'
  },
  OVER: {
    badge: 'Sobreventilação (> +20%)',
    message: 'Caudal de ar excessivo face à copa (risco elevado de deriva e atravessamento da sebe).',
    pillClass: 'bg-rose-500 text-white'
  }
};

export const EquipmentDistributionCard: React.FC<EquipmentDistributionCardProps> = ({
  equipment, activeCultureName, activeTrvM3ha, onEdit
}) => {
  const hasEq = Boolean(equipment);
  const is2D = equipment?.type === '2D_HORIZONTAL';
  const isManual = equipment?.type === 'MANUAL_LANCE';
  const is3D = equipment ? THREE_D_EQUIPMENT_TYPES.has(equipment.type) : false;
  const isUav = equipment?.type === 'UAV_DRONE';

  const effectiveWidthM = equipment ? calculateEffectiveBoomWidthM(equipment.workingWidthM, equipment.nozzleSpacingCm) : 0;
  const has2DAirSleeve = Boolean(is2D && (equipment?.airAssisted ?? (equipment?.defaultAirflowM3h && equipment.defaultAirflowM3h > 0)));
  const is3DFanActive = Boolean(is3D && equipment?.airAssisted !== false);
  const speed = equipment?.defaultSpeedKmh ?? 0;
  const actualAirflow = equipment?.defaultAirflowM3h ?? 0;
  const trv = activeTrvM3ha ?? 0;
  const optimalAirflow = is3DFanActive ? calculateOptimalAirflow(trv, speed) : 0;
  const alertState = getVentilationAlert(actualAirflow, optimalAirflow);
  const alertInfo = ALERT_META[alertState];

  const cells = isManual
    ? [
        { label: 'Nº Pistolas / Lanças', value: equipment ? `${equipment.lanceCount ?? equipment.workingWidthM} un.` : '—' },
        { label: 'Comprimento mangueira', value: equipment?.hoseLengthM ? `${String(equipment.hoseLengthM).replace('.', ',')} m` : 'Não indicado' },
        { label: 'Enrolador', value: equipment?.hasHoseReel === true ? 'Sim' : equipment?.hasHoseReel === false ? 'Não' : 'Não indicado' },
        { label: 'Pressão habitual (bar)', value: equipment ? `${String(equipment.defaultPressureBar).replace('.', ',')} bar` : '—' },
        { label: 'Ciclo legal IPP (PT)', value: '5 anos (Manual)' }
      ]
    : [
        { label: 'Nº Bicos', value: equipment ? `${String(equipment.workingWidthM).replace('.', ',')} bicos` : '—' },
        { label: 'Espaçamento (cm)', value: equipment ? `${String(equipment.nozzleSpacingCm).replace('.', ',')} cm` : '—' },
        { label: 'Pressão habitual (bar)', value: equipment ? `${String(equipment.defaultPressureBar).replace('.', ',')} bar` : '—' },
        { label: 'Velocidade (km/h)', value: equipment ? `${String(equipment.defaultSpeedKmh).replace('.', ',')} km/h` : '—' },
        is2D
          ? { label: 'Assistência de ar', value: has2DAirSleeve ? `Manga de ar${actualAirflow > 0 ? ` · ${actualAirflow.toLocaleString('pt-PT')} m³/h` : ''}` : 'Sem manga de ar' }
          : isUav
            ? { label: 'Faixa efetiva', value: `${String(effectiveWidthM).replace('.', ',')} m` }
            : {
                label: 'Caudal de ar do ventilador',
                value: !hasEq ? '—' : !is3DFanActive ? 'Ventilador desligado' : equipment?.defaultAirflowM3h !== undefined ? `${equipment.defaultAirflowM3h.toLocaleString('pt-PT')} m³/h` : 'Não indicado'
              }
      ];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-soft border border-slate-200 flex flex-col justify-between space-y-4 h-full">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Wind className="w-4 h-4 text-[#1D734B] shrink-0" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#114037]">Distribuição e aerodinâmica</h4>
              <p className="text-[11px] text-slate-500">Geometria de distribuição, regime operacional e assistência de ar</p>
            </div>
          </div>
          <button type="button" disabled={!hasEq} onClick={onEdit}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold text-[#114037] flex items-center gap-1 shrink-0 disabled:opacity-40">
            <Pencil className="w-3.5 h-3.5 text-[#1D734B]" />
            <span>Editar</span>
          </button>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono-numbers">
          {cells.map((c) => (
            <div key={c.label} className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
              <dt className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">{c.label}</dt>
              <dd className="font-bold text-slate-900 break-words leading-snug mt-0.5">{c.value}</dd>
            </div>
          ))}
        </dl>

        {isManual ? (
          <div className="p-4 rounded-2xl bg-[#114037] text-white space-y-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 block">
              Perfil de Pulverização Manual (Pistolas / Lanças)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono-numbers">
              <div className="p-2.5 rounded-xl bg-white/10">
                <span className="text-[10px] font-sans text-emerald-200 block">Órgãos de Aplicação</span>
                <span className="text-base font-black text-[#3CA64C]">{equipment?.lanceCount ?? equipment?.workingWidthM ?? 1} pistola(s)/lança(s){equipment?.hoseLengthM ? ` · ${equipment.hoseLengthM} m` : ''}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10">
                <span className="text-[10px] font-sans text-emerald-200 block">Regime Legal IPP (Portugal)</span>
                <span className="text-sm font-black">Ciclo de 5 anos (DL 86/2010 · DL 78/2020)</span>
              </div>
            </div>
            <p className="text-[11px] text-emerald-100 leading-snug">
              Os equipamentos exclusivamente de pulverização manual operam por débito cronometrado da lança e não utilizam índices de parede foliar (LWA) nem volume de copa (TRV).
            </p>
          </div>
        ) : is2D ? (
          <div className="p-4 rounded-2xl bg-[#114037] text-white space-y-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 block">Perfil Operacional 2D · Barra Horizontal</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono-numbers">
              <div className="p-2.5 rounded-xl bg-white/10">
                <span className="text-[10px] font-sans text-emerald-200 block">Largura Efetiva</span>
                <span className="text-base font-black text-[#3CA64C]">{String(effectiveWidthM).replace('.', ',')} m</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10">
                <span className="text-[10px] font-sans text-emerald-200 block">Regime de Ar</span>
                <span className="text-sm font-black">
                  {has2DAirSleeve ? `Manga de ar${actualAirflow > 0 ? ` · ${actualAirflow.toLocaleString('pt-PT')} m³/h` : ''}${equipment?.airCurtainAngle ? ` · ${equipment.airCurtainAngle}` : ''}` : 'Hidráulica convencional (sem manga de ar)'}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-emerald-100 leading-snug">
              As barras horizontais 2D aplicam calda por área de solo e não utilizam índices de parede foliar (LWA) nem volume de copa (TRV).
            </p>
          </div>
        ) : isUav ? (
          <EquipmentUavSummaryPanel equipment={equipment} effectiveWidthM={effectiveWidthM} />
        ) : (
          <div className="p-4 rounded-2xl bg-[#114037] text-white space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">Motor Aerodinâmico 3D · Q_ar,ótimo = 0,10 × TRV × v</span>
              {is3DFanActive && optimalAirflow > 0 && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${alertInfo.pillClass}`}>
                  {alertState === 'OPTIMAL' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  <span>{alertInfo.badge}</span>
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 font-mono-numbers">
              <div className="p-2.5 rounded-xl bg-white/10">
                <span className="text-[10px] font-sans text-emerald-200 block">Parcela / TRV Ativo</span>
                <span className="text-sm font-black">{trv > 0 ? `${trv.toLocaleString('pt-PT')} m³/ha${activeCultureName ? ` (${activeCultureName})` : ''}` : 'TRV não definido'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10">
                <span className="text-[10px] font-sans text-emerald-200 block">Caudal de Ar Ótimo (Q_ar,ótimo)</span>
                <span className="text-base font-black text-[#3CA64C]">{!is3DFanActive ? 'Ventilador desligado' : optimalAirflow > 0 ? `${optimalAirflow.toLocaleString('pt-PT')} m³/h` : '— m³/h'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10">
                <span className="text-[10px] font-sans text-emerald-200 block">Caudal Configurado vs. Faixa ±20%</span>
                <span className="text-sm font-black">
                  {!is3DFanActive ? '0 m³/h (Desativado)' : optimalAirflow > 0 ? `${actualAirflow.toLocaleString('pt-PT')} m³/h (${Math.round(optimalAirflow * 0.8)}–${Math.round(optimalAirflow * 1.2)})` : `${actualAirflow.toLocaleString('pt-PT')} m³/h`}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-emerald-100 leading-snug">
              {!is3DFanActive ? (equipment?.type === '3D_AXIAL' ? 'Barras verticais sem ventilação: assistência de ar desativada (sem alerta de subventilação).' : 'A assistência de ar encontra-se desativada nesta ficha 3D.') : optimalAirflow > 0 ? alertInfo.message : 'Registe a altura, largura de copa e entrelinha no menu Cultura para calcular automaticamente o caudal de ar ótimo.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

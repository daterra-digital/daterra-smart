// src/features/settings/EquipmentIppAlertsPanel.tsx
import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AlertTriangle, CheckCircle2, ShieldAlert, Wrench } from 'lucide-react';
import { db } from '../../db/dexie-db.ts';
import type { ProfileCulture } from '../../db/types.ts';
import type { EquipmentRecord } from '../../schemas/equipment.schema.ts';
import { evaluateEquipmentIppStatus, type IppEvaluationResult } from '../../lib/equipment-ipp-rules.ts';
import { EQUIPMENT_TYPE_META } from './equipment/equipmentFormHelpers.ts';

const IPP_ALERTS_STORAGE_KEY = 'daterra_ipp_alerts_enabled_v1';

export interface EquipmentIppAlertsPanelProps {
  userId?: string;
}

export const EquipmentIppAlertsPanel: React.FC<EquipmentIppAlertsPanelProps> = ({ userId = '' }) => {
  const [ippAlertsEnabled, setIppAlertsEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.localStorage) return true;
    const raw = window.localStorage.getItem(IPP_ALERTS_STORAGE_KEY);
    return raw === null ? true : raw === 'true';
  });

  const handleToggleIppAlerts = (checked: boolean) => {
    setIppAlertsEnabled(checked);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(IPP_ALERTS_STORAGE_KEY, String(checked));
    }
  };

  const cultures =
    useLiveQuery<ProfileCulture[]>(
      () => (userId.trim() ? db.profiles_cultures.where('userId').equals(userId.trim()).toArray() : []),
      [userId]
    ) || [];

  const equipments =
    useLiveQuery<EquipmentRecord[]>(async () => {
      if (!userId.trim()) return [];
      const all = await db.equipments.toArray();
      return all.filter((e) => !e.userId || e.userId === userId.trim());
    }, [userId]) || [];

  const countryCode = useMemo(() => {
    return cultures[0]?.country_code || 'PT';
  }, [cultures]);

  const activeAlerts = useMemo(() => {
    if (countryCode !== 'PT') return [];
    const results: Array<{ equipment: EquipmentRecord; ipp: IppEvaluationResult }> = [];
    for (const eq of equipments) {
      const ipp = evaluateEquipmentIppStatus(eq, { countryCode });
      if (ipp.status === 'EXPIRED' || ipp.status === 'EXPIRING_SOON' || ipp.status === 'YEAR_ALERT') {
        results.push({ equipment: eq, ipp });
      }
    }
    return results;
  }, [equipments, countryCode]);

  return (
    <div className="space-y-3 pt-2 border-t border-slate-100">
      <div className="flex items-center justify-between p-4 sm:p-5 bg-slate-50 hover:bg-slate-100/70 transition-colors rounded-2xl border border-slate-200">
        <div className="pr-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-[#114037] text-xs sm:text-sm block">
              Inspeção Periódica de Pulverizadores (IPP — DL 86/2010 / DL 78/2020)
            </span>
            <span className="bg-emerald-100 text-[#114037] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
              Portugal · 3 ou 5 anos
            </span>
          </div>
          <span className="text-xs text-slate-600 block mt-1 leading-relaxed">
            Alertas automáticos de validade legal da inspeção IPP (3 anos geral; 5 anos para pistolas e lanças manuais) e aviso preventivo por ano de construção.
          </span>
        </div>
        <label className="w-12 h-12 flex items-center justify-center shrink-0 cursor-pointer touch-target rounded-xl hover:bg-slate-200/50 transition-colors">
          <input
            type="checkbox"
            checked={ippAlertsEnabled}
            onChange={(e) => handleToggleIppAlerts(e.target.checked)}
            aria-label="Ativar alertas de Inspeção Periódica de Pulverizadores (IPP)"
            className="w-5 h-5 rounded-md accent-[#114037] cursor-pointer"
          />
        </label>
      </div>

      {ippAlertsEnabled && countryCode === 'PT' && (
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#114037]">
              Alertas IPP Ativos na Frota ({activeAlerts.length})
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Janela preventiva: 90 dias
            </span>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-[#3CA64C] shrink-0" />
              <span>
                Nenhum alerta IPP vencido ou a expirar nos próximos 90 dias nas máquinas registadas.
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {activeAlerts.map(({ equipment: eq, ipp }) => {
                const meta = EQUIPMENT_TYPE_META[eq.type];
                const isExpired = ipp.status === 'EXPIRED';
                return (
                  <div
                    key={eq.id}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                      isExpired
                        ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                        : 'bg-amber-50/90 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isExpired ? (
                          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                        <span className="text-xs font-extrabold">{eq.name}</span>
                        {meta && (
                          <span className="px-2 py-0.5 rounded-md bg-[#114037] text-white text-[10px] font-bold">
                            {meta.badge} · {meta.shortLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium leading-snug">{ipp.summaryMessage}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-current/20 text-[10px] font-extrabold shrink-0 flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      <span>{ipp.badgeText}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Award, AlertTriangle, Pencil } from 'lucide-react';
import type { IrdCertifiedDriftReduction } from './irdOriginTypes.ts';
import type { AnyIrdKeypadField } from './irdKeypadMeta.ts';

interface IrdCertifiedReductionPanelProps {
  readonly value: IrdCertifiedDriftReduction;
  readonly onChange: (patch: Partial<IrdCertifiedDriftReduction>) => void;
  readonly onOpenKeypad: (field: Extract<AnyIrdKeypadField, 'certifiedDriftReductionPct'>) => void;
}

const REDUCTION_TYPES = ['', 'Deriva', 'Deriva fina'] as const;
const PCT_PRESETS = [50, 75, 90, 95] as const;

export const IrdCertifiedReductionPanel: React.FC<IrdCertifiedReductionPanelProps> = ({
  value,
  onChange,
  onOpenKeypad
}) => {
  const isDoc = value.status === 'documented';
  const uiStatus = !isDoc
    ? 'unknown'
    : value.source === 'documented_catalog'
      ? 'certified'
      : value.source === 'profile'
        ? 'profile'
        : 'manufacturer';

  const uiScope =
    value.scope === 'nozzle_variant'
      ? 'bico'
      : value.coveredTargetOrNozzle === 'Equipamento'
        ? 'equipamento'
        : 'conjunto';

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#114037]" aria-hidden="true" />
          <span className="text-xs font-extrabold text-slate-900">Redução de deriva certificada</span>
        </div>
        <select
          id="ird-cert-status"
          aria-label="Estado da redução de deriva certificada"
          value={uiStatus}
          onChange={(e) => {
            const v = e.target.value;
            if (v === 'unknown') onChange({ status: 'unknown', reductionPct: null });
            else if (v === 'certified') onChange({ status: 'documented', source: 'documented_catalog' });
            else if (v === 'profile') onChange({ status: 'documented', source: 'profile' });
            else onChange({ status: 'documented', source: 'user_declaration' });
          }}
          className="touch-target rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-900"
        >
          <option value="unknown">Desconhecido</option>
          <option value="manufacturer">Declarado pelo fabricante</option>
          <option value="certified">Certificado / validado</option>
          {value.source === 'profile' && <option value="profile">Registo de perfil</option>}
        </select>
      </div>

      {isDoc && (
        <div className="space-y-2.5 pt-2 border-t border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="ird-cert-scope" className="block text-[11px] font-bold text-slate-700 mb-1">Âmbito</label>
              <select
                id="ird-cert-scope"
                value={uiScope}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === 'bico') onChange({ scope: 'nozzle_variant', coveredTargetOrNozzle: 'Bico' });
                  else if (v === 'equipamento') onChange({ scope: 'equipment_technique', coveredTargetOrNozzle: 'Equipamento' });
                  else onChange({ scope: 'equipment_technique', coveredTargetOrNozzle: 'Conjunto bico + equipamento' });
                }}
                className="touch-target w-full rounded-xl border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-900"
              >
                <option value="bico">Bico</option>
                <option value="equipamento">Equipamento</option>
                <option value="conjunto">Conjunto bico + equipamento</option>
              </select>
            </div>

            <div>
              <label htmlFor="ird-cert-type" className="block text-[11px] font-bold text-slate-700 mb-1">Tipo de redução</label>
              <select
                id="ird-cert-type"
                value={REDUCTION_TYPES.includes(value.reductionClassText as typeof REDUCTION_TYPES[number]) ? value.reductionClassText : ''}
                onChange={(e) => onChange({ reductionClassText: e.target.value })}
                className="touch-target w-full rounded-xl border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-900"
              >
                <option value="">Não especificado</option>
                <option value="Deriva">Deriva</option>
                <option value="Deriva fina">Deriva fina</option>
              </select>
            </div>

            <div>
              <label htmlFor="ird-cert-origin" className="block text-[11px] font-bold text-slate-700 mb-1">Fonte / documento</label>
              <select
                id="ird-cert-origin"
                value={value.source}
                onChange={(e) => onChange({ source: e.target.value as IrdCertifiedDriftReduction['source'] })}
                className="touch-target w-full rounded-xl border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-900"
              >
                <option value="user_declaration">Declaração / ficha do fabricante</option>
                <option value="documented_catalog">Catálogo técnico / certificado</option>
                <option value="profile">Registo de perfil</option>
              </select>
            </div>

            <div>
              <span className="block text-[11px] font-bold text-slate-700 mb-1">Percentagem declarada</span>
              <div className="flex items-center gap-1.5">
                <select
                  id="ird-cert-pct"
                  aria-label="Percentagem declarada de redução de deriva"
                  value={typeof value.reductionPct === 'number' && PCT_PRESETS.includes(value.reductionPct as 50 | 75 | 90 | 95) ? String(value.reductionPct) : ''}
                  onChange={(e) => onChange({ reductionPct: e.target.value ? Number(e.target.value) : null })}
                  className="touch-target flex-1 rounded-xl border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-900"
                >
                  <option value="">Não indicada</option>
                  {PCT_PRESETS.map((p) => <option key={p} value={String(p)}>{p}%</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => onOpenKeypad('certifiedDriftReductionPct')}
                  aria-label="Introduzir outra percentagem no teclado"
                  className="touch-target px-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span className="font-mono-numbers">{typeof value.reductionPct === 'number' ? `${value.reductionPct}%` : 'Outra'}</span>
                  <Pencil className="w-3 h-3 text-slate-500" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {value.source === 'user_declaration' && (
            <div role="note" className="rounded-xl bg-amber-50 border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-950 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>Declaração do utilizador — não constitui certificação verificada nem validação automática.</span>
            </div>
          )}

          <p className="text-xs font-bold text-[#114037] bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            Informação registada; não aplicada à pontuação nesta versão (apenas rastreabilidade; não garante segurança nem autoriza pulverização).
          </p>
        </div>
      )}
    </div>
  );
};

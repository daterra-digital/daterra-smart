// src/features/weather/components/HourlyDetailCard.tsx
import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { HourlyForecastItem, SprayEvaluation } from '../types.ts';
import type { ActiveMachineContext } from '../weatherWeekAggregator.ts';
import { adaptSprayEvaluation } from '../utils/sprayPresentationAdapter.ts';
import { formatDecimalPt, parseWindDirection } from '../utils/windDirection.ts';
import { evaluateHourWithProfileContext } from '../utils/irdOperationalThresholds.ts';

interface HourlyDetailCardProps {
  hour: HourlyForecastItem;
  evaluation: SprayEvaluation;
  context?: ActiveMachineContext | null;
}

interface HourlyAlertSummary {
  severity: 'optimal' | 'marginal' | 'unfavorable';
  title: string;
  detail: string;
}

function resolveSingleHourlyAlert(
  hour: HourlyForecastItem,
  adaptedLevel: 'optimal' | 'marginal' | 'unfavorable',
  badgeLabel: string,
  irdPct: number | null,
  limitPct: number,
  isUav: boolean
): HourlyAlertSummary {
  if (hour.precipitationMm > 0.2) {
    return { severity: 'unfavorable', title: 'Adiar pulverização por precipitação', detail: 'Precipitação ativa provoca lavagem imediata da calda antes da secagem foliar.' };
  }
  if (isUav && hour.windSpeedKmh > 15.0) {
    return { severity: 'unfavorable', title: 'Adiar pulverização por vento', detail: 'Vento acima de 15 km/h interdita a operação aérea com Drone UAV.' };
  }
  if (adaptedLevel === 'unfavorable' && hour.deltaT > 10) {
    return { severity: 'unfavorable', title: 'Adiar pulverização por ΔT elevado', detail: 'Ar demasiado seco acelera a evaporação das gotas antes de atingirem a cultura.' };
  }
  if (adaptedLevel === 'unfavorable' && hour.windGustsKmh > 25) {
    return { severity: 'unfavorable', title: 'Adiar pulverização por rajadas de vento', detail: 'Rajadas fortes geram turbulência e aumentam a deriva fora da parcela tratada.' };
  }
  if (irdPct !== null && (irdPct > 100 || (limitPct === 30 ? irdPct > 50 : irdPct > limitPct))) {
    return { severity: 'unfavorable', title: 'Adiar pulverização por índice de risco de deriva', detail: 'Índice de risco de deriva excede o patamar aceitável para o perfil e zona sensível.' };
  }
  if (adaptedLevel === 'unfavorable') {
    return { severity: 'unfavorable', title: 'Adiar pulverização por vento', detail: 'Velocidade do vento excede o limite operacional para aplicação segura na hora selecionada.' };
  }
  if (hour.deltaT < 2.0) {
    return { severity: 'marginal', title: 'Atenção: ΔT baixo', detail: 'Evaporação reduzida aumenta o risco de escorrimento foliar ou suspensão prolongada da calda.' };
  }
  if (limitPct === 30 && irdPct !== null && irdPct > 30) {
    return { severity: 'marginal', title: 'Atenção: risco moderado junto a zona sensível', detail: 'Entre 31% e 50% junto a zona sensível exige bicos SDRT 75–90% e janela ótima.' };
  }
  if (irdPct !== null && irdPct >= 60 && irdPct <= 75) {
    return { severity: 'marginal', title: 'Atenção: vento elevado', detail: 'Risco moderado entre 60% e 75% exige medidas corretivas imediatas de redução de deriva.' };
  }
  if (adaptedLevel === 'marginal' && badgeLabel.toLowerCase().includes('evap')) {
    return { severity: 'marginal', title: 'Atenção: ΔT elevado', detail: 'Evaporação rápida recomenda bicos de indução de ar e redução da pressão.' };
  }
  if (adaptedLevel === 'marginal') {
    return { severity: 'marginal', title: 'Atenção: vento elevado', detail: 'Vento moderado exige controlo rigoroso da velocidade de avanço e da altura de aplicação.' };
  }
  return { severity: 'optimal', title: 'Condições favoráveis para pulverização', detail: 'Parâmetros horários dentro das faixas recomendadas para uma aplicação fitossanitária segura.' };
}

export const HourlyDetailCard: React.FC<HourlyDetailCardProps> = ({ hour, evaluation, context }) => {
  const adapted = adaptSprayEvaluation(evaluation, context);
  const windDir = parseWindDirection(hour.telemetryQuality?.rawWindDirectionDeg ?? hour.windDirectionDeg);

  const profileRes = useMemo(() => evaluateHourWithProfileContext(evaluation, hour, context), [evaluation, hour, context]);
  const alert = resolveSingleHourlyAlert(
    hour,
    profileRes.evaluation.level === 'optimal' && adapted.level !== 'optimal' ? adapted.level : profileRes.evaluation.level,
    profileRes.evaluation.badgeLabel || adapted.badgeLabel,
    profileRes.irdPct,
    profileRes.acceptableLimitPct,
    Boolean(context?.isUavEquipment)
  );
  const alertCls = alert.severity === 'optimal'
    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
    : alert.severity === 'marginal'
    ? 'bg-amber-50 border-amber-200 text-amber-950'
    : 'bg-rose-50 border-rose-200 text-rose-950';

  return (
    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 text-slate-900 space-y-3">
      <div className="pb-2 border-b border-slate-200/60">
        <span className="font-black text-sm sm:text-base text-[#114037] font-mono-numbers tabular-nums">
          Hora {hour.timeFormatted}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/80 shadow-2xs min-h-[76px]">
          <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wide">Temperatura / HR</span>
          <strong className="font-mono-numbers tabular-nums text-sm sm:text-base font-black text-slate-900 mt-0.5 block">
            {formatDecimalPt(hour.temperatureC)} °C · {hour.humidityPercent}%
          </strong>
        </div>
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/80 shadow-2xs min-h-[76px]">
          <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wide">Delta T (ΔT)</span>
          <strong className="font-mono-numbers tabular-nums text-sm sm:text-base font-black text-slate-900 mt-0.5 block">
            {formatDecimalPt(hour.deltaT)} °C
          </strong>
        </div>
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/80 shadow-2xs min-h-[76px]">
          <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wide">Vento / Rajada / Dir.</span>
          <strong className="font-mono-numbers tabular-nums text-sm sm:text-base font-black text-slate-900 mt-0.5 block">
            {formatDecimalPt(hour.windSpeedKmh)} / {formatDecimalPt(hour.windGustsKmh)} km/h {windDir ? `· ${windDir.cardinalOrigin}` : ''}
          </strong>
        </div>
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/80 shadow-2xs min-h-[76px]">
          <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wide">IRD (Limiar {profileRes.acceptableLimitPct}%)</span>
          <strong className="font-mono-numbers tabular-nums text-sm sm:text-base font-black text-[#114037] mt-0.5 block">
            {profileRes.irdPct !== null ? `${profileRes.irdPct}%` : '—'}
          </strong>
        </div>
      </div>

      <div className={`rounded-xl border px-3.5 py-2.5 flex items-start gap-2.5 text-xs min-h-[64px] ${alertCls}`}>
        {alert.severity === 'optimal' ? <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" /> : alert.severity === 'marginal' ? <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />}
        <div>
          <span className="font-black block">{alert.title}</span>
          <span className="font-medium opacity-95">{alert.detail}</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Wind, Gauge, Thermometer, Droplets, CloudRain } from 'lucide-react';
import type { DriftReadingEvaluation } from '../weather/utils/weatherDriftTypes.ts';

interface IrdMeteoChipsProps {
  readonly weatherEval: DriftReadingEvaluation;
}

interface ChipItem {
  readonly id: 'wind' | 'gust' | 'deltaT' | 'humidity' | 'precip';
  readonly valueText: string;
  readonly srText: string;
  readonly detailPt: string;
  readonly Icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}

export const IrdMeteoChips: React.FC<IrdMeteoChipsProps> = ({ weatherEval }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const chips: readonly ChipItem[] = [
    {
      id: 'wind',
      valueText: `${weatherEval.windKmh ?? '—'} km/h`,
      srText: `Vento médio a 10 metros: ${weatherEval.windKmh ?? 'indisponível'} km/h`,
      detailPt: `Vento médio (10 m): ${weatherEval.windKmh ?? '—'} km/h · entrada direta da previsão ou campo.`,
      Icon: Wind
    },
    {
      id: 'gust',
      valueText: `${weatherEval.gustsKmh ?? 'N/D'} km/h`,
      srText: `Rajada máxima a 10 metros: ${weatherEval.gustsKmh ?? 'não disponível'} km/h`,
      detailPt: `Rajada máxima (10 m): ${weatherEval.gustsKmh ?? 'N/D'} km/h · entrada direta (peso 30% no vento efetivo).`,
      Icon: Gauge
    },
    {
      id: 'deltaT',
      valueText: `${weatherEval.deltaTC ?? '—'} °C`,
      srText: `Delta T: ${weatherEval.deltaTC ?? 'indisponível'} graus Celsius`,
      detailPt: `Delta T (ΔT): ${weatherEval.deltaTC ?? '—'} °C · derivada de temperatura e humidade relativa.`,
      Icon: Thermometer
    },
    {
      id: 'humidity',
      valueText: `${weatherEval.humidityPct ?? '—'} %`,
      srText: `Humidade relativa: ${weatherEval.humidityPct ?? 'indisponível'} por cento`,
      detailPt: `Humidade relativa (2 m): ${weatherEval.humidityPct ?? '—'}% · entrada direta usada para ΔT.`,
      Icon: Droplets
    },
    {
      id: 'precip',
      valueText: `${weatherEval.precipMm ?? '—'} mm`,
      srText: `Precipitação acumulada: ${weatherEval.precipMm ?? 'indisponível'} milímetros`,
      detailPt: `Precipitação acumulada (intervalo): ${weatherEval.precipMm ?? '—'} mm · entrada direta.`,
      Icon: CloudRain
    }
  ];

  const activeChip = chips.find((c) => c.id === activeId);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Variáveis meteorológicas da leitura">
        {chips.map(({ id, valueText, srText, detailPt, Icon }) => {
          const expanded = activeId === id;
          return (
            <button
              key={id}
              type="button"
              title={detailPt}
              aria-expanded={expanded}
              aria-controls={expanded ? 'ird-meteo-chip-detail' : undefined}
              onClick={() => setActiveId((prev) => (prev === id ? null : id))}
              onPointerEnter={(e) => { if (e.pointerType === 'mouse') setActiveId(id); }}
              onPointerLeave={(e) => { if (e.pointerType === 'mouse') setActiveId((prev) => (prev === id ? null : prev)); }}
              onFocus={() => setActiveId(id)}
              onBlur={() => setActiveId((prev) => (prev === id ? null : prev))}
              className={`touch-target px-2.5 py-1.5 rounded-xl border text-xs font-mono-numbers font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                expanded ? 'bg-white text-[#114037] border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden={true} />
              <span>{valueText}</span>
              <span className="sr-only">{srText}</span>
            </button>
          );
        })}
      </div>

      {activeChip && (
        <div id="ird-meteo-chip-detail" role="status" className="rounded-xl bg-black/25 border border-white/15 px-3 py-1.5 text-[11px] font-medium text-emerald-50">
          {activeChip.detailPt}
        </div>
      )}
    </div>
  );
};

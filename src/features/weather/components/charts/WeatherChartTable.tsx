// src/features/weather/components/charts/WeatherChartTable.tsx
import React from 'react';
import type { HourlyForecastItem } from '../../types.ts';
import { formatDecimalPt } from '../../utils/windDirection.ts';

interface WeatherChartTableProps {
  hours: HourlyForecastItem[];
  showDeltaT?: boolean;
}

export const WeatherChartTable: React.FC<WeatherChartTableProps> = ({ hours, showDeltaT = false }) => {
  if (!hours.length) {
    return (
      <div className="py-6 text-center text-xs text-slate-400 font-medium">
        Não existem dados disponíveis para apresentação tabular.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 mt-4">
      <table className="w-full text-left border-collapse text-xs">
        <caption className="sr-only">Tabela detalhada de previsão horária</caption>
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
            <th scope="col" className="py-3 px-3.5">Hora</th>
            <th scope="col" className="py-3 px-3 text-right">Temp. (°C)</th>
            {showDeltaT && <th scope="col" className="py-3 px-3 text-right text-purple-800">ΔT (°C)</th>}
            <th scope="col" className="py-3 px-3 text-right">Chuva (mm)</th>
            <th scope="col" className="py-3 px-3 text-right">Prob. (%)</th>
            <th scope="col" className="py-3 px-3 text-right">Vento (km/h)</th>
            <th scope="col" className="py-3 px-3 text-right">Rajadas (km/h)</th>
            <th scope="col" className="py-3 px-3.5 text-right">Humidade (%)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {hours.map((h) => (
            <tr key={h.timeIso} className="hover:bg-slate-50/70 transition-colors">
              <th scope="row" className="py-2.5 px-3.5 font-mono font-bold text-slate-800">
                {h.timeFormatted}
              </th>
              <td className="py-2.5 px-3 text-right font-mono-numbers text-slate-900 font-bold">
                {h.temperatureC}°C
              </td>
              {showDeltaT && (
                <td className="py-2.5 px-3 text-right font-mono-numbers text-purple-700 font-bold">
                  {h.deltaT}°C
                </td>
              )}
              <td className="py-2.5 px-3 text-right font-mono-numbers text-sky-700 font-medium">
                {formatDecimalPt(h.precipitationMm)} mm
              </td>
              <td className="py-2.5 px-3 text-right font-mono-numbers text-slate-600">
                {h.precipitationProbability}%
              </td>
              <td className="py-2.5 px-3 text-right font-mono-numbers text-slate-700">
                {h.windSpeedKmh} km/h
              </td>
              <td className="py-2.5 px-3 text-right font-mono-numbers text-slate-500">
                {h.windGustsKmh} km/h
              </td>
              <td className="py-2.5 px-3.5 text-right font-mono-numbers text-teal-700">
                {h.humidityPercent}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

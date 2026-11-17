import React from 'react';
import { Clock } from 'lucide-react';
import type { FavorableDriftSummary } from '../utils/weatherDriftTypes.ts';

interface WeatherDriftWindowsCardProps {
  readonly favorable: FavorableDriftSummary;
}

export const WeatherDriftWindowsCard: React.FC<WeatherDriftWindowsCardProps> = ({ favorable }) => (
  <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-slate-200 space-y-3">
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-[#114037]" aria-hidden="true" />
      <h2 className="text-base font-extrabold text-[#114037]">Janelas meteorológicas para planear o tratamento</h2>
    </div>
    {favorable.periods.length > 0 ? (
      <div className="space-y-2">
        {favorable.periods.map((w, i) => (
          <div
            key={w.startIso}
            className={`rounded-2xl px-4 py-3 border text-xs ${i === 0 ? 'bg-[#eef8f0] border-emerald-400 text-[#114037]' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 font-extrabold">
              <span>
                {i === 0 ? 'Próxima janela · ' : ''}{w.dayLabelPt}:{' '}
                <span className="font-mono-numbers">{w.startTime} – {w.endTime} ({w.hoursCount} h · máx. {w.maxScore} pts)</span>
              </span>
            </div>
            <p className="text-[11px] opacity-90 mt-0.5 font-mono-numbers">{w.rationalePt}</p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-xs font-semibold text-amber-950 bg-amber-50 border border-amber-200 rounded-2xl p-3">
        {favorable.unavailableReason === 'stale_or_legacy_cache'
          ? 'Janelas indisponíveis: leitura local expirada ou sem metadados completos de integridade.'
          : favorable.unavailableReason === 'insufficient_forecast'
            ? `Previsão insuficiente (${favorable.validHoursCount} h válidas disponíveis; mínimo de 2 h futuras contínuas).`
            : favorable.hasSingleIsolatedHour
              ? 'Nenhuma janela contínua encontrada (apenas 1 hora isolada em patamar Baixo <= 25 pts).'
              : 'Nenhuma janela meteorológica contínua (<= 25 pts por >= 2 h) encontrada na previsão.'}
      </p>
    )}
    <p className="text-xs text-slate-600">
      Confirme as condições no local e as indicações do rótulo. (A ausência de janela não equivale a proibição legal; a presença não garante segurança nem autoriza aplicação.)
    </p>
  </div>
);

// src/features/weather/components/WeeklySprayDecisionCard.tsx
import React from 'react';
import { Clock, Calendar, AlertTriangle, CheckCircle2, XCircle, Info, WifiOff } from 'lucide-react';
import type { WeeklySpraySchedule } from '../weatherWeekAggregator';

interface WeeklySprayDecisionCardProps {
  schedule: WeeklySpraySchedule;
  isCached?: boolean;
  updatedAt?: string;
  hasNetworkError?: boolean;
}

export const WeeklySprayDecisionCard: React.FC<WeeklySprayDecisionCardProps> = ({
  schedule,
  isCached,
  updatedAt,
  hasNetworkError
}) => {
  const { todayDecision, nextBestWindow, safeDays, limitingFactorsToday } = schedule;

  const isOptimal = todayDecision.level === 'optimal';
  const isMarginal = todayDecision.level === 'marginal';

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-soft space-y-5">
      {/* Topo do Cartão: Título e Avisos de Conexão */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Decisão Fitossanitária
          </h2>
          <p className="text-xs text-slate-500">
            Cruzamento meteorológico em tempo real com o perfil do pulverizador e bicos
          </p>
        </div>

        {/* Indicador de Estado de Rede / Cache */}
        {hasNetworkError ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <WifiOff className="w-3.5 h-3.5" />
            Previsão indisponível (Sem ligação)
          </span>
        ) : isCached ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-950 border border-amber-200">
            <Info className="w-3.5 h-3.5 text-amber-600" />
            Dados em cache desatualizados ({updatedAt ? `Leitura de ${updatedAt}` : 'Modo Offline'})
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Em direto ({updatedAt || 'Agora'})
          </span>
        )}
      </div>

      {/* Grelha dos 4 Blocos da Decisão */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bloco 1: Decisão para Hoje */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isOptimal
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : isMarginal
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-rose-50/70 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Decisão para Hoje
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wide ${
                isOptimal
                  ? 'bg-emerald-600 text-white'
                  : isMarginal
                  ? 'bg-amber-200 text-amber-900'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {isOptimal ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : isMarginal ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              {isOptimal ? 'Ótimo' : isMarginal ? 'Atenção' : 'Adiar'}
            </span>
          </div>
          <div className="font-extrabold text-sm mb-1">{todayDecision.title}</div>
          <p className="text-xs leading-relaxed opacity-90">{todayDecision.reason}</p>
        </div>

        {/* Bloco 2: Próxima Melhor Janela */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              <Clock className="w-3.5 h-3.5 text-slate-600" />
              <span>Próxima Melhor Janela (≥ 2h)</span>
            </div>
            {nextBestWindow.available ? (
              <div className="space-y-1">
                <div className="text-sm font-extrabold text-slate-900">
                  {nextBestWindow.dayLabel} • {nextBestWindow.timeRange}
                </div>
                <p className="text-xs text-slate-600">
                  {nextBestWindow.description}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                Nenhuma janela contínua favorável (≥ 2h) identificada nas próximas 48 horas sob os limiares atuais.
              </p>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-medium">
            Janela calculada no intervalo operacional das 06:00 às 20:00.
          </div>
        </div>

        {/* Bloco 3: Dias com Janelas Seguras */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-800">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            <span>Dias com Janelas Seguras (7 Dias)</span>
          </div>
          {safeDays.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {safeDays.map((d, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {d}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-600">
              Sem dias com janelas contínuas de 2 horas favoráveis na previsão semanal.
            </p>
          )}
        </div>

        {/* Bloco 4: Fatores Limitantes Atuais */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-800">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Fatores Limitantes Atuais</span>
          </div>
          {limitingFactorsToday.length > 0 ? (
            <ul className="text-xs space-y-1 text-slate-700">
              {limitingFactorsToday.map((fact, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Nenhum fator crítico de bloqueio ativo neste momento.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

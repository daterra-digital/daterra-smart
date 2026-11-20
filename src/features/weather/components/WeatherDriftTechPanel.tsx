import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface WeatherDriftTechPanelProps {
  readonly allowIrd: boolean;
  readonly timezoneLabel: string;
}

export const WeatherDriftTechPanel: React.FC<WeatherDriftTechPanelProps> = ({ allowIrd, timezoneLabel }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="touch-target w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 cursor-pointer">
        <span className="text-xs sm:text-sm font-extrabold text-[#114037]">Detalhes Técnicos e Critérios</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-100 text-xs text-slate-700 space-y-2.5 leading-relaxed">
          <p>• <strong>O que representa vs não representa:</strong> modelo heurístico orientador em escala adimensional (10–100 pts) sobre risco meteorológico à altura de referência da previsão (10 m vento, 2 m temp./humidade). Não mede deposição física fora do alvo (ISO 22866), não inclui bico, pressão, altura de barra ou exposição e não autoriza tratamentos.</p>
          <p>• <strong>Entradas diretas vs derivadas:</strong> entradas da API/cache em unidades reais — vento médio (km/h), rajada máxima (km/h), temperatura (°C), humidade relativa (%) e precipitação acumulada no intervalo (mm). Variáveis derivadas: temperatura de bolbo húmido (°C, equação empírica de Stull 2011), Delta T (°C = T − T_bh) e vento efetivo (0,70 × vento + 0,30 × max(rajada, vento)).</p>
          <p>• <strong>Fórmula, Precipitação e Rajadas:</strong> componente vento (20 pts &lt;= 2 km/h, rampa linear 2–18 km/h até 100) × 0,65 + componente ΔT (20 pts se &lt; 2 °C; 10 pts em 2–6 °C; rampa 6–10 °C até 80; 100 acima) × 0,35, mínimo 10 pts. Precipitação acumulada &gt; 0,2 mm/h aciona em paralelo <em>Bloqueio por Precipitação (Lavagem)</em> sem inflacionar o índice de deriva atmosférica. Fator de Rajada G = rajada / vento médio (alerta quando G &gt; 1,8). Faixas: 10–25 Baixo | 26–50 Moderado | 51–75 Elevado | 76–100 Crítico.</p>
          <p>• <strong>Lacunas, estimativas, cache e fuso horário ({timezoneLabel}):</strong> valores 0 reais são preservados separadamente de null; rajadas em falta marcadas como estimadas excluem a hora da curva e das janelas; cache &gt; 20 min ou legada sem metadados de integridade suprime janelas; horas passadas são filtradas dinamicamente pelo relógio local sem ligar segmentos através de falhas.</p>
          <p>• <strong>Critério das janelas e inversão térmica:</strong> sequências futuras contíguas (&gt;= 2 h consecutivas sem lacunas) com índice &lt;= 25 pts, precipitação &lt;= 0,2 mm/h e sem suspeita de inversão térmica (vento efetivo &lt; 2 km/h com ΔT &gt; 6 °C, ou ΔT &lt; 2,0 °C com vento &lt; 3,5 km/h entre as 18:00 e as 08:30).</p>
          {allowIrd && (
            <Link to="/ferramentas/risco-deriva" className="inline-flex items-center gap-1.5 font-extrabold text-[#114037] underline pt-1">
              <span>Abrir ferramenta IRD completa</span><ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

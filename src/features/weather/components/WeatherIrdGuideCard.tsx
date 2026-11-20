// src/features/weather/components/WeatherIrdGuideCard.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { isIrdEnabledForEnv } from '../../../utils/releasePolicyRoutes.ts';
import { getDaterraEnvironment } from '../../../utils/releasePolicy.ts';

export const WeatherIrdGuideCard: React.FC = () => {
  const [open, setOpen] = useState(true);
  const allowIrd = isIrdEnabledForEnv(getDaterraEnvironment());

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 overflow-hidden text-slate-800">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-emerald-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#114037] shrink-0" aria-hidden="true" />
          <span className="text-xs sm:text-sm font-black text-[#114037]">
            Índice de Risco de Deriva (IRD 0–200% · Escala de Referência)
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-emerald-200/70 bg-white text-xs text-slate-700 space-y-2.5 leading-relaxed">
          <p>
            • <strong>O que é e como se calcula:</strong> escala operacional orientadora de <strong>0% a 200%</strong> que combina vento efetivo (<span className="font-mono-numbers">0,70 × vento + 0,30 × max(rajada, vento)</span>), Delta T (<span className="font-mono-numbers">ΔT = T − T_bh</span>), contexto espacial da parcela (2D/3D, quebra-vento, zona sensível, azimute e declive catabático <span className="font-mono-numbers">&gt; 5%</span> entre <span className="font-mono-numbers">18:00–08:30</span>) e calibração do equipamento. Apoia a preparação antes de encher o depósito com produto fitofarmacêutico e calda.
          </p>
          <p>
            • <strong>Patamares operacionais (0–200%):</strong>{' '}
            <span className="font-mono-numbers font-bold">0–40%</span> Risco Baixo (Ótimo — Favorável) |{' '}
            <span className="font-mono-numbers font-bold">41–75%</span> Risco Moderado (Aceitável com precaução; em <span className="font-mono-numbers">60–75%</span> aplicar medidas corretivas imediatas) |{' '}
            <span className="font-mono-numbers font-bold">76–100%</span> Risco Elevado (Crítico — apenas cenários isolados com mitigação máxima) |{' '}
            <span className="font-mono-numbers font-bold">&gt; 100–200%</span> Risco Extremo (Interdito — Adiar).
          </p>
          <p>
            • <strong>Limiar máximo aceitável por zona sensível:</strong>{' '}
            <span className="font-mono-numbers font-bold">75%</span> sem zonas sensíveis próximas (<span className="font-mono-numbers">&gt; 30 m</span>) |{' '}
            <span className="font-mono-numbers font-bold">50%</span> junto a culturas vizinhas ou estradas (<span className="font-mono-numbers">15–30 m</span>) |{' '}
            <span className="font-mono-numbers font-bold">30%</span> adjacente a cursos de água, habitações, escolas ou agricultura biológica (<span className="font-mono-numbers">≤ 15 m</span>; entre <span className="font-mono-numbers">31–50%</span> exige bicos SDRT <span className="font-mono-numbers">75–90%</span> em Atenção e <span className="font-mono-numbers">&gt; 50%</span> obriga a Adiar).
          </p>
          <p>
            • <strong>Critérios técnicos de decisão e mitigação:</strong> precipitação <span className="font-mono-numbers">&gt; 0,2 mm/h</span> aciona <em>Bloqueio por Precipitação</em>; em Drone UAV aplica-se bloqueio legal acima de <span className="font-mono-numbers">15,0 km/h</span> (DL 91/2016). No simulador <em>What-If</em> pode reduzir pressão/velocidade, ativar bicos anti-deriva, fecho unilateral de bordadura (<span className="font-mono-numbers">× 0,50</span> em 3D) e adjuvante (<span className="font-mono-numbers">× 0,80</span>).
          </p>
          {allowIrd && (
            <Link to="/ferramentas/risco-deriva" className="inline-flex items-center gap-1.5 font-extrabold text-[#114037] underline pt-0.5">
              <span>Abrir ferramenta IRD completa</span><ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

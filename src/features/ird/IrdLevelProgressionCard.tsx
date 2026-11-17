import React from 'react';
import { SlidersHorizontal, FolderCheck, ArrowRight } from 'lucide-react';
import type { IrdEvaluationLevel } from './irdOriginTypes.ts';

interface IrdLevelProgressionCardProps {
  readonly currentLevel: IrdEvaluationLevel;
  readonly isLoggedIn: boolean;
  readonly hasWeatherValid: boolean;
  readonly onSelectLevel: (level: IrdEvaluationLevel) => void;
}

export const IrdLevelProgressionCard: React.FC<IrdLevelProgressionCardProps> = ({
  currentLevel,
  isLoggedIn,
  hasWeatherValid,
  onSelectLevel
}) => (
  <section aria-label="Opções para aprofundar avaliação operacional" className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-soft space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 className="text-sm font-extrabold text-[#114037]">Aprofundar avaliação operacional</h2>
        <p className="text-xs text-slate-600">
          {currentLevel === 'level1_meteo'
            ? hasWeatherValid
              ? 'Leitura meteorológica concluída. Escolha o percurso para avaliar a aplicação (sem misturar origens):'
              : 'Introduza leitura meteorológica válida ou escolha já o percurso operacional:'
            : 'Percurso ativo selecionado. Pode alternar de nível a qualquer momento:'}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#114037]">
            <SlidersHorizontal className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Avaliação rápida — 3 variáveis mínimas</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Acrescenta <strong>Pressão</strong>, <strong>Velocidade</strong> e <strong>Altura prática</strong> manuais para uma <em>Avaliação Rápida Parcial</em> (com bico e exposição opcionais no passo seguinte).
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelectLevel('level2_quick')}
          className="touch-target w-full px-4 py-2 rounded-xl bg-[#114037] hover:bg-[#0d332c] text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Iniciar avaliação rápida</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#114037]">
            <FolderCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Avaliação detalhada — usar perfis</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Usa <strong>exclusivamente perfis guardados</strong> (Cultura → Equipamento → Bico → Calibração), sem inputs manuais concorrentes.
            {!isLoggedIn && ' Requer sessão iniciada para aceder aos perfis.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelectLevel('level3_profiles')}
          className="touch-target w-full px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-[#114037] text-[#114037] text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Usar perfis guardados (Nível 3)</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  </section>
);

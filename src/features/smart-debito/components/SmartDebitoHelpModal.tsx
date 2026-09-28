/**
 * DATERRA Smart - Modal de Ajuda Técnica e Microlearning ISO 16122
 * Ficheiro: src/features/smart-debito/components/SmartDebitoHelpModal.tsx
 *
 * Microlearning técnico agronómico focado na calibração e inspeção
 * periódica de pulverizadores segundo as normas ISO 16122-2 e ISO 16122-3.
 *
 * REGRA ESTRITA: Termo interdito proibido. UI utiliza exclusivamente "débito".
 */

import React from 'react';
import { X, BookOpen, CheckCircle, AlertTriangle, ShieldCheck, Droplet } from 'lucide-react';

interface SmartDebitoHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartDebitoHelpModal: React.FC<SmartDebitoHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Topo do Modal */}
        <div className="bg-daterra-primary text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <BookOpen className="w-5 h-5 text-daterra-accent" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Microlearning & Guia Técnico ISO 16122
              </h2>
              <p className="text-xs text-slate-300">
                Normas ISO 16122-2 e ISO 16122-3 para Auditoria de Débitos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo Técnico */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 text-xs leading-relaxed">
          {/* 1. Enquadramento Normativo */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <h3 className="font-extrabold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-daterra-accent" />
              1. Enquadramento Normativo e Inspeção Oficial
            </h3>
            <p className="text-slate-600 mb-2">
              A inspeção periódica de pulverizadores é mandatada pela Diretiva de Uso Sustentável de Pesticidas
              (2009/128/CE) e regulamentada internacionalmente pela série de normas ISO 16122:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 font-medium">
              <li>
                <strong className="text-slate-800">ISO 16122-2:</strong> Pulverizadores com barra horizontal para culturas baixas e arvenses.
              </li>
              <li>
                <strong className="text-slate-800">ISO 16122-3:</strong> Pulverizadores para culturas arbustivas e arbóreas (pomares, vinha e olival).
              </li>
            </ul>
          </div>

          {/* 2. Equação Hidráulica Fundamental */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4">
            <h3 className="font-extrabold text-emerald-950 text-sm mb-1.5 flex items-center gap-2">
              <Droplet className="w-4 h-4 text-emerald-600" />
              2. Cálculo do Débito Teórico Alvo (Q₂)
            </h3>
            <p className="text-emerald-900 mb-2">
              O débito varia proporcionalmente à raiz quadrada da pressão do fluido. Conhecendo o débito nominal
              de catálogo <strong>Q₁</strong> à pressão de referência <strong>P₁</strong>, o débito esperado <strong>Q₂</strong> na pressão de ensaio <strong>P₂</strong> é:
            </p>
            <div className="bg-white p-3 rounded-xl border border-emerald-300 font-mono text-center text-sm font-bold text-emerald-900 shadow-xs">
              Q₂ = Q₁ × √(P₂ / P₁)
            </div>
            <p className="text-[11px] text-emerald-700 mt-2">
              Exemplo: Para um bico com Q₁ = 0.99 l/min a P₁ = 10 bar, trabalhando a P₂ = 10 bar, Q₂ = 0.99 l/min.
              Se a pressão subir para 15 bar, Q₂ = 0.99 × √(1.5) = 1.21 l/min.
            </p>
          </div>

          {/* 3. Tolerância Individual de 10% */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <h3 className="font-extrabold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-daterra-primary" />
              3. Desvio Individual de Débito (Tolerância ±10%)
            </h3>
            <p className="text-slate-600 mb-2">
              Cada bico ativo na máquina não deve divergir mais de <strong>±10%</strong> face ao débito teórico alvo Q₂
              calculado para a pressão de ensaio:
            </p>
            <div className="bg-slate-100 p-2.5 rounded-xl font-mono text-center text-xs font-semibold text-slate-800">
              Desvio (%) = ((Q_medido - Q₂) / Q₂) × 100
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Bicos com desvio superior a +10% indicam desgaste excessivo da pastilha/orifício (risco de sobredoseamento e escorrimento).
              Bicos com desvio inferior a -10% indicam entupimento parcial ou degradação (risco de subdosagem e quebra de eficácia protetora).
            </p>
          </div>

          {/* 4. Simetria Bilateral (Lado Esquerdo vs Direito) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <h3 className="font-extrabold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              4. Simetria Bilateral (ISO 16122-3)
            </h3>
            <p className="text-slate-600 mb-2">
              Em culturas arbustivas e arbóreas, a distribuição entre os dois lados da copa deve ser equilibrada.
              A norma estipula que a diferença entre a soma dos débitos medidos à esquerda e à direita não deve
              exceder <strong>10%</strong> da média dos dois lados:
            </p>
            <div className="bg-slate-100 p-2.5 rounded-xl font-mono text-center text-xs font-semibold text-slate-800">
              Diferença (%) = (|Σ Q_esq - Σ Q_dir| / ((Σ Q_esq + Σ Q_dir) / 2)) × 100 ≤ 10%
            </div>
          </div>

          {/* 5. Ingestão de Ficheiro de Ensaio e Offset */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <h3 className="font-extrabold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-daterra-accent" />
              5. Procedimento de Importação e Linha Inicial (Offset)
            </h3>
            <p className="text-slate-600">
              O ficheiro gerado pelo equipamento de ensaio pode conter dezenas ou centenas de linhas de registos acumulados.
              Utilize o campo <strong>Linha Inicial (Offset)</strong> para definir a primeira linha válida do ensaio atual.
              O Smart Débito distribui automaticamente as medições sequenciais pela máquina (Topo para a Base do Lado Esquerdo, seguido do Lado Direito), <strong>saltando automaticamente os bicos que se encontrem desativados/fechados</strong>.
            </p>
          </div>

          {/* 6. Gráfico e Emissão Pericial PDF */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <h3 className="font-extrabold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-daterra-primary" />
              6. Gráfico e Relatório Pericial PDF
            </h3>
            <p className="text-slate-600 mb-1.5">
              O <strong>Gráfico</strong> apresenta o perfil vertical de aplicação do pulverizador. As barras verdes representam o débito teórico alvo calculado à pressão de ensaio. As barras azuis (conformes) ou vermelhas (não conformes) mostram o débito medido real face à zona sombreada de tolerância regulamentar de ±10%.
            </p>
            <p className="text-slate-500 text-[11px]">
              A emissão de relatório PDF oficial permite a homologação do ensaio com inclusão de <strong>Banner de Co-Branding personalizado</strong>, dados periciais completos e validação contra normas ISO 16122-2 e ISO 16122-3.
            </p>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="bg-slate-100 p-3.5 px-5 flex items-center justify-between border-t border-slate-200 shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            DATERRA Smart · Academia & Inovação Agrícola
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 bg-daterra-primary text-white font-bold text-xs rounded-xl hover:bg-daterra-primary-hover transition-colors"
          >
            Compreendi
          </button>
        </div>
      </div>
    </div>
  );
};

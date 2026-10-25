import React from 'react';
import { Layers, AlertCircle } from 'lucide-react';
import { formatDidacticText } from '../../../../utils/formatDidacticText';

export const InspecaoIsoSection: React.FC = () => {
  return (
    <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
      {/* Introdução da Norma */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold">
          <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <span>Norma Europeia e Internacional EN ISO 16122</span>
        </div>
        <p className="leading-relaxed">
          {formatDidacticText(
            'A série de normas **ISO 16122** (*Máquinas agrícolas e florestais — Inspeção de pulverizadores em serviço*) padroniza os métodos de ensaio técnico para avaliar o estado funcional, a segurança do operador e o impacto ambiental das máquinas em exploração.'
          )}
        </p>
      </div>

      {/* Partes da ISO 16122 */}
      <div className="space-y-2.5">
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 dark:text-white">
              ISO 16122-1 (Parte 1: Aspetos Gerais e Pré-Inspeção)
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
              Universal
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
            {formatDidacticText(
              'Aplica-se transversalmente a todas as tipologias de pulverizadores (exceto os pulverizadores de dorso manuais, cobertos pela ISO 19932). Define as condições prévias imperativas: **limpeza rigorosa interna e externa do depósito**, proteção do veio de transmissão de potência (cardan e tomada de força PTO), chassi estrutural e **estanqueidade total sem fugas de calda** sob pressão nominal.'
            )}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 dark:text-white">
              ISO 16122-2 (Parte 2: Barras Horizontais)
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
              Culturas Baixas
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
            {formatDidacticText(
              'Dedicada a pulverizadores de barra para culturas arvenses e hortícolas. Avalia a **geometria e deformação da barra** (alinhamento vertical e horizontal), espaçamento e orientação dos bicos, dispositivos de proteção contra embate, quebras de pressão ao longo dos setores e **uniformidade da distribuição transversal**.'
            )}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 dark:text-white">
              ISO 16122-3 (Parte 3: Culturas Arbustivas e Arbóreas)
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
              Atomizadores
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
            {formatDidacticText(
              'Aplica-se a atomizadores e pulverizadores de jato transportado para vinha, pomares e olival. Avalia o funcionamento do **ventilador e embraiagem**, a simetria de aplicação em ambos os lados da **copa vegetal**, a eficácia dos defletores de ar direcionáveis e a quebra de pressão no arco.'
            )}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 dark:text-white">
              ISO 16122-4 (Parte 4: Pulverizadores Fixos e Semi-Móveis)
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
              Estufas & Robôs
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
            {formatDidacticText(
              'Focada em instalações em estufas, robôs de pulverização e unidades estacionárias com mangueiras de longo alcance. Inspeciona a integridade de linhas sob **alta abrasão mecânica**, sistemas autónomos de tração e motores elétricos, e a regulação de pressão em lanças.'
            )}
          </p>
        </div>
      </div>

      {/* Drones / UAV Aviso Regulamentar */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
          <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
          <span>Drones / UAV — Adaptação Técnica das Diretrizes Gerais</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-amber-200/80 dark:border-amber-800/80 space-y-2 text-xs">
          <div className="font-bold text-amber-800 dark:text-amber-300">
            Aviso Regulamentar Obrigatório:
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-medium italic">
            "Os requisitos apresentados resultam da adaptação técnica das diretrizes gerais da Norma ISO 16122."
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {formatDidacticText(
              'Não dispondo ainda de norma ISO autónoma, aplicam-se por analogia os princípios da ISO 16122-1: **estanqueidade sob forças de aceleração e inércia de voo**, válvulas de corte elétrico anti-gota instantâneas, calibração periódica de caudalímetros digitais e **sincronização de débito proporcional à velocidade de translação** (DPA).'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

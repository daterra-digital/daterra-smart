import React from 'react';
import { Scale, AlertTriangle, ShieldAlert } from 'lucide-react';
import { formatDidacticText } from '../../../../utils/formatDidacticText';

export const InspecaoLegalSection: React.FC = () => {
  return (
    <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
      {/* Resumo da Cadeia Legal */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold">
          <Scale className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <span>Cadeia Legislativa Nacional e Comunitária</span>
        </div>
        <p className="leading-relaxed">
          {formatDidacticText(
            'A inspeção técnica periódica de pulverizadores é um **requisito legal obrigatório** em Portugal e na União Europeia, garantindo a proteção do aplicador, a segurança alimentar e a preservação ambiental.'
          )}
        </p>
      </div>

      {/* Diplomas Oficiais */}
      <div className="space-y-2.5">
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Diretiva 2009/128/CE (Uso Sustentável dos Pesticidas — DUS)</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 pl-4 text-xs leading-relaxed">
            {formatDidacticText(
              'Estabelece o quadro comunitário para a **redução de riscos do uso de pesticidas**, instituindo a obrigatoriedade de inspeções regulares a todos os equipamentos em exploração.'
            )}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Lei n.º 26/2013, de 11 de abril</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 pl-4 text-xs leading-relaxed">
            {formatDidacticText(
              'Transpõe a Diretiva 2009/128/CE para o direito nacional, regulamentando o acesso e exercício das atividades de **distribuição, venda e aplicação de produtos fitofarmacêuticos** de uso profissional.'
            )}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Decreto-Lei n.º 86/2010, de 15 de julho</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 pl-4 text-xs leading-relaxed">
            {formatDidacticText(
              'Define o regime de inspeção obrigatória dos equipamentos e cria a rede de **Centros de Inspeção Periódica de Pulverizadores (Centros IPP)** autorizados e auditados pela DGAV.'
            )}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Decreto-Lei n.º 78/2020, de 29 de setembro (Alteração e Republicação)</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 pl-4 text-xs leading-relaxed">
            {formatDidacticText(
              'Altera e republica o Decreto-Lei n.º 86/2010, introduzindo três vetores decisivos:'
            )}
          </p>
          <ul className="pl-6 space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc">
            <li>
              {formatDidacticText(
                '**Inspeção Obrigatória de Pulverização Manual:** Abrange grupos tratorizados com lanças/pistolas e motopulverizadores profissionais.'
              )}
            </li>
            <li>
              {formatDidacticText(
                '**Alinhamento Normativo Europeu:** Harmonização integral dos ensaios oficiais com as normas EN ISO 16122.'
              )}
            </li>
            <li>
              {formatDidacticText(
                '**Tipologia Estrita de Anomalias:** Classificação das desconformidades em Defeito Pequeno (Leve) e Defeito Grande (Grave).'
              )}
            </li>
          </ul>
        </div>
      </div>

      {/* Critério IPP: Leve vs Grave */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
          <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
          <span>Regra de Ouro nos Centros IPP (Aprovação vs Reprovação)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-amber-200/60 dark:border-amber-800/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Defeito Pequeno (Leve)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {formatDidacticText(
                'Não impede a aprovação temporária, mas exige correção obrigatória no prazo averbado pelo inspetor técnico.'
              )}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-red-300 dark:border-red-900/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-red-700 dark:text-red-400">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Defeito Grande (Grave)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {formatDidacticText(
                'A ocorrência de **um único defeito grave** (ex.: fugas ativas no depósito, manómetro avariado ou ausência de proteção PTO) dita a **reprovação imediata** do pulverizador.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

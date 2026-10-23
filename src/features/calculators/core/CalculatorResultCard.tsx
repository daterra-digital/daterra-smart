/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Componente: CalculatorResultCard
 * Fase 2 - Componentes Atómicos do Template Oficial
 * 
 * Cartão de resultado oficial dentro do painel verde escuro:
 * - Suporta resultado principal com destaque tipográfico máximo
 * - Suporta resultados secundários e sub-valores auxiliares (ex: 10,00 L e 10000 mL)
 * - Ponto de integração para Microlearning Específico de Resultado (preparado com callback)
 */

import React from 'react';
import { HelpCircle, AlertCircle } from 'lucide-react';
import type { CalculatorResultDefinition } from './types.ts';
import { DidacticHelp, type FAQFileType } from '../../concentracao/DidacticHelp.tsx';

export interface CalculatorResultCardProps {
  /** Definição declarativa do resultado */
  resultDef: CalculatorResultDefinition;
  /** Valor numérico ou string calculado */
  value: number | string;
  /** Unidade principal do resultado */
  unit: string;
  /** Valor auxiliar opcional (ex: quantidade em unidade menor) */
  subValue?: number | string;
  /** Unidade auxiliar opcional (ex: 'mL') */
  subUnit?: string;
  /** Callback para abertura do microlearning específico deste resultado */
  onOpenResultHelp?: (resultId: string) => void;
  /** Indica se o resultado possui microlearning associado */
  hasHelp?: boolean;
  /** Indica se os dados de entrada são inválidos ou incompletos */
  isInvalid?: boolean;
  /** Mensagem descritiva a exibir em caso de dados inválidos */
  invalidMessage?: string;
}

export const CalculatorResultCard: React.FC<CalculatorResultCardProps> = ({
  resultDef,
  value,
  unit,
  subValue,
  subUnit,
  onOpenResultHelp,
  hasHelp = false,
  isInvalid = false,
  invalidMessage
}) => {
  // Formatação pt-PT de valores numéricos
  const formatPt = (val: number | string, decimals = resultDef.formatDecimals ?? 2) => {
    if (typeof val === 'number') {
      return val.toLocaleString('pt-PT', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    }
    return val;
  };

  const isPrimary = resultDef.isPrimary;
  const formattedValue = formatPt(value);

  return (
    <div
      className={`bg-black/20 p-3 sm:p-3.5 rounded-xl border border-white/10 flex flex-col justify-between transition-all ${
        isPrimary ? 'ring-1 ring-white/10' : ''
      }`}
    >
      {/* Cabeçalho do Cartão de Resultado: Rótulo + Ação de Ajuda Pedagógica */}
      <div className="flex items-start justify-between gap-1.5 mb-1.5">
        <span className="text-[11px] text-slate-300 block font-semibold uppercase tracking-wider line-clamp-1">
          {resultDef.label}:
        </span>

        {/* Microlearning Específico do Resultado (Fase 5 / 6A) */}
        {(resultDef.helpFile || resultDef.helpTopic) ? (
          <DidacticHelp
            faqFile={resultDef.helpFile as FAQFileType}
            topic={resultDef.helpTopic}
            variant="icon"
            iconType="help"
            iconClassName="w-3.5 h-3.5 text-daterra-accent group-hover:text-white transition-colors"
            buttonLabel={`Ajuda sobre ${resultDef.label}`}
            className="min-w-[48px] min-h-[48px] p-2.5 text-daterra-accent hover:text-white bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-colors group touch-target -mr-2 -mt-1 flex items-center justify-center shrink-0"
          />
        ) : (hasHelp || onOpenResultHelp) ? (
          <button
            type="button"
            onClick={() => onOpenResultHelp?.(resultDef.id)}
            className="min-w-[48px] min-h-[48px] p-2.5 text-daterra-accent hover:text-white bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-colors touch-target -mr-2 -mt-1 flex items-center justify-center shrink-0"
            title={`Ajuda sobre ${resultDef.label}`}
            aria-label={`Ajuda pedagógica sobre ${resultDef.label}`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-daterra-accent" />
          </button>
        ) : null}
      </div>

      {/* Valores: Destaque Principal ou Secundário com Sub-Unidade */}
      <div>
        {isInvalid ? (
          <div className="p-2.5 bg-black/30 rounded-lg border border-amber-400/40 text-amber-200 text-xs font-semibold leading-snug flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
            <span>{invalidMessage || 'Resultado indisponível. Verifique se todos os campos foram preenchidos corretamente.'}</span>
          </div>
        ) : isPrimary ? (
          <div className="flex flex-col">
            {typeof value === 'string' ? (
              <div className="text-sm sm:text-base font-semibold text-slate-300 italic">
                {formattedValue}
              </div>
            ) : (
              <div className="text-2xl sm:text-3xl font-black font-mono-numbers text-white tracking-tight">
                {formattedValue} {unit && <span className="text-lg sm:text-xl font-bold">{unit}</span>}
              </div>
            )}
            {subValue !== undefined && typeof value !== 'string' && (
              <div className="text-xs font-semibold font-mono-numbers text-daterra-accent mt-0.5">
                {subUnit === 'm/s' && <span className="text-slate-300 font-medium mr-1">Equivalente:</span>}
                {formatPt(subValue, resultDef.formatDecimals ?? (subUnit === 'L' || subUnit === 'kg' ? 2 : 0))} {subUnit || ''}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5">
            {typeof value === 'string' ? (
              <span className="text-sm sm:text-base font-semibold text-slate-300 italic">
                {formattedValue}
              </span>
            ) : (
              <>
                <span className="text-2xl sm:text-3xl font-black font-mono-numbers text-white tracking-tight">
                  {formattedValue}
                </span>
                {unit && <span className="text-lg sm:text-xl font-bold text-daterra-accent">{unit}</span>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

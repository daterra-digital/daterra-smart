import React from 'react';
import { Layers, Trees } from 'lucide-react';
import type { CalibracaoMetodo } from '../calibracaoPulverizadorTypes.ts';
import { useLanguage } from '../../../context/LanguageContext.tsx';

export interface CalibracaoMetodoSelectorProps {
  selectedMethod: CalibracaoMetodo;
  onSelectMethod: (method: CalibracaoMetodo) => void;
  isDesktop?: boolean;
}

/**
 * Seletor Neutro do Método de Expressão de Dose: LWA vs TRV.
 * - Ambos os métodos possuem rigorosamente o mesmo peso visual e área tátil (mín. 48x48 px).
 * - Estado ativo evidente sem depender exclusivamente de cor.
 * - Totalmente acessível por teclado com aria-pressed.
 */
export const CalibracaoMetodoSelector: React.FC<CalibracaoMetodoSelectorProps> = ({
  selectedMethod,
  onSelectMethod
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl p-3 sm:p-3.5 border border-slate-200/90 shadow-soft space-y-2">
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
        <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight">
          {t('calibracaoPulverizador.chooseDoseExpressionMethod', 'Escolha o método de expressão de dose')}
        </h2>
        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
          EPPO PP 1/239
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        {/* OPÇÃO 1: LWA */}
        <button
          type="button"
          onClick={() => onSelectMethod('lwa')}
          aria-pressed={selectedMethod === 'lwa'}
          aria-label={`${t('calibracaoPulverizador.lwa', 'LWA — Área de Parede Foliar')}: ${t('calibracaoPulverizador.lwaDescription', 'Superfície bidimensional de vegetação em sebe contínua')}`}
          className={`min-h-[48px] p-2 sm:p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer touch-target flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-[#114037] ${
            selectedMethod === 'lwa'
              ? 'bg-[#114037] border-[#114037] text-white shadow-xs scale-[1.005]'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 active:scale-[0.99]'
          }`}
        >
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
              selectedMethod === 'lwa'
                ? 'bg-white/15 text-[#3CA64C]'
                : 'bg-white text-slate-600 border border-slate-200 shadow-2xs'
            }`}
          >
            <Layers className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1 flex items-center justify-between gap-1.5">
            <span className="text-sm sm:text-base font-black tracking-tight">LWA</span>
            {selectedMethod === 'lwa' && (
              <span className="text-[9.5px] font-extrabold bg-[#3CA64C]/25 text-[#73d181] px-1.5 py-0.5 rounded">
                Ativo
              </span>
            )}
          </div>
        </button>

        {/* OPÇÃO 2: TRV */}
        <button
          type="button"
          onClick={() => onSelectMethod('trv')}
          aria-pressed={selectedMethod === 'trv'}
          aria-label={`${t('calibracaoPulverizador.trv', 'TRV — Volume de Copa')}: ${t('calibracaoPulverizador.trvDescription', 'Volume tridimensional de vegetação e copas com largura')}`}
          className={`min-h-[48px] p-2 sm:p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer touch-target flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-[#114037] ${
            selectedMethod === 'trv'
              ? 'bg-[#114037] border-[#114037] text-white shadow-xs scale-[1.005]'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 active:scale-[0.99]'
          }`}
        >
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
              selectedMethod === 'trv'
                ? 'bg-white/15 text-[#3CA64C]'
                : 'bg-white text-slate-600 border border-slate-200 shadow-2xs'
            }`}
          >
            <Trees className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1 flex items-center justify-between gap-1.5">
            <span className="text-sm sm:text-base font-black tracking-tight">TRV</span>
            {selectedMethod === 'trv' && (
              <span className="text-[9.5px] font-extrabold bg-[#3CA64C]/25 text-[#73d181] px-1.5 py-0.5 rounded">
                Ativo
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

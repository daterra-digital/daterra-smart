import React from 'react';
import { Search, X, FlaskConical } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export interface PhSearchSectionProps {
  searchInput: string;
  substancesCount: number;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  onSelectPreset: (preset: string) => void;
}

export const PhSearchSection: React.FC<PhSearchSectionProps> = ({
  searchInput,
  substancesCount,
  onSearchChange,
  onClear,
  onSelectPreset
}) => {
  const { t } = useLanguage();
  const presets = ['enxofre', 'glifosato', 'azoxistrobina', 'diflufenicão', 'FRAC 11', 'HRAC 9'];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#114037] text-[#3CA64C] flex items-center justify-center shadow-xs">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">
              {t('verificadorPh.searchEngineTag', 'Motor de Pesquisa Offline')}
            </span>
            <h2 className="text-base font-black text-slate-900 leading-tight">
              {t('verificadorPh.substanceOrMoa', 'Substância Ativa ou Modo de Ação (MoA)')}
            </h2>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          ● {substancesCount} {t('verificadorPh.substancesAvailable', 'substâncias disponíveis')}
        </span>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t(
            'verificadorPh.searchPlaceholder',
            'Pesquisar por substância ativa (PT/EN) ou código MoA (ex: Enxofre, Glifosato, FRAC 11)...'
          )}
          className="w-full pl-12 pr-10 py-3.5 bg-[#FAFBFB] border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#114037]/20 focus:border-[#114037] transition-all"
        />
        {searchInput && (
          <button
            type="button"
            onClick={onClear}
            aria-label={t('common.clearSearch', 'Limpar pesquisa')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Atalhos Rápidos */}
      <div className="pt-1 flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-bold text-slate-400">
          {t('verificadorPh.quickExamples', 'Exemplos rápidos:')}
        </span>
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onSelectPreset(preset)}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { Edit2, Ruler, AlertCircle } from 'lucide-react';
import { DidacticHelp, type FAQFileType } from '../concentracao/DidacticHelp';
import { useLanguage } from '../../context/LanguageContext';

export interface TrvInputFieldProps {
  label: string;
  fieldKey: 'altura' | 'largura' | 'entrelinha';
  value: number;
  unit?: string;
  presets: number[];
  helpFile: string;
  helpTopic: string;
  warningText?: string | null;
  onOpenKeypad: (field: 'altura' | 'largura' | 'entrelinha') => void;
  onSelectPreset: (val: number) => void;
}

export const TrvInputField: React.FC<TrvInputFieldProps> = ({
  label,
  fieldKey,
  value,
  unit = 'm',
  presets,
  helpFile,
  helpTopic,
  warningText,
  onOpenKeypad,
  onSelectPreset
}) => {
  const { t, language } = useLanguage();
  const locale = language === 'en-GB' ? 'en-GB' : 'pt-PT';

  return (
    <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-[#1D734B]" />
          <span className="text-xs font-bold text-slate-800">{label}</span>
        </div>
        <DidacticHelp
          faqFile={helpFile as FAQFileType}
          topic={helpTopic}
          variant="icon"
          iconType="info"
          className="!text-slate-400 hover:!text-[#114037]"
        />
      </div>

      <button
        type="button"
        onClick={() => onOpenKeypad(fieldKey)}
        aria-label={`${t('common.edit', 'Editar')} ${label}: ${value} ${unit}`}
        className="w-full min-h-[48px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between hover:border-[#3CA64C] transition-all cursor-pointer shadow-2xs touch-target group"
      >
        <div className="flex items-baseline gap-1.5 font-mono">
          <span className="text-2xl font-black text-slate-900 group-hover:text-[#114037]">
            {value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-bold text-slate-500">{unit}</span>
        </div>
        <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-50 text-slate-500 group-hover:text-[#3CA64C] flex items-center justify-center transition-colors">
          <Edit2 className="w-3.5 h-3.5" />
        </div>
      </button>

      <div className="flex items-center gap-1.5 flex-wrap pt-1">
        <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
          {t('common.shortcuts', 'Atalhos:')}
        </span>
        {presets.map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => onSelectPreset(val)}
            className={`min-h-[36px] px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
              value === val
                ? 'bg-[#114037] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {val.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}{unit}
          </button>
        ))}
      </div>

      {warningText && (
        <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5 font-medium animate-fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{warningText}</span>
        </div>
      )}
    </div>
  );
};

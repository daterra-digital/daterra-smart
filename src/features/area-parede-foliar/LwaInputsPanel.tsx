import React from 'react';
import { Edit2, Ruler, AlertCircle } from 'lucide-react';
import { DidacticHelp } from '../concentracao/DidacticHelp';
import { useLanguage } from '../../context/LanguageContext';

interface LwaInputsPanelProps {
  alturaVegetacao: number;
  distanciaEntrelinhas: number;
  onOpenKeypad: (field: 'altura' | 'entrelinha') => void;
  onSelectPresetAltura: (val: number) => void;
  onSelectPresetEntrelinha: (val: number) => void;
}

export const LwaInputsPanel: React.FC<LwaInputsPanelProps> = ({
  alturaVegetacao,
  distanciaEntrelinhas,
  onOpenKeypad,
  onSelectPresetAltura,
  onSelectPresetEntrelinha
}) => {
  const { t } = useLanguage();
  const alturaPresets = [1.5, 2.5, 3.5, 4.5];
  const entrelinhaPresets = [2.0, 3.0, 4.0, 5.0];

  return (
    <section
      aria-label={t('areaParedeFoliar.inputs.title', 'Valores introduzidos para cálculo da Área de Parede Foliar')}
      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#114037]">
          {t('areaParedeFoliar.inputs.title', 'Valores Introduzidos')}
        </h2>
        <span className="text-[11px] text-slate-400 font-medium">
          {t('areaParedeFoliar.inputs.tapToEdit', 'Toque para editar medidas com teclado tátil')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Parâmetro 1: Altura da Vegetação Tratada (h) */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-[#1D734B]" />
              <span className="text-xs font-bold text-slate-800">
                {t('areaParedeFoliar.inputs.heightLabel', 'Altura da vegetação tratada (h)')}
              </span>
            </div>
            <DidacticHelp
              faqFile="AreaParedeFoliarFAQAltura.md"
              topic="lwa-altura"
              variant="icon"
              iconType="info"
              className="!text-slate-400 hover:!text-[#114037]"
            />
          </div>

          <button
            type="button"
            onClick={() => onOpenKeypad('altura')}
            aria-label={t('areaParedeFoliar.inputs.heightEditAria', 'Editar altura da vegetação: {{height}} metros', { height: alturaVegetacao })}
            className="w-full min-h-[48px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between hover:border-[#3CA64C] transition-all cursor-pointer shadow-2xs touch-target group"
          >
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl font-black text-slate-900 group-hover:text-[#114037]">
                {alturaVegetacao.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-slate-500">m</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-50 text-slate-500 group-hover:text-[#3CA64C] flex items-center justify-center transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </div>
          </button>

          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
              {t('areaParedeFoliar.inputs.shortcuts', 'Atalhos:')}
            </span>
            {alturaPresets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onSelectPresetAltura(val)}
                className={`min-h-[36px] px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  alturaVegetacao === val
                    ? 'bg-[#114037] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {val.toFixed(1)}m
              </button>
            ))}
          </div>

          {alturaVegetacao < 1.0 && alturaVegetacao >= 0.5 && (
            <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{t('areaParedeFoliar.inputs.heightLowWarning', 'Altura baixa (inferior a 1,0 m). Verifique se a medição está correta.')}</span>
            </div>
          )}

          {alturaVegetacao > 5.0 && alturaVegetacao <= 6.0 && (
            <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{t('areaParedeFoliar.inputs.heightHighWarning', 'Altura elevada (> 5,0 m). Verifique se a medição está correta.')}</span>
            </div>
          )}
        </div>

        {/* Parâmetro 2: Distância Entrelinhas (r) */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-[#1D734B]" />
              <span className="text-xs font-bold text-slate-800">
                {t('areaParedeFoliar.inputs.spacingLabel', 'Distância entrelinhas (r)')}
              </span>
            </div>
            <DidacticHelp
              faqFile="AreaParedeFoliarFAQEntrelinha.md"
              topic="lwa-entrelinha"
              variant="icon"
              iconType="info"
              className="!text-slate-400 hover:!text-[#114037]"
            />
          </div>

          <button
            type="button"
            onClick={() => onOpenKeypad('entrelinha')}
            aria-label={t('areaParedeFoliar.inputs.spacingEditAria', 'Editar distância entrelinhas: {{spacing}} metros', { spacing: distanciaEntrelinhas })}
            className="w-full min-h-[48px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between hover:border-[#3CA64C] transition-all cursor-pointer shadow-2xs touch-target group"
          >
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl font-black text-slate-900 group-hover:text-[#114037]">
                {distanciaEntrelinhas.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-slate-500">m</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-50 text-slate-500 group-hover:text-[#3CA64C] flex items-center justify-center transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </div>
          </button>

          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
              {t('areaParedeFoliar.inputs.shortcuts', 'Atalhos:')}
            </span>
            {entrelinhaPresets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onSelectPresetEntrelinha(val)}
                className={`min-h-[36px] px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  distanciaEntrelinhas === val
                    ? 'bg-[#114037] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {val.toFixed(1)}m
              </button>
            ))}
          </div>

          {distanciaEntrelinhas < 2.0 && distanciaEntrelinhas >= 1.0 && (
            <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{t('areaParedeFoliar.inputs.spacingNarrowWarning', 'Entrelinha estreita (inferior a 2,0 m). Confirme a adequação ao sistema.')}</span>
            </div>
          )}

          {distanciaEntrelinhas > 8.0 && distanciaEntrelinhas <= 10.0 && (
            <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{t('areaParedeFoliar.inputs.spacingWideWarning', 'Entrelinha muito larga (> 8,0 m). Verifique a medição.')}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

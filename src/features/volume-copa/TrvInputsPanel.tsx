import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { TrvInputField } from './TrvInputField';

interface TrvInputsPanelProps {
  alturaCopa: number;
  larguraCopa: number;
  distanciaEntrelinhas: number;
  onOpenKeypad: (field: 'altura' | 'largura' | 'entrelinha') => void;
  onSelectPresetAltura: (val: number) => void;
  onSelectPresetLargura: (val: number) => void;
  onSelectPresetEntrelinha: (val: number) => void;
}

export const TrvInputsPanel: React.FC<TrvInputsPanelProps> = ({
  alturaCopa,
  larguraCopa,
  distanciaEntrelinhas,
  onOpenKeypad,
  onSelectPresetAltura,
  onSelectPresetLargura,
  onSelectPresetEntrelinha
}) => {
  const { t } = useLanguage();
  const alturaPresets = [1.5, 2.5, 3.5, 4.5];
  const larguraPresets = [0.5, 1.0, 1.5, 2.0];
  const entrelinhaPresets = [2.0, 3.0, 4.0, 5.0];

  return (
    <section
      aria-label={t('volumeCopa.inputsTitle', 'Valores introduzidos para cálculo do TRV')}
      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#114037]">
          {t('common.enteredValues', 'Valores Introduzidos')}
        </h2>
        <span className="text-[11px] text-slate-400 font-medium">
          {t('common.tapToEdit', 'Toque para editar medidas com teclado tátil')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Parâmetro 1: Altura da Copa */}
        <TrvInputField
          label={t('volumeCopa.canopyHeight', 'Altura da copa (h)')}
          fieldKey="altura"
          value={alturaCopa}
          presets={alturaPresets}
          helpFile="TRVFAQAltura.md"
          helpTopic="trv-altura"
          warningText={
            alturaCopa < 1.0
              ? t('volumeCopa.heightLowWarning', 'Altura baixa (< 1,0 m). Verifique a medição.')
              : null
          }
          onOpenKeypad={onOpenKeypad}
          onSelectPreset={onSelectPresetAltura}
        />

        {/* Parâmetro 2: Largura Média da Copa */}
        <TrvInputField
          label={t('volumeCopa.canopyWidth', 'Largura da copa (w)')}
          fieldKey="largura"
          value={larguraCopa}
          presets={larguraPresets}
          helpFile="TRVFAQLargura.md"
          helpTopic="trv-largura"
          warningText={
            larguraCopa < 0.4
              ? t('volumeCopa.widthNarrowWarning', 'Espessura estreita (< 0,4 m).')
              : null
          }
          onOpenKeypad={onOpenKeypad}
          onSelectPreset={onSelectPresetLargura}
        />

        {/* Parâmetro 3: Distância Entrelinhas */}
        <TrvInputField
          label={t('volumeCopa.rowSpacing', 'Entrelinha (r)')}
          fieldKey="entrelinha"
          value={distanciaEntrelinhas}
          presets={entrelinhaPresets}
          helpFile="TRVFAQEntrelinha.md"
          helpTopic="trv-entrelinha"
          warningText={
            distanciaEntrelinhas < 2.0
              ? t('volumeCopa.spacingNarrowWarning', 'Entrelinha estreita (< 2,0 m).')
              : null
          }
          onOpenKeypad={onOpenKeypad}
          onSelectPreset={onSelectPresetEntrelinha}
        />
      </div>
    </section>
  );
};

import React from 'react';
import {
  Trees,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Check
} from 'lucide-react';
import type { CropReferenceType } from './types';
import { formatEppoNum } from './calculations';
import { EppoNumericField } from './EppoNumericField';
import { ShapeFactorSelector } from './ShapeFactorSelector';
import { CanopyConceptBadge } from './CanopyConceptBadge';
import { useLanguage } from '../../context/LanguageContext';

export interface CanopyGeometryCardProps {
  isOpen: boolean;
  onToggle: () => void;
  onNextStep: () => void;
  canopyHeightM: number;
  canopyWidthM: number;
  rowSpacingM: number;
  shapeFactor: number;
  cropReference: CropReferenceType;
  lwaM2Ha: number;
  trvM3Ha: number;
  onChangeHeight: (val: number) => void;
  onChangeWidth: (val: number) => void;
  onChangeRowSpacing: (val: number) => void;
  onChangeShapeFactor: (val: number) => void;
  onChangeCropReference: (val: CropReferenceType) => void;
}

export const CanopyGeometryCard: React.FC<CanopyGeometryCardProps> = ({
  isOpen,
  onToggle,
  onNextStep,
  canopyHeightM,
  canopyWidthM,
  rowSpacingM,
  shapeFactor,
  cropReference,
  lwaM2Ha,
  trvM3Ha,
  onChangeHeight,
  onChangeWidth,
  onChangeRowSpacing,
  onChangeShapeFactor,
  onChangeCropReference
}) => {
  const { t } = useLanguage();
  const isWallCrop = cropReference === 'vinha';
  const cropLabel = isWallCrop
    ? t('ajusteDose.cropVineHedge', 'Vinha | Sebe')
    : t('ajusteDose.cropOrchardFruit', 'Pomar | Fruteiras');

  const heightTooltipText = isWallCrop
    ? t(
        'ajusteDose.heightTooltipVine',
        'Utilize apenas a altura da faixa que vai efetivamente pulverizar (ex.: apenas a zona dos cachos), e não a altura total da sebe da vinha. O alvo é a copa que é tratada.'
      )
    : t(
        'ajusteDose.heightTooltipOrchard',
        'Utilize apenas a altura da faixa que vai efetivamente pulverizar (ex.: apenas a zona foliar ativa da árvore), e não a altura total da árvore. O alvo é a copa que é tratada.'
      );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all">
      {/* Cabeçalho Clicável do Acordeão */}
      <div
        onClick={onToggle}
        className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${
              isOpen
                ? 'bg-[#114037] text-[#8ffa94]'
                : 'bg-emerald-50 text-[#114037] border border-emerald-200'
            }`}
          >
            {isOpen ? <Trees className="w-4 h-4" /> : <Check className="w-4 h-4 stroke-[2.5]" />}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C] block">
              {t('ajusteDose.step1Tag', 'Passo 1 de 3 • Geometria 3D')}
            </span>
            <h2 className="text-sm sm:text-base font-black text-slate-900 truncate">
              {t('ajusteDose.step1Title', 'Geometria do Pomar / Vinha')}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isOpen && (
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
              {cropLabel} •{' '}
              {isWallCrop
                ? `LWA ${formatEppoNum(lwaM2Ha, 0)} m²/ha`
                : `TRV ${formatEppoNum(trvM3Ha, 0)} m³/ha`}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1">
            <span>{isOpen ? t('common.hide', 'Ocultar') : t('common.edit', 'Editar')}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </div>
      </div>

      {/* Corpo Expansível do Passo 1 */}
      {isOpen && (
        <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-slate-100 space-y-4 animate-fade-in">
          {/* 1. Botões de Seleção de Cultura */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => onChangeCropReference('vinha')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isWallCrop
                  ? 'bg-[#114037] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('ajusteDose.cropVineLwaMethod', 'Vinha | Sebe (Método LWA)')}
            </button>
            <button
              type="button"
              onClick={() => onChangeCropReference('pomar')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isWallCrop
                  ? 'bg-[#114037] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('ajusteDose.cropOrchardTrvMethod', 'Pomar | Fruteiras (Método TRV)')}
            </button>
          </div>

          {/* 2. Badge com Tooltip (i) do Conceito EPPO */}
          <CanopyConceptBadge
            isWallCrop={isWallCrop}
            lwaM2Ha={lwaM2Ha}
            trvM3Ha={trvM3Ha}
          />

          {/* 3. Campos com DaterraKeypad ao Toque */}
          <div className="space-y-3">
            <EppoNumericField
              label={t('ajusteDose.canopyHeightLabel', 'Altura Tratada (h)')}
              value={canopyHeightM}
              onChange={onChangeHeight}
              unit="m"
              presets={[1.0, 1.5, 1.8, 2.0, 2.5]}
              min={0.1}
              decimals={1}
              tooltipText={heightTooltipText}
            />

            {!isWallCrop && (
              <EppoNumericField
                label={t('ajusteDose.canopyWidthLabel', 'Largura da Copa (w)')}
                value={canopyWidthM}
                onChange={onChangeWidth}
                unit="m"
                presets={[1.0, 1.5, 2.0, 2.5, 3.0]}
                min={0.1}
                decimals={1}
              />
            )}

            <EppoNumericField
              label={t('ajusteDose.rowSpacingLabel', 'Distância Entrelinha (r)')}
              value={rowSpacingM}
              onChange={onChangeRowSpacing}
              unit="m"
              presets={[2.0, 2.5, 3.0, 3.5, 4.0]}
              min={0.5}
              decimals={1}
            />
          </div>

          {/* Seletor Visual de Fator de Forma (SF) (Apenas Método TRV) */}
          {!isWallCrop && (
            <ShapeFactorSelector
              shapeFactor={shapeFactor}
              onChangeShapeFactor={onChangeShapeFactor}
            />
          )}

          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[11px] font-medium text-slate-400">
              {isWallCrop
                ? t('ajusteDose.wallSummaryTag', 'Cultura em sebe • Método LWA')
                : t('ajusteDose.orchardSummaryTag', 'Copa 3D • Método TRV')}
            </span>

            <button
              type="button"
              onClick={onNextStep}
              className="px-4 py-2.5 rounded-xl bg-[#114037] hover:bg-[#19584b] text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>{t('ajusteDose.nextStepLabel', 'Seguinte: Dados do Rótulo')}</span>
              <ArrowRight className="w-4 h-4 text-[#8ffa94]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

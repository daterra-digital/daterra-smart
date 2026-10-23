import React, { useState } from 'react';
import {
  Trees,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Check,
  Square,
  Circle,
  Triangle
} from 'lucide-react';
import type { CropReferenceType } from './types';
import { formatEppoNum } from './calculations';
import { EppoNumericField } from './EppoNumericField';

const SHAPE_FACTOR_OPTIONS = [
  { value: 1.0, title: 'Retangular', subtitle: 'SF 1.00', Icon: Square },
  { value: 0.85, title: 'Globular', subtitle: 'SF 0.85', Icon: Circle },
  { value: 0.75, title: 'Cónica', subtitle: 'SF 0.75', Icon: Triangle }
];

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
  const [showIndexTooltip, setShowIndexTooltip] = useState<boolean>(false);
  const isWallCrop = cropReference === 'vinha';
  const cropLabel = isWallCrop ? 'Vinha | Sebe' : 'Pomar | Fruteiras';

  const heightTooltipText = isWallCrop
    ? 'Utilize apenas a altura da faixa que vai efetivamente pulverizar (ex.: apenas a zona dos cachos), e não a altura total da sebe da vinha. O alvo é a copa que é tratada.'
    : 'Utilize apenas a altura da faixa que vai efetivamente pulverizar (ex.: apenas a zona foliar ativa da árvore), e não a altura total da árvore. O alvo é a copa que é tratada.';

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
              Passo 1 de 3 • Geometria 3D
            </span>
            <h2 className="text-sm sm:text-base font-black text-slate-900 truncate">
              Geometria do Pomar / Vinha
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
            <span>{isOpen ? 'Ocultar' : 'Editar'}</span>
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
              Vinha | Sebe (Método LWA)
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
              Pomar | Fruteiras (Método TRV)
            </button>
          </div>

          {/* 3. Badge com Tooltip (i) do Conceito EPPO */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {isWallCrop ? (
              <button
                type="button"
                onClick={() => setShowIndexTooltip((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 text-xs font-mono font-black transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#3CA64C]" />
                <span>Parede Foliar (tLWA): {formatEppoNum(lwaM2Ha, 0)} m²/ha</span>
                <Info className="w-3.5 h-3.5 text-emerald-700" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowIndexTooltip((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-950 border border-sky-200 text-xs font-mono font-black transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Volume de Copa (TRV): {formatEppoNum(trvM3Ha, 0)} m³/ha</span>
                <Info className="w-3.5 h-3.5 text-sky-700" />
              </button>
            )}
            <span className="text-[10px] font-semibold text-slate-400">
              Toque em (i) para conceito EPPO
            </span>
          </div>

          {showIndexTooltip && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed animate-fade-in">
              {isWallCrop ? (
                <p>
                  LWA (Treated Leaf Wall Area): Em culturas em sebe (vinha e fruteiras), o alvo é a
                  área vertical tratada dos dois lados da linha: (2 x h x 10000) / r. Referência
                  EPPO: 10.000 m²/ha.
                </p>
              ) : (
                <p>
                  TRV (Tree Row Volume): Em pomares e fruteiras de copa globular, o alvo é o volume
                  tridimensional da árvore: (h x w x SF x 10000) / r. Referência EPPO: 10.000 m³/ha.
                </p>
              )}
            </div>
          )}

          {/* 2 & 4 & 6. Campos com DaterraKeypad ao Toque + Máx 5 Atalhos */}
          <div className="space-y-3">
            <EppoNumericField
              label="Altura Tratada (h)"
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
                label="Largura da Copa (w)"
                value={canopyWidthM}
                onChange={onChangeWidth}
                unit="m"
                presets={[1.0, 1.5, 2.0, 2.5, 3.0]}
                min={0.1}
                decimals={1}
              />
            )}

            <EppoNumericField
              label="Distância Entrelinha (r)"
              value={rowSpacingM}
              onChange={onChangeRowSpacing}
              unit="m"
              presets={[2.0, 2.5, 3.0, 3.5, 4.0]}
              min={0.5}
              decimals={1}
            />
          </div>

          {/* Seletor Visual de Fator de Forma (SF) a 100% da largura (Apenas Método TRV) */}
          {!isWallCrop && (
            <div className="w-full space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                Formato da Copa • Fator de Forma (SF)
              </span>
              <div className="w-full grid grid-cols-3 gap-2">
                {SHAPE_FACTOR_OPTIONS.map(({ value: sf, title, subtitle, Icon }) => {
                  const isSelected = Math.abs(shapeFactor - sf) < 1e-6;
                  return (
                    <button
                      key={sf}
                      type="button"
                      onClick={() => onChangeShapeFactor(sf)}
                      className={`w-full flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer touch-target ${
                        isSelected
                          ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-6 h-6 mb-1" />
                      <span className="text-sm font-semibold leading-tight">{title}</span>
                      <span className="text-xs font-mono opacity-75 mt-0.5">{subtitle}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[11px] font-medium text-slate-400">
              {isWallCrop ? 'Cultura em sebe • Método LWA' : 'Copa 3D • Método TRV'}
            </span>

            <button
              type="button"
              onClick={onNextStep}
              className="px-4 py-2.5 rounded-xl bg-[#114037] hover:bg-[#19584b] text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Seguinte: Dados do Rótulo</span>
              <ArrowRight className="w-4 h-4 text-[#8ffa94]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

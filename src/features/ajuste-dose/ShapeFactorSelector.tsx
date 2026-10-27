import React from 'react';
import { Square, Circle, Triangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface ShapeFactorSelectorProps {
  shapeFactor: number;
  onChangeShapeFactor: (sf: number) => void;
}

const SHAPE_FACTOR_OPTIONS = [
  { value: 1.0, titleKey: 'ajusteDose.sfRectangular', defaultTitle: 'Retangular', subtitle: 'SF 1.00', Icon: Square },
  { value: 0.85, titleKey: 'ajusteDose.sfGlobular', defaultTitle: 'Globular', subtitle: 'SF 0.85', Icon: Circle },
  { value: 0.75, titleKey: 'ajusteDose.sfConical', defaultTitle: 'Cónica', subtitle: 'SF 0.75', Icon: Triangle }
];

export const ShapeFactorSelector: React.FC<ShapeFactorSelectorProps> = ({
  shapeFactor,
  onChangeShapeFactor
}) => {
  const { t } = useLanguage();

  return (
    <div className="w-full space-y-2 pt-2 border-t border-slate-100">
      <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
        {t('ajusteDose.shapeFactorTitle', 'Formato da Copa • Fator de Forma (SF)')}
      </span>
      <div className="w-full grid grid-cols-3 gap-2">
        {SHAPE_FACTOR_OPTIONS.map(({ value: sf, titleKey, defaultTitle, subtitle, Icon }) => {
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
              <span className="text-sm font-semibold leading-tight">{t(titleKey, defaultTitle)}</span>
              <span className="text-xs font-mono opacity-75 mt-0.5">{subtitle}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

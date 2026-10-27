import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { formatEppoNum } from './calculations';
import { useLanguage } from '../../context/LanguageContext';

export interface CanopyConceptBadgeProps {
  isWallCrop: boolean;
  lwaM2Ha: number;
  trvM3Ha: number;
}

export const CanopyConceptBadge: React.FC<CanopyConceptBadgeProps> = ({
  isWallCrop,
  lwaM2Ha,
  trvM3Ha
}) => {
  const { t } = useLanguage();
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  return (
    <>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {isWallCrop ? (
          <button
            type="button"
            onClick={() => setShowTooltip((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 text-xs font-mono font-black transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#3CA64C]" />
            <span>
              {t('ajusteDose.wallAreaLwa', 'Parede Foliar (tLWA): {{val}} m²/ha', {
                val: formatEppoNum(lwaM2Ha, 0)
              })}
            </span>
            <Info className="w-3.5 h-3.5 text-emerald-700" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowTooltip((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-950 border border-sky-200 text-xs font-mono font-black transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>
              {t('ajusteDose.canopyVolumeTrv', 'Volume de Copa (TRV): {{val}} m³/ha', {
                val: formatEppoNum(trvM3Ha, 0)
              })}
            </span>
            <Info className="w-3.5 h-3.5 text-sky-700" />
          </button>
        )}
        <span className="text-[10px] font-semibold text-slate-400">
          {t('ajusteDose.tapForConcept', 'Toque em (i) para conceito EPPO')}
        </span>
      </div>

      {showTooltip && (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed animate-fade-in">
          {isWallCrop ? (
            <p>
              {t(
                'ajusteDose.lwaExplanation',
                'LWA (Treated Leaf Wall Area): Em culturas em sebe (vinha e fruteiras), o alvo é a área vertical tratada dos dois lados da linha: (2 x h x 10000) / r. Referência EPPO: 10.000 m²/ha.'
              )}
            </p>
          ) : (
            <p>
              {t(
                'ajusteDose.trvExplanation',
                'TRV (Tree Row Volume): Em pomares e fruteiras de copa globular, o alvo é o volume tridimensional da árvore: (h x w x SF x 10000) / r. Referência EPPO: 10.000 m³/ha.'
              )}
            </p>
          )}
        </div>
      )}
    </>
  );
};

/**
 * DATERRA Smart - Componente Partilhado de Preparação de Calda
 * Exibe de forma unificada os 4 resultados práticos dentro do cartão (< 200 LOC)
 */

import React from 'react';
import { Layers, Scale, FlaskConical, Droplets, Maximize2, Sparkles } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export interface ManualPreparationCardProps {
  caldaPrepararL: number;
  formattedQ: {
    primaryValue: string;
    primaryUnit: string;
    secondaryText: string | null;
  };
  isSolid: boolean;
  areaTratadaEstimadaM2?: number;
  isJovemSemEnsaio?: boolean;
  onRequestAreaJovem?: () => void;
  className?: string;
}

export const ManualPreparationCard: React.FC<ManualPreparationCardProps> = ({
  caldaPrepararL,
  formattedQ,
  isSolid,
  areaTratadaEstimadaM2,
  isJovemSemEnsaio,
  onRequestAreaJovem,
  className = ''
}) => {
  const { t, language } = useLanguage();
  const numLocale = language === 'en-GB' ? 'en-GB' : 'pt-PT';
  const T = caldaPrepararL || 0;

  return (
    <div
      className={`bg-gradient-to-br from-[#114037] via-[#175348] to-[#114037] text-white p-5 sm:p-7 rounded-3xl shadow-floating border border-white/10 space-y-4 ${className}`}
    >
      {/* Cabeçalho do Cartão */}
      <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-3">
        <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-emerald-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#3CA64C]" />
          <span>{t('manual.card.header', 'PREPARAR A CALDA')}</span>
        </span>
        <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
          DATERRA Smart
        </span>
      </div>

      {/* Grelha com os 4 Blocos Práticos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Bloco 1: Volume de Calda a Preparar */}
        <div className="bg-white/10 border border-white/15 rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center gap-2 text-emerald-300">
            <Layers className="w-5 h-5 text-[#3CA64C] shrink-0" />
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-200">
              {t('manual.card.tankLabel', 'DE CALDA A PREPARAR')}
            </span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black font-mono-numbers text-white tracking-tight">
              {new Intl.NumberFormat(numLocale).format(T)}{' '}
              <span className="text-xl sm:text-2xl font-bold text-[#3CA64C]">L</span>
            </div>
          </div>
        </div>

        {/* Bloco 2: Produto Fitofarmacêutico */}
        <div className="bg-white/10 border border-white/15 rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center gap-2 text-emerald-300">
            {isSolid ? (
              <Scale className="w-5 h-5 text-[#3CA64C] shrink-0" />
            ) : (
              <FlaskConical className="w-5 h-5 text-[#3CA64C] shrink-0" />
            )}
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-200">
              {t('manual.card.productLabel', 'PRODUTO FITOFARMACÊUTICO')}
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black font-mono-numbers text-white tracking-tight">
              {formattedQ.primaryValue}{' '}
              <span className="text-xl sm:text-2xl font-bold text-[#3CA64C]">
                {formattedQ.primaryUnit}
              </span>
            </div>
            {formattedQ.secondaryText && (
              <div className="text-[11px] font-mono-numbers text-emerald-200/90 font-semibold tracking-wide">
                {formattedQ.secondaryText}
              </div>
            )}
          </div>
        </div>

        {/* Bloco 3: Água para Completar */}
        <div className="bg-white/10 border border-white/15 rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center gap-2 text-emerald-300">
            <Droplets className="w-5 h-5 text-[#3CA64C] shrink-0" />
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-200">
              {t('manual.card.waterLabel', 'ÁGUA NO DEPÓSITO')}
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-lg sm:text-xl font-black uppercase text-white tracking-tight leading-snug">
              {t('manual.card.waterAction', 'COMPLETAR COM ÁGUA')}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-emerald-200">
              {t('manual.card.waterTarget', 'até perfazer {{t}} L de calda', {
                t: new Intl.NumberFormat(numLocale).format(T)
              })}
            </div>
            <p className="text-[10px] text-white/65 leading-tight italic pt-0.5">
              {t('manual.card.waterHelp', 'Adicione água até perfazer o volume final, seguindo as instruções do rótulo.')}
            </p>
          </div>
        </div>

        {/* Bloco 4: Área Aproximada a Tratar */}
        <div className="bg-white/10 border border-white/15 rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center gap-2 text-emerald-300">
            <Maximize2 className="w-5 h-5 text-[#3CA64C] shrink-0" />
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-200">
              {t('manual.card.areaLabel', 'ÁREA APROXIMADA A TRATAR')}
            </span>
          </div>
          <div className="space-y-1">
            {areaTratadaEstimadaM2 !== undefined ? (
              <>
                <div className="text-2xl sm:text-3xl font-black font-mono-numbers text-white tracking-tight">
                  ≈ {new Intl.NumberFormat(numLocale).format(Math.round(areaTratadaEstimadaM2))}{' '}
                  <span className="text-lg sm:text-xl font-bold text-[#3CA64C]">m²</span>
                </div>
                <p className="text-[10px] text-emerald-200/80 leading-tight">
                  {t('manual.card.areaSubtitle', 'Esta quantidade de calda permite tratar aproximadamente esta área.')}
                </p>
              </>
            ) : isJovemSemEnsaio ? (
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-200/90 block">
                  {t('manual.card.areaNotCalculated', 'Área não calculada (sem ensaio)')}
                </span>
                {onRequestAreaJovem && (
                  <button
                    type="button"
                    onClick={onRequestAreaJovem}
                    className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-extrabold transition-all cursor-pointer touch-target shadow-2xs"
                  >
                    {t('manual.card.calcAreaBtn', 'Calcular área a tratar')}
                  </button>
                )}
              </div>
            ) : (
              <span className="text-xs text-white/60 italic">
                {t('manual.card.areaUnavailable', 'Área não disponível')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

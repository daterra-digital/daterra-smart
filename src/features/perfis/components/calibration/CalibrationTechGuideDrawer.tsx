// src/features/perfis/components/calibration/CalibrationTechGuideDrawer.tsx
import React from 'react';
import { BookOpen, Calculator, Gauge, Layers, Wind, X } from 'lucide-react';
import type { CalibrationEppoBalanceResult } from '../../../../lib/agri-math/calibration-eppo-bridge.ts';
import type { CalibrationCultureOption } from '../../hooks/useCalibrationController.ts';
import { formatPtGroupedInt, formatPtNumber } from '../../services/calibrationFormatters.ts';

interface CalibrationTechGuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  debitoTotalLMin: number | null;
  speedKmh: number;
  entrelinhaM: number | null;
  activeCulture: CalibrationCultureOption | null;
  balance: CalibrationEppoBalanceResult;
}

export const CalibrationTechGuideDrawer: React.FC<CalibrationTechGuideDrawerProps> = ({
  isOpen, onClose, debitoTotalLMin, speedKmh, entrelinhaM, activeCulture, balance
}) => {
  if (!isOpen) return null;

  const isLwa = activeCulture?.indexKind === 'LWA';
  const bioText = isLwa && activeCulture?.lwaM2Ha
    ? `LWA = ${formatPtGroupedInt(activeCulture.lwaM2Ha)} m²/ha`
    : activeCulture?.trvM3Ha
      ? `TRV = ${formatPtGroupedInt(activeCulture.trvM3Ha)} m³/ha`
      : 'Sem geometria vegetativa registada';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="w-full h-full fixed inset-0 md:static md:w-full md:max-w-md bg-white md:rounded-l-3xl shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#114037] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#3CA64C]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C] block">Micro-Learning Contextual</span>
              <h3 className="text-base font-black text-slate-900 leading-tight">Guia Técnico da Calibração</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar guia técnico"
            className="min-h-[44px] min-w-[44px] rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 cursor-pointer touch-target">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs text-slate-700">
          <div className="p-3.5 rounded-2xl bg-[#eef8f0] border border-[#3CA64C]/30 space-y-1.5">
            <h4 className="font-black text-[#114037] flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-[#3CA64C]" /> 1. Equação Hidráulica em Curso
            </h4>
            <p className="font-mono tabular-nums text-[11px] font-bold text-[#114037] bg-white/80 rounded-xl p-2 border border-emerald-200">
              V = (Q × 600) / (v × EL) = ({formatPtNumber(debitoTotalLMin, 2)} × 600) / ({formatPtNumber(speedKmh, 1)} × {formatPtNumber(entrelinhaM, 2)}) = {formatPtNumber(balance.volumeCalibradoLHa, 1)} L/ha
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              O volume estimado por hectare depende diretamente do <strong>débito total dos bicos</strong> (L/min), inversamente da <strong>velocidade de avanço</strong> (km/h) e da <strong>entrelinha/largura</strong> (m).
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-black text-[#114037] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#1D734B]" /> 2. Método EPPO PP 1/239 (LWA / TRV)
            </h4>
            <p className="text-[11px] font-bold text-slate-800">
              Parcela atual: {bioText}
              {balance.volumeRecomendadoEppoLHa !== null ? ` · Referência: ${formatPtNumber(balance.volumeRecomendadoEppoLHa, 1)} L/ha` : ''}
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Em sebes contínuas e vinha utiliza-se a <strong>Área de Parede Foliar (LWA)</strong>; em pomares e copas tridimensionais usa-se o <strong>Volume de Copa (TRV)</strong> para ajustar a calda à vegetação real, respeitando o piso técnico mínimo ({formatPtNumber(balance.pisoMecanicoMinLHa, 0)} L/ha).
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-black text-[#114037] flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-[#1D734B]" /> 3. Hierarquia Física: Bicos &gt; Velocidade &gt; Pressão
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Quando o desvio supera <strong>±10%</strong>, a alteração do <strong>calibre/tipo de bico (escala ISO 10625)</strong> é sempre preferencial: mantém constante a velocidade segura na copa e a pressão de trabalho, preservando o diâmetro de gotas, a resistência à evaporação/vento (ΔT) e a deposição no alvo.
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Ajustar excessivamente a velocidade fora do envelope seguro ({formatPtNumber(balance.envelopeVelocidade.minKmh, 1)}–{formatPtNumber(balance.envelopeVelocidade.maxKmh, 1)} km/h) ou subir demasiado a pressão fragmenta as gotas e degrada a penetração foliar.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <h4 className="font-black text-[#114037] flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-[#1D734B]" /> 4. Volume de Ar Sugerido &amp; ISO 16122
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Em equipamentos 3D assistidos por ar, o volume de ar sugerido segue <strong>Q_ar ≈ 0,10 × TRV × v</strong>
              {balance.caudalArSugeridoM3H !== null ? ` (sugerido atual: ${formatPtGroupedInt(balance.caudalArSugeridoM3H)} m³/h)` : ''}, evitando subventilação ou atravessamento da copa. Em inspeção ISO 16122, o desvio máximo admissível por bico e a simetria bilateral devem manter-se dentro de <strong>±10%</strong>.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button type="button" onClick={onClose}
            className="min-h-[44px] px-5 bg-[#114037] hover:bg-[#1D734B] text-white font-black text-xs rounded-xl cursor-pointer touch-target">
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

// src/features/perfis/components/calibration/CalibrationDrivetrainRow.tsx
import React from 'react';
import { AlertTriangle, Cog, Gauge } from 'lucide-react';
import type { CalibrationKeypadField } from '../../hooks/useCalibrationController.ts';
import { formatPtGroupedInt } from '../../services/calibrationFormatters.ts';

interface CalibrationDrivetrainRowProps {
  relacaoEngrenagem: string;
  rotacaoMotorRpm: number | null;
  rotacaoTdfRpm: number | null;
  onChangeGearRatio: (value: string) => void;
  onOpenKeypad: (field: CalibrationKeypadField) => void;
}

export const CalibrationDrivetrainRow: React.FC<CalibrationDrivetrainRowProps> = ({
  relacaoEngrenagem, rotacaoMotorRpm, rotacaoTdfRpm, onChangeGearRatio, onOpenKeypad
}) => {
  const ptoOutOfStd = rotacaoTdfRpm !== null && (rotacaoTdfRpm < 480 || rotacaoTdfRpm > 560);

  return (
    <div className="pt-3 border-t border-slate-100 space-y-2.5">
      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#114037]">
        <Cog className="w-3.5 h-3.5 text-[#3CA64C]" />
        <span>Transmissão & Tomada de Força (Trator)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
        <label className="space-y-1.5 block">
          <span className="text-xs font-extrabold text-[#114037] block">Relação de Engrenagem</span>
          <input
            type="text"
            maxLength={80}
            value={relacaoEngrenagem}
            onChange={(e) => onChangeGearRatio(e.target.value)}
            placeholder="ex.: 2.ª Média / B2"
            className="w-full min-h-[48px] px-3.5 rounded-2xl bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#3CA64C] focus:outline-none text-xs font-bold text-[#114037] placeholder:text-slate-400 touch-target"
          />
        </label>

        <div className="space-y-1.5">
          <span className="text-xs font-extrabold text-[#114037] block">Rotação do Motor (rpm)</span>
          <button
            type="button"
            onClick={() => onOpenKeypad('engineRpm')}
            className="w-full min-h-[48px] px-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-[#114037] font-black text-sm font-mono tabular-nums flex items-center justify-between cursor-pointer touch-target"
          >
            <span>{rotacaoMotorRpm !== null ? `${formatPtGroupedInt(rotacaoMotorRpm)} rpm` : 'Não indicado'}</span>
            <span className="text-[11px] font-bold text-slate-600">Teclado</span>
          </button>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-extrabold text-[#114037] flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-[#1D734B]" /> Rotação da TDF (rpm)
          </span>
          <button
            type="button"
            onClick={() => onOpenKeypad('ptoRpm')}
            className={`w-full min-h-[48px] px-3.5 rounded-2xl border font-black text-sm font-mono tabular-nums flex items-center justify-between cursor-pointer touch-target ${ptoOutOfStd ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-950' : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-[#114037]'}`}
          >
            <span>{rotacaoTdfRpm !== null ? `${formatPtGroupedInt(rotacaoTdfRpm)} rpm` : 'Não indicado'}</span>
            <span className="text-[11px] font-bold text-slate-600">Teclado</span>
          </button>
          <p className={`text-[10px] font-bold flex items-center gap-1 ${ptoOutOfStd ? 'text-amber-800' : 'text-slate-500'}`}>
            {ptoOutOfStd && <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />}
            <span>{ptoOutOfStd ? 'Fora da faixa nominal 480–560 rpm (ref. 540 / 540E).' : 'Ref.: 540 / 540E rpm'}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

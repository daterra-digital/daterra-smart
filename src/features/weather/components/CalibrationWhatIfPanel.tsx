// src/features/weather/components/CalibrationWhatIfPanel.tsx
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Minus, Plus, RotateCcw, Save, SlidersHorizontal } from 'lucide-react';
import { DaterraKeypad } from '../../../components/DaterraKeypad.tsx';
import type { ResolvedCalibrationChain, WhatIfSimulationResult, WhatIfValues } from '../utils/calibrationWhatIfHelpers.ts';
import { formatDecimalPt } from '../utils/windDirection.ts';
import { getIrdOperationalBand } from '../utils/irdOperationalThresholds.ts';
import { CalibrationWhatIfUavControls } from './CalibrationWhatIfUavControls.tsx';
import { CalibrationNameEditor } from './CalibrationNameEditor.tsx';

interface CalibrationWhatIfPanelProps {
  chain: ResolvedCalibrationChain;
  vals: WhatIfValues;
  baselineSim: WhatIfSimulationResult;
  liveSim: WhatIfSimulationResult;
  isDirty: boolean;
  isSaving: boolean;
  saveFeedback: string | null;
  onChangeVals: (next: WhatIfValues) => void;
  onPersist: (mode: 'update' | 'new', customName?: string) => Promise<unknown>;
  onRename: (nextName: string) => Promise<boolean>;
}

type KeypadTarget = 'speed' | 'pressure' | 'airflow' | 'height' | 'cdaRpm' | null;

export const CalibrationWhatIfPanel: React.FC<CalibrationWhatIfPanelProps> = ({
  chain, vals, baselineSim, liveSim, isDirty, isSaving, saveFeedback, onChangeVals, onPersist, onRename
}) => {
  const [keypad, setKeypad] = useState<KeypadTarget>(null);
  const [isNamingNew, setIsNamingNew] = useState(false);
  const [newName, setNewName] = useState('');

  const step = (field: Exclude<KeypadTarget, null>, delta: number) => {
    if (field === 'speed') onChangeVals({ ...vals, speedKmh: Math.max(0.5, Math.min(40, Math.round((vals.speedKmh + delta) * 10) / 10)) });
    if (field === 'pressure') onChangeVals({ ...vals, pressureBar: Math.max(0.5, Math.min(50, Math.round((vals.pressureBar + delta) * 10) / 10)) });
    if (field === 'airflow') onChangeVals({ ...vals, airflowM3h: Math.max(0, Math.round(((vals.airflowM3h ?? 0) + delta) / 100) * 100) });
    if (field === 'cdaRpm') onChangeVals({ ...vals, cdaDiscRpm: Math.max(2000, Math.min(24000, Math.round((vals.cdaDiscRpm ?? chain.baseCdaDiscRpm ?? 10000) + delta))) });
    if (field === 'height') {
      const [min, max] = chain.equipKind === '2D' ? [20, 150] : [0.5, 15];
      onChangeVals({ ...vals, heightVal: Math.max(min, Math.min(max, Math.round((vals.heightVal + delta) * 10) / 10)) });
    }
  };

  const resetWhatIf = () => {
    setIsNamingNew(false);
    onChangeVals({
      speedKmh: chain.baseSpeedKmh, pressureBar: chain.basePressureBar, airflowM3h: chain.baseAirflowM3h,
      heightVal: chain.baseHeightVal, cdaDiscRpm: chain.baseCdaDiscRpm, unilateralBorder3d: false, adjuvantAntiDrift: false
    });
  };

  const thirdLabel = chain.equipKind === '3D' ? 'Caudal de Ar (3D)' : 'Altura da Barra';
  const thirdUnit = chain.equipKind === '3D' ? 'm³/h' : 'cm';
  const thirdVal = chain.equipKind === '3D' ? vals.airflowM3h : vals.heightVal;
  const kpCfg = keypad === 'speed' ? { label: 'Velocidade de Avanço', val: String(vals.speedKmh), unit: 'km/h', presets: [4, 5, 6, 7.5, 12, 20], min: 0.5, max: 40 }
    : keypad === 'pressure' ? { label: 'Pressão de Trabalho', val: String(vals.pressureBar), unit: 'bar', presets: [2, 2.5, 3, 4, 5, 8], min: 0.5, max: 50 }
    : keypad === 'airflow' ? { label: 'Caudal de Ar do Ventilador', val: String(vals.airflowM3h ?? 0), unit: 'm³/h', presets: [8000, 12000, 16000, 20000, 25000], min: 0, max: 60000 }
    : keypad === 'cdaRpm' ? { label: 'Rotação Discos CDA', val: String(vals.cdaDiscRpm ?? 10000), unit: 'RPM', presets: [6000, 8000, 10000, 12000, 14000, 16000], min: 2000, max: 24000 }
    : { label: chain.equipKind === 'UAV' ? 'Altura de Voo (Copa)' : thirdLabel, val: String(vals.heightVal), unit: chain.equipKind === 'UAV' ? 'm' : 'cm', presets: chain.equipKind === 'UAV' ? [1.5, 2, 2.5, 3, 3.5] : [40, 50, 60, 75], min: chain.equipKind === '2D' ? 20 : 0.5, max: chain.equipKind === '2D' ? 150 : 15 };

  const allAlerts = [...(liveSim.pressureAlertPt ? [liveSim.pressureAlertPt] : []), ...(liveSim.belowMechanicalFloor ? [`Volume abaixo do piso mínimo (${liveSim.mechanicalFloorLHa} L/ha).`] : []), ...(liveSim.isUavOutOfTargetBand ? ['Volume UAV fora da faixa recomendada (10–30 L/ha).'] : []), ...(liveSim.eppoBalance.estadoVentilacao3D === 'SOBREVENTILACAO' ? ['Sobre-ventilação 3D (> 120% do Q_ar,ótimo).'] : []), ...liveSim.simAlertsPt];

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
      <CalibrationNameEditor currentName={chain.calibration.nomePerfil} isSaving={isSaving} onSaveName={onRename} />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#114037]"><SlidersHorizontal className="w-3.5 h-3.5 text-[#3CA64C]" /><span>Simulador ao Vivo (What-If)</span></div>
        {isDirty && <button type="button" onClick={resetWhatIf} className="text-[11px] font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"><RotateCcw className="w-3 h-3" /> Repor original</button>}
      </div>

      {chain.equipKind === 'UAV' ? (
        <CalibrationWhatIfUavControls chain={chain} vals={vals} liveSim={liveSim} onStep={step} onOpenKeypad={(f) => setKeypad(f)} onToggleAdjuvant={() => onChangeVals({ ...vals, adjuvantAntiDrift: !vals.adjuvantAntiDrift })} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-white rounded-xl border border-slate-200 p-2.5 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-500">Velocidade de Avanço</div>
              <div className="flex items-center justify-between gap-1">
                <button type="button" aria-label="Reduzir velocidade" onClick={() => step('speed', -0.5)} className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => setKeypad('speed')} className="flex-1 text-center font-mono-numbers text-sm font-black text-[#114037] py-1 rounded-lg hover:bg-emerald-50 cursor-pointer">{formatDecimalPt(vals.speedKmh)} km/h</button>
                <button type="button" aria-label="Aumentar velocidade" onClick={() => step('speed', 0.5)} className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
              </div>
              <div className="text-[10px] text-slate-500 font-mono-numbers">V_aparente: {formatDecimalPt(liveSim.apparentWindKmh)} km/h</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-2.5 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-500">Pressão de Trabalho</div>
              <div className="flex items-center justify-between gap-1">
                <button type="button" aria-label="Reduzir pressão" onClick={() => step('pressure', -0.5)} className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => setKeypad('pressure')} className="flex-1 text-center font-mono-numbers text-sm font-black text-[#114037] py-1 rounded-lg hover:bg-emerald-50 cursor-pointer">{formatDecimalPt(vals.pressureBar)} bar</button>
                <button type="button" aria-label="Aumentar pressão" onClick={() => step('pressure', 0.5)} className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
              </div>
              <div className="text-[10px] text-slate-500 font-mono-numbers">Q₂: {formatDecimalPt(liveSim.scaledFlowLMin)} L/min · f_bico: {formatDecimalPt(liveSim.fNozzleFactor)}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-2.5 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-500">{thirdLabel}</div>
              <div className="flex items-center justify-between gap-1">
                <button type="button" aria-label={`Reduzir ${thirdLabel}`} onClick={() => step(chain.equipKind === '3D' ? 'airflow' : 'height', chain.equipKind === '3D' ? -1000 : -5)} className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => setKeypad(chain.equipKind === '3D' ? 'airflow' : 'height')} className="flex-1 text-center font-mono-numbers text-sm font-black text-[#114037] py-1 rounded-lg hover:bg-emerald-50 cursor-pointer">{thirdVal !== null ? `${chain.equipKind === '3D' ? Math.round(thirdVal).toLocaleString('pt-PT') : formatDecimalPt(thirdVal)} ${thirdUnit}` : '—'}</button>
                <button type="button" aria-label={`Aumentar ${thirdLabel}`} onClick={() => step(chain.equipKind === '3D' ? 'airflow' : 'height', chain.equipKind === '3D' ? 1000 : 5)} className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
              </div>
              <div className="text-[10px] text-slate-500 font-mono-numbers">{chain.equipKind === '3D' && liveSim.optimalAirflowM3h ? `Q_ar,ótimo: ${liveSim.optimalAirflowM3h.toLocaleString('pt-PT')} m³/h` : `Razão H/E: ${formatDecimalPt(liveSim.boomSpacingRatio, '—')}`}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {chain.equipKind === '3D' && <button type="button" aria-pressed={Boolean(vals.unilateralBorder3d)} onClick={() => onChangeVals({ ...vals, unilateralBorder3d: !vals.unilateralBorder3d })} className={`px-3 py-1.5 rounded-xl border font-bold cursor-pointer ${vals.unilateralBorder3d ? 'bg-[#114037] text-white border-[#114037]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>Fecho Unilateral Bordadura (× 0,50)</button>}
            <button type="button" aria-pressed={Boolean(vals.adjuvantAntiDrift)} onClick={() => onChangeVals({ ...vals, adjuvantAntiDrift: !vals.adjuvantAntiDrift })} className={`px-3 py-1.5 rounded-xl border font-bold cursor-pointer ${vals.adjuvantAntiDrift ? 'bg-[#114037] text-white border-[#114037]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>Adjuvante Anti-Deriva (× 0,80)</button>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center justify-between gap-2">
          <div>
            <span className="block text-[10px] font-bold uppercase text-slate-500">Volume Aplicado vs. Alvo</span>
            <span className="font-mono-numbers font-black text-slate-900">{formatDecimalPt(baselineSim.appliedVolumeLHa)} → <span className="text-[#114037]">{formatDecimalPt(liveSim.appliedVolumeLHa)} L/ha</span></span>
            <span className="block text-[10px] text-slate-500 font-mono-numbers">{chain.volumeEppoLHa ? `Alvo: ${formatDecimalPt(chain.volumeEppoLHa)} L/ha` : 'Sem alvo definido'}</span>
          </div>
          <span className={`px-2 py-1 rounded-lg text-[10px] font-extrabold ${liveSim.belowMechanicalFloor ? 'bg-rose-100 text-rose-800' : liveSim.eppoBalance.estadoConformidade === 'ALINHADO_REF_EPPO' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>{liveSim.belowMechanicalFloor ? `< ${liveSim.mechanicalFloorLHa} L/ha (Piso)` : liveSim.eppoAlignmentLabel}</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center justify-between gap-2">
          <div>
            <span className="block text-[10px] font-bold uppercase text-slate-500">IRD Combinado (0–200%)</span>
            <span className="font-mono-numbers font-black text-slate-900">{baselineSim.combinedIrdPct}% → <span className="text-[#114037]">{liveSim.combinedIrdPct}%</span></span>
            <span className="block text-[10px] text-slate-500 font-mono-numbers">Limiar parcelar: {chain.sensitiveZoneLimitPct ?? 75}% · Base: {liveSim.baseMeteoScore}%</span>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border whitespace-nowrap shrink-0 ${getIrdOperationalBand(liveSim.combinedIrdPct).cls}`}>{liveSim.irdRiskLabel}</span>
        </div>
      </div>

      {allAlerts.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] font-semibold text-amber-950 space-y-0.5">
          {allAlerts.map((msg, i) => <div key={i} className="flex items-start gap-1.5"><AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-700 mt-0.5" /><span>{msg}</span></div>)}
        </div>
      )}

      {isDirty && (
        <div className="pt-1 flex flex-wrap items-center gap-2">
          <button type="button" disabled={isSaving} onClick={() => void onPersist('update')} className="touch-target px-3.5 py-2 rounded-xl bg-[#114037] hover:bg-[#1D734B] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"><Save className="w-3.5 h-3.5" /><span>Atualizar Calibração</span></button>
          {!isNamingNew ? (
            <button type="button" disabled={isSaving} onClick={() => { setNewName(`${chain.calibration.nomePerfil} (Otimizada)`); setIsNamingNew(true); }} className="touch-target px-3.5 py-2 rounded-xl border border-[#114037] text-[#114037] bg-white hover:bg-emerald-50 text-xs font-extrabold cursor-pointer disabled:opacity-50">Guardar como Nova Calibração</button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto flex-1">
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} aria-label="Nome da nova calibração" className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 outline-none focus:border-[#114037]" />
              <button type="button" disabled={isSaving} onClick={() => { void onPersist('new', newName).then(() => setIsNamingNew(false)); }} className="px-3 py-2 rounded-xl bg-[#3CA64C] text-white text-xs font-extrabold cursor-pointer">Confirmar</button>
              <button type="button" onClick={() => setIsNamingNew(false)} className="px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 cursor-pointer">Cancelar</button>
            </div>
          )}
        </div>
      )}

      {saveFeedback && <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /><span>{saveFeedback}</span></div>}

      <DaterraKeypad
        isOpen={keypad !== null} onClose={() => setKeypad(null)} label={kpCfg.label} initialValue={kpCfg.val} initialUnit={kpCfg.unit} commonValues={kpCfg.presets}
        validationRules={{ min: kpCfg.min, max: kpCfg.max, allowDecimal: keypad !== 'airflow' && keypad !== 'cdaRpm', maxDecimals: keypad === 'airflow' || keypad === 'cdaRpm' ? 0 : 2 }}
        onConfirm={(num) => {
          if (keypad === 'speed') onChangeVals({ ...vals, speedKmh: num });
          if (keypad === 'pressure') onChangeVals({ ...vals, pressureBar: num });
          if (keypad === 'airflow') onChangeVals({ ...vals, airflowM3h: Math.round(num) });
          if (keypad === 'cdaRpm') onChangeVals({ ...vals, cdaDiscRpm: Math.round(num) });
          if (keypad === 'height') onChangeVals({ ...vals, heightVal: num });
          setKeypad(null);
        }}
      />
    </div>
  );
};

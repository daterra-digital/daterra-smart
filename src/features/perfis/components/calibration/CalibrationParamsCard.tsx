// src/features/perfis/components/calibration/CalibrationParamsCard.tsx
import React, { useMemo } from 'react';
import { AlertTriangle, BookOpen, Info, Lock, Minus, Plus, RotateCcw, ShieldCheck, Sparkles, Wind } from 'lucide-react';
import type { CalibrationEppoBalanceResult } from '../../../../lib/agri-math/calibration-eppo-bridge.ts';
import type { NozzleProfile } from '../../../../schemas/nozzle-profile.schema.ts';
import type { CatalogSelectOption } from '../../data/cultureCatalogData.ts';
import type { CalibrationCultureOption, CalibrationEquipmentOption, CalibrationKeypadField } from '../../hooks/useCalibrationController.ts';
import { formatPtGroupedInt, formatPtNumber } from '../../services/calibrationFormatters.ts';
import { SearchableRoundedDropdown } from '../SearchableRoundedDropdown.tsx';
import { CalibrationDrivetrainRow } from './CalibrationDrivetrainRow.tsx';

interface CalibrationParamsCardProps {
  cultureOptions: CalibrationCultureOption[]; equipmentOptions: CalibrationEquipmentOption[]; nozzleProfiles: NozzleProfile[];
  selectedCultureId: string; selectedEquipmentKey: string; selectedNozzleKey: string; isEquipmentLockedToNozzle: boolean;
  activeCulture: CalibrationCultureOption | null; activeEquipment: CalibrationEquipmentOption | null;
  pressaoBar: number | null; pressaoBaseBicoBar: number | null; isPressureModified: boolean;
  nozzleBounds: { minBar: number | null; maxBar: number | null };
  numBicosAtivos: number | null; numBicosTotal: number | null; debitoTotalLMin: number | null; entrelinhaM: number | null;
  speedKmh: number; relacaoEngrenagem: string; rotacaoMotorRpm: number | null; rotacaoTdfRpm: number | null; airflowM3h: number | null;
  balance: CalibrationEppoBalanceResult;
  onSelectCulture: (id: string) => void; onSelectEquipment: (id: string) => void; onSelectNozzle: (id: string) => void;
  onStepSpeed: (delta: number) => void; onStepPressure: (delta: number) => void; onResetPressure: () => void;
  onApplySafeSpeed: () => void; onChangeGearRatio: (value: string) => void; onApplySuggestedAirflow: () => void;
  onOpenKeypad: (field: CalibrationKeypadField) => void; onOpenGuide: () => void;
}

export const CalibrationParamsCard: React.FC<CalibrationParamsCardProps> = (p) => {
  const cultureSelectOpts = useMemo<CatalogSelectOption[]>(() => p.cultureOptions.map((c) => ({ id: c.id, label: c.label })), [p.cultureOptions]);
  const equipmentSelectOpts = useMemo<CatalogSelectOption[]>(() => p.equipmentOptions.map((e) => ({ id: e.id, label: e.name })), [p.equipmentOptions]);
  const nozzleSelectOpts = useMemo<CatalogSelectOption[]>(() => p.nozzleProfiles.map((n) => ({ id: n.id, label: n.name })), [p.nozzleProfiles]);
  const selectedCuOpt = cultureSelectOpts.find((o) => o.id === p.selectedCultureId);
  const selectedEqOpt = equipmentSelectOpts.find((o) => o.id === p.selectedEquipmentKey);
  const selectedNzOpt = nozzleSelectOpts.find((o) => o.id === p.selectedNozzleKey);
  const bicosPill = p.numBicosAtivos !== null && p.numBicosTotal !== null ? `${p.numBicosAtivos} / ${p.numBicosTotal} un.` : '—';
  const { velocidadeSugeridaSeguraKmh: safeSpd, velocidadeForaEnvelope: outEnv, recomendacaoBico: recNoz, envelopeVelocidade: env, caudalArSugeridoM3H: optAir } = p.balance;
  const { minBar, maxBar } = p.nozzleBounds;
  const outBounds = p.pressaoBar !== null && ((minBar !== null && p.pressaoBar < minBar) || (maxBar !== null && p.pressaoBar > maxBar));
  const supportsAirflow = Boolean(p.activeEquipment?.isFan3D);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-soft border border-slate-200 space-y-5">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1D734B] flex items-center justify-center shrink-0"><ShieldCheck className="w-5 h-5" /></div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C] block">Parâmetros do Ensaio</span>
            <h2 className="text-base sm:text-lg font-black text-[#114037] leading-tight">Parâmetros de Calibração</h2>
          </div>
        </div>
        <button type="button" onClick={p.onOpenGuide} className="min-h-[44px] px-3.5 bg-[#3CA64C]/10 hover:bg-[#3CA64C]/20 text-[#114037] font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer touch-target shrink-0">
          <BookOpen className="w-4 h-4 text-[#3CA64C]" /><span>Guia Técnico</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <SearchableRoundedDropdown label="Perfil Cultura" required placeholder="Selecionar parcela..." value={selectedCuOpt?.label ?? ''}
          selectedId={p.selectedCultureId} options={cultureSelectOpts} emptyCatalogHint="Adicione uma cultura no separador Cultura." onSelectOption={(opt) => p.onSelectCulture(opt.id)} />
        <div>
          <SearchableRoundedDropdown label="Perfil Equipamento" required placeholder="Selecionar equipamento..." value={selectedEqOpt?.label ?? ''}
            selectedId={p.selectedEquipmentKey} options={equipmentSelectOpts} disabled={p.isEquipmentLockedToNozzle}
            disabledHint={selectedEqOpt?.label || 'Vinculado ao Bico'} emptyCatalogHint="Registe uma máquina no separador Equipamentos." onSelectOption={(opt) => p.onSelectEquipment(opt.id)} />
          {p.isEquipmentLockedToNozzle && (
            <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-extrabold text-[#114037] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
              <Lock className="w-3 h-3 text-[#3CA64C]" /> Vinculado ao Bico
            </span>
          )}
        </div>
        <SearchableRoundedDropdown label="Perfil Bico" required placeholder="Selecionar perfil guardado..." value={selectedNzOpt?.label ?? ''}
          selectedId={p.selectedNozzleKey} options={nozzleSelectOpts} emptyCatalogHint="Guarde um perfil em Perfis de Bicos Guardados." onSelectOption={(opt) => p.onSelectNozzle(opt.id)} />
      </div>

      {p.activeCulture?.missingGeometry && (
        <p className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0" /><span>Parcela sem geometria completa: preencha altura e largura da copa no separador Cultura para obter referência EPPO.</span>
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {[
          { lbl: 'N.º Bicos Ativos', val: bicosPill },
          { lbl: 'Débito Total', val: p.debitoTotalLMin !== null ? `${formatPtNumber(p.debitoTotalLMin, 2)} L/min` : '—' },
          { lbl: 'Entrelinha', val: p.entrelinhaM !== null ? `${formatPtNumber(p.entrelinhaM, 2)} m` : '—' }
        ].map((pill) => (
          <div key={pill.lbl} className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between sm:block">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">{pill.lbl}</span>
            <span className="text-sm font-black text-[#114037] font-mono tabular-nums mt-0.5 block">{pill.val}</span>
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${supportsAirflow ? 'xl:grid-cols-3' : ''} gap-4 pt-2 border-t border-slate-100 items-start`}>
        <div className="space-y-2">
          <div className="min-h-[32px] flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-extrabold text-[#114037]">Velocidade de Avanço (km/h)</span>
            {safeSpd !== null && (
              <button type="button" onClick={p.onApplySafeSpeed}
                className={`min-h-[30px] px-2.5 rounded-xl border text-[11px] font-black inline-flex items-center gap-1 whitespace-nowrap cursor-pointer ${outEnv ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-950' : 'bg-emerald-50 hover:bg-emerald-100 border-[#3CA64C]/40 text-[#114037]'}`}>
                <Sparkles className="w-3 h-3 text-[#3CA64C] shrink-0" />
                <span>{outEnv ? `Limite Seguro ${formatPtNumber(safeSpd, 1)} km/h` : `Ajuste Fino (${formatPtNumber(safeSpd, 2)})`}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => p.onStepSpeed(-0.5)} aria-label="Diminuir velocidade 0,5 km/h" className="min-h-[48px] min-w-[44px] rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#114037] flex items-center justify-center cursor-pointer touch-target"><Minus className="w-4 h-4" /></button>
            <button type="button" onClick={() => p.onOpenKeypad('speed')} className="flex-1 min-h-[48px] px-3.5 rounded-2xl bg-emerald-50/60 hover:bg-emerald-50 border-2 border-[#3CA64C]/50 text-[#114037] font-black text-base font-mono tabular-nums flex items-center justify-between cursor-pointer touch-target">
              <span>{formatPtNumber(p.speedKmh, 1)}</span><span className="text-[11px] font-bold text-[#1D734B] whitespace-nowrap">km/h · Editar</span>
            </button>
            <button type="button" onClick={() => p.onStepSpeed(0.5)} aria-label="Aumentar velocidade 0,5 km/h" className="min-h-[48px] min-w-[44px] rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#114037] flex items-center justify-center cursor-pointer touch-target"><Plus className="w-4 h-4" /></button>
          </div>
          {outEnv && recNoz && (
            <p className="text-[11px] font-bold text-[#114037] bg-emerald-50/80 border border-emerald-200 rounded-xl px-2.5 py-1">Preferencial: Bico ISO {recNoz.calibreIso} ({recNoz.corIso}) a {formatPtNumber(env.referenciaKmh, 1)} km/h</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="min-h-[32px] flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-extrabold text-[#114037]">Pressão de Trabalho (bar)</span>
            {p.pressaoBaseBicoBar !== null && (p.isPressureModified ? (
              <button type="button" onClick={p.onResetPressure} className="min-h-[30px] px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-[#3CA64C]/40 text-[#114037] text-[11px] font-black inline-flex items-center gap-1 whitespace-nowrap cursor-pointer">
                <RotateCcw className="w-3 h-3 text-[#3CA64C] shrink-0" /><span>Repor Base ({formatPtNumber(p.pressaoBaseBicoBar, 1)} bar)</span>
              </button>
            ) : (
              <span className="min-h-[30px] px-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold inline-flex items-center whitespace-nowrap">Base Bico: {formatPtNumber(p.pressaoBaseBicoBar, 1)} bar</span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" disabled={p.pressaoBar === null} onClick={() => p.onStepPressure(-0.5)} aria-label="Diminuir pressão 0,5 bar" className="min-h-[48px] min-w-[44px] rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#114037] flex items-center justify-center cursor-pointer touch-target disabled:opacity-40"><Minus className="w-4 h-4" /></button>
            <button type="button" disabled={p.pressaoBar === null} onClick={() => p.onOpenKeypad('pressure')} className={`flex-1 min-h-[48px] px-3.5 rounded-2xl border-2 font-black text-base font-mono tabular-nums flex items-center justify-between cursor-pointer touch-target disabled:opacity-40 ${outBounds ? 'bg-amber-50 border-amber-400 text-amber-950' : 'bg-emerald-50/60 hover:bg-emerald-50 border-[#3CA64C]/50 text-[#114037]'}`}>
              <span>{formatPtNumber(p.pressaoBar, 1)}</span><span className="text-[11px] font-bold text-[#1D734B] whitespace-nowrap">bar · Editar</span>
            </button>
            <button type="button" disabled={p.pressaoBar === null} onClick={() => p.onStepPressure(0.5)} aria-label="Aumentar pressão 0,5 bar" className="min-h-[48px] min-w-[44px] rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#114037] flex items-center justify-center cursor-pointer touch-target disabled:opacity-40"><Plus className="w-4 h-4" /></button>
          </div>
          {outBounds && minBar !== null && maxBar !== null && (
            <p className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-300 rounded-xl px-2.5 py-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" /><span>Fora da faixa homologada ({formatPtNumber(minBar, 1)}–{formatPtNumber(maxBar, 1)} bar).</span>
            </p>
          )}
        </div>

        {supportsAirflow && (
          <div className="space-y-2 md:col-span-2 xl:col-span-1">
            <div className="min-h-[32px] flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-[#114037] flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-[#1D734B] shrink-0" /> Caudal de Ar (m³/h)</span>
              {optAir !== null && (
                <button type="button" onClick={p.onApplySuggestedAirflow} className="min-h-[30px] px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-[#3CA64C]/40 text-[#114037] text-[11px] font-black inline-flex items-center gap-1 whitespace-nowrap cursor-pointer">
                  <Sparkles className="w-3 h-3 text-[#3CA64C] shrink-0" /><span>Aplicar Sugerido ({formatPtGroupedInt(optAir)})</span>
                </button>
              )}
            </div>
            <button type="button" onClick={() => p.onOpenKeypad('airflow')} className="w-full min-h-[48px] px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-[#114037] font-black text-base font-mono tabular-nums flex items-center justify-between cursor-pointer touch-target">
              <span>{p.airflowM3h !== null ? formatPtGroupedInt(p.airflowM3h) : 'Não indicado'}</span>
              <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">m³/h · Teclado</span>
            </button>
          </div>
        )}
      </div>

      <CalibrationDrivetrainRow
        relacaoEngrenagem={p.relacaoEngrenagem} rotacaoMotorRpm={p.rotacaoMotorRpm} rotacaoTdfRpm={p.rotacaoTdfRpm}
        onChangeGearRatio={p.onChangeGearRatio} onOpenKeypad={p.onOpenKeypad}
      />
    </div>
  );
};

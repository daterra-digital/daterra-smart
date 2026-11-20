// src/features/perfis/components/calibration/CalibrationResultsBento.tsx
import React from 'react';
import { AlertTriangle, CheckCircle2, CloudOff, FilePlus2, FileText, MapPin, Save, Sparkles, Wind } from 'lucide-react';
import type { CalibrationEppoBalanceResult, ContextualDriftRiskResult } from '../../../../lib/agri-math/calibration-eppo-bridge.ts';
import type { CalibrationAuditRecord, PdfAuditReportMode } from '../../../../types/calibration-audit.ts';
import type { ParcelWeatherResolution } from '../../../weather/services/parcelWeatherResolver.ts';
import type { CalibrationCultureOption, CalibrationEquipmentOption } from '../../hooks/useCalibrationController.ts';
import { formatPtGroupedInt, formatPtNumber, type ParcelTanksSummary } from '../../services/calibrationFormatters.ts';

interface CalibrationResultsBentoProps {
  balance: CalibrationEppoBalanceResult; driftRisk: ContextualDriftRiskResult; activeCulture: CalibrationCultureOption | null;
  activeEquipment: CalibrationEquipmentOption | null; parcelWeather: ParcelWeatherResolution | null; isLoadingWeather: boolean;
  nozzleBounds: { minBar: number | null; maxBar: number | null }; autonomyHa: number | null; parcelTanks: ParcelTanksSummary | null;
  pressaoBar: number | null; selectedPdfMode: PdfAuditReportMode; isPro?: boolean; isGeneratingPdf?: boolean; isSaving?: boolean;
  editingRecord?: CalibrationAuditRecord | null; hasUnsavedChanges?: boolean;
  onSaveCalibration: () => void; onStartNewRecord?: () => void; onSelectPdfPreview: (mode: PdfAuditReportMode) => void;
}

const DRIFT_STYLES: Record<ContextualDriftRiskResult['nivelRisco'], { label: string; cls: string }> = {
  BAIXO: { label: 'BAIXO', cls: 'bg-emerald-100 text-[#114037] border-emerald-300' },
  MODERADO: { label: 'MODERADO', cls: 'bg-amber-100 text-amber-950 border-amber-300' },
  ELEVADO: { label: 'ELEVADO', cls: 'bg-orange-100 text-orange-950 border-orange-300' },
  CRITICO_BLOQUEADO: { label: 'BLOQUEIO LEGAL', cls: 'bg-rose-100 text-rose-900 border-rose-300' },
  INDETERMINADO: { label: 'ESTRUTURAL', cls: 'bg-slate-100 text-slate-700 border-slate-300' }
};

function buildRefBadge(balance: CalibrationEppoBalanceResult): { label: string; cls: string } {
  const dev = balance.desvioPercentual;
  const pct = dev !== null ? ` (${dev > 0 ? '+' : ''}${formatPtNumber(dev, 1)}%)` : '';
  if (balance.estadoConformidade === 'ALINHADO_REF_EPPO') return { label: `Alinhado com Ref.${pct}`, cls: 'bg-[#3CA64C] text-white' };
  if (balance.estadoConformidade === 'ABAIXO_REF_EPPO') return { label: `Abaixo da Ref.${pct}`, cls: 'bg-amber-400 text-amber-950' };
  if (balance.estadoConformidade === 'ACIMA_REF_EPPO') return { label: `Acima da Ref.${pct}`, cls: 'bg-amber-300 text-amber-950' };
  return { label: 'Sem Ref. EPPO', cls: 'bg-white/15 text-emerald-100' };
}

export const CalibrationResultsBento: React.FC<CalibrationResultsBentoProps> = ({
  balance, driftRisk, activeCulture, activeEquipment, parcelWeather, isLoadingWeather,
  nozzleBounds, autonomyHa, parcelTanks, pressaoBar, selectedPdfMode, isPro = false, isGeneratingPdf = false, isSaving = false,
  editingRecord = null, hasUnsavedChanges = false, onSaveCalibration, onStartNewRecord, onSelectPdfPreview
}) => {
  const eppoBadge = buildRefBadge(balance);
  const driftBadge = DRIFT_STYLES[driftRisk.nivelRisco];
  const bioLabel = activeCulture?.indexKind === 'LWA' ? 'LWA (Parede Foliar)' : activeCulture?.indexKind === 'TRV' ? 'TRV (Volume de Copa)' : 'Índice Vegetativo';
  const bioVal = activeCulture?.indexKind === 'LWA' && activeCulture.lwaM2Ha ? `${formatPtGroupedInt(activeCulture.lwaM2Ha)} m²/ha`
    : activeCulture?.indexKind === 'TRV' && activeCulture.trvM3Ha ? `${formatPtGroupedInt(activeCulture.trvM3Ha)} m³/ha` : '—';
  const cropTypologyLabel = activeCulture?.trvM3Ha || activeCulture?.lwaM2Ha || activeEquipment?.is3DOrAirAssisted ? 'Copa 3D' : 'Cultura 2D';
  const boundsRange = nozzleBounds.minBar && nozzleBounds.maxBar ? ` (${formatPtNumber(nozzleBounds.minBar, 1)}–${formatPtNumber(nozzleBounds.maxBar, 1)} bar)` : '';
  const pressureStatus = driftRisk.sobrepressaoBico ? 'Pressão acima do homologado' : driftRisk.subpressaoBico ? 'Pressão abaixo do mínimo' : `Pressão ${formatPtNumber(pressaoBar, 1)} bar compatível${boundsRange}`;
  const retText = balance.litrosPor1000m3Trv !== null
    ? `${formatPtNumber(balance.litrosPor1000m3Trv, 1)} L / 1 000 m³ TRV${balance.alertaRetencaoTrv === 'ESCORRIMENTO' ? ' · Risco escorrimento' : balance.alertaRetencaoTrv === 'SUB_COBERTURA' ? ' · Sub-cobertura' : ''}`
    : balance.litrosPor10000m2Lwa !== null ? `${formatPtNumber(balance.litrosPor10000m2Lwa, 1)} L / 10 000 m² LWA` : '—';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Cartão 1: Referência Biológica */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#1D734B] block">1 · REFERÊNCIA BIOLÓGICA (EPPO PP 1/239)</span>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">{bioLabel}</span>
              <span className="text-lg font-black text-[#114037] font-mono tabular-nums">{bioVal}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">Volume de Calda Sugerido (EPPO)</span>
              <span className="text-xl font-black text-[#114037] font-mono tabular-nums">{balance.volumeRecomendadoEppoLHa !== null ? `${formatPtNumber(balance.volumeRecomendadoEppoLHa, 1)} L/ha` : '—'}</span>
            </div>
          </div>
          <div className={`p-3 rounded-2xl border text-[11px] font-bold ${balance.abaixoPisoMecanico ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            <span>Piso Técnico Mínimo ({activeEquipment?.isDroneUav ? 'Drone' : 'Terrestre'}): </span>
            <strong className="font-mono tabular-nums">{formatPtNumber(balance.pisoMecanicoMinLHa, 0)} L/ha</strong>
            {balance.abaixoPisoMecanico && <span className="block mt-0.5 text-rose-700">Abaixo do piso técnico mínimo recomendado.</span>}
          </div>
        </div>
        <div className="p-5 rounded-3xl bg-[#114037] text-white shadow-soft flex flex-col justify-between space-y-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">2 · SÍNTESE DA CALIBRAÇÃO</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${eppoBadge.cls}`}>{eppoBadge.label}</span>
            </div>
            <div>
              <span className="text-[11px] text-emerald-200 block">Volume Estimado de Calda</span>
              <span className="text-3xl font-black font-mono tabular-nums">{balance.volumeCalibradoLHa !== null ? `${formatPtNumber(balance.volumeCalibradoLHa, 1)} L/ha` : '—'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="bg-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-emerald-200 block">Autonomia Depósito</span>
                <strong className="font-mono tabular-nums">{autonomyHa !== null ? `${formatPtNumber(autonomyHa, 2)} ha/depósito` : '—'}</strong>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-emerald-200 block">Retenção na Copa</span>
                <strong className="font-mono tabular-nums text-[11px]">{retText}</strong>
              </div>
              {parcelTanks && (
                <div className="col-span-2 bg-white/10 rounded-xl p-2.5 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-emerald-200">Depósitos p/ Parcela ({formatPtNumber(activeCulture?.areaHa, 2)} ha)</span>
                  <strong className="font-mono tabular-nums text-xs">{parcelTanks.displayLabel}</strong>
                </div>
              )}
            </div>
            {balance.caudalArSugeridoM3H !== null && (
              <div className="bg-white/10 rounded-xl p-2.5 text-[11px] flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 text-emerald-100"><Wind className="w-3.5 h-3.5 text-[#3CA64C]" /> Volume de Ar Sugerido</span>
                <strong className="font-mono tabular-nums">{formatPtGroupedInt(balance.caudalArSugeridoM3H)} m³/h</strong>
              </div>
            )}
          </div>
          {balance.recomendacaoBico && (
            <div className="p-2.5 rounded-2xl bg-emerald-950/70 border border-[#3CA64C]/50 text-[11px] space-y-1">
              <p className="font-black text-emerald-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#3CA64C] shrink-0" />
                <span>Ação Preferencial: {balance.recomendacaoBico.sugestaoBicoIso}</span>
              </p>
              <p className="text-[10px] text-emerald-100/90 leading-snug">{balance.recomendacaoBico.explicacaoFisicaPt}</p>
            </div>
          )}
        </div>

        {/* Cartão 3: Risco de Deriva (Open-Meteo por Freguesia) */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft flex flex-col justify-between space-y-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1D734B]">3 · RISCO DE DERIVA</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${driftBadge.cls}`}>{driftBadge.label}</span>
            </div>
            <p className="text-xs font-bold text-[#114037] flex items-center gap-1.5">
              {driftRisk.sobrepressaoBico || driftRisk.subpressaoBico ? <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-[#3CA64C] shrink-0" />}
              <span>{cropTypologyLabel} · {pressureStatus}</span>
            </p>
            {isLoadingWeather ? (
              <p className="text-[11px] text-slate-500 animate-pulse">A consultar meteorologia da freguesia…</p>
            ) : parcelWeather ? (
              <div className="space-y-1.5 text-[11px] text-slate-700">
                <p className="font-bold text-[#114037] flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#3CA64C] shrink-0" /><span>{parcelWeather.locationLabel}</span></p>
                <p className="font-mono tabular-nums text-slate-700">
                  Vento {formatPtNumber(driftRisk.ventoMs, 1)} m/s · Temp. {formatPtNumber(parcelWeather.temperatureC, 1)} °C · ΔT {formatPtNumber(parcelWeather.snapshot.deltaT, 1)} °C
                </p>
                {parcelWeather.next6hSummaryPt && <p className="text-[10px] text-slate-500 font-mono tabular-nums">Próx. 6h: {parcelWeather.next6hSummaryPt}</p>}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5"><CloudOff className="w-3.5 h-3.5 shrink-0" /><span>Offline / sem leitura meteorológica para a freguesia.</span></p>
            )}
          </div>
          {balance.alertaVelocidadePt && <p className="text-[10px] text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-2 leading-snug">{balance.alertaVelocidadePt}</p>}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" disabled={isSaving} onClick={onSaveCalibration} className="min-h-[48px] px-5 bg-[#3CA64C] hover:bg-[#359445] text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer touch-target disabled:opacity-60">
            <Save className="w-4 h-4" /><span>{isSaving ? 'A gravar…' : 'Gravar Ficha de Calibração'}</span>
          </button>
          {editingRecord && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs">
              <span className="font-bold text-[#114037] truncate max-w-[170px]" title={editingRecord.nomePerfil}>{editingRecord.nomePerfil}</span>
              {hasUnsavedChanges && <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-[10px] font-black">Alterado</span>}
              {onStartNewRecord && (
                <button type="button" onClick={onStartNewRecord} className="min-h-[32px] px-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-300 text-[#114037] text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer">
                  <FilePlus2 className="w-3.5 h-3.5 text-[#3CA64C]" /><span>Nova Ficha</span>
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { mode: 'CALIBRATION_AGRONOMIC' as const, label: 'PDF Calibração Agronómica' },
            { mode: 'ISO_16122_INSPECTION' as const, label: 'PDF Inspeção ISO 16122' }
          ].map((btn) => {
            const busy = isGeneratingPdf && selectedPdfMode === btn.mode;
            return (
              <button key={btn.mode} type="button" disabled={isGeneratingPdf} onClick={() => onSelectPdfPreview(btn.mode)}
                className={`min-h-[44px] px-3.5 rounded-2xl border text-xs font-extrabold flex items-center gap-2 cursor-pointer touch-target disabled:opacity-60 ${selectedPdfMode === btn.mode ? 'border-[#114037] bg-emerald-50 text-[#114037]' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
                <FileText className="w-4 h-4 text-[#1D734B]" />
                <span>{busy ? 'A gerar PDF…' : btn.label}</span>
                {!isPro && <span className="px-1.5 py-0.5 rounded-md bg-[#114037] text-white text-[9px] font-black uppercase">Pro</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

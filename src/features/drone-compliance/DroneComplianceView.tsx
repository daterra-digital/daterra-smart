import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, Wind, 
  Layers, Download, GraduationCap, ExternalLink, SlidersHorizontal,
  CheckCircle2, ChevronRight, Droplet, ArrowLeft, RefreshCw
} from 'lucide-react';

import { 
  evaluateDroneCompliance, 
  OFFICIAL_PRODUCTS_DGAV,
  LEGAL_MAX_WIND_MS,
  type ComplianceInputParams
} from './droneComplianceEngine';
import { DroneComplianceMap } from './DroneComplianceMap';

export const DroneComplianceView: React.FC = () => {
  // Estado dos parâmetros de voo e legislação
  const [apvNumber, setApvNumber] = useState<number>(9999);
  const [droneModel, setDroneModel] = useState<string>('DJI Agras T40');
  const [flightHeightM, setFlightHeightM] = useState<number>(2.5);
  const [droneSpeedMs, setDroneSpeedMs] = useState<number>(4.0);
  const [nozzleType, setNozzleType] = useState<'STANDARD' | 'AIR_INDUCTION_LOW_DRIFT'>('AIR_INDUCTION_LOW_DRIFT');
  const [windSpeedMs, setWindSpeedMs] = useState<number>(2.5);
  const [additionalSafetyBufferM, setAdditionalSafetyBufferM] = useState<number>(0);
  const [distanceToWaterBodyM, setDistanceToWaterBodyM] = useState<number>(18.0);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string>('');

  // Avaliação reativa imediata de conformidade (Offline-First)
  const compliance = useMemo(() => {
    const params: ComplianceInputParams = {
      apvNumber,
      droneModel,
      flightHeightM,
      droneSpeedMs,
      nozzleType,
      windSpeedMs,
      additionalSafetyBufferM,
      distanceToWaterBodyM,
      fieldTotalAreaHa: 5.40
    };
    return evaluateDroneCompliance(params);
  }, [
    apvNumber,
    droneModel,
    flightHeightM,
    droneSpeedMs,
    nozzleType,
    windSpeedMs,
    additionalSafetyBufferM,
    distanceToWaterBodyM
  ]);

  // Função para exportar / descarregar o Dossiê Pericial PDF
  const handleGeneratePdf = async () => {
    setIsExportingPdf(true);
    setPdfSuccessMessage('');

    try {
      // Tentativa de chamada à API backend FastAPI se disponível
      const response = await fetch('http://localhost:8000/api/v2/sprayops/compliance/audit-dossier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field_polygon_geojson: {
            type: 'Polygon',
            coordinates: [[
              [-8.61, 39.55], [-8.60, 39.55], [-8.60, 39.54], [-8.61, 39.54], [-8.61, 39.55]
            ]]
          },
          apv_number: apvNumber,
          drone_model: droneModel,
          flight_height_m: flightHeightM,
          drone_speed_ms: droneSpeedMs,
          nozzle_type: nozzleType,
          wind_speed_ms: windSpeedMs,
          operator_name: 'Piloto Remoto Certificado DATERRA',
          operator_license_number: 'DGAV-UAV-2026-0042',
          organization_name: 'Exploração Agrícola DATERRA Smart',
          parcel_name: 'Parcela A1 - Vinha Touriga Nacional'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dossie_conformidade_drone_apv${apvNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setPdfSuccessMessage('Dossiê pericial PDF transferido com sucesso.');
      } else {
        throw new Error('Serviço FastAPI indisponível');
      }
    } catch {
      // Fallback amigável: Abre janela de impressão formatada do navegador
      window.print();
      setPdfSuccessMessage('Relatório pericial emitido via impressão para PDF.');
    } finally {
      setIsExportingPdf(false);
      setTimeout(() => setPdfSuccessMessage(''), 5000);
    }
  };

  const selectedProduct = OFFICIAL_PRODUCTS_DGAV.find((p) => p.apvNumber === apvNumber);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navegação e Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/ferramentas" className="hover:text-daterra-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ferramentas</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800">Drone Buffer Zone & Legal Compliance</span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-daterra-primary/10 border border-daterra-primary/20 text-xs font-bold text-daterra-primary">
          <Layers className="w-3.5 h-3.5 text-daterra-accent" />
          <span>Módulo SprayOps 2.0 • Decreto-Lei n.º 91/2016</span>
        </div>
      </div>

      {/* Cartão de Destaque: Check Legal & Deriva Express */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-floating border border-slate-200 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Conformidade DGAV & GlobalGAP</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-daterra-primary">
              Drone Buffer Zone & Legal Compliance Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
              Cálculo automático em tempo real de zonas tampão dinâmicas (*drift buffer zones*), interseção geoespacial com corpos de água e validação legal da pulverização aérea com drones (UAV/UASS).
            </p>
          </div>

          <button
            onClick={handleGeneratePdf}
            disabled={isExportingPdf}
            className="px-5 py-3 bg-daterra-primary hover:bg-daterra-primary-hover text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md touch-target active:scale-95 shrink-0"
          >
            {isExportingPdf ? (
              <RefreshCw className="w-4 h-4 animate-spin text-daterra-accent" />
            ) : (
              <Download className="w-4 h-4 text-daterra-accent" />
            )}
            <span>{isExportingPdf ? 'A gerar dossiê...' : 'Gerar Dossiê PDF (GlobalGAP)'}</span>
          </button>
        </div>

        {pdfSuccessMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl text-center">
            {pdfSuccessMessage}
          </div>
        )}

        {/* Parecer Jurídico-Agronómico (Banner de Status) */}
        <div
          className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
            compliance.status === 'PERMITTED'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : compliance.status === 'RESTRICTED'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                compliance.status === 'PERMITTED'
                  ? 'bg-emerald-600 text-white'
                  : compliance.status === 'RESTRICTED'
                  ? 'bg-amber-500 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {compliance.status === 'PERMITTED' ? (
                <ShieldCheck className="w-6 h-6" />
              ) : compliance.status === 'RESTRICTED' ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <ShieldAlert className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider">
                  {compliance.status === 'PERMITTED'
                    ? 'AUTORIZADO (PERMITTED)'
                    : compliance.status === 'RESTRICTED'
                    ? 'CONDICIONADO COM RESTRIÇÕES (RESTRICTED)'
                    : 'PROIBIDO POR LEI (PROHIBITED)'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 font-mono font-bold">
                  Buffer Final: {compliance.bufferAppliedM.toFixed(1)}m
                </span>
              </div>
              <p className="text-xs font-medium leading-relaxed">
                {compliance.statusMessage}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0 text-xs font-bold">
            <span className="text-slate-600">Área Pulverizável:</span>
            <span
              className={`px-3 py-1 rounded-xl text-sm font-black font-mono ${
                compliance.status === 'PROHIBITED'
                  ? 'bg-rose-200 text-rose-900'
                  : 'bg-emerald-200 text-emerald-950'
              }`}
            >
              {compliance.sprayableAreaHa.toFixed(2)} ha (
              {((compliance.sprayableAreaHa / compliance.fieldAreaHa) * 100).toFixed(0)}%)
            </span>
          </div>
        </div>

        {/* Violações Rígidas (se existirem) */}
        {compliance.violations.length > 0 && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs text-rose-800">
            <span className="font-bold uppercase tracking-wider text-rose-900 block">
              Não-Conformidades Críticas Detetadas:
            </span>
            <ul className="list-disc list-inside space-y-1 font-medium">
              {compliance.violations.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Layout Principal: Mapa Interativo à Esquerda, Painel de Parâmetros à Direita */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Coluna do Mapa Vetorial (7 Colunas) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Visualização Geoespacial em Tempo Real
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Parcela: 5.40 ha • Linha de Água a {distanceToWaterBodyM.toFixed(0)}m
              </span>
            </div>

            <DroneComplianceMap
              compliance={compliance}
              windSpeedMs={windSpeedMs}
              windDirectionDeg={315}
              flightHeightM={flightHeightM}
              droneSpeedMs={droneSpeedMs}
              nozzleType={nozzleType}
            />

            {/* Cartões de Resumo das Métricas de Área */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Área Total</span>
                <span className="text-base font-extrabold font-mono text-slate-800">
                  {compliance.fieldAreaHa.toFixed(2)} ha
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">100% da Parcela</span>
              </div>

              <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 text-center">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Pulverizável</span>
                <span className="text-base font-extrabold font-mono text-emerald-700">
                  {compliance.sprayableAreaHa.toFixed(2)} ha
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">
                  {((compliance.sprayableAreaHa / compliance.fieldAreaHa) * 100).toFixed(0)}% elegível
                </span>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 text-center">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Excluída (Buffer)</span>
                <span className="text-base font-extrabold font-mono text-amber-700">
                  {compliance.excludedAreaHa.toFixed(2)} ha
                </span>
                <span className="text-[10px] text-amber-600 block mt-0.5">
                  {((compliance.excludedAreaHa / compliance.fieldAreaHa) * 100).toFixed(0)}% retida
                </span>
              </div>
            </div>
          </div>

          {/* Coluna de Controlos & Sliders (5 Colunas) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-daterra-primary border-b border-slate-200 pb-2">
                <SlidersHorizontal className="w-4 h-4 text-daterra-accent" />
                <span>Parâmetros Operacionais de Voo</span>
              </div>

              {/* Seletor de Modelo de Drone */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1.5">
                  Modelo de Drone (UAV / UASS)
                </label>
                <select
                  value={droneModel}
                  onChange={(e) => setDroneModel(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-daterra-accent outline-none"
                >
                  <option value="DJI Agras T40">DJI Agras T40 (40L / Bicos Atomizadores Duplos)</option>
                  <option value="DJI Agras T30">DJI Agras T30 (30L / 16 Bicos de Pressão)</option>
                  <option value="DJI Agras T25">DJI Agras T25 (20L / Pomares & Encostas)</option>
                  <option value="XAG P100 Pro">XAG P100 Pro (50L / Atomização Centrífuga)</option>
                </select>
              </div>

              {/* Seletor de Produto DGAV / APV */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1.5">
                  Produto Fitofarmacêutico (Rótulo DGAV / APV)
                </label>
                <select
                  value={apvNumber}
                  onChange={(e) => setApvNumber(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-daterra-accent outline-none"
                >
                  {OFFICIAL_PRODUCTS_DGAV.map((prod) => (
                    <option key={prod.apvNumber} value={prod.apvNumber}>
                      APV {prod.apvNumber} — {prod.productName}
                    </option>
                  ))}
                </select>
                {selectedProduct && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Buffer legal base: {selectedProduct.minWaterBufferM}m (Água) • {selectedProduct.minResidentialBufferM}m (Habitação)
                  </p>
                )}
              </div>

              {/* Slider Vento com Alerta do DL 91/2016 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Velocidade do Vento</span>
                  </span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                      windSpeedMs > LEGAL_MAX_WIND_MS
                        ? 'bg-rose-100 text-rose-700 animate-pulse'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {windSpeedMs.toFixed(2)} m/s ({(windSpeedMs * 3.6).toFixed(1)} km/h)
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="6.0"
                  step="0.1"
                  value={windSpeedMs}
                  onChange={(e) => setWindSpeedMs(Number(e.target.value))}
                  className="w-full accent-daterra-accent cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0.5 m/s (Calmo)</span>
                  <span className="text-rose-600 font-bold">Limite Legal: 4.17 m/s (15 km/h)</span>
                  <span>6.0 m/s</span>
                </div>
              </div>

              {/* Toggle de Bicos de Indução de Ar (DRT -50%) */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-daterra-accent" />
                    <span>Bicos de Baixa Deriva (DRT)</span>
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Bicos de indução de ar (IDK/IDKT) reduzem o buffer em 50%.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setNozzleType(
                      nozzleType === 'AIR_INDUCTION_LOW_DRIFT' ? 'STANDARD' : 'AIR_INDUCTION_LOW_DRIFT'
                    )
                  }
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    nozzleType === 'AIR_INDUCTION_LOW_DRIFT'
                      ? 'bg-daterra-accent text-white shadow-sm'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {nozzleType === 'AIR_INDUCTION_LOW_DRIFT' ? 'ATIVO (-50%)' : 'STANDARD (1.0x)'}
                </button>
              </div>

              {/* Sliders de Altura e Velocidade do Drone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700">
                    <span>Altura Voo</span>
                    <span className="font-mono text-daterra-primary">{flightHeightM.toFixed(1)}m</span>
                  </div>
                  <input
                    type="range"
                    min="1.5"
                    max="4.5"
                    step="0.5"
                    value={flightHeightM}
                    onChange={(e) => setFlightHeightM(Number(e.target.value))}
                    className="w-full accent-daterra-accent cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700">
                    <span>Velocidade</span>
                    <span className="font-mono text-daterra-primary">{droneSpeedMs.toFixed(1)} m/s</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="8.0"
                    step="0.5"
                    value={droneSpeedMs}
                    onChange={(e) => setDroneSpeedMs(Number(e.target.value))}
                    className="w-full accent-daterra-accent cursor-pointer"
                  />
                </div>
              </div>

              {/* Slider Distância à Linha de Água */}
              <div className="space-y-1 pt-1 border-t border-slate-200/80">
                <div className="flex justify-between text-[11px] font-bold text-slate-700">
                  <span>Distância à Linha de Água</span>
                  <span className="font-mono text-cyan-700">{distanceToWaterBodyM.toFixed(0)}m</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={distanceToWaterBodyM}
                  onChange={(e) => setDistanceToWaterBodyM(Number(e.target.value))}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
              </div>

              {/* Slider Buffer Adicional de Segurança */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-700">
                  <span>Buffer Adicional de Segurança</span>
                  <span className="font-mono text-slate-700">+{additionalSafetyBufferM}m</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={additionalSafetyBufferM}
                  onChange={(e) => setAdditionalSafetyBufferM(Number(e.target.value))}
                  className="w-full accent-daterra-primary cursor-pointer"
                />
              </div>
            </div>

            {/* Ações de Mitigação Obrigatórias */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-daterra-accent" />
                <span>Prescrições Técnicas e Mitigações</span>
              </span>
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                {compliance.mitigations.map((m, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-daterra-accent shrink-0 mt-1.5" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bloco de Recomendação da Academia DATERRA (Moodle SSO) */}
            {compliance.academyRecommendation && (
              <div className="bg-gradient-to-br from-daterra-primary to-daterra-secondary text-white rounded-2xl p-5 space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-daterra-accent text-xs font-bold">
                  <GraduationCap className="w-4 h-4" />
                  <span>Capacitação Técnica Recomendada</span>
                </div>
                <h4 className="text-sm font-bold leading-tight">
                  {compliance.academyRecommendation.courseTitle}
                </h4>
                <p className="text-[11px] text-slate-200 leading-relaxed">
                  Aceda à formação especializada na Academia DATERRA para dominar técnicas de minimização de deriva e configuração de bicos de indução de ar.
                </p>
                <a
                  href={compliance.academyRecommendation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-daterra-accent hover:bg-daterra-accent/90 text-white rounded-xl text-xs font-bold transition-all shadow-sm group"
                >
                  <span>Aceder ao Curso na Academia</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DroneComplianceView;

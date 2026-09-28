import React from 'react';
import { Compass, Navigation } from 'lucide-react';
import type { ComplianceEvaluationResult } from './droneComplianceEngine';

interface Props {
  compliance: ComplianceEvaluationResult;
  windSpeedMs: number;
  windDirectionDeg?: number;
  flightHeightM: number;
  droneSpeedMs: number;
  nozzleType: string;
}

export const DroneComplianceMap: React.FC<Props> = ({
  compliance,
  windSpeedMs,
  windDirectionDeg = 315,
  flightHeightM,
  droneSpeedMs,
  nozzleType
}) => {
  // SVG Canvas dimensions: 800 x 520
  const width = 800;
  const height = 520;

  // Polígono base da Parcela Agrícola (Coordenadas SVG normalizadas)
  // [140, 90] -> [660, 90] -> [630, 430] -> [170, 430]
  const fieldPolygonPoints = "150,90 650,90 620,430 180,430";

  // Camada Sensível: Linha de Água (Ribeira / Rio) ao fundo (sul/este)
  // Faixa de água próxima da bordadura inferior
  const waterRiverPoints = "80,460 720,460 720,500 80,500";

  // Camada Sensível: Zona Urbana / Residencial a Noroeste
  const urbanZonePoints = "40,40 130,40 130,110 40,110";

  // Camada Sensível: Escola / Recinto Sensível a Nordeste
  const schoolZonePoints = "680,40 760,40 760,110 680,110";

  // Dinâmica do Buffer Ribbon:
  // A espessura da zona de exclusão (Buffer) em pixels é proporcional a bufferAppliedM
  // bufferAppliedM varia tipicamente entre 5m e 50m.
  // Mapeamos para 12px a 90px no mapa.
  const bufferPx = Math.min(100, Math.max(14, compliance.bufferAppliedM * 2.8));

  // Polígono pulverizável seguro (Sprayable Safe Polygon):
  // É a parcela retraída na bordadura adjacente à água e zonas sensíveis
  // Se PROHIBITED: não pulverizável
  const isProhibited = compliance.status === 'PROHIBITED';
  const isRestricted = compliance.status === 'RESTRICTED';

  // Se Restricted, a margem inferior retrai em função do buffer
  const safeBottomY = Math.max(120, 430 - bufferPx);
  const sprayablePoints = isProhibited
    ? ""
    : isRestricted
    ? `160,105 640,105 615,${safeBottomY} 185,${safeBottomY}`
    : "155,95 645,95 618,425 182,425";

  // Faixa de Buffer Ribbon (Zona de exclusão de não pulverização na bordadura)
  const bufferRibbonPoints = `185,${safeBottomY} 615,${safeBottomY} 620,430 180,430`;

  return (
    <div className="relative w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Header Flutuante do Mapa */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/60 shadow-lg pointer-events-auto">
          <Compass className="w-4 h-4 text-daterra-accent animate-pulse" />
          <span className="text-xs font-bold text-slate-200">
            Ortofotomapa Vetorial • Santarém (EPSG:3763)
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            39.545° N, 8.605° W
          </span>
        </div>

        {/* Indicador de Vento e Direção */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/60 shadow-lg pointer-events-auto text-xs">
          <span className="text-slate-400 font-medium">Vento:</span>
          <span className={`font-bold font-mono ${windSpeedMs > 4.17 ? 'text-rose-400 animate-bounce' : 'text-slate-200'}`}>
            {windSpeedMs.toFixed(1)} m/s ({(windSpeedMs * 3.6).toFixed(0)} km/h)
          </span>
          <div
            className="w-5 h-5 flex items-center justify-center text-daterra-accent"
            style={{ transform: `rotate(${windDirectionDeg}deg)` }}
            title={`Direção: ${windDirectionDeg}°`}
          >
            <Navigation className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>
      </div>

      {/* SVG Interativo de Alta Resolução */}
      <div className="w-full aspect-[16/10] max-h-[500px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Hachura Vermelha para Zonas Urbanas */}
            <pattern id="hatch-urban" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#EF4444" strokeWidth="2" opacity="0.6" />
            </pattern>

            {/* Hachura Púrpura para Escolas */}
            <pattern id="hatch-school" width="8" height="8" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#A855F7" strokeWidth="2" opacity="0.6" />
            </pattern>

            {/* Padrão de Grade Agrícola de Fundo */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.75" />
            </pattern>

            {/* Gradiente da Zona Tampão (Buffer Ribbon) */}
            <linearGradient id="bufferGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.75" />
            </linearGradient>

            {/* Gradiente da Zona Pulverizável Segura */}
            <linearGradient id="sprayableGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.75" />
            </linearGradient>
          </defs>

          {/* Fundo com Grade de Coordenadas */}
          <rect width={width} height={height} fill="#0B1324" />
          <rect width={width} height={height} fill="url(#grid)" opacity="0.8" />

          {/* 1. CAMADA SENSÍVEL: Linha de Água (Rio / Linha de Água Protegida) */}
          <g>
            <polygon points={waterRiverPoints} fill="#06B6D4" opacity="0.3" />
            <polygon points={waterRiverPoints} fill="none" stroke="#06B6D4" strokeWidth="2" strokeDasharray="6,3" />
            <text x="400" y="485" fill="#67E8F9" fontSize="11" fontWeight="bold" textAnchor="middle" letterSpacing="2">
              ≈ MASSA DE ÁGUA PROTEGIDA (LEITO DE CHEIA / VALA REAL) ≈
            </text>
          </g>

          {/* 2. CAMADA SENSÍVEL: Aglomerado Urbano / Residencial (Noroeste) */}
          <g>
            <polygon points={urbanZonePoints} fill="url(#hatch-urban)" />
            <polygon points={urbanZonePoints} fill="none" stroke="#EF4444" strokeWidth="2" />
            <text x="85" y="80" fill="#FCA5A5" fontSize="10" fontWeight="bold" textAnchor="middle">
              HABITAÇÃO (50m)
            </text>
          </g>

          {/* 3. CAMADA SENSÍVEL: Recinto Escolar / Saúde (Nordeste) */}
          <g>
            <polygon points={schoolZonePoints} fill="url(#hatch-school)" />
            <polygon points={schoolZonePoints} fill="none" stroke="#A855F7" strokeWidth="2" />
            <text x="720" y="80" fill="#E9D5FF" fontSize="10" fontWeight="bold" textAnchor="middle">
              ESCOLA (50m)
            </text>
          </g>

          {/* 4. PARCELA PRINCIPAL DO CLIENTE (Blue Outline) */}
          <polygon
            points={fieldPolygonPoints}
            fill="#1E3A8A"
            fillOpacity="0.15"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <text x="400" y="140" fill="#93C5FD" fontSize="13" fontWeight="bold" textAnchor="middle" letterSpacing="1">
            PARCELA AGRÍCOLA PRINCIPAL (5.40 ha)
          </text>

          {/* 5. ZONA TAMPÃO DINÂMICA (Buffer Ribbon - Faixa de Não Pulverização) */}
          {isRestricted && (
            <g>
              <polygon
                points={bufferRibbonPoints}
                fill="url(#bufferGradient)"
                stroke="#F59E0B"
                strokeWidth="1.5"
                strokeDasharray="4,2"
              />
              <text
                x="400"
                y={(safeBottomY + 430) / 2 + 5}
                fill="#FEF08A"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
              >
                FAIXA TAMPÃO OBRIGATÓRIA ({compliance.bufferAppliedM.toFixed(1)}m)
              </text>
            </g>
          )}

          {/* 6. POLÍGONO DE APLICAÇÃO SEGURA (Sprayable Polygon) */}
          {!isProhibited && sprayablePoints && (
            <g>
              <polygon
                points={sprayablePoints}
                fill="url(#sprayableGradient)"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <circle cx="400" cy="240" r="4" fill="#34D399" />
              <text x="400" y="270" fill="#A7F3D0" fontSize="14" fontWeight="800" textAnchor="middle">
                ZONA PULVERIZÁVEL AUTORIZADA
              </text>
              <text x="400" y="290" fill="#D1FAE5" fontSize="11" fontWeight="bold" textAnchor="middle">
                {compliance.sprayableAreaHa.toFixed(2)} ha ({((compliance.sprayableAreaHa / compliance.fieldAreaHa) * 100).toFixed(0)}% da Parcela)
              </text>
            </g>
          )}

          {/* 7. ALERTA DE PROIBIÇÃO TOTAL (Se for PROHIBITED) */}
          {isProhibited && (
            <g>
              <polygon points={fieldPolygonPoints} fill="#EF4444" fillOpacity="0.4" stroke="#DC2626" strokeWidth="3" />
              <rect x="250" y="210" width="300" height="90" rx="16" fill="#7F1D1D" fillOpacity="0.9" stroke="#F87171" strokeWidth="2" />
              <text x="400" y="245" fill="#FFFFFF" fontSize="16" fontWeight="900" textAnchor="middle">
                ⛔ VOO PROIBIDO POR LEI
              </text>
              <text x="400" y="270" fill="#FECACA" fontSize="11" fontWeight="bold" textAnchor="middle">
                {windSpeedMs > 4.17 ? "Infracção DL 91/2016: Vento > 15 km/h" : "Produto sem autorização aérea"}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Legenda Flutuante Inferior */}
      <div className="p-4 bg-slate-900/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm border-2 border-blue-500 bg-blue-500/20" />
            <span className="text-slate-300 font-medium">Limite Parcela</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500/70 border border-emerald-400" />
            <span className="text-slate-300 font-medium">Área Autorizada</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-amber-500/50 border border-amber-400" />
            <span className="text-slate-300 font-medium">Zona Tampão ({compliance.bufferAppliedM.toFixed(1)}m)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-cyan-500/40 border border-cyan-400" />
            <span className="text-slate-300 font-medium">Massa de Água</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-rose-500/40 border border-rose-400" />
            <span className="text-slate-300 font-medium">Habitação (50m)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span>DRT:</span>
          <span className="font-bold text-slate-200">
            {nozzleType.includes('LOW_DRIFT') ? 'Bicos Indução de Ar (-50%)' : 'Bicos Standard'}
          </span>
          <span>•</span>
          <span>H: {flightHeightM.toFixed(1)}m</span>
          <span>•</span>
          <span>V: {droneSpeedMs.toFixed(1)}m/s</span>
        </div>
      </div>
    </div>
  );
};
export default DroneComplianceMap;

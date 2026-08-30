/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Componente: CalculationHistoryCard
 * Fase 4 & Fase 7A - Cartão de Histórico para Calculadoras (Dose e Concentração da Calda)
 */

import React from 'react';
import { Calendar, Tag, Trash2, Eye, Edit3, Share2 } from 'lucide-react';
import type { CalculationHistoryRecord } from '../../../types/calculator.ts';
import { hasEligibleTransferTargets } from '../core/transferService.ts';

export interface CalculationHistoryCardProps {
  record: CalculationHistoryRecord;
  onViewDetails: (record: CalculationHistoryRecord) => void;
  onEditMetadata: (record: CalculationHistoryRecord) => void;
  onDelete: (record: CalculationHistoryRecord) => void;
  onOpenTransfer?: (record: CalculationHistoryRecord) => void;
}

export const CalculationHistoryCard: React.FC<CalculationHistoryCardProps> = ({
  record,
  onViewDetails,
  onEditMetadata,
  onDelete,
  onOpenTransfer
}) => {
  // Formatação de data e hora em pt-PT
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };
  const isDose = record.calculatorId === 'calc_dose';
  const isConcentracao = record.calculatorId === 'calc_concentracao';
  const isVelocidade = record.calculatorId === 'calc_velocidade_real';
  const isAreaParedeFoliar = record.calculatorId === 'calc_area_parede_foliar';
  const isVolumeCopa = record.calculatorId === 'calc_volume_copa';
  const isVolumeCaldaTrv = record.calculatorId === 'calc_volume_calda_trv';
  const isDebitoTotal = record.calculatorId === 'calc_debito_total';

  // --- CAMPOS DA DOSE ---
  const volPrepDose = record.inputs['volPrepararDose']?.rawValue ?? '-';
  const volPrepDoseUnit = record.inputs['volPrepararDose']?.unit ?? 'L';
  const dose = record.inputs['doseValue']?.rawValue ?? '-';
  const doseUnit = record.inputs['doseValue']?.unit ?? 'L/ha';
  const calda = record.inputs['volCalda']?.rawValue ?? '-';
  const caldaUnit = record.inputs['volCalda']?.unit ?? 'L/ha';

  const areaOut = record.outputs['area_tratada_ha'];
  const areaValue = areaOut?.rawValue !== undefined
    ? Number(areaOut.rawValue).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '-';
  const areaUnit = areaOut?.unit ?? 'ha';

  // --- CAMPOS DA CONCENTRAÇÃO ---
  const rawMode = String(record.inputs['mode']?.rawValue || '');
  const isAdulta = rawMode === 'planta_adulta' || rawMode === 'adulta';
  const modeLabel = isAdulta ? 'Planta Adulta' : 'Planta Jovem';

  const concVal = record.inputs['concValue']?.rawValue ?? '-';
  const concUnit = record.inputs['concValue']?.unit ?? 'mL/hL';
  const volPrepConc = record.inputs['volPrepararConc']?.rawValue ?? '-';
  const volPrepConcUnit = record.inputs['volPrepararConc']?.unit ?? 'L';
  const volRec = record.inputs['volRecomendado']?.rawValue ?? '-';
  const volRecUnit = record.inputs['volRecomendado']?.unit ?? 'L/ha';
  const volApl = record.inputs['volAplicado']?.rawValue ?? '-';
  const volAplUnit = record.inputs['volAplicado']?.unit ?? 'L/ha';

  // --- CAMPOS DA VELOCIDADE REAL ---
  const distVal = record.inputs['distanciaPercurso']?.rawValue ?? '-';
  const distUnit = record.inputs['distanciaPercurso']?.unit ?? 'm';
  const tempoVal = record.inputs['tempoPercurso']?.rawValue ?? '-';
  const tempoUnit = record.inputs['tempoPercurso']?.unit ?? 's';

  const speedOut = record.outputs['velocidadeReal'];
  const speedVal = speedOut?.rawValue !== undefined
    ? Number(speedOut.rawValue).toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : '-';
  const speedUnit = speedOut?.unit ?? 'km/h';
  const speedAuxVal = speedOut?.subValue !== undefined
    ? Number(speedOut.subValue).toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : null;
  const speedAuxUnit = speedOut?.subUnit ?? 'm/s';

  // --- CAMPOS DA ÁREA DE PAREDE FOLIAR (LWA) ---
  const altLwaVal = record.inputs['alturaVegetacao']?.rawValue ?? '-';
  const altLwaUnit = record.inputs['alturaVegetacao']?.unit ?? 'm';
  const entLwaVal = record.inputs['distanciaEntrelinhas']?.rawValue ?? '-';
  const entLwaUnit = record.inputs['distanciaEntrelinhas']?.unit ?? 'm';

  const lwaOut = record.outputs['areaParedeFoliar'];
  const lwaVal = lwaOut?.rawValue !== undefined
    ? Number(lwaOut.rawValue).toLocaleString('pt-PT', { maximumFractionDigits: 0 })
    : '-';
  const lwaUnit = lwaOut?.unit ?? 'm² LWA/ha';

  // --- CAMPOS DO VOLUME DE COPA (TRV) ---
  const altTrvVal = record.inputs['alturaCopa']?.rawValue ?? '-';
  const altTrvUnit = record.inputs['alturaCopa']?.unit ?? 'm';
  const largTrvVal = record.inputs['larguraCopa']?.rawValue ?? '-';
  const largTrvUnit = record.inputs['larguraCopa']?.unit ?? 'm';
  const entTrvVal = record.inputs['distanciaEntrelinhas']?.rawValue ?? '-';
  const entTrvUnit = record.inputs['distanciaEntrelinhas']?.unit ?? 'm';

  const trvOut = record.outputs['volumeCopa'] || record.outputs['tree_row_volume'];
  const trvVal = trvOut?.rawValue !== undefined
    ? Number(trvOut.rawValue).toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : '-';
  const trvUnit = trvOut?.unit ?? 'm³ TRV/ha';

  // --- CAMPOS DO VOLUME DE CALDA ADEQUADO POR TRV ---
  const trvCaldaInputVal = record.inputs['volumeCopaTrv']?.rawValue ?? '-';
  const trvCaldaInputUnit = record.inputs['volumeCopaTrv']?.unit ?? 'm³ TRV/ha';
  const kCaldaInputVal = record.inputs['coeficienteVolumeCalda']?.rawValue ?? '-';
  const kCaldaInputUnit = record.inputs['coeficienteVolumeCalda']?.unit ?? 'L/m³';

  const caldaTrvOut = record.outputs['volumeCaldaEstimado'] || record.outputs['spray_volume_rate'];
  const caldaTrvVal = caldaTrvOut?.rawValue !== undefined
    ? Number(caldaTrvOut.rawValue).toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : '-';
  const caldaTrvUnit = caldaTrvOut?.unit ?? 'L/ha';

  // --- CAMPOS DO DÉBITO TOTAL DO PULVERIZADOR ---
  const caldaDebitoVal = record.inputs['volumeCalda']?.rawValue ?? '-';
  const caldaDebitoUnit = record.inputs['volumeCalda']?.unit ?? 'L/ha';
  const velDebitoVal = record.inputs['velocidadeTrabalho']?.rawValue ?? '-';
  const velDebitoUnit = record.inputs['velocidadeTrabalho']?.unit ?? 'km/h';
  const largDebitoVal = record.inputs['larguraTrabalho']?.rawValue ?? '-';
  const largDebitoUnit = record.inputs['larguraTrabalho']?.unit ?? 'm';
  const baseLarguraVal = record.inputs['baseLargura']?.labelSnapshot ||
    (record.inputs['baseLargura']?.rawValue === 'boom_total_width'
      ? 'Largura total da barra'
      : record.inputs['baseLargura']?.rawValue === 'row_spacing'
      ? 'Distância entrelinhas'
      : record.inputs['baseLargura']?.rawValue === 'effective_treated_band'
      ? 'Faixa efetiva tratada'
      : record.inputs['baseLargura']?.rawValue === 'manual_width'
      ? 'Largura manual específica'
      : String(record.inputs['baseLargura']?.rawValue ?? ''));

  const debitoTotalOut = record.outputs['debitoTotal'] || record.outputs['total_flow_rate'];
  const debitoTotalVal = debitoTotalOut?.rawValue !== undefined
    ? Number(debitoTotalOut.rawValue).toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : '-';
  const debitoTotalUnit = debitoTotalOut?.unit ?? 'L/min';

  // --- RESULTADO PRINCIPAL DE PESTICIDA (COMUM A DOSE E CONCENTRAÇÃO) ---
  const pfValue = isConcentracao
    ? (record.outputs['quantidade_pf_ml']?.rawValue !== undefined
        ? Number(record.outputs['quantidade_pf_ml'].rawValue).toLocaleString('pt-PT', { maximumFractionDigits: 2 })
        : record.outputs['quantidade_pf_g']?.rawValue !== undefined
        ? Number(record.outputs['quantidade_pf_g'].rawValue).toLocaleString('pt-PT', { maximumFractionDigits: 2 })
        : '-')
    : (record.outputs['quantidade_pf']?.rawValue !== undefined
        ? Number(record.outputs['quantidade_pf'].rawValue).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '-');

  const pfUnit = isConcentracao
    ? (record.outputs['quantidade_pf_ml']?.unit || record.outputs['quantidade_pf_g']?.unit || 'L')
    : (record.outputs['quantidade_pf']?.unit ?? 'L');

  const subVal = record.outputs['quantidade_pf']?.subValue !== undefined
    ? Number(record.outputs['quantidade_pf'].subValue).toLocaleString('pt-PT', { maximumFractionDigits: 0 })
    : record.outputs['quantidade_pf_ml']?.subValue !== undefined
    ? Number(record.outputs['quantidade_pf_ml'].subValue).toLocaleString('pt-PT', { maximumFractionDigits: 2 })
    : record.outputs['quantidade_pf_g']?.subValue !== undefined
    ? Number(record.outputs['quantidade_pf_g'].subValue).toLocaleString('pt-PT', { maximumFractionDigits: 2 })
    : null;

  const subUnit = record.outputs['quantidade_pf']?.subUnit ||
    record.outputs['quantidade_pf_ml']?.subUnit ||
    record.outputs['quantidade_pf_g']?.subUnit;

  const defaultTitle = isConcentracao
    ? 'Cálculo de Concentração'
    : isVelocidade
    ? 'Velocidade Real de Trabalho'
    : isAreaParedeFoliar
    ? 'Área de Parede Foliar'
    : isVolumeCopa
    ? 'Volume de Copa (TRV)'
    : isVolumeCaldaTrv
    ? 'Volume de Calda Adequado por TRV'
    : isDebitoTotal
    ? 'Débito Total do Pulverizador'
    : 'Cálculo de Dose por Hectare';

  return (
    <article
      className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-daterra-accent/60 transition-all shadow-xs space-y-3 relative group"
      aria-label={`Registo de cálculo de ${record.name || defaultTitle}`}
    >
      {/* 1. Cabeçalho do Cartão: Nome + Data/Hora + Badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-daterra-primary truncate">
            {record.name || defaultTitle}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mt-0.5">
            <Calendar className="w-3 h-3 shrink-0" />
            <time dateTime={record.createdAt}>{formatDate(record.createdAt)}</time>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Badge de Modo na Concentração */}
          {isConcentracao && (
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isAdulta
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300/80'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
              }`}
            >
              {modeLabel}
            </span>
          )}

          {/* Badge "Local" */}
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
            Local
          </span>
        </div>
      </div>

      {/* 2. Resultados em Destaque */}
      {isDebitoTotal ? (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Débito Total do Pulverizador
            </span>
            <div className="text-base sm:text-lg font-black font-mono-numbers text-daterra-primary">
              {debitoTotalVal} <span className="text-xs font-bold text-daterra-accent">{debitoTotalUnit}</span>
            </div>
          </div>
        </div>
      ) : isVolumeCaldaTrv ? (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Volume de Calda Estimado
            </span>
            <div className="text-base sm:text-lg font-black font-mono-numbers text-daterra-primary">
              {caldaTrvVal} <span className="text-xs font-bold text-daterra-accent">{caldaTrvUnit}</span>
            </div>
          </div>
        </div>
      ) : isVolumeCopa ? (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Volume de Copa (TRV)
            </span>
            <div className="text-base sm:text-lg font-black font-mono-numbers text-daterra-primary">
              {trvVal} <span className="text-xs font-bold text-daterra-accent">{trvUnit}</span>
            </div>
          </div>
        </div>
      ) : isAreaParedeFoliar ? (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Área de Parede Foliar
            </span>
            <div className="text-base sm:text-lg font-black font-mono-numbers text-daterra-primary">
              {lwaVal} <span className="text-xs font-bold text-daterra-accent">{lwaUnit}</span>
            </div>
          </div>
        </div>
      ) : isVelocidade ? (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Velocidade
            </span>
            <div className="text-base sm:text-lg font-black font-mono-numbers text-daterra-primary">
              {speedVal} <span className="text-xs font-bold text-daterra-accent">{speedUnit}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Equivalente
            </span>
            <div className="text-base sm:text-lg font-black font-mono-numbers text-daterra-primary">
              {speedAuxVal ?? '-'} <span className="text-xs font-bold text-daterra-accent">{speedAuxUnit}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Pesticida Necessário
            </span>
            <div className="text-base sm:text-lg font-black font-mono-numbers text-daterra-primary">
              {pfValue} <span className="text-xs font-bold text-daterra-accent">{pfUnit}</span>
              {subVal && (
                <span className="text-xs font-medium text-slate-500 ml-1.5">
                  ({subVal} {subUnit})
                </span>
              )}
            </div>
          </div>

          {isDose && (
            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Área Coberta
              </span>
              <div className="text-base sm:text-lg font-black font-mono-numbers text-daterra-primary">
                {areaValue} <span className="text-xs font-bold text-daterra-accent">{areaUnit}</span>
              </div>
            </div>
          )}

          {isConcentracao && (
            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Modo Calda
              </span>
              <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/60">
                {modeLabel}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Resumo dos Campos de Entrada */}
      {isDebitoTotal && (
        <div className="text-xs font-mono-numbers text-slate-600 bg-slate-100/70 px-2.5 py-1.5 rounded-lg flex items-center justify-between flex-wrap gap-2">
          <span>Q: <strong className="font-bold text-slate-800">{caldaDebitoVal} {caldaDebitoUnit}</strong></span>
          <span>·</span>
          <span>v: <strong className="font-bold text-slate-800">{velDebitoVal} {velDebitoUnit}</strong></span>
          <span>·</span>
          <span>W: <strong className="font-bold text-slate-800">{largDebitoVal} {largDebitoUnit}</strong>{baseLarguraVal ? ` (${baseLarguraVal})` : ''}</span>
        </div>
      )}

      {isVolumeCaldaTrv && (
        <div className="text-xs font-mono-numbers text-slate-600 bg-slate-100/70 px-2.5 py-1.5 rounded-lg flex items-center justify-between flex-wrap gap-2">
          <span>TRV: <strong className="font-bold text-slate-800">{trvCaldaInputVal} {trvCaldaInputUnit}</strong></span>
          <span>·</span>
          <span>k: <strong className="font-bold text-slate-800">{kCaldaInputVal} {kCaldaInputUnit}</strong></span>
        </div>
      )}

      {isVolumeCopa && (
        <div className="text-xs font-mono-numbers text-slate-600 bg-slate-100/70 px-2.5 py-1.5 rounded-lg flex items-center justify-between flex-wrap gap-2">
          <span>Altura: <strong className="font-bold text-slate-800">{altTrvVal} {altTrvUnit}</strong></span>
          <span>·</span>
          <span>Largura: <strong className="font-bold text-slate-800">{largTrvVal} {largTrvUnit}</strong></span>
          <span>·</span>
          <span>Entrelinha: <strong className="font-bold text-slate-800">{entTrvVal} {entTrvUnit}</strong></span>
        </div>
      )}

      {isAreaParedeFoliar && (
        <div className="text-xs font-mono-numbers text-slate-600 bg-slate-100/70 px-2.5 py-1.5 rounded-lg flex items-center justify-between flex-wrap gap-2">
          <span>Altura: <strong className="font-bold text-slate-800">{altLwaVal} {altLwaUnit}</strong></span>
          <span>·</span>
          <span>Entrelinha: <strong className="font-bold text-slate-800">{entLwaVal} {entLwaUnit}</strong></span>
        </div>
      )}

      {isVelocidade && (
        <div className="text-xs font-mono-numbers text-slate-600 bg-slate-100/70 px-2.5 py-1.5 rounded-lg flex items-center justify-between flex-wrap gap-2">
          <span>Distância: <strong className="font-bold text-slate-800">{distVal} {distUnit}</strong></span>
          <span>·</span>
          <span>Tempo: <strong className="font-bold text-slate-800">{tempoVal} {tempoUnit}</strong></span>
        </div>
      )}

      {isDose && (
        <div className="text-xs font-mono-numbers text-slate-600 bg-slate-100/70 px-2.5 py-1.5 rounded-lg flex items-center justify-between flex-wrap gap-2">
          <span>Tanque: <strong className="font-bold text-slate-800">{volPrepDose} {volPrepDoseUnit}</strong></span>
          <span>·</span>
          <span>Dose: <strong className="font-bold text-slate-800">{dose} {doseUnit}</strong></span>
          <span>·</span>
          <span>Calda: <strong className="font-bold text-slate-800">{calda} {caldaUnit}</strong></span>
        </div>
      )}

      {isConcentracao && (
        <div className="text-xs font-mono-numbers text-slate-600 bg-slate-100/70 px-2.5 py-1.5 rounded-lg flex items-center justify-between flex-wrap gap-2">
          <span>Conc: <strong className="font-bold text-slate-800">{concVal} {concUnit}</strong></span>
          <span>·</span>
          <span>Tanque: <strong className="font-bold text-slate-800">{volPrepConc} {volPrepConcUnit}</strong></span>
          {isAdulta && (
            <>
              <span>·</span>
              <span>Rec: <strong className="font-bold text-slate-800">{volRec} {volRecUnit}</strong></span>
              <span>·</span>
              <span>Real: <strong className="font-bold text-slate-800">{volApl} {volAplUnit}</strong></span>
            </>
          )}
        </div>
      )}

      {/* 4. Notas (se existirem) */}
      {record.notes && (
        <p className="text-xs text-slate-600 italic bg-amber-50/60 border border-amber-200/50 p-2 rounded-lg line-clamp-2">
          &ldquo;{record.notes}&rdquo;
        </p>
      )}

      {/* 5. Etiquetas */}
      {record.tags && record.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {record.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-md text-[10px] font-bold"
            >
              <Tag className="w-2.5 h-2.5" />
              <span>{tag}</span>
            </span>
          ))}
        </div>
      )}

      {/* 6. Barra de Ações: Ver detalhes, Editar e Eliminar */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onViewDetails(record)}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 touch-target min-h-0 h-auto"
            aria-label={`Ver detalhes do cálculo de ${record.name || defaultTitle}`}
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Detalhes</span>
          </button>

          <button
            type="button"
            onClick={() => onEditMetadata(record)}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 touch-target min-h-0 h-auto"
            aria-label={`Editar nome, notas ou etiquetas do cálculo`}
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Editar</span>
          </button>

          {/* Usar noutra ferramenta (apenas se houver destinos elegíveis comprovados) */}
          {onOpenTransfer && hasEligibleTransferTargets(record) && (
            <button
              type="button"
              onClick={() => onOpenTransfer(record)}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 touch-target min-h-0 h-auto"
              aria-label={`Usar noutra ferramenta a partir do cálculo de ${record.name || defaultTitle}`}
              title="Pré-visualizar compatibilidade com outra ferramenta"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Usar noutra ferramenta</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDelete(record)}
          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors touch-target min-h-0 h-auto"
          title="Eliminar cálculo do histórico"
          aria-label="Eliminar cálculo do histórico"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
};

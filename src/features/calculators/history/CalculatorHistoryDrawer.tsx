/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Componente: CalculatorHistoryDrawer
 * Fase 4 - Drawer Lateral / Painel Responsivo de Histórico
 * 
 * Layout:
 * - Desktop: Drawer lateral direito (~440px), fixo com rolagem interna
 * - Smartphone: Painel quase ecrã inteiro (~94% altura), botões táteis
 * - Pesquisa em tempo real por nome e notas
 * - Filtro horizontal de etiquetas
 * - Gestão de quota (ex: "6 de 20 cálculos guardados")
 * - Limpeza total da ferramenta com confirmação explícita
 */

import React, { useState, useMemo } from 'react';
import { X, Search, SlidersHorizontal, Trash2, History, AlertTriangle } from 'lucide-react';
import type { CalculationHistoryRecord } from '../../../types/calculator.ts';
import { MAX_ACTIVE_CALCULATIONS_PER_TOOL } from '../../../types/calculator.ts';
import { CalculationHistoryCard } from './CalculationHistoryCard.tsx';
import { HistoryDetailModal } from './HistoryDetailModal.tsx';
import { CalculationTransferModal } from './CalculationTransferModal.tsx';
import { filterHistoryRecords } from '../core/historyService.ts';

export interface CalculatorHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  calculatorId: string;
  calculatorTitle: string;
  records: CalculationHistoryRecord[];
  onDeleteRecord: (record: CalculationHistoryRecord) => Promise<void>;
  onClearHistory: () => Promise<void>;
  onUpdateMetadata: (id: string, metadata: { name?: string; notes?: string; tags?: string[] }) => Promise<void>;
  onExecuteTransfer?: (targetCalculatorId: string) => void;
}

export const CalculatorHistoryDrawer: React.FC<CalculatorHistoryDrawerProps> = ({
  isOpen,
  onClose,
  calculatorTitle,
  records,
  onDeleteRecord,
  onClearHistory,
  onUpdateMetadata,
  onExecuteTransfer
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('Todas');

  // Modais internos de detalhe, confirmação e transferência
  const [activeDetailRecord, setActiveDetailRecord] = useState<CalculationHistoryRecord | null>(null);
  const [detailMode, setDetailMode] = useState<'view' | 'edit'>('view');
  const [transferRecord, setTransferRecord] = useState<CalculationHistoryRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<CalculationHistoryRecord | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Extração de todas as etiquetas únicas presentes nos registos
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    for (const r of records) {
      if (r.tags) {
        for (const t of r.tags) {
          set.add(t);
        }
      }
    }
    return ['Todas', ...Array.from(set)];
  }, [records]);

  // Filtragem combinada (pesquisa + etiquetas)
  const filteredRecords = useMemo(() => {
    return filterHistoryRecords(records, searchQuery, selectedTag);
  }, [records, searchQuery, selectedTag]);

  if (!isOpen) return null;

  const handleOpenDetails = (rec: CalculationHistoryRecord) => {
    setActiveDetailRecord(rec);
    setDetailMode('view');
  };

  const handleOpenEdit = (rec: CalculationHistoryRecord) => {
    setActiveDetailRecord(rec);
    setDetailMode('edit');
  };

  const handleConfirmSingleDelete = async () => {
    if (recordToDelete) {
      setIsDeleting(true);
      try {
        await onDeleteRecord(recordToDelete);
        setRecordToDelete(null);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleConfirmClearAll = async () => {
    setIsDeleting(true);
    try {
      await onClearHistory();
      setShowClearConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalCount = records.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      {/* Painel do Drawer */}
      <div className="w-full sm:max-w-md lg:max-w-lg h-[94vh] sm:h-full mt-auto sm:mt-0 bg-slate-50 border-l border-slate-200 shadow-2xl rounded-t-3xl sm:rounded-none flex flex-col overflow-hidden animate-slide-left">
        {/* 1. Cabeçalho Fixo do Histórico */}
        <div className="p-5 sm:p-6 bg-white border-b border-slate-200 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-daterra-primary" />
                <h2 id="history-drawer-title" className="text-lg font-black text-daterra-primary leading-tight">
                  Histórico de Cálculos
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{calculatorTitle}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-colors touch-target min-h-0 h-auto"
              aria-label="Fechar histórico"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contador de Quota Oficial */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-xs font-extrabold text-slate-700">
              {totalCount} de {MAX_ACTIVE_CALCULATIONS_PER_TOOL} cálculos guardados
            </span>

            {totalCount > 0 && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Histórico</span>
              </button>
            )}
          </div>

          {/* Barra de Pesquisa */}
          <div className="relative pt-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por nome ou notas..."
              className="w-full pl-9 pr-8 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-daterra-accent/30 focus:border-daterra-accent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-3 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
                aria-label="Limpar pesquisa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtros de Etiquetas */}
          {availableTags.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none">
              <SlidersHorizontal className="w-3 h-3 text-slate-400 shrink-0 mr-1" />
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all touch-target min-h-0 h-auto ${
                    selectedTag === tag
                      ? 'bg-daterra-primary text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Lista de Cartões com Rolagem Interna */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                <History className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-700">
                {records.length === 0
                  ? 'Nenhum cálculo guardado nesta ferramenta'
                  : 'Nenhum cálculo encontrado'}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {records.length === 0
                  ? 'Os cálculos guardados na Calculadora de Dose aparecerão aqui para consulta e utilização offline.'
                  : 'Tente alterar os termos da pesquisa ou selecionar outra etiqueta.'}
              </p>
            </div>
          ) : (
            filteredRecords.map((rec) => (
              <CalculationHistoryCard
                key={rec.id}
                record={rec}
                onViewDetails={handleOpenDetails}
                onEditMetadata={handleOpenEdit}
                onDelete={(r) => setRecordToDelete(r)}
                onOpenTransfer={(r) => setTransferRecord(r)}
              />
            ))
          )}
        </div>

        {/* 3. Rodapé Fixo */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>Funcionamento 100% Offline</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors touch-target min-h-0 h-auto"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Modal de Detalhes / Edição */}
      <HistoryDetailModal
        isOpen={!!activeDetailRecord}
        onClose={() => setActiveDetailRecord(null)}
        record={activeDetailRecord}
        mode={detailMode}
        onSaveMetadata={onUpdateMetadata}
        onOpenTransfer={(r) => {
          setActiveDetailRecord(null);
          setTransferRecord(r);
        }}
      />

      {/* Modal de Pré-visualização e Transferência ("Usar noutra ferramenta" - Fase 6B) */}
      <CalculationTransferModal
        isOpen={!!transferRecord}
        onClose={() => setTransferRecord(null)}
        record={transferRecord}
        onExecuteTransfer={(targetId) => {
          setTransferRecord(null);
          onClose();
          onExecuteTransfer?.(targetId);
        }}
      />

      {/* Modal de Confirmação de Eliminação Individual */}
      {recordToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white max-w-sm w-full p-6 rounded-3xl shadow-2xl border border-slate-200 text-center space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">
                Eliminar este cálculo?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                O registo deixará de contar para a quota e não aparecerá no histórico ativo.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl touch-target"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl touch-target"
              >
                {isDeleting ? 'A eliminar...' : 'Sim, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Limpeza Total da Ferramenta */}
      {showClearConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white max-w-sm w-full p-6 rounded-3xl shadow-2xl border border-rose-200 text-center space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">
                Limpar todo o histórico desta calculadora?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Esta ação irá remover todos os cálculos da <strong>{calculatorTitle}</strong> guardados neste dispositivo. Os dados de outras calculadoras permanecem intocados.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl touch-target"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl touch-target"
              >
                {isDeleting ? 'A limpar...' : 'Confirmar Limpeza'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

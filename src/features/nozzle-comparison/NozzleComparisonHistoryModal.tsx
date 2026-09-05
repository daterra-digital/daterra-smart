import React from 'react';
import {
  History,
  X,
  Trash2,
  FolderOpen,
  Calendar,
  Gauge,
  CheckCircle2,
  Save,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { db } from '../../db/db';
import { formatPt } from './nozzleComparison.calculations';
import type { CalculatedNozzleFlow, ComparisonSummaryResult } from './nozzleComparison.types';

export interface NozzleComparisonRecord {
  id?: number;
  date: string;
  pressureBar: number;
  nozzleA: {
    id: string;
    brand: string;
    model: string;
    swirlPlate?: string;
    disc?: string;
    flowLMin: number;
    origin: string;
  };
  nozzleB: {
    id: string;
    brand: string;
    model: string;
    swirlPlate?: string;
    disc?: string;
    flowLMin: number;
    origin: string;
  };
  summary: {
    higherFlowNozzle: string;
    absoluteDifferenceLMin: number;
    percentageDifference: number | null;
  };
  notes?: string;
}

export interface NozzleComparisonHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadComparison: (nozzleAId: string, nozzleBId: string, pressureBar: number) => void;
  currentFlowA?: CalculatedNozzleFlow;
  currentFlowB?: CalculatedNozzleFlow;
  currentComparison?: ComparisonSummaryResult;
  currentPressureBar: number;
}

export const NozzleComparisonHistoryModal: React.FC<NozzleComparisonHistoryModalProps> = ({
  isOpen,
  onClose,
  onLoadComparison,
  currentFlowA,
  currentFlowB,
  currentComparison,
  currentPressureBar
}) => {
  const [historyItems, setHistoryItems] = React.useState<NozzleComparisonRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [statusMessage, setStatusMessage] = React.useState<string>('');
  const [isConfirmingClearAll, setIsConfirmingClearAll] = React.useState<boolean>(false);

  // Carregar histórico local com tratamento de erro resiliente
  const loadHistory = React.useCallback(async () => {
    setIsLoading(true);
    try {
      if (!db || !db.calculation_history) {
        setHistoryItems([]);
        return;
      }
      const records = await db.calculation_history
        .where('calculator_type')
        .equals('comparador_bicos' as any)
        .reverse()
        .sortBy('date');

      const mapped: NozzleComparisonRecord[] = (records || []).map(r => ({
        id: r.id,
        date: r.date,
        pressureBar: r.inputs?.pressureBar || 3.0,
        nozzleA: r.inputs?.nozzleA || { id: '', brand: 'N/D', model: 'N/D', flowLMin: 0, origin: 'N/D' },
        nozzleB: r.inputs?.nozzleB || { id: '', brand: 'N/D', model: 'N/D', flowLMin: 0, origin: 'N/D' },
        summary: r.inputs?.summary || { higherFlowNozzle: 'EQUAL', absoluteDifferenceLMin: 0, percentageDifference: 0 },
        notes: r.notes
      }));
      setHistoryItems(mapped);
    } catch (err) {
      console.error('Erro ao ler histórico de comparações:', err);
      setHistoryItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      setIsConfirmingClearAll(false);
      loadHistory();
    }
  }, [isOpen, loadHistory]);

  // Fechar com a tecla Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isConfirmingClearAll) {
          setIsConfirmingClearAll(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isConfirmingClearAll, onClose]);

  if (!isOpen) return null;

  // Guardar comparação atual no IndexedDB
  const handleSaveCurrent = async () => {
    if (!currentFlowA || !currentFlowB || !currentComparison) return;

    try {
      await db.calculation_history.add({
        date: new Date().toISOString(),
        calculator_type: 'comparador_bicos' as any,
        inputs: {
          pressureBar: currentPressureBar,
          nozzleA: {
            id: currentFlowA.nozzle.id,
            brand: currentFlowA.nozzle.brand,
            model: currentFlowA.nozzle.model,
            swirlPlate: currentFlowA.nozzle.swirlPlate,
            disc: currentFlowA.nozzle.disc,
            flowLMin: currentFlowA.flowLMin,
            origin: currentFlowA.originBadgeText
          },
          nozzleB: {
            id: currentFlowB.nozzle.id,
            brand: currentFlowB.nozzle.brand,
            model: currentFlowB.nozzle.model,
            swirlPlate: currentFlowB.nozzle.swirlPlate,
            disc: currentFlowB.nozzle.disc,
            flowLMin: currentFlowB.flowLMin,
            origin: currentFlowB.originBadgeText
          },
          summary: {
            higherFlowNozzle: currentComparison.higherFlowNozzle,
            absoluteDifferenceLMin: currentComparison.absoluteDifferenceLMin,
            percentageDifference: currentComparison.percentageDifference
          }
        },
        result: {
          quantidade_pf: currentFlowA.flowLMin,
          unit_pf: 'L/min'
        }
      });

      setStatusMessage('Comparação guardada com sucesso no dispositivo.');
      setTimeout(() => setStatusMessage(''), 3500);
      loadHistory();
    } catch (err) {
      console.error('Erro ao guardar comparação:', err);
      setStatusMessage('Não foi possível guardar a comparação.');
      setTimeout(() => setStatusMessage(''), 3500);
    }
  };

  // Eliminar um registo individual
  const handleDeleteItem = async (id?: number) => {
    if (!id) return;
    try {
      await db.calculation_history.delete(id);
      loadHistory();
    } catch (err) {
      console.error('Erro ao apagar registo:', err);
    }
  };

  // Confirmar a limpeza de todo o histórico
  const handleConfirmClearAll = async () => {
    try {
      const records = await db.calculation_history
        .where('calculator_type')
        .equals('comparador_bicos' as any)
        .toArray();
      
      for (const r of records) {
        if (r.id) await db.calculation_history.delete(r.id);
      }
      setIsConfirmingClearAll(false);
      setStatusMessage('Histórico local apagado.');
      setTimeout(() => setStatusMessage(''), 3500);
      loadHistory();
    } catch (err) {
      console.error('Erro ao limpar histórico:', err);
      setIsConfirmingClearAll(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-scale-in">
        
        {/* Topo do Modal */}
        <div className="p-5 sm:p-6 bg-daterra-primary text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-daterra-accent block">
                Persistência Offline • IndexedDB (Dexie.js)
              </span>
              <h2 id="history-modal-title" className="text-base sm:text-lg font-black text-white leading-tight">
                Histórico de Comparações de Bicos
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar histórico de comparações"
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all min-h-[48px] min-w-[48px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-white focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificação / Mensagem de Estado Acessível */}
        {statusMessage && (
          <div
            role="status"
            aria-live="polite"
            className="mx-6 mt-4 p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Botão de Ação Rápida: Guardar Comparação Atual */}
        {currentFlowA && currentFlowB && currentComparison && (
          <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div>
              <span className="text-xs font-extrabold text-slate-800 block">
                Comparação Ativa no Ecrã:
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {currentFlowA.nozzle.brand} {currentFlowA.nozzle.model} vs {currentFlowB.nozzle.brand} {currentFlowB.nozzle.model} ({formatPt(currentPressureBar, 1)} bar)
              </span>
            </div>
            <button
              type="button"
              onClick={handleSaveCurrent}
              aria-label="Guardar comparação atual no histórico local"
              className="px-5 py-3 bg-daterra-accent hover:bg-daterra-accent/90 text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 min-h-[48px] focus-visible:ring-2 focus-visible:ring-daterra-primary focus:outline-none"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Comparação Atual</span>
            </button>
          </div>
        )}

        {/* Confirmação de Ação Destrutiva (Obrigatória) */}
        {isConfirmingClearAll && (
          <div className="mx-6 my-4 p-4 bg-red-50 border-2 border-red-300 rounded-2xl space-y-3 animate-fade-in">
            <div className="flex items-start gap-2.5 text-red-950">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-extrabold text-red-900 block">
                  Confirmar eliminação permanente:
                </span>
                <p className="font-medium text-red-800 leading-relaxed">
                  Pretende apagar permanentemente todas as comparações guardadas neste dispositivo? Esta ação não pode ser anulada.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsConfirmingClearAll(false)}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-slate-400 focus:outline-none"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold transition-all min-h-[44px] shadow-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-red-500 focus:outline-none"
              >
                Apagar histórico
              </button>
            </div>
          </div>
        )}

        {/* Lista de Comparações Guardadas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-xs font-bold text-slate-400">
              A carregar histórico local do IndexedDB...
            </div>
          ) : historyItems.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-extrabold text-slate-700">
                Nenhuma comparação guardada
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Guarde as suas comparações de bicos no terreno para as poder consultar e carregar mesmo sem ligação à internet.
              </p>
            </div>
          ) : (
            historyItems.map(item => (
              <div
                key={item.id}
                className="p-4 bg-slate-50 hover:bg-white border border-slate-200 hover:border-daterra-accent/40 rounded-2xl shadow-sm transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-daterra-primary" />
                    <span>{new Date(item.date).toLocaleString('pt-PT')}</span>
                    <span>•</span>
                    <Gauge className="w-3.5 h-3.5 text-daterra-primary" />
                    <span>{formatPt(item.pressureBar, 1)} bar</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadComparison(item.nozzleA.id, item.nozzleB.id, item.pressureBar);
                        onClose();
                      }}
                      aria-label={`Carregar comparação ${item.nozzleA.brand} ${item.nozzleA.model} vs ${item.nozzleB.brand} ${item.nozzleB.model}`}
                      className="px-3.5 py-2 bg-daterra-primary hover:bg-daterra-primary/90 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1 min-h-[44px] focus-visible:ring-2 focus-visible:ring-daterra-accent focus:outline-none"
                    >
                      <span>Carregar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      aria-label="Apagar registo do histórico"
                      className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-red-400 focus:outline-none"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-black text-emerald-800 uppercase block">Bico A</span>
                    <span className="font-extrabold text-slate-900">{item.nozzleA.brand} {item.nozzleA.model}</span>
                    <div className="text-[11px] font-mono-numbers font-bold text-slate-600 mt-0.5">
                      {formatPt(item.nozzleA.flowLMin, 2)} L/min ({item.nozzleA.origin})
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-black text-sky-800 uppercase block">Bico B</span>
                    <span className="font-extrabold text-slate-900">{item.nozzleB.brand} {item.nozzleB.model}</span>
                    <div className="text-[11px] font-mono-numbers font-bold text-slate-600 mt-0.5">
                      {formatPt(item.nozzleB.flowLMin, 2)} L/min ({item.nozzleB.origin})
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          {historyItems.length > 0 && !isConfirmingClearAll ? (
            <button
              type="button"
              onClick={() => setIsConfirmingClearAll(true)}
              className="text-red-600 hover:text-red-700 font-bold transition-all flex items-center gap-1.5 p-2 rounded-lg hover:bg-red-50 min-h-[44px] focus-visible:ring-2 focus-visible:ring-red-400 focus:outline-none"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpar Histórico Local</span>
            </button>
          ) : (
            <span className="text-slate-500">Histórico mantido no IndexedDB local</span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-extrabold transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-daterra-primary focus:outline-none"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

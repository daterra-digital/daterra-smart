import React, { useEffect, useState } from 'react';
import {
  History,
  X,
  Trash2,
  Calendar,
  Droplets,
  CheckCircle2,
  ArrowRight,
  FolderOpen
} from 'lucide-react';
import { db, type MixHistoryRecord } from '../../db/db';
import { FORMULATIONS_BY_ID } from './data';

interface MixHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadMix: (formulationIds: string[], tankCapacityL?: number) => void;
}

export const MixHistoryModal: React.FC<MixHistoryModalProps> = ({
  isOpen,
  onClose,
  onLoadMix
}) => {
  const [historyItems, setHistoryItems] = useState<MixHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      if (!db || !db.mix_history) {
        setHistoryItems([]);
        return;
      }
      const records = await db.mix_history.orderBy('date').reverse().toArray();
      setHistoryItems(records || []);
    } catch (err) {
      console.error('Erro ao ler histórico de misturas:', err);
      setHistoryItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      setIsConfirmingClearAll(false);
      setStatusMessage('');
    }
  }, [isOpen]);

  const handleDeleteItem = async (id?: number) => {
    if (!id) return;
    try {
      await db.mix_history.delete(id);
      setStatusMessage('Registo eliminado com sucesso.');
      loadHistory();
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao eliminar item do histórico:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await db.mix_history.clear();
      setHistoryItems([]);
      setIsConfirmingClearAll(false);
      setStatusMessage('Todo o histórico de misturas foi limpo.');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao limpar histórico:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mix-history-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/70 backdrop-blur-xs p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="bg-[#114037] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#1D734B] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#3CA64C]/20 border border-[#3CA64C]/40 flex items-center justify-center text-[#3AAA35] shrink-0">
              <History className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#3AAA35]">
                IndexedDB • Offline-First
              </span>
              <h3 id="mix-history-modal-title" className="text-base sm:text-lg font-black leading-tight text-white mt-0.5">
                Histórico de Receitas de Mistura
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 min-w-[44px] min-h-[44px] rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors touch-target flex items-center justify-center shrink-0"
            aria-label="Fechar histórico"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Feedback Temporário */}
        {statusMessage && (
          <div className="p-3 bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 justify-center shrink-0 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Conteúdo Principal */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[70vh] scrollbar-thin bg-slate-50">
          {isLoading ? (
            <div className="py-12 text-center text-slate-500 animate-pulse space-y-2">
              <History className="w-8 h-8 mx-auto text-[#1D734B] animate-spin" />
              <p className="text-xs font-semibold">A carregar histórico do dispositivo...</p>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
              <FolderOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-extrabold text-slate-800">Nenhuma mistura guardada</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                As receitas de caldas que guardar na calculadora ficarão acessíveis aqui, mesmo sem ligação à Internet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyItems.map((item) => {
                const formattedDate = new Date(item.date).toLocaleString('pt-PT', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs space-y-3 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#1D734B]" />
                        <span className="text-xs font-bold text-slate-700">{formattedDate}</span>
                        {item.tank_capacity_l && (
                          <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-extrabold rounded-md">
                            {item.tank_capacity_l} L
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onLoadMix(item.selected_formulation_ids, item.tank_capacity_l);
                            onClose();
                          }}
                          className="min-h-[38px] px-3.5 py-1.5 bg-[#114037] hover:bg-[#1D734B] text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center gap-1.5 touch-target active:scale-95"
                        >
                          <span>Carregar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="min-h-[38px] p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors touch-target"
                          title="Eliminar este registo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Chips de Formulações Guardadas */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-1 bg-sky-50 text-sky-800 text-[11px] font-bold rounded-lg border border-sky-200 flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-sky-600" />
                        <span>Água 50%</span>
                      </span>

                      {item.selected_formulation_ids.map((fId) => {
                        const form = FORMULATIONS_BY_ID.get(fId);
                        if (!form) return null;
                        return (
                          <span
                            key={fId}
                            className="px-2 py-1 bg-slate-100 text-slate-800 text-[11px] font-bold rounded-lg border border-slate-200"
                          >
                            <strong className="text-[#114037] font-mono">{form.sigla}</strong> ({form.name})
                          </span>
                        );
                      })}

                      <span className="px-2 py-1 bg-cyan-50 text-cyan-800 text-[11px] font-bold rounded-lg border border-cyan-200 flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-cyan-600" />
                        <span>Água 50%</span>
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                        {item.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div>
            {historyItems.length > 0 && (
              isConfirmingClearAll ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-700 font-bold">Tem a certeza?</span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="min-h-[38px] px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Sim, Limpar Tudo
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClearAll(false)}
                    className="min-h-[38px] px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingClearAll(true)}
                  className="min-h-[44px] px-3 py-2 text-rose-700 hover:text-rose-800 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 touch-target"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Limpar Todo o Histórico</span>
                </button>
              )
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors touch-target"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

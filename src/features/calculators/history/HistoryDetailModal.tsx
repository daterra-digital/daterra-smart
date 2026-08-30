/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Componente: HistoryDetailModal
 * Fase 4 - Consulta de Detalhes e Edição de Metadados
 */

import React, { useState, useEffect } from 'react';
import { X, Tag, Plus, Save, Calendar, ShieldCheck, Share2 } from 'lucide-react';
import type { CalculationHistoryRecord } from '../../../types/calculator.ts';
import { DEFAULT_SUGGESTED_TAGS } from '../../../types/calculator.ts';
import { cleanAndDeduplicateTags } from '../core/historyService.ts';
import { hasEligibleTransferTargets } from '../core/transferService.ts';

export interface HistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CalculationHistoryRecord | null;
  mode?: 'view' | 'edit';
  onSaveMetadata: (id: string, metadata: { name?: string; notes?: string; tags?: string[] }) => Promise<void>;
  onOpenTransfer?: (record: CalculationHistoryRecord) => void;
}

export const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  mode = 'view',
  onSaveMetadata,
  onOpenTransfer
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(mode === 'edit');
  const [name, setName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (record) {
      setName(record.name || '');
      setNotes(record.notes || '');
      setTags(record.tags ? [...record.tags] : []);
      setIsEditing(mode === 'edit');
    }
  }, [record, mode]);

  if (!isOpen || !record) return null;

  const handleAddTag = (tagToAdd: string) => {
    const cleaned = tagToAdd.trim();
    if (!cleaned) return;
    const exists = tags.some((t) => t.toLowerCase() === cleaned.toLowerCase());
    if (!exists) {
      setTags((prev) => cleanAndDeduplicateTags([...prev, cleaned]));
    }
    setCustomTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase()));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveMetadata(record.id, {
        name,
        notes,
        tags
      });
      setIsEditing(false);
      onClose();
    } catch (err) {
      console.error('Erro ao guardar metadados do cálculo:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slide-up">
        {/* Cabeçalho Fixo do Modal */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-daterra-accent block">
              {record.calculatorId === 'calc_concentracao'
                ? 'CONCENTRAÇÃO DA CALDA'
                : record.calculatorId === 'calc_velocidade_real' || record.calculatorId === 'calc_area_parede_foliar'
                ? 'CALIBRAÇÃO'
                : 'DETALHES DO CÁLCULO'}
            </span>
            <h2 id="detail-modal-title" className="text-base sm:text-lg font-black text-daterra-primary">
              {record.name || (
                record.calculatorId === 'calc_concentracao'
                  ? 'Cálculo de Concentração'
                  : record.calculatorId === 'calc_velocidade_real'
                  ? 'Velocidade Real de Trabalho'
                  : record.calculatorId === 'calc_area_parede_foliar'
                  ? 'Área de Parede Foliar'
                  : 'Cálculo de Dose por Hectare'
              )}
            </h2>
            {record.calculatorId === 'calc_concentracao' && (
              <div className="mt-1">
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  Modo: {record.inputs['mode']?.rawValue === 'planta_adulta' || record.inputs['mode']?.rawValue === 'adulta' ? 'Planta Adulta' : 'Planta Jovem'}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-colors touch-target min-h-0 h-auto"
            aria-label="Fechar janela de detalhes"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com Rolagem Interna */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {/* Informação Geral de Data e Estado Local */}
          <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-daterra-primary shrink-0" />
              <span>{new Date(record.createdAt).toLocaleString('pt-PT')}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Guardado no dispositivo</span>
            </div>
          </div>

          {/* Grelha de Resultados Oficiais */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              Resultados Obtidos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(record.outputs).map(([key, val]) => (
                <div key={key} className="p-3.5 bg-slate-100/70 border border-slate-200/80 rounded-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                    {val.label || key}
                  </span>
                  <div className="text-xl font-black font-mono-numbers text-daterra-primary">
                    {typeof val.rawValue === 'number'
                      ? val.rawValue.toLocaleString('pt-PT', { maximumFractionDigits: 2 })
                      : val.rawValue}{' '}
                    <span className="text-sm font-bold text-daterra-accent">{val.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Entradas Utilizadas no Cálculo */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              Valores de Entrada
            </h3>
            <div className="space-y-2">
              {Object.entries(record.inputs).map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs"
                >
                  <span className="font-bold text-slate-700">{val.label || key}</span>
                  <span className="font-extrabold font-mono-numbers text-daterra-primary">
                    {typeof val.rawValue === 'number'
                      ? val.rawValue.toLocaleString('pt-PT', { maximumFractionDigits: 3 })
                      : val.rawValue}{' '}
                    {val.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Secção de Metadados: Nome, Notas e Etiquetas */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Informações Complementares
              </h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold text-daterra-accent hover:underline cursor-pointer"
                >
                  Editar
                </button>
              )}
            </div>

            {/* Campo: Nome do Cálculo */}
            <div>
              <label htmlFor="record-name" className="text-xs font-bold text-slate-700 block mb-1">
                Nome do Cálculo (opcional)
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id="record-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Talhão 4 - Vinha Nova"
                  maxLength={60}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-daterra-primary focus:border-daterra-accent outline-none"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-800">
                  {record.name || <span className="text-slate-400 italic">Sem nome definido</span>}
                </p>
              )}
            </div>

            {/* Campo: Notas Livres */}
            <div>
              <label htmlFor="record-notes" className="text-xs font-bold text-slate-700 block mb-1">
                Notas do Terreno (opcional)
              </label>
              {isEditing ? (
                <textarea
                  id="record-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Condições de vento favoráveis. Bicos em bom estado."
                  rows={2}
                  maxLength={300}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:border-daterra-accent outline-none resize-none"
                />
              ) : (
                <p className="text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                  {record.notes || <span className="text-slate-400 italic">Sem notas registadas</span>}
                </p>
              )}
            </div>

            {/* Campo: Etiquetas (Sugeridas + Personalizadas) */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1.5">Etiquetas</span>

              {/* Lista de Etiquetas Ativas */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.length === 0 && (
                  <span className="text-xs text-slate-400 italic">Nenhuma etiqueta atribuída</span>
                )}
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-emerald-600 hover:text-emerald-900"
                        aria-label={`Remover etiqueta ${tag}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {/* Painel de Adição em Modo de Edição */}
              {isEditing && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {/* Etiquetas Sugeridas Oficiais */}
                  <div className="flex flex-wrap gap-1">
                    {DEFAULT_SUGGESTED_TAGS.map((sug) => {
                      const isSelected = tags.some((t) => t.toLowerCase() === sug.toLowerCase());
                      return (
                        <button
                          key={sug}
                          type="button"
                          disabled={isSelected}
                          onClick={() => handleAddTag(sug)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                            isSelected
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95'
                          }`}
                        >
                          + {sug}
                        </button>
                      );
                    })}
                  </div>

                  {/* Input de Etiqueta Personalizada */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(customTagInput);
                        }
                      }}
                      placeholder="Criar etiqueta personalizada..."
                      maxLength={30}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:border-daterra-accent outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag(customTagInput)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 touch-target min-h-0 h-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rodapé Fixo */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2.5 flex-wrap">
          <div>
            {!isEditing && record.calculatorId === 'calc_dose' && onOpenTransfer && hasEligibleTransferTargets(record) && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTransfer(record);
                }}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 touch-target min-h-0 h-auto"
                title="Pré-visualizar compatibilidade com outra ferramenta"
              >
                <Share2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Usar noutra ferramenta</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-colors touch-target"
            >
              Fechar
            </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 bg-daterra-accent hover:bg-daterra-accent/90 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 touch-target"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'A guardar...' : 'Guardar Alterações'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

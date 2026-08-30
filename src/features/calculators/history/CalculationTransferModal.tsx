/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Componente: CalculationTransferModal
 * Fase 6A & Fase 6B - Modal de Pré-Visualização e Confirmação de Transferência ("Usar noutra ferramenta")
 * 
 * REGRAS DESTA FASE (FASE 6B):
 * 1. Se não existirem campos compatíveis efetivos (compatibleFields.length === 0):
 *    Apresenta apenas a mensagem oficial:
 *    "Não existem valores compatíveis para transferir para esta ferramenta."
 *    E um único botão "Fechar".
 * 2. Não cria sessão transitória nem aciona navegação sem campos compatíveis.
 * 3. Não grava cálculos na base de dados de forma automática.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { Share2, X, CheckCircle2, HelpCircle, Layers, ShieldCheck, ArrowRight } from 'lucide-react';
import type { CalculationHistoryRecord } from '../../../types/calculator.ts';
import { evaluateCalculationTransfer, NO_COMPATIBLE_FIELDS_NOTICE } from '../core/transferService.ts';
import type { ToolTransferPreview } from '../core/transferTypes.ts';
import { setPendingTransfer, type ActiveTransferPayload } from '../core/transferSession.ts';

export interface CalculationTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CalculationHistoryRecord | null;
  triggerButtonRef?: React.RefObject<HTMLButtonElement | null>;
  onExecuteTransfer?: (targetCalculatorId: string, payload: ActiveTransferPayload) => void;
}

export const CalculationTransferModal: React.FC<CalculationTransferModalProps> = ({
  isOpen,
  onClose,
  record,
  triggerButtonRef,
  onExecuteTransfer
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      triggerButtonRef?.current?.focus();
    }, 50);
  }, [onClose, triggerButtonRef]);

  // Gestão de acessibilidade de foco
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen || !record) {
    return null;
  }

  // Avaliação canónica das ferramentas compatíveis
  const transferPreviews: ToolTransferPreview[] = evaluateCalculationTransfer(record);
  const activePreview = transferPreviews[0];
  const hasCompatibleFields = !!(activePreview && activePreview.compatibleFields.length > 0);

  const handleConfirmTransfer = () => {
    if (!hasCompatibleFields || !activePreview) return;

    // Apenas prepara payload se houver campos realmente compatíveis
    const payload: ActiveTransferPayload = {
      sourceCalculationId: record.id,
      sourceCalculatorId: record.calculatorId,
      sourceCreatedAt: record.createdAt,
      sourceName: record.name,
      targetCalculatorId: activePreview.targetCalculatorId,
      fields: {}
    };

    for (const f of activePreview.compatibleFields) {
      payload.fields[f.targetFieldId] = {
        targetFieldId: f.targetFieldId,
        canonicalKey: f.targetCanonicalKey,
        dimension: f.targetDimension,
        label: f.targetLabel,
        rawValue: f.previewValue,
        unit: f.previewUnit
      };
    }

    setPendingTransfer(payload);
    onClose();
    onExecuteTransfer?.(activePreview.targetCalculatorId, payload);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/70 backdrop-blur-xs p-3 sm:p-4 animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#F2F2F2] flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Cabeçalho Verde Escuro DATERRA */}
        <div className="bg-[#114037] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#1D734B] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#3CA64C]/20 border border-[#3CA64C]/40 flex items-center justify-center text-[#3AAA35] shrink-0">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#3AAA35]">
                Interoperabilidade Agronómica
              </span>
              <h2 id="transfer-modal-title" className="text-base sm:text-lg font-black leading-tight text-white mt-0.5">
                Usar noutra ferramenta
              </h2>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleClose}
            className="min-w-[48px] min-h-[48px] rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors touch-target flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Fechar modal de transferência"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 2. Conteúdo do Modal */}
        {!hasCompatibleFields ? (
          /* Estado Vazio Formal Obrigatório */
          <div className="p-8 sm:p-12 space-y-6 text-center bg-slate-50/50">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-800">
                Transferência Indisponível
              </h3>
              <p className="text-sm font-semibold text-slate-600 max-w-md mx-auto leading-relaxed">
                {NO_COMPATIBLE_FIELDS_NOTICE}
              </p>
            </div>
          </div>
        ) : (
          /* Conteúdo com Campos Compatíveis */
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[72vh] scrollbar-thin bg-slate-50/50">
            {/* Cartão de Resumo do Cálculo de Origem */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Cálculo Selecionado no Histórico
                </span>
                <div className="text-sm font-bold text-daterra-primary truncate mt-0.5">
                  {record.name || 'Cálculo de Dose por Hectare'}
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-xl text-xs font-bold shrink-0">
                Dose por Hectare
              </span>
            </div>

            {/* Banner Oficial de Transferência */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-950 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm leading-relaxed">
                <strong className="font-bold block text-emerald-950 mb-0.5">
                  Transferência Segura de Dados
                </strong>
                Confirme os campos compatíveis que serão preenchidos na ferramenta de destino. Os valores não compatíveis permanecerão isolados por segurança agronómica.
              </div>
            </div>

            {/* Ferramenta de Destino Compatível */}
            {activePreview && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Layers className="w-4 h-4 text-daterra-primary shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Ferramenta de Destino Compatível:
                  </span>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-daterra-primary">
                        {activePreview.targetCalculatorTitle}
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-400">
                        Categoria: {activePreview.targetCalculatorCategory}
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl">
                      {activePreview.compatibleFields.length} campos compatíveis
                    </span>
                  </div>

                  {/* Secção 1: Campos a Preencher */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Campos a preencher no destino:
                    </span>
                    <div className="space-y-2">
                      {activePreview.compatibleFields.map((field) => (
                        <div
                          key={field.targetFieldId}
                          className="bg-emerald-50/60 border border-emerald-200/80 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800 block">
                              {field.targetLabel}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono-numbers">
                              Canónica: {field.targetCanonicalKey} ({field.targetDimension})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className="px-2.5 py-1 bg-white font-bold font-mono-numbers text-emerald-900 border border-emerald-300 rounded-lg shadow-2xs">
                              {String(field.previewValue)} {field.previewUnit}
                            </span>
                            <span className="text-[10px] uppercase font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                              Compatível
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Secção 2: Campos que Continuarão por Preencher */}
                  {activePreview.unfilledTargetFields.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                        Campos que continuarão por preencher (inserção manual):
                      </span>
                      <div className="space-y-2">
                        {activePreview.unfilledTargetFields.map((unfilled) => (
                          <div
                            key={unfilled.targetFieldId}
                            className="bg-slate-100/80 border border-slate-200 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-700 block">
                                {unfilled.targetLabel}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {unfilled.reasonPt}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold font-mono text-slate-500 italic self-start sm:self-auto">
                              Por preencher
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Secção 3: Valores com Salvaguarda de Isolamento */}
                  {activePreview.incompatibleSourceValues.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4 text-daterra-primary shrink-0" />
                        Valores não transferidos (salvaguarda agronómica):
                      </span>
                      <div className="space-y-1.5">
                        {activePreview.incompatibleSourceValues.map((incomp) => (
                          <div
                            key={incomp.sourceFieldId}
                            className="bg-white border border-slate-200/80 p-2.5 rounded-xl text-[11px] text-slate-600 leading-relaxed"
                          >
                            <strong className="text-slate-800 font-bold mr-1">
                              {incomp.sourceLabel}:
                            </strong>
                            <span>{incomp.reasonPt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Rodapé do Modal */}
        <div className="p-4 sm:p-5 bg-[#F2F2F2] border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {!hasCompatibleFields ? (
            <div className="w-full flex justify-end">
              <button
                ref={confirmBtnRef}
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-colors touch-target cursor-pointer"
              >
                Fechar
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-colors touch-target cursor-pointer order-2 sm:order-1"
              >
                Cancelar
              </button>

              <button
                ref={confirmBtnRef}
                type="button"
                onClick={handleConfirmTransfer}
                className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 bg-[#114037] hover:bg-[#1D734B] text-white font-extrabold text-xs rounded-xl shadow-md transition-colors touch-target cursor-pointer flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                <span>Transferir para a Ferramenta</span>
                <ArrowRight className="w-4 h-4 text-[#3AAA35]" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

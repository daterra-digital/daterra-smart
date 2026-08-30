/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Serviço Transitório de Sessão em Memória para Transferência entre Calculadoras
 * Fase 6B - Interoperabilidade Canónica Segura
 * 
 * GARANTIAS ESTRITAS:
 * 1. 100% em memória transitória (sem gravação permanente).
 * 2. Não expõe valores sensíveis em parâmetros de URL.
 * 3. Não grava cálculos na base de dados de forma oculta.
 * 4. Limpa o estado após aplicação confirmada ou cancelamento explícito.
 * 5. Zero dependência de serviços externos ou Supabase.
 */

import { useState, useEffect } from 'react';
import type { PhysicalDimension } from '../../../types/calculator.ts';

export interface TransferredFieldItem {
  targetFieldId: string;
  canonicalKey: string;
  dimension: PhysicalDimension;
  label: string;
  rawValue: number | string;
  unit: string;
}

export interface ActiveTransferPayload {
  sourceCalculationId: string;
  sourceCalculatorId: string;
  sourceCreatedAt: string;
  sourceName?: string;
  targetCalculatorId: string;
  fields: Record<string, TransferredFieldItem>;
}

// Armazenamento transitório em memória (singleton)
let currentPendingTransfer: ActiveTransferPayload | null = null;
const listeners = new Set<(payload: ActiveTransferPayload | null) => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener(currentPendingTransfer);
  }
}

/**
 * Define uma transferência pendente em memória
 */
export function setPendingTransfer(payload: ActiveTransferPayload): void {
  currentPendingTransfer = payload;
  notifyListeners();
}

/**
 * Obtém a transferência pendente em memória sem a limpar
 */
export function getPendingTransfer(): ActiveTransferPayload | null {
  return currentPendingTransfer;
}

/**
 * Consome e limpa a transferência pendente em memória
 */
export function consumePendingTransfer(): ActiveTransferPayload | null {
  const payload = currentPendingTransfer;
  currentPendingTransfer = null;
  notifyListeners();
  return payload;
}

/**
 * Cancela e limpa a transferência pendente em memória
 */
export function clearPendingTransfer(): void {
  currentPendingTransfer = null;
  notifyListeners();
}

/**
 * Hook React para observar a transferência pendente de forma reativa
 */
export function usePendingTransfer(): ActiveTransferPayload | null {
  const [payload, setPayload] = useState<ActiveTransferPayload | null>(currentPendingTransfer);

  useEffect(() => {
    const handleUpdate = (updated: ActiveTransferPayload | null) => {
      setPayload(updated);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return payload;
}

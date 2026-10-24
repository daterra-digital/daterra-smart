/**
 * DATERRA Smart - Serviço de Integração CentralGest ERPCloud
 * Arquitetura Ports & Adapters (Plug-and-Play) para despacho de mutações da Outbox
 */

import type { MutationOutboxRecord } from '../../db/db.ts';
import type {
  CentralgestConfig,
  ErpSyncResponse,
  ErpSimulationOverride
} from './centralgestTypes.ts';
import { mapOutboxMutationToErpPayload } from './centralgestMapper.ts';
import type { SyncHandlerResult } from '../outbox/outboxService.ts';

// Configuração padrão: modo simulação ativo por defeito se a flag de ambiente não for 'true'
let currentConfig: CentralgestConfig = {
  baseUrl: 'https://api.erpcloud.centralgest.com',
  isSimulationMode: true,
  timeoutMs: 15000
};

// Override para testes determinísticos de códigos HTTP (200, 400, 409, 500)
let simulationOverride: ErpSimulationOverride | null = null;

export function getCentralgestConfig(): CentralgestConfig {
  return { ...currentConfig };
}

export function setCentralgestConfig(config: Partial<CentralgestConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

export function setSimulationOverride(override: ErpSimulationOverride | null): void {
  simulationOverride = override;
}

/**
 * Despacha uma mutação para a API do CentralGest (ou para o driver de simulação)
 */
export async function sendMutationToCentralgest(
  mutation: MutationOutboxRecord,
  customFetch?: typeof fetch
): Promise<ErpSyncResponse> {
  const { endpoint, method, payload, idempotencyKey } = mapOutboxMutationToErpPayload(mutation);

  // MODO SIMULAÇÃO (Plug-and-Play para quando a API não estiver ativa em produção)
  if (currentConfig.isSimulationMode) {
    if (simulationOverride) {
      const code = simulationOverride.statusCode;
      if (code >= 200 && code < 300) {
        return {
          success: true,
          statusCode: code,
          idempotencyKey,
          erpTransactionId: simulationOverride.erpTransactionId || `SIM-TX-${Date.now()}`,
          data: payload
        };
      }
      if (code === 409) {
        return {
          success: false,
          statusCode: 409,
          idempotencyKey,
          error: {
            code: 'CONCURRENCY_CONFLICT',
            message: simulationOverride.errorMessage || 'Registo já alterado no ERPCloud.',
            conflictDetails: simulationOverride.conflictDetails || { serverUpdatedAt: new Date().toISOString() }
          }
        };
      }
      return {
        success: false,
        statusCode: code,
        idempotencyKey,
        error: {
          code: code === 400 ? 'VALIDATION_ERROR' : 'SERVER_ERROR',
          message: simulationOverride.errorMessage || `Erro simulado HTTP ${code}`
        }
      };
    }

    // Sucesso simulado padrão
    return {
      success: true,
      statusCode: 200,
      idempotencyKey,
      erpTransactionId: `SIM-TX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      data: payload
    };
  }

  // MODO PRODUÇÃO (Comunicação real via fetch nativo)
  const fetcher = customFetch || (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetcher) {
    throw new Error('[CentralGest] Ambiente sem suporte a fetch nativo');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), currentConfig.timeoutMs || 15000);

  try {
    const url = `${currentConfig.baseUrl.replace(/\/+$/, '')}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Idempotency-Key': idempotencyKey
    };
    if (currentConfig.apiKey) headers['Authorization'] = `Bearer ${currentConfig.apiKey}`;
    if (currentConfig.companyId) headers['X-Company-Id'] = currentConfig.companyId;

    const res = await fetcher(url, {
      method,
      headers,
      body: method !== 'GET' ? JSON.stringify(payload) : undefined,
      signal: controller.signal
    });

    clearTimeout(timer);
    const body = await res.json().catch(() => ({}));

    if (res.ok) {
      return {
        success: true,
        statusCode: res.status,
        idempotencyKey,
        erpTransactionId: body.transactionId,
        data: body.data
      };
    }

    return {
      success: false,
      statusCode: res.status,
      idempotencyKey,
      error: {
        code: res.status === 409 ? 'CONCURRENCY_CONFLICT' : res.status === 400 ? 'VALIDATION_ERROR' : 'HTTP_ERROR',
        message: body.message || `Erro HTTP ${res.status} do CentralGest`,
        conflictDetails: body.conflict
      }
    };
  } catch (err: any) {
    clearTimeout(timer);
    throw new Error(err?.name === 'AbortError' ? 'Timeout na ligação ao CentralGest ERPCloud' : err?.message || 'Falha de rede');
  }
}

/**
 * Driver sink desacoplado para ligação à fila Mutation Outbox
 */
export async function centralgestOutboxDriver(
  mutation: MutationOutboxRecord,
  customFetch?: typeof fetch
): Promise<SyncHandlerResult> {
  const response = await sendMutationToCentralgest(mutation, customFetch);

  // 1. Sucesso HTTP 2xx
  if (response.success && response.statusCode >= 200 && response.statusCode < 300) {
    return { success: true, action: 'SYNCED', statusCode: response.statusCode };
  }

  // 2. Erro de Validação de Cliente (HTTP 400): Descartar para não bloquear a fila indefinidamente
  if (response.statusCode === 400) {
    console.warn(`[CentralGest] Erro 400 no cliente (${mutation.entityType}:${mutation.entityId}). Descartando:`, response.error);
    return { success: false, action: 'DISCARD', statusCode: 400, error: response.error?.message };
  }

  // 3. Conflito de Concorrência (HTTP 409): Autoridade é do ERP, regista log e marca como resolvido
  if (response.statusCode === 409) {
    console.info(`[CentralGest] Conflito 409 detetado em ${mutation.entityType}:${mutation.entityId}. Autoridade do servidor prevalece.`);
    return { success: true, action: 'SYNCED', statusCode: 409 };
  }

  // 4. Instabilidade ou Erro no Servidor (HTTP 5xx): Interromper para retry posterior
  throw new Error(response.error?.message || `HTTP ${response.statusCode} no servidor ERP`);
}

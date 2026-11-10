import type { OutboxSyncStatus } from '../../services/outbox/outboxService.ts';

export function shouldShowOutboxSyncIndicator(
  pendingCount: number,
  status: Pick<OutboxSyncStatus, 'isSimulatedDriver'>
): boolean {
  return pendingCount > 0 || status.isSimulatedDriver;
}

export function shouldShowOutboxBanner(
  pendingCount: number,
  _status: Pick<OutboxSyncStatus, 'isSimulatedDriver'>
): boolean {
  return pendingCount > 0;
}

export function getOutboxSyncCopy(
  pendingCount: number,
  status: Pick<OutboxSyncStatus, 'isSimulatedDriver'>
): {
  shortKey: string;
  shortFallback: string;
  detailKey: string;
  detailFallback: string;
} {
  const countSuffix = pendingCount > 0 ? ` (${pendingCount})` : '';
  if (status.isSimulatedDriver) {
    return {
      shortKey: 'outbox.simShort',
      shortFallback: `Simulação CentralGest${countSuffix}`,
      detailKey: 'outbox.simulationNotice',
      detailFallback:
        'A sincronização ocorre apenas com a aplicação aberta. O driver CentralGest está em modo de simulação.'
    };
  }

  return {
    shortKey: 'outbox.localShort',
    shortFallback: `Sincronização local${countSuffix}`,
    detailKey: 'outbox.foregroundOnlyNotice',
    detailFallback: 'A sincronização ocorre apenas com a aplicação aberta.'
  };
}

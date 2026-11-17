// src/components/auth/useLogoutConfirmation.ts
import { useCallback, useState } from 'react';
import type { LogoutModalMode } from './LogoutWarningModal';
import { hasLocalUserData, type LocalDataPresenceStatus } from '../../services/auth/localUserDataPresence';
import { drainOutbox, getPendingMutationsCount } from '../../services/outbox/outboxService';

export interface LogoutModalState {
  mode: LogoutModalMode;
  presenceStatus: LocalDataPresenceStatus;
  pendingMessage?: string | null;
  error?: string | null;
}

interface UseLogoutConfirmationParams {
  userId?: string | null;
  logout: (options?: { force?: boolean }) => Promise<{ success: boolean; hasPendingSync?: boolean; message?: string }>;
  onLoggedOut: () => void;
}

export function useLogoutConfirmation({ userId, logout, onLoggedOut }: UseLogoutConfirmationParams) {
  const [logoutModal, setLogoutModal] = useState<LogoutModalState | null>(null);
  const [isProcessingLogout, setIsProcessingLogout] = useState(false);

  const requestLogout = useCallback(async () => {
    if (isProcessingLogout) return;
    setIsProcessingLogout(true);
    try {
      const pendingCount = userId ? await getPendingMutationsCount(userId) : 0;
      if (pendingCount > 0) {
        setLogoutModal({
          mode: 'pending-sync',
          presenceStatus: 'present',
          pendingMessage: 'Existem alterações por sincronizar. Ligue-se à internet e sincronize antes de terminar sessão.'
        });
        return;
      }

      const presence = await hasLocalUserData(userId);
      if (presence.status === 'absent') {
        const res = await logout();
        if (!res.success) {
          setLogoutModal(
            res.hasPendingSync
              ? { mode: 'pending-sync', presenceStatus: presence.status, pendingMessage: res.message }
              : { mode: 'local-data-loss', presenceStatus: presence.status, error: res.message || 'Não foi possível terminar sessão.' }
          );
          return;
        }
        onLoggedOut();
        return;
      }

      setLogoutModal({ mode: 'local-data-loss', presenceStatus: presence.status });
    } catch {
      setLogoutModal({ mode: 'local-data-loss', presenceStatus: 'indeterminate' });
    } finally {
      setIsProcessingLogout(false);
    }
  }, [isProcessingLogout, logout, onLoggedOut, userId]);

  const cancelLogout = useCallback(() => {
    if (isProcessingLogout) return;
    setLogoutModal(null);
  }, [isProcessingLogout]);

  const confirmDestructiveLogout = useCallback(async () => {
    if (isProcessingLogout) return;
    setIsProcessingLogout(true);
    setLogoutModal((prev) => (prev ? { ...prev, error: null } : prev));
    try {
      const res = await logout({ force: true });
      if (!res.success) {
        setLogoutModal((prev) => (prev ? { ...prev, error: res.message || 'Não foi possível terminar sessão.' } : prev));
        return;
      }
      setLogoutModal(null);
      onLoggedOut();
    } catch (err) {
      setLogoutModal((prev) =>
        prev
          ? { ...prev, error: err instanceof Error ? err.message : 'Falha ao terminar sessão e limpar dados locais.' }
          : prev
      );
    } finally {
      setIsProcessingLogout(false);
    }
  }, [isProcessingLogout, logout, onLoggedOut]);

  const syncAndContinue = useCallback(async () => {
    if (!navigator.onLine || isProcessingLogout) return;
    setIsProcessingLogout(true);
    setLogoutModal((prev) => (prev ? { ...prev, error: null } : prev));
    try {
      await drainOutbox(undefined, userId ?? undefined);
      const remaining = await getPendingMutationsCount(userId);
      if (remaining > 0) {
        setLogoutModal((prev) =>
          prev ? { ...prev, error: 'Ainda existem alterações pendentes por sincronizar.' } : prev
        );
        return;
      }
      const presence = await hasLocalUserData(userId);
      if (presence.status === 'absent') {
        const res = await logout({ force: true });
        if (!res.success) {
          setLogoutModal({ mode: 'local-data-loss', presenceStatus: presence.status, error: res.message || 'Falha ao terminar sessão.' });
          return;
        }
        setLogoutModal(null);
        onLoggedOut();
      } else {
        setLogoutModal({ mode: 'local-data-loss', presenceStatus: presence.status });
      }
    } catch (err) {
      console.error('Erro ao sincronizar antes de terminar sessão:', err);
      setLogoutModal((prev) =>
        prev ? { ...prev, error: 'Falha ao sincronizar alterações pendentes.' } : prev
      );
    } finally {
      setIsProcessingLogout(false);
    }
  }, [isProcessingLogout, logout, onLoggedOut, userId]);

  return {
    logoutModal,
    isProcessingLogout,
    requestLogout,
    cancelLogout,
    confirmDestructiveLogout,
    syncAndContinue
  };
}

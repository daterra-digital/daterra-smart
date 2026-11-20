import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  isSignInWithEmailLink,
  signInWithEmailLink,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, firestoreDb, functions } from '../lib/firebaseClient';
import type { Profile, PendingRegistrationData } from '../types/profile';
import { resolveNormalizedUserPlan } from '../utils/userPlanNormalizer';

import {
  savePendingAuth,
  getValidPendingAuth,
  clearPendingAuth
} from '../services/auth/pendingAuthStorage';

import { clearLocalSessionData } from '../services/auth/sessionCleanupService';
import { setOutboxSessionUser, getPendingMutationsCount } from '../services/outbox/outboxService';

export type AuthUser = {
  id: string;
  uid: string;
  email: string;
  name?: string;
  farmName?: string;
  plan?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    farm_name?: string;
    plan?: string;
  };
};

export interface GoogleSignInOptions {
  isRegistration?: boolean;
  companyName?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  requestMagicLink: (data: PendingRegistrationData, captchaToken?: string) => Promise<{ error: string | null }>;
  completeMagicLinkSignIn: (emailOverride?: string) => Promise<{ error: string | null; needsEmail?: boolean }>;
  signInWithGoogle: (options?: GoogleSignInOptions) => Promise<{ error: string | null; message?: string }>;
  logout: (options?: { force?: boolean }) => Promise<{ success: boolean; hasPendingSync?: boolean; message?: string }>;
  refreshProfile: () => Promise<void>;
  clearLocalSessionData: (options?: { purgeAll?: boolean }) => Promise<{ success: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapFirebaseUser = (fbUser: FirebaseUser | null, profileData?: Profile | null): AuthUser | null => {
  if (!fbUser) return null;
  const fullName = profileData
    ? `${profileData.first_name ?? ''} ${profileData.last_name ?? ''}`.trim()
    : fbUser.displayName || '';
  const name = fullName || (fbUser.email ? fbUser.email.split('@')[0] : 'Utilizador');
  const farmName = profileData?.company_name || 'Exploração Agrícola';
  const resolvedPlan = resolveNormalizedUserPlan(profileData as Record<string, unknown> | null);
  const plan = resolvedPlan.normalizedPlan;

  return {
    id: fbUser.uid,
    uid: fbUser.uid,
    email: fbUser.email || '',
    name,
    farmName,
    plan,
    user_metadata: { full_name: name, name, farm_name: farmName, plan }
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const ensureAndLoadProfile = async (fbUser: FirebaseUser): Promise<Profile | null> => {
    try {
      const userDocRef = doc(firestoreDb, 'users', fbUser.uid);
      const snap = await getDoc(userDocRef);

      const pending = getValidPendingAuth();

      if (!snap.exists()) {
        const now = new Date().toISOString();
        const displayParts = (fbUser.displayName || '').trim().split(/\s+/).filter(Boolean);
        const defaultFirstName = displayParts[0] || null;
        const defaultLastName = displayParts.length > 1 ? displayParts.slice(1).join(' ') : null;

        const newProfile: Profile = {
          id: fbUser.uid,
          first_name: pending?.firstName?.trim() || defaultFirstName,
          last_name: pending?.lastName?.trim() || defaultLastName,
          email: fbUser.email || pending?.email || '',
          phone: null,
          company_name: pending?.companyName?.trim() ?? '',
          role: null,
          job_title: null,
          nif: null,
          address: null,
          postal_code: null,
          city: null,
          plan: 'free',
          credits: 5,
          created_at: now,
          updated_at: now
        };
        await setDoc(userDocRef, newProfile, { merge: true });
        clearPendingAuth();
        setProfile(newProfile);
        return newProfile;
      }

      const existingData = snap.data() as Profile;
      clearPendingAuth();
      setProfile(existingData);
      return existingData;
    } catch (err) {
      console.error('[AuthContext] Erro ao carregar/criar perfil Firestore:', err);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;
    // Limpeza ativa no arranque: descarta pedidos pendentes expirados (> 15 min)
    getValidPendingAuth();

    const authTimeout = setTimeout(() => {
      if (isMounted) setIsAuthLoading(false);
    }, 3000);

    if (typeof window !== 'undefined' && isSignInWithEmailLink(auth, window.location.href)) {
      completeMagicLinkSignIn();
    }

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      clearTimeout(authTimeout);
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }
      if (fbUser) {
        setOutboxSessionUser(fbUser.uid);
        const loadedProfile = await ensureAndLoadProfile(fbUser);
        if (isMounted) setUser(mapFirebaseUser(fbUser, loadedProfile));

        const userDocRef = doc(firestoreDb, 'users', fbUser.uid);
        unsubscribeProfile = onSnapshot(
          userDocRef,
          (snap) => {
            if (!isMounted || !snap.exists()) return;
            const liveProfile = snap.data() as Profile;
            setProfile(liveProfile);
            setUser(mapFirebaseUser(fbUser, liveProfile));
          },
          (err) => {
            console.warn('[AuthContext] Listener em tempo real indisponível (modo offline preservado):', err);
          }
        );
      } else if (isMounted) {
        setOutboxSessionUser(null);
        setUser(null);
        setProfile(null);
      }
      if (isMounted && !isSignInWithEmailLink(auth, window.location.href)) {
        setIsAuthLoading(false);
      }
    });
    return () => {
      isMounted = false;
      clearTimeout(authTimeout);
      if (unsubscribeProfile) unsubscribeProfile();
      unsubscribe();
    };
  }, []);

  const requestMagicLink = async (
    data: PendingRegistrationData,
    captchaToken?: string
  ): Promise<{ error: string | null }> => {
    try {
      const cleanEmail = data.email.trim().toLowerCase();
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return { error: 'Por favor introduza um endereço de e-mail válido.' };
      }

      savePendingAuth({ ...data, email: cleanEmail });

      const redirectUrl = `${window.location.origin}${window.location.pathname}#/login`;
      const callSendMagicLink = httpsCallable(functions, 'sendCustomMagicLink');
      await callSendMagicLink({
        email: cleanEmail,
        firstName: data.firstName?.trim(),
        lastName: data.lastName?.trim(),
        companyName: data.companyName?.trim(),
        redirectUrl,
        ...(captchaToken ? { captchaToken } : {})
      });

      return { error: null };
    } catch (err: any) {
      console.error('❌ [requestMagicLink] Erro ao invocar Cloud Function:', err);
      return {
        error: err?.message || 'Não foi possível enviar o link de acesso. Verifique a Cloud Function sendCustomMagicLink.'
      };
    }
  };

  const completeMagicLinkSignIn = async (
    emailOverride?: string
  ): Promise<{ error: string | null; needsEmail?: boolean }> => {
    const currentUrl = window.location.href;
    if (!isSignInWithEmailLink(auth, currentUrl)) {
      return { error: null };
    }

    let targetEmail = emailOverride?.trim().toLowerCase() || '';
    if (!targetEmail) {
      const pending = getValidPendingAuth();
      targetEmail = pending?.email?.trim().toLowerCase() || '';
    }

    if (!targetEmail) {
      return { error: null, needsEmail: true };
    }

    try {
      setIsAuthLoading(true);
      const credential = await signInWithEmailLink(auth, targetEmail, currentUrl);
      const loadedProfile = await ensureAndLoadProfile(credential.user);
      setUser(mapFirebaseUser(credential.user, loadedProfile));
      window.history.replaceState({}, document.title, window.location.pathname);
      return { error: null };
    } catch (err: any) {
      console.error('❌ [completeMagicLinkSignIn] Erro ao validar Magic Link:', err);
      return { error: 'O link de acesso expirou ou já foi utilizado. Solicite um novo link.' };
    } finally {
      setIsAuthLoading(false);
    }
  };

  const signInWithGoogle = async (
    options?: GoogleSignInOptions
  ): Promise<{ error: string | null; message?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(auth, provider);

      // Verificação de Registo vs Login:
      // Se estiver na aba "Iniciar Sessão" (isRegistration !== true), a conta tem de existir no Firestore
      const userDocRef = doc(firestoreDb, 'users', credential.user.uid);
      const snap = await getDoc(userDocRef);

      if (!options?.isRegistration && !snap.exists()) {
        await signOut(auth);
        return {
          error: 'ACCOUNT_NOT_FOUND',
          message: 'Esta conta Google ainda não está registada na DATERRA Smart. Por favor, aceda à aba "Criar Conta" para efetuar o registo.'
        };
      }

      // Se for registo de nova conta, guarda previamente os dados da exploração/empresa
      if (options?.isRegistration && !snap.exists()) {
        savePendingAuth({
          email: credential.user.email || '',
          firstName: options.firstName,
          lastName: options.lastName,
          companyName: options.companyName,
          isRegistration: true
        });
      }

      const loadedProfile = await ensureAndLoadProfile(credential.user);
      setUser(mapFirebaseUser(credential.user, loadedProfile));
      return { error: null };
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        return { error: null };
      }
      console.error('❌ [signInWithGoogle] Erro na autenticação Google:', err);
      return {
        error: 'GOOGLE_UNAVAILABLE',
        message: 'A autenticação com a conta Google encontra-se temporariamente indisponível. Por favor, utilize o seu e-mail para receber um link de acesso seguro.'
      };
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (auth.currentUser) {
      const updated = await ensureAndLoadProfile(auth.currentUser);
      setUser(mapFirebaseUser(auth.currentUser, updated));
    }
  };

  const logout = async (options?: { force?: boolean }): Promise<{ success: boolean; hasPendingSync?: boolean; message?: string }> => {
    const currentUserId = user?.id || user?.uid;

    // Se for logout voluntário (não forçado), verificar se existem dados locais não sincronizados
    if (!options?.force && currentUserId) {
      const pendingCount = await getPendingMutationsCount(currentUserId);
      if (pendingCount > 0) {
        return {
          success: false,
          hasPendingSync: true,
          message: 'Existem alterações por sincronizar. Ligue-se à internet e sincronize antes de terminar sessão.'
        };
      }
    }

    setOutboxSessionUser(null);
    try {
      await clearLocalSessionData(currentUserId);
    } catch (err) {
      console.warn('[AuthContext] Aviso ao desinfetar sessão local:', err);
    }
    await signOut(auth);
    clearPendingAuth();
    setUser(null);
    setProfile(null);
    return { success: true };
  };

  const handleManualSessionCleanup = async (options?: { purgeAll?: boolean }) => {
    const currentUserId = user?.id || user?.uid;
    return clearLocalSessionData(currentUserId, options);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: Boolean(user),
        isAuthLoading,
        requestMagicLink,
        completeMagicLinkSignIn,
        signInWithGoogle,
        logout,
        refreshProfile,
        clearLocalSessionData: handleManualSessionCleanup
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};

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
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, firestoreDb, functions } from '../lib/firebaseClient';
import type { Profile, PendingRegistrationData } from '../types/profile';

const PENDING_AUTH_STORAGE_KEY = 'daterra_pending_auth';

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

export interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  requestMagicLink: (data: PendingRegistrationData, captchaToken?: string) => Promise<{ error: string | null }>;
  completeMagicLinkSignIn: (emailOverride?: string) => Promise<{ error: string | null; needsEmail?: boolean }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapFirebaseUser = (fbUser: FirebaseUser | null, profileData?: Profile | null): AuthUser | null => {
  if (!fbUser) return null;
  const fullName = profileData
    ? `${profileData.first_name ?? ''} ${profileData.last_name ?? ''}`.trim()
    : fbUser.displayName || '';
  const name = fullName || (fbUser.email ? fbUser.email.split('@')[0] : 'Utilizador');
  const farmName = profileData?.company_name || 'Exploração Agrícola';
  const plan = profileData?.plan || 'DATERRA Smart';

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

      let pending: PendingRegistrationData | null = null;
      try {
        const raw = localStorage.getItem(PENDING_AUTH_STORAGE_KEY);
        if (raw) pending = JSON.parse(raw) as PendingRegistrationData;
      } catch {
        pending = null;
      }

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
        localStorage.removeItem(PENDING_AUTH_STORAGE_KEY);
        setProfile(newProfile);
        return newProfile;
      }

      const existingData = snap.data() as Profile;
      localStorage.removeItem(PENDING_AUTH_STORAGE_KEY);
      setProfile(existingData);
      return existingData;
    } catch (err) {
      console.error('[AuthContext] Erro ao carregar/criar perfil Firestore:', err);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;
    const authTimeout = setTimeout(() => {
      if (isMounted) setIsAuthLoading(false);
    }, 3000);

    if (typeof window !== 'undefined' && isSignInWithEmailLink(auth, window.location.href)) {
      completeMagicLinkSignIn();
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      clearTimeout(authTimeout);
      if (fbUser) {
        const loadedProfile = await ensureAndLoadProfile(fbUser);
        if (isMounted) setUser(mapFirebaseUser(fbUser, loadedProfile));
      } else if (isMounted) {
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

      localStorage.setItem(
        PENDING_AUTH_STORAGE_KEY,
        JSON.stringify({ ...data, email: cleanEmail })
      );

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
      try {
        const raw = localStorage.getItem(PENDING_AUTH_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as PendingRegistrationData;
          targetEmail = parsed.email?.trim().toLowerCase() || '';
        }
      } catch {
        targetEmail = '';
      }
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

  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(auth, provider);
      const loadedProfile = await ensureAndLoadProfile(credential.user);
      setUser(mapFirebaseUser(credential.user, loadedProfile));
      return { error: null };
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        return { error: null };
      }
      console.error('❌ [signInWithGoogle] Erro na autenticação Google:', err);
      return {
        error: err?.message || 'Não foi possível autenticar com a conta Google.'
      };
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (auth.currentUser) {
      const updated = await ensureAndLoadProfile(auth.currentUser);
      setUser(mapFirebaseUser(auth.currentUser, updated));
    }
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    localStorage.removeItem('daterra_auth');
    setUser(null);
    setProfile(null);
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
        refreshProfile
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

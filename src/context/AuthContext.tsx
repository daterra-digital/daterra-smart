import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export type AuthUser = SupabaseUser & {
  name?: string;
  farmName?: string;
  plan?: string;
};

export interface AuthContextType {
  session: Session | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  sendOtp: (email: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapSupabaseUser = (sbUser: SupabaseUser | null): AuthUser | null => {
  if (!sbUser) return null;
  const name =
    sbUser.user_metadata?.full_name ||
    sbUser.user_metadata?.name ||
    (sbUser.email ? sbUser.email.split('@')[0] : 'Utilizador');

  return {
    ...sbUser,
    name,
    farmName: sbUser.user_metadata?.farm_name || 'Exploração Agrícola',
    plan: sbUser.user_metadata?.plan || 'DATERRA Smart'
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Obter sessão inicial persistida no cliente Supabase
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Erro ao recuperar a sessão Supabase:', error.message);
        }
        if (isMounted) {
          setSession(session);
          setUser(mapSupabaseUser(session?.user ?? null));
          setIsAuthLoading(false);
        }
      })
      .catch((err) => {
        console.error('Falha inesperada na recuperação da sessão:', err);
        if (isMounted) {
          setIsAuthLoading(false);
        }
      });

    // 2. Ouvir alterações reais de autenticação (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setSession(session);
        setUser(mapSupabaseUser(session?.user ?? null));
        setIsAuthLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const sendOtp = async (email: string): Promise<{ error: string | null }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return { error: 'Por favor introduza um endereço de email válido.' };
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true
        }
      });

      if (error) {
        if (error.status === 429) {
          return { error: 'Demasiadas tentativas de envio. Por favor aguarde um momento antes de tentar novamente.' };
        }
        return { error: 'Não foi possível enviar o código de acesso. Verifique o email e tente novamente.' };
      }

      return { error: null };
    } catch {
      return { error: 'Ocorreu um erro inesperado ao solicitar o código. Tente novamente.' };
    }
  };

  const verifyOtp = async (email: string, token: string): Promise<{ error: string | null }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanToken = token.trim();

      if (!cleanEmail) {
        return { error: 'O endereço de email é obrigatório.' };
      }
      if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) {
        return { error: 'O código de verificação deve conter exatamente 6 dígitos numéricos.' };
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email'
      });

      if (error || !data.session) {
        if (error?.message?.toLowerCase().includes('expired')) {
          return { error: 'O código introduzido expirou. Por favor solicite um novo código.' };
        }
        return { error: 'Código de verificação incorreto ou inválido. Tente novamente.' };
      }

      setSession(data.session);
      setUser(mapSupabaseUser(data.user));
      return { error: null };
    } catch {
      return { error: 'Erro ao validar o código. Por favor tente novamente.' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Erro ao terminar sessão:', err);
    } finally {
      // Limpeza de chave legada caso tenha existido em versões anteriores
      localStorage.removeItem('daterra_auth');
      setSession(null);
      setUser(null);
    }
  };

  const isAuthenticated = Boolean(session && user);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAuthenticated,
        isAuthLoading,
        sendOtp,
        verifyOtp,
        logout
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

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/profile';

export type AuthUser = SupabaseUser & {
  name?: string;
  farmName?: string;
  plan?: string;
};

export interface AuthContextType {
  session: Session | null;
  user: AuthUser | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  sendOtp: (email: string, captchaToken?: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshProfile?: () => Promise<void>;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) {
        setProfile(null);
        return;
      }

      setProfile(data);
    } catch {
      setProfile(null);
    }
  }

  useEffect(() => {
    let isMounted = true;

    // 1. Obter sessão inicial persistida no cliente Supabase
    supabase.auth
      .getSession()
      .then(async ({ data: { session }, error }) => {
        if (error) {
          console.error('Erro ao recuperar a sessão Supabase:', error.message);
        }
        if (isMounted) {
          setSession(session);
          setUser(mapSupabaseUser(session?.user ?? null));
          if (session?.user?.id) {
            await loadProfile(session.user.id);
          } else {
            setProfile(null);
          }
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
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isMounted) {
        setSession(session);
        setUser(mapSupabaseUser(session?.user ?? null));
        if (session?.user?.id) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setIsAuthLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const sendOtp = async (email: string, captchaToken?: string): Promise<{ error: string | null }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return { error: 'Por favor introduza um endereço de email válido.' };
      }

      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: {
          email: cleanEmail,
          action: 'magiclink',
          ...(captchaToken ? { captchaToken } : {})
        }
      });

      if (error) {
        console.error('❌ [sendOtp] Erro ao invocar Edge Function send-otp:', error);

        let detailedMessage = '';

        // Tenta extrair a mensagem de erro retornada no corpo da resposta HTTP da Edge Function
        if ('context' in error && error.context) {
          try {
            const ctx = error.context as Response;
            const cloned = ctx.clone ? ctx.clone() : ctx;
            const body = await cloned.json();
            detailedMessage = body?.error || body?.message || body?.details || '';
          } catch {
            try {
              const text = await (error.context as Response).text();
              if (text) detailedMessage = text;
            } catch {
              // fallback silencioso
            }
          }
        }

        if (detailedMessage) {
          return { error: detailedMessage };
        }

        if (error.name === 'FunctionsFetchError' || error.message?.includes('Failed to send')) {
          return {
            error: 'Não foi possível conectar à Edge Function "send-otp". Verifique se a função está deployada no Supabase com CORS e --no-verify-jwt.'
          };
        }

        return { error: error.message || 'Não foi possível enviar o código de acesso. Tente novamente.' };
      }

      if (data?.error) {
        return { error: data.error };
      }

      return { error: null };
    } catch (err: any) {
      console.error('❌ [sendOtp] Exceção inesperada:', err);
      return { error: err?.message || 'Ocorreu um erro inesperado ao solicitar o código. Tente novamente.' };
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

  const refreshProfile = async (): Promise<void> => {
    if (session?.user?.id) {
      await loadProfile(session.user.id);
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
      setProfile(null);
    }
  };

  const isAuthenticated = Boolean(session && user);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isAuthenticated,
        isAuthLoading,
        sendOtp,
        verifyOtp,
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

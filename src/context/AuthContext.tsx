import React, { createContext, useContext, useState } from 'react';

interface UserProfile {
  id?: string;
  name: string;
  farmName: string;
  plan: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loginWithOtp: (otp: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: UserProfile = {
  id: 'USR-2026-88',
  name: 'Eng.º João Silva',
  farmName: 'Quinta do Vale - Sociedade Agrícola',
  plan: 'Plano Profissional Agricultura 4.0',
  email: 'joao.silva@daterra-smart.pt'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('daterra_auth') === 'true';
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    return localStorage.getItem('daterra_auth') === 'true' ? MOCK_USER : null;
  });

  const loginWithOtp = async (otp: string): Promise<boolean> => {
    // Simula uma verificação OTP (aceita qualquer OTP de 6 dígitos para o mock)
    if (otp.length === 6 && /^\d+$/.test(otp)) {
      localStorage.setItem('daterra_auth', 'true');
      setIsAuthenticated(true);
      setUser(MOCK_USER);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('daterra_auth');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loginWithOtp, logout }}>
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

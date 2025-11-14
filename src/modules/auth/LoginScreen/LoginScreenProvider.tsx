import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from '../../../providers';

interface LoginScreenContextType {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  handleLogin: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const LoginScreenContext = createContext<LoginScreenContextType | undefined>(undefined);

export const useLoginScreen = () => {
  const context = useContext(LoginScreenContext);
  if (!context) {
    throw new Error('useLoginScreen must be used within LoginScreenProvider');
  }
  return context;
};

interface LoginScreenProviderProps {
  children: ReactNode;
}

export const LoginScreenProvider = ({ children }: LoginScreenProviderProps) => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login({ email, password });
    } catch (error) {
      // Error is handled by AuthProvider
    }
  };

  return (
    <LoginScreenContext.Provider
      value={{
        email,
        password,
        setEmail,
        setPassword,
        handleLogin,
        isLoading,
        error,
      }}
    >
      {children}
    </LoginScreenContext.Provider>
  );
};

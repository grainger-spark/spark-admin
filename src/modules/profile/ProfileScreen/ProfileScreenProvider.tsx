import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../../../providers';

interface ProfileScreenContextType {
  handleLogout: () => Promise<void>;
  isLoading: boolean;
}

const ProfileScreenContext = createContext<ProfileScreenContextType | undefined>(undefined);

export const useProfileScreen = () => {
  const context = useContext(ProfileScreenContext);
  if (!context) {
    throw new Error('useProfileScreen must be used within ProfileScreenProvider');
  }
  return context;
};

interface ProfileScreenProviderProps {
  children: ReactNode;
}

export const ProfileScreenProvider = ({ children }: ProfileScreenProviderProps) => {
  const { logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ProfileScreenContext.Provider
      value={{
        handleLogout,
        isLoading,
      }}
    >
      {children}
    </ProfileScreenContext.Provider>
  );
};

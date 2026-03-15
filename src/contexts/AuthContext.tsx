import React, { createContext, useContext, useState } from 'react';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  setOnboardingCompleted: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    () => localStorage.getItem('access_token')
  );
  const [user, setUser] = useState<User | null>(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  const [onboardingCompleted, setOnboardingCompletedState] = useState<boolean>(
    () => localStorage.getItem('onboarding_completed') === 'true'
  );

  const login = (newAccessToken: string, newRefreshToken: string, newUser: User) => {
    localStorage.setItem('access_token', newAccessToken);
    localStorage.setItem('refresh_token', newRefreshToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    const completed = newUser.onboardingCompleted ?? false;
    localStorage.setItem('onboarding_completed', String(completed));
    setAccessToken(newAccessToken);
    setUser(newUser);
    setOnboardingCompletedState(completed);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('onboarding_completed');
    setAccessToken(null);
    setUser(null);
    setOnboardingCompletedState(false);
  };

  const setOnboardingCompleted = (val: boolean) => {
    localStorage.setItem('onboarding_completed', String(val));
    setOnboardingCompletedState(val);
  };

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isAuthenticated: !!accessToken,
      onboardingCompleted,
      login,
      logout,
      setOnboardingCompleted,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

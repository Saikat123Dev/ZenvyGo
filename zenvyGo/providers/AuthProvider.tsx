import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiService, type AuthUser } from '@/lib/api';
import { queryClient } from '@/lib/query-client';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  isAuthenticated: boolean;
  finishAuthentication: (user: AuthUser) => void;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      await apiService.initialize();

      if (!apiService.hasActiveSession()) {
        if (isMounted) {
          setUser(null);
          setStatus('anonymous');
        }
        return;
      }

      const response = await apiService.getCurrentUser();
      if (response.success && response.data && isMounted) {
        setUser(response.data);
        setStatus('authenticated');
        return;
      }

      await apiService.clearTokens();
      if (isMounted) {
        setUser(null);
        setStatus('anonymous');
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAuthenticated: status === 'authenticated' && Boolean(user),
      finishAuthentication(nextUser) {
        setUser(nextUser);
        setStatus('authenticated');
      },
      async refreshUser() {
        const response = await apiService.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
          setStatus('authenticated');
          return;
        }

        await apiService.clearTokens();
        setUser(null);
        setStatus('anonymous');
      },
      async signOut() {
        await apiService.logout();
        queryClient.clear();
        setUser(null);
        setStatus('anonymous');
      },
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

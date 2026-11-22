/**
 * Hub Music - useAuth Hook
 * Hook de autenticação: sessão, login, logout, register, refresh
 * Auth hook: session, login, logout, register, refresh
 *
 * @languages pt-BR / en-US
 */

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { api } from '../../../lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  accountType: 'LISTENER' | 'ARTIST' | 'BOTH';
  createdAt: string;
  _count?: {
    tracks: number;
    playlists: number;
    followers: number;
    following: number;
    likes: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; displayName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.me();
      setUser(response.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    await api.login({ email, password });
    await fetchUser();
  };

  const register = async (data: { username: string; email: string; password: string; displayName?: string }) => {
    await api.register(data);
    await fetchUser();
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout errors
    }
    setUser(null);
  };

  const refresh = async () => {
    await api.refresh();
    await fetchUser();
  };

  const updateProfile = async (data: Partial<User>) => {
    // This would call an update profile endpoint
    // For now, just update local state
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
/**
 * Hub Music - Auth Hook
 * Hook de autenticação: login, logout, refresh, estado do usuário
 * Auth hook: login, logout, refresh, user state
 * 
 * @languages pt-BR / en-US
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  accountType: 'LISTENER' | 'ARTIST' | 'BOTH';
  createdAt: string;
  _count?: {
    tracks: number;
    playlists: number;
    followers: number;
    following: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; displayName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user
  const { data: userData, refetch } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await api.me();
      return response.data.user;
    },
    retry: false,
    staleTime: 1000 * 60 * 5
  });

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
    setLoading(false);
  }, [userData]);

  const login = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await api.login(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    }
  });

  const register = useMutation({
    mutationFn: async (data: { username: string; email: string; password: string; displayName?: string }) => {
      const response = await api.register(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    }
  });

  const logout = useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
    }
  });

  const refreshUser = async () => {
    await refetch();
  };

  const updateUser = useMutation({
    mutationFn: async (data: Partial<User>) => {
      // This would need a PATCH /auth/me endpoint on backend
      // For now, just update local state
      setUser(prev => prev ? { ...prev, ...data } : null);
    }
  });

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login: login.mutateAsync,
      register: register.mutateAsync,
      logout: logout.mutateAsync,
      refreshUser,
      updateUser: updateUser.mutateAsync
    }}>
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
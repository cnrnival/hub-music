/**
 * Hub Music - App Component
 * Componente raiz: rotas, provedores de autenticação, player, React Query
 * Root component: routes, auth and player providers, React Query
 *
 * @languages pt-BR / en-US
 */

import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './app/hooks/auth/useAuth';
import { PlayerProvider } from './hooks/usePlayer';
import { PanelSection } from './app/layout/PanelSection';
import { initializePlayerSnapshot } from './app/hooks/player/usePlayerSnapshot';
import { useAuth } from './app/hooks/auth/useAuth';
import { useEffect } from 'react';
import Home from './app/routes/home/HomePage';
import SearchPage from './app/routes/search/SearchPage';
import SearchResultsPage from './app/routes/search/SearchResultsPage';
import TrackPage from './app/routes/track/TrackPage';
import AlbumPage from './app/routes/album/AlbumPage';
import ArtistPage from './app/routes/artist/ArtistPage';
import PlaylistPage from './app/routes/playlist/PlaylistPage';
import PlaylistEditor from './app/routes/playlist/PlaylistEditor';
import ShowPage from './app/routes/show/ShowPage';
import EpisodePage from './app/routes/episode/EpisodePage';
import LibraryHub from './app/routes/library/LibraryHub';
import ProfilePage from './app/routes/profile/ProfilePage';
import SettingsPage from './app/routes/profile/SettingsPage';
import LoginPage from './app/routes/auth/LoginPage';
import RegisterPage from './app/routes/auth/RegisterPage';
import ForgotPasswordPage from './app/routes/auth/ForgotPasswordPage';
import BuddyFeedPage from './app/routes/social/BuddyFeedPage';
import BlendPage from './app/routes/social/BlendPage';
import NotFoundPage from './app/routes/NotFoundPage';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <Navigate to="/" replace /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <RegisterPage />        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPasswordPage />        </PublicRoute>
      } />

      {/* Protected routes with PanelSection layout */}
      <Route element={
        <PrivateRoute>
          <PanelSection />
        </PrivateRoute>
      }>
        {/* Home/Discovery */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/search/:query" element={<SearchResultsPage />} />

        {/* Library (hub with nested tabs) */}
        <Route path="/library" element={<LibraryHub />}>
          <Route index element={<Navigate to="tracks" replace />} />
          <Route path="tracks" element={<Outlet />} />
          <Route path="albums" element={<Outlet />} />
          <Route path="artists" element={<Outlet />} />
          <Route path="playlists" element={<Outlet />} />
          <Route path="episodes" element={<Outlet />} />
          <Route path="recents" element={<Outlet />} />
        </Route>

        {/* Entity routes */}
        <Route path="/track/:id" element={<TrackPage />} />
        <Route path="/album/:id" element={<AlbumPage />} />
        <Route path="/artist/:id" element={<ArtistPage />} />
        <Route path="/show/:id" element={<ShowPage />} />
        <Route path="/episode/:id" element={<EpisodePage />} />
        <Route path="/playlist/:id" element={<PlaylistPage />} />
        <Route path="/playlist/:id/edit" element={<PlaylistEditor />} />
        <Route path="/playlist/create" element={<PlaylistEditor />} />

        {/* Profile/Social */}
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/feed" element={<BuddyFeedPage />} />
        <Route path="/blend/:id" element={<BlendPage />} />

        </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  // Initialize player snapshot on app mount
  useEffect(() => {
    initializePlayerSnapshot();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PlayerProvider>
          <AppRoutes />
        </PlayerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}


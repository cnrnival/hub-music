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
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './app/hooks/auth/useAuth';
import { PlayerProvider } from './app/hooks/player/usePlayer';
import { PanelSection } from './app/layout/PanelSection';
import { initializePlayerSnapshot } from './app/hooks/player/usePlayerSnapshot';
import { useAuth } from './app/hooks/auth/useAuth';
import { useEffect } from 'react';

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

// Lazy load route components for code splitting
const Home = () => import('./app/routes/home/HomePage').then(m => m.HomePage);
const SearchPage = () => import('./app/routes/search/SearchPage').then(m => m.SearchPage);
const SearchResultsPage = () => import('./app/routes/search/SearchResultsPage').then(m => m.SearchResultsPage);
const TrackPage = () => import('./app/routes/track/TrackPage').then(m => m.TrackPage);
const AlbumPage = () => import('./app/routes/album/AlbumPage').then(m => m.AlbumPage);
const ArtistPage = () => import('./app/routes/artist/ArtistPage').then(m => m.ArtistPage);
const PlaylistPage = () => import('./app/routes/playlist/PlaylistPage').then(m => m.PlaylistPage);
const PlaylistEditor = () => import('./app/routes/playlist/PlaylistEditor').then(m => m.PlaylistEditor);
const ShowPage = () => import('./app/routes/show/ShowPage').then(m => m.ShowPage);
const EpisodePage = () => import('./app/routes/episode/EpisodePage').then(m => m.EpisodePage);
const LibraryHub = () => import('./app/routes/library/LibraryHub').then(m => m.LibraryHub);
const ProfilePage = () => import('./app/routes/profile/ProfilePage').then(m => m.ProfilePage);
const SettingsPage = () => import('./app/routes/profile/SettingsPage').then(m => m.SettingsPage);
const LoginPage = () => import('./app/routes/auth/LoginPage').then(m => m.LoginPage);
const RegisterPage = () => import('./app/routes/auth/RegisterPage').then(m => m.RegisterPage);
const ForgotPasswordPage = () => import('./app/routes/auth/ForgotPasswordPage').then(m => m.ForgotPasswordPage);
const BuddyFeedPage = () => import('./app/routes/social/BuddyFeedPage').then(m => m.BuddyFeedPage);
const BlendPage = () => import('./app/routes/social/BlendPage').then(m => m.BlendPage);
const NotFoundPage = () => import('./app/routes/NotFoundPage').then(m => m.NotFoundPage);

// Suspense wrapper for lazy routes
function LazyRoute({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      {children}
    </React.Suspense>
  );
}

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
          <LazyRoute><LoginPage /></LazyRoute>
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <LazyRoute><RegisterPage /></LazyRoute>
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <LazyRoute><ForgotPasswordPage /></LazyRoute>
        </PublicRoute>
      } />

      {/* Protected routes with PanelSection layout */}
      <Route element={
        <PrivateRoute>
          <PanelSection />
        </PrivateRoute>
      }>
        {/* Home/Discovery */}
        <Route path="/" element={<LazyRoute><Home /></LazyRoute>} />
        <Route path="/search" element={<LazyRoute><SearchPage /></LazyRoute>} />
        <Route path="/search/:query" element={<LazyRoute><SearchResultsPage /></LazyRoute>} />

        {/* Library (hub with nested tabs) */}
        <Route path="/library" element={<LazyRoute><LibraryHub /></LazyRoute>}>
          <Route index element={<Navigate to="tracks" replace />} />
          <Route path="tracks" element={<Outlet />} />
          <Route path="albums" element={<Outlet />} />
          <Route path="artists" element={<Outlet />} />
          <Route path="playlists" element={<Outlet />} />
          <Route path="episodes" element={<Outlet />} />
          <Route path="recents" element={<Outlet />} />
        </Route>

        {/* Entity routes */}
        <Route path="/track/:id" element={<LazyRoute><TrackPage /></LazyRoute>} />
        <Route path="/album/:id" element={<LazyRoute><AlbumPage /></LazyRoute>} />
        <Route path="/artist/:id" element={<LazyRoute><ArtistPage /></LazyRoute>} />
        <Route path="/show/:id" element={<LazyRoute><ShowPage /></LazyRoute>} />
        <Route path="/episode/:id" element={<LazyRoute><EpisodePage /></LazyRoute>} />
        <Route path="/playlist/:id" element={<LazyRoute><PlaylistPage /></LazyRoute>} />
        <Route path="/playlist/:id/edit" element={<LazyRoute><PlaylistEditor /></LazyRoute>} />
        <Route path="/playlist/create" element={<LazyRoute><PlaylistEditor /></LazyRoute>} />

        {/* Profile/Social */}
        <Route path="/profile/:username" element={<LazyRoute><ProfilePage /></LazyRoute>} />
        <Route path="/settings" element={<LazyRoute><SettingsPage /></LazyRoute>} />
        <Route path="/feed" element={<LazyRoute><BuddyFeedPage /></LazyRoute>} />
        <Route path="/blend/:id" element={<LazyRoute><BlendPage /></LazyRoute>} />

        </Route>

      {/* 404 */}
      <Route path="*" element={<LazyRoute><NotFoundPage /></LazyRoute>} />
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
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
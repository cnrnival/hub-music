/**
 * Hub Music - LibraryHub
 * Hub da biblioteca com abas (=== xpui-routes-your-library-x ===)
 * Library hub with tabs
 *
 * @languages pt-BR / en-US
 */

import { Outlet, useLocation } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { cn } from '../../../lib/utils';
import {
  Music,
  Heart,
  ListMusic,
  User,
  Album,
  Clock,
  Plus,
  Filter,
  Grid,
  List,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Avatar } from '../../../components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../../components/ui/dropdown-menu';
import { useLibraryStore } from '../../../state/libraryStore';
import { useAuth } from '../../../hooks/auth/useAuth';
import { usePlayer } from '../../../hooks/player/usePlayer';

const libraryTabs = [
  { id: 'tracks' as const, label: 'Faixas', icon: Music, countKey: 'tracks' },
  { id: 'albums' as const, label: 'Álbuns', icon: Album, countKey: 'albums' },
  { id: 'artists' as const, label: 'Artistas', icon: User, countKey: 'artists' },
  { id: 'playlists' as const, label: 'Playlists', icon: ListMusic, countKey: 'playlists' },
  { id: 'episodes' as const, label: 'Episódios', icon: Album, countKey: 'episodes' },
  { id: 'recents' as const, label: 'Recentes', icon: Clock, countKey: 'recents' },
];

export function LibraryHub() {
  const location = useLocation();
  const { user } = useAuth();
  const { activeTab, setActiveTab, viewMode, setViewMode, sortBy, setSortBy, sortOrder, setSortOrder, filters, setFilters, clearFilters } = useLibraryStore();
  const { play } = usePlayer();
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Get current tab from URL
  const currentPath = location.pathname.replace('/library', '') || '/tracks';
  const urlTab = currentPath.split('/')[1] as any;

  // Sync with URL
  // Note: In a real app, you'd use useEffect to sync with router

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display-sm font-bold gradient-text">Biblioteca</h1>
            <p className="text-text-secondary">Suas músicas, playlists e artistas favoritos</p>
          </div>
        </div>

        <Card className="p-8 space-y-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center">
            <Music className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-heading-md font-bold">Bem-vindo à sua biblioteca</h2>
          <p className="text-text-secondary">
            Faça login para acessar suas faixas, playlists e músicas curtidas.
          </p>
          <div className="flex items-center justify-center gap-3 pt-4">
            <Button size="lg" onClick={() => window.location.href = '/login'}>
              <Plus className="w-4 h-4 mr-2" />
              Entrar
            </Button>
            <Button variant="secondary" size="lg" onClick={() => window.location.href = '/register'}>
              Criar conta
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-bold gradient-text">Biblioteca</h1>
          <p className="text-text-secondary">Suas músicas, playlists e artistas favoritos</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Filtrar">
                <Filter className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => { setFilters({ source: 'all' }); setShowFilterMenu(false); }}>
                Todas as fontes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setFilters({ source: 'local' }); setShowFilterMenu(false); }}>
                <Badge variant="primary" className="mr-2">LOCAL</Badge> Uploads locais
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setFilters({ source: 'deezer' }); setShowFilterMenu(false); }}>
                <Badge variant="secondary" className="mr-2">DEEZER</Badge> Deezer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setFilters({ source: 'freetouse' }); setShowFilterMenu(false); }}>
                <Badge variant="success" className="mr-2">FREE</Badge> Free To Use
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setFilters({ source: 'jamendo' }); setShowFilterMenu(false); }}>
                <Badge variant="warning" className="mr-2">JAMENDO</Badge> Jamendo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-error" onClick={() => { clearFilters(); setShowFilterMenu(false); }}>
                Limpar filtros
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Criar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => window.location.href = '/upload'}>
                <Music className="w-4 h-4 mr-2" /> Nova faixa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/playlist/create'}>
                <ListMusic className="w-4 h-4 mr-2" /> Nova playlist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-1">
        <nav className="flex gap-1 overflow-x-auto pb-1" role="tablist">
          {libraryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-glow'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
              )}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              <tab.icon className="w-4 h-4" aria-hidden="true" />
              {tab.label}
            </button>
          ))}
        </nav>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-background-tertiary rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              )}
              aria-label="Visualização em grade"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === 'list' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              )}
              aria-label="Visualização em lista"
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ChevronDown className="w-4 h-4" />
                {sortBy === 'recent' && 'Recentes'}
                {sortBy === 'alphabetical' && 'A-Z'}
                {sortBy === 'artist' && 'Artista'}
                {sortBy === 'duration' && 'Duração'}
                {sortBy === 'popularity' && 'Popularidade'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setSortBy('recent'); setShowSortMenu(false); }}>Recentes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('alphabetical'); setShowSortMenu(false); }}>A-Z</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('artist'); setShowSortMenu(false); }}>Artista</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('duration'); setShowSortMenu(false); }}>Duração</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy('popularity'); setShowSortMenu(false); }}>Popularidade</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort order toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            aria-label={sortOrder === 'asc' ? 'Ordem decrescente' : 'Ordem crescente'}
          >
            {sortOrder === 'asc' ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 15l-6-6-6 6" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            )}
          </Button>
        </div>

        {/* Active filters indicator */}
        {(filters.genre || (filters.source && filters.source !== 'all') || filters.search) && (
          <div className="flex items-center gap-2 flex-wrap">
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Busca: {filters.search}
                <button onClick={() => setFilters({ search: '' })} className="ml-1">×</button>
              </Badge>
            )}
            {filters.source && filters.source !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Fonte: {filters.source.toUpperCase()}
                <button onClick={() => setFilters({ source: 'all' })} className="ml-1">×</button>
              </Badge>
            )}
            {filters.genre && (
              <Badge variant="secondary" className="gap-1">
                Gênero: {filters.genre}
                <button onClick={() => setFilters({ genre: '' })} className="ml-1">×</button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="min-h-[calc(100vh-300px)]">
        <Outlet />
      </div>
    </div>
  );
}
/**
 * Hub Music - Sidebar
 * Sidebar colapsável: navegação principal, biblioteca, playlists
 * Collapsible sidebar: main navigation, library, playlists
 *
 * @languages pt-BR / en-US
 */

import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  Home,
  Search,
  Library,
  Plus,
  Heart,
  ListMusic,
  User,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bell,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Avatar } from '../components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { useAuth } from '../../hooks/useAuth';

const mainNavItems = [
  { path: '/', icon: Home, label: 'Início', tooltip: 'Início' },
  { path: '/search', icon: Search, label: 'Buscar', tooltip: 'Buscar' },
  { path: '/library', icon: Library, label: 'Biblioteca', tooltip: 'Sua biblioteca' },
];

const librarySections = [
  { path: '/library/tracks', icon: Heart, label: 'Curtidas' },
  { path: '/library/playlists', icon: ListMusic, label: 'Playlists' },
  { path: '/library/artists', icon: User, label: 'Artistas' },
  { path: '/library/albums', icon: ListMusic, label: 'Álbuns' },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
  onCloseMobile?: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  if (!user) {
    return (
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-background border-r border-border transition-all duration-300 flex flex-col',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Navegação principal"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <NavLink to="/" className="flex items-center gap-2" onClick={onCloseMobile}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              {!collapsed && <span className="font-bold text-xl gradient-text">Hub Music</span>}
            </NavLink>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onCloseMobile}
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Auth prompt */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Music className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-heading-sm font-bold mb-2">Faça login para continuar</h3>
            <p className="text-text-secondary text-sm mb-6 max-w-xs">
              Acesse sua biblioteca, playlists e descubra novas músicas
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Button size="lg" onClick={() => { onCloseMobile?.(); window.location.href = '/login'; }}>
                Entrar
              </Button>
              <Button variant="secondary" size="lg" onClick={() => { onCloseMobile?.(); window.location.href = '/register'; }}>
                Criar conta
              </Button>
            </div>
          </div>

          {/* Bottom: collapse toggle */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleCollapse(!collapsed)}
              aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
              className="w-full justify-center"
            >
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-background border-r border-border transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
      aria-label="Navegação principal"
    >
      <div className="flex flex-col h-full">
        {/* Logo & Collapse toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <NavLink to="/" className="flex items-center gap-2 flex-1" onClick={onCloseMobile}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 text-white" />
            </div>
            {!collapsed && <span className="font-bold text-xl gradient-text truncate">Hub Music</span>}
          </NavLink>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleCollapse(!collapsed)}
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            className={cn('flex-shrink-0', collapsed && 'ml-auto')}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1" aria-label="Navegação principal">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                'text-text-secondary hover:text-text-primary hover:bg-background-tertiary',
                isActive && 'bg-primary/10 text-primary',
                collapsed && 'justify-center'
              )}
              aria-label={item.tooltip}
              title={collapsed ? item.tooltip : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              {!collapsed && <span className="font-medium truncate">{item.label}</span>}
            </NavLink>
          ))}

          {/* Create playlist */}
          {!collapsed && (
            <NavLink
              to="/upload"
              onClick={onCloseMobile}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-text-secondary hover:text-primary hover:bg-primary/10"
            >
              <Plus className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="font-medium truncate">Criar playlist</span>
            </NavLink>
          )}
        </nav>

        {/* Library Sections */}
        <div className="px-2 py-2 border-t border-border">
          {!collapsed && (
            <h4 className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
              Sua Biblioteca
            </h4>
          )}
          <nav className="space-y-1" aria-label="Biblioteca">
            {librarySections.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl transition-colors',
                  'text-text-secondary hover:text-text-primary hover:bg-background-tertiary',
                  isActive && 'bg-primary/10 text-primary',
                  collapsed && 'justify-center'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {!collapsed && <span className="font-medium truncate">{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          {!collapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar src={user.avatarUrl} name={user.displayName || user.username} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{user.displayName || user.username}</p>
                  <p className="text-caption text-text-muted truncate">@{user.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start gap-2"
                  onClick={() => { onCloseMobile?.(); window.location.href = '/profile/' + user.username; }}
                >
                  <User className="w-4 h-4" />
                  Perfil
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start gap-2"
                  onClick={() => { onCloseMobile?.(); window.location.href = '/settings'; }}
                >
                  <Settings className="w-4 h-4" />
                  Configurações
                </Button>
              </div>

              <Button
                variant="secondary"
                className="w-full justify-start gap-2"
                onClick={() => { logout(); onCloseMobile?.(); }}
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full justify-center" aria-label="Menu do usuário">
                  <Avatar src={user.avatarUrl} name={user.displayName || user.username} size="sm" className="mx-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1 border-b border-border">
                  <p className="font-medium text-text-primary truncate">{user.displayName || user.username}</p>
                  <p className="text-caption text-text-muted truncate">@{user.username}</p>
                </div>
                <DropdownMenuItem onClick={() => { onCloseMobile?.(); window.location.href = '/profile/' + user.username; }}>
                  <User className="w-4 h-4 mr-2" /> Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { onCloseMobile?.(); window.location.href = '/settings'; }}>
                  <Settings className="w-4 h-4 mr-2" /> Configurações
                </DropdownMenuItem>
                <DropdownMenuItem className="text-error" onClick={() => { logout(); onCloseMobile?.(); }}>
                  <LogOut className="w-4 h-4 mr-2" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </aside>
  );
}

import { Music } from 'lucide-react';
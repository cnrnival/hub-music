/**
 * Hub Music - TopBar
 * Barra superior: busca, menu do usuário, notificações
 * Top bar: search, user menu, notifications
 *
 * @languages pt-BR / en-US
 */

import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Moon,
  Settings,
  User,
  LogOut,
  Plus,
  Menu,
} from 'lucide-react';
import { Button } from '@/ui/button';
import { Avatar } from '@/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/ui/dropdown-menu';
import { useAuth } from '@/hooks/auth/useAuth';
import { SearchInput } from '@/components/search/SearchInput';

interface TopBarProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

export function TopBar({ onMenuClick, sidebarCollapsed }: TopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      navigate(`/search/${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-lg border-b border-border flex items-center px-4 lg:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden mr-2"
        onClick={onMenuClick}
        aria-label="Abrir menu"
      >
        <Menu className="w-6 h-6" />
      </Button>

      {/* Search */}
      <div className="relative flex-1 max-w-xl lg:max-w-2xl mx-4 lg:mx-8">
        <SearchInput
          onSubmit={handleSearchSubmit}
          placeholder="Buscar músicas, artistas, playlists..."
          showShortcuts={false}
          autoFocus={false}
        />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 lg:gap-4 ml-auto">
        {/* Create button */}
        <Button variant="primary" size="icon" className="hidden sm:flex" aria-label="Criar">
          <Plus className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
        </Button>

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" aria-label="Alternar tema">
          <Moon className="w-5 h-5" />
        </Button>

        {user ? (
          /* User menu */
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full overflow-hidden p-0" aria-label="Menu do usuário">
                <Avatar src={user.avatarUrl} name={user.displayName || user.username} size="md" className="w-full h-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2 border-b border-border">
                <p className="font-medium text-text-primary truncate">{user.displayName || user.username}</p>
                <p className="text-caption text-text-muted truncate">@{user.username}</p>
              </div>
              <DropdownMenuItem onClick={() => navigate(`/profile/${user.username}`)}>
                <User className="w-4 h-4 mr-2" /> Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" /> Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-error" onClick={() => logout()}>
                <LogOut className="w-4 h-4 mr-2" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          /* Auth buttons */
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Entrar
            </Button>
            <Button size="sm" onClick={() => navigate('/register')}>
              <Plus className="w-4 h-4 mr-2" />
              Criar conta
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
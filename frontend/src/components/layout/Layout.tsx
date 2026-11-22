/**
 * Hub Music - Layout Component
 * Layout principal com sidebar responsiva e drawer mobile
 * Main layout with responsive sidebar and mobile drawer
 * @languages pt-BR / en-US
 */

import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { PlayerBar } from '../player/PlayerBar';
import { cn } from '../../lib/utils';
import { Home, Search, Library, Plus, Settings, Heart, ListMusic, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fechar sidebar mobile ao mudar de rota
  useEffect(() => {
    if (window.innerWidth < 768) {
      setMobileMenuOpen(false);
    }
  }, [location]);

  const navigation = [
    { href: '/', label: 'Início', icon: Home },
    { href: '/search', label: 'Buscar', icon: Search },
    { href: '/library', label: 'Biblioteca', icon: Library }
  ];

  const userSection = [
    { href: '/library?tab=likes', label: 'Curtidas', icon: Heart },
    { href: '/library?tab=playlists', label: 'Playlists', icon: ListMusic },
    { href: '/settings', label: 'Configurações', icon: Settings }
  ];

  // Detectar se é mobile
  const isMobile = window.innerWidth < 768;

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      {/* Header - Visível em todas as telas */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 px-4 lg:px-6 flex items-center justify-between bg-background/95 backdrop-blur-md border-b border-border/50">
        {/* Botão menu mobile */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-background-tertiary transition-colors"
          aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Título / Logo */}
        <NavLink to="/" className="flex items-center gap-2 flex-1 max-w-[200px]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <span className="hidden sm:inline font-bold text-lg lg:text-xl tracking-tight">Hub Music</span>
        </NavLink>

        {/* Ações do header */}
        <div className="flex items-center gap-2 lg:gap-3">
          <button className="btn-icon p-2 hidden sm:flex" aria-label="Criar upload">
            <Plus className="w-4 h-4" />
          </button>
          <NavLink to="/upload" className="btn-primary px-4 py-2 text-sm font-medium hidden sm:flex">
            Criar
          </NavLink>
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="flex flex-col lg:flex-row pt-16">
        {/* Sidebar Desktop (sempre visível em desktop) */}
        <aside className="sidebar w-64 bg-background border-r border-border/50 flex flex-col hidden lg:flex">
          <div className="flex flex-col h-full">
            {/* Logo desktop */}
            <div className="p-4 border-b border-border/50">
              <NavLink to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
                <span className="font-bold text-lg">Hub Music</span>
              </NavLink>
            </div>

            {/* Navegação principal */}
            <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto" aria-label="Navegação principal">
              {navigation.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary hover:text-primary hover:bg-background-tertiary transition-all duration-200',
                    isActive && 'text-primary bg-primary/10 font-medium'
                  )}
                  aria-current={({ isActive }) => isActive ? 'page' : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Seção do usuário */}
            <div className="p-4 border-t border-border/50 space-y-0.5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Biblioteca</h3>
              {userSection.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-text-secondary hover:text-primary hover:bg-background-tertiary transition-all duration-200',
                    isActive && 'text-primary bg-primary/10'
                  )}
                  aria-current={({ isActive }) => isActive ? 'page' : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 min-w-0 p-4 lg:p-6">
          {/* Header mobile com título da página */}
          <header className="mb-6 hidden lg:hidden flex items-center justify-between">
            <h1 className="text-lg font-bold">{getPageTitle(location.pathname)}</h1>
          </header>

          {/* Conteúdo da página */}
          <div className="pb-safe-bottom">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Player Bar fixa no rodapé */}
      <PlayerBar />

      {/* Mobile Drawer / Menu lateral */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          ></div>

          {/* Drawer */}
          <aside
            className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-background border-r border-border/50 flex flex-col transform transition-transform duration-300 translate-x-0"
            aria-label="Menu mobile"
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
                <span className="font-bold text-lg">Hub Music</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-background-tertiary"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-4 space-y-1" aria-label="Navegação mobile">
              {navigation.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl text-text-secondary hover:text-primary hover:bg-background-tertiary transition-all',
                    isActive && 'text-primary bg-primary/10'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-base">{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto p-4 border-t border-border/50">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Biblioteca</h3>
              {userSection.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-text-secondary hover:text-primary hover:bg-background-tertiary transition-all',
                    isActive && 'text-primary bg-primary/10'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-base">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/': 'Início',
    '/search': 'Buscar',
    '/library': 'Biblioteca',
    '/upload': 'Upload',
    '/playlist': 'Playlists',
    '/settings': 'Configurações',
    '/login': 'Entrar',
    '/register': 'Cadastrar'
  };

  // Lidar com rotas dinâmicas (track/:id, playlist/:id, profile/:username)
  if (pathname.startsWith('/track/')) return 'Faixa';
  if (pathname.startsWith('/playlist/')) return 'Playlist';
  if (pathname.startsWith('/profile/')) return 'Perfil';

  return titles[pathname] || 'Hub Music';
}

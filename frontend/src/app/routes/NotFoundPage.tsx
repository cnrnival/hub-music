/**
 * Hub Music - NotFoundPage
 * Página 404 personalizada
 * Custom 404 page
 *
 * @languages pt-BR / en-US
 */

import { Link } from 'react-router-dom';
import { Music, Search, Home, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen bg-background items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Animated background */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary-dark/20 rounded-full blur-3xl opacity-50 animate-pulse" />
          <div className="relative w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center shadow-glow">
            <Music className="w-16 h-16 text-white/80" />
          </div>
        </div>

        {/* 404 Text */}
        <div className="mb-6">
          <span className="text-8xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            404
          </span>
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-3">
          Página não encontrada
        </h1>

        <p className="text-text-secondary mb-8 max-w-sm mx-auto">
          A página que você procura não existe ou foi movida.
          Que tal explorar algo novo?
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <Button variant="primary" size="lg" asChild className="gap-2">
            <Link to="/">
              <Home className="w-5 h-5" />
              Voltar ao início
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="gap-2">
            <Link to="/search">
              <Search className="w-5 h-5" />
              Buscar música
            </Link>
          </Button>
        </div>

        {/* Suggestions */}
        <Card className="text-left">
          <CardContent className="pt-6">
            <h3 className="font-medium text-text-primary mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              O que você pode fazer
            </h3>
            <ul className="space-y-3 text-text-secondary">
              <li className="flex items-center gap-3">
                <Music className="w-5 h-5 text-primary flex-shrink-0" />
                <Link to="/" className="hover:text-primary transition-colors">Explorar músicas em destaque</Link>
              </li>
              <li className="flex items-center gap-3">
                <Search className="w-5 h-5 text-primary flex-shrink-0" />
                <Link to="/search" className="hover:text-primary transition-colors">Buscar artistas, álbuns ou playlists</Link>
              </li>
              <li className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-primary flex-shrink-0" />
                <Link to="/library/recents" className="hover:text-primary transition-colors">Ver seu histórico recente</Link>
              </li>
              <li className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                <Link to="/library/tracks" className="hover:text-primary transition-colors">Descobrir novas músicas</Link>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-text-muted text-sm mt-8">
          Acha que isso é um erro?
          <Link to="/support" className="text-primary hover:underline ml-1">
            Entre em contato
          </Link>
        </p>
      </div>
    </div>
  );
}export default NotFoundPage;

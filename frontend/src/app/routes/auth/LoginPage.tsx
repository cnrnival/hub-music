/**
 * Hub Music - LoginPage
 * Página de login com validação e opções de OAuth
 * Login page with validation and OAuth options
 *
 * @languages pt-BR / en-US
 */

import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, Music, Sparkles, Users, LogIn } from 'lucide-react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/ui/card';
import { Separator } from '@/ui/separator';
import { useAuth } from '@/hooks/auth/useAuth';
import { cn } from '@/lib/utils';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { login } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Validation
  const isEmailValid = email.includes('@') && email.includes('.');
  const isFormValid = isEmailValid && password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid) {
      setError('Por favor, preencha todos os campos corretamente');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password, rememberMe);
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Email ou senha incorretos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: 'spotify' | 'apple' | 'google') => {
    // TODO: Implement OAuth flow
    console.log(`${provider} login clicked`);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-primary-dark/10 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] opacity-50" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        <div className="relative z-10 max-w-md text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow">
              <Music className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Hub Music
            </h1>
            <p className="text-xl text-text-secondary">
              Sua música, do seu jeito
            </p>
          </div>

          <div className="space-y-4 text-text-secondary max-w-sm mx-auto">
            <div className="flex items-center justify-center gap-3 p-4 bg-background/50 rounded-xl border border-border-primary">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-text-primary">Streaming ilimitado</p>
                <p className="text-sm">Músicas de múltiplas fontes gratuitas</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 bg-background/50 rounded-xl border border-border-primary">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Music className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-text-primary">Waveform & Letras</p>
                <p className="text-sm">Visualize e cante junto com letras sincronizadas</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 bg-background/50 rounded-xl border border-border-primary">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-text-primary">Comunidade</p>
                <p className="text-sm">Siga artistas, comente, compartilhe</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center mb-6">
              <CardTitle className="text-2xl">Entrar</CardTitle>
              <CardDescription>
                Acesse sua conta para continuar
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* OAuth Buttons */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <Button
                  variant="outline"
                  onClick={() => handleOAuthLogin('spotify')}
                  disabled={isLoading}
                  className="h-11 gap-1"
                  title="Continuar com Spotify"
                >
                  <Music className="w-5 h-5 text-green-400" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOAuthLogin('apple')}
                  disabled={isLoading}
                  className="h-11 gap-1"
                  title="Continuar com Apple"
                >
                  <Music className="w-5 h-5 text-purple-400" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOAuthLogin('google')}
                  disabled={isLoading}
                  className="h-11 gap-1"
                  title="Continuar com Google"
                >
                  <Mail className="w-5 h-5" />
                </Button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <Separator />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-text-muted text-sm">
                  ou
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg flex items-center gap-2 text-error text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="pl-10"
                      autoComplete="email"
                      disabled={isLoading}
                      aria-invalid={!!error}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-border-primary text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-text-secondary">Lembrar-me</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full gap-2"
                  disabled={isLoading || !isFormValid}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Entrar
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col items-center gap-4 pt-6">
              <p className="text-text-secondary text-sm">
                Não tem conta?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Criar conta grátis
                </Link>
              </p>

              <p className="text-text-muted text-xs text-center max-w-xs">
                Ao continuar, você concorda com nossos
                <Link to="/terms" className="text-primary hover:underline">Termos de Serviço</Link>
                e
                <Link to="/privacy" className="text-primary hover:underline">Política de Privacidade</Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
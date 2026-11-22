/**
 * Hub Music - RegisterPage
 * Página de registro com validação e opções de OAuth
 * Registration page with validation and OAuth options
 *
 * @languages pt-BR / en-US
 */

import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, Music, Sparkles, User, Shield } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../ui/card';
import { Separator } from '../../ui/separator';
import { useAuth } from '../../../hooks/auth/useAuth';
import { cn } from '../../../lib/utils';

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { register } = useAuth();

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Validation
  const isEmailValid = email.includes('@') && email.includes('.');
  const isUsernameValid = /^[a-zA-Z0-9_]{3,30}$/.test(username);
  const isDisplayNameValid = displayName.trim().length >= 2;
  const isPasswordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword;
  const isFormValid = isEmailValid && isUsernameValid && isDisplayNameValid && isPasswordValid && passwordsMatch && agreeTerms;

  // Password strength
  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength();
  const strengthLabels = ['Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte'];
  const strengthColors = ['bg-error', 'bg-error', 'bg-warning', 'bg-success', 'bg-primary'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid) {
      if (!isDisplayNameValid) setError('Nome de exibição deve ter pelo menos 2 caracteres');
      else if (!isUsernameValid) setError('Nome de usuário deve ter 3-30 caracteres (letras, números, underscore)');
      else if (!isEmailValid) setError('Email inválido');
      else if (!isPasswordValid) setError('Senha deve ter pelo menos 8 caracteres');
      else if (!passwordsMatch) setError('As senhas não coincidem');
      else if (!agreeTerms) setError('Você deve aceitar os termos de serviço');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        displayName: displayName.trim(),
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password,
      });
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthRegister = (provider: 'spotify' | 'apple' | 'google') => {
    // TODO: Implement OAuth flow
    console.log(`${provider} register clicked`);
  };

  const checkUsernameAvailability = async (value: string) => {
    if (value.length < 3) return;
    // TODO: Call API to check availability
    console.log('Checking username:', value);
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
              Junte-se à comunidade
            </p>
          </div>

          <div className="space-y-4 text-text-secondary max-w-sm mx-auto">
            <div className="flex items-center justify-center gap-3 p-4 bg-background/50 rounded-xl border border-border-primary">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-text-primary">100% Gratuito</p>
                <p className="text-sm">Sem assinatura, sem anúncios obrigatórios</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 bg-background/50 rounded-xl border border-border-primary">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-text-primary">Privacidade primeiro</p>
                <p className="text-sm">Seus dados pertencem a você</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 bg-background/50 rounded-xl border border-border-primary">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-text-primary">Open Source</p>
                <p className="text-sm">Código aberto, comunidade ativa</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center mb-6">
              <CardTitle className="text-2xl">Criar conta</CardTitle>
              <CardDescription>
                Comece a ouvir e compartilhar música hoje mesmo
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* OAuth Buttons */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <Button
                  variant="outline"
                  onClick={() => handleOAuthRegister('spotify')}
                  disabled={isLoading}
                  className="h-11 gap-1"
                  title="Cadastrar com Spotify"
                >
                  <Spotify className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOAuthRegister('apple')}
                  disabled={isLoading}
                  className="h-11 gap-1"
                  title="Cadastrar com Apple"
                >
                  <Apple className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOAuthRegister('google')}
                  disabled={isLoading}
                  className="h-11 gap-1"
                  title="Cadastrar com Google"
                >
                  <Mail className="w-5 h-5" />
                </Button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <Separator />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-text-muted text-sm">
                  ou cadastre-se com email
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg flex items-center gap-2 text-error text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Register Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="display-name">Nome de exibição</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <Input
                      id="display-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Seu nome"
                      className="pl-10"
                      autoComplete="name"
                      disabled={isLoading}
                      maxLength={50}
                    />
                  </div>
                  {!isDisplayNameValid && displayName && (
                    <p className="text-error text-sm mt-1">Mínimo 2 caracteres</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="username">Nome de usuário</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">@</span>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ''));
                      }}
                      placeholder="seuusuario"
                      className="pl-7"
                      autoComplete="username"
                      disabled={isLoading}
                      maxLength={30}
                      pattern="^[a-zA-Z0-9_]+$"
                    />
                  </div>
                  {!isUsernameValid && username && (
                    <p className="text-error text-sm mt-1">3-30 caracteres (letras, números, _)</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      placeholder="seu@email.com"
                      className="pl-10"
                      autoComplete="email"
                      disabled={isLoading}
                    />
                  </div>
                  {!isEmailValid && email && (
                    <p className="text-error text-sm mt-1">Email inválido</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      autoComplete="new-password"
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

                  {/* Password Strength */}
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 bg-background-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300 rounded-full"
                          style={{
                            width: `${(passwordStrength / 5) * 100}%`,
                            backgroundColor: strengthColors[passwordStrength - 1] || 'transparent',
                          }}
                        />
                      </div>
                      <p className="text-xs text-text-muted">
                        Força da senha: {strengthLabels[passwordStrength - 1] || 'Muito fraca'}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirmar senha</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      type="button"
                      aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </Button>
                  </div>
                  {!passwordsMatch && confirmPassword && (
                    <p className="text-error text-sm mt-1">As senhas não coincidem</p>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="agree-terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-border-primary text-primary focus:ring-primary"
                    required
                  />
                  <label htmlFor="agree-terms" className="text-sm text-text-secondary">
                    Concordo com os
                    <Link to="/terms" className="text-primary hover:underline">Termos de Serviço</Link>
                    e a
                    <Link to="/privacy" className="text-primary hover:underline">Política de Privacidade</Link>
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
                      Criando conta...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Criar conta grátis
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col items-center gap-4 pt-6">
              <p className="text-text-secondary text-sm">
                Já tem conta?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Entrar
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { Spotify, Apple, UserPlus, User } from 'lucide-react';
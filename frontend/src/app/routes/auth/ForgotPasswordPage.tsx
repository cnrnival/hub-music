/**
 * Hub Music - ForgotPasswordPage
 * Página de recuperação de senha
 * Forgot password page
 *
 * @languages pt-BR / en-US
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, Music, Sparkles, ArrowLeft, Send } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../ui/card';
import { useAuth } from '../../../hooks/auth/useAuth';
import { cn } from '../../../lib/utils';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  // State
  const [step, setStep] = useState<'email' | 'code' | 'reset' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  // Validation
  const isEmailValid = email.includes('@') && email.includes('.');
  const isCodeValid = code.length === 6;
  const isPasswordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword;

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

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isEmailValid) {
      setError('Por favor, insira um email válido');
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email);
      setSentEmail(email);
      setStep('code');
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar código. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isCodeValid) {
      setError('Por favor, insira o código de 6 dígitos');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call verify reset code API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep('reset');
    } catch (err: any) {
      setError(err.message || 'Código inválido ou expirado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }
    if (!passwordsMatch) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call reset password API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await forgotPassword(email);
      // Show toast
    } catch (err: any) {
      setError(err.message || 'Erro ao reenviar código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
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
              Recupere sua conta
            </p>
          </div>

          <div className="space-y-4 text-text-secondary max-w-sm mx-auto">
            <div className="flex items-center justify-center gap-3 p-4 bg-background/50 rounded-xl border border-border-primary">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-text-primary">Seguro e rápido</p>
                <p className="text-sm">Código enviado para seu email</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 bg-background/50 rounded-xl border border-border-primary">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-text-primary">Nova senha forte</p>
                <p className="text-sm">Crie uma senha que você não esqueça</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center mb-6">
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-0 -translate-y-1/2"
                onClick={() => {
                  if (step === 'email') handleBackToLogin();
                  else if (step === 'code') setStep('email');
                  else if (step === 'reset') setStep('code');
                }}
                aria-label="Voltar"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <CardTitle className="text-2xl">
                {step === 'email' && 'Esqueceu a senha?'}
                {step === 'code' && 'Verifique seu email'}
                {step === 'reset' && 'Nova senha'}
                {step === 'success' && 'Senha alterada!'}
              </CardTitle>
              <CardDescription>
                {step === 'email' && 'Insira seu email para receber um código de recuperação'}
                {step === 'code' && `Enviamos um código de 6 dígitos para <strong>${sentEmail}</strong>`}
                {step === 'reset' && 'Crie uma nova senha segura para sua conta'}
                {step === 'success' && 'Sua senha foi redefinida com sucesso'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg flex items-center gap-2 text-error text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Step: Email */}
              {step === 'email' && (
                <form onSubmit={handleSendCode} className="space-y-4">
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
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full gap-2"
                    disabled={isLoading || !isEmailValid}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar código
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Step: Code */}
              {step === 'code' && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div>
                    <Label htmlFor="code">Código de verificação</Label>
                    <div className="relative mt-1">
                      <Input
                        id="code"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="••••••"
                        className="text-center text-2xl tracking-widest"
                        autoComplete="one-time-code"
                        disabled={isLoading}
                        maxLength={6}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full gap-2"
                    disabled={isLoading || !isCodeValid}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      'Verificar código'
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResendCode}
                      disabled={isLoading}
                      className="text-text-secondary hover:text-primary"
                    >
                      Não recebeu? Reenviar código
                    </Button>
                  </div>
                </form>
              )}

              {/* Step: Reset Password */}
              {step === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="new-password">Nova senha</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                      <Input
                        id="new-password"
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
                          Força: {strengthLabels[passwordStrength - 1] || 'Muito fraca'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">Confirmar nova senha</Label>
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

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full gap-2"
                    disabled={isLoading || !isPasswordValid || !passwordsMatch}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Redefinindo...
                      </>
                    ) : (
                      'Redefinir senha'
                    )}
                  </Button>
                </form>
              )}

              {/* Step: Success */}
              {step === 'success' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">Senha alterada com sucesso!</h3>
                  <p className="text-text-secondary mb-6">
                    Sua nova senha já está ativa. Use-a para entrar na sua conta.
                  </p>
                  <Button variant="primary" className="w-full gap-2" onClick={handleBackToLogin}>
                    <LogIn className="w-4 h-4" />
                    Ir para login
                  </Button>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col items-center gap-4 pt-6">
              <p className="text-text-secondary text-sm">
                Lembrou a senha?{' '}
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

import { Shield, Lock, CheckCircle, LogIn, Send } from 'lucide-react';
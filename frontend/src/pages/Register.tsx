/**
 * Hub Music - Register Page
 * Página de cadastro: criação de nova conta de usuário
 * Register page: new user account creation
 * 
 * @languages pt-BR / en-US
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { getErrorMessage } from '../lib/utils';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useAuth } from '../hooks/useAuth';
import { Music, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const passwordRequirements = [
  { label: 'Pelo menos 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Uma letra minúscula', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Um número', test: (p: string) => /\d/.test(p) },
];

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: () => register(formData),
    onSuccess: () => {
      navigate('/', { replace: true });
    },
    onError: (err) => {
      setSubmitError(getErrorMessage(err));
    }
  });

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'username':
        if (!value) error = 'Nome de usuário é obrigatório';
        else if (value.length < 3) error = 'Mínimo 3 caracteres';
        else if (value.length > 50) error = 'Máximo 50 caracteres';
        else if (!/^[a-zA-Z0-9_]+$/.test(value)) error = 'Apenas letras, números e _';
        break;
      case 'email':
        if (!value) error = 'Email é obrigatório';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Email inválido';
        break;
      case 'password':
        if (!value) error = 'Senha é obrigatória';
        break;
      case 'confirmPassword':
        if (!value) error = 'Confirme sua senha';
        else if (value !== formData.password) error = 'As senhas não coincidem';
        break;
      case 'displayName':
        if (value.length > 100) error = 'Máximo 100 caracteres';
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate all fields
    let hasErrors = false;
    Object.keys(formData).forEach(key => {
      validateField(key, formData[key as keyof typeof formData]);
      if (errors[key]) hasErrors = true;
    });

    if (hasErrors) return;

    registerMutation.mutate();
  };

  const passwordStrength = passwordRequirements.filter(req => req.test(formData.password)).length;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <Music className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-2xl">Hub Music</span>
          </Link>
          <h1 className="text-heading-md font-bold">Criar conta</h1>
          <p className="text-text-secondary mt-1">Junte-se à comunidade de música independente</p>
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-xl text-error">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{submitError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome de usuário *"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="seuusuario"
            autoComplete="username"
            error={errors.username}
            disabled={registerMutation.isPending}
            icon={<User className="w-5 h-5" />}
          />

          <Input
            label="Nome de exibição"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="Seu nome (opcional)"
            autoComplete="name"
            error={errors.displayName}
            disabled={registerMutation.isPending}
            icon={<User className="w-5 h-5" />}
          />

          <Input
            label="Email *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            autoComplete="email"
            error={errors.email}
            disabled={registerMutation.isPending}
            icon={<Mail className="w-5 h-5" />}
          />

          <div className="relative">
            <Input
              label="Senha *"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.password}
              disabled={registerMutation.isPending}
              icon={<Lock className="w-5 h-5" />}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] text-text-muted hover:text-text-primary transition-colors"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Password Strength */}
          {formData.password && (
            <div className="space-y-2">
              <div className="h-1.5 bg-background-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-error via-warning to-success rounded-full transition-all duration-300"
                  style={{ width: `${(passwordStrength / passwordRequirements.length) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {passwordRequirements.map((req, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center gap-1.5',
                      req.test(formData.password) ? 'text-success' : 'text-text-muted'
                    )}
                  >
                    <CheckCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Input
            label="Confirmar senha *"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.confirmPassword}
            disabled={registerMutation.isPending}
            icon={<Lock className="w-5 h-5" />}
          />

          {/* Terms */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="terms" className="text-sm text-text-secondary">
              Concordo com os {' '}
              <Link to="/terms" className="text-primary hover:underline">Termos de Uso</Link>
              {' '}e {' '}
              <Link to="/privacy" className="text-primary hover:underline">Política de Privacidade</Link>
            </label>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-card text-text-muted">Já tem conta?</span>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <Button variant="ghost" className="w-full" onClick={() => navigate('/login')}>
            Entrar na sua conta
          </Button>
        </div>
      </Card>
    </div>
  );
}
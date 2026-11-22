/**
 * Hub Music - ErrorBoundary
 * Boundary para capturar erros de renderização
 * Boundary to catch rendering errors
 *
 * @languages pt-BR / en-US
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[300px] items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 pb-8 px-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-error" />
              </div>

              <h2 className="text-xl font-bold text-text-primary mb-2">
                Algo deu errado
              </h2>

              <p className="text-text-secondary mb-6">
                Ocorreu um erro inesperado. Nossa equipe já foi notificada.
              </p>

              {this.state.error && (
                <details className="text-left mb-4 p-3 bg-background-tertiary rounded-lg text-xs text-text-muted">
                  <summary className="cursor-pointer font-medium text-text-secondary mb-1">
                    Detalhes do erro
                  </summary>
                  <pre className="whitespace-pre-wrap font-mono">{this.state.error.message}</pre>
                </details>
              )}

              <div className="flex gap-3 justify-center">
                <Button variant="primary" onClick={this.handleRetry} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Tentar novamente
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="gap-2">
                  <Home className="w-4 h-4" />
                  Voltar ao início
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
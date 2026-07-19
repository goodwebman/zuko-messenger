'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { UIButton } from '../components';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  /**
   * Куда сообщить о пойманной ошибке (Sentry, лог, тост). По умолчанию —
   * `console.error`. Вынесено в проп, потому что kit не знает про окружение
   * потребителя: `process.env.NODE_ENV` здесь недоступен и завязка на него
   * привязала бы пакет к конкретному сборщику.
   */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Клиентский error boundary с кнопкой повтора. Ловит ошибки рендера потомков. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    const { onError } = this.props;
    if (onError) {
      onError(error, info);
      return;
    }
    console.error('ErrorBoundary:', error, info.componentStack);
  }

  private readonly reset = (): void => {
    this.setState({ hasError: false });
  };

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="text-cloud-text">Что-то пошло не так</p>
        <UIButton variant="outline" size="sm" onClick={this.reset}>
          Повторить
        </UIButton>
      </div>
    );
  }
}

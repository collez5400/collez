import React from 'react';
import { ErrorState } from './ErrorState';

type AppErrorBoundaryProps = {
  children: React.ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    const message =
      error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unexpected error';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown) {
    // Keep this lightweight; Crashlytics wiring comes later.
    console.error('AppErrorBoundary caught error:', error);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title="App crashed"
          message={this.state.message || 'Please try again.'}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}


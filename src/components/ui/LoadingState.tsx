import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = 'Chargement...' }: LoadingStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
    <p className="text-muted-foreground">{message}</p>
  </div>
);

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message = 'Une erreur est survenue.', onRetry }: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="rounded-full bg-destructive/10 p-4 mb-4">
      <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.068 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-foreground mb-1">Erreur</h3>
    <p className="text-muted-foreground mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-sm font-medium text-primary hover:underline"
      >
        Réessayer
      </button>
    )}
  </div>
);

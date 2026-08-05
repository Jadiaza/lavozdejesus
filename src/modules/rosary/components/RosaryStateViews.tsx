interface ErrorProps {
  message: string;
  offline?: boolean;
  onRetry?: () => void;
}

export const RosaryLoading = ({ label = "Cargando…" }: { label?: string }) => (
  <div className="space-y-3" role="status" aria-live="polite">
    <span className="sr-only">{label}</span>
    {[0, 1, 2].map((i) => (
      <div key={i} className="h-20 rounded-3xl bg-muted/60 animate-pulse" />
    ))}
  </div>
);

export const RosaryErrorState = ({ message, offline, onRetry }: ErrorProps) => (
  <div className="glass gold-border rounded-3xl p-5 text-center space-y-3">
    <p className="font-display text-xl">{offline ? "Sin conexión" : "No pudimos cargar el contenido"}</p>
    <p className="text-sm text-muted-foreground">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 rounded-full px-5 bg-gradient-gold text-navy-deep font-medium"
      >
        Intentar de nuevo
      </button>
    )}
  </div>
);

export const RosaryEmptyState = ({ message }: { message: string }) => (
  <div className="glass gold-border rounded-3xl p-5 text-center">
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);
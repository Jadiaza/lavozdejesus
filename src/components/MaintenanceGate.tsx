import { Wrench } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  getMaintenanceModule,
  useMaintenanceState,
} from "@/services/mantenimiento";

interface MaintenanceGateProps {
  children: React.ReactNode;
}

const MaintenanceGate = ({ children }: MaintenanceGateProps) => {
  const location = useLocation();
  const moduleName = getMaintenanceModule(location.pathname);
  const state = useMaintenanceState(moduleName);

  if (!moduleName || !state?.mantenimiento_activo) {
    return <>{children}</>;
  }

  const isGlobal = state.modo_mantenimiento_global;

  return (
    <main className="min-h-screen bg-background px-6 py-12 flex items-center justify-center">
      <section
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm"
        aria-live="polite"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
          <Wrench className="h-7 w-7" aria-hidden="true" />
        </div>

        <h1 className="font-serif text-2xl font-semibold text-foreground">
          {isGlobal ? "Aplicación en mantenimiento" : "Módulo en mantenimiento"}
        </h1>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {state.mensaje_mantenimiento ||
            (isGlobal ? "La aplicación se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde." : "Este módulo se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde.")}
        </p>

        <p className="mt-6 text-xs text-muted-foreground">
          La Voz de Jesús · Conecta tu espíritu
        </p>
      </section>
    </main>
  );
};

export default MaintenanceGate;

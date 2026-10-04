import { Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { getMaintenanceRouteTarget, useMaintenanceState } from "@/services/mantenimiento";

interface MaintenanceGateProps { children: ReactNode; }

const MaintenanceLoading = () => null;

const MaintenanceGate = ({ children }: MaintenanceGateProps) => {
  const location = useLocation();
  const routeTarget = getMaintenanceRouteTarget(location.pathname);
  const state = useMaintenanceState(routeTarget?.modulo ?? "inicio", routeTarget?.submodulo ?? null);

  // El mantenimiento se consulta en segundo plano. Nunca bloqueamos la navegación
  // esperando la API; esto evita que el cambio de ruta produzca una pantalla en blanco.
  if (!state) return <>{children}</>;

  const active = Boolean(state.mantenimiento_activo);
  if (!active) return <>{children}</>;

  const isGlobal = state.modo_mantenimiento_global;
  const isSubmodule = state.nivel_mantenimiento_activo === "submodulo";

  return (
    <main className="min-h-screen bg-background px-6 py-12 flex items-center justify-center">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm" aria-live="polite">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
          <Wrench className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          {isGlobal ? "Aplicación en mantenimiento" : isSubmodule ? "Submódulo en mantenimiento" : "Módulo en mantenimiento"}
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {state.mensaje_mantenimiento || "Este módulo se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde."}
        </p>
        <p className="mt-6 text-xs text-muted-foreground">La Voz de Jesús · Conecta tu espíritu</p>
      </section>
    </main>
  );
};

export default MaintenanceGate;

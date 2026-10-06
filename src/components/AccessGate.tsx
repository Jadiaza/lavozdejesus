import { useEffect, useState, type ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { lvjAuth } from "@/services/lvjAuth";
import { canAccessLevel, getAccessContext, type AccessContext } from "@/services/acceso";
import { getRouteAccessPolicy, getRouteTarget, loadAccessPolicy, type ModuleAccessLevel, type ModuleAccessPolicy } from "@/services/accessPolicy";
import { getConfiguracion } from "@/services/sheetsService";

type Props = { children: ReactNode };
const requiredToAccess = (required: ModuleAccessLevel) =>
  required === "guest" ? "guest" : "free";
const Loading = () => <div className="min-h-screen bg-background" aria-label="Cargando aplicación" />;
const MODULE_VISIBILITY_KEYS: Record<string, string> = {
  radio: "mostrar_radio",
  podcast: "mostrar_podcast",
  santoral: "mostrar_santoral",
  biblia: "mostrar_biblia",
  rosario: "mostrar_rosario",
  eventos: "mostrar_eventos",
};

const isModuleAvailable = (module: string, configuration: Record<string, string>) => {
  const key = MODULE_VISIBILITY_KEYS[module];
  if (!key || configuration[key] === undefined) return true;
  return !["false", "0", "no"].includes(configuration[key].trim().toLowerCase());
};

const ModuleUnavailable = () => (
  <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
    <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
      <h1 className="font-serif text-2xl font-semibold text-foreground">Módulo no disponible</h1>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        Este módulo está desactivado temporalmente.
      </p>
      <Link className="mt-6 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline" to="/">
        Volver al inicio
      </Link>
    </section>
  </main>
);

export default function AccessGate({ children }: Props) {
  const location = useLocation();
  const [policy, setPolicy] = useState<ModuleAccessPolicy[] | null>(null);
  const [configuration, setConfiguration] = useState<Record<string, string> | null>(null);
  const [context, setContext] = useState<AccessContext | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let alive = true;
    let requestId = 0;
    let authEventVersion = 0;

    const resolveSession = async (session: { access_token: string } | null, blockWhileResolving = false) => {
      const current = ++requestId;
      if (blockWhileResolving) setResolved(false);

      if (!session?.access_token) {
        if (!alive || current !== requestId) return;
        setContext(null);
        setResolved(true);
        return;
      }

      try {
        const next = await getAccessContext(session.access_token);
        if (!alive || current !== requestId) return;
        setContext(next);
        setResolved(true);
      } catch {
        if (!alive || current !== requestId) return;
        setContext(null);
        setResolved(true);
      }
    };

    const initialize = async () => {
      const initialAuthEventVersion = authEventVersion;
      const [session, loadedPolicy, loadedConfiguration] = await Promise.all([
        lvjAuth.auth.getSession().then(({ data }) => data.session).catch(() => null),
        loadAccessPolicy(),
        getConfiguracion(),
      ]);
      if (!alive) return;
      setPolicy(loadedPolicy);
      setConfiguration(loadedConfiguration);
      if (initialAuthEventVersion === authEventVersion) {
        await resolveSession(
          session ? { access_token: session.access_token } : null,
          true,
        );
      }
    };

    void initialize();

    const { data: listener } = lvjAuth.auth.onAuthStateChange((event, session) => {
      if (!["SIGNED_IN", "SIGNED_OUT", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)) return;
      if (!alive) return;
      authEventVersion += 1;

      if (event === "SIGNED_OUT") {
        requestId += 1;
        setContext(null);
        setResolved(true);
        return;
      }

      // El refresh del token no debe desmontar visualmente la aplicación.
      // Revalidamos en segundo plano y conservamos el contexto anterior mientras tanto.
      void resolveSession(
        session ? { access_token: session.access_token } : null,
        event === "SIGNED_IN" || event === "USER_UPDATED",
      );
    });

    return () => {
      alive = false;
      requestId += 1;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!resolved || !policy || !configuration) return <Loading />;

  const target = getRouteTarget(location.pathname);
  const required = getRouteAccessPolicy(location.pathname, policy);

  // Las rutas informativas que no pertenecen a un módulo funcional son públicas.
  if (!target) return <>{children}</>;

  if (!isModuleAvailable(target.module, configuration)) return <ModuleUnavailable />;

  // Una ruta funcional sin política válida NO puede quedar pública por omisión.
  if (required === null) return <Loading />;

  if (required !== "guest") {
    if (!context) {
      const destination = location.pathname + location.search + location.hash;
      return <Navigate replace to={"/acceso?next=" + encodeURIComponent(destination)} />;
    }

    if (!canAccessLevel(context, requiredToAccess(required))) {
      const destination = location.pathname + location.search + location.hash;
      return <Navigate replace to={"/acceso?next=" + encodeURIComponent(destination)} />;
    }
  }

  return <>{children}</>;
}

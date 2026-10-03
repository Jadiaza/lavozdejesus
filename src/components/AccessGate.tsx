import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { lvjAuth } from "@/features/biblia/auth/bibleStudyAuth";
import { canAccessLevel, getAccessContext, type AccessContext } from "@/services/acceso";
import { getRouteAccessPolicy, loadAccessPolicy, type ModuleAccessLevel, type ModuleAccessPolicy } from "@/services/accessPolicy";

type Props = { children: ReactNode };
const requiredToAccess = (required: ModuleAccessLevel) =>
  required === "premium" ? "premium" : required === "free" ? "free" : "guest";
const Loading = () => <div className="min-h-screen bg-background" aria-label="Cargando aplicación" />;

export default function AccessGate({ children }: Props) {
  const location = useLocation();
  const [policy, setPolicy] = useState<ModuleAccessPolicy[] | null>(null);
  const [context, setContext] = useState<AccessContext | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let alive = true;
    let requestId = 0;

    const resolveSession = async (session: { access_token: string } | null, initial = false) => {
      const current = ++requestId;
      if (!initial) setResolved(false);

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
      try {
        const [{ data }, loadedPolicy] = await Promise.all([
          lvjAuth.auth.getSession(),
          loadAccessPolicy(),
        ]);
        if (!alive) return;
        setPolicy(loadedPolicy);
        await resolveSession(
          data.session ? { access_token: data.session.access_token } : null,
          true,
        );
      } catch {
        if (!alive) return;
        // Fail closed: sin política válida nunca se renderiza una ruta protegida.
        setPolicy([]);
        setContext(null);
        setResolved(true);
      }
    };

    void initialize();

    const { data: listener } = lvjAuth.auth.onAuthStateChange((event, session) => {
      if (!["SIGNED_IN", "SIGNED_OUT", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)) return;
      if (!alive) return;
      void resolveSession(session ? { access_token: session.access_token } : null);
    });

    return () => {
      alive = false;
      requestId += 1;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!resolved || !policy) return <Loading />;

  const required = getRouteAccessPolicy(location.pathname, policy);
  if (required === null) {
    // Las rutas no registradas en la matriz no se consideran protegidas.
    // Las nuevas rutas deben registrarse explícitamente en accessPolicy.php.
    return <>{children}</>;
  }

  if (required !== "guest") {
    if (!context) return <Loading />;

    if (!canAccessLevel(context, requiredToAccess(required))) {
      const destination = location.pathname + location.search + location.hash;
      return <Navigate replace to={"/acceso?next=" + encodeURIComponent(destination)} />;
    }
  }

  return <>{children}</>;
}

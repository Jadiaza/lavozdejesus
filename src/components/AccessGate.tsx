import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { lvjAuth } from "@/features/biblia/auth/bibleStudyAuth";
import { canAccessLevel, getAccessContext, type AccessContext } from "@/services/acceso";
import { getRouteAccessPolicy, loadAccessPolicy, type ModuleAccessLevel, type ModuleAccessPolicy } from "@/services/accessPolicy";

type Props = { children: ReactNode };

const requiredToAccess = (required: ModuleAccessLevel) =>
  required === "premium" ? "premium" : required === "free" ? "free" : "guest";

const AccessLoading = () => (
  <div className="min-h-screen bg-background" aria-label="Cargando acceso" />
);

export default function AccessGate({ children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const [policy, setPolicy] = useState<ModuleAccessPolicy[] | null>(null);
  const [context, setContext] = useState<AccessContext | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        // La política de MySQL y la sesión se resuelven antes del primer
        // render de las rutas. Así no se muestra una decisión provisional.
        const [{ data }, loadedPolicy] = await Promise.all([
          lvjAuth.auth.getSession(),
          loadAccessPolicy(),
        ]);

        if (!active) return;

        setPolicy(loadedPolicy);

        if (data.session?.access_token) {
          try {
            const access = await getAccessContext(data.session.access_token);
            if (active) setContext(access);
          } catch {
            if (active) setContext(null);
          }
        } else {
          setContext(null);
        }

        if (active) setResolved(true);
      } catch {
        if (!active) return;
        setPolicy([]);
        setContext(null);
        setResolved(true);
      }
    };

    void initialize();

    const { data: listener } = lvjAuth.auth.onAuthStateChange((event, session) => {
      if (
        event !== "SIGNED_IN" &&
        event !== "SIGNED_OUT" &&
        event !== "TOKEN_REFRESHED" &&
        event !== "USER_UPDATED"
      ) {
        return;
      }

      if (!active) return;

      if (!session?.access_token) {
        setContext(null);
        setResolved(true);
        return;
      }

      void getAccessContext(session.access_token)
        .then((access) => {
          if (active) {
            setContext(access);
            setResolved(true);
          }
        })
        .catch(() => {
          if (active) {
            setContext(null);
            setResolved(true);
          }
        });
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!resolved || !policy) {
    return <AccessLoading />;
  }

  const required = getRouteAccessPolicy(location.pathname, policy);
  const protectedRoute = required !== "guest";

  return (
    <AccessDecision
      required={required}
      context={context}
      protectedRoute={protectedRoute}
      location={location}
      navigate={navigate}
    >
      {children}
    </AccessDecision>
  );
}

function AccessDecision({
  required,
  context,
  protectedRoute,
  location,
  navigate,
  children,
}: {
  required: ModuleAccessLevel;
  context: AccessContext | null;
  protectedRoute: boolean;
  location: ReturnType<typeof useLocation>;
  navigate: ReturnType<typeof useNavigate>;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!protectedRoute) return;

    if (!canAccessLevel(context, requiredToAccess(required))) {
      const destination = location.pathname + location.search + location.hash;
      navigate("/acceso?next=" + encodeURIComponent(destination), { replace: true });
    }
  }, [
    context,
    required,
    protectedRoute,
    location.pathname,
    location.search,
    location.hash,
    navigate,
  ]);

  // Nunca renderizamos una ruta protegida mientras la decisión de acceso
  // esté pendiente de ejecutarse.
  if (protectedRoute && !context) {
    return <AccessLoading />;
  }

  if (protectedRoute && !canAccessLevel(context, requiredToAccess(required))) {
    return <AccessLoading />;
  }

  return <>{children}</>;
}

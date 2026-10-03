import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { lvjAuth } from "@/features/biblia/auth/bibleStudyAuth";
import { canAccessLevel, getAccessContext, type AccessContext } from "@/services/acceso";
import { getRouteAccessPolicy, loadAccessPolicy, type ModuleAccessLevel } from "@/services/accessPolicy";

type Props = { children: ReactNode };

const requiredToAccess = (required: ModuleAccessLevel) =>
  required === "premium" ? "premium" : required === "free" ? "free" : "guest";

const AccessLoading = () => (
  <div className="min-h-screen bg-background" aria-label="Cargando acceso" />
);

export default function AccessGate({ children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [context, setContext] = useState<AccessContext | null>(null);
  const [sessionResolved, setSessionResolved] = useState(false);
  const [policy, setPolicy] = useState<any>(null);
  const [policyReady, setPolicyReady] = useState(false);

  useEffect(() => {
    let active = true;

    const validateSession = async () => {
      try {
        const { data } = await lvjAuth.auth.getSession();

        if (!active) return;

        if (!data.session?.access_token) {
          setContext(null);
          setSessionResolved(true);
          return;
        }

        const access = await getAccessContext(data.session.access_token);

        if (active) {
          setContext(access);
          setSessionResolved(true);
        }
      } catch {
        if (active) {
          setContext(null);
          setSessionResolved(true);
        }
      }
    };

    if (!policyReady) {
      setSessionResolved(false);

      void loadAccessPolicy().then((loaded) => {
        if (!active) return;
        setPolicy(loaded);
        setPolicyReady(true);
        void validateSession();
      });

      return () => {
        active = false;
      };
    }

    void validateSession();

    const { data: listener } = lvjAuth.auth.onAuthStateChange((event) => {
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        setSessionResolved(false);
        void validateSession();
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [policyReady]);

  // Mientras la política real de MySQL no ha llegado, NO usamos el fallback
  // para decidir que una ruta es protegida. Esto evita que una ruta pública
  // aparezca y desaparezca durante la primera carga.
  if (!policyReady) {
    return <AccessLoading />;
  }

  const required = getRouteAccessPolicy(location.pathname, policy);
  const protectedRoute = required !== "guest";

  useEffect(() => {
    // El efecto de redirección se mantiene abajo mediante un componente
    // interno para respetar las reglas de hooks.
  }, []);

  if (protectedRoute && !sessionResolved) {
    return <AccessLoading />;
  }

  return <AccessDecision
    required={required}
    context={context}
    protectedRoute={protectedRoute}
    location={location}
    navigate={navigate}
  >
    {children}
  </AccessDecision>;
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

  return <>{children}</>;
}

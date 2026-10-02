import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { lvjAuth } from "@/features/biblia/auth/bibleStudyAuth";
import { canAccessLevel, getAccessContext, type AccessContext } from "@/services/acceso";
import { getRouteAccessPolicy, type ModuleAccessLevel } from "@/services/accessPolicy";

type Props = { children: ReactNode };

const requiredToAccess = (required: ModuleAccessLevel) =>
  required === "premium" ? "premium" : required === "free" ? "free" : "guest";

export default function AccessGate({ children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [context, setContext] = useState<AccessContext | null>(null);
  const [checking, setChecking] = useState(true);
  const initialCheck = useRef(true);

  const required = getRouteAccessPolicy(location.pathname);

  useEffect(() => {
    let active = true;

    const validate = async (showLoading = initialCheck.current) => {
      if (showLoading) setChecking(true);
      try {
        const { data } = await lvjAuth.auth.getSession();
        if (!active) return;

        if (!data.session?.access_token) {
          setContext(null);
          return;
        }

        const access = await getAccessContext(data.session.access_token);
        if (active) setContext(access);
      } catch {
        if (active) setContext(null);
      } finally {
        if (active) setChecking(false);
      }
    };

    void validate(initialCheck.current);
    initialCheck.current = false;

    const { data: listener } = lvjAuth.auth.onAuthStateChange((event) => {
      // Evita desmontar visualmente el módulo en cada cambio de sesión.
      // El contexto actual se conserva mientras se valida nuevamente.
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        void validate(false);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [location.pathname]);

  useEffect(() => {
    if (checking || required === "guest") return;

    if (!canAccessLevel(context, requiredToAccess(required))) {
      const destination = `${location.pathname}${location.search}${location.hash}`;
      navigate(`/acceso?next=${encodeURIComponent(destination)}`, { replace: true });
    }
  }, [checking, context, required, location.pathname, location.search, location.hash, navigate]);

  // La validación de acceso se realiza en segundo plano para evitar
  // desmontar visualmente el módulo y provocar parpadeos al entrar.
  return <>{children}</>;
}

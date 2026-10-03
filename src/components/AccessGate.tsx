import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { lvjAuth } from "@/features/biblia/auth/bibleStudyAuth";
import { canAccessLevel, getAccessContext, type AccessContext } from "@/services/acceso";
import { getRouteAccessPolicy, loadAccessPolicy, type ModuleAccessLevel } from "@/services/accessPolicy";

type Props = { children: ReactNode };

const requiredToAccess = (required: ModuleAccessLevel) =>
  required === "premium" ? "premium" : required === "free" ? "free" : "guest";

export default function AccessGate({ children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [context, setContext] = useState<AccessContext | null>(null);
  const [resolved, setResolved] = useState(true);
  const [policy, setPolicy] = useState<any>(null);
  const [policyReady, setPolicyReady] = useState(false);
  const required = getRouteAccessPolicy(location.pathname, policy);

  useEffect(() => {
    let active = true;

    const validate = async () => {
      try {
        const { data } = await lvjAuth.auth.getSession();

        if (!active) return;

        if (!data.session?.access_token) {
          setContext(null);
          setResolved(true);
          return;
        }

        const access = await getAccessContext(data.session.access_token);

        if (active) {
          setContext(access);
          setResolved(true);
        }
      } catch {
        if (active) {
          setContext(null);
          setResolved(true);
        }
      }
    };

    if (!policyReady) {
      setResolved(false);
      void loadAccessPolicy().then((loaded) => { if (active) { setPolicy(loaded); setPolicyReady(true); } });
      return () => { active = false; };
    }

    // Las rutas públicas no deben bloquearse ni validar acceso.
    if (required === "guest") {
      setResolved(true);
    } else {
      // En una ruta protegida no se decide nada hasta terminar la validación.
      setResolved(false);
      void validate();
    }

    const { data: listener } = lvjAuth.auth.onAuthStateChange((event) => {
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        if (required !== "guest") {
          setResolved(false);
          void validate();
        }
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [required, policyReady]);

  useEffect(() => {
    if (required === "guest" || !resolved) return;

    if (!canAccessLevel(context, requiredToAccess(required))) {
      const destination = location.pathname + location.search + location.hash;
      navigate("/acceso?next=" + encodeURIComponent(destination), { replace: true });
    }
  }, [
    context,
    required,
    resolved,
    location.pathname,
    location.search,
    location.hash,
    navigate,
  ]);

  // Las rutas protegidas no se renderizan mientras se valida la sesión y el registro
  // local. Así evitamos que Biblia/Podcast aparezcan brevemente antes del redirect.
  if (required !== "guest" && !resolved) return null;

  return <>{children}</>;
}

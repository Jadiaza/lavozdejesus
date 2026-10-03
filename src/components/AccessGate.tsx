import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { lvjAuth } from "@/features/biblia/auth/bibleStudyAuth";
import { canAccessLevel, getAccessContext, type AccessContext } from "@/services/acceso";
import { getRouteAccessPolicy, loadAccessPolicy, type ModuleAccessLevel } from "@/services/accessPolicy";

type Props = { children: ReactNode };

const requiredToAccess = (required: ModuleAccessLevel) =>
  required === "premium" ? "premium" : required === "free" ? "free" : "guest";

/**
 * Control global de acceso.
 *
 * Fuente de verdad:
 * 1. Supabase determina si existe una sesión.
 * 2. acceso.php valida el usuario contra lvj_com_usuarios y su rol.
 * 3. acceso-politica.php entrega los niveles configurados en MySQL.
 * 4. La ruta actual se compara contra esa política.
 *
 * Las rutas públicas no se bloquean mientras se valida una sesión existente,
 * pero la sesión sí se comprueba al entrar a la aplicación y ante cambios de auth.
 */
export default function AccessGate({ children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [context, setContext] = useState<AccessContext | null>(null);
  const [sessionResolved, setSessionResolved] = useState(false);
  const [policy, setPolicy] = useState<any>(null);
  const [policyReady, setPolicyReady] = useState(false);

  const required = getRouteAccessPolicy(location.pathname, policy);
  const protectedRoute = required !== "guest";

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
      });

      return () => {
        active = false;
      };
    }

    // Se valida la sesión también en rutas públicas.
    // La validación no bloquea una ruta pública, pero mantiene actualizado
    // el contexto del usuario para las siguientes rutas protegidas.
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

  useEffect(() => {
    if (!protectedRoute || !sessionResolved) return;

    if (!canAccessLevel(context, requiredToAccess(required))) {
      const destination = location.pathname + location.search + location.hash;
      navigate("/acceso?next=" + encodeURIComponent(destination), { replace: true });
    }
  }, [
    context,
    required,
    protectedRoute,
    sessionResolved,
    location.pathname,
    location.search,
    location.hash,
    navigate,
  ]);

  // Solamente las rutas protegidas esperan a terminar la validación.
  // Las rutas públicas permanecen visibles y no parpadean.
  if (protectedRoute && (!policyReady || !sessionResolved)) return null;

  return <>{children}</>;
}

import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { lvjAuth } from "@/features/biblia/auth/bibleStudyAuth";
import { canAccessLevel, getAccessContext, type AccessContext } from "@/services/acceso";
import { getRouteAccessPolicy, loadAccessPolicy, type ModuleAccessLevel, type ModuleAccessPolicy } from "@/services/accessPolicy";

type Props = { children: ReactNode };
type BootstrapState = "loading" | "ready";
const requiredToAccess = (required: ModuleAccessLevel) => required === "premium" ? "premium" : required === "free" ? "free" : "guest";
const Loading = () => <div className="min-h-screen bg-background" aria-label="Cargando aplicación" />;

export default function AccessGate({ children }: Props) {
  const location = useLocation();
  const [state, setState] = useState<BootstrapState>("loading");
  const [policy, setPolicy] = useState<ModuleAccessPolicy[] | null>(null);
  const [context, setContext] = useState<AccessContext | null>(null);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    let alive = true;
    let requestGeneration = generation + 1;
    let accessRequest = 0;

    const resolve = async (session: { access_token: string } | null, initial = false) => {
      const requestId = ++accessRequest;
      if (!initial) setState("loading");

      if (!session?.access_token) {
        if (!alive || requestId !== accessRequest) return;
        setContext(null);
        setState("ready");
        return;
      }

      try {
        const next = await getAccessContext(session.access_token);
        if (!alive || requestId !== accessRequest) return;
        setContext(next);
        setState("ready");
      } catch {
        if (!alive || requestId !== accessRequest) return;
        setContext(null);
        setState("ready");
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
        await resolve(data.session ? { access_token: data.session.access_token } : null, true);
      } catch {
        if (!alive) return;
        setPolicy(null);
        setContext(null);
        setState("ready");
      }
    };

    void initialize();

    const { data: listener } = lvjAuth.auth.onAuthStateChange((event, session) => {
      if (!["SIGNED_IN", "SIGNED_OUT", "TOKEN_REFRESHED", "USER_UPDATED"].includes(event)) return;
      if (!alive) return;
      void resolve(session ? { access_token: session.access_token } : null);
    });

    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (state === "loading" || !policy) return <Loading />;

  const required = getRouteAccessPolicy(location.pathname, policy);
  if (required !== "guest") {
    if (!context) return <Loading />;
    if (!canAccessLevel(context, requiredToAccess(required))) {
      const destination = location.pathname + location.search + location.hash;
      return <Navigate replace to={"/acceso?next=" + encodeURIComponent(destination)} />;
    }
  }

  return <>{children}</>;
}

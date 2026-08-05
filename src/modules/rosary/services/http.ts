/** Base de las APIs PHP. Configurable por entorno; sin secretos. */
export const API_BASE = (import.meta.env.VITE_LVJ_API_BASE as string | undefined) ?? "/api";

export class ApiError extends Error {
  offline: boolean;
  constructor(message: string, offline = false) {
    super(message);
    this.name = "ApiError";
    this.offline = offline;
  }
}

export interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  method?: "GET" | "POST";
  body?: unknown;
}

/** GET/POST tipado con timeout y AbortController. Nunca se usa en componentes. */
export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { signal, timeoutMs = 8000, method = "GET", body } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
    throw new ApiError("Sin conexión a internet", true);
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      signal: controller.signal,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
    });
    if (!res.ok) throw new ApiError(`Error ${res.status} al consultar el servidor`);
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    throw new ApiError(
      err instanceof Error && err.name === "AbortError"
        ? "La consulta tardó demasiado"
        : "No se pudo conectar con el servidor",
      offline,
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

/** Solo https (o rutas relativas). Bloquea javascript:, data: y http inseguro. */
export const isSafeMediaUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  if (url.startsWith("/")) return true;
  try {
    const u = new URL(url, "https://localhost");
    return u.protocol === "https:";
  } catch {
    return false;
  }
};
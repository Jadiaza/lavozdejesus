import { bibleStudyAuth } from "@/features/biblia/auth/bibleStudyAuth";

export interface BibleStudy {
  id: number; referencia: string; titulo: string; estado: string; revisado: boolean; es_publico: boolean;
  metodo: StudyMethod | "metodo_no_determinado"; modelo_referencia?: string | null; tecnica_estructural?: "arcing" | null;
  nivel: StudyLevel; idioma: string; esquema_version: string;
  libro_codigo?: string; capitulo_inicio?: number; versiculo_inicio?: number; capitulo_fin?: number; versiculo_fin?: number;
  contenido: Record<string, unknown>; created_at?: string | null; updated_at?: string | null; viewed_at?: string | null;
}
export type StudyLevel = "pastoral" | "teologico" | "doctrinal" | "formativo";
export type StudyMethod = "metodo_salmo" | "integral_lvj";
export type RecentBibleStudy = BibleStudy;
interface BibleStudyGenerationStatus {
  state: "not_found" | "processing" | "completed" | "failed";
  study?: BibleStudy;
  study_id?: number;
  generation_id?: number;
  message?: string;
}
interface StudyResponse { success: boolean; source?: "cache" | "generated" | "processing"; study?: BibleStudy; study_id?: number; generation_id?: number; studies?: BibleStudy[]; generation?: BibleStudyGenerationStatus; configured?: boolean; ready?: boolean; message?: string; error_id?: string; }

export interface BibleStudyRequest {
  libro_codigo: string; capitulo_inicio: number; versiculo_inicio: number;
  capitulo_fin: number; versiculo_fin: number; nivel: StudyLevel;
}

const GENERATION_INTERRUPTED = "BIBLE_STUDY_GENERATION_INTERRUPTED";

class BibleStudyGenerationInterruptedError extends Error {
  constructor(readonly studyId?: number, readonly generationId?: number) {
    super(GENERATION_INTERRUPTED);
    this.name = "BibleStudyGenerationInterruptedError";
  }
}

class BibleStudyApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "BibleStudyApiError";
  }
}

const baseUrl = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://lavozdejesus.co").trim().replace(/\/+$/, "");
const apiUrl = (import.meta.env.VITE_BIBLE_STUDY_API_URL as string | undefined)?.trim() || `${baseUrl}/api/biblia-estudios.php`;
async function token(forceRefresh = false): Promise<string | null> {
  if (forceRefresh) {
    const { data, error } = await bibleStudyAuth.auth.refreshSession();
    if (error) return null;
    return data.session?.access_token ?? null;
  }
  const { data } = await bibleStudyAuth.auth.getSession(); return data.session?.access_token ?? null;
}
function authHeaders(accessToken: string): Record<string, string> {
  const bearer = `Bearer ${accessToken}`;
  return { Authorization: bearer, "X-LVJ-Authorization": bearer };
}
async function authenticatedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let accessToken = await token();
  if (!accessToken) throw new Error("AUTH_REQUIRED");
  const request = (value: string) => fetchWithNetworkRetry(input, {
    ...init,
    headers: { ...Object.fromEntries(new Headers(init?.headers).entries()), ...authHeaders(value) },
  });
  let response = await request(accessToken);
  if (response.status !== 401) return response;
  accessToken = await token(true);
  if (!accessToken) throw new Error("AUTH_REQUIRED");
  response = await request(accessToken);
  return response;
}
async function fetchWithNetworkRetry(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let lastError: unknown;
  const method = (init?.method ?? "GET").toUpperCase();
  const maxAttempts = method === "GET" || method === "HEAD" ? 2 : 1;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await fetch(input, init);
    } catch (error) {
      lastError = error;
      if (attempt + 1 < maxAttempts) await new Promise(resolve => window.setTimeout(resolve, 800));
    }
  }
  void lastError;
  throw new Error(method === "POST"
    ? GENERATION_INTERRUPTED
    : "No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.");
}

export function isRecoverableBibleStudyStatus(status: number): boolean {
  return [409, 500, 502, 503, 504, 522, 524].includes(status);
}

export function isInterruptedBibleStudyGeneration(error: unknown): boolean {
  return error instanceof Error && (
    error.message === GENERATION_INTERRUPTED
    || (error instanceof BibleStudyApiError
      && isRecoverableBibleStudyStatus(error.status))
  );
}

export function matchesBibleStudyRequest(study: BibleStudy, input: BibleStudyRequest): boolean {
  return study.libro_codigo?.toUpperCase() === input.libro_codigo.toUpperCase()
    && study.capitulo_inicio === input.capitulo_inicio
    && study.versiculo_inicio === input.versiculo_inicio
    && study.capitulo_fin === input.capitulo_fin
    && study.versiculo_fin === input.versiculo_fin
    && study.nivel === input.nivel
    && study.estado !== "error"
    && Object.keys(study.contenido ?? {}).length > 0;
}

const wait = (milliseconds: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
  const timer = window.setTimeout(resolve, milliseconds);
  signal?.addEventListener("abort", () => {
    window.clearTimeout(timer);
    reject(new DOMException("Operación cancelada", "AbortError"));
  }, { once: true });
});

export async function recoverGeneratedBibleStudy(
  input: BibleStudyRequest,
  options: { signal?: AbortSignal; attempts?: number; intervalMs?: number; studyId?: number; generationId?: number } = {},
): Promise<BibleStudy | null> {
  const attempts = Math.max(1, options.attempts ?? 60);
  const intervalMs = Math.max(1_000, options.intervalMs ?? 10_000);
  let consecutiveFailedChecks = 0;
  let consecutiveNotFoundChecks = 0;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (options.signal?.aborted) throw new DOMException("Operación cancelada", "AbortError");
    if (attempt > 0) await wait(intervalMs, options.signal);
    const studies = await getRecentBibleStudies().catch(() => []);
    const recovered = studies.find(study => matchesBibleStudyRequest(study, input));
    if (recovered) return recovered;
    const generation = await getBibleStudyGenerationStatus(input, {
      studyId: options.studyId,
      generationId: options.generationId,
    }).catch(() => null);
    if (generation?.state === "completed" && generation.study) return generation.study;
    if (generation?.state === "failed") {
      // Al comenzar una regeneración puede aparecer fugazmente el registro
      // fallido anterior, mientras la nueva solicitud todavía no ha quedado
      // asociada a su estudio. Confirmar el fallo evita mostrar un error justo
      // antes de que el nuevo resultado termine y quede disponible.
      consecutiveFailedChecks += 1;
      if (consecutiveFailedChecks >= 3) {
        throw new Error(generation.message || "La generación no pudo completarse. Puedes intentarlo nuevamente.");
      }
      continue;
    }
    if (generation?.state === "not_found") {
      consecutiveNotFoundChecks += 1;
      if (consecutiveNotFoundChecks >= 3) {
        throw new Error("El servidor no llegó a registrar la generación. Ya puedes intentarlo nuevamente.");
      }
      continue;
    }
    consecutiveFailedChecks = 0;
    consecutiveNotFoundChecks = 0;
  }
  return null;
}
async function parse(response: Response): Promise<StudyResponse> {
  const payload = (await response.json().catch(() => null)) as StudyResponse | null;
  if (!response.ok || !payload?.success) {
    const message = payload?.message || "No fue posible generar el estudio en este momento.";
    const trace = payload?.error_id ? ` Código de seguimiento: ${payload.error_id}.` : "";
    throw new BibleStudyApiError(message + trace, response.status);
  }
  return payload;
}
export async function getStudyStatus() { return parse(await fetchWithNetworkRetry(apiUrl, { headers: { Accept: "application/json" } })); }
export async function getRecentBibleStudies() {
  const url = new URL(apiUrl, window.location.origin);
  url.searchParams.set("recent", "1");
  const payload = await parse(await authenticatedFetch(url, { headers: { Accept: "application/json" } }));
  return payload.studies ?? [];
}
export async function getBibleStudyGenerationStatus(
  input: BibleStudyRequest,
  reference: { studyId?: number; generationId?: number } = {},
): Promise<BibleStudyGenerationStatus> {
  const url = new URL(apiUrl, window.location.origin);
  url.searchParams.set("generation_status", "1");
  Object.entries(input).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  if (reference.studyId && reference.generationId) {
    url.searchParams.set("study_id", String(reference.studyId));
    url.searchParams.set("generation_id", String(reference.generationId));
  }
  const payload = await parse(await authenticatedFetch(url, { headers: { Accept: "application/json" } }));
  return payload.generation ?? { state: "not_found" };
}
export async function getBibleStudy(id: number) {
  const accessToken = await token(); const url = new URL(apiUrl, window.location.origin); url.searchParams.set("id", String(id));
  const payload = await parse(await fetchWithNetworkRetry(url, { headers: { Accept: "application/json", ...(accessToken ? authHeaders(accessToken) : {}) } }));
  if (!payload.study) throw new Error("El estudio no está disponible."); return payload.study;
}
export async function createBibleStudy(input: BibleStudyRequest) {
  const response = await authenticatedFetch(apiUrl, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(input) });
  if (response.status === 401) throw new Error("AUTH_REQUIRED");
  const payload = await parse(response);
  if (payload.generation?.state === "processing" || payload.source === "processing") {
    throw new BibleStudyGenerationInterruptedError(
      payload.study_id ?? payload.generation?.study_id,
      payload.generation_id ?? payload.generation?.generation_id,
    );
  }
  if (!payload.study) throw new Error("El estudio no está disponible."); return payload.study;
}

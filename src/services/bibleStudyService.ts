import { supabase } from "@/integrations/supabase/client";

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
interface StudyResponse { success: boolean; source?: "cache" | "generated"; study?: BibleStudy; studies?: BibleStudy[]; configured?: boolean; ready?: boolean; message?: string; }

const baseUrl = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://lavozdejesus.co").trim().replace(/\/+$/, "");
const apiUrl = (import.meta.env.VITE_BIBLE_STUDY_API_URL as string | undefined)?.trim() || `${baseUrl}/api/biblia-estudios.php`;
async function token(): Promise<string | null> {
  const { data } = await supabase.auth.getSession(); return data.session?.access_token ?? null;
}
async function fetchWithNetworkRetry(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await fetch(input, init);
    } catch (error) {
      lastError = error;
      if (attempt === 0) await new Promise(resolve => window.setTimeout(resolve, 800));
    }
  }
  void lastError;
  throw new Error("No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.");
}
async function parse(response: Response): Promise<StudyResponse> {
  const payload = (await response.json().catch(() => null)) as StudyResponse | null;
  if (!response.ok || !payload?.success) throw new Error(payload?.message || "No fue posible generar el estudio en este momento.");
  return payload;
}
export async function getStudyStatus() { return parse(await fetchWithNetworkRetry(apiUrl, { headers: { Accept: "application/json" } })); }
export async function getRecentBibleStudies() {
  const accessToken = await token();
  if (!accessToken) return [];
  const url = new URL(apiUrl, window.location.origin);
  url.searchParams.set("recent", "1");
  const payload = await parse(await fetchWithNetworkRetry(url, { headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` } }));
  return payload.studies ?? [];
}
export async function getBibleStudy(id: number) {
  const accessToken = await token(); const url = new URL(apiUrl, window.location.origin); url.searchParams.set("id", String(id));
  const payload = await parse(await fetchWithNetworkRetry(url, { headers: { Accept: "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) } }));
  if (!payload.study) throw new Error("El estudio no está disponible."); return payload.study;
}
export async function createBibleStudy(input: { libro_codigo: string; capitulo_inicio: number; versiculo_inicio: number; capitulo_fin: number; versiculo_fin: number; nivel: StudyLevel; }) {
  const accessToken = await token();
  const response = await fetchWithNetworkRetry(apiUrl, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) }, body: JSON.stringify(input) });
  if (response.status === 401) throw new Error("AUTH_REQUIRED");
  const payload = await parse(response);
  if (!payload.study) throw new Error("El estudio no está disponible."); return payload.study;
}

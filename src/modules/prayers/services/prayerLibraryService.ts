export type LibraryPrayer = {
  id: string;
  devocion_id: string;
  devocion_slug: string;
  subcategoria: string;
  titulo: string;
  subtitulo: string;
  categoria: string;
  descripcion: string;
  texto_completo: string;
  tema_visual: string;
  imagen: string;
  audio_url: string;
  fuente: string;
  pagina_fuente: string;
  destacada: boolean;
  disponible_offline: boolean;
  orden: number;
  estado_revision: string;
};

const categoryMap: Record<string, string> = {
  cristiano: "Oraciones del cristiano",
  devociones: "Devociones",
  sanacion: "Sanación y protección",
  proteccion: "Sanación y protección",
  liberacion: "Liberación",
};

const apiBase = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://lavozdejesus.co").trim().replace(/\/+$/, "");

const request = async (query: string, signal?: AbortSignal) => {
  const response = await fetch(`${apiBase}/api/oraciones.php${query}`, { signal });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) throw new Error(body?.error || "No fue posible cargar las oraciones");
  return body;
};

export type PrayerDevotion = {
  id: string;
  slug: string;
  titulo: string;
  subtitulo: string;
  imagen: string;
  total_oraciones: number;
};

export const prayerLibraryService = {
  categoryName(slug: string) {
    return categoryMap[slug] || "Oraciones del cristiano";
  },
  async list(slug: string, signal?: AbortSignal, subcategory = ""): Promise<LibraryPrayer[]> {
    const category = this.categoryName(slug);
    const extra = subcategory ? `&subcategoria=${encodeURIComponent(subcategory)}` : "";
    const body = await request(`?categoria=${encodeURIComponent(category)}${extra}`, signal);
    return Array.isArray(body.oraciones) ? body.oraciones : [];
  },
  async get(id: string, signal?: AbortSignal): Promise<LibraryPrayer> {
    const body = await request(`?id=${encodeURIComponent(id)}`, signal);
    return body.oracion as LibraryPrayer;
  },
  async devotions(signal?: AbortSignal): Promise<PrayerDevotion[]> {
    const body = await request("?vista=devociones", signal);
    return Array.isArray(body.devociones) ? body.devociones : [];
  },
  async devotion(slug: string, signal?: AbortSignal): Promise<LibraryPrayer[]> {
    const body = await request(`?devocion=${encodeURIComponent(slug)}`, signal);
    return Array.isArray(body.oraciones) ? body.oraciones : [];
  },
};

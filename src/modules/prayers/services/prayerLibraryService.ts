export type LibraryPrayer = {
  id: string;
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

const request = async (query: string, signal?: AbortSignal) => {
  const response = await fetch(`/api/oraciones${query}`, { signal });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) throw new Error(body?.error || "No fue posible cargar las oraciones");
  return body;
};

export const prayerLibraryService = {
  categoryName(slug: string) {
    return categoryMap[slug] || "Oraciones del cristiano";
  },
  async list(slug: string, signal?: AbortSignal): Promise<LibraryPrayer[]> {
    const category = this.categoryName(slug);
    const body = await request(`?categoria=${encodeURIComponent(category)}`, signal);
    return Array.isArray(body.oraciones) ? body.oraciones : [];
  },
  async get(id: string, signal?: AbortSignal): Promise<LibraryPrayer> {
    const body = await request(`?id=${encodeURIComponent(id)}`, signal);
    return body.oracion as LibraryPrayer;
  },
};

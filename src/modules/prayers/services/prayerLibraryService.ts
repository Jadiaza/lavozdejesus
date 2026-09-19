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

type PrayerMetadata = Pick<LibraryPrayer, "categoria" | "subcategoria" | "devocion_slug">;

const metadata = (categoria: string, subcategoria: string, devocion_slug = ""): PrayerMetadata => ({ categoria, subcategoria, devocion_slug });

// Compatibilidad con la primera versión del API, que todavía no devolvía
// subcategoria ni devocion_slug. El orden corresponde a la colección oficial
// de 43 oraciones del Devocionario Católico.
const legacyMetadataByOrder: Record<number, PrayerMetadata> = {
  1: metadata("Oraciones del cristiano", "Mañana y ofrecimiento"),
  2: metadata("Oraciones del cristiano", "Fe, confianza y discernimiento"),
  3: metadata("Devociones", "María Santísima", "maria-santisima"),
  4: metadata("Devociones", "San José", "san-jose"),
  5: metadata("Devociones", "San José", "san-jose"),
  6: metadata("Devociones", "Santos y ángeles"),
  7: metadata("Oraciones del cristiano", "Intercesión"),
  8: metadata("Devociones", "Espíritu Santo", "espiritu-santo"),
  9: metadata("Oraciones del cristiano", "Fe, confianza y discernimiento"),
  10: metadata("Oraciones del cristiano", "Momentos y necesidades"),
  11: metadata("Oraciones del cristiano", "Noche y descanso"),
  12: metadata("Oraciones del cristiano", "Noche y descanso"),
  13: metadata("Sanación y protección", "Protección personal y familiar"),
  14: metadata("Devociones", "María Santísima", "maria-santisima"),
  15: metadata("Oraciones del cristiano", "Noche y descanso"),
  16: metadata("Oraciones del cristiano", "Oraciones fundamentales"),
  17: metadata("Sanación y protección", "Protección personal y familiar"),
  18: metadata("Devociones", "María Santísima", "maria-santisima"),
  19: metadata("Devociones", "María Santísima", "maria-santisima"),
  20: metadata("Devociones", "Santísimo Sacramento", "santisimo-sacramento"),
  21: metadata("Devociones", "Sangre de Cristo", "sangre-de-cristo"),
  22: metadata("Devociones", "Sangre de Cristo", "sangre-de-cristo"),
  23: metadata("Devociones", "Jesucristo"),
  24: metadata("Devociones", "María Santísima", "maria-santisima"),
  25: metadata("Devociones", "María Santísima", "maria-santisima"),
  26: metadata("Devociones", "Santísimo Sacramento", "santisimo-sacramento"),
  27: metadata("Devociones", "Santísimo Sacramento", "santisimo-sacramento"),
  28: metadata("Devociones", "Santísimo Sacramento", "santisimo-sacramento"),
  29: metadata("Devociones", "Sagrado Corazón de Jesús", "sagrado-corazon-de-jesus"),
  30: metadata("Devociones", "Santísimo Sacramento", "santisimo-sacramento"),
  31: metadata("Oraciones del cristiano", "Intercesión"),
  32: metadata("Devociones", "Santísimo Sacramento", "santisimo-sacramento"),
  33: metadata("Devociones", "Santísimo Sacramento", "santisimo-sacramento"),
  34: metadata("Oraciones del cristiano", "Oraciones fundamentales"),
  35: metadata("Oraciones del cristiano", "Oraciones fundamentales"),
  36: metadata("Devociones", "María Santísima", "maria-santisima"),
  37: metadata("Oraciones del cristiano", "Oraciones fundamentales"),
  38: metadata("Oraciones del cristiano", "Oraciones fundamentales"),
  39: metadata("Oraciones del cristiano", "Oraciones fundamentales"),
  40: metadata("Oraciones del cristiano", "Oraciones fundamentales"),
  41: metadata("Oraciones del cristiano", "Oraciones fundamentales"),
  42: metadata("Oraciones del cristiano", "Oraciones fundamentales"),
  43: metadata("Oraciones del cristiano", "Oraciones fundamentales"),
};

const normalize = (value: string) => value.trim().toLocaleLowerCase("es");

const withCanonicalMetadata = (prayer: LibraryPrayer): LibraryPrayer => {
  const fallback = legacyMetadataByOrder[Number(prayer.orden)];
  if (!fallback) return prayer;
  return {
    ...prayer,
    categoria: prayer.categoria || fallback.categoria,
    subcategoria: prayer.subcategoria || fallback.subcategoria,
    devocion_slug: prayer.devocion_slug || fallback.devocion_slug,
  };
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
    const prayers = Array.isArray(body.oraciones) ? body.oraciones.map(withCanonicalMetadata) : [];
    return prayers.filter((prayer) => normalize(prayer.categoria) === normalize(category) && (!subcategory || normalize(prayer.subcategoria) === normalize(subcategory)));
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
    const prayers = Array.isArray(body.oraciones) ? body.oraciones.map(withCanonicalMetadata) : [];
    return prayers.filter((prayer) => prayer.devocion_slug === slug);
  },
};

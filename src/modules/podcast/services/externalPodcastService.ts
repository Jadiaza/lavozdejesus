export type ExternalPodcastCatalogItem = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
};

export type ExternalPodcastEpisode = {
  id: string;
  guid: string;
  title: string;
  description: string;
  audio_url: string;
  image_url: string;
  duration_seconds: number;
  pub_date: string;
};

export type ExternalPodcast = {
  slug: string;
  title: string;
  description: string;
  author: string;
  image_url: string;
  category: string;
  source: "rss";
};

export type ExternalPodcastResponse = {
  podcast: ExternalPodcast;
  episodes: ExternalPodcastEpisode[];
};

export const EXTERNAL_PODCASTS: ExternalPodcastCatalogItem[] = [
  {
    slug: "biblia-en-un-ano",
    title: "La Biblia en un Año",
    subtitle: "Fray Sergio Serrano, OP · Juan Diego Network",
    category: "Biblia",
  },
  {
    slug: "que-haria-jesus",
    title: "¿Qué Haría Jesús?",
    subtitle: "New Fire · Reflexión diaria del Evangelio",
    category: "Evangelio",
  },
  {
    slug: "evangelio-del-dia",
    title: "Evangelio del día",
    subtitle: "Fr. Jonathan Vásquez, O. de M.",
    category: "Evangelio",
  },
  {
    slug: "10-minutos-con-jesus",
    title: "10 Minutos con Jesús",
    subtitle: "Oración y meditación diaria",
    category: "Oración",
  },
  {
    slug: "platicando-en-catolico",
    title: "Platicando en Católico",
    subtitle: "Juan Diego Network",
    category: "Actualidad católica",
  },
  {
    slug: "conoce-ama-vive-tu-fe",
    title: "CONOCE AMA Y VIVE TU FE",
    subtitle: "Luis Román",
    category: "Formación",
  },
  {
    slug: "salve-maria",
    title: "Salve María - Podcast Católico",
    subtitle: "Heraldos del Evangelio",
    category: "Espiritualidad",
  },
  {
    slug: "escuela-de-cristo",
    title: "Escuela de Cristo",
    subtitle: "La Antigua Guatemala",
    category: "Tradición y espiritualidad",
  },
  {
    slug: "eco-catolico",
    title: "Eco Católico",
    subtitle: "Leonor Asilis",
    category: "Fe y vida",
  },
  {
    slug: "club-de-los-buhos",
    title: "El Club de los Búhos",
    subtitle: "Mauricio I. Pérez",
    category: "Formación",
  },
  {
    slug: "podcast-mauricio-perez",
    title: "El Podcast de Mauricio Pérez",
    subtitle: "Actualidad, espiritualidad y formación",
    category: "Formación",
  },
  {
    slug: "pasion-por-el-evangelio",
    title: "Pasión por el Evangelio",
    subtitle: "Exégesis del Evangelio dominical",
    category: "Evangelio",
  },
];

export async function getExternalPodcast(slug: string): Promise<ExternalPodcastResponse> {
  const response = await fetch(`/api/podcast-rss?slug=${encodeURIComponent(slug)}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Podcast RSS ${response.status}`);
  }

  const data = (await response.json()) as Partial<ExternalPodcastResponse>;
  if (!data.podcast || !Array.isArray(data.episodes)) {
    throw new Error("La fuente RSS no devolvió un podcast válido.");
  }

  return {
    podcast: data.podcast,
    episodes: data.episodes,
  };
}

export async function getExternalPodcastMetadata(slug: string): Promise<ExternalPodcast> {
  const response = await fetch(`/api/podcast-rss?slug=${encodeURIComponent(slug)}&meta=1`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Podcast metadata ${response.status}`);
  }

  const data = (await response.json()) as { podcast?: ExternalPodcast };
  if (!data.podcast) {
    throw new Error("La fuente RSS no devolvió metadatos válidos.");
  }

  return data.podcast;
}

export function formatExternalDuration(seconds: number): string {
  if (!seconds || seconds < 1) return "Audio";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export type ExternalPodcastPlaybackMode = "daily" | "series";
export type ExternalPodcastSource = "rss" | "spotify" | "lvj";

export type ExternalPodcastCatalogItem = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  playback_mode: ExternalPodcastPlaybackMode;
  source?: ExternalPodcastSource;
  spotify_show_id?: string;
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
  season_number?: number;
  episode_number?: number;
};

export type ExternalPodcast = {
  slug: string;
  title: string;
  description: string;
  author: string;
  image_url: string;
  category: string;
  source: "rss" | "lvj" | "lvj_r2";
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
    playback_mode: "daily",
    source: "rss",
  },
  {
    slug: "dios-te-habla",
    title: "Dios te habla: Un año con la Biblia en armonía",
    subtitle: "La Voz de Jesús · Historia de la salvación · 365 jornadas",
    category: "Biblia",
    playback_mode: "daily",
    source: "lvj",
  },
  {
    slug: "que-haria-jesus",
    title: "¿Qué Haría Jesús?",
    subtitle: "New Fire · Reflexión diaria del Evangelio",
    category: "Evangelio",
    playback_mode: "daily",
    source: "rss",
  },
  {
    slug: "evangelio-del-dia",
    title: "Evangelio del día",
    subtitle: "Fr. Jonathan Vásquez, O. de M.",
    category: "Evangelio",
    playback_mode: "daily",
    source: "rss",
  },
  {
    slug: "10-minutos-con-jesus",
    title: "10 Minutos con Jesús",
    subtitle: "Oración y meditación diaria",
    category: "Oración",
    playback_mode: "series",
    source: "rss",
  },
  {
    slug: "conocete-en-el-espejo",
    title: "Conócete en el Espejo con Sheila Morataya",
    subtitle: "Sheila Morataya · Juan Diego Network",
    category: "Sanación interior",
    playback_mode: "series",
    source: "rss",
  },
  {
    slug: "hablemos-de-exorcismos",
    title: "Hablemos de Exorcismos",
    subtitle: "P. Daniel Medina Guzmán, O.P.",
    category: "Discernimiento espiritual",
    playback_mode: "series",
    source: "lvj",
    spotify_show_id: "4idQCcElpG4VPisFYJ3WMf",
  },
  {
    slug: "platicando-en-catolico",
    title: "Platicando en Católico",
    subtitle: "Juan Diego Network",
    category: "Actualidad católica",
    playback_mode: "series",
    source: "rss",
  },
  {
    slug: "conoce-ama-vive-tu-fe",
    title: "CONOCE AMA Y VIVE TU FE",
    subtitle: "Luis Román",
    category: "Formación",
    playback_mode: "series",
    source: "rss",
  },
  {
    slug: "salve-maria",
    title: "Salve María - Podcast Católico",
    subtitle: "Heraldos del Evangelio",
    category: "Espiritualidad",
    playback_mode: "series",
    source: "rss",
  },
  {
    slug: "escuela-de-cristo",
    title: "Escuela de Cristo",
    subtitle: "La Antigua Guatemala",
    category: "Tradición y espiritualidad",
    playback_mode: "series",
    source: "rss",
  },
  {
    slug: "eco-catolico",
    title: "Eco Católico",
    subtitle: "Leonor Asilis",
    category: "Fe y vida",
    playback_mode: "series",
    source: "rss",
  },
  {
    slug: "club-de-los-buhos",
    title: "El Club de los Búhos",
    subtitle: "Mauricio I. Pérez",
    category: "Formación",
    playback_mode: "series",
    source: "rss",
  },
  {
    slug: "podcast-mauricio-perez",
    title: "El Podcast de Mauricio Pérez",
    subtitle: "Actualidad, espiritualidad y formación",
    category: "Formación",
    playback_mode: "series",
    source: "rss",
  },
  {
    slug: "pasion-por-el-evangelio",
    title: "Pasión por el Evangelio",
    subtitle: "Exégesis del Evangelio dominical",
    category: "Evangelio",
    playback_mode: "series",
    source: "rss",
  },
];

const endpointForSlug = (slug: string, meta = false) => {
  if (slug === "hablemos-de-exorcismos") {
    return `/api/podcast-hablemos-exorcismos${meta ? "?meta=1" : ""}`;
  }
  return `/api/podcast-rss?slug=${encodeURIComponent(slug)}${meta ? "&meta=1" : ""}`;
};

export async function getExternalPodcast(slug: string): Promise<ExternalPodcastResponse> {
  const response = await fetch(endpointForSlug(slug), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Podcast ${response.status}`);
  }

  const data = (await response.json()) as Partial<ExternalPodcastResponse>;
  if (!data.podcast || !Array.isArray(data.episodes)) {
    throw new Error("La fuente no devolvió un podcast válido.");
  }

  return {
    podcast: data.podcast,
    episodes: data.episodes,
  };
}

export async function getExternalPodcastMetadata(slug: string): Promise<ExternalPodcast> {
  const response = await fetch(endpointForSlug(slug, true), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Podcast metadata ${response.status}`);
  }

  const data = (await response.json()) as { podcast?: ExternalPodcast };
  if (!data.podcast) {
    throw new Error("La fuente no devolvió metadatos válidos.");
  }

  return data.podcast;
}

export async function getSpotifyPodcastMetadata(showId: string): Promise<{ image_url: string }> {
  const response = await fetch(`/api/podcast-spotify?show=${encodeURIComponent(showId)}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Spotify metadata ${response.status}`);
  }

  const data = (await response.json()) as { image_url?: string };
  return { image_url: data.image_url || "" };
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

export function getExternalPodcastCatalogItem(slug: string): ExternalPodcastCatalogItem | undefined {
  return EXTERNAL_PODCASTS.find((podcast) => podcast.slug === slug);
}

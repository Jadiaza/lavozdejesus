export type PodcastSeries = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  motto: string | null;
  description: string | null;
  duration_days: number;
  status: string;
  available_episodes: number;
};

export type PodcastEpisode = {
  id: string;
  day_number: number;
  title: string;
  subtitle: string | null;
  summary: string | null;
  image_url: string | null;
  estimated_minutes: number;
  media_asset_id: string;
  audio_url: string;
  duration_seconds: number;
  provider: string;
};

export type PodcastConsecrationResponse = {
  series: PodcastSeries;
  episodes: PodcastEpisode[];
};

const normalizePayload = (payload: unknown): PodcastConsecrationResponse => {
  if (!payload || typeof payload !== "object") {
    throw new Error("La respuesta del podcast no es válida.");
  }

  const value = payload as {
    series?: PodcastSeries;
    episodes?: PodcastEpisode[];
    success?: boolean;
  };

  if (!value.series || !Array.isArray(value.episodes)) {
    throw new Error("La serie de la Consagración no está disponible.");
  }

  return {
    series: value.series,
    episodes: value.episodes.filter(
      (episode) => Boolean(episode?.id && episode.audio_url && episode.day_number),
    ),
  };
};

export async function getConsecrationPodcast(): Promise<PodcastConsecrationResponse> {
  const endpoints = ["/api/podcast-consagracion", "/api/podcast-consagracion.php"];
  let lastError: unknown = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        lastError = new Error(`Podcast API ${response.status}`);
        continue;
      }

      return normalizePayload(await response.json());
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("No fue posible cargar los audios de la Consagración.");
}

export function formatEpisodeDuration(episode: PodcastEpisode): string {
  const totalSeconds = Number(episode.duration_seconds || 0);

  if (totalSeconds > 0) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  return episode.estimated_minutes > 0
    ? `≈ ${episode.estimated_minutes} min`
    : "Audio";
}

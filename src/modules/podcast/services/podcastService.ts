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

const FALLBACK_SERIES: PodcastSeries = {
  id: "23d4985a-1a6f-4f2d-8b73-4655737339b5",
  slug: "santos-arcangeles-33-dias",
  title: "Consagración de 33 días a los Santos Arcángeles",
  subtitle: "San Miguel · San Gabriel · San Rafael",
  motto: "¿Quién como Dios? ¡Nadie como Dios!",
  description:
    "Un camino de fe, conversión, combate espiritual, santidad y misión, con San Miguel como guía, acompañados por San Gabriel y San Rafael, hacia una vida más profundamente entregada a Jesucristo.",
  duration_days: 33,
  status: "published",
  available_episodes: 18,
};

const R2_BASE =
  "https://pub-d51964240d644bebafa009ba9eae6df4.r2.dev/modulos/consagraciones/san-miguel/podcast";

const fallbackRows: Array<{
  id: string;
  day: number;
  title: string;
  minutes: number;
  media: string;
  duration: number;
}> = [
  ["e559b361-402d-4343-8172-48aa59930fc5", 1, "¿Quiénes son los ángeles?", 25, "38bd05e4-4d2f-427a-b86e-8b8124a16881", 1163],
  ["b1570f44-8932-4dc8-a270-b299b94d47de", 2, "San Miguel en la Biblia", 38, "74b31890-f916-4a7f-8b2e-c5683a8bf4a9", 1983],
  ["fc8e3d62-01d6-49a8-a6ec-bdae432618b8", 3, "Su misión y su amor a Dios", 30, "9e01a1df-05ec-4dc2-80c9-b50fb13406c1", 1533],
  ["098caaa1-26e8-41e7-8fc4-a8a622f36362", 4, "La gloria de Dios", 30, "489c7295-d9b5-4e86-a255-6ddf6691caad", 1835],
  ["5e032368-8331-4122-94c2-40eebfbe8278", 5, "La adoración y el servicio de los ángeles", 25, "0586b4e4-f9a0-4d43-81f6-ba88f34231fb", 2504],
  ["d4a1e4d9-53fa-4fb7-8537-05a1676e1e46", 6, "La voluntad de Dios", 25, "06d6218f-ab42-45a6-ab63-dfa24a67fc89", 1307],
  ["2b3a1462-f70f-4312-8626-0f3654928b16", 7, "Mi Ángel de la Guarda", 25, "7e946621-c16e-4d12-a624-52fad323edbc", 0],
  ["a21a6e70-e31c-4df0-8611-fae02bb1a100", 8, "Renunciar al pecado", 25, "3834f616-2590-4cf5-bc14-cc5bff5aca55", 0],
  ["908e25ac-4329-4877-ab27-7d933dede280", 9, "Romper cadenas espirituales", 25, "e4f37a31-9543-4d24-b203-68dcbb165ced", 1334],
  ["58627d98-9ab8-49c3-b6d3-acb77710a87b", 10, "Vencer el orgullo", 25, "06072f34-0029-4752-b1a2-c0ec186c5a9e", 1329],
  ["e8d55e71-0144-4f3a-8aae-53390e913494", 11, "Combatir la mentira", 25, "81320aab-6176-4915-836b-5caf8784b2cb", 1365],
  ["80fa6184-1b62-4f0e-96a8-43ef830fe267", 12, "Pureza de corazón", 25, "5bd0bc63-feec-43a6-ad3a-9777b086072e", 1635],
  ["d25f88ff-8860-4639-9bd0-f9e9c782a605", 13, "Obediencia y humildad", 25, "24f7ea2c-d688-47e3-ae6e-e0203a471191", 1490],
  ["99af4069-808c-4e3b-a254-0b0f1e2ee2d7", 14, "La Confesión: sacramento de reconciliación y liberación", 25, "8627da4b-c066-4a9b-a16c-be8d5007827e", 1509],
  ["50498f8f-285e-4108-8607-caa31adf2020", 15, "La guerra espiritual", 25, "63afbf71-f50c-4d36-8628-af2517acedb0", 1875],
  ["733b7c2c-76bd-493c-b453-2bd2cd985f60", 16, "La armadura de Dios", 25, "4a2f96f4-0c34-4595-a07d-10db9c14c0d2", 2160],
  ["e93777f5-048a-473b-8dca-1c3e9fd0823e", 17, "La victoria de San Miguel sobre el dragón", 25, "cf8d82ec-bba3-4e1d-b2f7-6b889ae2b86b", 1743],
  ["e41b927a-aba0-4d2b-a380-67e3e02a115c", 18, "Discernir tentaciones y engaños", 25, "08f44576-315a-4c43-9505-29bbf3c23f45", 1610],
].map(([id, day, title, minutes, media, duration]) => ({
  id: String(id),
  day: Number(day),
  title: String(title),
  minutes: Number(minutes),
  media: String(media),
  duration: Number(duration),
}));

const FALLBACK_EPISODES: PodcastEpisode[] = fallbackRows.map((row) => ({
  id: row.id,
  day_number: row.day,
  title: row.title,
  subtitle: null,
  summary: null,
  image_url: null,
  estimated_minutes: row.minutes,
  media_asset_id: row.media,
  audio_url: `${R2_BASE}/Dia-${String(row.day).padStart(2, "0")}.mp3`,
  duration_seconds: row.duration,
  provider: "cloudflare_r2",
}));

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

  const episodes = value.episodes.filter(
    (episode) => Boolean(episode?.id && episode.audio_url && episode.day_number),
  );

  return {
    series: {
      ...value.series,
      available_episodes: episodes.length,
    },
    episodes,
  };
};

export async function getConsecrationPodcast(): Promise<PodcastConsecrationResponse> {
  try {
    const response = await fetch("/api/podcast-consagracion", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Podcast API ${response.status}`);
    }

    return normalizePayload(await response.json());
  } catch (error) {
    console.warn(
      "LVJ Podcast: se usa el respaldo local porque el proxy temporal no respondió.",
      error,
    );

    return {
      series: FALLBACK_SERIES,
      episodes: FALLBACK_EPISODES,
    };
  }
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

type ApiRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (body: unknown) => void };
};

const SHOW_ID = "4idQCcElpG4VPisFYJ3WMf";
const R2_BASE =
  "https://pub-d51964240d644bebafa009ba9eae6df4.r2.dev/modulos/podcast/hablemos_exorxismos/audio";

const EPISODES = [
  { season: 1, episode: 1, title: "Las posesiones diabólicas" },
  { season: 1, episode: 2, title: "La obsesión diabólica" },
  { season: 1, episode: 3, title: "La vejación diabólica" },
  { season: 1, episode: 4, title: "La infestación diabólica" },
  { season: 1, episode: 5, title: "La acción demoníaca extraordinaria" },
  { season: 1, episode: 6, title: "Los pactos satánicos" },
] as const;

const encodeFile = (value: string) => encodeURIComponent(value).replace(/%2F/g, "/");

const audioUrl = (season: number, episode: number, title: string) => {
  const file = `T${season} E${episode} - ${title}.mp3`;
  return `${R2_BASE}/T${season}/${encodeFile(file)}`;
};

async function spotifyCover(): Promise<string> {
  try {
    const spotifyUrl = `https://open.spotify.com/show/${SHOW_ID}`;
    const response = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "LVJPRAYER-Podcast/1.0",
        },
      },
    );
    if (!response.ok) return "";
    const data = (await response.json()) as { thumbnail_url?: string };
    return data.thumbnail_url || "";
  } catch {
    return "";
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method && req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
    return;
  }

  const rawMeta = req.query?.meta;
  const metaOnly = (Array.isArray(rawMeta) ? rawMeta[0] : rawMeta) === "1";
  const imageUrl = await spotifyCover();

  const podcast = {
    slug: "hablemos-de-exorcismos",
    title: "Hablemos de Exorcismos",
    description:
      "Espacio de formación y discernimiento espiritual con el P. Daniel Medina Guzmán, O.P., dedicado a comprender desde la fe católica temas relacionados con el exorcismo, la acción extraordinaria del maligno y la vida cristiana.",
    author: "P. Daniel Medina Guzmán, O.P.",
    image_url: imageUrl,
    category: "Discernimiento espiritual",
    source: "lvj_r2",
  };

  if (metaOnly) {
    res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=86400");
    res.status(200).json({ podcast });
    return;
  }

  const episodes = EPISODES.map((item) => ({
    id: `hablemos-de-exorcismos-t${item.season}-e${item.episode}`,
    guid: `hablemos-de-exorcismos-t${item.season}-e${item.episode}`,
    title: item.title,
    description: "",
    audio_url: audioUrl(item.season, item.episode, item.title),
    image_url: imageUrl,
    duration_seconds: 0,
    pub_date: "",
    season_number: item.season,
    episode_number: item.episode,
  }));

  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  res.status(200).json({ podcast, episodes });
}

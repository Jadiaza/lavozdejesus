type ApiRequest = {
  method?: string;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

type ConsecrationRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  motto: string | null;
  description: string | null;
  duration_days: number;
  status: string;
};

type MediaAssetRow = {
  id: string;
  asset_type: string;
  public_url: string | null;
  duration_seconds: number | null;
  provider: string;
  storage_key: string;
};

type ConsecrationDayRow = {
  id: string;
  day_number: number;
  title: string;
  subtitle: string | null;
  playlist_summary: string | null;
  hero_image: string | null;
  estimated_minutes: number;
  status: string;
  media_assets?: MediaAssetRow[];
};

const CONSECRATION_SLUG = "santos-arcangeles-33-dias";

const getSupabaseConfig = () => {
  const url = String(
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "",
  ).replace(/\/$/, "");
  const key = String(
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.SUPABASE_ANON_KEY ??
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
      "",
  );

  return { url, key };
};

const supabaseHeaders = (key: string) => {
  const headers: Record<string, string> = {
    apikey: key,
    Accept: "application/json",
  };

  // Las nuevas claves sb_publishable_/sb_secret_ son opacas y no se usan
  // como Bearer. Las claves JWT legacy sí requieren Authorization.
  if (!key.startsWith("sb_")) {
    headers.Authorization = `Bearer ${key}`;
  }

  return headers;
};

const fetchJson = async <T>(url: string, key: string): Promise<T> => {
  const response = await fetch(url, {
    headers: supabaseHeaders(key),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase ${response.status}: ${detail.slice(0, 240)}`);
  }

  return response.json() as Promise<T>;
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method && req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
    return;
  }

  const { url, key } = getSupabaseConfig();

  if (!url || !key) {
    res.status(503).json({ error: "SUPABASE_ENV_NOT_CONFIGURED" });
    return;
  }

  try {
    const consecrationParams = new URLSearchParams({
      select: "id,slug,title,subtitle,motto,description,duration_days,status",
      slug: `eq.${CONSECRATION_SLUG}`,
      status: "eq.published",
      limit: "1",
    });

    const consecrations = await fetchJson<ConsecrationRow[]>(
      `${url}/rest/v1/consecrations?${consecrationParams.toString()}`,
      key,
    );
    const series = consecrations[0];

    if (!series) {
      res.status(404).json({ error: "CONSECRATION_NOT_FOUND" });
      return;
    }

    const dayParams = new URLSearchParams({
      select:
        "id,day_number,title,subtitle,playlist_summary,hero_image,estimated_minutes,status,media_assets!inner(id,asset_type,public_url,duration_seconds,provider,storage_key)",
      consecration_id: `eq.${series.id}`,
      status: "eq.published",
      "media_assets.asset_type": "eq.podcast",
      order: "day_number.asc",
    });

    const days = await fetchJson<ConsecrationDayRow[]>(
      `${url}/rest/v1/consecration_days?${dayParams.toString()}`,
      key,
    );

    const episodes = days
      .map((day) => {
        const audio = day.media_assets?.find(
          (asset) => asset.asset_type === "podcast" && asset.public_url,
        );

        if (!audio?.public_url) return null;

        return {
          id: day.id,
          day_number: day.day_number,
          title: day.title,
          subtitle: day.subtitle,
          summary: day.playlist_summary,
          image_url: day.hero_image,
          estimated_minutes: day.estimated_minutes,
          media_asset_id: audio.id,
          audio_url: audio.public_url,
          duration_seconds: audio.duration_seconds ?? 0,
          provider: audio.provider,
        };
      })
      .filter(Boolean);

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
    res.status(200).json({
      series: {
        ...series,
        available_episodes: episodes.length,
      },
      episodes,
    });
  } catch (error) {
    res.status(500).json({
      error: "PODCAST_CONSECRATION_QUERY_FAILED",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

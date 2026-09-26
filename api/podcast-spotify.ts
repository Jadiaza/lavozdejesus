type ApiRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (body: unknown) => void };
};

const ALLOWED_SHOWS = new Set(["4idQCcElpG4VPisFYJ3WMf"]);

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method && req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
    return;
  }

  const rawShow = req.query?.show;
  const showId = Array.isArray(rawShow) ? rawShow[0] : rawShow || "";

  if (!ALLOWED_SHOWS.has(showId)) {
    res.status(404).json({ error: "SPOTIFY_SHOW_NOT_ALLOWED" });
    return;
  }

  try {
    const spotifyUrl = `https://open.spotify.com/show/${encodeURIComponent(showId)}`;
    const response = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "LVJPRAYER-Podcast/1.0",
        },
      },
    );

    if (!response.ok) {
      res.status(502).json({ error: "SPOTIFY_OEMBED_FAILED", status: response.status });
      return;
    }

    const data = (await response.json()) as {
      thumbnail_url?: string;
      iframe_url?: string;
    };

    res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=86400");
    res.status(200).json({
      show_id: showId,
      image_url: data.thumbnail_url || "",
      embed_url:
        data.iframe_url ||
        `https://open.spotify.com/embed/show/${encodeURIComponent(showId)}?utm_source=lvjprayer`,
    });
  } catch (error) {
    res.status(500).json({
      error: "SPOTIFY_METADATA_FAILED",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

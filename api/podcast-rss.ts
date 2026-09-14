type ApiRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (body: unknown) => void };
};

type SourceConfig = {
  feed: string;
  fallbackTitle: string;
  category: string;
  strictImageMatch?: boolean;
};

const SOURCES: Record<string, SourceConfig> = {
  "biblia-en-un-ano": {
    feed: "https://labiblia.captivate.fm/rssfeed",
    fallbackTitle: "La Biblia en un Año",
    category: "Biblia",
    strictImageMatch: true,
  },
  laudes: {
    feed: "https://laudes.captivate.fm/rssfeed",
    fallbackTitle: "Laudes",
    category: "Oración",
    strictImageMatch: true,
  },
  "platicando-en-catolico": {
    feed: "https://feeds.captivate.fm/catolico/",
    fallbackTitle: "Platicando en Católico",
    category: "Actualidad católica",
    strictImageMatch: true,
  },
  "conoce-ama-vive-tu-fe": {
    feed: "https://rss.buzzsprout.com/202359.rss",
    fallbackTitle: "CONOCE AMA Y VIVE TU FE",
    category: "Formación",
  },
  "salve-maria": {
    feed: "https://www.ivoox.com/feed_fg_f11295855_filtro_1.xml",
    fallbackTitle: "Salve María - Podcast Católico",
    category: "Espiritualidad",
  },
  "escuela-de-cristo": {
    feed: "https://www.ivoox.com/feed_fg_f11012636_filtro_1.xml",
    fallbackTitle: "Escuela de Cristo",
    category: "Tradición y espiritualidad",
  },
  "eco-catolico": {
    feed: "https://www.ivoox.com/feed_fg_f11137354_filtro_1.xml",
    fallbackTitle: "Eco Católico",
    category: "Fe y vida",
  },
  "club-de-los-buhos": {
    feed: "https://www.spreaker.com/show/4904410/episodes/feed",
    fallbackTitle: "El Club de los Búhos",
    category: "Formación",
  },
  "podcast-mauricio-perez": {
    feed: "https://www.spreaker.com/show/5246171/episodes/feed",
    fallbackTitle: "El Podcast de Mauricio Pérez",
    category: "Formación",
  },
  "pasion-por-el-evangelio": {
    feed: "https://www.spreaker.com/show/4702449/episodes/feed",
    fallbackTitle: "Pasión por el Evangelio",
    category: "Evangelio",
  },
};

const decodeXml = (value: string) =>
  value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();

const stripHtml = (value: string) =>
  decodeXml(value.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

const tag = (xml: string, name: string) => {
  const match = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? decodeXml(match[1]) : "";
};

const attr = (xml: string, tagName: string, attrName: string) => {
  const match = xml.match(new RegExp(`<${tagName}\\b[^>]*\\b${attrName}=["']([^"']+)["'][^>]*>`, "i"));
  return match ? decodeXml(match[1]) : "";
};

const durationToSeconds = (value: string) => {
  const parts = value.trim().split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
};

const getImage = (xml: string) =>
  attr(xml, "itunes:image", "href") ||
  attr(xml, "media:content", "url") ||
  attr(xml, "media:thumbnail", "url") ||
  tag(xml, "url");

const normalizeUrlForCompare = (value: string) => {
  if (!value) return "";
  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname}`.replace(/\/+$/, "").toLowerCase();
  } catch {
    return value.split("?")[0].replace(/\/+$/, "").toLowerCase();
  }
};

const imagesMatch = (episodeImage: string, channelImage: string) => {
  const episode = normalizeUrlForCompare(episodeImage);
  const channel = normalizeUrlForCompare(channelImage);
  if (!episode || !channel) return false;
  return episode === channel;
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method && req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
    return;
  }

  const rawSlug = req.query?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug || "";
  const source = SOURCES[slug];

  if (!source) {
    res.status(404).json({ error: "PODCAST_SOURCE_NOT_FOUND" });
    return;
  }

  try {
    const response = await fetch(source.feed, {
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "User-Agent": "LVJPRAYER-Podcast/1.0",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      res.status(502).json({ error: "RSS_FETCH_FAILED", status: response.status });
      return;
    }

    const xml = await response.text();
    const channelMatch = xml.match(/<channel\b[^>]*>([\s\S]*?)<\/channel>/i);
    const channel = channelMatch?.[1] || xml;
    const itemMatches = [...channel.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)];

    const channelWithoutItems = channel.replace(/<item\b[^>]*>[\s\S]*?<\/item>/gi, "");
    const podcast = {
      slug,
      title: stripHtml(tag(channelWithoutItems, "title")) || source.fallbackTitle,
      description: stripHtml(tag(channelWithoutItems, "description") || tag(channelWithoutItems, "itunes:summary")),
      author: stripHtml(tag(channelWithoutItems, "itunes:author") || tag(channelWithoutItems, "author")),
      image_url: getImage(channelWithoutItems),
      category: source.category,
      source: "rss",
    };

    const parsedEpisodes = itemMatches
      .map((match, index) => {
        const item = match[1];
        const audioUrl = attr(item, "enclosure", "url") || attr(item, "media:content", "url");
        if (!audioUrl) return null;
        const guid = stripHtml(tag(item, "guid")) || audioUrl;
        const durationText = stripHtml(tag(item, "itunes:duration"));
        const itemImage = getImage(item);
        return {
          id: `${slug}-${index}-${guid.slice(-24)}`,
          guid,
          title: stripHtml(tag(item, "title")) || `Episodio ${index + 1}`,
          description: stripHtml(tag(item, "description") || tag(item, "content:encoded") || tag(item, "itunes:summary")),
          audio_url: audioUrl,
          image_url: itemImage || podcast.image_url,
          _item_image: itemImage,
          duration_seconds: durationToSeconds(durationText),
          pub_date: stripHtml(tag(item, "pubDate")),
        };
      })
      .filter(Boolean) as Array<{
        id: string;
        guid: string;
        title: string;
        description: string;
        audio_url: string;
        image_url: string;
        _item_image: string;
        duration_seconds: number;
        pub_date: string;
      }>;

    let filteredEpisodes = parsedEpisodes;

    if (source.strictImageMatch && podcast.image_url) {
      const matching = parsedEpisodes.filter((episode) =>
        imagesMatch(episode._item_image || episode.image_url, podcast.image_url),
      );

      // Solo activamos el filtro si realmente identifica una cantidad útil de episodios.
      // Esto evita vaciar feeds legítimos que usan arte individual por episodio.
      if (matching.length >= 3) {
        filteredEpisodes = matching;
      }
    }

    const episodes = filteredEpisodes.slice(0, 40).map(({ _item_image, ...episode }) => episode);

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
    res.status(200).json({ podcast, episodes });
  } catch (error) {
    res.status(500).json({
      error: "RSS_QUERY_FAILED",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

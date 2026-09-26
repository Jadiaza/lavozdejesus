type ApiRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (body: unknown) => void };
};

const COVER =
  "https://pub-d51964240d644bebafa009ba9eae6df4.r2.dev/modulos/biblia/planes/images/dios-te-habla.png";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method && req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
    return;
  }

  const rawMeta = req.query?.meta;
  const metaOnly = (Array.isArray(rawMeta) ? rawMeta[0] : rawMeta) === "1";

  const podcast = {
    slug: "dios-te-habla",
    title: "Dios te habla: Un año con la Biblia en armonía",
    description:
      "Lectura bíblica sincrónica para recorrer la Palabra de Dios durante 365 jornadas, relacionando las lecturas del Antiguo Testamento, Nuevo Testamento y Salmos en un mismo camino espiritual.",
    author: "La Voz de Jesús",
    image_url: COVER,
    category: "Biblia",
    source: "lvj",
  };

  res.setHeader("Cache-Control", metaOnly ? "s-maxage=21600, stale-while-revalidate=86400" : "s-maxage=300, stale-while-revalidate=3600");
  res.status(200).json(metaOnly ? { podcast } : { podcast, episodes: [] });
}

type ApiRequest = {
  url?: string;
  query?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (body: unknown) => void };
};

const HOURS = new Set(["oficio", "laudes", "tercia", "sexta", "nona", "visperas", "completas"]);
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const SECTION_NAMES: Array<[RegExp, string]> = [
  [/^INVOCACI[ÓO]N INICIAL$/i, "invocacion"],
  [/^INVITATORIO$/i, "invitatorio"],
  [/^HIMNO(?::.*)?$/i, "himno"],
  [/^SALMODIA$/i, "salmodia"],
  [/^LECTURA (BREVE|B[ÍI]BLICA|PRIMERA|SEGUNDA)(?:\s+.*)?$/i, "lectura"],
  [/^PRIMERA LECTURA(?:\s+.*)?$/i, "primera_lectura"],
  [/^SEGUNDA LECTURA(?:\s+.*)?$/i, "segunda_lectura"],
  [/^RESPONSORIO(?: BREVE)?$/i, "responsorio"],
  [/^C[ÁA]NTICO EVANG[ÉE]LICO$/i, "cantico_evangelico"],
  [/^PRECES$/i, "preces"],
  [/^PADRE NUESTRO(?:\.\.\.)?$/i, "padrenuestro"],
  [/^ORACI[ÓO]N$/i, "oracion"],
  [/^CONCLUSI[ÓO]N$/i, "conclusion"],
];

const SECTION_TITLES: Record<string, string> = {
  inicio: "Inicio",
  invocacion: "Invocación inicial",
  invitatorio: "Invitatorio",
  himno: "Himno",
  salmodia: "Salmodia",
  lectura: "Lectura",
  primera_lectura: "Primera lectura",
  segunda_lectura: "Segunda lectura",
  responsorio: "Responsorio",
  cantico_evangelico: "Cántico evangélico",
  preces: "Preces",
  padrenuestro: "Padre nuestro",
  oracion: "Oración",
  conclusion: "Conclusión",
};

const decodeEntities = (value: string) => {
  const entities: Record<string, string> = {
    nbsp: " ", amp: "&", quot: '"', apos: "'", lt: "<", gt: ">",
    aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú",
    Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú",
    ntilde: "ñ", Ntilde: "Ñ", uuml: "ü", Uuml: "Ü",
    laquo: "«", raquo: "»", ndash: "–", mdash: "—", dagger: "†",
  };

  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-zA-Z]+);/g, (entity, name) => entities[name] ?? entity);
};

const htmlToLines = (html: string) => {
  const body = html.match(/<div[^>]+id=["']cuerpo["'][^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
  return decodeEntities(
    body
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<\/(?:p|div|center|tr|td|table|h\d)>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
};

const paragraphType = (text: string) => {
  if (/^Ant(?:\s*\d+)?\./i.test(text)) return "antifona";
  if (/^[VR]\.\s*/i.test(text)) return "respuesta";
  if (/^Se pueden añadir/i.test(text)) return "rubrica";
  if (/^(Salmo|Cántico:|Lectura breve)/i.test(text)) return "subtitulo";
  return "texto";
};

const parseHour = (html: string) => {
  const lines = htmlToLines(html);
  const sections: Array<{ tipo: string; titulo: string; contenido: Array<{ tipo: string; texto: string }> }> = [];
  let current = { tipo: "inicio", titulo: "Inicio", contenido: [] as Array<{ tipo: string; texto: string }> };

  for (const line of lines) {
    const matched = SECTION_NAMES.find(([pattern]) => pattern.test(line));
    if (matched) {
      if (current.contenido.length) sections.push(current);
      current = { tipo: matched[1], titulo: SECTION_TITLES[matched[1]], contenido: [] };
      if (/^HIMNO:/i.test(line)) current.contenido.push({ tipo: "subtitulo", texto: line.replace(/^HIMNO:\s*/i, "") });
      continue;
    }

    if (/^(OFICIO DE LECTURA|LAUDES|TERCIA|SEXTA|NONA|V[ÍI]SPERAS|COMPLETAS)$/i.test(line)) continue;
    current.contenido.push({ tipo: paragraphType(line), texto: line });
  }

  if (current.contenido.length) sections.push(current);
  return sections;
};

const parseDay = (html: string) => {
  const lines = htmlToLines(html).filter((line) => !/^(Oficio de Lectura|Laudes|Tercia|Sexta|Nona|Vísperas|Completas)$/i.test(line));
  return {
    tiempo_liturgico: lines[0] ?? "",
    celebracion: lines[1] ?? "",
    detalle: lines[2] ?? "",
    fecha_texto: lines[3] ?? "",
  };
};

const validDate = (raw: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false;
  const date = new Date(`${raw}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === raw;
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const url = new URL(req.url ?? "/api/liturgia-horas", "http://localhost");
  const fecha = String(req.query?.fecha ?? url.searchParams.get("fecha") ?? "").slice(0, 10);
  const hora = String(req.query?.hora ?? url.searchParams.get("hora") ?? "laudes").toLowerCase();
  const variante = Number(req.query?.variante ?? url.searchParams.get("variante") ?? 1);

  if (!validDate(fecha) || !HOURS.has(hora) || !Number.isInteger(variante) || variante < 1 || variante > 3) {
    res.status(400).json({ ok: false, error: "PARAMETROS_INVALIDOS" });
    return;
  }

  const [year, month, day] = fecha.split("-");
  const monthSlug = MONTHS[Number(month) - 1];
  const variantPath = variante === 1 ? "" : `${variante}/`;
  const baseUrl = `https://liturgiadelashoras.github.io/sync/${year}/${monthSlug}/${day}/${variantPath}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    const [dayResponse, hourResponse] = await Promise.all([
      fetch(`${baseUrl}index.htm`, { signal: controller.signal, headers: { "User-Agent": "LVJPRAYER/1.0" } }),
      fetch(`${baseUrl}${hora}.htm`, { signal: controller.signal, headers: { "User-Agent": "LVJPRAYER/1.0" } }),
    ]);
    clearTimeout(timeout);

    if (!dayResponse.ok || !hourResponse.ok) {
      res.status(404).json({ ok: false, error: "CONTENIDO_NO_DISPONIBLE" });
      return;
    }

    const decoder = new TextDecoder("iso-8859-1");
    const [dayHtml, hourHtml] = await Promise.all([
      dayResponse.arrayBuffer().then((buffer) => decoder.decode(buffer)),
      hourResponse.arrayBuffer().then((buffer) => decoder.decode(buffer)),
    ]);

    const secciones = parseHour(hourHtml);
    if (!secciones.length) throw new Error("No fue posible reconocer las secciones litúrgicas");

    res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=86400");
    res.status(200).json({
      ok: true,
      fecha,
      hora,
      variante,
      ...parseDay(dayHtml),
      secciones,
      fuente: { nombre: "Liturgia de las Horas", url: `${baseUrl}${hora}.htm` },
      obtenido_en: new Date().toISOString(),
    });
  } catch (error) {
    res.status(502).json({
      ok: false,
      error: "FUENTE_NO_DISPONIBLE",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

type ApiRequest = { url?: string; query?: Record<string, string | string[] | undefined> };
type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (body: unknown) => void };
};
type Item = { tipo: string; texto: string };
type Section = { tipo: string; titulo: string; contenido: Item[] };

const HOURS = new Set(["oficio", "laudes", "tercia", "sexta", "nona", "visperas", "completas"]);
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const IB_HOURS: Record<string, string> = {
  oficio: "ufficio_delle_letture", laudes: "lodi", tercia: "ora_media",
  sexta: "ora_media", nona: "ora_media", visperas: "vespri", completas: "compieta",
};
const HOUR_TITLE = /^(?:BREVIARIO|OFICIO DE LECTURA|LAUDES|(?:HORA\s+)?(?:TERCIA|SEXTA|NONA)|(?:I{1,2}\s+)?V[ÍI]SPERAS|COMPLETAS)$/i;
const SECTION_NAMES: Array<[RegExp, string]> = [
  [/^INVOCACI[ÓO]N INICIAL$/i, "invocacion"], [/^INVITATORIO$/i, "invitatorio"],
  [/^HIMNO(?::.*)?$/i, "himno"], [/^SALMODIA$/i, "salmodia"],
  [/^LECTURA BREVE(?:\s+.*)?$/i, "lectura"], [/^PRIMERA LECTURA(?:\s+.*)?$/i, "primera_lectura"],
  [/^SEGUNDA LECTURA(?:\s+.*)?$/i, "segunda_lectura"], [/^RESPONSORIO(?: BREVE)?$/i, "responsorio"],
  [/^C[ÁA]NTICO EVANG[ÉE]LICO$/i, "cantico_evangelico"], [/^PRECES$/i, "preces"],
  [/^PADRE NUESTRO(?:\.\.\.)?$/i, "padrenuestro"], [/^TE DEUM$/i, "te_deum"],
  [/^ORACI[ÓO]N$/i, "oracion"], [/^CONCLUSI[ÓO]N$/i, "conclusion"],
];
const TITLES: Record<string, string> = {
  inicio: "Inicio", invocacion: "Invocación inicial", invitatorio: "Invitatorio",
  himno: "Himno", salmodia: "Salmodia", lectura: "Lectura breve",
  primera_lectura: "Primera lectura", segunda_lectura: "Segunda lectura",
  responsorio: "Responsorio", cantico_evangelico: "Cántico evangélico",
  preces: "Preces", padrenuestro: "Padre nuestro", te_deum: "Te Deum",
  oracion: "Oración", conclusion: "Conclusión",
};

const decodeEntities = (value: string) => {
  const named: Record<string, string> = {
    nbsp: " ", amp: "&", quot: '"', apos: "'", lt: "<", gt: ">",
    aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú",
    Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú",
    ntilde: "ñ", Ntilde: "Ñ", uuml: "ü", Uuml: "Ü",
    laquo: "«", raquo: "»", ndash: "–", mdash: "—", dagger: "†",
    iexcl: "¡", iquest: "¿",
  };
  return value
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(Number.parseInt(n, 16)))
    .replace(/&([a-zA-Z]+);/g, (entity, name) => named[name] ?? entity);
};

const cleanLines = (html: string) => decodeEntities(html
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/<style[\s\S]*?<\/style>/gi, "")
  .replace(/<br\s*\/?\s*>/gi, "\n")
  .replace(/<\/(?:p|div|center|tr|td|table|h\d)>/gi, "\n")
  .replace(/<[^>]+>/g, ""))
  .split(/\n+/).map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);

const oldLines = (html: string) => {
  const body = html.match(/<div[^>]+id=["']cuerpo["'][^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
  return cleanLines(body);
};
const ibInner = (html: string) =>
  html.match(/<div[^>]+class=["'][^"']*\binner\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1] ?? "";

const itemType = (text: string) => {
  if (/^Ant(?:\s*\d+)?\./i.test(text)) return "antifona";
  if (/^[VR]\.\s*/i.test(text)) return "respuesta";
  if (/^(Se pueden|Todos|El presidente|Si preside)/i.test(text)) return "rubrica";
  if (/^[IVXLCDM]+\.?$/i.test(text.trim())) return "subtitulo";
  const letters = text.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");
  if (letters && text.length <= 90 && text === text.toLocaleUpperCase("es")) return "subtitulo";
  if (/^(Salmo|Cántico|Lectura breve)/i.test(text)) return "subtitulo";
  return "texto";
};
const hourMarker = (line: string) => {
  const value = line.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/\btercia\b/.test(value)) return "tercia";
  if (/\bsexta\b/.test(value)) return "sexta";
  if (/\bnona\b/.test(value)) return "nona";
  return null;
};

const parseLines = (input: string[], hora?: string) => {
  let lines = input;
  if (hora && ["tercia", "sexta", "nona"].includes(hora)) {
    // iBreviary publica el cuerpo común de la Hora intermedia y, al final,
    // tres oraciones alternativas encabezadas TERCIA, SEXTA y NONA.
    const alternatives = lines
      .map((line, index) => ({ marker: hourMarker(line), index }))
      .filter((entry) => entry.marker && /^(?:TERCIA|SEXTA|NONA)$/i.test(lines[entry.index]));
    const firstAlternative = alternatives[0]?.index ?? -1;
    const selected = alternatives.find((entry) => entry.marker === hora);
    if (firstAlternative >= 0 && selected) {
      const following = alternatives.find((entry) => entry.index > selected.index);
      const lastAlternative = alternatives[alternatives.length - 1].index;
      const conclusion = lines.findIndex((line, index) =>
        index > lastAlternative && /^CONCLUSI[ÓO]N$/i.test(line));
      const selectedEnd = following?.index ?? (conclusion >= 0 ? conclusion : undefined);
      lines = [
        ...lines.slice(0, firstAlternative),
        ...lines.slice(selected.index + 1, selectedEnd),
        ...(conclusion >= 0 ? lines.slice(conclusion) : []),
      ];
    }
  }
  const sections: Section[] = [];
  let current: Section = { tipo: "inicio", titulo: "Inicio", contenido: [] };
  const flush = () => { if (current.contenido.length) sections.push(current); };
  for (const line of lines) {
    const matched = SECTION_NAMES.find(([pattern]) => pattern.test(line));
    if (matched) {
      flush();
      current = { tipo: matched[1], titulo: TITLES[matched[1]], contenido: [] };
      const remainder = matched[1] === "lectura"
        ? line.replace(/^LECTURA BREVE\s*/i, "").trim()
        : matched[1] === "primera_lectura"
          ? line.replace(/^PRIMERA LECTURA\s*/i, "").trim()
          : matched[1] === "segunda_lectura"
            ? line.replace(/^SEGUNDA LECTURA\s*/i, "").trim()
            : line.replace(matched[0], "").trim();
      if (remainder) current.contenido.push({ tipo: "subtitulo", texto: remainder });
      continue;
    }
    if (HOUR_TITLE.test(line) || /^[-–]?\s*Men[úu]\s*[-–]?$/i.test(line)) continue;
    current.contenido.push({ tipo: itemType(line), texto: line });
  }
  flush();
  return sections;
};

const parseIBHour = (html: string, hora: string) => {
  const inner = ibInner(html);
  if (!inner) return [];
  const paragraphs = [...inner.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)];
  return parseLines(paragraphs.flatMap((match) => cleanLines(match[1])), hora);
};
const parseOldDay = (html: string) => {
  const lines = oldLines(html).filter((line) => !HOUR_TITLE.test(line));
  return { tiempo_liturgico: lines[0] ?? "", celebracion: lines[1] ?? "", detalle: lines[2] ?? "", fecha_texto: lines[3] ?? "" };
};
const roman = (n: number) => ["I", "II", "III", "IV"][Math.max(0, Math.min(3, n - 1))];
const parseIBDay = (html: string, fecha: string) => {
  const lines = cleanLines(ibInner(html)).filter((line) => !/^Breviario$/i.test(line));
  const description = lines[1] ?? "";
  const typeLine = lines.find((line) => /^Tipo:/i.test(line)) ?? "";
  const season = (`${description} ${typeLine}`.match(/(?:Tempo|Tiempo):?\s*(Adviento|Navidad|Cuaresma|Pascua|Ordinario)/i)
    ?? description.match(/Tiempo\s+(Adviento|Navidad|Cuaresma|Pascua|Ordinario)/i))?.[1] ?? "";
  const week = description.match(/(\d+)[ªa]\s+semana/i);
  const type = /ferial/i.test(typeLine) ? "De la Feria" : typeLine.replace(/^Tipo:\s*/i, "").split("-")[0].trim();
  const fallbackDate = new Intl.DateTimeFormat("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${fecha}T12:00:00Z`));
  return {
    tiempo_liturgico: season ? `TIEMPO ${season.toUpperCase()}` : "LITURGIA DE LAS HORAS",
    celebracion: description.replace(/\s*\([^)]*\).*$/, "").trim(),
    detalle: [type, week ? `Salterio ${roman(Number(week[1]))}` : ""].filter(Boolean).join(" · "),
    fecha_texto: lines[0] ?? fallbackDate,
  };
};

const validDate = (raw: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false;
  const date = new Date(`${raw}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === raw;
};
const fetchPage = (url: string, signal: AbortSignal) => fetch(url, {
  signal, headers: { "User-Agent": "Mozilla/5.0 (compatible; LVJPRAYER/1.0; +https://lavozdejesus.vercel.app)" },
});

const loadIBreviary = async (fecha: string, hora: string, signal: AbortSignal) => {
  const base = `https://www.ibreviary.com/m2/breviario.php?date=${fecha}&lang=es`;
  const hourUrl = `${base}&s=${IB_HOURS[hora]}`;
  const [dayResponse, hourResponse] = await Promise.all([fetchPage(base, signal), fetchPage(hourUrl, signal)]);
  if (!dayResponse.ok || !hourResponse.ok) throw new Error(`iBreviary respondió ${dayResponse.status}/${hourResponse.status}`);
  const [dayHtml, hourHtml] = await Promise.all([dayResponse.text(), hourResponse.text()]);
  const secciones = parseIBHour(hourHtml, hora);
  if (!secciones.length) throw new Error("iBreviary no devolvió secciones reconocibles");
  return { metadata: parseIBDay(dayHtml, fecha), secciones, name: "iBreviary", url: hourUrl };
};

const loadFallback = async (fecha: string, hora: string, variante: number, signal: AbortSignal) => {
  const [year, month, day] = fecha.split("-");
  const base = `https://liturgiadelashoras.github.io/sync/${year}/${MONTHS[Number(month) - 1]}/${day}/`;
  const candidates = variante === 1 ? [`${base}1/`, base] : [`${base}${variante}/`];
  for (const candidate of candidates) {
    const [dayResponse, hourResponse] = await Promise.all([
      fetchPage(`${candidate}index.htm`, signal), fetchPage(`${candidate}${hora}.htm`, signal),
    ]);
    if (!dayResponse.ok || !hourResponse.ok) continue;
    const decoder = new TextDecoder("iso-8859-1");
    const [dayHtml, hourHtml] = await Promise.all([
      dayResponse.arrayBuffer().then((b) => decoder.decode(b)),
      hourResponse.arrayBuffer().then((b) => decoder.decode(b)),
    ]);
    const secciones = parseLines(oldLines(hourHtml));
    if (secciones.length) return {
      metadata: parseOldDay(dayHtml), secciones, name: "Liturgia de las Horas", url: `${candidate}${hora}.htm`,
    };
  }
  throw new Error("Ninguna fuente devolvió contenido disponible");
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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 14000);
  try {
    let content;
    try {
      content = await loadIBreviary(fecha, hora, controller.signal);
    } catch {
      content = await loadFallback(fecha, hora, variante, controller.signal);
    }
    res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=86400");
    res.status(200).json({
      ok: true, fecha, hora, variante, ...content.metadata, secciones: content.secciones,
      fuente: { nombre: content.name, url: content.url }, obtenido_en: new Date().toISOString(),
    });
  } catch (error) {
    res.status(502).json({
      ok: false, error: "FUENTE_NO_DISPONIBLE", detail: error instanceof Error ? error.message : String(error),
    });
  } finally {
    clearTimeout(timeout);
  }
}

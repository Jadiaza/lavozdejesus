import { libroByMatchTitle, LIBROS, norm, type LibroDef } from "./books";

/**
 * Parser de "toda_la_biblia.txt" (Straubinger).
 *
 * Marcadores detectados:
 *  - `__titulo: <Nombre>`  → inicio de libro (opcional; usamos también línea "<Libro> N" como fallback)
 *  - Línea de cabecera "<NombreLibro> <N>" (ej. "Génesis 1", "Salmo 23") → capítulo actual
 *  - `^({versiculo})` en el texto → nuevo versículo dentro del capítulo actual (incremental desde 1)
 *  - `{nota al pie:?}` justo después de un `^({versiculo})` → marca "tiene nota Straubinger"
 *
 * Todo lo que no está dentro de un `^({versiculo})` (subtítulos, poesía suelta, etc.)
 * se ignora en esta Fase 1.
 */

export interface ParsedVerse {
  libroId: number;
  capitulo: number;
  versiculo: number;
  texto: string;
  tieneNota: boolean;
}

export interface ParsedBible {
  versiculos: ParsedVerse[];
  librosDetectados: number[]; // ids
  capitulosPorLibro: Record<number, number>;
  errores: string[];
}

const VERSE_MARKER = "^({versiculo})";
const NOTA_MARKER = "{nota al pie:?}";

/**
 * Detecta si una línea de una sola sentencia corta es cabecera "Libro N".
 * Devuelve {libro, cap} o null.
 */
function detectChapterHeader(line: string): { libro: LibroDef; cap: number } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 60) return null;
  const m = trimmed.match(/^(.+?)\s+(\d{1,3})$/);
  if (!m) return null;
  const libro = libroByMatchTitle(m[1]);
  if (!libro) return null;
  return { libro, cap: parseInt(m[2], 10) };
}

export function parseBiblia(raw: string): ParsedBible {
  const versiculos: ParsedVerse[] = [];
  const capitulosPorLibro: Record<number, number> = {};
  const librosSet = new Set<number>();
  const errores: string[] = [];

  let currentLibro: LibroDef | null = null;
  let currentCap = 0;
  let currentVerso = 0;

  const lines = raw.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // __titulo: X  → establece libro
    if (line.startsWith("__titulo:")) {
      const nombre = line.slice("__titulo:".length).trim();
      const libro = LIBROS.find((l) => norm(l.matchTitle) === norm(nombre)) || libroByMatchTitle(nombre);
      if (libro) {
        currentLibro = libro;
        currentCap = 0;
        currentVerso = 0;
      }
      continue;
    }

    // "Génesis 1" (cabecera de capítulo)
    const header = detectChapterHeader(line);
    if (header) {
      currentLibro = header.libro;
      currentCap = header.cap;
      currentVerso = 0;
      librosSet.add(currentLibro.id);
      capitulosPorLibro[currentLibro.id] = Math.max(
        capitulosPorLibro[currentLibro.id] ?? 0,
        currentCap,
      );
      continue;
    }

    // Línea con versículos
    if (!currentLibro || currentCap === 0) continue;
    if (!line.includes(VERSE_MARKER)) continue;

    // Dividir por el marcador
    const parts = line.split(VERSE_MARKER);
    // parts[0] es texto anterior al primer marcador (basura o continuación → ignorar en Fase 1)
    for (let p = 1; p < parts.length; p++) {
      let chunk = parts[p];
      let tieneNota = false;
      if (chunk.startsWith(NOTA_MARKER)) {
        tieneNota = true;
        chunk = chunk.slice(NOTA_MARKER.length);
      }
      const texto = chunk.trim().replace(/\s+/g, " ");
      if (!texto) continue;
      currentVerso += 1;
      versiculos.push({
        libroId: currentLibro.id,
        capitulo: currentCap,
        versiculo: currentVerso,
        texto,
        tieneNota,
      });
    }
  }

  for (const id of librosSet) librosSet.add(id);
  return {
    versiculos,
    librosDetectados: Array.from(librosSet).sort((a, b) => a - b),
    capitulosPorLibro,
    errores,
  };
}

// ------------- Comentarios (notas Straubinger) -------------

export interface ParsedNota {
  libroId: number;
  capitulo: number;
  versiculo: number;
  texto: string;
}

export interface ParsedNotas {
  notas: ParsedNota[];
  errores: string[];
}

/**
 * Parser de "todos los comentarios.txt".
 *
 * El archivo NO contiene marcadores de libro/capítulo: es un flujo secuencial de
 * notas con formato `* <N>. <texto...>` (potencialmente multilínea).
 * Estrategia Fase 1: usar el mapa de capítulos parseado de la Biblia (con la lista
 * de versículos que tienen `{nota al pie:?}`) para reasignar cada nota al versículo
 * correcto en orden. Cuando el número de nota (`* N.`) reinicia (N=1 tras un N>1),
 * avanzamos al siguiente capítulo del siguiente libro.
 */
export function parseComentarios(raw: string, biblia: ParsedBible): ParsedNotas {
  const notas: ParsedNota[] = [];
  const errores: string[] = [];

  // Índice ordenado de (libro, capitulo) según aparecen en la Biblia parseada.
  const capsOrdenados: Array<{ libroId: number; capitulo: number }> = [];
  {
    const seen = new Set<string>();
    for (const v of biblia.versiculos) {
      const k = `${v.libroId}:${v.capitulo}`;
      if (!seen.has(k)) {
        seen.add(k);
        capsOrdenados.push({ libroId: v.libroId, capitulo: v.capitulo });
      }
    }
  }

  let capIdx = 0;
  let lastNum = 0;
  let current: { num: number; buf: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    if (capIdx >= capsOrdenados.length) return;
    const { libroId, capitulo } = capsOrdenados[capIdx];
    notas.push({
      libroId,
      capitulo,
      versiculo: current.num,
      texto: current.buf.join(" ").replace(/\s+/g, " ").trim(),
    });
    current = null;
  };

  const lines = raw.split(/\r?\n/);
  const startRe = /^\*\s+(\d{1,3})\.\s+(.*)$/;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const m = line.match(startRe);
    if (m) {
      const num = parseInt(m[1], 10);
      // ¿Reinicio de numeración? → siguiente capítulo
      if (current && num <= lastNum) {
        flush();
        capIdx += 1;
      } else {
        flush();
      }
      current = { num, buf: [m[2]] };
      lastNum = num;
    } else if (line.trim()) {
      if (current) current.buf.push(line.trim());
    }
  }
  flush();

  return { notas, errores };
}
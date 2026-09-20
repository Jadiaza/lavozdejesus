import type { BibliaLibro } from "@/services/bibliaService";

export interface BibliaReferenciaResuelta {
  libro: BibliaLibro;
  capitulo: number;
  versiculoInicio?: number;
  versiculoFin?: number;
  referencia: string;
}

export type BibliaReferenciaResultado =
  | { ok: true; data: BibliaReferenciaResuelta }
  | { ok: false; message: string };

export function normalizarReferencia(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function aliasesForBook(book: BibliaLibro): string[] {
  const aliases = new Set(
    [book.nombre, book.abreviatura, book.codigo]
      .map(normalizarReferencia)
      .filter(Boolean),
  );

  const nombre = normalizarReferencia(book.nombre);
  if (nombre.endsWith("s") && nombre.length > 4) aliases.add(nombre.slice(0, -1));

  return Array.from(aliases);
}

export function sugerirLibrosBiblicos(
  input: string,
  libros: BibliaLibro[],
  limit = 6,
): BibliaLibro[] {
  const query = normalizarReferencia(input).replace(/\s+\d.*$/, "").trim();
  if (!query) return [];

  return libros
    .filter((book) =>
      aliasesForBook(book).some(
        (alias) => alias.startsWith(query) || alias.includes(query),
      ),
    )
    .sort((a, b) => a.orden - b.orden)
    .slice(0, limit);
}

export function resolverReferenciaBiblica(
  input: string,
  libros: BibliaLibro[],
): BibliaReferenciaResultado {
  const normalized = normalizarReferencia(input);
  if (!normalized) {
    return { ok: false, message: "Escribe una referencia bíblica." };
  }

  const candidates = libros
    .flatMap((libro) => aliasesForBook(libro).map((alias) => ({ libro, alias })))
    .sort((a, b) => b.alias.length - a.alias.length);

  const match = candidates.find(
    ({ alias }) => normalized === alias || normalized.startsWith(`${alias} `),
  );

  if (!match) {
    return { ok: false, message: "No encontramos ese libro bíblico." };
  }

  const remainder = normalized.slice(match.alias.length).trim();
  if (!remainder) {
    return {
      ok: false,
      message: `Indica el capítulo de ${match.libro.nombre}.`,
    };
  }

  const parts = remainder.match(
    /^(\d{1,3})(?:\s*(?:[:,]|\s)\s*(\d{1,3})(?:\s*-\s*(\d{1,3}))?)?$/,
  );

  if (!parts) {
    return {
      ok: false,
      message: "No encontramos esa referencia bíblica.",
    };
  }

  const capitulo = Number(parts[1]);
  const versiculoInicio = parts[2] ? Number(parts[2]) : undefined;
  const versiculoFin = parts[3] ? Number(parts[3]) : versiculoInicio;

  if (capitulo < 1 || capitulo > match.libro.capitulos) {
    return {
      ok: false,
      message: `${match.libro.nombre} no tiene el capítulo ${capitulo}.`,
    };
  }

  if (
    versiculoInicio !== undefined &&
    (versiculoInicio < 1 ||
      versiculoFin === undefined ||
      versiculoFin < versiculoInicio)
  ) {
    return {
      ok: false,
      message: "El rango de versículos no es válido.",
    };
  }

  const referencia =
    versiculoInicio === undefined
      ? `${match.libro.nombre} ${capitulo}`
      : `${match.libro.nombre} ${capitulo},${versiculoInicio}${
          versiculoFin !== versiculoInicio ? `-${versiculoFin}` : ""
        }`;

  return {
    ok: true,
    data: {
      libro: match.libro,
      capitulo,
      versiculoInicio,
      versiculoFin,
      referencia,
    },
  };
}

export type TestamentoBiblico = "AT" | "NT";

export interface BibliaVersion {
  codigo: string;
  nombre: string;
  abreviatura: string;
  idioma: string;
  licencia: string;
  canon: number | string;
  versificacion: string;
}

export interface BibliaLibro {
  id: number;
  codigo: string;
  nombre: string;
  abreviatura: string;
  testamento: TestamentoBiblico;
  grupo: string;
  orden: number;
  capitulos: number;
}

export interface BibliaVersiculo {
  id: string;
  capitulo: number;
  versiculo: number;
  texto: string;
  titulo_seccion: string;
  tiene_nota: boolean;
  notas: BibliaNota[];
}

export interface BibliaNota {
  id: string;
  texto: string;
  orden: number;
  numero: number | null;
  tipo: string;
  titulo: string;
  referencia: string;
}

export interface BibliaMapa {
  id: number;
  titulo: string;
  descripcion: string;
  periodo: string;
  imagen_url: string;
  fuente: string;
  fuente_url: string;
  licencia: string;
}

export interface BibliaPersonaje {
  id: number;
  nombre: string;
  nombre_alternativo: string;
  testamento: TestamentoBiblico;
  categoria: string;
  resumen: string;
  pasajes_principales: string;
  ensenanza: string;
  imagen_url: string;
  fuente: string;
  fuente_url: string;
  licencia: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const baseUrl = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "https://lavozdejesus.co")
  .trim()
  .replace(/\/+$/, "");

const apiUrl =
  (import.meta.env.VITE_BIBLIA_API_URL as string | undefined)?.trim() ||
  `${baseUrl}/api/biblia.php`;

async function request<T>(params: Record<string, string | number>): Promise<T> {
  const url = new URL(apiUrl, window.location.origin);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));

  let response: Response;
  try {
    response = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  } catch {
    throw new Error("No se pudo conectar con el servidor bíblico. Comprueba tu conexión e inténtalo nuevamente.");
  }
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.success || payload.data === undefined) {
    throw new Error(payload?.message || "No fue posible consultar la Biblia.");
  }

  return payload.data;
}

export const getBibliaCatalogo = (version = "SPAPLATENSE") =>
  request<{ version: BibliaVersion; libros: BibliaLibro[] }>({ accion: "catalogo", version });

export const getBibliaVersiones = () =>
  request<BibliaVersion[]>({ accion: "versiones" });

export const getBibliaCapitulo = (
  libro: string,
  capitulo: number,
  version = "SPAPLATENSE",
) =>
  request<{
    version: BibliaVersion;
    libro: BibliaLibro;
    capitulo: number;
    versiculos: BibliaVersiculo[];
  }>({ accion: "capitulo", version, libro, capitulo }).then((data) => ({
    ...data,
    versiculos: data.versiculos.map((versiculo) => ({
      ...versiculo,
      notas: Array.isArray(versiculo.notas) ? versiculo.notas : [],
    })),
  }));

export const getBibliaNotas = (
  libro: string,
  capitulo: number,
  versiculo: number,
  version = "SPAPLATENSE",
) => request<BibliaNota[]>({ accion: "notas", version, libro, capitulo, versiculo });

export const getBibliaMapas = () =>
  request<BibliaMapa[]>({ accion: "mapas" }).then((maps) =>
    maps.map((map) => ({
      ...map,
      imagen_url: map.imagen_url.startsWith("/") ? `${baseUrl}${map.imagen_url}` : map.imagen_url,
    })),
  );

export const getBibliaPersonajes = () =>
  request<BibliaPersonaje[]>({ accion: "personajes" }).then((characters) =>
    characters.map((character) => ({
      ...character,
      imagen_url: character.imagen_url.startsWith("/")
        ? `${baseUrl}${character.imagen_url}`
        : character.imagen_url,
    })),
  );

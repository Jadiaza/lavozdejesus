export type LiturgyParagraphType = "texto" | "antifona" | "respuesta" | "rubrica" | "subtitulo";

export interface LiturgyParagraph {
  tipo: LiturgyParagraphType;
  texto: string;
}

export interface LiturgySection {
  tipo: string;
  titulo: string;
  contenido: LiturgyParagraph[];
}

export interface LiturgyHourResponse {
  ok: true;
  fecha: string;
  hora: string;
  variante: number;
  tiempo_liturgico: string;
  celebracion: string;
  detalle: string;
  fecha_texto: string;
  secciones: LiturgySection[];
  fuente: { nombre: string; url: string };
  obtenido_en: string;
}

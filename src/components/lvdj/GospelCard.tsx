/*
==============================================================================
PROYECTO: LA VOZ DE JESUS - PWA RADIO CATOLICA
COMPONENTE: GospelCard.tsx
VERSION: 1.0.0

DESARROLLADO POR:
Ing. Jose Alberto Diaz Agresott

PROPIETARIO:
Emisora Catolica La Voz de Jesus

UBICACION:
Monteria - Cordoba - Colombia

DERECHOS RESERVADOS
Emisora La Voz de Jesus

DESCRIPCION:
Tarjeta de la Palabra para Hoy mostrada en el inicio de la aplicacion.

FUNCIONES:
- Lee la liturgia publicada desde Google Sheets cuando no recibe datos por props.
- Muestra la frase principal del dia desde el campo palabra_hoy.
- Muestra la cita biblica desde el campo evangelio_cita.
- Enlaza con la pantalla completa de Lecturas del Dia.
- Incluye variante compacta para integrarse en la version de escritorio.

==============================================================================
*/

import { BookOpen, ChevronRight } from "lucide-react";
import bible from "@/assets/bible.jpg";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LiturgiaDia, getTodayLiturgia } from "@/services/sheetsService";

interface GospelCardProps {
  evangelioCita?: string;
  evangelioVersiculo?: string;
  palabraHoy?: string;
  onRead?: () => void;
  readHref?: string;
  className?: string;
  compact?: boolean;
}

const stripOuterQuotes = (value: string) =>
  value.replace(/^[«"“]\s*/, "").replace(/\s*[»"”]$/, "");

const normalizeText = (value: string) => value.replace(/\s+/g, " ").trim();

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const stripCitationFromPhrase = (phrase: string, citation: string) => {
  let cleanPhrase = normalizeText(stripOuterQuotes(phrase));
  const cleanCitation = normalizeText(citation);

  if (cleanCitation) {
    cleanPhrase = cleanPhrase
      .replace(new RegExp(`\\s*[-–—,;:]*\\s*${escapeRegExp(cleanCitation)}\\.?$`, "i"), "")
      .trim();
  }

  return cleanPhrase.replace(
    /\s*[-–—,;:]*\s*(?:[1-3]\s*)?[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\.?\s+\d{1,3}\s*,\s*\d{1,3}(?:[-–]\d{1,3})?\.?$/i,
    "",
  ).trim();
};

const normalizeGospelCitation = (citation: string) => {
  const text = normalizeText(citation);
  const match = text.match(
    /\b(?:san\s+)?(Mateo|Marcos|Lucas|Juan)\b\.?\s+(\d{1,3}\s*,\s*\d{1,3}(?:\s*[-–]\s*\d{1,3})?)/i,
  );

  if (!match) return text;

  const evangelist =
    match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
  const passage = match[2].replace(/\s+/g, " ");

  return `${evangelist} ${passage}`;
};

const formatPhraseAsExtract = (phrase: string) => {
  const text = normalizeText(stripOuterQuotes(phrase))
    .replace(/\.{3,}$/, "")
    .replace(/[.!?¡¿]+$/, "")
    .trim();

  return text ? `${text}...` : "";
};

const quotePhrase = (phrase: string) => {
  const cleanPhrase = normalizeText(phrase);
  if (!cleanPhrase) return "";
  if (/^[«"“].*[»"”]$/.test(cleanPhrase)) return cleanPhrase;

  return `«${cleanPhrase}»`;
};

export const GospelCard = ({
  evangelioCita,
  evangelioVersiculo,
  palabraHoy,
  onRead,
  readHref = "/lecturas-del-dia",
  className = "",
  compact = false,
}: GospelCardProps) => {
  const [liturgia, setLiturgia] = useState<LiturgiaDia | null>(null);
  const [loading, setLoading] = useState(
    !evangelioCita && !evangelioVersiculo && !palabraHoy,
  );
  const [error, setError] = useState(false);

  /* ==========================================================================
     CARGA DE LITURGIA
     ========================================================================== */

  useEffect(() => {
    if (evangelioCita || evangelioVersiculo || palabraHoy) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadLiturgia = async () => {
      try {
        const data = await getTodayLiturgia();
        if (!mounted) return;

        if (data) {
          setLiturgia(data);
          setError(false);
        } else {
          setLiturgia(null);
          setError(true);
        }
      } catch {
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadLiturgia();

    return () => {
      mounted = false;
    };
  }, [evangelioCita, evangelioVersiculo, palabraHoy]);

  /* ==========================================================================
     DATOS NORMALIZADOS PARA LA VISTA
     ========================================================================== */

  const evangelioCitaActual = evangelioCita ?? liturgia?.evangelio_cita ?? "";
  const evangelioVersiculoActual =
    evangelioVersiculo ?? liturgia?.evangelio_versiculo ?? "";
  const evangelioCitaVista = normalizeGospelCitation(
    evangelioVersiculoActual || evangelioCitaActual,
  );
  const palabraHoyActual =
    palabraHoy ??
    liturgia?.palabra_hoy ??
    (loading
      ? "Cargando palabra..."
      : error
        ? "La Palabra para hoy estara disponible pronto."
        : "La Palabra para hoy estara disponible pronto.");
  const palabraHoyVista = stripCitationFromPhrase(
    palabraHoyActual,
    evangelioCitaActual,
  );
  const palabraHoyExtracto =
    palabraHoy || liturgia?.palabra_hoy
      ? formatPhraseAsExtract(palabraHoyVista)
      : palabraHoyVista;
  const palabraHoyTexto =
    quotePhrase(palabraHoyExtracto) ||
    quotePhrase(palabraHoyVista) ||
    palabraHoyActual;
  const actionClassName =
    "shrink-0 inline-flex items-center gap-1 gold-border rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold hover:bg-gold/10 transition lg:px-4 lg:py-2";

  return (
    <article
      className={`relative overflow-hidden rounded-2xl glass gold-border shadow-deep ${
        compact ? "min-h-[168px] lg:min-h-[190px]" : ""
      } ${className}`}
    >
      {/* Fondo sobrio: conserva el tono capilla sin sacrificar legibilidad. */}
      <div className="absolute inset-0">
        <img
          src={bible}
          alt=""
          className="w-full h-full object-cover opacity-25"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-card/90 via-card/80 to-card/92" />
        <div className="absolute inset-0 bg-gradient-radial-gold opacity-15 mix-blend-screen" />
      </div>

      <div
        className={`relative flex h-full flex-col ${
          compact ? "px-6 py-5 lg:px-7 lg:py-6" : "px-5 py-5"
        }`}
      >
        <div className={`${compact ? "mb-3" : "mb-4"} flex items-center gap-2`}>
          <BookOpen className="h-4 w-4 text-gold shrink-0" />

          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
            Palabra para Hoy
          </span>
        </div>

        <p
          className={`mx-auto flex-1 content-center text-center font-semibold leading-snug text-foreground/95 ${
            compact
              ? "max-w-[42rem] text-[17px] lg:text-[19px]"
              : "max-w-[22rem] text-[15px] sm:text-base"
          }`}
        >
          {palabraHoyTexto}
        </p>

        <div
          className={`${
            compact ? "mt-4" : "mt-4"
          } flex items-center justify-between gap-3`}
        >
          <div className="min-w-0 text-xs font-medium text-gold/80 lg:text-sm">
            {evangelioCitaVista}
          </div>

          {onRead ? (
            <button onClick={onRead} className={actionClassName}>
              Leer Reflexion
              <ChevronRight className="h-3 w-3" />
            </button>
          ) : (
            <Link to={readHref} className={actionClassName}>
              Leer Reflexion
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

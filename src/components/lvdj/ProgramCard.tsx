/*
==============================================================================
PROYECTO: LA VOZ DE JESUS - PWA RADIO CATOLICA
COMPONENTE: ProgramCard.tsx
VERSION: 1.1.0

DESCRIPCION:
Tarjeta informativa del proximo programa de la emisora.

FUNCIONES:
- Consulta la programacion publicada desde la API MySQL.
- Calcula el siguiente programa segun dia y hora local.
- Actualiza el dato en tiempo real sin recargar la pagina.
- Conserva el boton "Ver Programacion" en movil y lo oculta en escritorio.
==============================================================================
*/

import { Clock, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ProgramacionRadio,
  getPublishedProgramacion,
} from "@/services/sheetsService";
import { formatTime, getNextProgram } from "@/utils/programacion";

const fallbackSchedule: ProgramacionRadio[] = [
  {
    id: "santo-rosario",
    dia_semana: "diario",
    hora_inicio: "06:00",
    hora_fin: "07:00",
    programa: "Santo Rosario",
    descripcion: "",
    imagen_url: "",
    estado: "publicado",
  },
  {
    id: "laudes",
    dia_semana: "diario",
    hora_inicio: "07:00",
    hora_fin: "08:00",
    programa: "Laudes",
    descripcion: "",
    imagen_url: "",
    estado: "publicado",
  },
  {
    id: "santa-misa",
    dia_semana: "diario",
    hora_inicio: "10:00",
    hora_fin: "11:00",
    programa: "Santa Misa",
    descripcion: "",
    imagen_url: "",
    estado: "publicado",
  },
  {
    id: "misericordia",
    dia_semana: "diario",
    hora_inicio: "15:00",
    hora_fin: "16:00",
    programa: "Hora de la Misericordia",
    descripcion: "",
    imagen_url: "",
    estado: "publicado",
  },
  {
    id: "adoracion",
    dia_semana: "diario",
    hora_inicio: "19:00",
    hora_fin: "20:00",
    programa: "Adoracion Eucaristica",
    descripcion: "",
    imagen_url: "",
    estado: "publicado",
  },
];

export const ProgramCard = ({
  programa,
  hora,
  imagenUrl,
  title,
  time,
  className = "",
  compact = false,
  showAction = true,
}: {
  programa?: string;
  hora?: string;
  imagenUrl?: string;
  title?: string;
  time?: string;
  className?: string;
  compact?: boolean;
  showAction?: boolean;
}) => {
  const [programacion, setProgramacion] = useState<ProgramacionRadio[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let mounted = true;

    getPublishedProgramacion()
      .then((data) => {
        if (mounted) setProgramacion(data);
      })
      .catch(() => {
        if (mounted) setProgramacion([]);
      });

    const timer = window.setInterval(() => setNow(new Date()), 60_000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const nextProgram = useMemo(() => {
    const source = programacion.length ? programacion : fallbackSchedule;
    return getNextProgram(source, now);
  }, [now, programacion]);

  const displayTitle = programa ?? title ?? nextProgram?.programa ?? "Santa Misa";
  const displayTime = hora ?? time ?? formatTime(nextProgram?.hora_inicio ?? "10:00");
  const backgroundImage = imagenUrl ?? nextProgram?.imagen_url ?? "";
  const showProgramImage = Boolean(backgroundImage) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [backgroundImage]);

  return (
    <article
      className={`relative overflow-hidden rounded-2xl glass gold-border shadow-deep bg-navy-deep/75 ${
        compact ? "min-h-[184px] p-4 lg:min-h-[205px]" : "p-5"
      } ${className}`}
    >
      {/* Imagen decorativa del programa: baja opacidad para no competir con el texto. */}
      {showProgramImage && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-85"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/44 via-navy-deep/18 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy-deep/40" />
        </div>
      )}
      {!showProgramImage && (
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-navy-deep/95 via-navy-deep/86 to-navy-deep/72" />
      )}
      <div className="pointer-events-none absolute inset-0 z-0 bg-black/10" />

      <div
        className={`relative z-10 flex h-full flex-col ${
          showProgramImage ? "justify-end gap-2" : ""
        }`}
      >
        <div
          className={`flex w-fit items-center gap-2 rounded-full bg-navy-deep/58 px-3 py-1.5 shadow-deep backdrop-blur-sm ${
            compact ? "mb-3" : "mb-4"
          }`}
        >
          <Clock className="h-4 w-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
          <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            Proximo Programa
          </span>
        </div>

        {!showProgramImage && (
          <div
            className={`max-w-full font-sans font-bold leading-tight text-foreground ${
              compact ? "text-xl" : "text-[1.35rem] sm:text-2xl"
            }`}
          >
            {displayTitle}
          </div>
        )}

        <div
          className={`mt-auto flex items-end justify-between gap-3 ${
            compact ? "pt-4" : showProgramImage ? "pt-0" : "pt-5"
          }`}
        >
          <div className="flex w-fit items-center gap-1.5 rounded-full bg-navy-deep/58 px-3 py-1.5 text-xs font-extrabold text-white shadow-deep backdrop-blur-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            <Clock className="h-3 w-3 text-white" /> {displayTime}
          </div>

          {!compact && showAction && (
            <Link
              to="/programacion"
              className="shrink-0 inline-flex items-center gap-1 gold-border rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold hover:bg-gold/10 transition"
            >
              Ver Programacion <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

/*
==============================================================================
PROYECTO: LA VOZ DE JESUS - PWA RADIO CATOLICA
COMPONENTE: ProgramCard.tsx
VERSION: 1.1.0

DESCRIPCION:
Tarjeta informativa del proximo programa de la emisora.

FUNCIONES:
- Consulta la programacion publicada desde Google Sheets.
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
  title,
  time,
  className = "",
  compact = false,
}: {
  title?: string;
  time?: string;
  className?: string;
  compact?: boolean;
}) => {
  const [programacion, setProgramacion] = useState<ProgramacionRadio[]>([]);
  const [now, setNow] = useState(() => new Date());

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

  const displayTitle = title ?? nextProgram?.programa ?? "Santa Misa";
  const displayTime = time ?? formatTime(nextProgram?.hora_inicio ?? "10:00");

  return (
    <article
      className={`relative overflow-hidden rounded-2xl glass gold-border flex items-center gap-4 ${
        compact ? "p-4" : "p-5"
      } ${className}`}
    >
      <div className="flex-1 min-w-0">
        <div className={`flex items-center gap-2 ${compact ? "mb-1.5" : "mb-2"}`}>
          <Clock className="h-4 w-4 text-gold" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            Proximo Programa
          </span>
        </div>

        <div className={`font-display leading-tight ${compact ? "text-xl" : "text-2xl"}`}>
          {displayTitle}
        </div>

        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-gold/70" /> {displayTime}
        </div>
      </div>

      {!compact && (
        <Link
          to="/programacion"
          className="shrink-0 inline-flex items-center gap-1 gold-border rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold hover:bg-gold/10 transition"
        >
          Ver Programacion <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </article>
  );
};

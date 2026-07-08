import { BookOpen, ChevronRight } from "lucide-react";
import bible from "@/assets/bible.jpg";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LiturgiaDia, getTodayLiturgia } from "@/services/sheetsService";

interface GospelCardProps {
  palabraHoy?: string;
  onRead?: () => void;
  readHref?: string;
  className?: string;
  compact?: boolean;
}

const splitPalabraForDisplay = (value: string) => {
  const trimmed = value.trim();
  const match = trimmed.match(/^(«[^»]+»|“[^”]+”|"[^"]+")\s+(.+)$/);

  if (!match) {
    return {
      frase: trimmed,
      referencia: "",
    };
  }

  return {
    frase: match[1],
    referencia: match[2].trim(),
  };
};

export const GospelCard = ({
  palabraHoy,
  onRead,
  readHref = "/lecturas-del-dia",
  className = "",
  compact: _compact,
}: GospelCardProps) => {
  const [liturgia, setLiturgia] = useState<LiturgiaDia | null>(null);
  const [loading, setLoading] = useState(!palabraHoy);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (palabraHoy) {
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
  }, [palabraHoy]);

  const palabraHoyActual =
    palabraHoy ??
    liturgia?.palabra_hoy ??
    (loading
      ? "Cargando palabra..."
      : error
        ? "La Palabra para hoy estara disponible pronto."
        : "La Palabra para hoy estara disponible pronto.");
  const palabraDisplay = splitPalabraForDisplay(palabraHoyActual);
  const actionClassName =
    "shrink-0 inline-flex items-center gap-1 gold-border rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold hover:bg-gold/10 transition";

  return (
    <article
      className={`relative overflow-hidden rounded-2xl glass gold-border shadow-deep ${className}`}
    >
      <div className="absolute inset-0">
        <img
          src={bible}
          alt=""
          className="w-full h-full object-cover opacity-25"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-card/90 via-card/80 to-card/92" />
        <div className="absolute inset-0 bg-gradient-radial-gold opacity-15 mix-blend-screen" />
      </div>

      <div className="relative flex h-full flex-col px-5 py-5">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-gold shrink-0" />

          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
            Palabra para Hoy
          </span>
        </div>

        <div className="mx-auto flex flex-1 max-w-[22rem] flex-col justify-center">
          <p className="text-center text-[15px] font-semibold leading-snug text-foreground/95 sm:text-base">
            {palabraDisplay.frase}
          </p>

          {palabraDisplay.referencia && (
            <p className="mt-3 text-left text-sm font-semibold leading-tight text-gold">
              {palabraDisplay.referencia}
            </p>
          )}
        </div>

        <div className="mt-4 flex justify-end">
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

import {
  BadgePlus,
  Bird,
  BriefcaseBusiness,
  Check,
  Church,
  Cross,
  HandHeart,
  Heart,
  House,
  MessageCircleHeart,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { useState } from "react";
import { prayForPeticion, PrayerPetition } from "@/services/sheetsService";

const CATEGORY_ICONS = {
  peticion: HandHeart,
  accion_gracias: Heart,
  enfermos: Stethoscope,
  familia: House,
  difuntos: Cross,
  vocaciones: Church,
  sacerdotes: BadgePlus,
  trabajo: BriefcaseBusiness,
  paz: Bird,
  otra: Sparkles,
};

const formatTime = (value: string) => value
  ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(value.replace(" ", "T")))
  : "Ahora";

export const PrayerCard = ({ item, pending = false }: { item: PrayerPetition; pending?: boolean }) => {
  const CategoryIcon = CATEGORY_ICONS[item.categoria as keyof typeof CATEGORY_ICONS] ?? MessageCircleHeart;
  const [confirmed, setConfirmed] = useState(false);
  const [alreadyPrayed, setAlreadyPrayed] = useState(false);
  const [prayers, setPrayers] = useState(item.total_oraciones);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handlePrayer = async () => {
    if (submitting || alreadyPrayed) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await prayForPeticion(item.id);
      setPrayers(result.total_oraciones);
      setAlreadyPrayed(result.already_prayed);
      setConfirmed(!result.already_prayed);
      if (!result.already_prayed) window.setTimeout(() => setConfirmed(false), 1600);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No fue posible registrar tu oración.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <article className="lvj-sacred-card rounded-[20px] p-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
          <CategoryIcon className="h-6 w-6 text-gold" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug text-foreground/90">{item.peticion}</p>
              <p className="mt-1 text-xs text-foreground/62">{item.nombre || "Un hermano en Cristo"}{item.ciudad ? ` · ${item.ciudad}` : ""}</p>
              <p className="mt-0.5 text-xs font-medium text-gold">{pending ? "🟡 En revisión" : formatTime(item.fecha_publicacion || item.created_at)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 pt-1 text-gold" aria-label={`${prayers} personas orando`}>
              <Heart className="h-4 w-4" />
              <span className="text-base font-semibold tabular-nums">{prayers}</span>
            </div>
          </div>

          {!pending ? <button
            type="button"
            onClick={handlePrayer}
            disabled={submitting || alreadyPrayed}
            className={`mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition duration-300 active:scale-[0.985] ${
              confirmed || alreadyPrayed
                ? "border-gold bg-gold text-navy-deep shadow-gold"
                : "border-gold/25 bg-gold/[0.04] text-gold hover:bg-gold/10"
            }`}
          >
            {confirmed || alreadyPrayed ? <Check className="h-4 w-4" /> : <MessageCircleHeart className="h-4 w-4" />}
            {alreadyPrayed ? "Ya estás orando por esta intención." : confirmed ? "Oración unida" : submitting ? "Uniendo oración..." : "Estoy orando"}
          </button> : null}
          {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
        </div>
      </div>
    </article>
  );
};

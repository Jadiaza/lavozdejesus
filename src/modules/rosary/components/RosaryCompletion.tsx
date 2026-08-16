import { Link } from "react-router-dom";
import { rosarySessionService } from "../services/rosarySessionService";
import { mysteryArt } from "../mocks/mysteryArt";
import type { MysteryGroupId } from "../types";

interface Props {
  onRestart: () => void;
  intentionLabel?: string | null;
  group?: MysteryGroupId;
}

/** Pantalla 16: finalización del Santo Rosario. */
export const RosaryCompletion = ({ onRestart, intentionLabel, group = "gozosos" }: Props) => {
  const stats = rosarySessionService.stats();
  return (
    <section className="glass gold-border rounded-3xl overflow-hidden text-center">
      <div className="px-6 pt-6 space-y-3">
        <h2 className="font-display text-3xl gold-text">¡Has terminado el Santo Rosario!</h2>
        <p className="text-sm text-muted-foreground">
          Que los misterios contemplados permanezcan vivos en tu corazón y te conduzcan a una unión más profunda con
          Jesucristo, de la mano de la Santísima Virgen María.
        </p>
        {intentionLabel && <p className="text-xs text-gold/90">Ofrecido por: {intentionLabel}.</p>}
      </div>
      <img
        src={mysteryArt[group]}
        alt=""
        loading="lazy"
        width={1024}
        height={640}
        className="mt-5 h-36 w-full object-cover border-y border-[hsl(var(--gold)/0.2)]"
      />
      <div className="p-6 space-y-4">
      <dl className="flex justify-center gap-6 text-sm">
        <div>
          <dt className="text-muted-foreground text-xs">Rosarios rezados</dt>
          <dd className="text-gold text-xl">{stats.completed}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Días seguidos</dt>
          <dd className="text-gold text-xl">{stats.streak}</dd>
        </div>
      </dl>
        <div className="flex flex-col gap-2">
          <Link
            to="/rosario"
            className="min-h-12 flex items-center justify-center rounded-xl bg-gradient-gold text-navy-deep font-medium uppercase tracking-[0.12em]"
          >
            Volver al inicio
          </Link>
          <button type="button" onClick={onRestart} className="min-h-11 text-sm text-gold">
            Rezar nuevamente
          </button>
          <Link to="/capilla" className="min-h-11 flex items-center justify-center rounded-xl border border-gold/35 text-sm text-gold">
            Entrar a la Capilla
          </Link>
        </div>
      </div>
    </section>
  );
};

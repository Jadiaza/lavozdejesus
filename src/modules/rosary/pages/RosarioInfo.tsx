import { CircleDot, Headphones, Sparkles } from "lucide-react";
import { RosaryLayout } from "../components/RosaryLayout";

/** Pantalla 18: información del módulo. */
export const RosarioInfo = () => (
  <RosaryLayout title="Santo Rosario" subtitle="Información del módulo" back="/rosario">
    <section className="glass gold-border rounded-3xl p-5 space-y-4">
      <p className="text-sm text-muted-foreground">
        Reza y contempla los misterios de la vida de Jesucristo junto con la Santísima Virgen María.
      </p>
      <div>
        <h2 className="text-xs uppercase tracking-[0.2em] text-gold/90">Modalidades disponibles</h2>
        <ul className="mt-2 space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" aria-hidden="true" /> Cuentas digitales
          </li>
          <li className="flex items-center gap-2">
            <CircleDot className="h-4 w-4 text-gold" aria-hidden="true" /> Con mi rosario
          </li>
          <li className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-gold" aria-hidden="true" /> Rosario por audio
          </li>
        </ul>
      </div>
      <p className="text-xs text-muted-foreground">
        Los textos de las oraciones son tradicionales de dominio público. Las meditaciones y audios oficiales se
        publicarán progresivamente.
      </p>
      <p className="text-center text-xs text-muted-foreground">Versión 1.0.0</p>
    </section>
  </RosaryLayout>
);

export default RosarioInfo;
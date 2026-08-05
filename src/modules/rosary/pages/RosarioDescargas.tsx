import { useState } from "react";
import { Check, Download } from "lucide-react";
import { RosaryLayout } from "../components/RosaryLayout";
import { mysteryGroups } from "../mocks/mysteries";
import { mysteryArt } from "../mocks/mysteryArt";
import type { MysteryGroupId } from "../types";

const ITEMS: Array<{ group: MysteryGroupId; sizeLabel: string }> = [
  { group: "gozosos", sizeLabel: "125 MB" },
  { group: "luminosos", sizeLabel: "127 MB" },
  { group: "dolorosos", sizeLabel: "128 MB" },
  { group: "gloriosos", sizeLabel: "130 MB" },
];

/**
 * Pantalla 14: descargas de audio. Los audios oficiales aún no están
 * publicados: la UI queda lista y avisa cuando no hay archivo disponible.
 */
export const RosarioDescargas = () => {
  const [done, setDone] = useState<MysteryGroupId[]>([]);

  return (
    <RosaryLayout title="Descargas" subtitle="Audios disponibles sin conexión" back="/rosario/configuracion">
      <ul className="space-y-2">
        {ITEMS.map((i) => {
          const downloaded = done.includes(i.group);
          return (
            <li key={i.group} className="glass gold-border rounded-2xl p-3 flex items-center gap-3">
              <img
                src={mysteryArt[i.group]}
                alt=""
                loading="lazy"
                width={1024}
                height={640}
                className="h-11 w-11 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate">Rosario · {mysteryGroups[i.group].name}</p>
                <p className="text-xs text-muted-foreground">{i.sizeLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => setDone((prev) => (downloaded ? prev.filter((g) => g !== i.group) : [...prev, i.group]))}
                aria-label={downloaded ? `Quitar descarga de ${mysteryGroups[i.group].name}` : `Descargar ${mysteryGroups[i.group].name}`}
                className="h-11 w-11 rounded-full gold-border flex items-center justify-center text-gold shrink-0"
              >
                {downloaded ? <Check className="h-4 w-4" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-muted-foreground text-center">
        Los audios oficiales todavía no están publicados: al activarlos se reservará el espacio para la descarga.
      </p>
    </RosaryLayout>
  );
};

export default RosarioDescargas;
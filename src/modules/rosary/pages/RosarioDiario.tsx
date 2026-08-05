import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { RosaryLayout } from "../components/RosaryLayout";
import { RosarySwitchRow } from "../components/RosaryRows";
import { rosaryFlowService } from "../services/rosaryFlowService";
import { mysteryGroups } from "../mocks/mysteries";
import type { RosaryJournalEntry } from "../types";

/** Pantalla 17: diario espiritual (opcional, guardado solo en el dispositivo). */
export const RosarioDiario = () => {
  const [entries, setEntries] = useState<RosaryJournalEntry[]>([]);
  const [text, setText] = useState("");
  const [store, setStore] = useState(true);

  useEffect(() => {
    setEntries(rosaryFlowService.journal());
  }, []);

  const save = () => {
    if (!text.trim()) return;
    if (store) setEntries(rosaryFlowService.addJournalEntry(text, rosaryFlowService.load().group));
    setText("");
  };

  return (
    <RosaryLayout title="Diario espiritual" subtitle="¿Qué palabra ha dejado hoy el Señor en tu corazón?" back="/rosario">
      <section className="glass gold-border rounded-3xl p-5 space-y-3">
        <label htmlFor="rosary-journal" className="sr-only">
          Escribe tu reflexión
        </label>
        <textarea
          id="rosary-journal"
          rows={5}
          maxLength={1000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe aquí…"
          className="w-full rounded-2xl bg-input border border-border p-3 text-sm"
        />
        <RosarySwitchRow label="Guardar en mi diario" checked={store} onChange={setStore} />
        <button
          type="button"
          onClick={save}
          className="w-full min-h-12 rounded-xl bg-gradient-gold text-navy-deep font-medium uppercase tracking-[0.12em]"
        >
          Guardar
        </button>
      </section>

      {entries.length > 0 && (
        <ul className="mt-4 space-y-2">
          {entries.map((e) => (
            <li key={e.id} className="glass gold-border rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gold/90">
                    {new Date(e.date).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}
                    {e.group ? ` · ${mysteryGroups[e.group].name}` : ""}
                  </p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{e.text}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEntries(rosaryFlowService.removeJournalEntry(e.id))}
                  aria-label="Eliminar entrada"
                  className="h-11 w-11 shrink-0 rounded-full flex items-center justify-center text-muted-foreground hover:text-gold"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </RosaryLayout>
  );
};

export default RosarioDiario;
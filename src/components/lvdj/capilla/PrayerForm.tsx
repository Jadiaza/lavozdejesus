import { FormEvent, useState } from "react";
import { Lock, Plus, Send, Sparkles } from "lucide-react";

const MAX_LENGTH = 300;

export const PrayerForm = () => {
  const [intention, setIntention] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("Proximamente podras compartir tu intencion.");
  };

  return (
    <section className="px-4 pt-3">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-[430px] rounded-2xl border border-gold/25 bg-black/42 p-4 shadow-deep backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <Sparkles className="mt-1 h-8 w-8 shrink-0 text-gold" />
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Intenciones de oracion
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-foreground/72">
                Deposita tu intencion y la comunidad orara contigo.
              </p>
            </div>
          </div>

          <span className="hidden shrink-0 rounded-xl bg-gradient-gold px-3 py-2 text-xs font-extrabold text-navy-deep min-[390px]:inline-flex">
            <Plus className="mr-1 h-4 w-4" />
            Nueva
          </span>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-gold/15 bg-black/35">
          <textarea
            value={intention}
            onChange={(event) => setIntention(event.target.value.slice(0, MAX_LENGTH))}
            maxLength={MAX_LENGTH}
            rows={4}
            placeholder="Escribe aqui tu intencion de oracion..."
            className="min-h-[116px] w-full resize-none bg-transparent px-4 py-4 text-sm text-foreground outline-none placeholder:text-foreground/42"
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-foreground/70">
          <label className="flex min-w-0 items-center gap-2">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(event) => setAnonymous(event.target.checked)}
              className="h-4 w-4 rounded border-gold/40 bg-transparent accent-[hsl(var(--gold))]"
            />
            <span className="truncate">Publicar de forma anonima</span>
          </label>
          <span>{intention.length}/{MAX_LENGTH}</span>
        </div>

        <button
          type="submit"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold px-5 py-3 text-sm font-extrabold text-navy-deep shadow-gold transition active:scale-[0.985]"
        >
          <Send className="h-4 w-4" />
          Enviar intencion
        </button>

        {message ? (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/10 px-3 py-2 text-xs font-medium text-gold">
            <Lock className="h-4 w-4" />
            {message}
          </div>
        ) : null}
      </form>
    </section>
  );
};

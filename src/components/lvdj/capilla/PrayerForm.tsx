import { FormEvent, useState } from "react";
import { Lock, Plus, Send, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
    <section className="px-4 pt-7">
      <div className="mx-auto max-w-[430px]">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-gold">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-[1.75rem] font-semibold leading-none text-foreground">
              Intenciones de oración
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/65">
              La comunidad ora contigo.
            </p>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-gold px-5 py-3 text-sm font-extrabold text-navy-deep shadow-[0_12px_30px_rgba(201,153,47,0.18)] transition hover:brightness-105 active:scale-[0.985]"
            >
              <Plus className="h-5 w-5" />
              Agregar intención
            </button>
          </DialogTrigger>

          <DialogContent className="w-[calc(100%-2rem)] max-w-[430px] rounded-[24px] border border-gold/20 bg-[#07131d] p-5 text-foreground shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
            <DialogHeader className="pr-8 text-left">
              <DialogTitle className="font-display text-3xl font-semibold">
                Agregar intención
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-foreground/65">
                Deposita tu intención y la comunidad orará contigo.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 focus-within:border-gold/45">
                <textarea
                  value={intention}
                  onChange={(event) => setIntention(event.target.value.slice(0, MAX_LENGTH))}
                  maxLength={MAX_LENGTH}
                  rows={5}
                  aria-label="Intención de oración"
                  placeholder="Escribe aquí tu intención de oración..."
                  className="min-h-[132px] w-full resize-none bg-transparent px-4 py-4 text-sm text-foreground outline-none placeholder:text-foreground/40"
                />
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-foreground/70">
                <label className="flex min-h-11 min-w-0 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(event) => setAnonymous(event.target.checked)}
                    className="h-4 w-4 rounded border-gold/40 bg-transparent accent-[hsl(var(--gold))]"
                  />
                  <span>Publicar de forma anónima</span>
                </label>
                <span>{intention.length}/{MAX_LENGTH}</span>
              </div>

              <button
                type="submit"
                className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-gold px-5 py-3 text-sm font-extrabold text-navy-deep transition active:scale-[0.985]"
              >
                <Send className="h-4 w-4" />
                Enviar intención
              </button>

              {message ? (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/10 px-3 py-2 text-xs font-medium text-gold">
                  <Lock className="h-4 w-4 shrink-0" />
                  {message}
                </div>
              ) : null}
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

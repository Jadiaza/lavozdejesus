import { ChevronRight, Hand, Headphones, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

import audioArt from "@/assets/rosary/modality/audio.png";
import interactiveArt from "@/assets/rosary/modality/interactive.png";
import physicalArt from "@/assets/rosary/modality/physical.png";
import { useRosaryFlow } from "../hooks/useRosaryFlow";
import { useRosaryPreferences } from "../hooks/useRosaryPreferences";
import { RosaryBottomNav } from "../components/RosaryBottomNav";
import type { RosaryModeId } from "../types";

const MODES = [
  { id: "digital" as const, title: "Interactivo", description: "La aplicación te guía oración por oración y lleva tu progreso.", icon: BookOpen, art: interactiveArt },
  { id: "physical" as const, title: "Con mi Rosario", description: "Reza con tu rosario físico mientras sigues las meditaciones y oraciones.", icon: Hand, art: physicalArt },
  { id: "audio" as const, title: "Audio", description: "Escucha y reza el Rosario acompañado paso a paso.", icon: Headphones, art: audioArt },
] satisfies Array<{ id: RosaryModeId; title: string; description: string; icon: typeof BookOpen; art: string }>;

export const RosarioModalidad = () => {
  const navigate = useNavigate();
  const { update } = useRosaryFlow();
  const { update: updatePrefs } = useRosaryPreferences();

  const choose = (mode: RosaryModeId) => {
    update({ mode });
    updatePrefs({ lastMode: mode });
    navigate("/rosario/intencion");
  };

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-navy-deep text-foreground">
      <section className="mx-auto flex min-h-0 w-full max-w-[1380px] flex-1 flex-col px-6 pb-2 pt-[max(.45rem,env(safe-area-inset-top))] sm:px-10 sm:pb-5 lg:px-14">
        <header className="mx-auto w-full max-w-3xl shrink-0 py-1 text-center sm:py-5">
          <img src="/icons/rosario.png" alt="" className="mx-auto h-[clamp(2rem,5.5dvh,3rem)] w-[clamp(2rem,5.5dvh,3rem)] object-contain sm:h-16 sm:w-16" aria-hidden="true" />
          <h1 className="mt-1 whitespace-nowrap font-display text-[clamp(2rem,9vw,3.25rem)] font-semibold leading-none tracking-[-0.035em] text-foreground sm:mt-2 sm:text-6xl">Elegir modalidad</h1>
          <div className="mx-auto mt-[clamp(.45rem,1.5dvh,.85rem)] h-[2px] w-12 rounded-full bg-gold-bright sm:mt-5 sm:w-20" aria-hidden="true" />
        </header>

        <section className="mx-auto mt-[clamp(.45rem,1.3dvh,.8rem)] grid min-h-0 w-full max-w-5xl flex-1 grid-rows-3 gap-[clamp(.45rem,1.2dvh,.75rem)] sm:mt-5 sm:gap-5">
          {MODES.map((mode) => (
            <button key={mode.id} type="button" onClick={() => choose(mode.id)} className="group grid min-h-0 w-full grid-cols-[40%_60%] overflow-hidden rounded-[1.25rem] border border-gold/65 bg-navy text-left shadow-[0_18px_45px_-35px_rgba(0,0,0,0.9)] transition duration-300 hover:border-gold-bright sm:grid-cols-[36%_64%] sm:rounded-[1.75rem]">
              <span className="relative block min-h-0 overflow-hidden">
                <img src={mode.art} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]" />
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-navy" aria-hidden="true" />
              </span>
              <span className="flex min-h-0 min-w-0 items-center gap-2 px-3 py-2 sm:gap-6 sm:px-7 sm:py-4 lg:px-10">
                <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/70 text-gold-bright sm:flex sm:h-16 sm:w-16 lg:h-20 lg:w-20">
                  <mode.icon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10" strokeWidth={1.4} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[clamp(1.3rem,6vw,1.7rem)] font-semibold leading-[1.05] text-foreground sm:text-3xl lg:text-4xl">{mode.title}</span>
                  <span className="mt-[clamp(.3rem,.8dvh,.55rem)] block max-w-xl text-[clamp(.64rem,2.7vw,.78rem)] leading-[1.35] text-foreground/75 sm:mt-2 sm:text-base lg:text-lg">{mode.description}</span>
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/75 text-gold-bright transition group-hover:bg-gold/10 sm:h-12 sm:w-12 lg:h-14 lg:w-14">
                  <ChevronRight className="h-4 w-4 sm:h-7 sm:w-7" strokeWidth={1.65} aria-hidden="true" />
                </span>
              </span>
            </button>
          ))}
        </section>
      </section>
      <RosaryBottomNav />
    </main>
  );
};

export default RosarioModalidad;

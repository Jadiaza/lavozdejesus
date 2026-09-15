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
    <main className="relative flex min-h-dvh flex-col overflow-x-hidden bg-navy-deep text-foreground">
      <section className="mx-auto flex w-full max-w-[1380px] flex-1 flex-col px-7 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-10 lg:px-14">
        <header className="mx-auto w-full max-w-3xl py-3 text-center sm:py-8">
          <img src="/icons/rosario.png" alt="" className="mx-auto h-12 w-12 object-contain sm:h-20 sm:w-20" aria-hidden="true" />
          <h1 className="mt-2 whitespace-nowrap font-display text-[clamp(2.25rem,10vw,5.5rem)] font-semibold leading-none tracking-[-0.035em] text-foreground">Elegir modalidad</h1>
          <div className="mx-auto mt-4 h-[2px] w-12 rounded-full bg-gold-bright sm:mt-6 sm:w-20" aria-hidden="true" />
          <p className="mx-auto mt-4 max-w-[20rem] text-[0.95rem] leading-relaxed text-foreground/75 sm:mt-6 sm:max-w-2xl sm:text-2xl">Elige la forma en la que deseas<br className="sm:hidden" /> rezar el Santo Rosario.</p>
        </header>

        <section className="mx-auto grid w-full max-w-5xl gap-3 sm:gap-5 lg:gap-6">
          {MODES.map((mode) => (
            <button key={mode.id} type="button" onClick={() => choose(mode.id)} className="group grid min-h-[9.2rem] w-full grid-cols-[38%_62%] overflow-hidden rounded-[1.35rem] border border-gold/65 bg-navy text-left shadow-[0_18px_45px_-35px_rgba(0,0,0,0.9)] transition duration-300 hover:border-gold-bright sm:min-h-[12rem] sm:grid-cols-[36%_64%] sm:rounded-[1.75rem] lg:min-h-[14rem]">
              <span className="relative block overflow-hidden">
                <img src={mode.art} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]" />
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-navy" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 items-center gap-3 px-3 py-4 sm:gap-6 sm:px-7 lg:px-10">
                <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/70 text-gold-bright min-[390px]:flex sm:h-16 sm:w-16 lg:h-20 lg:w-20">
                  <mode.icon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10" strokeWidth={1.4} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[1.45rem] font-semibold leading-tight text-foreground sm:text-3xl lg:text-4xl">{mode.title}</span>
                  <span className="mt-2 block max-w-xl text-[0.72rem] leading-[1.45] text-foreground/75 sm:text-base lg:text-lg">{mode.description}</span>
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/75 text-gold-bright transition group-hover:bg-gold/10 sm:h-12 sm:w-12 lg:h-14 lg:w-14">
                  <ChevronRight className="h-5 w-5 sm:h-7 sm:w-7" strokeWidth={1.65} aria-hidden="true" />
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

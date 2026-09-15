import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import audioArt from "@/assets/rosary/modality/audio.png";
import interactiveArt from "@/assets/rosary/modality/interactive.png";
import physicalArt from "@/assets/rosary/modality/physical.png";
import { useRosaryFlow } from "../hooks/useRosaryFlow";
import { useRosaryPreferences } from "../hooks/useRosaryPreferences";
import { RosaryBottomNav } from "../components/RosaryBottomNav";
import type { RosaryModeId } from "../types";

const MODES = [
  { id: "digital" as const, title: "Interactivo", description: "La aplicación te guía oración por oración y lleva tu progreso.", art: interactiveArt, position: "object-left" },
  { id: "physical" as const, title: "Con mi Rosario", description: "Reza con tu rosario físico mientras sigues las meditaciones y oraciones.", art: physicalArt, position: "object-left" },
  { id: "audio" as const, title: "Audio", description: "Escucha y reza el Rosario acompañado paso a paso.", art: audioArt, position: "object-left" },
] satisfies Array<{ id: RosaryModeId; title: string; description: string; art: string; position: string }>;

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
      <section className="mx-auto flex min-h-0 w-full max-w-[1380px] flex-1 flex-col px-5 pb-2 pt-[max(.4rem,env(safe-area-inset-top))] sm:px-10 sm:pb-5 lg:px-14">
        <header className="mx-auto w-full max-w-3xl shrink-0 py-1 text-center sm:py-5">
          <img src="/icons/rosario.png" alt="" className="mx-auto h-[clamp(1.9rem,4.8dvh,2.75rem)] w-[clamp(1.9rem,4.8dvh,2.75rem)] object-contain sm:h-16 sm:w-16" aria-hidden="true" />
          <h1 className="mt-1 whitespace-nowrap font-display text-[clamp(1.9rem,8.5vw,3.1rem)] font-semibold leading-none tracking-[-0.035em] text-foreground sm:mt-2 sm:text-6xl">Elegir modalidad</h1>
          <div className="mx-auto mt-[clamp(.4rem,1.1dvh,.7rem)] h-[2px] w-12 rounded-full bg-gold-bright sm:mt-5 sm:w-20" aria-hidden="true" />
        </header>

        <section className="mx-auto mt-[clamp(.4rem,1dvh,.7rem)] grid min-h-0 w-full max-w-5xl flex-1 grid-rows-3 gap-[clamp(.4rem,1dvh,.65rem)] sm:mt-5 sm:gap-5">
          {MODES.map((mode) => (
            <button key={mode.id} type="button" onClick={() => choose(mode.id)} className="group relative min-h-0 w-full overflow-hidden rounded-[1.25rem] border border-gold/70 bg-navy text-left shadow-[0_18px_45px_-35px_rgba(0,0,0,0.9)] transition duration-300 hover:border-gold-bright sm:rounded-[1.75rem]">
              <img src={mode.art} alt="" className={`absolute inset-0 h-full w-full object-cover ${mode.position} transition duration-700 group-hover:scale-[1.025]`} />
              <span className="absolute inset-0 bg-gradient-to-r from-transparent from-[0%] via-navy/65 via-[42%] to-navy to-[72%]" aria-hidden="true" />
              <span className="absolute inset-0 bg-gradient-to-t from-navy/35 via-transparent to-navy/5" aria-hidden="true" />

              <span className="relative z-10 ml-[40%] flex h-full min-w-0 items-center gap-2 px-3 py-2 sm:ml-[38%] sm:gap-5 sm:px-7 sm:py-4 lg:ml-[40%] lg:px-10">
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[clamp(1.3rem,5.7vw,1.7rem)] font-semibold leading-[1.05] text-foreground drop-shadow-md sm:text-3xl lg:text-4xl">{mode.title}</span>
                  <span className="mt-[clamp(.3rem,.7dvh,.5rem)] block max-w-[15rem] text-[clamp(.62rem,2.55vw,.76rem)] leading-[1.32] text-foreground/80 drop-shadow-sm sm:mt-2 sm:max-w-xl sm:text-base lg:text-lg">{mode.description}</span>
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/80 bg-navy-deep/35 text-gold-bright backdrop-blur-[2px] transition group-hover:bg-gold/10 sm:h-12 sm:w-12 lg:h-14 lg:w-14">
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

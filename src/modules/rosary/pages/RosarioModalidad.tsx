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
  { id: "digital" as const, title: "Interactivo", description: "La aplicación te guía oración por oración y lleva tu progreso.", art: interactiveArt },
  { id: "physical" as const, title: "Con mi Rosario", description: "Reza con tu rosario físico mientras sigues las meditaciones y oraciones.", art: physicalArt },
  { id: "audio" as const, title: "Audio", description: "Escucha y reza el Rosario acompañado paso a paso.", art: audioArt },
] satisfies Array<{ id: RosaryModeId; title: string; description: string; art: string }>;

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
    <main className="relative flex min-h-dvh flex-col bg-navy-deep text-foreground">
      <section className="mx-auto w-full max-w-[1380px] flex-1 px-4 pb-[calc(6.6rem+env(safe-area-inset-bottom))] pt-[max(.35rem,env(safe-area-inset-top))] sm:px-8 sm:pb-32 lg:px-14">
        <header className="mx-auto w-full max-w-3xl py-1 text-center sm:py-4">
          <img src="/icons/rosario.png" alt="" className="mx-auto h-9 w-9 object-contain sm:h-14 sm:w-14" aria-hidden="true" />
          <h1 className="mt-1 whitespace-nowrap font-display text-[clamp(2rem,8.5vw,3rem)] font-semibold leading-none tracking-[-0.035em] text-foreground sm:text-6xl">Elegir modalidad</h1>
          <div className="mx-auto mt-2 h-[2px] w-12 rounded-full bg-gold-bright sm:mt-4 sm:w-20" aria-hidden="true" />
        </header>

        <section className="mx-auto mt-3 grid w-full max-w-5xl gap-3 sm:mt-5 sm:gap-5">
          {MODES.map((mode) => (
            <button key={mode.id} type="button" onClick={() => choose(mode.id)} className="group relative h-[clamp(8.4rem,18.5dvh,10.4rem)] w-full overflow-hidden rounded-[1.2rem] border border-gold/70 bg-navy text-left shadow-[0_18px_45px_-35px_rgba(0,0,0,0.9)] transition duration-300 hover:border-gold-bright sm:h-48 sm:rounded-[1.75rem] lg:h-52">
              <img src={mode.art} alt="" className="absolute inset-0 h-full w-full object-cover object-center transition duration-700 group-hover:scale-[1.025]" />
              <span className="absolute inset-0 bg-gradient-to-r from-navy/20 via-navy/60 to-navy/95" aria-hidden="true" />
              <span className="absolute inset-0 bg-gradient-to-t from-navy/55 via-transparent to-navy/15" aria-hidden="true" />

              <span className="relative z-10 flex h-full w-full items-center px-5 py-3 sm:px-8 lg:px-10">
                <span className="ml-[34%] min-w-0 flex-1 sm:ml-[36%] lg:ml-[38%]">
                  <span className="block font-display text-[clamp(1.55rem,6.6vw,2rem)] font-semibold leading-[1.05] text-foreground drop-shadow-md sm:text-4xl">{mode.title}</span>
                  <span className="mt-2 block max-w-[17rem] pr-10 text-[clamp(.78rem,3.25vw,.94rem)] leading-[1.35] text-foreground/90 drop-shadow-sm sm:max-w-xl sm:pr-16 sm:text-lg">{mode.description}</span>
                </span>
                <span className="absolute right-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/85 bg-navy-deep/45 text-gold-bright backdrop-blur-[2px] transition group-hover:bg-gold/10 sm:right-7 sm:h-12 sm:w-12">
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

import { ArrowLeft, ChevronRight, Hand, Headphones, Sparkles, Wheat } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import audioArt from "@/assets/rosary/modality/audio.png";
import heroArt from "@/assets/rosary/modality/hero.png";
import interactiveArt from "@/assets/rosary/modality/interactive.png";
import physicalArt from "@/assets/rosary/modality/physical.png";
import { useRosaryFlow } from "../hooks/useRosaryFlow";
import { useRosaryPreferences } from "../hooks/useRosaryPreferences";
import { RosaryBottomNav } from "../components/RosaryBottomNav";
import type { RosaryModeId } from "../types";

const MODES = [
  { id: "digital" as const, title: "Interactivo", description: "La aplicación te guía oración por oración y lleva tu progreso.", icon: Sparkles, art: interactiveArt },
  { id: "physical" as const, title: "Con mi Rosario", description: "Reza con tu rosario físico mientras sigues las meditaciones y oraciones.", icon: Hand, art: physicalArt },
  { id: "audio" as const, title: "Audio", description: "Escucha y responde el Rosario acompañado paso a paso.", icon: Headphones, art: audioArt },
] satisfies Array<{ id: RosaryModeId; title: string; description: string; icon: typeof Sparkles; art: string }>;

/** Elección de modalidad con portada editorial del Santo Rosario. */
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
    <main className="relative flex h-dvh flex-col overflow-hidden bg-navy-deep text-foreground sm:block sm:h-auto sm:min-h-dvh sm:overflow-x-hidden sm:overflow-y-visible">
      <section className="relative mx-auto h-[clamp(10.5rem,21.5dvh,11.75rem)] w-full shrink-0 max-w-[1440px] overflow-hidden px-5 pb-2 pt-[max(0.6rem,env(safe-area-inset-top))] sm:min-h-[31rem] sm:px-10 sm:pb-10 lg:min-h-[36rem] lg:px-14 lg:pt-10">
        <img src={heroArt} alt="La Virgen María en oración junto a un rosario y una vela" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/10 via-transparent to-navy-deep" aria-hidden="true" />
        <Link to="/rosario/seleccionar-misterios" aria-label="Volver" className="absolute left-3 top-[max(0.6rem,env(safe-area-inset-top))] z-20 flex h-9 w-9 items-center justify-center text-gold-bright transition hover:-translate-x-1 sm:left-10 sm:h-16 sm:w-16">
          <ArrowLeft className="h-7 w-7 sm:h-12 sm:w-12" strokeWidth={1.65} aria-hidden="true" />
        </Link>

        <div className="relative z-10 mx-auto max-w-3xl text-center sm:mt-12 lg:mt-1">
          <img src="/icons/rosario.png" alt="" className="mx-auto h-8 w-8 object-contain sm:h-24 sm:w-24" aria-hidden="true" />
          <h1 className="mt-0.5 whitespace-nowrap font-display text-[clamp(2rem,9.2vw,6rem)] font-semibold leading-[0.92] tracking-[-0.035em] text-foreground">Elegir Modalidad</h1>
          <div className="mx-auto mt-2.5 flex max-w-[15rem] items-center gap-3 sm:mt-6 sm:max-w-[34rem] sm:gap-4" aria-hidden="true">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-bright" />
            <span className="grid grid-cols-2 gap-1">
              {[0, 1, 2, 3].map((item) => <span key={item} className="h-2 w-2 rotate-45 bg-gold-bright sm:h-2.5 sm:w-2.5" />)}
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-bright" />
          </div>
          <p className="mx-auto mt-2.5 max-w-[16rem] text-balance text-[0.68rem] leading-relaxed text-foreground/90 sm:mt-6 sm:max-w-2xl sm:text-2xl lg:text-[2rem]">Elige la forma en la que deseas rezar<br className="hidden sm:block" /> el Santo Rosario.</p>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid min-h-0 w-full max-w-[1380px] flex-1 grid-rows-[repeat(3,clamp(8rem,17dvh,9.25rem))_auto] content-start gap-2 px-7 pb-[max(0.35rem,env(safe-area-inset-bottom))] min-[390px]:px-8 sm:-mt-3 sm:block sm:space-y-6 sm:px-8 sm:pb-14 lg:-mt-8 lg:space-y-8 lg:px-14">
        {MODES.map((mode) => (
          <button key={mode.id} type="button" onClick={() => choose(mode.id)} className="group grid min-h-0 w-full grid-cols-[35%_65%] overflow-hidden rounded-[1.35rem] border border-gold/75 bg-navy text-left shadow-[0_24px_60px_-35px_rgba(0,0,0,0.95)] transition duration-300 hover:border-gold-bright sm:min-h-0 sm:grid-cols-1 sm:rounded-[1.6rem] sm:hover:-translate-y-1 lg:min-h-[21rem] lg:grid-cols-[43%_57%] lg:rounded-[2.2rem]">
            <span className="relative block min-h-full overflow-hidden sm:min-h-52 lg:min-h-full">
              <img src={mode.art} alt="" className="absolute inset-0 h-full w-full object-cover object-left transition duration-700 group-hover:scale-[1.025]" />
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-navy sm:bg-gradient-to-b sm:from-transparent sm:via-transparent sm:to-navy lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-navy" aria-hidden="true" />
            </span>
            <span className="relative flex min-w-0 items-center gap-2 px-3 py-2 sm:gap-4 sm:px-10 sm:py-7 lg:gap-8 lg:px-12 lg:py-10">
              <span className="shrink-0 text-gold-bright"><mode.icon className="h-5 w-5 sm:h-12 sm:w-12 lg:h-20 lg:w-20" strokeWidth={1.35} aria-hidden="true" /></span>
              <span className="min-w-0 flex-1">
                <span className="block whitespace-nowrap font-display text-[1.16rem] font-semibold leading-none text-foreground min-[390px]:text-[1.28rem] sm:text-[clamp(2rem,5vw,4rem)]">{mode.title}</span>
                <span className="mt-1.5 flex max-w-[11rem] items-center gap-2 sm:mt-5 sm:max-w-[20rem] sm:gap-3" aria-hidden="true">
                  <span className="h-px flex-1 bg-gradient-to-r from-gold-bright to-gold/20" /><span className="h-2.5 w-2.5 rotate-45 bg-gold-bright" /><span className="h-px w-16 bg-gradient-to-r from-gold/60 to-transparent" />
                </span>
                <span className="mt-1.5 block max-w-xl text-[0.59rem] leading-[1.28] text-foreground/85 min-[390px]:text-[0.64rem] sm:mt-5 sm:text-xl lg:text-[1.7rem]">{mode.description}</span>
              </span>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/75 text-gold-bright transition group-hover:bg-gold/10 sm:h-14 sm:w-14 lg:h-24 lg:w-24"><ChevronRight className="h-4 w-4 sm:h-8 sm:w-8 lg:h-14 lg:w-14" strokeWidth={1.65} aria-hidden="true" /></span>
            </span>
          </button>
        ))}

        <blockquote className="px-1 py-0.5 text-center text-foreground/90 sm:px-4 sm:pb-3 sm:pt-3 lg:pt-6">
          <div className="mx-auto flex items-center justify-center gap-2 sm:gap-8">
            <Wheat className="h-7 w-7 -rotate-[28deg] text-gold/80 sm:h-12 sm:w-12" strokeWidth={1.35} aria-hidden="true" />
            <div>
              <div className="mx-auto text-xl leading-none text-gold-bright sm:mb-2 sm:text-4xl">♡</div>
              <p className="font-display text-[0.72rem] leading-tight sm:text-2xl lg:text-3xl">El Rosario es una cadena que nos une al Cielo.</p>
              <cite className="block text-[0.52rem] not-italic leading-tight text-gold/70 sm:mt-1 sm:text-lg lg:text-2xl">– San Luis María Grignion de Montfort –</cite>
            </div>
            <Wheat className="h-7 w-7 rotate-[28deg] scale-x-[-1] text-gold/80 sm:h-12 sm:w-12" strokeWidth={1.35} aria-hidden="true" />
          </div>
        </blockquote>
      </section>
      <RosaryBottomNav />
    </main>
  );
};

export default RosarioModalidad;

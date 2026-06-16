import { Logo } from "./Logo";
import { RadioCard } from "./RadioCard";
import { QuickAccess } from "./QuickAccess";
import { GospelCard } from "./GospelCard";
import { ProgramCard } from "./ProgramCard";
import { BottomNav } from "./BottomNav";

// Proportions per spec (mobile):
// header 8% · custodia 33% · radio 9% · accesos 20% · evangelio 15% · próximo 8% · menú 7%
export const MobileHome = () => (
  <div className="relative min-h-screen bg-navy-deep text-foreground overflow-x-hidden">
    <main className="relative z-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {/* HEADER 8% */}
      <section className="relative w-full h-[340px]">
  <img
    src="/mobile-monstrance.png"
    alt="Santísimo Sacramento"
      className="absolute inset-0 w-full h-full object-cover brightness-110"
  />

  <div className="absolute top-2 left-2 z-20">
    <Logo size="lg" />
  </div>

  <div className="absolute inset-0 bg-gradient-radial-gold opacity-55 mix-blend-screen" />
  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />
</section>

  {/* RADIO EN VIVO 9% */}
      <section className="relative -mt-6 px-4 z-10">
        <RadioCard />
      </section>

      {/* ACCESOS RÁPIDOS 20% */}
      <section className="px-4 mt-5">
        <QuickAccess compact />
      </section>

      {/* EVANGELIO DEL DÍA 15% */}
      <section className="px-4 mt-4">
        <GospelCard />
      </section>

      {/* PRÓXIMO PROGRAMA 8% */}
      <section className="px-4 mt-3 pb-28">
        <ProgramCard />
      </section>
    </main>

    {/* MENÚ INFERIOR 7% */}
    <BottomNav />
  </div>
);
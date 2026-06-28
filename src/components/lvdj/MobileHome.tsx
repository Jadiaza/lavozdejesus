/*
==============================================================================
PROYECTO: LA VOZ DE JESUS - PWA RADIO CATOLICA
COMPONENTE: MobileHome.tsx
VERSION: 1.0.0

DESARROLLADO POR:
Ing. Jose Alberto Diaz Agresott

PROPIETARIO:
Emisora Catolica La Voz de Jesus

UBICACION:
Monteria - Cordoba - Colombia

DERECHOS RESERVADOS
Emisora La Voz de Jesus

DESCRIPCION:
Pantalla principal para la experiencia movil de la PWA.

FUNCIONES:
- Presenta el hero con la custodia y el logo de la emisora.
- Integra el reproductor en vivo.
- Muestra accesos rapidos a las secciones principales.
- Carga la Palabra para Hoy mediante GospelCard.
- Muestra el proximo programa y la navegacion inferior.

==============================================================================
*/

import { Logo } from "./Logo";
import { RadioCard } from "./RadioCard";
import { QuickAccess } from "./QuickAccess";
import { GospelCard } from "./GospelCard";
import { ProgramCard } from "./ProgramCard";
import { BottomNav } from "./BottomNav";

/* ==========================================================================
   DISTRIBUCION MOVIL
   ==========================================================================
   Proporciones de referencia:
   header 8% | custodia 33% | radio 9% | accesos 20%
   evangelio 15% | proximo programa 8% | menu inferior 7%
*/

export const MobileHome = () => {
  return (
    <div className="relative min-h-screen bg-navy-deep text-foreground overflow-x-hidden">
      <main className="relative z-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {/* Hero principal: primera impresion de capilla virtual. */}
        <section className="relative w-full h-[340px]">
          <img
            src="/mobile-monstrance.png"
            alt="Santísimo Sacramento"
            className="absolute inset-0 w-full h-full object-cover brightness-110"
          />

          <div className="absolute top-2 left-2 z-20">
            <Logo size="lg" />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-radial-gold opacity-55 mix-blend-screen" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />
        </section>

        <section className="relative -mt-6 px-4 z-10">
          <RadioCard />
        </section>

        <section className="relative z-20 px-4 mt-5">
          <QuickAccess compact />
        </section>

        <section className="px-4 mt-4">
          <GospelCard />
        </section>

        <section className="px-4 mt-3 pb-28">
          <ProgramCard showAction={false} />
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

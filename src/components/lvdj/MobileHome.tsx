/*
==============================================================================
PROYECTO: LA VOZ DE JESUS - PWA RADIO CATOLICA
COMPONENTE: MobileHome.tsx
VERSION: 1.0.0

DESCRIPCION:
Pantalla principal para la experiencia movil de la PWA.
==============================================================================
*/

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { DEFAULT_APP_CONFIG, getAppConfig } from "@/services/sheetsService";
import { AdsenseAd } from "./AdsenseAd";
import { BottomNav } from "./BottomNav";
import { GospelCard } from "./GospelCard";
import { Logo } from "./Logo";
import { QuickAccess } from "./QuickAccess";

const MobileHomeAdFallback = () => (
  <div className="relative min-h-[104px] overflow-hidden rounded-2xl border border-gold/35 bg-navy/75 px-4 py-4 shadow-deep">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(246,197,74,0.22),transparent_34%),linear-gradient(135deg,rgba(6,24,38,0.96),rgba(4,10,20,0.9))]" />
    <div className="relative z-10 flex h-full items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-gold/90">
          Espacio publicitario
        </div>
        <div className="mt-2 truncate text-lg font-extrabold leading-tight text-foreground">
          La Voz de Jesus
        </div>
        <div className="mt-1 text-xs font-medium text-foreground/72">
          Acompana esta mision evangelizadora
        </div>
      </div>

      <Link
        to="/contacto"
        className="shrink-0 rounded-full bg-gradient-gold px-4 py-2 text-xs font-extrabold text-navy-deep shadow-gold active:scale-95"
      >
        Paute aqui
      </Link>
    </div>
  </div>
);

const MobileHomeAd = () => {
  const [adsConfig, setAdsConfig] = useState({
    enabled: DEFAULT_APP_CONFIG.ads_enabled,
    clientId: DEFAULT_APP_CONFIG.adsense_client_id,
    slot:
      import.meta.env.VITE_ADSENSE_HOME_SLOT ||
      import.meta.env.VITE_ADSENSE_PROGRAMACION_SLOT ||
      DEFAULT_APP_CONFIG.adsense_programacion_slot,
  });

  useEffect(() => {
    let mounted = true;

    getAppConfig()
      .then((config) => {
        if (!mounted) return;

        setAdsConfig({
          enabled: config.ads_enabled,
          clientId: config.adsense_client_id,
          slot:
            import.meta.env.VITE_ADSENSE_HOME_SLOT ||
            config.adsense_programacion_slot ||
            import.meta.env.VITE_ADSENSE_PROGRAMACION_SLOT ||
            "",
        });
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <aside className="w-full max-w-full overflow-hidden">
      <AdsenseAd
        enabled={adsConfig.enabled}
        clientId={adsConfig.clientId}
        slot={adsConfig.slot}
        format="horizontal"
        fullWidthResponsive
        className="min-h-[104px] rounded-2xl border border-gold/35 bg-navy/75"
        fallback={<MobileHomeAdFallback />}
      />
    </aside>
  );
};

export const MobileHome = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-navy-deep text-foreground">
      <main className="relative z-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <section className="relative h-[340px] w-full">
          <img
            src="/mobile-monstrance.png"
            alt="Santisimo Sacramento"
            className="absolute inset-0 h-full w-full object-cover brightness-110"
          />

          <div className="absolute left-2 top-2 z-20">
            <Logo size="lg" />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-radial-gold opacity-55 mix-blend-screen" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />
        </section>

        <section className="relative z-10 -mt-7 px-4">
          <Link
            to="/capilla-virtual"
            className="group flex min-h-[88px] items-center gap-3 rounded-2xl border border-gold/45 bg-gradient-to-br from-[#f6c54a] via-[#e2a925] to-[#b98012] px-3 py-4 text-[#070b14] shadow-[0_18px_42px_rgba(0,0,0,0.38)] transition active:scale-[0.985] min-[380px]:min-h-[92px] min-[380px]:gap-4 min-[380px]:p-4"
            aria-label="Entrar a la Capilla Virtual"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy-deep shadow-[inset_0_0_0_1px_rgba(246,197,74,0.45),0_8px_22px_rgba(0,0,0,0.28)] min-[380px]:h-16 min-[380px]:w-16">
              <img
                src="/icons/custodia.png"
                alt=""
                className="h-9 w-9 object-contain min-[380px]:h-11 min-[380px]:w-11"
              />
            </span>

            <span className="min-w-0 flex-1 overflow-hidden">
              <span className="block truncate whitespace-nowrap text-[1.05rem] font-extrabold leading-tight tracking-tight min-[380px]:text-[1.18rem]">
                <span className="min-[380px]:hidden">Capilla</span>
                <span className="hidden min-[380px]:inline">Entrar a la Capilla</span>
              </span>
              <span className="mt-1.5 block truncate whitespace-nowrap text-[0.78rem] font-semibold leading-[1.1] text-black/82 min-[380px]:hidden">
                {"Adoraci\u00f3n 24/7"}
              </span>
              <span className="mt-1.5 hidden truncate whitespace-nowrap text-[0.9rem] font-semibold leading-[1.1] text-black/82 min-[380px]:block">
                {"Adoraci\u00f3n Eucar\u00edstica 24/7"}
              </span>
            </span>

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/70 text-gold shadow-[inset_0_0_0_1px_rgba(246,197,74,0.28)] transition group-active:scale-95 min-[380px]:h-12 min-[380px]:w-12">
              <ChevronRight className="h-6 w-6 min-[380px]:h-7 min-[380px]:w-7" strokeWidth={3} />
            </span>
          </Link>
        </section>

        <section className="relative z-20 mt-5 px-4">
          <QuickAccess compact />
        </section>

        <section className="mt-4 px-4">
          <GospelCard />
        </section>

        <section className="mt-3 px-4 pb-28">
          <MobileHomeAd />
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

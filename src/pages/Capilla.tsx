import { useEffect, useState } from "react";
import { BottomNav } from "@/components/lvdj/BottomNav";
import { CapillaHeader } from "@/components/lvdj/capilla/CapillaHeader";
import { CapillaVideo } from "@/components/lvdj/capilla/CapillaVideo";
import { PrayerForm } from "@/components/lvdj/capilla/PrayerForm";
import { PrayerWall } from "@/components/lvdj/capilla/PrayerWall";
import {
  type CapillaPublica,
  getCapillaPublica,
} from "@/services/sheetsService";

const DEFAULT_CAPILLA = {
  nombre: "Capilla Virtual",
  subtitulo: "Adoración Eucarística - 24 horas",
  mensajeCarga:
    "Señor Jesús, dispón mi corazón para adorarte en espíritu y verdad.",
  mensajeError:
    "La capilla está momentáneamente fuera de transmisión. Permanece en oración; Jesús sigue presente.",
};

const Capilla = () => {
  const [capilla, setCapilla] = useState<CapillaPublica | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const cargarCapilla = async () => {
      try {
        setCargando(true);
        setError("");

        const data = await getCapillaPublica();

        if (!active) return;

        if (!data?.id) {
          throw new Error("No existe una capilla activa.");
        }

        if (!data.stream?.url_stream) {
          throw new Error(
            data.config?.mensaje_error || DEFAULT_CAPILLA.mensajeError,
          );
        }

        setCapilla(data);
      } catch (err) {
        if (!active) return;

        setCapilla(null);
        setError(
          err instanceof Error
            ? err.message
            : DEFAULT_CAPILLA.mensajeError,
        );
      } finally {
        if (active) {
          setCargando(false);
        }
      }
    };

    void cargarCapilla();

    return () => {
      active = false;
    };
  }, []);

  const nombre = capilla?.nombre || DEFAULT_CAPILLA.nombre;
  const subtitulo = capilla?.subtitulo || DEFAULT_CAPILLA.subtitulo;

  const mensajeCarga =
    capilla?.config?.mensaje_carga || DEFAULT_CAPILLA.mensajeCarga;

  const mensajeError =
    error ||
    capilla?.config?.mensaje_error ||
    DEFAULT_CAPILLA.mensajeError;

  const mostrarIntenciones =
    capilla?.config?.mostrar_intenciones !== false;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_50%_8%,rgba(196,145,36,0.11),transparent_27%),radial-gradient(circle_at_15%_55%,rgba(18,69,92,0.14),transparent_32%),linear-gradient(180deg,#030b13_0%,#06131e_48%,#02070d_100%)] text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(115deg,transparent,rgba(255,255,255,0.025),transparent)]" />
      <CapillaHeader
        nombre={nombre}
        subtitulo={subtitulo}
        logoUrl={capilla?.logo_url}
      />

      <main className="relative z-10">
        {cargando ? (
          <section className="px-4 pt-2">
            <div className="mx-auto grid aspect-video max-w-[430px] place-items-center rounded-[20px] border border-white/10 bg-[#07111c]/75 px-6 text-center text-sm leading-relaxed text-foreground/75 shadow-[0_22px_55px_rgba(0,0,0,0.3)]">
              {mensajeCarga}
            </div>
          </section>
        ) : error || !capilla ? (
          <section className="px-4 pt-2">
            <div className="mx-auto grid aspect-video max-w-[430px] place-items-center rounded-[20px] border border-gold/20 bg-[#07111c]/75 px-6 text-center text-sm leading-relaxed text-foreground/75 shadow-[0_22px_55px_rgba(0,0,0,0.3)]">
              {mensajeError}
            </div>
          </section>
        ) : (
          <>
            <div className="[&_section]:pt-2 [&_section>div]:rounded-[20px] [&_section>div]:border-white/10 [&_section>div]:shadow-[0_22px_55px_rgba(0,0,0,0.34)] [&_section>div>div:nth-child(2)]:hidden [&_.pointer-events-none.absolute.right-4.top-4]:border [&_.pointer-events-none.absolute.right-4.top-4]:border-gold/25 [&_.pointer-events-none.absolute.right-4.top-4]:bg-black/55 [&_.pointer-events-none.absolute.right-4.top-4]:px-2.5 [&_.pointer-events-none.absolute.right-4.top-4]:py-1.5 [&_.pointer-events-none.absolute.right-4.top-4]:text-[10px] [&_.pointer-events-none.absolute.right-4.top-4]:text-gold [&_.pointer-events-none.absolute.right-4.top-4_span]:bg-gold [&_.pointer-events-none.absolute.right-4.top-4_span]:shadow-none">
              <CapillaVideo
                nombre={nombre}
                ciudad=""
                pais=""
                imagenUrl={capilla.imagen_url}
                stream={capilla.stream}
              />
            </div>

          </>
        )}

        {mostrarIntenciones ? (
          <>
            <PrayerForm />
            <PrayerWall />
          </>
        ) : null}
      </main>

      <BottomNav activeLabel="Capilla" />
    </div>
  );
};

export default Capilla;

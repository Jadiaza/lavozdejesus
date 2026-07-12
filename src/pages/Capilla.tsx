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
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_50%_12%,rgba(212,175,55,0.16),transparent_32%),linear-gradient(180deg,#05070d,#061826_42%,#02050a)] text-foreground">
      <CapillaHeader
        nombre={nombre}
        subtitulo={subtitulo}
        logoUrl={capilla?.logo_url}
      />

      <main>
        {cargando ? (
          <section className="px-4 pt-4">
            <div className="mx-auto grid aspect-video max-w-[430px] place-items-center rounded-2xl border border-gold/30 bg-[#07111c] px-6 text-center text-sm leading-relaxed text-foreground/75 shadow-deep">
              {mensajeCarga}
            </div>
          </section>
        ) : error || !capilla ? (
          <section className="px-4 pt-4">
            <div className="mx-auto grid aspect-video max-w-[430px] place-items-center rounded-2xl border border-red-400/30 bg-[#07111c] px-6 text-center text-sm leading-relaxed text-foreground/75 shadow-deep">
              {mensajeError}
            </div>
          </section>
        ) : (
          <CapillaVideo
            nombre={nombre}
            descripcion={capilla.descripcion}
            ciudad={capilla.ciudad}
            pais={capilla.pais}
            sitioWeb={capilla.sitio_web}
            imagenUrl={capilla.imagen_url}
            stream={capilla.stream}
          />
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

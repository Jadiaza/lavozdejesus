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
  subtitulo: "Adoracion Eucaristica - 24 horas",
};

const Capilla = () => {
  const [capilla, setCapilla] = useState<CapillaPublica | null>(null);

  useEffect(() => {
    let active = true;

    getCapillaPublica().then((data) => {
      if (active) {
        setCapilla(data);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const nombre = capilla?.nombre || DEFAULT_CAPILLA.nombre;
  const subtitulo = capilla?.subtitulo || DEFAULT_CAPILLA.subtitulo;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_50%_12%,rgba(212,175,55,0.16),transparent_32%),linear-gradient(180deg,#05070d,#061826_42%,#02050a)] text-foreground">
      <CapillaHeader
        nombre={nombre}
        subtitulo={subtitulo}
        logoUrl={capilla?.logo_url}
      />
      <main>
        <CapillaVideo
          nombre={nombre}
          descripcion={capilla?.descripcion}
          ciudad={capilla?.ciudad}
          pais={capilla?.pais}
          sitioWeb={capilla?.sitio_web}
          imagenUrl={capilla?.imagen_url}
          stream={capilla?.stream}
        />
        <PrayerForm />
        <PrayerWall />
      </main>
      <BottomNav activeLabel="Capilla" />
    </div>
  );
};

export default Capilla;

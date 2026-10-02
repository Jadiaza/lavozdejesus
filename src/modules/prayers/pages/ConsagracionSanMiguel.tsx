import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CONSAGRACION_URL =
  "https://consagraciones.vercel.app/?from=lvjprayer&return=https%3A%2F%2Flavozdejesus.vercel.app%2Foraciones";

export default function ConsagracionSanMiguel() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[80] bg-[#02080d]">
      <div className="absolute left-0 right-0 top-0 z-20 flex h-12 items-center border-b border-[#d8a740]/20 bg-[#050b12]/95 px-3 backdrop-blur">
        <button
          type="button"
          onClick={() => navigate("/oraciones/devociones/san-miguel-arcangel")}
          aria-label="Volver a San Miguel Arcángel"
          className="rounded-full p-2 text-white/85"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="ml-2 text-sm font-semibold text-[#f4c64e]">
          Consagración de 33 días
        </span>
      </div>

      <iframe
        title="Consagración de 33 días a San Miguel Arcángel"
        src={CONSAGRACION_URL}
        className="absolute inset-x-0 top-12 h-[calc(100%-7rem)] w-full border-0"
        allow="autoplay; fullscreen"
      />

      <nav
        aria-label="Navegación de Consagración"
        className="absolute inset-x-0 bottom-0 z-20 h-16 border-t border-[#d8a740]/25 bg-[#050b12]/98 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <button
          type="button"
          onClick={() => navigate("/oraciones")}
          aria-label="Volver a LVJPRAYER"
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[9px] font-medium text-[#f4c64e] transition active:scale-95"
        >
          <Home className="h-[20px] w-[20px]" strokeWidth={1.65} aria-hidden />
          <span>LVJPRAYER</span>
        </button>
      </nav>
    </div>
  );
}

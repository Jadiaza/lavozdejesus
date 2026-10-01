import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CONSAGRACION_URL =
  "https://consagraciones.vercel.app/?from=lvjprayer&return=https%3A%2F%2Flavozdejesus.vercel.app%2F";

export default function ConsagracionSanMiguel() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[80] bg-[#02080d]">
      <div className="absolute left-0 right-0 top-0 z-10 flex h-12 items-center border-b border-[#d8a740]/20 bg-[#050b12]/95 px-3 backdrop-blur">
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
        className="h-full w-full border-0 pt-12"
        allow="autoplay; fullscreen"
      />
    </div>
  );
}

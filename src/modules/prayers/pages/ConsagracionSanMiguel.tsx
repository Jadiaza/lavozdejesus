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
          onClick={() => navigate("/oraciones")}
          aria-label="Volver a LVJPRAYER"
          className="flex items-center gap-2 rounded-full px-2 py-1 text-[#f4c64e] transition active:scale-95"
        >
          <Home className="h-6 w-6" strokeWidth={1.8} aria-hidden />
          <span className="text-sm font-semibold">LVJPRAYER</span>
        </button>
      </div>

      <iframe
        title="Consagración de 33 días a San Miguel Arcángel"
        src={CONSAGRACION_URL}
        className="absolute inset-x-0 top-12 h-[calc(100%-7rem)] w-full border-0"
        allow="autoplay; fullscreen"
      />

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-20 h-16 border-t border-[#d8a740]/25 bg-[#050b12]/98 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      />
    </div>
  );
}

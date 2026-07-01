import { ArrowLeft, Maximize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CapillaHeader = () => {
  const navigate = useNavigate();

  const handleFullscreen = () => {
    const element = document.documentElement;

    if (!document.fullscreenElement && element.requestFullscreen) {
      void element.requestFullscreen();
      return;
    }

    if (document.exitFullscreen) {
      void document.exitFullscreen();
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gold/10 bg-black/72 px-4 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[430px] items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/20 text-foreground/85 transition active:scale-95"
          aria-label="Regresar"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        <div className="min-w-0 text-center">
          <h1 className="font-display text-3xl font-semibold leading-none text-foreground">
            Capilla Virtual
          </h1>
          <div className="mt-2 flex items-center justify-center gap-2 text-xs font-medium text-gold/90">
            <span className="h-px w-10 bg-gradient-gold" />
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="truncate">Adoracion Eucaristica • 24 horas</span>
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="h-px w-10 bg-gradient-gold" />
          </div>
        </div>

        <button
          type="button"
          onClick={handleFullscreen}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/20 text-foreground/85 transition active:scale-95"
          aria-label="Pantalla completa"
        >
          <Maximize2 className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

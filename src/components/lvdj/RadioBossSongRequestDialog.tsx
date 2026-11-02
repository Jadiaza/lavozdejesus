import { useEffect, useRef } from "react";
import { Music2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

declare global {
  interface Window {
    rbcloudSongRequest5970?: {
      requestBtn: string;
      requested: string;
      noTracks: string;
      errors: Record<number, string>;
    };
  }
}

const WIDGET_SCRIPT_URL =
  "https://c11.radioboss.fm/w/songrequest.js?u=373&wid=5970";

export const RadioBossSongRequestDialog = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = widgetRef.current;
    if (!container) return;

    window.rbcloudSongRequest5970 = {
      requestBtn: "Solicitar",
      requested: "Tu solicitud fue recibida correctamente.",
      noTracks: "No se encontraron canciones.",
      errors: {
        1: "Escribe al menos 3 caracteres para buscar.",
        2: "No fue posible cargar los resultados. Inténtalo nuevamente.",
        3: "Las solicitudes están desactivadas en este momento.",
        4: "El servicio no está disponible. Inténtalo más tarde.",
        5: "No se encontró la canción seleccionada.",
        6: "No fue posible enviar la solicitud. Inténtalo nuevamente.",
      },
    };

    const script = document.createElement("script");
    script.src = WIDGET_SCRIPT_URL;
    script.async = true;
    script.dataset.rbcloudSongRequest = "5970";
    container.appendChild(script);

    return () => {
      script.remove();
      delete window.rbcloudSongRequest5970;
      container.querySelector(".rbc_result")?.replaceChildren();
    };
  }, []);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-1.5rem)] max-w-lg overflow-y-auto rounded-3xl border border-gold/40 bg-[#171717] p-5 text-foreground shadow-[0_24px_80px_rgba(0,0,0,0.7)] sm:p-6">
        <DialogHeader className="pr-7 text-left">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/45 bg-gold/10 text-gold">
            <Music2 className="h-6 w-6" />
          </div>
          <DialogTitle className="font-display text-2xl font-semibold text-gold-bright">
            Pide tu canción
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-white/65">
            Busca una canción o un artista en nuestra biblioteca y envía tu
            solicitud a La Voz de Jesús.
          </DialogDescription>
        </DialogHeader>

        <style>{`
          #rbcloud_songrequest5970 {
            color: #f5f0e5;
            font-family: inherit;
          }
          #rbcloud_songrequest5970 .rbc_search {
            display: flex;
            gap: 8px;
            align-items: stretch;
          }
          #rbcloud_songrequest5970 input,
          #rbcloud_songrequest5970 button {
            box-sizing: border-box;
            min-height: 44px;
            border-radius: 10px;
            font: inherit;
          }
          #rbcloud_songrequest5970 input {
            min-width: 0;
            flex: 1;
            padding: 10px 12px;
            border: 1px solid rgba(212,175,55,.38);
            outline: none;
            color: #f8f4e9;
            background: #242424;
          }
          #rbcloud_songrequest5970 input:focus {
            border-color: #d4af37;
            box-shadow: 0 0 0 2px rgba(212,175,55,.14);
          }
          #rbcloud_songrequest5970 input::placeholder {
            color: rgba(255,255,255,.48);
          }
          #rbcloud_songrequest5970 button {
            padding: 9px 15px;
            border: 1px solid #d4af37;
            color: #17130a;
            background: linear-gradient(135deg,#f3d46f,#c99a28);
            font-size: 13px;
            font-weight: 800;
            cursor: pointer;
          }
          #rbcloud_songrequest5970 .rbc_result {
            display: none;
            margin-top: 12px;
            padding: 8px 12px;
            border: 1px solid rgba(212,175,55,.25);
            border-radius: 14px;
            background: rgba(255,255,255,.035);
          }
          #rbcloud_songrequest5970 .rbc_result_item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 2px;
            color: #f5f0e5;
            border-bottom: 1px solid rgba(255,255,255,.1);
          }
          #rbcloud_songrequest5970 .rbc_result_item:last-child {
            border-bottom: 0;
          }
          #rbcloud_songrequest5970 .rbc_result_item div:first-child {
            min-width: 0;
            flex: 1;
            overflow-wrap: anywhere;
            padding-right: 4px;
          }
          #rbcloud_songrequest5970 .rbc_result_item button {
            flex: 0 0 auto;
            min-height: 36px;
            padding: 7px 11px;
          }
          @media (max-width: 380px) {
            #rbcloud_songrequest5970 .rbc_search {
              flex-direction: column;
            }
          }
        `}</style>

        <div
          ref={widgetRef}
          className="rbcloud_songrequest"
          id="rbcloud_songrequest5970"
        >
          <div className="rbc_search">
            <input
              className="rbc_ed_query"
              placeholder="Buscar canción o artista..."
              aria-label="Buscar canción o artista"
            />
            <button className="rbc_bt_search" type="button">
              <Search className="mr-1 inline h-4 w-4" />
              Buscar
            </button>
          </div>
          <div className="rbc_result" aria-live="polite" />
        </div>

        <p className="pt-1 text-center text-xs leading-relaxed text-white/45">
          Las solicitudes se envían al sistema de programación de RadioBOSS.
          La reproducción depende de la programación al aire.
        </p>
      </DialogContent>
    </Dialog>
  );
};

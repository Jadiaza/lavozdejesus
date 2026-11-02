import { useState } from "react";
import { Music2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type RadioBossTrack = {
  id: string | number;
  title: string;
};

type RadioBossResponse = {
  error: false | string;
  code?: number;
  errdetail?: string;
  tracks?: RadioBossTrack[];
};

const API_URL = "https://c11.radioboss.fm/w/songrequestsearch?u=373";

const ERROR_MESSAGES: Record<number, string> = {
  1: "El texto de búsqueda es demasiado corto.",
  2: "No fue posible cargar los resultados. Inténtalo nuevamente.",
  3: "Las solicitudes están desactivadas en este momento.",
  4: "Por favor, inténtalo más tarde.",
  5: "No se encontró la canción seleccionada.",
  6: "No fue posible enviar la solicitud. Inténtalo nuevamente.",
};

function getErrorMessage(response: RadioBossResponse) {
  const message =
    (response.code && ERROR_MESSAGES[response.code]) ||
    (typeof response.error === "string" ? response.error : "Ocurrió un error.");
  return response.errdetail ? `${message} (${response.errdetail})` : message;
}

export const RadioBossSongRequestDialog = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<RadioBossTrack[]>([]);
  const [message, setMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [requestingTrack, setRequestingTrack] = useState<string | number | null>(null);

  const searchTracks = async () => {
    const searchTerm = query.trim();
    if (!searchTerm) {
      setMessage("Escribe el nombre de una canción o artista.");
      setTracks([]);
      return;
    }

    setIsSearching(true);
    setMessage("");
    setTracks([]);

    try {
      const response = await fetch(
        `${API_URL}&q=${encodeURIComponent(searchTerm)}&_=${Date.now()}`,
      );
      if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

      const data = (await response.json()) as RadioBossResponse;
      if (data.error !== false) {
        setMessage(getErrorMessage(data));
      } else if (data.tracks?.length) {
        setTracks(data.tracks);
      } else {
        setMessage("No se encontraron canciones.");
      }
    } catch (error) {
      console.error("RadioBOSS song search failed:", error);
      setMessage("No fue posible conectar con RadioBOSS. Inténtalo nuevamente.");
    } finally {
      setIsSearching(false);
    }
  };

  const requestTrack = async (trackId: string | number) => {
    setRequestingTrack(trackId);
    setMessage("");

    try {
      const requestUrl = API_URL.replace(
        "songrequestsearch",
        "songrequestmake",
      );
      const response = await fetch(
        `${requestUrl}&id=${encodeURIComponent(String(trackId))}&_=${Date.now()}`,
      );
      if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

      const data = (await response.json()) as RadioBossResponse;
      if (data.error !== false) {
        setMessage(getErrorMessage(data));
      } else {
        setMessage("Tu solicitud fue recibida correctamente.");
      }
    } catch (error) {
      console.error("RadioBOSS song request failed:", error);
      setMessage("No fue posible enviar la solicitud. Inténtalo nuevamente.");
    } finally {
      setRequestingTrack(null);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[min(82dvh,760px)] w-[calc(100%-1.25rem)] max-w-lg flex-col gap-0 overflow-hidden rounded-[1.75rem] border border-gold/45 bg-[#151515] p-0 text-foreground shadow-[0_28px_90px_rgba(0,0,0,0.78)] sm:w-[calc(100%-2rem)]">
        <div className="shrink-0 border-b border-gold/15 bg-gradient-to-b from-gold/[0.07] to-transparent px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
        <DialogHeader className="pr-7 text-left">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/45 bg-gold/10 text-gold">
            <Music2 className="h-6 w-6" />
          </div>
          <DialogTitle className="font-display text-2xl font-semibold text-gold-bright">
            Pide tu canción
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-white/65">
            Escribe el nombre de una canción o artista para consultar el catálogo de RadioBOSS.
          </DialogDescription>
        </DialogHeader>
        </div>

        <style>{`
          #rbcloud_songrequest2491 {
            color: #f5f0e5;
            font-family: inherit;
          }
          #rbcloud_songrequest2491 .rbc_search {
            display: flex;
            align-items: stretch;
            gap: 8px;
          }
          #rbcloud_songrequest2491 input,
          #rbcloud_songrequest2491 button {
            box-sizing: border-box;
            min-height: 46px;
            border-radius: 10px;
            font: inherit;
          }
          #rbcloud_songrequest2491 input {
            min-width: 0;
            flex: 1;
            padding: 10px 12px;
            border: 1px solid rgba(212,175,55,.38);
            outline: none;
            color: #f8f4e9;
            background: #242424;
          }
          #rbcloud_songrequest2491 input:focus {
            border-color: #d4af37;
            box-shadow: 0 0 0 2px rgba(212,175,55,.14);
          }
          #rbcloud_songrequest2491 input::placeholder {
            color: rgba(255,255,255,.48);
          }
          #rbcloud_songrequest2491 .rbc_search button,
          #rbcloud_songrequest2491 .rbc_request_btn {
            min-height: 42px;
            padding: 9px 15px;
            border: 1px solid #d4af37;
            border-radius: 10px;
            color: #17130a;
            background: linear-gradient(135deg,#f3d46f,#c99a28);
            font-size: 13px;
            font-weight: 800;
            cursor: pointer;
          }
          #rbcloud_songrequest2491 button:disabled {
            cursor: wait;
            opacity: .65;
          }
          #rbcloud_songrequest2491 .rbc_result {
            max-height: min(42dvh, 390px);
            overflow-y: auto;
            overscroll-behavior: contain;
            margin-top: 12px;
            padding: 5px 12px;
            border: 1px solid rgba(212,175,55,.25);
            border-radius: 16px;
            background: rgba(255,255,255,.035);
            scrollbar-width: thin;
            scrollbar-color: rgba(212,175,55,.55) rgba(255,255,255,.05);
          }
          #rbcloud_songrequest2491 .rbc_result::-webkit-scrollbar { width: 5px; }
          #rbcloud_songrequest2491 .rbc_result::-webkit-scrollbar-thumb {
            border-radius: 8px;
            background: rgba(212,175,55,.55);
          }
          #rbcloud_songrequest2491 .rbc_result_item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 10px 2px;
            color: #f5f0e5;
            border-bottom: 1px solid rgba(255,255,255,.1);
          }
          #rbcloud_songrequest2491 .rbc_result_item:last-child {
            border-bottom: 0;
          }
          #rbcloud_songrequest2491 .rbc_result_item > span {
            min-width: 0;
            flex: 1;
            overflow-wrap: anywhere;
          }
          #rbcloud_songrequest2491 .rbc_status {
            margin-top: 10px;
            color: #f3d46f;
            font-size: 12px;
            line-height: 1.5;
          }
          @media (max-width: 380px) {
            #rbcloud_songrequest2491 .rbc_search {
              flex-direction: column;
            }
          }
        `}</style>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
        <div
          className="rbcloud_songrequest"
          id="rbcloud_songrequest2491"
        >
          <div className="rbc_search">
            <input
              className="rbc_ed_query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void searchTracks();
                }
              }}
              placeholder="Buscar canción o artista..."
              aria-label="Buscar canción o artista"
              autoComplete="off"
            />
            <button
              className="rbc_bt_search"
              type="button"
              onClick={() => void searchTracks()}
              disabled={isSearching}
            >
              <Search className="mr-1 inline h-4 w-4" />
              {isSearching ? "Buscando..." : "Buscar"}
            </button>
          </div>

          {(tracks.length > 0 || message) && (
            <div className="rbc_result" aria-live="polite">
              {tracks.map((track) => (
                <div className="rbc_result_item" key={track.id}>
                  <span>{track.title}</span>
                  <button
                    className="rbc_request_btn"
                    type="button"
                    onClick={() => void requestTrack(track.id)}
                    disabled={requestingTrack !== null}
                  >
                    {requestingTrack === track.id ? "Enviando..." : "Solicitar"}
                  </button>
                </div>
              ))}
              {message && <p className="rbc_status">{message}</p>}
            </div>
          )}
        </div>

        </div>
        <div className="shrink-0 border-t border-white/8 px-5 py-3 text-center sm:px-6">
          <p className="text-[11px] leading-relaxed text-white/45">
            Las solicitudes se envían a RadioBOSS. La reproducción depende de la programación al aire.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

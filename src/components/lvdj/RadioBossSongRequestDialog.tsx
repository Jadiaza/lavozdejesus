import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  Headphones,
  History,
  Loader2,
  Music2,
  Search,
  Send,
  UserRound,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { lvjAuth } from "@/services/lvjAuth";

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

type SongRequestHistory = {
  id: string;
  track_id: string;
  track_title: string;
  status: "received" | "review" | "scheduled" | "played" | "unavailable";
  created_at: string;
};

type View = "search" | "history";

const API_URL = "https://c11.radioboss.fm/w/songrequestsearch?u=373";

const ERROR_MESSAGES: Record<number, string> = {
  1: "El texto de búsqueda es demasiado corto.",
  2: "No fue posible cargar los resultados. Inténtalo nuevamente.",
  3: "Las solicitudes están desactivadas en este momento.",
  4: "Por favor, inténtalo más tarde.",
  5: "No se encontró la canción seleccionada.",
  6: "No fue posible enviar la solicitud. Inténtalo nuevamente.",
};

const STATUS_LABELS: Record<SongRequestHistory["status"], string> = {
  received: "Recibida",
  review: "En revisión",
  scheduled: "Programada",
  played: "Reproducida",
  unavailable: "No disponible",
};

function getErrorMessage(response: RadioBossResponse) {
  const message =
    (response.code && ERROR_MESSAGES[response.code]) ||
    (typeof response.error === "string" ? response.error : "Ocurrió un error.");
  return response.errdetail ? `${message} (${response.errdetail})` : message;
}

const SAME_SONG_COOLDOWN_MS = 60 * 60 * 1000;

function getSongCooldown(trackId: string, requests: SongRequestHistory[]) {
  const latestRequest = requests.find((request) => request.track_id === trackId);
  if (!latestRequest) return 0;
  return Math.max(
    0,
    SAME_SONG_COOLDOWN_MS - (Date.now() - new Date(latestRequest.created_at).getTime()),
  );
}

function formatCooldown(milliseconds: number) {
  const minutes = Math.ceil(milliseconds / 60000);
  return minutes <= 1 ? "Disponible en 1 min" : `Disponible en ${minutes} min`;
}

function formatRequestDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export const RadioBossSongRequestDialog = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  const [view, setView] = useState<View>("search");
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<RadioBossTrack[]>([]);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [requestingTrack, setRequestingTrack] = useState<string | number | null>(null);
  const [history, setHistory] = useState<SongRequestHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [authResolved, setAuthResolved] = useState(false);

  const loadHistory = async () => {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const { data: userData, error: userError } = await lvjAuth.auth.getUser();
      if (userError) throw userError;
      const user = userData.user;
      setUserId(user?.id ?? null);

      if (!user) {
        setHistory([]);
        return;
      }

      const { data, error } = await lvjAuth
        .from("radio_song_requests")
        .select("id, track_id, track_title, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory((data ?? []) as SongRequestHistory[]);
    } catch (error) {
      console.error("RadioBOSS request history failed:", error);
      setHistoryError("No pudimos cargar tus solicitudes. Inténtalo nuevamente.");
    } finally {
      setHistoryLoading(false);
      setAuthResolved(true);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const searchTracks = async () => {
    const searchTerm = query.trim();
    if (!searchTerm) {
      setMessage("Escribe el nombre de una canción o artista.");
      setMessageIsError(true);
      setTracks([]);
      return;
    }

    setIsSearching(true);
    setMessage("");
    setMessageIsError(false);
    setTracks([]);

    try {
      const response = await fetch(
        `${API_URL}&q=${encodeURIComponent(searchTerm)}&_=${Date.now()}`,
      );
      if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

      const data = (await response.json()) as RadioBossResponse;
      if (data.error !== false) {
        setMessage(getErrorMessage(data));
        setMessageIsError(true);
      } else if (data.tracks?.length) {
        setTracks(data.tracks);
      } else {
        setMessage("No encontramos canciones con ese término. Prueba con otro nombre o artista.");
        setMessageIsError(false);
      }
    } catch (error) {
      console.error("RadioBOSS song search failed:", error);
      setMessage("No fue posible conectar con RadioBOSS. Inténtalo nuevamente.");
      setMessageIsError(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Mantiene el flujo de envío que ya funcionaba antes del rediseño:
  // RadioBOSS recibe únicamente el ID de la pista seleccionada.
  const requestTrack = async (trackId: string | number, trackTitle: string) => {
    setRequestingTrack(trackId);
    setMessage("");
    setMessageIsError(false);

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
        setMessageIsError(true);
        return;
      }

      // Primero se confirma el envío a RadioBOSS; el historial es secundario.
      setMessage("Tu solicitud fue recibida correctamente.");
      setMessageIsError(false);

      try {
        const { data: userData, error: userError } = await lvjAuth.auth.getUser();
        if (userError) throw userError;

        if (userData.user) {
          const { error: saveError } = await lvjAuth.from("radio_song_requests").insert({
            user_id: userData.user.id,
            track_id: String(trackId),
            track_title: trackTitle,
            status: "received",
          });

          if (saveError) throw saveError;
          setMessage(`¡Solicitud recibida! “${trackTitle}” quedó guardada en Mis solicitudes.`);
          if (view === "history") await loadHistory();
        }
      } catch (historyError) {
        // Un fallo de sesión o de historial nunca debe convertir en fallida
        // una solicitud que RadioBOSS ya aceptó.
        console.warn("RadioBOSS accepted the request, but history could not be saved:", historyError);
        setMessage("RadioBOSS recibió tu petición, pero no fue posible guardarla en tu historial.");
      }
    } catch (error) {
      console.error("RadioBOSS song request failed:", error);
      setMessage("No fue posible enviar la solicitud. Inténtalo nuevamente.");
      setMessageIsError(true);
    } finally {
      setRequestingTrack(null);
    }
  };

  const openHistory = async () => {
    setView("history");
    await loadHistory();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[min(78dvh,720px)] w-[calc(100%-1.1rem)] max-w-lg flex-col gap-0 overflow-hidden rounded-[1.75rem] border border-gold/45 bg-[#151515] p-0 text-foreground shadow-[0_28px_90px_rgba(0,0,0,0.78)] sm:w-[calc(100%-2rem)]">
        <div className="shrink-0 border-b border-gold/15 bg-gradient-to-b from-gold/[0.08] to-transparent px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-5">
          <DialogHeader className="pr-7 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/45 bg-gold/10 text-gold">
                <Music2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="font-display text-xl font-semibold text-gold-bright">
                  Pide tu canción
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-[13px] leading-relaxed text-white/60">
                  Comparte la música que te acompaña.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-3 grid grid-cols-2 rounded-full border border-white/10 bg-black/35 p-1">
            <button
              type="button"
              onClick={() => setView("search")}
              className={`flex min-h-10 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2 text-[13px] font-semibold transition sm:gap-2 sm:px-3 sm:text-sm ${view === "search" ? "bg-gradient-to-r from-[#f3d46f] to-[#c99a28] text-[#17130a] shadow-[0_4px_16px_rgba(212,175,55,.2)]" : "text-white/65 hover:text-white"}`}
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Buscar</span>
            </button>
            <button
              type="button"
              onClick={() => void openHistory()}
              className={`flex min-h-10 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2 text-[13px] font-semibold transition sm:gap-2 sm:px-3 sm:text-sm ${view === "history" ? "bg-gradient-to-r from-[#f3d46f] to-[#c99a28] text-[#17130a] shadow-[0_4px_16px_rgba(212,175,55,.2)]" : "text-white/65 hover:text-white"}`}
            >
              <History className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Mis solicitudes</span>
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5 sm:px-6 sm:py-4">
          {view === "search" ? (
            <div className="space-y-4">
              <form
                className="flex items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void searchTracks();
                }}
              >
                <label className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/75" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Canción o artista..."
                    aria-label="Buscar canción o artista"
                    autoComplete="off"
                    className="h-11 w-full rounded-xl border border-gold/30 bg-[#222222] pl-11 pr-4 text-[15px] text-white outline-none transition placeholder:text-white/35 focus:border-gold/75 focus:ring-2 focus:ring-gold/10"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e4c45f] bg-gradient-to-r from-[#f3d46f] to-[#c99a28] text-sm font-extrabold text-[#17130a] shadow-[0_5px_18px_rgba(212,175,55,.15)] transition hover:brightness-110 active:scale-[.98] disabled:cursor-wait disabled:opacity-65"
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  <span className="sr-only">{isSearching ? "Buscando" : "Buscar"}</span>
                </button>
              </form>

              {message && (
                <div className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${messageIsError ? "border-red-400/20 bg-red-400/[0.07] text-red-200" : "border-gold/20 bg-gold/[0.07] text-[#ead28b]"}`} role="status">
                  {message}
                </div>
              )}

              {tracks.length > 0 && (
                <section className="overflow-hidden rounded-2xl border border-gold/20 bg-white/[0.025]">
                  <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
                    <span className="text-xs font-bold uppercase tracking-[.16em] text-gold/90">Resultados</span>
                    <span className="text-xs text-white/40">{tracks.length} canciones</span>
                  </div>
                  <div className="max-h-[min(40dvh,360px)] divide-y divide-white/[0.07] overflow-y-auto overscroll-contain">
                    {tracks.map((track) => (
                      <div key={track.id} className="flex items-center gap-2.5 px-3 py-3.5 transition hover:bg-white/[0.025] sm:gap-3 sm:px-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-gold/[0.07] text-gold">
                          <Music2 className="h-5 w-5" />
                        </div>
                        <p className="line-clamp-2 min-w-0 flex-1 break-words text-[13px] font-medium leading-snug text-white/90 sm:text-sm">
                          {track.title}
                        </p>
                        <button
                          type="button"
                          onClick={() => void requestTrack(track.id, track.title)}
                          disabled={requestingTrack !== null}
                          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-gold/55 bg-gradient-to-r from-[#f3d46f] to-[#c99a28] px-2.5 text-[11px] font-extrabold text-[#17130a] transition hover:brightness-110 active:scale-95 disabled:opacity-60 sm:px-3.5 sm:text-xs"
                        >
                          {requestingTrack === track.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          Solicitar
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {!tracks.length && !message && !isSearching && (
                <div className="rounded-2xl border border-dashed border-gold/20 bg-white/[0.02] px-4 py-4 text-center">
                  <Headphones className="mx-auto h-7 w-7 text-gold/65" />
                  <p className="mt-2 text-sm font-medium text-white/75">¿Qué canción te gustaría escuchar?</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/40">Busca por título o artista en nuestra biblioteca musical.</p>
                </div>
              )}
            </div>
          ) : (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-lg font-semibold text-gold-bright">Tu espacio musical</p>
                  <p className="mt-0.5 text-xs text-white/45">Las canciones que has solicitado.</p>
                </div>
                {userId && (
                  <span className="rounded-full border border-gold/20 bg-gold/[0.06] px-3 py-1 text-xs text-gold/90">
                    {history.length} {history.length === 1 ? "solicitud" : "solicitudes"}
                  </span>
                )}
              </div>

              {historyLoading ? (
                <div className="flex flex-col items-center gap-3 py-12 text-white/55">
                  <Loader2 className="h-7 w-7 animate-spin text-gold" />
                  <span className="text-sm">Cargando tu historial...</span>
                </div>
              ) : historyError ? (
                <div className="rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-200" role="alert">
                  {historyError}
                  <button type="button" onClick={() => void loadHistory()} className="mt-3 block font-semibold underline underline-offset-4">Volver a intentar</button>
                </div>
              ) : !authResolved || !userId ? (
                <div className="rounded-2xl border border-gold/20 bg-gradient-to-b from-gold/[0.07] to-transparent px-5 py-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/25 bg-gold/[0.08] text-gold">
                    <UserRound className="h-7 w-7" />
                  </div>
                  <p className="mt-4 font-display text-lg font-semibold text-gold-bright">Tu historial personal</p>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/55">Inicia sesión en LVJPRAYER para guardar tus canciones solicitadas y consultarlas cuando quieras.</p>
                  <Link to="/acceso?next=%2Fradio" onClick={onClose} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#f3d46f] to-[#c99a28] px-6 text-sm font-extrabold text-[#17130a] shadow-[0_5px_18px_rgba(212,175,55,.16)]">
                    Iniciar sesión
                  </Link>
                </div>
              ) : history.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gold/20 bg-white/[0.02] px-5 py-9 text-center">
                  <Music2 className="mx-auto h-8 w-8 text-gold/65" />
                  <p className="mt-3 font-medium text-white/75">Todavía no tienes solicitudes</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/40">Cuando solicites una canción, aparecerá aquí para que puedas consultarla.</p>
                  <button type="button" onClick={() => setView("search")} className="mt-4 text-sm font-semibold text-gold hover:text-gold-bright">Buscar una canción</button>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gold/20 bg-white/[0.025]">
                  <div className="divide-y divide-white/[0.07]">
                    {history.map((request) => {
                      const cooldown = getSongCooldown(request.track_id, history);
                      const latestForTrack = history.find((item) => item.track_id === request.track_id);
                      const isLatestForTrack = latestForTrack?.id === request.id;

                      return (
                        <article key={request.id} className="flex items-start gap-3 px-4 py-4">
                          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-gold/[0.07] text-gold">
                            <Music2 className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="break-words text-sm font-semibold leading-relaxed text-white/90">{request.track_title}</p>
                            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-white/40">
                              <Clock3 className="h-3 w-3" />
                              {formatRequestDate(request.created_at)}
                            </p>
                            <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${request.status === "played" ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300" : request.status === "unavailable" ? "border-red-400/20 bg-red-400/[0.07] text-red-300" : "border-gold/20 bg-gold/[0.06] text-[#e5c86f]"}`}>
                              <CheckCircle2 className="h-3 w-3" />
                              {STATUS_LABELS[request.status]}
                            </span>
                            {isLatestForTrack && (
                              <div className="mt-3">
                                <button
                                  type="button"
                                  onClick={() => void requestTrack(request.track_id, request.track_title)}
                                  disabled={cooldown > 0 || requestingTrack !== null}
                                  className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-gold/45 bg-gold/[0.09] px-3 text-xs font-semibold text-gold transition hover:bg-gold/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-white/35"
                                >
                                  {requestingTrack === request.track_id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Send className="h-3.5 w-3.5" />
                                  )}
                                  {cooldown > 0 ? formatCooldown(cooldown) : "Volver a solicitar"}
                                </button>
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="text-center text-[11px] leading-relaxed text-white/35">
                “Recibida” significa que RadioBOSS aceptó tu petición; no confirma que la canción ya esté al aire.
              </p>
            </section>
          )}
        </div>

        <div className="shrink-0 border-t border-white/[0.07] px-4 py-2 text-center sm:px-6">
          <p className="text-[10px] leading-relaxed text-white/40">
            La reproducción depende de la programación de La Voz de Jesús.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

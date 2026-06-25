import {
  CalendarDays,
  ChevronRight,
  Church,
  Clock3,
  Headphones,
  Home,
  Loader2,
  Mail,
  Menu,
  Pause,
  Play,
  Radio as RadioIcon,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdsenseAd } from "@/components/lvdj/AdsenseAd";
import { BottomNav } from "@/components/lvdj/BottomNav";
import { Logo } from "@/components/lvdj/Logo";
import { useRadioPlayer } from "@/context/useRadioPlayer";
import {
  DEFAULT_APP_CONFIG,
  ProgramacionRadio,
  getAppConfig,
  getPublishedProgramacion,
} from "@/services/sheetsService";
import {
  formatTime,
  getNextProgram,
} from "@/utils/programacion";
import monstranceImage from "@/assets/monstrance-hero.jpg";

const fallbackSchedule: ProgramacionRadio[] = [
  {
    id: "santo-rosario",
    dia_semana: "diario",
    hora_inicio: "06:00",
    hora_fin: "07:00",
    programa: "Santo Rosario",
    descripcion: "Meditacion de los misterios del Rosario.",
    imagen_url: "",
    estado: "publicado",
  },
  {
    id: "santa-misa",
    dia_semana: "diario",
    hora_inicio: "10:00",
    hora_fin: "11:00",
    programa: "Santa Misa",
    descripcion: "Celebracion de la Eucaristia.",
    imagen_url: "",
    estado: "publicado",
  },
  {
    id: "adoracion",
    dia_semana: "diario",
    hora_inicio: "19:00",
    hora_fin: "20:00",
    programa: "Adoracion Eucaristica",
    descripcion: "Un tiempo para adorar al Senor en el Santisimo.",
    imagen_url: "",
    estado: "publicado",
  },
];

const sideLinks = [
  { label: "Inicio", to: "/", icon: Home },
  { label: "Radio en vivo", to: "/radio", icon: RadioIcon },
  { label: "Oracion", to: "/", icon: Church },
  { label: "Evangelio", to: "/lecturas-del-dia", icon: Headphones },
  { label: "Programacion", to: "/programacion", icon: CalendarDays },
  { label: "Contacto", to: "/contacto", icon: Mail },
];

const getDriveImageId = (url: string) => {
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  const idMatch = url.match(/[?&]id=([^&]+)/i);
  const googleUserContentMatch = url.match(/googleusercontent\.com\/d\/([^=/?]+)/i);

  return fileMatch?.[1] ?? idMatch?.[1] ?? googleUserContentMatch?.[1] ?? "";
};

const getProgramImageCandidates = (url: string) => {
  if (!url) return [];

  const driveId = getDriveImageId(url);

  if (!driveId) return [url];

  return [
    `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`,
    `https://lh3.googleusercontent.com/d/${driveId}=s1000`,
    `https://drive.google.com/uc?export=view&id=${driveId}`,
  ];
};

const Radio = () => {
  const navigate = useNavigate();
  const player = useRadioPlayer();
  const [programacion, setProgramacion] = useState<ProgramacionRadio[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [visualizerActive, setVisualizerActive] = useState(false);
  const [nextProgramImageIndex, setNextProgramImageIndex] = useState(0);
  const [adsConfig, setAdsConfig] = useState({
    enabled: DEFAULT_APP_CONFIG.ads_enabled,
    clientId: DEFAULT_APP_CONFIG.adsense_client_id,
    slot:
      import.meta.env.VITE_ADSENSE_RADIO_SLOT ||
      DEFAULT_APP_CONFIG.adsense_radio_slot,
  });

  useEffect(() => {
    let mounted = true;

    window.scrollTo({ left: 0, top: 0, behavior: "auto" });

    getPublishedProgramacion()
      .then((data) => {
        if (mounted) setProgramacion(data);
      })
      .catch(() => {
        if (mounted) setProgramacion([]);
      });

    getAppConfig()
      .then((config) => {
        if (!mounted) return;

        setAdsConfig({
          enabled: config.ads_enabled,
          clientId: config.adsense_client_id,
          slot:
            config.adsense_radio_slot ||
            import.meta.env.VITE_ADSENSE_RADIO_SLOT ||
            "",
        });
      })
      .catch((error) => console.error("Radio config error:", error));

    const timer = window.setInterval(() => setNow(new Date()), 1_000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const schedule = programacion.length ? programacion : fallbackSchedule;
  const nextProgram = useMemo(
    () => getNextProgram(schedule, now),
    [now, schedule],
  );
  const nextProgramImageUrl = nextProgram?.imagen_url ?? "";
  const nextProgramImageCandidates = useMemo(
    () => getProgramImageCandidates(nextProgramImageUrl),
    [nextProgramImageUrl],
  );
  const activeNextProgramImage =
    nextProgramImageCandidates[nextProgramImageIndex] ?? "";
  const showNextProgramImage = Boolean(activeNextProgramImage);
  const nextProgramTitle = nextProgram?.programa ?? "Programacion continua";
  const nextProgramTime = nextProgram
    ? formatTime(nextProgram.hora_inicio)
    : "La Voz de Jesus";
  const nextProgramDescription =
    nextProgram?.descripcion || "La Voz de Jesus";

  useEffect(() => {
    setNextProgramImageIndex(0);
  }, [nextProgramImageUrl]);

  const songTitle =
    player.title && player.title !== player.defaultTitle
      ? player.title
      : player.defaultSubtitle;
  const artistName = player.artist || player.defaultTitle;
  const coverImage = player.artworkUrl || player.playerImageUrl || monstranceImage;

  return (
    <div className="radio-page relative touch-pan-y overscroll-x-none bg-navy-deep text-foreground">
      <div className="fixed inset-0 overflow-hidden">
        <img
          src={coverImage}
          alt=""
          className="h-full w-full scale-[1.42] object-cover opacity-58 blur-3xl saturate-125"
        />
        <div className="absolute inset-x-0 top-[36%] flex justify-center">
          <img
            src={coverImage}
            alt=""
            className="h-[520px] w-[520px] rounded-full object-cover opacity-18 blur-2xl xl:h-[760px] xl:w-[760px]"
          />
        </div>
        <div className="absolute inset-0 bg-navy-deep/62" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,transparent_0%,hsl(var(--gold)/0.16)_18%,transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--navy-deep)/0.42)_58%,hsl(var(--navy-deep)/0.9)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/65 to-transparent" />
      </div>

      <aside
        className={`fixed left-0 top-0 z-40 h-full w-[260px] border-r border-gold/15 bg-navy-deep/88 p-5 shadow-deep backdrop-blur xl:block ${
          menuOpen ? "block" : "hidden"
        }`}
      >
        <Logo size="md" className="mb-8" />
        <nav className="space-y-3">
          {sideLinks.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => {
                setMenuOpen(false);
                if (item.to === "/" || item.to === "/radio") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="flex h-12 items-center gap-3 rounded-full bg-foreground/90 px-4 text-sm font-bold text-navy-deep transition hover:bg-gradient-gold"
            >
              <item.icon className="h-4 w-4 text-gold-deep" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="relative z-10 flex min-h-[100dvh] w-full max-w-full touch-pan-y overscroll-x-none flex-col items-center overflow-x-hidden pb-28 pt-5 xl:ml-[260px] xl:items-stretch xl:pb-0">
        <header className="radio-content flex items-center justify-end xl:w-full xl:max-w-[1280px]">
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="flex h-11 w-11 items-center justify-center rounded-full gold-border bg-navy-deep/55 text-gold shadow-deep backdrop-blur transition hover:bg-gold/10"
            aria-label={menuOpen ? "Cerrar menu" : "Abrir menu"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        <section className="radio-content grid flex-1 items-center gap-4 py-3 xl:w-full xl:max-w-[1280px] xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-6 xl:py-8">
          <div className="player-section relative isolate flex min-h-[calc(100dvh-8.5rem)] w-full flex-col items-center justify-start overflow-hidden rounded-[2rem] pt-0 text-center xl:min-h-[620px] xl:justify-center xl:pt-0">
            {visualizerActive && (
              <div
                className={`radio-visualizer-bg ${
                  player.isPlaying ? "radio-visualizer-bg--playing" : ""
                }`}
                aria-hidden="true"
              />
            )}

            <div
              className={`relative mb-4 flex h-[19rem] w-[19rem] items-center justify-center rounded-full sm:h-80 sm:w-80 xl:h-[360px] xl:w-[360px] ${
                player.isPlaying ? "radio-cover-wave" : ""
              }`}
              style={
                {
                  "--radio-wave-volume": player.volume,
                  "--radio-wave-level": player.audioLevel,
                  "--radio-wave-energy": Math.min(
                    1,
                    player.audioLevel * 0.6 + player.volume * 0.12,
                  ),
                  "--radio-wave-scale": 1.01 + player.audioLevel * 0.06,
                } as CSSProperties
              }
            >
              <div
                className={`radio-cover-orbit ${
                  player.isPlaying ? "radio-cover-orbit--playing" : ""
                }`}
              />
              <img
                src={coverImage}
                alt={player.artworkUrl ? `Caratula de ${songTitle}` : ""}
                className="relative h-[15.9rem] w-[15.9rem] rounded-full border-[3px] border-slate-100/55 object-cover shadow-deep sm:h-[13.5rem] sm:w-[13.5rem] xl:h-[252px] xl:w-[252px]"
              />
            </div>

            <h1
              className="radio-track-title radio-readable-text relative max-w-[21rem] text-[1.45rem] font-extrabold leading-[1.08] sm:max-w-2xl sm:text-3xl xl:text-4xl"
              title={songTitle}
            >
              {songTitle}
            </h1>
            <p
              className="radio-artist-text relative mt-1.5 max-w-[20rem] truncate text-sm font-semibold leading-tight text-gold sm:max-w-xl sm:text-base"
              title={artistName}
            >
              {artistName}
            </p>

            <div className="player-controls radio-volume-control relative mt-5 flex items-center gap-2 px-1 sm:gap-3">
              <button
                type="button"
                onClick={() => player.setVolume(0)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white drop-shadow transition hover:bg-white/10 active:scale-95"
                aria-label="Silenciar"
              >
                <VolumeX className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={player.volume}
                style={
                  {
                    "--radio-volume-percent": `${player.volume * 100}%`,
                  } as CSSProperties
                }
                onChange={(event) =>
                  player.setVolume(Number(event.target.value))
                }
                className="radio-volume-slider min-w-0 w-full"
                aria-label="Volumen"
              />
              <span className="w-10 text-right text-sm font-extrabold text-white drop-shadow sm:w-12 sm:text-lg">
                  {Math.round(player.volume * 100)}%
              </span>
              <button
                type="button"
                onClick={() => player.setVolume(1)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white drop-shadow transition hover:bg-white/10 active:scale-95"
                aria-label="Volumen maximo"
              >
                <Volume2 className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
            </div>

            <div className="player-controls radio-controls-row relative mt-7 grid grid-cols-[5rem_1fr_5rem] items-center justify-items-center gap-0 sm:grid-cols-[6rem_1fr_6rem]">
              <div className="flex w-full justify-center">
                <button
                  type="button"
                  onClick={() => setVisualizerActive((current) => !current)}
                  className={`audio-bars radio-bars-toggle flex h-14 w-14 items-end justify-center gap-1 rounded-2xl p-3 text-white transition active:scale-95 ${
                    visualizerActive
                      ? "radio-bars-toggle--active bg-white/18 shadow-[0_0_28px_rgba(255,255,255,0.18)] backdrop-blur"
                      : "hover:bg-white/10"
                  }`}
                  aria-label={
                    visualizerActive
                      ? "Ocultar visualizador"
                      : "Mostrar visualizador"
                  }
                  aria-pressed={visualizerActive}
                >
                  {[0, 1, 2, 3].map((bar) => (
                    <span
                      key={bar}
                      className={`radio-bars-toggle__bar ${
                        visualizerActive && player.isPlaying
                          ? "radio-bars-toggle__bar--playing"
                          : ""
                      }`}
                      style={
                        {
                          "--bar-index": bar,
                        } as CSSProperties
                      }
                    />
                  ))}
                </button>
              </div>
              <button
                type="button"
                onClick={player.toggle}
                className="play-button flex items-center justify-center rounded-full bg-white text-gold-deep shadow-[0_0_45px_rgba(212,165,76,0.4)] transition hover:scale-[1.03] active:scale-[0.98]"
                aria-label={player.isPlaying ? "Pausar" : "Reproducir"}
              >
                {player.status === "connecting" ? (
                  <Loader2 className="h-10 w-10 animate-spin" />
                ) : player.isPlaying ? (
                  <Pause className="h-12 w-12 fill-current" />
                ) : (
                  <Play className="ml-2 h-14 w-14 fill-current" />
                )}
              </button>

              <div className="flex w-full justify-center">
                <span
                  className={`live-badge inline-flex items-center gap-1 rounded-md border border-white/45 px-2 py-1 text-xs font-extrabold uppercase text-white ${
                    player.isPlaying ? "radio-live-blink" : ""
                  }`}
                >
                  <RadioIcon className="h-4 w-4" />
                  Live
                </span>
              </div>
            </div>
          </div>

          <aside className="w-full scroll-mt-5 space-y-4 pb-28 xl:pb-0">
            <button
              type="button"
              onClick={() => navigate("/programacion")}
              className="next-program-card group w-full border border-gold/28 bg-black/42 text-left shadow-deep backdrop-blur-xl transition hover:border-gold/50 hover:bg-black/52 active:scale-[0.99]"
            >
              <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.22em] text-gold/90">
                Sigue despues
              </div>

              <div className="flex min-h-[82px] items-center gap-3 xl:gap-4">
                <div className="next-program-avatar relative shrink-0 overflow-hidden rounded-full border border-gold/35 bg-black shadow-[0_14px_34px_rgba(0,0,0,0.55)]">
                  <img
                    src={activeNextProgramImage || monstranceImage}
                    alt=""
                    className="h-full w-full object-cover opacity-90"
                    onError={() =>
                      setNextProgramImageIndex((current) =>
                        current + 1 < nextProgramImageCandidates.length
                          ? current + 1
                          : current,
                      )
                    }
                  />
                  <div className="absolute inset-0 rounded-full bg-black/12 ring-1 ring-white/8" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="next-program-title truncate font-extrabold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.55)]">
                    {nextProgramTitle}
                  </h2>
                  <p className="next-program-time text-sm font-extrabold text-gold-bright drop-shadow-[0_1px_1px_rgba(0,0,0,0.55)]">
                    {nextProgramTime}
                  </p>
                  <p className="next-program-description line-clamp-2 text-xs font-medium leading-snug text-foreground/76 xl:text-sm">
                    {nextProgramDescription}
                  </p>
                </div>

                <span className="next-program-arrow flex shrink-0 items-center justify-center rounded-full border border-gold/45 text-gold transition group-hover:bg-gold/10 group-hover:text-gold-bright">
                  <ChevronRight className="h-5 w-5" />
                </span>
              </div>
            </button>

            <section className="quick-access-card gold-border bg-navy-deep/60 shadow-deep backdrop-blur">
              <div className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-gold">
                <Headphones className="h-4 w-4" />
                Accesos rapidos
              </div>
              <div className="quick-access-grid grid grid-cols-2 gap-3">
                {sideLinks.slice(2, 6).map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="quick-access-button gold-border px-3 text-center font-bold uppercase text-foreground/75 transition hover:bg-gold/10 hover:text-gold"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </section>

            <section className="radio-extra-card overflow-hidden gold-border bg-navy-deep/60 p-4 text-center shadow-deep backdrop-blur xl:min-h-[90px]">
              <AdsenseAd
                enabled={adsConfig.enabled}
                clientId={adsConfig.clientId}
                slot={adsConfig.slot}
                format="rectangle"
                fullWidthResponsive
                className="min-h-[90px]"
                fallback={
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-wide text-foreground/75">
                      Espacio publicitario
                    </div>
                    <div className="mt-2 text-2xl font-bold">Paute aqui</div>
                    <div className="mt-1 text-xs text-foreground/60">
                      Llega a nuestra comunidad
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/contacto")}
                      className="mt-4 rounded-lg bg-gradient-gold px-4 py-2 text-xs font-bold text-navy-deep shadow-gold"
                    >
                      Paute aqui
                    </button>
                  </div>
                }
              />
            </section>

            <section className="hidden rounded-full bg-white px-5 py-2 text-center text-2xl font-bold text-red-500 shadow-deep xl:block">
              <Clock3 className="mr-2 inline h-5 w-5 text-red-500" />
              {now.toLocaleTimeString("es-CO")}
            </section>
          </aside>
        </section>

        <footer className="hidden border-t border-white/10 py-3 text-center text-xs text-foreground/75 xl:block">
          La Voz de Jesus - Radio Catolica 24/7
        </footer>
      </main>

      <BottomNav activeLabel="Radio" />
    </div>
  );
};

export default Radio;

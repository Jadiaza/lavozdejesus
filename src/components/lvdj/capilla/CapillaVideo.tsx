import { Users } from "lucide-react";

export const CHAPEL_VIDEO_URL =
  "https://www.youtube.com/embed/zR-IhfYsyKQ?rel=0&modestbranding=1";

export const CapillaVideo = () => (
  <section className="px-4 pt-4">
    <div className="mx-auto max-w-[430px] overflow-hidden rounded-2xl border border-gold/30 bg-black shadow-deep">
      <div className="relative aspect-video w-full overflow-hidden">
        <iframe
          title="Capilla Virtual - Adoracion Eucaristica"
          src={CHAPEL_VIDEO_URL}
          className="h-full w-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />

        <div className="pointer-events-none absolute left-4 top-4 rounded-xl bg-black/68 px-3 py-2 shadow-deep backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm font-extrabold uppercase text-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600 shadow-[0_0_14px_rgba(220,38,38,0.9)]" />
            En vivo
          </div>
          <div className="mt-1 text-xs text-foreground/80">Adoracion al Santisimo</div>
        </div>

        <div className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-black/60 px-3 py-2 text-sm font-semibold text-foreground backdrop-blur-md">
          <Users className="h-4 w-4 text-gold" />
          384 conectados
        </div>
      </div>
    </div>
  </section>
);

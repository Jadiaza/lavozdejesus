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

        <div className="pointer-events-none absolute right-4 top-4 flex items-center gap-2 rounded-xl bg-red-700 px-3 py-2 text-sm font-extrabold uppercase text-white shadow-deep">
          <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.9)]" />
          En vivo
        </div>
      </div>
    </div>
  </section>
);

import type { Mystery } from "../types";

interface Props {
  title: string;
  subtitle?: string;
  image: string;
  mystery: Mystery | null;
  quote?: string | null;
  quoteRef?: string | null;
}

/** Cabecera contemplativa: misterio, arte sacro y cita breve. */
export const RosaryPrayerScene = ({ title, subtitle, image, mystery, quote, quoteRef }: Props) => (
  <section className="text-center">
    <h2 className="font-display text-2xl gold-text">{title}</h2>
    {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
    <div className="mt-3 overflow-hidden rounded-3xl gold-border">
      <img
        src={image}
        alt={mystery ? `Arte sacro: ${mystery.title}` : "Arte sacro del Rosario"}
        width={1024}
        height={640}
        className="h-40 w-full object-cover"
      />
    </div>
    {(quote || mystery?.scriptureRef) && (
      <blockquote className="mt-3">
        <p className="font-display text-lg leading-snug">
          {quote ?? mystery?.scriptureText ?? "Contempla este misterio en silencio."}
        </p>
        <cite className="block text-xs text-gold/90 mt-1 not-italic">{quoteRef ?? mystery?.scriptureRef}</cite>
      </blockquote>
    )}
  </section>
);
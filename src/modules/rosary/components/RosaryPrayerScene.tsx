import type { Mystery } from "../types";

interface Props {
  title: string;
  subtitle?: string;
  image: string;
  mystery: Mystery | null;
  quote?: string | null;
  quoteRef?: string | null;
}

/**
 * Escena contemplativa del misterio actual.
 */
export const RosaryPrayerScene = ({
  title,
  subtitle,
  image,
  mystery,
  quote,
  quoteRef,
}: Props) => {
  const displayedQuote =
    quote ??
    mystery?.scriptureText ??
    "Contempla este misterio en silencio.";

  const displayedReference =
    quoteRef ?? mystery?.scriptureRef ?? "";

  return (
    <section className="text-center">
      <h2 className="font-display text-[2.05rem] font-semibold leading-[1.05] text-foreground sm:text-[2.45rem]">
        {title}
      </h2>

      {subtitle ? (
        <p className="mt-2 font-display text-xl font-medium leading-tight text-gold sm:text-2xl">
          {subtitle}
        </p>
      ) : null}

      <div className="relative mt-4 overflow-hidden rounded-[1.75rem] border border-gold/25 bg-navy">
        <img
          src={image}
          alt={
            mystery
              ? `Arte sacro: ${mystery.title}`
              : "Arte sacro del Santo Rosario"
          }
          width={1024}
          height={1280}
          className="h-[25rem] w-full object-cover object-center sm:h-[31rem]"
        />

        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-navy-deep/75 to-transparent"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[15rem] bg-gradient-to-t from-navy-deep via-navy-deep/82 to-transparent"
          aria-hidden="true"
        />

        <blockquote className="absolute inset-x-0 bottom-0 z-10 px-5 pb-6 text-center sm:px-8">
          <p className="font-display text-[1.35rem] italic leading-[1.35] text-foreground sm:text-[1.6rem]">
            «{displayedQuote}»
          </p>

          {displayedReference ? (
            <cite className="mt-2 block font-display text-lg not-italic text-gold">
              {displayedReference}
            </cite>
          ) : null}
        </blockquote>
      </div>
    </section>
  );
};
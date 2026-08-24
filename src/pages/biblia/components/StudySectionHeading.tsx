type StudySectionHeadingProps = {
  number: number;
  title: string;
  subtitle: string;
  subtitleId: string;
};

export function StudySectionHeading({ number, title, subtitle, subtitleId }: StudySectionHeadingProps) {
  return <header className="mb-4">
    <p className="text-xs uppercase tracking-[.18em] text-[#D4AF37]">{number}. {title}</p>
    <h2 id={subtitleId} className="font-display text-xl">{subtitle}</h2>
  </header>;
}

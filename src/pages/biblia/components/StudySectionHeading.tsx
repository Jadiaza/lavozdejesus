type StudySectionHeadingProps = {
  number: number;
  title: string;
  subtitle: string;
  headingId: string;
};

export function StudySectionHeading({ number, title, subtitle, headingId }: StudySectionHeadingProps) {
  return <header className="mb-4">
    <h2 id={headingId} className="font-display text-lg text-[#D4AF37]">{number}. {title}</h2>
    <h3 className="mt-1 font-display text-xl">{subtitle}</h3>
  </header>;
}

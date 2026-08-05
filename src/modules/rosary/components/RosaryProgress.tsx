interface Props {
  progress: number;
  sectionTitle: string;
  decade?: number | null;
}

export const RosaryProgress = ({ progress, sectionTitle, decade }: Props) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground truncate">{sectionTitle}</span>
      <span className="text-gold">{decade ? `Decena ${decade}/5` : `${progress}%`}</span>
    </div>
    <div
      className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progreso del rosario"
    >
      <div className="h-full bg-gradient-gold transition-all" style={{ width: `${progress}%` }} />
    </div>
  </div>
);
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export const SectionHeader = ({ title, to }: { title: string; to?: string }) => (
  <div className="flex items-end justify-between mb-3">
    <h2 className="text-lg md:text-xl font-semibold tracking-tight">{title}</h2>
    {to && (
      <Link to={to} className="text-xs text-[hsl(var(--lv-text-muted))] hover:text-[hsl(var(--lv-text))] inline-flex items-center gap-1">
        Ver todos <ChevronRight className="h-3 w-3" />
      </Link>
    )}
  </div>
);
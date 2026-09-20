import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

export function BiblePlanCover({
  src,
  alt = "",
  className = "h-36 w-full",
  fallbackClassName = "h-24 w-full",
  iconClassName = "h-10 w-10",
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  iconClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.2),transparent_58%),linear-gradient(135deg,#16120A,#050505)] ${fallbackClassName}`}
        aria-label={alt || "Portada del plan"}
      >
        <Shield className={`${iconClassName} text-[#D4AF37]`} strokeWidth={1.4} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`block object-cover ${className}`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

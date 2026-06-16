import { cn } from "@/lib/utils";

export const Logo = ({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) => {

  const h =
    size === "lg"
      ? "h-20"
      : size === "sm"
      ? "h-9"
      : "h-14";

  return (
    <div className={cn("flex items-center", className)}>
      <img
        src="/logo.png"
        alt="La Voz de Jesús"
        className={cn(
          h,
           "w-auto brightness-125 drop-shadow-[0_0_18px_rgba(212,165,76,0.55)]"
        )}
      />
    </div>
  );
};
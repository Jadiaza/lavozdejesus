import { ReactNode, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const ADSENSE_CLIENT =
  import.meta.env.VITE_ADSENSE_CLIENT || "ca-pub-4848923962603353";

interface AdsenseAdProps {
  slot?: string;
  clientId?: string;
  enabled?: boolean;
  className?: string;
  format?: "auto" | "horizontal" | "rectangle";
  fullWidthResponsive?: boolean;
  fallback: ReactNode;
}

export const AdsenseAd = ({
  slot,
  clientId = ADSENSE_CLIENT,
  enabled = true,
  className = "",
  format = "auto",
  fullWidthResponsive = true,
  fallback,
}: AdsenseAdProps) => {
  const adRef = useRef<HTMLModElement | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (!enabled || !slot) {
      setShowFallback(true);
      return;
    }

    setShowFallback(false);

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (error) {
      console.error("AdSense render error:", error);
      setShowFallback(true);
    }
  }, [enabled, slot]);

  useEffect(() => {
    if (!enabled || !slot || !adRef.current) return;

    const element = adRef.current;
    const hasAdFrame = () => Boolean(element.querySelector("iframe"));

    const timer = window.setTimeout(() => {
      if (!hasAdFrame()) {
        setShowFallback(true);
      }
    }, 2500);

    const observer = new MutationObserver(() => {
      if (hasAdFrame()) {
        setShowFallback(false);
      }
    });

    observer.observe(element, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [enabled, slot]);

  if (!enabled || !slot) {
    return <>{fallback}</>;
  }

  return (
    <>
      <ins
        ref={adRef}
        className={`adsbygoogle block ${showFallback ? "hidden" : ""} ${className}`}
        style={{ display: showFallback ? "none" : "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
      {showFallback ? fallback : null}
    </>
  );
};

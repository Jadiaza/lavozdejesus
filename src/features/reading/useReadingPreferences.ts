import { useEffect, useState } from "react";
import {
  DEFAULT_READING_PREFERENCES,
  loadReadingPreferences,
  resetReadingPreferences,
  saveReadingPreferences,
  type ReadingPreferences,
} from "./readingPreferences";

export function useReadingPreferences() {
  const [preferences, setPreferences] = useState<ReadingPreferences>(DEFAULT_READING_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void loadReadingPreferences().then((value) => {
      if (!active) return;
      setPreferences(value);
      setLoading(false);
    });

    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<ReadingPreferences>).detail;
      if (detail) setPreferences(detail);
    };
    window.addEventListener("lvj:reading-preferences", onChange);
    return () => {
      active = false;
      window.removeEventListener("lvj:reading-preferences", onChange);
    };
  }, []);

  const update = (change: Partial<ReadingPreferences>) => {
    setPreferences((current) => {
      const value = { ...current, ...change };
      void saveReadingPreferences(value);
      return value;
    });
  };

  const reset = async () => {
    const value = await resetReadingPreferences();
    setPreferences(value);
    return value;
  };

  return { preferences, update, reset, loading };
}

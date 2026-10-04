import { useEffect, useState } from "react";
import {
  DEFAULT_READING_PREFERENCES,
  loadReadingPreferences,
  resetReadingPreferences,
  saveReadingPreferences,
  type ReadingPreferences,
} from "./readingPreferences";
import "./readingThemeOverrides.css";

function applyReadingThemeMarker(preferences: ReadingPreferences) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.readingTheme = preferences.tema;
}

export function useReadingPreferences() {
  const [preferences, setPreferences] = useState<ReadingPreferences>(DEFAULT_READING_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void loadReadingPreferences().then((value) => {
      if (!active) return;
      setPreferences(value);
      applyReadingThemeMarker(value);
      setLoading(false);
    });

    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<ReadingPreferences>).detail;
      if (detail) {
        setPreferences(detail);
        applyReadingThemeMarker(detail);
      }
    };
    window.addEventListener("lvj:reading-preferences", onChange);
    return () => {
      active = false;
      window.removeEventListener("lvj:reading-preferences", onChange);
    };
  }, []);

  useEffect(() => {
    applyReadingThemeMarker(preferences);
  }, [preferences]);

  const update = (change: Partial<ReadingPreferences>) => {
    setPreferences((current) => {
      const value = { ...current, ...change };
      applyReadingThemeMarker(value);
      void saveReadingPreferences(value);
      return value;
    });
  };

  const reset = async () => {
    const value = await resetReadingPreferences();
    applyReadingThemeMarker(value);
    setPreferences(value);
    return value;
  };

  return { preferences, update, reset, loading };
}

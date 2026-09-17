import { useEffect, useState } from "react";

export type PrayerTheme = "dark" | "light" | "sepia" | "contrast";
export type PrayerFont = "literata" | "serif" | "sans";
export type PrayerAlignment = "left" | "center" | "justify";

export interface PrayerPreferences {
  theme: PrayerTheme;
  font: PrayerFont;
  fontSize: number;
  alignment: PrayerAlignment;
  lineHeight: number;
  focusedWidth: boolean;
}

const STORAGE_KEY = "lvj-prayer-preferences-v1";
export const defaultPrayerPreferences: PrayerPreferences = {
  theme: "dark",
  font: "literata",
  fontSize: 18,
  alignment: "left",
  lineHeight: 1.75,
  focusedWidth: false,
};

export function usePrayerPreferences() {
  const [preferences, setPreferences] = useState<PrayerPreferences>(() => {
    try {
      return { ...defaultPrayerPreferences, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") };
    } catch {
      return defaultPrayerPreferences;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const update = (values: Partial<PrayerPreferences>) => setPreferences((current) => ({ ...current, ...values }));
  const reset = () => setPreferences(defaultPrayerPreferences);
  return { preferences, update, reset };
}

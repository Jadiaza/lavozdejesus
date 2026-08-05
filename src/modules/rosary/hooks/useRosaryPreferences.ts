import { useCallback, useEffect, useState } from "react";
import { defaultPreferences, rosarySessionService } from "../services/rosarySessionService";
import type { RosaryPreferences } from "../types";

/** Preferencias persistentes (tamaño de texto, contraste, hápticos, audio…). */
export const useRosaryPreferences = () => {
  const [prefs, setPrefs] = useState<RosaryPreferences>(defaultPreferences);

  useEffect(() => {
    setPrefs(rosarySessionService.preferences());
  }, []);

  const update = useCallback((patch: Partial<RosaryPreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      rosarySessionService.savePreferences(next);
      return next;
    });
  }, []);

  return { prefs, update };
};
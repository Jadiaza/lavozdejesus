import { useEffect, useState } from "react";
import { rosaryTodayService } from "../services/rosaryTodayService";
import type { AsyncState, RosaryToday } from "../types";

/** Misterios del día, con degradación local si la API no responde. */
export const useRosaryToday = () => {
  const [state, setState] = useState<AsyncState<RosaryToday>>({ status: "loading" });

  useEffect(() => {
    const ctrl = new AbortController();
    let active = true;
    rosaryTodayService
      .load(ctrl.signal)
      .then((data) => active && setState({ status: "ready", data }))
      .catch(() =>
        active &&
        setState({ status: "ready", data: rosaryTodayService.fallbackForDate() }),
      );
    return () => {
      active = false;
      ctrl.abort();
    };
  }, []);

  return state;
};
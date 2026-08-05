import { useCallback, useEffect, useState } from "react";
import { defaultFlow, rosaryFlowService } from "../services/rosaryFlowService";
import type { RosaryFlow } from "../types";

/** Lee y actualiza la configuración del flujo de rezo (persistente local). */
export const useRosaryFlow = () => {
  const [flow, setFlow] = useState<RosaryFlow>(defaultFlow);

  useEffect(() => {
    setFlow(rosaryFlowService.load());
  }, []);

  const update = useCallback((patch: Partial<RosaryFlow>) => {
    setFlow(rosaryFlowService.patch(patch));
  }, []);

  return { flow, update };
};
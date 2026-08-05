import { useNavigate } from "react-router-dom";
import { CircleDot, Headphones, Sparkles } from "lucide-react";
import { RosaryLayout } from "../components/RosaryLayout";
import { RosaryNavRow } from "../components/RosaryRows";
import { useRosaryFlow } from "../hooks/useRosaryFlow";
import { useRosaryPreferences } from "../hooks/useRosaryPreferences";
import type { RosaryModeId } from "../types";

const MODES: Array<{ id: RosaryModeId; title: string; description: string; icon: typeof CircleDot }> = [
  {
    id: "digital",
    title: "Cuentas digitales",
    description: "La aplicación lleva el conteo y te acompaña oración por oración.",
    icon: Sparkles,
  },
  {
    id: "physical",
    title: "Con mi rosario",
    description: "Usa tus cuentas físicas mientras sigues las oraciones y meditaciones.",
    icon: CircleDot,
  },
  {
    id: "audio",
    title: "Rosario por audio",
    description: "Escucha la guía, responde y contempla cada misterio.",
    icon: Headphones,
  },
];

/** Pantalla 3: elección de modalidad de rezo. */
export const RosarioModalidad = () => {
  const navigate = useNavigate();
  const { update } = useRosaryFlow();
  const { update: updatePrefs } = useRosaryPreferences();

  const choose = (mode: RosaryModeId) => {
    update({ mode });
    updatePrefs({ lastMode: mode });
    navigate("/rosario/intencion");
  };

  return (
    <RosaryLayout title="¿Cómo deseas rezar?" subtitle="Elige tu modalidad" back="/rosario">
      <ul className="space-y-3">
        {MODES.map((m) => (
          <li key={m.id}>
            <RosaryNavRow
              icon={<m.icon className="h-6 w-6" aria-hidden="true" />}
              title={m.title}
              description={m.description}
              onClick={() => choose(m.id)}
            />
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => navigate("/rosario/misterios")}
        className="mt-5 w-full min-h-11 text-sm text-gold underline decoration-[hsl(var(--gold)/0.4)]"
      >
        Ver solamente los misterios
      </button>
    </RosaryLayout>
  );
};

export default RosarioModalidad;
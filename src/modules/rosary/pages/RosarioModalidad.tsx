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
    title: "Interactivo",
    description: "La aplicación lleva el conteo y te acompaña oración por oración.",
    icon: Sparkles,
  },
  {
    id: "physical",
    title: "Con mi Rosario",
    description: "Usa tus cuentas físicas mientras sigues las oraciones y meditaciones.",
    icon: CircleDot,
  },
  {
    id: "audio",
    title: "Audio",
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
    <RosaryLayout title="Modalidad" subtitle="Elige cómo deseas rezar el Santo Rosario" back="/rosario/seleccionar-misterios">
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
    </RosaryLayout>
  );
};

export default RosarioModalidad;

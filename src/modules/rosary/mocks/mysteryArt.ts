import gozosos from "@/assets/rosary/gozosos.jpg";
import luminosos from "@/assets/rosary/luminosos.jpg";
import dolorosos from "@/assets/rosary/dolorosos.jpg";
import gloriosos from "@/assets/rosary/gloriosos.jpg";
import type { MysteryGroupId } from "../types";

/** Arte sacro por grupo de misterios (provisional hasta tener arte oficial). */
export const mysteryArt: Record<MysteryGroupId, string> = {
  gozosos,
  luminosos,
  dolorosos,
  gloriosos,
};

/** Días en que se rezan tradicionalmente cada grupo. */
export const mysteryDays: Record<MysteryGroupId, string> = {
  gozosos: "Lunes y Sábado",
  luminosos: "Jueves",
  dolorosos: "Martes y Viernes",
  gloriosos: "Miércoles y Domingo",
};

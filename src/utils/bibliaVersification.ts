import type { BibliaVersion } from "@/services/bibliaService";

const SPLIT_OR_COMBINED_VULGATE_PSALMS = new Set([9, 113, 114, 115, 146, 147]);

const usesMasoreticPsalmNumbering = (version: BibliaVersion) => {
  const code = version.codigo.toUpperCase();
  const versification = version.versificacion.toLocaleLowerCase("es");
  return code === "TORRESAMAT" || versification.includes("hebr") || versification.includes("masor");
};

export const equivalentChapterFromPlatense = (
  book: string,
  chapter: number,
  targetVersion: BibliaVersion,
) => {
  if (book !== "PSA" || !usesMasoreticPsalmNumbering(targetVersion)) return chapter;
  if (SPLIT_OR_COMBINED_VULGATE_PSALMS.has(chapter)) return null;
  if (chapter >= 10 && chapter <= 112) return chapter + 1;
  if (chapter >= 116 && chapter <= 145) return chapter + 1;
  return chapter;
};

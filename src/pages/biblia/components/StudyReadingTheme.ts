import { createContext, useContext } from "react";

export type StudyReadingTheme = "claro" | "oscuro" | "sepia";

export const StudyReadingThemeContext = createContext<StudyReadingTheme>("oscuro");

export const useStudyReadingTheme = () => useContext(StudyReadingThemeContext);

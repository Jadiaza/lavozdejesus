export type Testamento = "AT" | "NT";

export interface LibroDef {
  id: number;
  nombre: string;
  abbr: string;
  testamento: Testamento;
  matchTitle: string;
}

export const LIBROS: LibroDef[] = [
  { id: 1, nombre: "Génesis", abbr: "gen", testamento: "AT", matchTitle: "Génesis" },
  { id: 2, nombre: "Éxodo", abbr: "exo", testamento: "AT", matchTitle: "Éxodo" },
  { id: 3, nombre: "Levítico", abbr: "lev", testamento: "AT", matchTitle: "Levítico" },
  { id: 4, nombre: "Números", abbr: "num", testamento: "AT", matchTitle: "Números" },
  { id: 5, nombre: "Deuteronomio", abbr: "deu", testamento: "AT", matchTitle: "Deuteronomio" },
  { id: 6, nombre: "Josué", abbr: "jos", testamento: "AT", matchTitle: "Josué" },
  { id: 7, nombre: "Jueces", abbr: "jue", testamento: "AT", matchTitle: "Jueces" },
  { id: 8, nombre: "Rut", abbr: "rut", testamento: "AT", matchTitle: "Rut" },
  { id: 9, nombre: "1 Samuel", abbr: "1sm", testamento: "AT", matchTitle: "1 Samuel" },
  { id: 10, nombre: "2 Samuel", abbr: "2sm", testamento: "AT", matchTitle: "2 Samuel" },
  { id: 11, nombre: "1 Reyes", abbr: "1re", testamento: "AT", matchTitle: "1 Reyes" },
  { id: 12, nombre: "2 Reyes", abbr: "2re", testamento: "AT", matchTitle: "2 Reyes" },
  { id: 13, nombre: "1 Crónicas", abbr: "1cr", testamento: "AT", matchTitle: "1 Crónicas" },
  { id: 14, nombre: "2 Crónicas", abbr: "2cr", testamento: "AT", matchTitle: "2 Crónicas" },
  { id: 15, nombre: "Esdras", abbr: "esd", testamento: "AT", matchTitle: "Esdras" },
  { id: 16, nombre: "Nehemías", abbr: "neh", testamento: "AT", matchTitle: "Nehemías" },
  { id: 17, nombre: "Tobías", abbr: "tob", testamento: "AT", matchTitle: "Tobías" },
  { id: 18, nombre: "Judit", abbr: "jdt", testamento: "AT", matchTitle: "Judit" },
  { id: 19, nombre: "Ester", abbr: "est", testamento: "AT", matchTitle: "Ester" },
  { id: 20, nombre: "Job", abbr: "job", testamento: "AT", matchTitle: "Job" },
  { id: 21, nombre: "Salmos", abbr: "sal", testamento: "AT", matchTitle: "Salmo" },
  { id: 22, nombre: "Proverbios", abbr: "pro", testamento: "AT", matchTitle: "Proverbios" },
  { id: 23, nombre: "Eclesiastés", abbr: "ecl", testamento: "AT", matchTitle: "Eclesiastés" },
  { id: 24, nombre: "Cantar de los Cantares", abbr: "can", testamento: "AT", matchTitle: "Cantares" },
  { id: 25, nombre: "Sabiduría", abbr: "sab", testamento: "AT", matchTitle: "Sabiduría" },
  { id: 26, nombre: "Eclesiástico (Sirácida)", abbr: "sir", testamento: "AT", matchTitle: "Eclesiástico" },
  { id: 27, nombre: "Isaías", abbr: "isa", testamento: "AT", matchTitle: "Isaías" },
  { id: 28, nombre: "Jeremías", abbr: "jer", testamento: "AT", matchTitle: "Jeremías" },
  { id: 29, nombre: "Lamentaciones", abbr: "lam", testamento: "AT", matchTitle: "Lamentaciones" },
  { id: 30, nombre: "Baruc", abbr: "bar", testamento: "AT", matchTitle: "Baruc" },
  { id: 31, nombre: "Ezequiel", abbr: "eze", testamento: "AT", matchTitle: "Ezequiel" },
  { id: 32, nombre: "Daniel", abbr: "dan", testamento: "AT", matchTitle: "Daniel" },
  { id: 33, nombre: "Oseas", abbr: "ose", testamento: "AT", matchTitle: "Oseas" },
  { id: 34, nombre: "Joel", abbr: "joe", testamento: "AT", matchTitle: "Joel" },
  { id: 35, nombre: "Amós", abbr: "amo", testamento: "AT", matchTitle: "Amós" },
  { id: 36, nombre: "Abdías", abbr: "abd", testamento: "AT", matchTitle: "Abdías" },
  { id: 37, nombre: "Jonás", abbr: "jon", testamento: "AT", matchTitle: "Jonás" },
  { id: 38, nombre: "Miqueas", abbr: "miq", testamento: "AT", matchTitle: "Miqueas" },
  { id: 39, nombre: "Nahúm", abbr: "nah", testamento: "AT", matchTitle: "Nahúm" },
  { id: 40, nombre: "Habacuc", abbr: "hab", testamento: "AT", matchTitle: "Habacuc" },
  { id: 41, nombre: "Sofonías", abbr: "sof", testamento: "AT", matchTitle: "Sofonías" },
  { id: 42, nombre: "Ageo", abbr: "age", testamento: "AT", matchTitle: "Ageo" },
  { id: 43, nombre: "Zacarías", abbr: "zac", testamento: "AT", matchTitle: "Zacarías" },
  { id: 44, nombre: "Malaquías", abbr: "mal", testamento: "AT", matchTitle: "Malaquías" },
  { id: 45, nombre: "1 Macabeos", abbr: "1ma", testamento: "AT", matchTitle: "1 Macabeos" },
  { id: 46, nombre: "2 Macabeos", abbr: "2ma", testamento: "AT", matchTitle: "2 Macabeos" },
  { id: 47, nombre: "Mateo", abbr: "mat", testamento: "NT", matchTitle: "Mateo" },
  { id: 48, nombre: "Marcos", abbr: "mar", testamento: "NT", matchTitle: "Marcos" },
  { id: 49, nombre: "Lucas", abbr: "luc", testamento: "NT", matchTitle: "Lucas" },
  { id: 50, nombre: "Juan", abbr: "jua", testamento: "NT", matchTitle: "Juan" },
  { id: 51, nombre: "Hechos", abbr: "hec", testamento: "NT", matchTitle: "Hechos" },
  { id: 52, nombre: "Romanos", abbr: "rom", testamento: "NT", matchTitle: "Romanos" },
  { id: 53, nombre: "1 Corintios", abbr: "1co", testamento: "NT", matchTitle: "1 Corintios" },
  { id: 54, nombre: "2 Corintios", abbr: "2co", testamento: "NT", matchTitle: "2 Corintios" },
  { id: 55, nombre: "Gálatas", abbr: "gal", testamento: "NT", matchTitle: "Gálatas" },
  { id: 56, nombre: "Efesios", abbr: "efe", testamento: "NT", matchTitle: "Efesios" },
  { id: 57, nombre: "Filipenses", abbr: "flp", testamento: "NT", matchTitle: "Filipenses" },
  { id: 58, nombre: "Colosenses", abbr: "col", testamento: "NT", matchTitle: "Colosenses" },
  { id: 59, nombre: "1 Tesalonicenses", abbr: "1te", testamento: "NT", matchTitle: "1 Tesalonicenses" },
  { id: 60, nombre: "2 Tesalonicenses", abbr: "2te", testamento: "NT", matchTitle: "2 Tesalonicenses" },
  { id: 61, nombre: "1 Timoteo", abbr: "1ti", testamento: "NT", matchTitle: "1 Timoteo" },
  { id: 62, nombre: "2 Timoteo", abbr: "2ti", testamento: "NT", matchTitle: "2 Timoteo" },
  { id: 63, nombre: "Tito", abbr: "tit", testamento: "NT", matchTitle: "Tito" },
  { id: 64, nombre: "Filemón", abbr: "flm", testamento: "NT", matchTitle: "Filemón" },
  { id: 65, nombre: "Hebreos", abbr: "heb", testamento: "NT", matchTitle: "Hebreos" },
  { id: 66, nombre: "Santiago", abbr: "san", testamento: "NT", matchTitle: "Santiago" },
  { id: 67, nombre: "1 Pedro", abbr: "1pe", testamento: "NT", matchTitle: "1 Pedro" },
  { id: 68, nombre: "2 Pedro", abbr: "2pe", testamento: "NT", matchTitle: "2 Pedro" },
  { id: 69, nombre: "1 Juan", abbr: "1ju", testamento: "NT", matchTitle: "1 Juan" },
  { id: 70, nombre: "2 Juan", abbr: "2ju", testamento: "NT", matchTitle: "2 Juan" },
  { id: 71, nombre: "3 Juan", abbr: "3ju", testamento: "NT", matchTitle: "3 Juan" },
  { id: 72, nombre: "Judas", abbr: "jud", testamento: "NT", matchTitle: "Judas" },
  { id: 73, nombre: "Apocalipsis", abbr: "apo", testamento: "NT", matchTitle: "Apocalipsis" },
];

export const libroById = (id: number) => LIBROS.find((l) => l.id === id);
export const libroByAbbr = (abbr: string) => LIBROS.find((l) => l.abbr === abbr);

export const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export const libroByMatchTitle = (title: string): LibroDef | undefined => {
  const n = norm(title);
  return LIBROS.find((l) => norm(l.matchTitle) === n);
};

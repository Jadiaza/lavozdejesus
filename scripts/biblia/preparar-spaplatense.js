#!/usr/bin/env node

/**
 * Preparador diagnóstico de la Biblia Platense / Straubinger.
 *
 * Por defecto solo valida y presenta un resumen. No usa MySQL.
 * Use --write para generar archivos intermedios en procesado/.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "storage/biblia/spaplatense/fuente/json");
const CLEAN_PATH = path.join(SOURCE_DIR, "SpaPlatense.json");
const OSIS_PATH = path.join(SOURCE_DIR, "SpaPlatense-osis.json");
const OUTPUT_DIR = path.join(ROOT, "storage/biblia/spaplatense/procesado");
const WRITE = process.argv.slice(2).includes("--write");

const EXTRA_BOOKS = new Set([
  "Prayer of Manasses",
  "I Esdras",
  "II Esdras",
  "Additional Psalm",
  "Laodiceans",
]);

const BOOKS = [
  ["Genesis", "GEN", "Génesis", "Gn", "AT", "Pentateuco", false],
  ["Exodus", "EXO", "Éxodo", "Ex", "AT", "Pentateuco", false],
  ["Leviticus", "LEV", "Levítico", "Lv", "AT", "Pentateuco", false],
  ["Numbers", "NUM", "Números", "Nm", "AT", "Pentateuco", false],
  ["Deuteronomy", "DEU", "Deuteronomio", "Dt", "AT", "Pentateuco", false],
  ["Joshua", "JOS", "Josué", "Jos", "AT", "Históricos", false],
  ["Judges", "JDG", "Jueces", "Jue", "AT", "Históricos", false],
  ["Ruth", "RUT", "Rut", "Rt", "AT", "Históricos", false],
  ["I Samuel", "1SA", "1 Samuel", "1 Sam", "AT", "Históricos", false],
  ["II Samuel", "2SA", "2 Samuel", "2 Sam", "AT", "Históricos", false],
  ["I Kings", "1KI", "1 Reyes", "1 Re", "AT", "Históricos", false],
  ["II Kings", "2KI", "2 Reyes", "2 Re", "AT", "Históricos", false],
  ["I Chronicles", "1CH", "1 Crónicas", "1 Cr", "AT", "Históricos", false],
  ["II Chronicles", "2CH", "2 Crónicas", "2 Cr", "AT", "Históricos", false],
  ["Ezra", "EZR", "Esdras", "Esd", "AT", "Históricos", false],
  ["Nehemiah", "NEH", "Nehemías", "Neh", "AT", "Históricos", false],
  ["Tobit", "TOB", "Tobías", "Tob", "AT", "Deuterocanónicos", true],
  ["Judith", "JDT", "Judit", "Jdt", "AT", "Deuterocanónicos", true],
  ["Esther", "EST", "Ester", "Est", "AT", "Históricos", false],
  ["Job", "JOB", "Job", "Job", "AT", "Sapienciales", false],
  ["Psalms", "PSA", "Salmos", "Sal", "AT", "Sapienciales", false],
  ["Proverbs", "PRO", "Proverbios", "Prov", "AT", "Sapienciales", false],
  ["Ecclesiastes", "ECC", "Eclesiastés", "Ecl", "AT", "Sapienciales", false],
  ["Song of Solomon", "SNG", "Cantar de los Cantares", "Cant", "AT", "Sapienciales", false],
  ["Wisdom", "WIS", "Sabiduría", "Sab", "AT", "Deuterocanónicos", true],
  ["Sirach", "SIR", "Eclesiástico", "Eclo", "AT", "Deuterocanónicos", true],
  ["Isaiah", "ISA", "Isaías", "Is", "AT", "Profetas", false],
  ["Jeremiah", "JER", "Jeremías", "Jer", "AT", "Profetas", false],
  ["Lamentations", "LAM", "Lamentaciones", "Lam", "AT", "Profetas", false],
  ["Baruch", "BAR", "Baruc", "Bar", "AT", "Deuterocanónicos", true],
  ["Ezekiel", "EZK", "Ezequiel", "Ez", "AT", "Profetas", false],
  ["Daniel", "DAN", "Daniel", "Dan", "AT", "Profetas", false],
  ["Hosea", "HOS", "Oseas", "Os", "AT", "Profetas", false],
  ["Joel", "JOL", "Joel", "Jl", "AT", "Profetas", false],
  ["Amos", "AMO", "Amós", "Am", "AT", "Profetas", false],
  ["Obadiah", "OBA", "Abdías", "Abd", "AT", "Profetas", false],
  ["Jonah", "JON", "Jonás", "Jon", "AT", "Profetas", false],
  ["Micah", "MIC", "Miqueas", "Miq", "AT", "Profetas", false],
  ["Nahum", "NAM", "Nahúm", "Nah", "AT", "Profetas", false],
  ["Habakkuk", "HAB", "Habacuc", "Hab", "AT", "Profetas", false],
  ["Zephaniah", "ZEP", "Sofonías", "Sof", "AT", "Profetas", false],
  ["Haggai", "HAG", "Ageo", "Ag", "AT", "Profetas", false],
  ["Zechariah", "ZEC", "Zacarías", "Zac", "AT", "Profetas", false],
  ["Malachi", "MAL", "Malaquías", "Mal", "AT", "Profetas", false],
  ["I Maccabees", "1MA", "1 Macabeos", "1 Mac", "AT", "Deuterocanónicos", true],
  ["II Maccabees", "2MA", "2 Macabeos", "2 Mac", "AT", "Deuterocanónicos", true],
  ["Matthew", "MAT", "Mateo", "Mt", "NT", "Evangelios", false],
  ["Mark", "MRK", "Marcos", "Mc", "NT", "Evangelios", false],
  ["Luke", "LUK", "Lucas", "Lc", "NT", "Evangelios", false],
  ["John", "JHN", "Juan", "Jn", "NT", "Evangelios", false],
  ["Acts", "ACT", "Hechos de los Apóstoles", "Hch", "NT", "Históricos NT", false],
  ["Romans", "ROM", "Romanos", "Rom", "NT", "Cartas Paulinas", false],
  ["I Corinthians", "1CO", "1 Corintios", "1 Cor", "NT", "Cartas Paulinas", false],
  ["II Corinthians", "2CO", "2 Corintios", "2 Cor", "NT", "Cartas Paulinas", false],
  ["Galatians", "GAL", "Gálatas", "Gal", "NT", "Cartas Paulinas", false],
  ["Ephesians", "EPH", "Efesios", "Ef", "NT", "Cartas Paulinas", false],
  ["Philippians", "PHP", "Filipenses", "Flp", "NT", "Cartas Paulinas", false],
  ["Colossians", "COL", "Colosenses", "Col", "NT", "Cartas Paulinas", false],
  ["I Thessalonians", "1TH", "1 Tesalonicenses", "1 Tes", "NT", "Cartas Paulinas", false],
  ["II Thessalonians", "2TH", "2 Tesalonicenses", "2 Tes", "NT", "Cartas Paulinas", false],
  ["I Timothy", "1TI", "1 Timoteo", "1 Tim", "NT", "Cartas Pastorales", false],
  ["II Timothy", "2TI", "2 Timoteo", "2 Tim", "NT", "Cartas Pastorales", false],
  ["Titus", "TIT", "Tito", "Tit", "NT", "Cartas Pastorales", false],
  ["Philemon", "PHM", "Filemón", "Flm", "NT", "Cartas Paulinas", false],
  ["Hebrews", "HEB", "Hebreos", "Heb", "NT", "Cartas Católicas", false],
  ["James", "JAS", "Santiago", "Sant", "NT", "Cartas Católicas", false],
  ["I Peter", "1PE", "1 Pedro", "1 Pe", "NT", "Cartas Católicas", false],
  ["II Peter", "2PE", "2 Pedro", "2 Pe", "NT", "Cartas Católicas", false],
  ["I John", "1JN", "1 Juan", "1 Jn", "NT", "Cartas Católicas", false],
  ["II John", "2JN", "2 Juan", "2 Jn", "NT", "Cartas Católicas", false],
  ["III John", "3JN", "3 Juan", "3 Jn", "NT", "Cartas Católicas", false],
  ["Jude", "JUD", "Judas", "Jud", "NT", "Cartas Católicas", false],
  ["Revelation of John", "REV", "Apocalipsis", "Ap", "NT", "Apocalíptico", false],
];

const BOOK_BY_SOURCE = new Map(BOOKS.map((book, index) => [book[0], {
  source: book[0], codigo: book[1], nombre: book[2], abreviatura: book[3],
  testamento: book[4], grupo: book[5], deuterocanonico: book[6], orden: index + 1,
}]));

const hash = (value) => crypto.createHash("sha256")
  .update(Buffer.isBuffer(value) ? value : Buffer.from(String(value), "utf8"))
  .digest("hex");
const decodeEntities = (value) => String(value || "")
  .replace(/&#(x?[0-9a-f]+);/gi, (_, code) => String.fromCodePoint(
    code[0].toLowerCase() === "x" ? parseInt(code.slice(1), 16) : parseInt(code, 10),
  ))
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const plainText = (value) => decodeEntities(String(value || "").replace(/<[^>]+>/g, " "))
  .replace(/\s+/g, " ").trim();

function readJson(file) {
  if (!fs.existsSync(file)) throw new Error(`No existe el archivo: ${file}`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function coordinates(bible) {
  const result = new Set();
  for (const book of bible.books || []) for (const chapter of book.chapters || []) {
    for (const verse of chapter.verses || []) result.add(`${book.name}|${chapter.chapter}|${verse.verse}`);
  }
  return result;
}

function taggedItems(raw, tag) {
  const items = [];
  const expression = new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)<\\/${tag}>`, "gi");
  let match;
  while ((match = expression.exec(String(raw || ""))) !== null) {
    const text = plainText(match[2]);
    if (text) items.push({ attributes: match[1], text, position: items.length + 1 });
  }
  return items;
}

function processSources(cleanBible, osisBible) {
  if (!Array.isArray(cleanBible.books) || !Array.isArray(osisBible.books)) {
    throw new Error("Los JSON deben contener books[].");
  }
  const cleanCoordinates = coordinates(cleanBible);
  const osisCoordinates = coordinates(osisBible);
  const missingInOsis = [...cleanCoordinates].filter((key) => !osisCoordinates.has(key));
  const missingInClean = [...osisCoordinates].filter((key) => !cleanCoordinates.has(key));
  if (missingInOsis.length || missingInClean.length) {
    throw new Error(`Las fuentes no coinciden: ${missingInOsis.length} faltan en OSIS y ${missingInClean.length} faltan en limpio.`);
  }

  const osisBooks = new Map(osisBible.books.map((book) => [book.name, book]));
  const libros = [], versiculos = [], notas = [], secciones = [];
  const excluded = [], unknown = [], empty = [];

  for (const cleanBook of cleanBible.books) {
    if (EXTRA_BOOKS.has(cleanBook.name)) { excluded.push(cleanBook.name); continue; }
    const meta = BOOK_BY_SOURCE.get(cleanBook.name);
    if (!meta) { unknown.push(cleanBook.name); continue; }
    const osisChapters = new Map((osisBooks.get(cleanBook.name)?.chapters || [])
      .map((chapter) => [chapter.chapter, chapter]));
    libros.push({ ...meta, canonico: true, capitulos: cleanBook.chapters?.length || 0 });

    for (const chapter of cleanBook.chapters || []) {
      const osisVerses = new Map((osisChapters.get(chapter.chapter)?.verses || [])
        .map((verse) => [verse.verse, verse]));
      for (const verse of chapter.verses || []) {
        const text = String(verse.text || "").trim();
        const coordinate = `${meta.codigo}.${chapter.chapter}.${verse.verse}`;
        if (!text) { empty.push(coordinate); continue; }
        const rawOsis = String(osisVerses.get(verse.verse)?.text || "");
        versiculos.push({
          id_ref: coordinate, libro_codigo: meta.codigo, capitulo: chapter.chapter,
          versiculo: verse.verse, referencia: `${meta.nombre} ${chapter.chapter},${verse.verse}`,
          texto: text, tiene_nota: /<note\b/i.test(rawOsis),
        });
        taggedItems(rawOsis, "note").forEach((note) => notas.push({
          id_ref: `${coordinate}.nota.${note.position}`, libro_codigo: meta.codigo,
          capitulo: chapter.chapter, versiculo: verse.verse, posicion: note.position,
          contenido: note.text, fuente: "SpaPlatense-osis.json",
          hash_importacion: hash(`${coordinate}|nota|${note.position}|${note.text}`),
        }));
        taggedItems(rawOsis, "title").forEach((title) => {
          const type = title.attributes.match(/type=["']([^"']+)["']/i)?.[1] || null;
          secciones.push({
            id_ref: `${coordinate}.seccion.${title.position}`, libro_codigo: meta.codigo,
            capitulo: chapter.chapter, versiculo_inicio: verse.verse, posicion: title.position,
            titulo: title.text, tipo: type, fuente: "SpaPlatense-osis.json",
            hash_importacion: hash(`${coordinate}|seccion|${title.position}|${title.text}`),
          });
        });
      }
    }
  }
  if (libros.length !== 73 || unknown.length) {
    throw new Error(`Canon inesperado: ${libros.length} libros y ${unknown.length} desconocidos.`);
  }
  return { libros, versiculos, notas, secciones, reporte: {
    modo: WRITE ? "escritura-procesados" : "diagnostico",
    libros_fuente: cleanBible.books.length, libros_canonicos: libros.length,
    libros_excluidos: excluded, libros_desconocidos: unknown,
    versiculos_fuente: cleanCoordinates.size, versiculos_procesados: versiculos.length,
    versiculos_vacios: empty.length, muestra_vacios: empty.slice(0, 50),
    notas_extraidas: notas.length, secciones_extraidas: secciones.length,
  }};
}

function writeOutputs(result) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const files = { libros: result.libros, versiculos: result.versiculos, notas: result.notas,
    secciones: result.secciones, "reporte-importacion": result.reporte };
  for (const [name, data] of Object.entries(files)) {
    fs.writeFileSync(path.join(OUTPUT_DIR, `${name}.json`), `${JSON.stringify(data, null, 2)}\n`, "utf8");
  }
  const manifest = {
    version: "SpaPlatense: Biblia Platense (Straubinger)",
    licencia: "Public Domain", versificacion: "Vulg",
    fuentes: [CLEAN_PATH, OSIS_PATH].map((file) => ({
      archivo: path.relative(ROOT, file), bytes: fs.statSync(file).size,
      sha256: hash(fs.readFileSync(file)),
    })),
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, "manifiesto.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

function main() {
  const result = processSources(readJson(CLEAN_PATH), readJson(OSIS_PATH));
  if (WRITE) writeOutputs(result);
  console.log(JSON.stringify(result.reporte, null, 2));
  console.log(WRITE ? `Procesados escritos en ${OUTPUT_DIR}` : "Diagnóstico completado sin escribir archivos. Use --write para generarlos.");
  console.log("No se importó nada a MySQL.");
}

try { main(); } catch (error) {
  console.error(`Error preparando SpaPlatense: ${error.message}`);
  process.exitCode = 1;
}

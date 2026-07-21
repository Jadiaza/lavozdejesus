import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || path.join(import.meta.dirname, '..'));
const txtRoot = path.join(root, 'storage', 'biblia', 'scio', 'fuente', 'txt');
const processed = path.join(root, 'storage', 'biblia', 'scio', 'procesado');
const revision = path.join(processed, 'revision');
const reports = path.join(processed, 'reportes');
fs.mkdirSync(revision, { recursive: true }); fs.mkdirSync(reports, { recursive: true });

const books = JSON.parse(fs.readFileSync(path.join(root, 'storage', 'biblia', 'spaplatense', 'procesado', 'libros.json'), 'utf8').replace(/^\uFEFF/, ''));
const referenceVerses = JSON.parse(fs.readFileSync(path.join(root, 'storage', 'biblia', 'spaplatense', 'procesado', 'versiculos.json'), 'utf8').replace(/^\uFEFF/, ''));
const verseMax = new Map();
for (const verse of referenceVerses) {
  const key = `${verse.libro_codigo}.${verse.capitulo}`;
  verseMax.set(key, Math.max(verseMax.get(key) || 0, Number(verse.versiculo)));
}

const normalize = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
const latinWords = new Set('ET IN EST NON QUI QUAE QUOD DEUS DOMINUS DIXIT AUTEM CUM AD DE EX PER SUPER EIUS EUM ERAT SUNT TERRA CAELUM FILIUS FILII MEUM TUAM VOS NOS'.split(' '));
const spanishWords = new Set('EL LA LOS LAS Y EN QUE DE DEL DIOS SENOR DIJO ESTABA PARA POR CON SU SUS UN UNA FUE COMO NO SE AL MAS HABIA'.split(' '));
const referenceWords = /\b(?:cap|lib|psalm|matth|luc|joan|rom|corinth|reg|paralip|isai|jerem|ezech|vers|vease)\.?\b/i;

function roman(number) {
  const table = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let result = '';
  for (const [value, symbol] of table) while (number >= value) { result += symbol; number -= value; }
  return result;
}

function strictRomanValue(token) {
  if (!/^[IVXLCDM]+$/.test(token)) return null;
  const values = { I:1,V:5,X:10,L:50,C:100,D:500,M:1000 };
  let total = 0;
  for (let index = 0; index < token.length; index++) {
    const current = values[token[index]], next = values[token[index + 1]] || 0;
    total += current < next ? -current : current;
  }
  return roman(total) === token ? total : null;
}

function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const old = row[j]; row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1)); previous = old;
    }
  }
  return row[b.length];
}

function language(text) {
  const words = text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase().match(/[A-Z]+/g) || [];
  let la = 0, es = 0;
  for (const word of words) { if (latinWords.has(word)) la++; if (spanishWords.has(word)) es++; }
  return { la, es };
}

const files = fs.readdirSync(txtRoot).filter(name => name.endsWith('.txt') && !name.startsWith('._'))
  .map(name => ({ name, volume: Number(name.match(/\[Tomo\s+(\d+)\]/i)?.[1] || 0) })).filter(x => x.volume).sort((a,b) => a.volume-b.volume);
const lines = [];
for (const file of files) {
  fs.readFileSync(path.join(txtRoot, file.name), 'utf8').replace(/\r/g, '').split('\n').forEach((text, local) => lines.push({ text, tomo: file.volume, linea: local + 1 }));
}

const volumeBooks = {
  1:['GEN'], 2:['EXO','LEV','NUM'], 3:['DEU','JOS','JDG','RUT'], 4:['1SA','2SA','1KI','2KI'],
  5:['1CH','2CH','EZR','NEH','TOB','JDT'], 6:['EST','JOB'], 7:['PSA'],
  8:['PRO','ECC','SNG','WIS','SIR'], 9:['ISA','JER','LAM'], 10:['BAR','EZK','DAN'],
  11:['HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL','1MA','2MA'],
  12:['MAT','MRK','LUK'], 13:['JHN','ACT'],
  14:['ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB'],
  15:['JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV'],
};
const byCode = new Map(books.map(book => [book.codigo, book]));
const chapterRefs = [];
for (const [volume, codes] of Object.entries(volumeBooks)) for (const code of codes) {
  const book = byCode.get(code);
  for (let chapter = 1; chapter <= Number(book.capitulos); chapter++) chapterRefs.push({ book, chapter, volume: Number(volume), expected: verseMax.get(`${book.codigo}.${chapter}`) || 0 });
}

const headingPattern = /^\s*(?:CAP[IÍ]TULO|PSALM[Oo])\s+([IVXLCDM0-9]{1,8})\s*[.,;:*]?\s*$/i;
const volumeRanges = new Map();
for (let volume = 1; volume <= 15; volume++) {
  const start = lines.findIndex(line => line.tomo === volume);
  let end = lines.findIndex((line, index) => index > start && line.tomo > volume);
  if (end < 0) end = lines.length;
  volumeRanges.set(volume, { start, end });
}
const boundaries = [];
let activeVolume = 0, cursor = 0, volumeEnd = lines.length;
for (const ref of chapterRefs) {
  if (ref.volume !== activeVolume) {
    activeVolume = ref.volume;
    const range = volumeRanges.get(activeVolume); cursor = range.start; volumeEnd = range.end;
  }
  const wantedRoman = roman(ref.chapter);
  let found = -1;
  for (let index = cursor; index < volumeEnd; index++) {
    const match = lines[index].text.match(headingPattern);
    if (!match) continue;
    const token = normalize(match[1]).replace(/1/g, 'I').replace(/0/g, 'O');
    const numeric = /^\d+$/.test(token) ? Number(token) : null;
    const romanValue = strictRomanValue(token);
    const matches = numeric != null ? numeric === ref.chapter
      : romanValue != null ? romanValue === ref.chapter
      : distance(token, wantedRoman) <= 1;
    if (matches) { found = index; break; }
  }
  if (found < 0) { boundaries.push({ ...ref, found: false }); continue; }
  boundaries.push({ ...ref, found: true, start: found, source: lines[found] }); cursor = found + 1;
}
for (let i = 0; i < boundaries.length; i++) if (boundaries[i].found) {
  const next = boundaries.slice(i + 1).find(item => item.found);
  boundaries[i].end = next ? next.start : lines.length;
}

function paragraphs(start, end) {
  const result = []; let parts = [], first = start;
  const flush = last => {
    if (!parts.length) return;
    const text = parts.join(' ').replace(/¬\s+/g, '').replace(/-\s+/g, '').replace(/\s+/g, ' ').trim(); parts = [];
    const match = text.match(/^([1-9]\d{0,2})\s+(.{2,})$/s);
    if (match) result.push({ number: Number(match[1]), text: match[2], position: first, end: last, source: lines[first] });
  };
  for (let i = start; i < end; i++) {
    const value = lines[i].text.trim();
    if (!value) { flush(i - 1); continue; }
    if (!parts.length) first = i; parts.push(value);
  }
  flush(end - 1); return result;
}

function candidateScore(candidate, target) {
  const score = language(candidate.text);
  let value = target === 'es' ? score.es * 3 - score.la * 4 : score.la * 3 - score.es * 4;
  if (candidate.text.length >= 12 && candidate.text.length <= 500) value += 3;
  if (candidate.text.length > 800) value -= 8;
  if (referenceWords.test(candidate.text)) value -= 6;
  return value;
}

function selectSequence(items, maxVerse, target) {
  const groups = Array.from({ length: maxVerse + 1 }, () => []);
  for (const item of items) if (item.number >= 1 && item.number <= maxVerse) groups[item.number].push(item);
  let states = [{ position: -1, score: 0, selected: [] }];
  for (let number = 1; number <= maxVerse; number++) {
    const next = [];
    for (const state of states) for (const candidate of groups[number]) if (candidate.position > state.position) {
      next.push({ position: candidate.position, score: state.score + candidateScore(candidate, target), selected: [...state.selected, candidate] });
    }
    next.sort((a,b) => b.score-a.score); states = next.slice(0, 40);
    if (!states.length) return null;
  }
  return states[0];
}

const es = [], la = [], issues = [], chapterStats = [];
for (const boundary of boundaries) {
  if (!boundary.found || !boundary.end || !boundary.expected) {
    issues.push({ libro_codigo: boundary.book.codigo, capitulo: boundary.chapter, tipo: 'encabezado_no_localizado' }); continue;
  }
  const items = paragraphs(boundary.start + 1, boundary.end);
  const esSequence = selectSequence(items, boundary.expected, 'es');
  const laSequence = selectSequence(items, boundary.expected, 'la');
  chapterStats.push({ libro_codigo: boundary.book.codigo, capitulo: boundary.chapter, tomo: boundary.source.tomo, esperados: boundary.expected, candidatos: items.length, es_completo: Boolean(esSequence), la_completo: Boolean(laSequence) });
  if (!esSequence || !laSequence) {
    issues.push({ libro_codigo: boundary.book.codigo, capitulo: boundary.chapter, tipo: 'secuencia_incompleta', esperados: boundary.expected, candidatos: items.length }); continue;
  }
  esSequence.selected.forEach((item, index) => es.push({ libro_codigo: boundary.book.codigo, capitulo: boundary.chapter, versiculo: index + 1, texto: item.text, revision_requerida: true, fuente: { tomo: item.source.tomo, linea: item.source.linea } }));
  laSequence.selected.forEach((item, index) => la.push({ libro_codigo: boundary.book.codigo, capitulo: boundary.chapter, versiculo: index + 1, texto: item.text, revision_requerida: true, fuente: { tomo: item.source.tomo, linea: item.source.linea } }));
}

fs.writeFileSync(path.join(revision, 'versiculos-es-candidatos.json'), `${JSON.stringify(es, null, 2)}\n`);
fs.writeFileSync(path.join(revision, 'versiculos-latin-candidatos.json'), `${JSON.stringify(la, null, 2)}\n`);
const report = { schema: 'lvj.scio.heuristic-canonicalization.v1', generated_at: new Date().toISOString(), canonical_ready: false,
  totals: { capitulos_esperados: chapterRefs.length, capitulos_localizados: boundaries.filter(x=>x.found).length, capitulos_es_completos: chapterStats.filter(x=>x.es_completo).length, capitulos_latin_completos: chapterStats.filter(x=>x.la_completo).length, versiculos_es_candidatos: es.length, versiculos_latin_candidatos: la.length, incidencias: issues.length },
  issues, chapters: chapterStats };
fs.writeFileSync(path.join(reports, 'canonizacion-heuristica.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.totals, null, 2));

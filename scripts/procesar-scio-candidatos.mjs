import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(process.argv[2] || path.join(import.meta.dirname, '..'));
const sourceRoot = path.join(projectRoot, 'storage', 'biblia', 'scio', 'fuente', 'txt');
const processedRoot = path.join(projectRoot, 'storage', 'biblia', 'scio', 'procesado');
const reviewRoot = path.join(processedRoot, 'revision');
const reportRoot = path.join(processedRoot, 'reportes');
fs.mkdirSync(reviewRoot, { recursive: true });
fs.mkdirSync(reportRoot, { recursive: true });

const normalize = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, ' ').trim();
const latinWords = new Set('et in est non qui quae quod deus dominus dixit autem cum ad de ex per super eius eum erat sunt terra caelum filius filii meum tuam vos nos'.split(' '));
const spanishWords = new Set('el la los las y en que de del dios señor dijo estaba para por con su sus un una fue como no se al mas habia'.split(' '));
const referenceWords = /\b(?:cap|lib|psalm|matth|luc|joan|rom|corinth|reg|paralip|isai|jerem|ezech|vers|vease)\.?\b/i;

function languageScore(text) {
  const words = normalize(text).toLowerCase().match(/[a-zñ]+/g) || [];
  let latin = 0, spanish = 0;
  for (const word of words) {
    if (latinWords.has(word)) latin++;
    if (spanishWords.has(word)) spanish++;
  }
  const total = Math.max(1, latin + spanish);
  return { latin, spanish, confidence: Math.abs(latin - spanish) / total };
}

function classify(text) {
  const score = languageScore(text);
  if (referenceWords.test(text) || text.length > 900) return { type: 'nota_probable', ...score };
  if (score.latin > score.spanish) return { type: 'latin_probable', ...score };
  if (score.spanish > score.latin) return { type: 'espanol_probable', ...score };
  return { type: 'ambiguo', ...score };
}

const files = fs.readdirSync(sourceRoot)
  .filter(name => name.toLowerCase().endsWith('.txt') && !name.startsWith('._'))
  .map(name => ({ name, volume: Number(name.match(/\[Tomo\s+(\d+)\]/i)?.[1] || 0) }))
  .filter(item => item.volume > 0).sort((a, b) => a.volume - b.volume);

if (files.length !== 15) throw new Error(`Se requieren 15 TXT; se encontraron ${files.length}.`);

const candidatePath = path.join(reviewRoot, 'parrafos-numerados.jsonl');
const headingPath = path.join(reviewRoot, 'encabezados.jsonl');
const candidates = fs.createWriteStream(candidatePath, { encoding: 'utf8' });
const headings = fs.createWriteStream(headingPath, { encoding: 'utf8' });
const volumeReports = [];
let candidateTotal = 0, headingTotal = 0, ambiguousTotal = 0;

for (const file of files) {
  const raw = fs.readFileSync(path.join(sourceRoot, file.name), 'utf8').replace(/\r/g, '');
  const lines = raw.split('\n');
  let paragraph = [], paragraphStart = 1;
  const counts = { latin_probable: 0, espanol_probable: 0, nota_probable: 0, ambiguo: 0 };
  let volumeCandidates = 0, volumeHeadings = 0;

  const flush = endLine => {
    if (!paragraph.length) return;
    const text = paragraph.join(' ').replace(/¬\s+/g, '').replace(/-\s+/g, '').replace(/\s+/g, ' ').trim();
    paragraph = [];
    const match = text.match(/^([1-9]\d{0,2})\s+(.{2,})$/s);
    if (!match) return;
    const classification = classify(match[2]);
    counts[classification.type]++;
    if (classification.type === 'ambiguo' || classification.confidence < 0.34) ambiguousTotal++;
    const record = {
      schema: 'lvj.scio.ocr-numbered-paragraph.v1', tomo: file.volume,
      linea_inicio: paragraphStart, linea_fin: endLine,
      numero_impreso: Number(match[1]), texto: match[2],
      clasificacion: classification.type, confianza: Number(classification.confidence.toFixed(3)),
    };
    candidates.write(`${JSON.stringify(record)}\n`); candidateTotal++; volumeCandidates++;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (/^CAP[IÍ]TULO\s+[IVXLCDM1-9][IVXLCDM\d.\s-]*$/i.test(normalize(trimmed))) {
      const record = { schema: 'lvj.scio.ocr-heading.v1', tomo: file.volume, linea: index + 1, tipo: 'capitulo', texto: trimmed };
      headings.write(`${JSON.stringify(record)}\n`); headingTotal++; volumeHeadings++;
    } else if (trimmed.length >= 4 && trimmed.length <= 90 && /^(?:EL|LA|LOS|LAS|LIBRO|EVANGELIO|EPISTOLA|PROPHECIA|PROFECIA|APOCAL)/i.test(normalize(trimmed)) && trimmed === trimmed.toUpperCase()) {
      const record = { schema: 'lvj.scio.ocr-heading.v1', tomo: file.volume, linea: index + 1, tipo: 'encabezado', texto: trimmed };
      headings.write(`${JSON.stringify(record)}\n`); headingTotal++; volumeHeadings++;
    }
    if (trimmed === '') { flush(index); return; }
    if (!paragraph.length) paragraphStart = index + 1;
    paragraph.push(trimmed);
  });
  flush(lines.length);
  volumeReports.push({ tomo: file.volume, archivo: file.name, lineas: lines.length, candidatos: volumeCandidates, encabezados: volumeHeadings, clasificaciones: counts });
}

await Promise.all([
  new Promise(resolve => candidates.end(resolve)),
  new Promise(resolve => headings.end(resolve)),
]);

const report = {
  schema: 'lvj.scio.ocr-candidate-report.v1', generated_at: new Date().toISOString(),
  canonical_ready: false,
  reason: 'Los párrafos aún no tienen libro, capítulo y versículo verificados.',
  totals: { tomos: files.length, parrafos_numerados: candidateTotal, encabezados: headingTotal, ambiguos_o_baja_confianza: ambiguousTotal },
  volumes: volumeReports,
  outputs: [path.relative(projectRoot, candidatePath).replaceAll('\\', '/'), path.relative(projectRoot, headingPath).replaceAll('\\', '/')],
};
fs.writeFileSync(path.join(reportRoot, 'procesamiento-candidatos.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(processedRoot, 'manifiesto-candidatos.json'), `${JSON.stringify({ schema: 'lvj.scio.candidate-manifest.v1', reviewed: false, generated_at: report.generated_at, report: 'reportes/procesamiento-candidatos.json' }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report.totals, null, 2));

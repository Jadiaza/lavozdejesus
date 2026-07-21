import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || path.join(import.meta.dirname, '..'));
const processed = path.join(root, 'storage', 'biblia', 'scio', 'procesado');
const esRoot = path.join(processed, 'es');
const reports = path.join(processed, 'reportes');
fs.mkdirSync(esRoot, { recursive: true }); fs.mkdirSync(reports, { recursive: true });

const booksSource = path.join(root, 'storage', 'biblia', 'spaplatense', 'procesado', 'libros.json');
const books = JSON.parse(fs.readFileSync(booksSource, 'utf8').replace(/^\uFEFF/, '')).map(({ source, ...book }) => book);
if (books.length !== 73) throw new Error(`El canon de referencia no contiene 73 libros: ${books.length}.`);
fs.writeFileSync(path.join(esRoot, 'libros.json'), `${JSON.stringify(books, null, 2)}\n`, 'utf8');

const heuristic = JSON.parse(fs.readFileSync(path.join(reports, 'canonizacion-heuristica.json'), 'utf8'));
const alignment = JSON.parse(fs.readFileSync(path.join(reports, 'alineacion-paginas.json'), 'utf8'));
const expectedVerses = JSON.parse(fs.readFileSync(path.join(root, 'storage', 'biblia', 'spaplatense', 'procesado', 'versiculos.json'), 'utf8').replace(/^\uFEFF/, '')).length;
const accepted = Number(heuristic.totals.versiculos_es_candidatos || 0);
const report = {
  schema: 'lvj.scio.spanish-validation.v1', generated_at: new Date().toISOString(), canonical_ready: false,
  scope: { language:'es', comparison_only:true, latin:false, notes:false, sections:false },
  totals: { libros:books.length, capitulos_esperados:heuristic.totals.capitulos_esperados, capitulos_es_completos:heuristic.totals.capitulos_es_completos, versiculos_esperados:expectedVerses, versiculos_candidatos:accepted, versiculos_pendientes:Math.max(0, expectedVerses-accepted), paginas_alineadas:alignment.totals.paginas_alineadas, paginas_solo_imagen:alignment.totals.solo_imagen },
  blockers: [
    'No todos los capítulos tienen una secuencia española completa.',
    'Los candidatos OCR requieren cotejo antes de convertirse en es/versiculos.json.',
    'Las páginas sin texto EPUB deben cotejarse con TXT o ABBYY.',
  ],
};
fs.writeFileSync(path.join(reports, 'validacion-espanol.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(processed, 'manifiesto-espanol-borrador.json'), `${JSON.stringify({ schema:'lvj.scio.spanish-draft.v1', reviewed:false, canonical_ready:false, generated_at:report.generated_at, validation:'reportes/validacion-espanol.json' }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report.totals, null, 2));

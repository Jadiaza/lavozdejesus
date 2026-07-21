import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || path.join(import.meta.dirname, '..'));
const numbersRoot = path.join(root, 'storage', 'biblia', 'scio', 'fuente', 'otros');
const epubRoot = path.join(root, 'storage', 'biblia', 'scio', 'procesado', 'extraccion-epub');
const outRoot = path.join(root, 'storage', 'biblia', 'scio', 'procesado', 'revision');
const reportRoot = path.join(root, 'storage', 'biblia', 'scio', 'procesado', 'reportes');
fs.mkdirSync(outRoot, { recursive: true }); fs.mkdirSync(reportRoot, { recursive: true });

const numberFiles = fs.readdirSync(numbersRoot).filter(name => name.endsWith('_page_numbers.json') && !name.startsWith('._'));
if (numberFiles.length !== 15) throw new Error(`Se requieren 15 page_numbers.json; se encontraron ${numberFiles.length}.`);
const output = fs.createWriteStream(path.join(outRoot, 'mapa-paginas.jsonl'), 'utf8');
const volumes = []; let total = 0, withoutNumber = 0, imageOnly = 0, lowAccuracy = 0;

for (const numberFile of numberFiles) {
  const volume = Number(numberFile.match(/\[Tomo\s+(\d+)\]/i)?.[1] || 0);
  const numbering = JSON.parse(fs.readFileSync(path.join(numbersRoot, numberFile), 'utf8').replace(/^\uFEFF/, ''));
  const epubFile = path.join(epubRoot, `tomo-${String(volume).padStart(2, '0')}-paginas.jsonl`);
  const epubPages = fs.readFileSync(epubFile, 'utf8').trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
  const byPage = new Map(epubPages.map(page => [Number(page.pagina_epub), page]));
  let matched = 0, volumeWithout = 0, volumeImages = 0, volumeLow = 0;
  for (const pageNumber of numbering.pages) {
    // Internet Archive usa page_N en EPUB y leafNum basado en 1; se prueban ambos desplazamientos.
    const epub = byPage.get(Number(pageNumber.leafNum) - 1) || byPage.get(Number(pageNumber.leafNum));
    if (!epub) continue;
    matched++; total++;
    const printed = String(pageNumber.pageNumber || '').trim();
    if (!printed) { withoutNumber++; volumeWithout++; }
    const onlyImage = Boolean(epub.contiene_imagen) && String(epub.texto || '').trim().length < 10;
    if (onlyImage) { imageOnly++; volumeImages++; }
    const accuracy = epub.precision_estimada == null ? null : Number(epub.precision_estimada);
    if (accuracy != null && accuracy < 50) { lowAccuracy++; volumeLow++; }
    output.write(`${JSON.stringify({ schema:'lvj.scio.page-alignment.v1', tomo:volume, leaf_num:Number(pageNumber.leafNum), pagina_epub:Number(epub.pagina_epub), pagina_impresa:printed || null, confianza_numeracion:Number(pageNumber.confidence || 0), precision_epub:accuracy, solo_imagen:onlyImage, fuente_texto:onlyImage ? 'txt_abbyy' : 'epub_txt' })}\n`);
  }
  volumes.push({ tomo:volume, hojas_numeracion:numbering.pages.length, paginas_epub:epubPages.length, alineadas:matched, sin_numero:volumeWithout, solo_imagen:volumeImages, precision_menor_50:volumeLow });
}
await new Promise(resolve => output.end(resolve));
volumes.sort((a,b)=>a.tomo-b.tomo);
const report = { schema:'lvj.scio.page-alignment-report.v1', generated_at:new Date().toISOString(), totals:{tomos:volumes.length,paginas_alineadas:total,sin_numero:withoutNumber,solo_imagen:imageOnly,precision_menor_50:lowAccuracy}, volumes };
fs.writeFileSync(path.join(reportRoot, 'alineacion-paginas.json'), `${JSON.stringify(report,null,2)}\n`);
console.log(JSON.stringify(report.totals,null,2));

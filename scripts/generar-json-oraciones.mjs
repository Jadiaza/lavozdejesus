import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sourcePath = path.join(root, 'app-admin/data/oraciones-devocionario-catolico.json');
const outputDirectory = path.join(root, 'app-admin/data/oraciones');

const categoryForApp = (sourceCategory) => {
  if (['Oraciones del cristiano', 'Devociones', 'Sanación y protección', 'Liberación'].includes(sourceCategory)) return sourceCategory;
  if (['Vida diaria', 'Intercesión'].includes(sourceCategory)) return 'Oraciones del cristiano';
  if (sourceCategory === 'Sanación y protección') return 'Sanación y protección';
  if (sourceCategory === 'Liberación') return 'Liberación';
  return 'Devociones';
};

const slugify = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
fs.mkdirSync(outputDirectory, { recursive: true });

const index = source.oraciones.map((prayer, position) => {
  const order = position + 1;
  const slug = slugify(prayer.titulo);
  const filename = `${String(order).padStart(2, '0')}-${slug}.json`;
  const record = {
    schema_version: 2,
    slug,
    tipo: prayer.devocion_slug ? 'devocion' : 'independiente',
    titulo: prayer.titulo,
    subtitulo: prayer.subtitulo,
    categoria: categoryForApp(prayer.categoria),
    subcategoria: prayer.subcategoria || prayer.subcategoria_app || '',
    devocion_slug: prayer.devocion_slug || null,
    descripcion: prayer.descripcion,
    texto_completo: prayer.texto_completo,
    contenido_json: {
      version: 2,
      categoria: categoryForApp(prayer.categoria),
      subcategoria: prayer.subcategoria || prayer.subcategoria_app || '',
      devocion_slug: prayer.devocion_slug || null,
      secciones: [
        {
          tipo: 'oracion',
          texto: prayer.texto_completo,
        },
      ],
      apariencia: {
        tema: prayer.tema_visual,
      },
    },
    tema_visual: prayer.tema_visual,
    imagen: null,
    audio_url: null,
    fuente: prayer.fuente || 'Devocionario Católico',
    pagina_fuente: prayer.pagina_fuente,
    derechos_revisados: false,
    destacada: false,
    disponible_offline: true,
    orden: order,
    estado_revision: 'revision',
  };

  fs.writeFileSync(path.join(outputDirectory, filename), `${JSON.stringify(record, null, 2)}\n`);
  return {
    orden: order,
    slug,
    titulo: prayer.titulo,
    categoria: record.categoria,
    subcategoria: record.subcategoria,
    devocion_slug: record.devocion_slug,
    archivo: filename,
  };
});

fs.writeFileSync(path.join(outputDirectory, 'index.json'), `${JSON.stringify({
  schema_version: 2,
  coleccion: source.coleccion,
  total: index.length,
  estado_revision: 'revision',
  oraciones: index,
}, null, 2)}\n`);

console.log(`Generados ${index.length} JSON individuales en ${outputDirectory}`);

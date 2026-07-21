<?php

declare(strict_types=1);

/**
 * Contrato de los artefactos canónicos de Scío.
 * Los OCR originales se procesan localmente y nunca se reciben por HTTP.
 */
function bib_scio_processed_files(string $projectRoot): array
{
  $base = $projectRoot . '/storage/biblia/scio/procesado';
  return [
    'manifiesto' => $base . '/manifiesto.json',
    'es_libros' => $base . '/es/libros.json',
    'es_versiculos' => $base . '/es/versiculos.json',
    'reporte' => $base . '/reportes/validacion-espanol.json',
  ];
}

function bib_scio_read_json(string $path): array
{
  if (!is_file($path)) {
    throw new RuntimeException('Falta el procesado de Scío: ' . str_replace('\\', '/', $path));
  }
  $raw = (string) file_get_contents($path);
  $raw = preg_replace('/^\xEF\xBB\xBF/', '', $raw) ?? $raw;
  $data = json_decode($raw, true, 64, JSON_THROW_ON_ERROR);
  if (!is_array($data)) throw new RuntimeException('JSON de Scío inválido: ' . basename($path));
  return $data;
}

function bib_scio_validate_book_rows(array $books, string $language): array
{
  if (count($books) !== 73) {
    throw new RuntimeException("Scío {$language}: se requieren exactamente 73 libros; se encontraron " . count($books) . '.');
  }
  $result = [];
  foreach ($books as $index => $book) {
    $code = strtoupper(trim((string) ($book['codigo'] ?? '')));
    if ($code === '' || isset($result[$code])) throw new RuntimeException("Scío {$language}: código de libro vacío o duplicado.");
    $order = (int) ($book['orden'] ?? 0);
    $chapters = (int) ($book['capitulos'] ?? 0);
    if ($order !== $index + 1 || $chapters < 1 || trim((string) ($book['nombre'] ?? '')) === '') {
      throw new RuntimeException("Scío {$language}: metadatos inválidos en el libro {$code}.");
    }
    $result[$code] = $book;
  }
  return $result;
}

function bib_scio_validate_verse_rows(array $verses, array $books, string $language): array
{
  if (count($verses) < 30000) {
    throw new RuntimeException("Scío {$language}: el texto parece incompleto; solo contiene " . count($verses) . ' versículos.');
  }
  $seen = [];
  $chapterMax = [];
  foreach ($verses as $verse) {
    $code = strtoupper(trim((string) ($verse['libro_codigo'] ?? '')));
    $chapter = (int) ($verse['capitulo'] ?? 0);
    $number = (int) ($verse['versiculo'] ?? 0);
    $text = trim((string) ($verse['texto'] ?? ''));
    if (!isset($books[$code]) || $chapter < 1 || $number < 1 || $text === '') {
      throw new RuntimeException("Scío {$language}: versículo sin referencia, libro o texto válido.");
    }
    $key = $code . '.' . $chapter . '.' . $number;
    if (isset($seen[$key])) throw new RuntimeException("Scío {$language}: referencia duplicada {$key}.");
    $seen[$key] = true;
    $chapterMax[$code] = max($chapterMax[$code] ?? 0, $chapter);
  }
  foreach ($books as $code => $book) {
    if (($chapterMax[$code] ?? 0) !== (int) $book['capitulos']) {
      throw new RuntimeException("Scío {$language}: capítulos incompletos en {$code}.");
    }
  }
  return $seen;
}

function bib_scio_validation(string $projectRoot): array
{
  $files = bib_scio_processed_files($projectRoot);
  $missing = array_keys(array_filter($files, static fn(string $path, string $key): bool => $key !== 'reporte' && !is_file($path), ARRAY_FILTER_USE_BOTH));
  $status = ['ready' => false, 'missing' => $missing, 'counts' => [], 'error' => ''];
  if ($missing) return $status;
  try {
    $manifest = bib_scio_read_json($files['manifiesto']);
    if (($manifest['schema'] ?? '') !== 'lvj.scio.spanish-canonical.v1' || empty($manifest['reviewed'])) {
      throw new RuntimeException('El manifiesto debe usar lvj.scio.spanish-canonical.v1 y estar marcado como revisado.');
    }
    $esBooks = bib_scio_validate_book_rows(bib_scio_read_json($files['es_libros']), 'español');
    $esVerses = bib_scio_read_json($files['es_versiculos']);
    $esRefs = bib_scio_validate_verse_rows($esVerses, $esBooks, 'español');
    unset($esRefs);
    $status['ready'] = true;
    $status['counts'] = ['libros' => count($esBooks), 'es_versiculos' => count($esVerses)];
  } catch (Throwable $error) {
    $status['error'] = $error->getMessage();
  }
  return $status;
}

function bib_scio_insert_version(PDO $pdo, array $meta, array $books, array $verses, array $notes = [], array $sections = []): array
{
  $version = $pdo->prepare("INSERT INTO lvj_bib_versiones
    (nombre,abreviatura,codigo,idioma,fuente,licencia,fuente_url,copyright_notas,canon,versificacion,estado,created_at,updated_at)
    VALUES (:nombre,:abreviatura,:codigo,:idioma,:fuente,:licencia,:fuente_url,:copyright_notas,73,'Vulgata',1,NOW(),NOW())");
  $version->execute($meta);
  $versionId = (int) $pdo->lastInsertId();
  $insertBook = $pdo->prepare("INSERT INTO lvj_bib_libros
    (version_id,testamento,grupo,orden,nombre,abreviatura,codigo,capitulos,estado,created_at,updated_at)
    VALUES (:version_id,:testamento,:grupo,:orden,:nombre,:abreviatura,:codigo,:capitulos,1,NOW(),NOW())");
  $bookIds = [];
  foreach ($books as $book) {
    $insertBook->execute(['version_id' => $versionId] + array_intersect_key($book, array_flip(['testamento','grupo','orden','nombre','abreviatura','codigo','capitulos'])));
    $bookIds[strtoupper((string) $book['codigo'])] = (int) $pdo->lastInsertId();
  }
  $titles = [];
  foreach ($sections as $section) {
    $key = strtoupper((string) ($section['libro_codigo'] ?? '')) . '.' . (int) ($section['capitulo'] ?? 0) . '.' . (int) ($section['versiculo_inicio'] ?? 0);
    if (!isset($titles[$key])) $titles[$key] = trim((string) ($section['titulo'] ?? '')) ?: null;
  }
  $rows = [];
  foreach ($verses as $verse) {
    $code = strtoupper((string) $verse['libro_codigo']);
    $key = $code . '.' . (int) $verse['capitulo'] . '.' . (int) $verse['versiculo'];
    $rows[] = ['version_id'=>$versionId,'libro_id'=>$bookIds[$code],'capitulo'=>(int)$verse['capitulo'],'versiculo'=>(int)$verse['versiculo'],'texto'=>trim((string)$verse['texto']),'titulo_seccion'=>$titles[$key] ?? null,'tiene_nota'=>0,'estado'=>1];
    if (count($rows) >= 250) { bib_import_insert_batches($pdo, 'lvj_bib_versiculos', ['version_id','libro_id','capitulo','versiculo','texto','titulo_seccion','tiene_nota','estado'], $rows); $rows = []; }
  }
  if ($rows) bib_import_insert_batches($pdo, 'lvj_bib_versiculos', ['version_id','libro_id','capitulo','versiculo','texto','titulo_seccion','tiene_nota','estado'], $rows);
  $noteRows = [];
  foreach ($notes as $note) {
    $code = strtoupper((string) $note['libro_codigo']);
    $chapter = (int) $note['capitulo']; $number = (int) $note['versiculo']; $content = trim((string) $note['contenido']);
    $noteRows[] = ['version_id'=>$versionId,'libro_id'=>$bookIds[$code],'capitulo'=>$chapter,'versiculo'=>$number,'nivel'=>(int)($note['nivel'] ?? 1),'orden'=>(int)($note['orden'] ?? 1),'numero_nota'=>$note['numero_nota'] ?? null,'contenido'=>$content,'tipo'=>$note['tipo'] ?? 'nota','titulo'=>$note['titulo'] ?? null,'referencia'=>$note['referencia'] ?? ($code.' '.$chapter.','.$number),'fuente'=>$note['fuente'] ?? 'Scío ABBYY/TXT','estado'=>1,'hash_importacion'=>$note['hash_importacion'] ?? hash('sha256',$code.'|'.$chapter.'|'.$number.'|'.$content)];
    if (count($noteRows) >= 150) { bib_import_insert_batches($pdo, 'lvj_bib_notas_versiones', ['version_id','libro_id','capitulo','versiculo','nivel','orden','numero_nota','contenido','tipo','titulo','referencia','fuente','estado','hash_importacion'], $noteRows, 150); $noteRows=[]; }
  }
  if ($noteRows) bib_import_insert_batches($pdo, 'lvj_bib_notas_versiones', ['version_id','libro_id','capitulo','versiculo','nivel','orden','numero_nota','contenido','tipo','titulo','referencia','fuente','estado','hash_importacion'], $noteRows, 150);
  return ['id'=>$versionId,'libros'=>count($books),'versiculos'=>count($verses),'notas'=>count($notes)];
}

function bib_scio_import(PDO $pdo, string $projectRoot): array
{
  @set_time_limit(0); @ini_set('memory_limit', '768M');
  $validation = bib_scio_validation($projectRoot);
  if (!$validation['ready']) throw new RuntimeException($validation['error'] ?: 'Los paquetes canónicos de Scío están incompletos.');
  $files = bib_scio_processed_files($projectRoot);
  $existing = $pdo->query("SELECT codigo FROM lvj_bib_versiones WHERE UPPER(codigo) = 'SCIO' AND deleted_at IS NULL")->fetchAll(PDO::FETCH_COLUMN);
  if ($existing) throw new RuntimeException('SCIO ya existe; no se permiten importaciones duplicadas.');
  $pdo->beginTransaction();
  try {
    $common = ['fuente'=>'Edición Scío de San Miguel, EPUB/ABBYY/TXT revisado','licencia'=>'Dominio público','fuente_url'=>'','copyright_notas'=>'Texto español comparativo de la edición histórica; transcripción OCR revisada.'];
    $spanish = bib_scio_insert_version($pdo, ['nombre'=>'Biblia de Scío de San Miguel','abreviatura'=>'Scío','codigo'=>'SCIO','idioma'=>'es'] + $common, bib_scio_read_json($files['es_libros']), bib_scio_read_json($files['es_versiculos']));
    $pdo->commit();
    return ['spanish'=>$spanish];
  } catch (Throwable $error) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    throw $error;
  }
}

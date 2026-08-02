<?php

declare(strict_types=1);

/**
 * Importador canónico de la Biblia de Felipe Scío de San Miguel.
 * Los OCR originales se procesan localmente; el panel solo acepta artefactos
 * validados, completos y protegidos con hashes SHA-256.
 */
function bib_scio_processed_files(string $projectRoot): array
{
  $base = $projectRoot . '/storage/biblia/scio/procesado';
  return [
    'manifiesto' => $base . '/manifiesto.json',
    'libros' => $base . '/libros.json',
    'versiculos' => $base . '/versiculos.json',
    'reporte' => $base . '/reporte-validacion.json',
  ];
}

function bib_scio_read_json(string $path): array
{
  if (!is_file($path)) {
    throw new RuntimeException('Falta el procesado de Scio: ' . str_replace(DIRECTORY_SEPARATOR, '/', $path));
  }
  $raw = (string) file_get_contents($path);
  $bom = pack('CCC', 239, 187, 191);
  if (strncmp($raw, $bom, 3) === 0) $raw = substr($raw, 3);
  $data = json_decode($raw, true, 64, JSON_THROW_ON_ERROR);
  if (!is_array($data)) {
    throw new RuntimeException('JSON de Scío inválido: ' . basename($path));
  }
  return $data;
}

function bib_scio_validate_book_rows(array $books): array
{
  if (count($books) !== 73) {
    throw new RuntimeException('Scío requiere exactamente 73 libros; se encontraron ' . count($books) . '.');
  }
  $indexed = [];
  foreach ($books as $index => $book) {
    $code = strtoupper(trim((string) ($book['codigo'] ?? '')));
    $order = (int) ($book['orden'] ?? 0);
    $chapters = (int) ($book['capitulos'] ?? 0);
    if ($code === '' || isset($indexed[$code])) {
      throw new RuntimeException('Scío contiene un código de libro vacío o duplicado.');
    }
    if ($order !== $index + 1 || $chapters < 1 || trim((string) ($book['nombre'] ?? '')) === '') {
      throw new RuntimeException('Scío contiene metadatos inválidos en el libro ' . $code . '.');
    }
    $indexed[$code] = $book;
  }
  return $indexed;
}

function bib_scio_validate_verse_rows(array $verses, array $books): void
{
  if (count($verses) !== 35799) {
    throw new RuntimeException('Scío requiere exactamente 35.799 versículos; se encontraron ' . count($verses) . '.');
  }
  $seen = [];
  $chapterMax = [];
  foreach ($verses as $verse) {
    $code = strtoupper(trim((string) ($verse['libro_codigo'] ?? '')));
    $chapter = (int) ($verse['capitulo'] ?? 0);
    $number = (int) ($verse['versiculo'] ?? 0);
    $text = trim((string) ($verse['texto'] ?? ''));
    $key = $code . '.' . $chapter . '.' . $number;
    if (!isset($books[$code]) || $chapter < 1 || $number < 1 || $text === '') {
      throw new RuntimeException('Scío contiene un versículo inválido: ' . $key . '.');
    }
    if (isset($seen[$key])) {
      throw new RuntimeException('Scío contiene una referencia duplicada: ' . $key . '.');
    }
    $seen[$key] = true;
    $chapterMax[$code] = max($chapterMax[$code] ?? 0, $chapter);
  }
  foreach ($books as $code => $book) {
    if (($chapterMax[$code] ?? 0) !== (int) $book['capitulos']) {
      throw new RuntimeException('Scío contiene capítulos incompletos en ' . $code . '.');
    }
  }
}

function bib_scio_validation(string $projectRoot): array
{
  $files = bib_scio_processed_files($projectRoot);
  $missing = [];
  foreach ($files as $key => $path) {
    if (!is_file($path)) $missing[] = $key;
  }
  $status = ['ready' => false, 'missing' => $missing, 'counts' => [], 'error' => ''];
  if ($missing) return $status;

  try {
    $manifest = bib_scio_read_json($files['manifiesto']);
    $report = bib_scio_read_json($files['reporte']);
    if (($manifest['codigo'] ?? '') !== 'SCIO' || empty($manifest['approved_for_mysql'])) {
      throw new RuntimeException('El manifiesto de Scío no autoriza la importación a MySQL.');
    }
    if (empty($report['valid']) || !empty($report['errors']) || !empty($report['warnings'])) {
      throw new RuntimeException('La validación canónica de Scío contiene errores o advertencias.');
    }
    if ((int) ($report['counts']['books'] ?? 0) !== 73 || (int) ($report['counts']['verses'] ?? 0) !== 35799) {
      throw new RuntimeException('El reporte de Scío no confirma 73 libros y 35.799 versículos.');
    }

    $hashFiles = [
      'libros.json' => $files['libros'],
      'versiculos.json' => $files['versiculos'],
      'reporte-validacion.json' => $files['reporte'],
    ];
    foreach ($hashFiles as $name => $path) {
      $expected = (string) ($manifest['hashes_sha256'][$name] ?? '');
      $actual = (string) hash_file('sha256', $path);
      if ($expected === '' || !hash_equals($expected, $actual)) {
        throw new RuntimeException('Falló la integridad SHA-256 de ' . $name . '.');
      }
    }

    $books = bib_scio_validate_book_rows(bib_scio_read_json($files['libros']));
    $verses = bib_scio_read_json($files['versiculos']);
    bib_scio_validate_verse_rows($verses, $books);
    $status['ready'] = true;
    $status['counts'] = ['libros' => count($books), 'versiculos' => count($verses)];
  } catch (Throwable $error) {
    $status['error'] = $error->getMessage();
  }
  return $status;
}

function bib_scio_insert_version(PDO $pdo, array $books, array $verses): array
{
  $version = $pdo->prepare("INSERT INTO lvj_bib_versiones
    (nombre,abreviatura,codigo,idioma,fuente,licencia,fuente_url,copyright_notas,canon,versificacion,estado,created_at,updated_at)
    VALUES ('Biblia de Felipe Scío de San Miguel','Scío','SCIO','es',:fuente,'Dominio público',:fuente_url,:copyright_notas,73,'Vulgata',0,NOW(),NOW())");
  $version->execute([
    'fuente' => 'Edición Scío de San Miguel 1797, ABBYY/TXT y BBLI validados',
    'fuente_url' => 'https://sirio.ua.es/libros/BEducacion/santa_biblia_01/index.htm',
    'copyright_notas' => 'Edición histórica de dominio público. Importada en estado de revisión.',
  ]);
  $versionId = (int) $pdo->lastInsertId();

  $insertBook = $pdo->prepare("INSERT INTO lvj_bib_libros
    (version_id,testamento,grupo,orden,nombre,abreviatura,codigo,capitulos,estado,created_at,updated_at)
    VALUES (:version_id,:testamento,:grupo,:orden,:nombre,:abreviatura,:codigo,:capitulos,0,NOW(),NOW())");
  $bookIds = [];
  foreach ($books as $book) {
    $insertBook->execute([
      'version_id' => $versionId,
      'testamento' => $book['testamento'],
      'grupo' => $book['grupo'],
      'orden' => $book['orden'],
      'nombre' => $book['nombre'],
      'abreviatura' => $book['abreviatura'],
      'codigo' => $book['codigo'],
      'capitulos' => $book['capitulos'],
    ]);
    $bookIds[strtoupper((string) $book['codigo'])] = (int) $pdo->lastInsertId();
  }

  $rows = [];
  $inserted = 0;
  foreach ($verses as $verse) {
    $code = strtoupper((string) $verse['libro_codigo']);
    $rows[] = [
      'version_id' => $versionId,
      'libro_id' => $bookIds[$code],
      'capitulo' => (int) $verse['capitulo'],
      'versiculo' => (int) $verse['versiculo'],
      'texto' => trim((string) $verse['texto']),
      'titulo_seccion' => $verse['titulo_seccion'] ?? null,
      'tiene_nota' => !empty($verse['tiene_nota']) ? 1 : 0,
      'estado' => 1,
    ];
    if (count($rows) >= 250) {
      $inserted += bib_import_insert_batches($pdo, 'lvj_bib_versiculos', ['version_id','libro_id','capitulo','versiculo','texto','titulo_seccion','tiene_nota','estado'], $rows, 250);
      $rows = [];
    }
  }
  if ($rows) {
    $inserted += bib_import_insert_batches($pdo, 'lvj_bib_versiculos', ['version_id','libro_id','capitulo','versiculo','texto','titulo_seccion','tiene_nota','estado'], $rows, 250);
  }
  if ($inserted !== 35799) {
    throw new RuntimeException('MySQL no recibió los 35.799 versículos esperados de Scío.');
  }
  return ['id' => $versionId, 'libros' => count($books), 'versiculos' => $inserted];
}

function bib_scio_import(PDO $pdo, string $projectRoot): array
{
  @set_time_limit(0);
  @ini_set('memory_limit', '512M');

  $validation = bib_scio_validation($projectRoot);
  if (!$validation['ready']) {
    throw new RuntimeException($validation['error'] ?: 'Los archivos canónicos de Scío están incompletos.');
  }
  $existing = $pdo->query("SELECT id FROM lvj_bib_versiones WHERE UPPER(codigo) = 'SCIO' AND deleted_at IS NULL LIMIT 1");
  if ($existing->fetchColumn()) {
    throw new RuntimeException('SCIO ya existe; no se permiten importaciones duplicadas.');
  }

  $files = bib_scio_processed_files($projectRoot);
  $books = bib_scio_read_json($files['libros']);
  $verses = bib_scio_read_json($files['versiculos']);
  $pdo->beginTransaction();
  try {
    $spanish = bib_scio_insert_version($pdo, $books, $verses);
    $pdo->commit();
    return ['spanish' => $spanish, 'estado' => 'revision'];
  } catch (Throwable $error) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    throw $error;
  }
}

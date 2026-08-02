<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

lvj_require_method('GET');

function lvj_bib_param(string $name, string $fallback = ''): string
{
  return trim((string) ($_GET[$name] ?? $fallback));
}

try {
  $pdo = lvj_db();
  $accion = strtolower(lvj_bib_param('accion', 'catalogo'));

  if ($accion === 'versiones') {
    $statement = $pdo->query(
      'SELECT codigo, nombre, abreviatura, idioma, licencia, canon, versificacion
       FROM lvj_bib_versiones
       WHERE (estado = 1 OR UPPER(codigo) = 'SCIO') AND deleted_at IS NULL
       ORDER BY id ASC'
    );
    lvj_json_response(['success' => true, 'data' => $statement->fetchAll()]);
  }

  if ($accion === 'mapas') {
    $statement = $pdo->query(
      'SELECT id, titulo, descripcion, periodo, imagen_url, fuente, fuente_url, licencia
       FROM lvj_bib_mapas
       WHERE estado = 1 AND deleted_at IS NULL
       ORDER BY orden ASC, id ASC'
    );
    $maps = array_map(static function (array $map): array {
      return [
        'id' => (int) $map['id'],
        'titulo' => (string) $map['titulo'],
        'descripcion' => (string) ($map['descripcion'] ?? ''),
        'periodo' => (string) ($map['periodo'] ?? ''),
        'imagen_url' => (string) $map['imagen_url'],
        'fuente' => (string) ($map['fuente'] ?? ''),
        'fuente_url' => (string) ($map['fuente_url'] ?? ''),
        'licencia' => (string) ($map['licencia'] ?? ''),
      ];
    }, $statement->fetchAll());
    lvj_json_response(['success' => true, 'data' => $maps]);
  }

  if ($accion === 'personajes') {
    $statement = $pdo->query(
      'SELECT id, nombre, nombre_alternativo, testamento, categoria, resumen,
              pasajes_principales, ensenanza, imagen_url, fuente, fuente_url, licencia
       FROM lvj_bib_personajes
       WHERE estado = 1 AND deleted_at IS NULL
       ORDER BY orden ASC, nombre ASC, id ASC'
    );
    $characters = array_map(static function (array $character): array {
      return [
        'id' => (int) $character['id'],
        'nombre' => (string) $character['nombre'],
        'nombre_alternativo' => (string) ($character['nombre_alternativo'] ?? ''),
        'testamento' => (string) $character['testamento'],
        'categoria' => (string) $character['categoria'],
        'resumen' => (string) $character['resumen'],
        'pasajes_principales' => (string) ($character['pasajes_principales'] ?? ''),
        'ensenanza' => (string) ($character['ensenanza'] ?? ''),
        'imagen_url' => (string) $character['imagen_url'],
        'fuente' => (string) $character['fuente'],
        'fuente_url' => (string) ($character['fuente_url'] ?? ''),
        'licencia' => (string) $character['licencia'],
      ];
    }, $statement->fetchAll());
    lvj_json_response(['success' => true, 'data' => $characters]);
  }

  $versionCode = strtoupper(lvj_bib_param('version', 'SPAPLATENSE'));

  $versionStatement = $pdo->prepare(
    'SELECT id, codigo, nombre, abreviatura, idioma, licencia, canon, versificacion
     FROM lvj_bib_versiones
     WHERE codigo = :codigo AND (estado = 1 OR UPPER(codigo) = 'SCIO') AND deleted_at IS NULL
     LIMIT 1'
  );
  $versionStatement->execute(['codigo' => $versionCode]);
  $version = $versionStatement->fetch();

  if (!$version) {
    lvj_json_response(['success' => false, 'message' => 'La versión bíblica solicitada no está disponible.'], 404);
  }

  $versionId = (int) $version['id'];

  if ($accion === 'catalogo') {
    $statement = $pdo->prepare(
      'SELECT id, codigo, nombre, abreviatura, testamento, grupo, orden, capitulos
       FROM lvj_bib_libros
       WHERE version_id = :version_id AND estado = 1 AND deleted_at IS NULL
       ORDER BY orden ASC, id ASC'
    );
    $statement->execute(['version_id' => $versionId]);
    $books = array_map(static function (array $book): array {
      return [
        'id' => (int) $book['id'],
        'codigo' => (string) $book['codigo'],
        'nombre' => (string) $book['nombre'],
        'abreviatura' => (string) $book['abreviatura'],
        'testamento' => (string) $book['testamento'],
        'grupo' => (string) $book['grupo'],
        'orden' => (int) $book['orden'],
        'capitulos' => (int) $book['capitulos'],
      ];
    }, $statement->fetchAll());

    unset($version['id']);
    lvj_json_response(['success' => true, 'data' => ['version' => $version, 'libros' => $books]]);
  }

  $bookCode = strtoupper(lvj_bib_param('libro'));
  if (!preg_match('/^[0-9A-Z]{3}$/', $bookCode)) {
    lvj_json_response(['success' => false, 'message' => 'El código del libro no es válido.'], 400);
  }

  $bookStatement = $pdo->prepare(
    'SELECT id, codigo, nombre, abreviatura, testamento, grupo, orden, capitulos
     FROM lvj_bib_libros
     WHERE version_id = :version_id AND codigo = :codigo AND estado = 1 AND deleted_at IS NULL
     LIMIT 1'
  );
  $bookStatement->execute(['version_id' => $versionId, 'codigo' => $bookCode]);
  $book = $bookStatement->fetch();

  if (!$book) {
    lvj_json_response(['success' => false, 'message' => 'El libro solicitado no está disponible.'], 404);
  }

  $chapter = filter_var($_GET['capitulo'] ?? null, FILTER_VALIDATE_INT, [
    'options' => ['min_range' => 1, 'max_range' => (int) $book['capitulos']],
  ]);
  if ($chapter === false) {
    lvj_json_response(['success' => false, 'message' => 'El capítulo no es válido.'], 400);
  }

  if ($accion === 'notas') {
    $verse = filter_var($_GET['versiculo'] ?? null, FILTER_VALIDATE_INT, [
      'options' => ['min_range' => 1, 'max_range' => 200],
    ]);
    if ($verse === false) {
      lvj_json_response(['success' => false, 'message' => 'El versículo no es válido.'], 400);
    }

    $statement = $pdo->prepare(
      'SELECT id, contenido, orden, numero_nota, tipo, titulo, referencia
       FROM lvj_bib_notas_versiones
       WHERE version_id = :version_id AND libro_id = :libro_id
         AND capitulo = :capitulo AND versiculo = :versiculo
         AND estado = 1 AND deleted_at IS NULL
       ORDER BY orden ASC, id ASC'
    );
    $statement->execute([
      'version_id' => $versionId,
      'libro_id' => (int) $book['id'],
      'capitulo' => $chapter,
      'versiculo' => $verse,
    ]);
    $notes = array_map(static function (array $note): array {
      return [
        'id' => (string) $note['id'],
        'texto' => (string) $note['contenido'],
        'orden' => (int) $note['orden'],
        'numero' => $note['numero_nota'] !== null ? (int) $note['numero_nota'] : null,
        'tipo' => (string) $note['tipo'],
        'titulo' => (string) ($note['titulo'] ?? ''),
        'referencia' => (string) ($note['referencia'] ?? ''),
      ];
    }, $statement->fetchAll());

    lvj_json_response(['success' => true, 'data' => $notes]);
  }

  if ($accion !== 'capitulo') {
    lvj_json_response(['success' => false, 'message' => 'Acción no válida.'], 400);
  }

  $statement = $pdo->prepare(
    'SELECT id, capitulo, versiculo, texto, titulo_seccion, tiene_nota
     FROM lvj_bib_versiculos
     WHERE version_id = :version_id AND libro_id = :libro_id
       AND capitulo = :capitulo AND estado = 1 AND deleted_at IS NULL
     ORDER BY versiculo ASC, id ASC'
  );
  $statement->execute([
    'version_id' => $versionId,
    'libro_id' => (int) $book['id'],
    'capitulo' => $chapter,
  ]);
  $verses = array_map(static function (array $verse): array {
    return [
      'id' => (string) $verse['id'],
      'capitulo' => (int) $verse['capitulo'],
      'versiculo' => (int) $verse['versiculo'],
      'texto' => (string) $verse['texto'],
      'titulo_seccion' => (string) ($verse['titulo_seccion'] ?? ''),
      'tiene_nota' => (int) $verse['tiene_nota'] === 1,
      'notas' => [],
    ];
  }, $statement->fetchAll());

  $notesStatement = $pdo->prepare(
    'SELECT id, versiculo, contenido, orden, numero_nota, tipo, titulo, referencia
     FROM lvj_bib_notas_versiones
     WHERE version_id = :version_id AND libro_id = :libro_id
       AND capitulo = :capitulo AND estado = 1 AND deleted_at IS NULL
     ORDER BY versiculo ASC, orden ASC, id ASC'
  );
  $notesStatement->execute([
    'version_id' => $versionId,
    'libro_id' => (int) $book['id'],
    'capitulo' => $chapter,
  ]);
  $notesByVerse = [];
  foreach ($notesStatement->fetchAll() as $note) {
    $verseNumber = (int) $note['versiculo'];
    if (!isset($notesByVerse[$verseNumber])) {
      $notesByVerse[$verseNumber] = [];
    }
    $notesByVerse[$verseNumber][] = [
      'id' => (string) $note['id'],
      'texto' => (string) $note['contenido'],
      'orden' => (int) $note['orden'],
      'numero' => $note['numero_nota'] !== null ? (int) $note['numero_nota'] : null,
      'tipo' => (string) $note['tipo'],
      'titulo' => (string) ($note['titulo'] ?? ''),
      'referencia' => (string) ($note['referencia'] ?? ''),
    ];
  }
  foreach ($verses as &$verse) {
    $verse['notas'] = $notesByVerse[$verse['versiculo']] ?? [];
    $verse['tiene_nota'] = count($verse['notas']) > 0;
  }
  unset($verse);

  $book['id'] = (int) $book['id'];
  $book['orden'] = (int) $book['orden'];
  $book['capitulos'] = (int) $book['capitulos'];
  unset($version['id']);

  lvj_json_response(['success' => true, 'data' => [
    'version' => $version,
    'libro' => $book,
    'capitulo' => $chapter,
    'versiculos' => $verses,
  ]]);
} catch (Throwable $error) {
  error_log('LVJ Biblia API: ' . $error->getMessage());
  lvj_json_response(['success' => false, 'message' => 'No fue posible consultar la Biblia.'], 500);
}

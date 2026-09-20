<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

lvj_require_method('GET');

function lvj_bib_param(string $name, string $fallback = ''): string
{
  return trim((string) ($_GET[$name] ?? $fallback));
}


function lvj_bib_int_param(string $name, int $fallback, int $min, int $max): int
{
  $value = filter_var($_GET[$name] ?? $fallback, FILTER_VALIDATE_INT, [
    'options' => ['min_range' => $min, 'max_range' => $max],
  ]);
  return $value === false ? $fallback : (int) $value;
}

function lvj_bib_query_param(bool $required = true): string
{
  $query = lvj_bib_param('q');
  if ($query === '' && !$required) return '';

  $length = function_exists('mb_strlen') ? mb_strlen($query, 'UTF-8') : strlen($query);
  if ($query === '' || $length < 2 || $length > 120) {
    lvj_json_response([
      'success' => false,
      'message' => 'La búsqueda debe tener entre 2 y 120 caracteres.',
    ], 400);
  }
  return $query;
}

function lvj_bib_public_version(array $version): array
{
  unset($version['id']);
  return $version;
}

function lvj_bib_search_rows(
  PDO $pdo,
  int $versionId,
  string $query,
  int $limit,
  int $offset,
  string $bookCode = ''
): array {
  $bookFilter = $bookCode !== '' ? ' AND l.codigo = :book_code' : '';
  $statement = $pdo->prepare(
    'SELECT v.id, v.capitulo, v.versiculo, v.texto,
            l.id AS libro_id, l.codigo AS libro_codigo, l.nombre AS libro_nombre,
            l.abreviatura AS libro_abreviatura, l.testamento
     FROM lvj_bib_versiculos v
     INNER JOIN lvj_bib_libros l
       ON l.id = v.libro_id
      AND l.version_id = v.version_id
      AND l.estado = 1
      AND l.deleted_at IS NULL
     WHERE v.version_id = :version_id
       AND v.estado = 1
       AND v.deleted_at IS NULL
       AND LOCATE(:query, v.texto) > 0' . $bookFilter . '
     ORDER BY l.orden ASC, v.capitulo ASC, v.versiculo ASC, v.id ASC
     LIMIT :limit OFFSET :offset'
  );
  $statement->bindValue(':version_id', $versionId, PDO::PARAM_INT);
  $statement->bindValue(':query', $query, PDO::PARAM_STR);
  if ($bookCode !== '') $statement->bindValue(':book_code', $bookCode, PDO::PARAM_STR);
  $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
  $statement->bindValue(':offset', $offset, PDO::PARAM_INT);
  $statement->execute();

  return array_map(static function (array $row): array {
    return [
      'id' => (string) $row['id'],
      'libro_id' => (int) $row['libro_id'],
      'libro_codigo' => (string) $row['libro_codigo'],
      'libro_nombre' => (string) $row['libro_nombre'],
      'libro_abreviatura' => (string) $row['libro_abreviatura'],
      'testamento' => (string) $row['testamento'],
      'capitulo' => (int) $row['capitulo'],
      'versiculo' => (int) $row['versiculo'],
      'texto' => (string) $row['texto'],
      'referencia' => (string) $row['libro_nombre'] . ' ' . (int) $row['capitulo'] . ',' . (int) $row['versiculo'],
    ];
  }, $statement->fetchAll());
}

function lvj_bib_search_count(
  PDO $pdo,
  int $versionId,
  string $query,
  string $bookCode = ''
): int {
  $bookFilter = $bookCode !== '' ? ' AND l.codigo = :book_code' : '';
  $statement = $pdo->prepare(
    'SELECT COUNT(*)
     FROM lvj_bib_versiculos v
     INNER JOIN lvj_bib_libros l
       ON l.id = v.libro_id
      AND l.version_id = v.version_id
      AND l.estado = 1
      AND l.deleted_at IS NULL
     WHERE v.version_id = :version_id
       AND v.estado = 1
       AND v.deleted_at IS NULL
       AND LOCATE(:query, v.texto) > 0' . $bookFilter
  );
  $params = ['version_id' => $versionId, 'query' => $query];
  if ($bookCode !== '') $params['book_code'] = $bookCode;
  $statement->execute($params);
  return (int) $statement->fetchColumn();
}

try {
  $pdo = lvj_db();
  $accion = strtolower(lvj_bib_param('accion', 'catalogo'));

  if ($accion === 'versiones') {
    $statement = $pdo->query(
      'SELECT codigo, nombre, abreviatura, idioma, licencia, canon, versificacion
       FROM lvj_bib_versiones
       WHERE (estado = 1 OR UPPER(codigo) = \'SCIO\') AND deleted_at IS NULL
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
     WHERE codigo = :codigo AND (estado = 1 OR UPPER(codigo) = \'SCIO\') AND deleted_at IS NULL
     LIMIT 1'
  );
  $versionStatement->execute(['codigo' => $versionCode]);
  $version = $versionStatement->fetch();

  if (!$version) {
    lvj_json_response(['success' => false, 'message' => 'La versión bíblica solicitada no está disponible.'], 404);
  }

  $versionId = (int) $version['id'];

  if ($accion === 'buscar') {
    $query = lvj_bib_query_param();
    $page = lvj_bib_int_param('page', 1, 1, 100000);
    $limit = lvj_bib_int_param('limit', 20, 1, 40);
    $offset = ($page - 1) * $limit;

    $total = lvj_bib_search_count($pdo, $versionId, $query);
    $results = lvj_bib_search_rows($pdo, $versionId, $query, $limit, $offset);

    lvj_json_response(['success' => true, 'data' => [
      'version' => lvj_bib_public_version($version),
      'query' => $query,
      'page' => $page,
      'limit' => $limit,
      'total' => $total,
      'has_more' => $offset + count($results) < $total,
      'resultados' => $results,
    ]]);
  }

  if ($accion === 'temas') {
    $query = lvj_bib_query_param(false);
    $tema = lvj_bib_param('tema');
    $temaLength = function_exists('mb_strlen') ? mb_strlen($tema, 'UTF-8') : strlen($tema);
    if ($temaLength > 120) {
      lvj_json_response(['success' => false, 'message' => 'El tema solicitado no es válido.'], 400);
    }

    $page = lvj_bib_int_param('page', 1, 1, 100000);
    $limit = lvj_bib_int_param('limit', 20, 1, 40);
    $offset = ($page - 1) * $limit;

    $themeSql =
      'SELECT vt.categoria, vt.tema, COUNT(*) AS total
       FROM lvj_bib_versiculos_tematicos vt
       INNER JOIN lvj_bib_versiculos v
         ON v.id = vt.versiculo_id
        AND v.version_id = :version_id
        AND v.estado = 1
        AND v.deleted_at IS NULL
       WHERE vt.estado = 1';
    $themeParams = ['version_id' => $versionId];
    if ($query !== '') {
      $themeSql .= ' AND (LOCATE(:theme_query, vt.tema) > 0 OR LOCATE(:category_query, vt.categoria) > 0)';
      $themeParams['theme_query'] = $query;
      $themeParams['category_query'] = $query;
    }
    $themeSql .= ' GROUP BY vt.categoria, vt.tema ORDER BY vt.categoria ASC, vt.tema ASC';
    $themeStatement = $pdo->prepare($themeSql);
    $themeStatement->execute($themeParams);
    $themes = array_map(static function (array $row): array {
      return [
        'categoria' => (string) $row['categoria'],
        'tema' => (string) $row['tema'],
        'total' => (int) $row['total'],
      ];
    }, $themeStatement->fetchAll());

    $total = 0;
    $results = [];
    if ($tema !== '') {
      $countStatement = $pdo->prepare(
        'SELECT COUNT(*)
         FROM lvj_bib_versiculos_tematicos vt
         INNER JOIN lvj_bib_versiculos v
           ON v.id = vt.versiculo_id
          AND v.version_id = :version_id
          AND v.estado = 1
          AND v.deleted_at IS NULL
         INNER JOIN lvj_bib_libros l
           ON l.id = v.libro_id
          AND l.version_id = v.version_id
          AND l.estado = 1
          AND l.deleted_at IS NULL
         WHERE vt.estado = 1 AND vt.tema = :tema'
      );
      $countStatement->execute(['version_id' => $versionId, 'tema' => $tema]);
      $total = (int) $countStatement->fetchColumn();

      $resultStatement = $pdo->prepare(
        'SELECT v.id, v.capitulo, v.versiculo, v.texto,
                l.id AS libro_id, l.codigo AS libro_codigo, l.nombre AS libro_nombre,
                l.abreviatura AS libro_abreviatura, l.testamento
         FROM lvj_bib_versiculos_tematicos vt
         INNER JOIN lvj_bib_versiculos v
           ON v.id = vt.versiculo_id
          AND v.version_id = :version_id
          AND v.estado = 1
          AND v.deleted_at IS NULL
         INNER JOIN lvj_bib_libros l
           ON l.id = v.libro_id
          AND l.version_id = v.version_id
          AND l.estado = 1
          AND l.deleted_at IS NULL
         WHERE vt.estado = 1 AND vt.tema = :tema
         ORDER BY l.orden ASC, v.capitulo ASC, v.versiculo ASC, v.id ASC
         LIMIT :limit OFFSET :offset'
      );
      $resultStatement->bindValue(':version_id', $versionId, PDO::PARAM_INT);
      $resultStatement->bindValue(':tema', $tema, PDO::PARAM_STR);
      $resultStatement->bindValue(':limit', $limit, PDO::PARAM_INT);
      $resultStatement->bindValue(':offset', $offset, PDO::PARAM_INT);
      $resultStatement->execute();

      $results = array_map(static function (array $row): array {
        return [
          'id' => (string) $row['id'],
          'libro_id' => (int) $row['libro_id'],
          'libro_codigo' => (string) $row['libro_codigo'],
          'libro_nombre' => (string) $row['libro_nombre'],
          'libro_abreviatura' => (string) $row['libro_abreviatura'],
          'testamento' => (string) $row['testamento'],
          'capitulo' => (int) $row['capitulo'],
          'versiculo' => (int) $row['versiculo'],
          'texto' => (string) $row['texto'],
          'referencia' => (string) $row['libro_nombre'] . ' ' . (int) $row['capitulo'] . ',' . (int) $row['versiculo'],
        ];
      }, $resultStatement->fetchAll());
    }

    lvj_json_response(['success' => true, 'data' => [
      'version' => lvj_bib_public_version($version),
      'query' => $query,
      'tema' => $tema,
      'page' => $page,
      'limit' => $limit,
      'total' => $total,
      'has_more' => $offset + count($results) < $total,
      'temas' => $themes,
      'resultados' => $results,
    ]]);
  }

  if ($accion === 'concordancia') {
    $query = lvj_bib_query_param();
    $page = lvj_bib_int_param('page', 1, 1, 100000);
    $limit = lvj_bib_int_param('limit', 20, 1, 40);
    $offset = ($page - 1) * $limit;
    $bookCode = strtoupper(lvj_bib_param('libro'));
    if ($bookCode !== '' && !preg_match('/^[0-9A-Z]{3}$/', $bookCode)) {
      lvj_json_response(['success' => false, 'message' => 'El filtro de libro no es válido.'], 400);
    }

    $total = lvj_bib_search_count($pdo, $versionId, $query);
    $filteredTotal = lvj_bib_search_count($pdo, $versionId, $query, $bookCode);

    $testamentStatement = $pdo->prepare(
      'SELECT l.testamento, COUNT(*) AS total
       FROM lvj_bib_versiculos v
       INNER JOIN lvj_bib_libros l
         ON l.id = v.libro_id
        AND l.version_id = v.version_id
        AND l.estado = 1
        AND l.deleted_at IS NULL
       WHERE v.version_id = :version_id
         AND v.estado = 1
         AND v.deleted_at IS NULL
         AND LOCATE(:query, v.texto) > 0
       GROUP BY l.testamento'
    );
    $testamentStatement->execute(['version_id' => $versionId, 'query' => $query]);
    $testaments = ['AT' => 0, 'NT' => 0];
    foreach ($testamentStatement->fetchAll() as $row) {
      $key = (string) $row['testamento'];
      if (array_key_exists($key, $testaments)) $testaments[$key] = (int) $row['total'];
    }

    $bookStatement = $pdo->prepare(
      'SELECT l.id AS libro_id, l.codigo AS libro_codigo, l.nombre AS libro_nombre,
              l.testamento, l.orden, COUNT(*) AS total
       FROM lvj_bib_versiculos v
       INNER JOIN lvj_bib_libros l
         ON l.id = v.libro_id
        AND l.version_id = v.version_id
        AND l.estado = 1
        AND l.deleted_at IS NULL
       WHERE v.version_id = :version_id
         AND v.estado = 1
         AND v.deleted_at IS NULL
         AND LOCATE(:query, v.texto) > 0
       GROUP BY l.id, l.codigo, l.nombre, l.testamento, l.orden
       ORDER BY total DESC, l.orden ASC'
    );
    $bookStatement->execute(['version_id' => $versionId, 'query' => $query]);
    $books = array_map(static function (array $row): array {
      return [
        'libro_id' => (int) $row['libro_id'],
        'libro_codigo' => (string) $row['libro_codigo'],
        'libro_nombre' => (string) $row['libro_nombre'],
        'testamento' => (string) $row['testamento'],
        'total' => (int) $row['total'],
      ];
    }, $bookStatement->fetchAll());

    $results = lvj_bib_search_rows($pdo, $versionId, $query, $limit, $offset, $bookCode);

    lvj_json_response(['success' => true, 'data' => [
      'version' => lvj_bib_public_version($version),
      'query' => $query,
      'page' => $page,
      'limit' => $limit,
      'total' => $total,
      'total_filtrado' => $filteredTotal,
      'has_more' => $offset + count($results) < $filteredTotal,
      'filtro_libro' => $bookCode,
      'testamentos' => $testaments,
      'libros' => $books,
      'resultados' => $results,
    ]]);
  }

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

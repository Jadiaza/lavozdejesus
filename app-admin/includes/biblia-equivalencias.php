<?php

declare(strict_types=1);

const BIB_EQUIV_BATCH_LIMIT = 500;

/**
 * Libros temporalmente bloqueados para generación/aprobación automática.
 *
 * La evidencia de ediciones impresas indica que algunas "equivalencias por
 * fragmento" pueden ser en realidad versículos concatenados durante la
 * importación. El bloqueo no modifica textos ni relaciones existentes.
 */
function bib_equiv_books_under_source_audit(): array
{
  return ['BAR', 'DAN', 'EST'];
}

function bib_equiv_requires_source_audit(string $bookCode): bool
{
  return in_array(strtoupper(trim($bookCode)), bib_equiv_books_under_source_audit(), true);
}

function bib_equiv_audit_book(PDO $pdo, string $sourceCode, string $targetCode, string $bookCode): array
{
  $source = bib_equiv_version($pdo, $sourceCode);
  $target = bib_equiv_version($pdo, $targetCode);
  $sourceBook = bib_equiv_book($pdo, (int) $source['id'], $bookCode);
  $targetBook = bib_equiv_book($pdo, (int) $target['id'], $bookCode);
  $load = static function (PDO $pdo, int $versionId, int $bookId): array {
    $stmt = $pdo->prepare(
      "SELECT v.id,v.capitulo,v.versiculo,v.texto,v.titulo_seccion,CHAR_LENGTH(v.texto) caracteres,
              EXISTS(SELECT 1 FROM lvj_bib_unidades_versiculos uv
                     INNER JOIN lvj_bib_unidades_canonicas uc ON uc.id=uv.unidad_canonica_id
                     WHERE uv.versiculo_id=v.id AND uv.deleted_at IS NULL AND uc.deleted_at IS NULL
                       AND uv.estado_revision='aprobado' AND uc.estado_revision='aprobado') equivalencia_aprobada
       FROM lvj_bib_versiculos v
       WHERE v.version_id=:version AND v.libro_id=:libro AND v.estado=1 AND v.deleted_at IS NULL
       ORDER BY v.capitulo,v.versiculo,v.id"
    );
    $stmt->execute(['version' => $versionId, 'libro' => $bookId]);
    $chapters = [];
    foreach ($stmt->fetchAll() as $row) {
      $chapter = (int) $row['capitulo'];
      $verse = (int) $row['versiculo'];
      $markers = [];
      if ((int) $row['caracteres'] >= 300
          && preg_match_all('/(?:^|\s)([0-9]{1,3})[.)]\s+/u', (string) $row['texto'], $matches)) {
        $markers = array_values(array_unique(array_map('intval', $matches[1])));
      }
      $row['marcadores_internos'] = $markers;
      $row['sospechoso'] = (int) $row['caracteres'] >= 800 || count($markers) >= 2;
      $chapters[$chapter][$verse] = $row;
    }
    return $chapters;
  };
  $sourceChapters = $load($pdo, (int) $source['id'], (int) $sourceBook['id']);
  $targetChapters = $load($pdo, (int) $target['id'], (int) $targetBook['id']);
  $maxChapter = max((int) $sourceBook['capitulos'], (int) $targetBook['capitulos'],
                    $sourceChapters ? max(array_keys($sourceChapters)) : 0,
                    $targetChapters ? max(array_keys($targetChapters)) : 0);
  $chapters = [];
  $summary = ['chapters' => $maxChapter, 'compatible' => 0, 'different' => 0, 'missing' => 0, 'suspicious' => 0];
  for ($chapter = 1; $chapter <= $maxChapter; $chapter++) {
    $sourceVerses = $sourceChapters[$chapter] ?? [];
    $targetVerses = $targetChapters[$chapter] ?? [];
    if (!$sourceVerses || !$targetVerses) {
      $status = 'faltante';
      $summary['missing']++;
    } elseif (array_keys($sourceVerses) === array_keys($targetVerses)) {
      $status = 'compatible';
      $summary['compatible']++;
    } else {
      $status = 'diferente';
      $summary['different']++;
    }
    $numbers = array_values(array_unique(array_merge(array_keys($sourceVerses), array_keys($targetVerses))));
    sort($numbers, SORT_NUMERIC);
    $rows = [];
    foreach ($numbers as $number) {
      $sourceRow = $sourceVerses[$number] ?? null;
      $targetRow = $targetVerses[$number] ?? null;
      if (($sourceRow && $sourceRow['sospechoso']) || ($targetRow && $targetRow['sospechoso'])) $summary['suspicious']++;
      $rows[] = ['numero' => (int) $number, 'origen' => $sourceRow, 'destino' => $targetRow];
    }
    $chapters[] = ['numero' => $chapter, 'estado' => $status, 'origen_total' => count($sourceVerses),
                   'destino_total' => count($targetVerses), 'filas' => $rows];
  }
  return ['source' => $source, 'target' => $target, 'source_book' => $sourceBook,
          'target_book' => $targetBook, 'chapters' => $chapters, 'summary' => $summary];
}

function bib_equiv_version(PDO $pdo, string $code): array
{
  $stmt = $pdo->prepare(
    'SELECT id,codigo,nombre,abreviatura,versificacion
     FROM lvj_bib_versiones
     WHERE UPPER(codigo)=:codigo AND deleted_at IS NULL
       AND (estado=1 OR UPPER(codigo)=\'SCIO\')
     LIMIT 1'
  );
  $stmt->execute(['codigo' => strtoupper(trim($code))]);
  $version = $stmt->fetch();
  if (!$version) throw new RuntimeException('La versión bíblica seleccionada no está disponible.');
  return $version;
}

function bib_equiv_versions(PDO $pdo): array
{
  return $pdo->query(
    'SELECT codigo,nombre,abreviatura,versificacion
     FROM lvj_bib_versiones
     WHERE deleted_at IS NULL
       AND (estado=1 OR UPPER(codigo)=\'SCIO\')
     ORDER BY id'
  )->fetchAll();
}

function bib_equiv_common_books(PDO $pdo, int $sourceVersionId, int $targetVersionId): array
{
  $stmt = $pdo->prepare(
    'SELECT origen.codigo,origen.nombre,origen.orden,
            origen.capitulos AS capitulos_origen,
            destino.capitulos AS capitulos_destino
     FROM lvj_bib_libros origen
     INNER JOIN lvj_bib_libros destino
       ON destino.version_id=:destino
      AND destino.codigo=origen.codigo
      AND destino.estado=1
      AND destino.deleted_at IS NULL
     WHERE origen.version_id=:origen
       AND origen.estado=1
       AND origen.deleted_at IS NULL
     ORDER BY origen.orden,origen.id'
  );
  $stmt->execute(['origen' => $sourceVersionId, 'destino' => $targetVersionId]);
  return $stmt->fetchAll();
}

function bib_equiv_book(PDO $pdo, int $versionId, string $bookCode): array
{
  $stmt = $pdo->prepare(
    'SELECT id,codigo,nombre,capitulos
     FROM lvj_bib_libros
     WHERE version_id=:version AND codigo=:codigo
       AND estado=1 AND deleted_at IS NULL
     LIMIT 1'
  );
  $stmt->execute(['version' => $versionId, 'codigo' => strtoupper($bookCode)]);
  $book = $stmt->fetch();
  if (!$book) throw new RuntimeException('El libro seleccionado no existe en una de las versiones.');
  return $book;
}

function bib_equiv_chapters(PDO $pdo, int $versionId, int $bookId): array
{
  $stmt = $pdo->prepare(
    'SELECT id,capitulo,versiculo
     FROM lvj_bib_versiculos
     WHERE version_id=:version AND libro_id=:libro
       AND estado=1 AND deleted_at IS NULL
     ORDER BY capitulo,versiculo,id'
  );
  $stmt->execute(['version' => $versionId, 'libro' => $bookId]);
  $chapters = [];
  foreach ($stmt->fetchAll() as $verse) {
    $chapter = (int) $verse['capitulo'];
    $number = (int) $verse['versiculo'];
    if (!isset($chapters[$chapter])) $chapters[$chapter] = [];
    $chapters[$chapter][$number] = (int) $verse['id'];
  }
  return $chapters;
}

function bib_equiv_uses_masoretic_psalms(array $version): bool
{
  $code = strtoupper((string) ($version['codigo'] ?? ''));
  $system = mb_strtolower((string) ($version['versificacion'] ?? ''));
  return $code === 'TORRESAMAT' || strpos($system, 'hebr') !== false || strpos($system, 'masor') !== false;
}

function bib_equiv_uses_vulgate_psalms(array $version): bool
{
  $code = strtoupper((string) ($version['codigo'] ?? ''));
  $system = mb_strtolower((string) ($version['versificacion'] ?? ''));
  return in_array($code, ['SPAPLATENSE', 'PLATENSE'], true)
    || strpos($system, 'vulg') !== false
    || strpos($system, 'septuag') !== false
    || strpos($system, 'grieg') !== false;
}

function bib_equiv_target_chapter(string $bookCode, int $sourceChapter, array $source, array $target): ?int
{
  if ($bookCode !== 'PSA') return $sourceChapter;
  $sourceVulgate = bib_equiv_uses_vulgate_psalms($source);
  $targetMasoretic = bib_equiv_uses_masoretic_psalms($target);
  if ($sourceVulgate && $targetMasoretic) {
    if (in_array($sourceChapter, [9,113,114,115,146,147], true)) return null;
    if (($sourceChapter >= 10 && $sourceChapter <= 112)
        || ($sourceChapter >= 116 && $sourceChapter <= 145)) return $sourceChapter + 1;
    return $sourceChapter;
  }
  $sourceMasoretic = bib_equiv_uses_masoretic_psalms($source);
  $targetVulgate = bib_equiv_uses_vulgate_psalms($target);
  if ($sourceMasoretic && $targetVulgate) {
    if (in_array($sourceChapter, [9,10,114,115,116,147], true)) return null;
    if (($sourceChapter >= 11 && $sourceChapter <= 113)
        || ($sourceChapter >= 117 && $sourceChapter <= 146)) return $sourceChapter - 1;
  }
  return $sourceChapter;
}

function bib_equiv_schema_code(array $version): string
{
  if (bib_equiv_uses_vulgate_psalms($version)) return 'VULG';
  if (bib_equiv_uses_masoretic_psalms($version)) return 'MT';
  $value = strtoupper((string) ($version['versificacion'] ?? 'CANON'));
  $value = preg_replace('/[^A-Z0-9]+/', '', $value) ?: 'CANON';
  return substr($value, 0, 12);
}

function bib_equiv_existing_source_units(PDO $pdo, int $versionId, int $bookId): array
{
  $stmt = $pdo->prepare(
    'SELECT uv.versiculo_id,uv.unidad_canonica_id,uc.codigo_canonico
     FROM lvj_bib_unidades_versiculos uv
     INNER JOIN lvj_bib_versiculos v ON v.id=uv.versiculo_id
     INNER JOIN lvj_bib_unidades_canonicas uc ON uc.id=uv.unidad_canonica_id
     WHERE v.version_id=:version AND v.libro_id=:libro
       AND uv.deleted_at IS NULL AND uc.deleted_at IS NULL'
  );
  $stmt->execute(['version' => $versionId, 'libro' => $bookId]);
  $result = [];
  foreach ($stmt->fetchAll() as $row) {
    $verseId = (int) $row['versiculo_id'];
    if (!isset($result[$verseId])) $result[$verseId] = [];
    $result[$verseId][] = [
      'unit_id' => (int) $row['unidad_canonica_id'],
      'code' => (string) $row['codigo_canonico'],
    ];
  }
  return $result;
}

function bib_equiv_existing_target_relations(PDO $pdo, int $versionId, int $bookId): array
{
  $stmt = $pdo->prepare(
    'SELECT uv.unidad_canonica_id,uv.versiculo_id
     FROM lvj_bib_unidades_versiculos uv
     INNER JOIN lvj_bib_versiculos v ON v.id=uv.versiculo_id
     WHERE v.version_id=:version AND v.libro_id=:libro
       AND uv.deleted_at IS NULL'
  );
  $stmt->execute(['version' => $versionId, 'libro' => $bookId]);
  $result = [];
  foreach ($stmt->fetchAll() as $row) {
    $result[(int) $row['unidad_canonica_id'] . ':' . (int) $row['versiculo_id']] = true;
  }
  return $result;
}

function bib_equiv_candidates(PDO $pdo, string $sourceCode, string $targetCode, string $bookCode): array
{
  $source = bib_equiv_version($pdo, $sourceCode);
  $target = bib_equiv_version($pdo, $targetCode);
  if ((int) $source['id'] === (int) $target['id']) {
    throw new RuntimeException('Selecciona dos versiones diferentes.');
  }
  $sourceBook = bib_equiv_book($pdo, (int) $source['id'], $bookCode);
  $targetBook = bib_equiv_book($pdo, (int) $target['id'], $bookCode);
  $sourceChapters = bib_equiv_chapters($pdo, (int) $source['id'], (int) $sourceBook['id']);
  $targetChapters = bib_equiv_chapters($pdo, (int) $target['id'], (int) $targetBook['id']);
  $existingUnits = bib_equiv_existing_source_units($pdo, (int) $source['id'], (int) $sourceBook['id']);
  $existingTargetRelations = bib_equiv_existing_target_relations($pdo, (int) $target['id'], (int) $targetBook['id']);
  $candidates = [];
  $ambiguous = [];
  $eligibleChapters = 0;
  foreach ($sourceChapters as $sourceChapter => $sourceVerses) {
    $targetChapter = bib_equiv_target_chapter(strtoupper($bookCode), (int) $sourceChapter, $source, $target);
    if ($targetChapter === null || !isset($targetChapters[$targetChapter])) {
      $ambiguous[] = ['origen' => $sourceChapter, 'destino' => $targetChapter, 'motivo' => 'Capítulo dividido, combinado o inexistente'];
      continue;
    }
    $targetVerses = $targetChapters[$targetChapter];
    $sharedNumbers = array_values(array_intersect(array_keys($sourceVerses), array_keys($targetVerses)));
    if (array_keys($sourceVerses) !== array_keys($targetVerses)) {
      $missingInTarget = array_values(array_diff(array_keys($sourceVerses), array_keys($targetVerses)));
      $missingInSource = array_values(array_diff(array_keys($targetVerses), array_keys($sourceVerses)));
      $ambiguous[] = [
        'origen' => $sourceChapter,
        'destino' => $targetChapter,
        'motivo' => sprintf('Numeración interna diferente; %d referencias coincidentes, %d solo en origen y %d solo en destino', count($sharedNumbers), count($missingInTarget), count($missingInSource)),
      ];
    }
    if (!$sharedNumbers) continue;
    $eligibleChapters++;
    foreach ($sharedNumbers as $number) {
      $sourceVerseId = $sourceVerses[$number];
      $sourceUnits = $existingUnits[$sourceVerseId] ?? [];
      $existingUnit = null;
      foreach ($sourceUnits as $sourceUnit) {
        if (isset($existingTargetRelations[$sourceUnit['unit_id'] . ':' . $targetVerses[$number]])) {
          $existingUnit = $sourceUnit;
          break;
        }
      }
      if ($existingUnit) continue;
      $baseCode = sprintf('%s.%s.%03d.%03d', strtoupper($bookCode), bib_equiv_schema_code($source), $sourceChapter, $number);
      $pairCode = $sourceUnits
        ? $baseCode . '.' . preg_replace('/[^A-Z0-9]+/', '', strtoupper((string) $target['codigo']))
        : $baseCode;
      $candidates[] = [
        'libro_codigo' => strtoupper($bookCode),
        'libro_nombre' => (string) $sourceBook['nombre'],
        'capitulo_origen' => (int) $sourceChapter,
        'capitulo_destino' => (int) $targetChapter,
        'versiculo' => (int) $number,
        'versiculo_origen_id' => (int) $sourceVerseId,
        'versiculo_destino_id' => (int) $targetVerses[$number],
        'unidad_existente_id' => null,
        'codigo_canonico' => $pairCode,
      ];
    }
  }
  return [
    'source' => $source,
    'target' => $target,
    'book' => $sourceBook,
    'candidates' => $candidates,
    'eligible_chapters' => $eligibleChapters,
    'ambiguous' => $ambiguous,
  ];
}

function bib_equiv_generate(PDO $pdo, string $sourceCode, string $targetCode, string $bookCode, int $limit = BIB_EQUIV_BATCH_LIMIT): array
{
  $preview = bib_equiv_candidates($pdo, $sourceCode, $targetCode, $bookCode);
  $batch = array_slice($preview['candidates'], 0, max(1, min(BIB_EQUIV_BATCH_LIMIT, $limit)));
  $unit = $pdo->prepare(
    'INSERT INTO lvj_bib_unidades_canonicas
       (libro_codigo,codigo_canonico,descripcion,estado_revision,fuente,observaciones)
     VALUES (:libro,:codigo,:descripcion,\'pendiente\',:fuente,:observaciones)
     ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)'
  );
  $relation = $pdo->prepare(
    'INSERT IGNORE INTO lvj_bib_unidades_versiculos
       (unidad_canonica_id,versiculo_id,orden,tipo_equivalencia,estado_revision)
     VALUES (:unidad,:versiculo,1,\'exacta\',\'pendiente\')'
  );
  $unitsCreated = 0;
  $relationsCreated = 0;
  $pdo->beginTransaction();
  try {
    foreach ($batch as $candidate) {
      $unitId = (int) ($candidate['unidad_existente_id'] ?? 0);
      if (!$unitId) {
        $unit->execute([
          'libro' => $candidate['libro_codigo'],
          'codigo' => $candidate['codigo_canonico'],
          'descripcion' => $candidate['libro_nombre'] . ' ' . $candidate['capitulo_origen'] . ',' . $candidate['versiculo'],
          'fuente' => 'Generador estructural LVJ; requiere revisión editorial',
          'observaciones' => sprintf(
            '%s %d,%d ↔ %s %d,%d',
            $preview['source']['codigo'], $candidate['capitulo_origen'], $candidate['versiculo'],
            $preview['target']['codigo'], $candidate['capitulo_destino'], $candidate['versiculo']
          ),
        ]);
        $unitId = (int) $pdo->lastInsertId();
        if ($unit->rowCount() === 1) $unitsCreated++;
      }
      $relation->execute(['unidad' => $unitId, 'versiculo' => $candidate['versiculo_origen_id']]);
      $relationsCreated += $relation->rowCount();
      $relation->execute(['unidad' => $unitId, 'versiculo' => $candidate['versiculo_destino_id']]);
      $relationsCreated += $relation->rowCount();
    }
    $pdo->commit();
  } catch (Throwable $error) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    throw $error;
  }
  return [
    'processed' => count($batch),
    'units_created' => $unitsCreated,
    'relations_created' => $relationsCreated,
    'remaining_before_refresh' => max(0, count($preview['candidates']) - count($batch)),
    'ambiguous' => count($preview['ambiguous']),
  ];
}

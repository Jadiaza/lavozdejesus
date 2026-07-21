<?php

declare(strict_types=1);

function bib_equiv_review_supports_rejected(PDO $pdo): bool
{
  $supported = 0;
  foreach (['lvj_bib_unidades_canonicas', 'lvj_bib_unidades_versiculos'] as $table) {
    $columns = $pdo->query("SHOW COLUMNS FROM $table LIKE 'estado_revision'")->fetchAll();
    if ($columns && str_contains((string) $columns[0]['Type'], "'rechazado'")) $supported++;
  }
  return $supported === 2;
}

function bib_equiv_review_supports_fragments(PDO $pdo): bool
{
  $columns = $pdo->query('SHOW COLUMNS FROM lvj_bib_unidades_versiculos')->fetchAll();
  $names = array_column($columns, 'Field');
  return count(array_intersect(['fragmento_inicio', 'fragmento_longitud', 'referencia_editorial'], $names)) === 3;
}

function bib_equiv_review_chapters(PDO $pdo, string $sourceCode, string $targetCode, string $bookCode, string $state): array
{
  $allowed = ['pendiente', 'revisado', 'aprobado', 'rechazado'];
  if (!in_array($state, $allowed, true)) $state = 'pendiente';
  $stmt = $pdo->prepare(
    'SELECT DISTINCT vo.capitulo
     FROM lvj_bib_unidades_canonicas uc
     INNER JOIN lvj_bib_unidades_versiculos uvo
       ON uvo.unidad_canonica_id=uc.id AND uvo.deleted_at IS NULL
      AND uvo.estado_revision=:estado_relacion_origen
     INNER JOIN lvj_bib_versiculos vo
       ON vo.id=uvo.versiculo_id AND vo.deleted_at IS NULL
     INNER JOIN lvj_bib_versiones vro
       ON vro.id=vo.version_id AND vro.deleted_at IS NULL
     INNER JOIN lvj_bib_libros lro
       ON lro.id=vo.libro_id AND lro.deleted_at IS NULL
     WHERE uc.libro_codigo=:libro AND uc.estado_revision=:estado_unidad AND uc.deleted_at IS NULL
       AND vro.codigo=:origen AND lro.codigo=:libro_origen
       AND EXISTS (
         SELECT 1 FROM lvj_bib_unidades_versiculos uvd
         INNER JOIN lvj_bib_versiculos vd ON vd.id=uvd.versiculo_id AND vd.deleted_at IS NULL
         INNER JOIN lvj_bib_versiones vrd ON vrd.id=vd.version_id AND vrd.deleted_at IS NULL
         INNER JOIN lvj_bib_libros lrd ON lrd.id=vd.libro_id AND lrd.deleted_at IS NULL
         WHERE uvd.unidad_canonica_id=uc.id AND uvd.deleted_at IS NULL
           AND uvd.estado_revision=:estado_relacion_destino
           AND vrd.codigo=:destino AND lrd.codigo=:libro_destino
       )
     ORDER BY vo.capitulo'
  );
  $stmt->execute([
    'estado_relacion_origen' => $state,
    'libro' => $bookCode,
    'estado_unidad' => $state,
    'origen' => $sourceCode,
    'libro_origen' => $bookCode,
    'estado_relacion_destino' => $state,
    'destino' => $targetCode,
    'libro_destino' => $bookCode,
  ]);
  return array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN));
}

function bib_equiv_review_units(PDO $pdo, string $sourceCode, string $targetCode, string $bookCode, int $chapter, string $state, bool $includeTargetChapterContext = false): array
{
  $allowed = ['pendiente', 'revisado', 'aprobado', 'rechazado'];
  if (!in_array($state, $allowed, true)) $state = 'pendiente';
  $fragmentColumns = bib_equiv_review_supports_fragments($pdo)
    ? "uv.fragmento_inicio,uv.fragmento_longitud,uv.referencia_editorial,
       CASE WHEN uv.fragmento_inicio IS NOT NULL AND uv.fragmento_longitud IS NOT NULL
            THEN SUBSTRING(v.texto,uv.fragmento_inicio,uv.fragmento_longitud)
            ELSE v.texto END AS texto_mostrado,"
    : "NULL AS fragmento_inicio,NULL AS fragmento_longitud,NULL AS referencia_editorial,
       v.texto AS texto_mostrado,";
  $chapterScope = $includeTargetChapterContext
    ? 'AND (EXISTS (
         SELECT 1 FROM lvj_bib_unidades_versiculos uvo
         INNER JOIN lvj_bib_versiculos vo ON vo.id=uvo.versiculo_id AND vo.deleted_at IS NULL
         INNER JOIN lvj_bib_versiones vro ON vro.id=vo.version_id AND vro.deleted_at IS NULL
         INNER JOIN lvj_bib_libros lro ON lro.id=vo.libro_id AND lro.deleted_at IS NULL
         WHERE uvo.unidad_canonica_id=uc.id AND uvo.deleted_at IS NULL
           AND uvo.estado_revision=:estado_relacion_existe
           AND vro.codigo=:origen_existe AND lro.codigo=:libro_existe AND vo.capitulo=:capitulo
       ) OR EXISTS (
         SELECT 1 FROM lvj_bib_unidades_versiculos uvd
         INNER JOIN lvj_bib_versiculos vd ON vd.id=uvd.versiculo_id AND vd.deleted_at IS NULL
         INNER JOIN lvj_bib_versiones vrd ON vrd.id=vd.version_id AND vrd.deleted_at IS NULL
         INNER JOIN lvj_bib_libros lrd ON lrd.id=vd.libro_id AND lrd.deleted_at IS NULL
         WHERE uvd.unidad_canonica_id=uc.id AND uvd.deleted_at IS NULL
           AND uvd.estado_revision=:estado_relacion_destino_existe
           AND vrd.codigo=:destino_existe AND lrd.codigo=:libro_destino_existe AND vd.capitulo=:capitulo_destino
       ))'
    : 'AND EXISTS (
         SELECT 1 FROM lvj_bib_unidades_versiculos uvo
         INNER JOIN lvj_bib_versiculos vo ON vo.id=uvo.versiculo_id AND vo.deleted_at IS NULL
         INNER JOIN lvj_bib_versiones vro ON vro.id=vo.version_id AND vro.deleted_at IS NULL
         INNER JOIN lvj_bib_libros lro ON lro.id=vo.libro_id AND lro.deleted_at IS NULL
         WHERE uvo.unidad_canonica_id=uc.id AND uvo.deleted_at IS NULL
           AND uvo.estado_revision=:estado_relacion_existe
           AND vro.codigo=:origen_existe AND lro.codigo=:libro_existe AND vo.capitulo=:capitulo
       )';
  $stmt = $pdo->prepare(
    'SELECT uc.id unidad_id,uc.codigo_canonico,uc.descripcion,uc.estado_revision estado_unidad,
            uv.id relacion_id,uv.estado_revision estado_relacion,uv.orden,uv.tipo_equivalencia,
            ' . $fragmentColumns . '
            v.id versiculo_id,v.capitulo,v.versiculo,v.texto,
            ver.id version_id,ver.codigo version_codigo,ver.nombre version_nombre
     FROM lvj_bib_unidades_canonicas uc
     INNER JOIN lvj_bib_unidades_versiculos uv
       ON uv.unidad_canonica_id=uc.id AND uv.deleted_at IS NULL
     INNER JOIN lvj_bib_versiculos v
       ON v.id=uv.versiculo_id AND v.deleted_at IS NULL
     INNER JOIN lvj_bib_versiones ver
       ON ver.id=v.version_id AND ver.deleted_at IS NULL
     INNER JOIN lvj_bib_libros lib
       ON lib.id=v.libro_id AND lib.deleted_at IS NULL
     WHERE uc.libro_codigo=:libro AND uc.estado_revision=:estado AND uc.deleted_at IS NULL
       AND uv.estado_revision=:estado_relacion AND ver.codigo IN (:origen,:destino)
       ' . $chapterScope . '
     ORDER BY uc.id,ver.codigo,uv.orden,v.versiculo'
  );
  $params = [
    'libro' => $bookCode,
    'estado' => $state,
    'estado_relacion' => $state,
    'origen' => $sourceCode,
    'destino' => $targetCode,
    'origen_existe' => $sourceCode,
    'estado_relacion_existe' => $state,
    'libro_existe' => $bookCode,
    'capitulo' => $chapter,
  ];
  if ($includeTargetChapterContext) {
    $params += [
      'estado_relacion_destino_existe' => $state,
      'destino_existe' => $targetCode,
      'libro_destino_existe' => $bookCode,
      'capitulo_destino' => $chapter,
    ];
  }
  $stmt->execute($params);
  $units = [];
  foreach ($stmt->fetchAll() as $row) {
    $id = (int) $row['unidad_id'];
    if (!isset($units[$id])) {
      $units[$id] = [
        'id' => $id,
        'codigo' => (string) $row['codigo_canonico'],
        'estado' => (string) $row['estado_unidad'],
        'versiones' => [],
      ];
    }
    $versionCode = (string) $row['version_codigo'];
    if (!isset($units[$id]['versiones'][$versionCode])) $units[$id]['versiones'][$versionCode] = [];
    $units[$id]['versiones'][$versionCode][] = $row;
  }
  $result = array_values(array_filter($units, static function (array $unit) use ($sourceCode, $targetCode): bool {
    if (!isset($unit['versiones'][$sourceCode])) return false;
    if (isset($unit['versiones'][$targetCode])) return true;
    foreach ($unit['versiones'][$sourceCode] as $row) {
      if ((string) $row['tipo_equivalencia'] !== 'parcial') return false;
    }
    return true;
  }));
  foreach ($result as &$unit) {
    $unit['contexto_destino'] = (int) $unit['versiones'][$sourceCode][0]['capitulo'] !== $chapter
      && isset($unit['versiones'][$targetCode])
      && (int) $unit['versiones'][$targetCode][0]['capitulo'] === $chapter;
  }
  unset($unit);
  usort($result, static function (array $left, array $right) use ($sourceCode, $targetCode, $includeTargetChapterContext): int {
    if ($includeTargetChapterContext) {
      $leftRow = $left['versiones'][$targetCode][0] ?? $left['versiones'][$sourceCode][0];
      $rightRow = $right['versiones'][$targetCode][0] ?? $right['versiones'][$sourceCode][0];
      return [(int) $leftRow['capitulo'], (int) $leftRow['versiculo'], (int) $left['id']]
        <=> [(int) $rightRow['capitulo'], (int) $rightRow['versiculo'], (int) $right['id']];
    }
    $leftRow = $left['versiones'][$sourceCode][0];
    $rightRow = $right['versiones'][$sourceCode][0];
    return [(int) $leftRow['capitulo'], (int) $leftRow['versiculo'], (int) $left['id']]
      <=> [(int) $rightRow['capitulo'], (int) $rightRow['versiculo'], (int) $right['id']];
  });
  return $result;
}

function bib_equiv_review_update_chapter(PDO $pdo, string $sourceCode, string $targetCode, string $bookCode, int $chapter, string $newState): int
{
  if (!in_array($newState, ['aprobado', 'rechazado'], true)) throw new RuntimeException('Estado editorial no permitido.');
  if ($newState === 'rechazado' && !bib_equiv_review_supports_rejected($pdo)) {
    throw new RuntimeException('Ejecuta primero la migración del estado rechazado en la base de datos.');
  }
  $units = bib_equiv_review_units($pdo, $sourceCode, $targetCode, $bookCode, $chapter, 'pendiente');
  if (!$units) throw new RuntimeException('No hay equivalencias pendientes completas para este capítulo.');
  $ids = array_column($units, 'id');
  $expectedRelations = array_sum(array_map(static function (array $unit) use ($sourceCode, $targetCode): int {
    return count($unit['versiones'][$sourceCode]) + count($unit['versiones'][$targetCode] ?? []);
  }, $units));
  $placeholders = implode(',', array_fill(0, count($ids), '?'));
  $pdo->beginTransaction();
  try {
    $versions = $pdo->prepare('SELECT id FROM lvj_bib_versiones WHERE codigo IN (?,?) AND deleted_at IS NULL');
    $versions->execute([$sourceCode, $targetCode]);
    $versionIds = array_map('intval', $versions->fetchAll(PDO::FETCH_COLUMN));
    if (count(array_unique($versionIds)) !== 2) throw new RuntimeException('No se encontraron las dos versiones seleccionadas.');
    $relationParams = array_merge([$newState], $ids, $versionIds);
    $relations = $pdo->prepare(
      "UPDATE lvj_bib_unidades_versiculos uv
       INNER JOIN lvj_bib_versiculos v ON v.id=uv.versiculo_id
       SET uv.estado_revision=?,uv.updated_at=NOW()
       WHERE uv.unidad_canonica_id IN ($placeholders)
         AND v.version_id IN (?,?) AND uv.estado_revision='pendiente' AND uv.deleted_at IS NULL"
    );
    $relations->execute($relationParams);
    if ($relations->rowCount() !== $expectedRelations) {
      throw new RuntimeException('Una o más parejas cambiaron durante la revisión. No se aplicaron cambios.');
    }
    $unitsUpdate = $pdo->prepare(
      "UPDATE lvj_bib_unidades_canonicas
       SET estado_revision=?,updated_at=NOW()
       WHERE id IN ($placeholders) AND estado_revision='pendiente' AND deleted_at IS NULL"
    );
    $unitsUpdate->execute(array_merge([$newState], $ids));
    if ($unitsUpdate->rowCount() !== count($ids)) throw new RuntimeException('El lote cambió durante la revisión. No se aplicaron cambios.');
    $pdo->commit();
    return count($ids);
  } catch (Throwable $error) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    throw $error;
  }
}

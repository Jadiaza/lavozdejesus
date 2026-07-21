<?php

declare(strict_types=1);

function bib_equiv_resolve_ester(PDO $pdo, string $sourceCode, string $targetCode): array
{
  if ($sourceCode !== 'SPAPLATENSE' || $targetCode !== 'TORRESAMAT') {
    throw new RuntimeException('El resolvedor de Ester requiere SPAPLATENSE → TORRESAMAT.');
  }
  $columns = array_column($pdo->query('SHOW COLUMNS FROM lvj_bib_unidades_versiculos')->fetchAll(), 'Field');
  if (count(array_intersect(['fragmento_inicio','fragmento_longitud','referencia_editorial'], $columns)) !== 3) {
    throw new RuntimeException('La estructura de fragmentos no está instalada.');
  }
  $source = bib_equiv_version($pdo, $sourceCode);
  $target = bib_equiv_version($pdo, $targetCode);
  $sourceBook = bib_equiv_book($pdo, (int) $source['id'], 'EST');
  $targetBook = bib_equiv_book($pdo, (int) $target['id'], 'EST');
  $expected = [10 => 13, 11 => 12, 12 => 6, 13 => 18, 14 => 19, 15 => 19, 16 => 24];
  $sourceIds = [];
  $sourceStmt = $pdo->prepare(
    'SELECT id,capitulo,versiculo FROM lvj_bib_versiculos
     WHERE version_id=:version AND libro_id=:book AND capitulo BETWEEN 10 AND 16
       AND estado=1 AND deleted_at IS NULL ORDER BY capitulo,versiculo'
  );
  $sourceStmt->execute(['version' => $source['id'], 'book' => $sourceBook['id']]);
  foreach ($sourceStmt->fetchAll() as $row) $sourceIds[(int) $row['capitulo']][(int) $row['versiculo']] = (int) $row['id'];
  foreach ($expected as $chapter => $lastVerse) {
    if (array_keys($sourceIds[$chapter] ?? []) !== range(1, $lastVerse)) {
      throw new RuntimeException("SPAPLATENSE Ester $chapter no posee la secuencia 1–$lastVerse.");
    }
  }
  $targetStmt = $pdo->prepare(
    'SELECT id,versiculo,texto FROM lvj_bib_versiculos
     WHERE version_id=:version AND libro_id=:book AND capitulo=10 AND versiculo BETWEEN 1 AND 3
       AND estado=1 AND deleted_at IS NULL ORDER BY versiculo'
  );
  $targetStmt->execute(['version' => $target['id'], 'book' => $targetBook['id']]);
  $targetRows = $targetStmt->fetchAll();
  $targetIds = [];
  $text = '';
  foreach ($targetRows as $row) {
    $targetIds[(int) $row['versiculo']] = (int) $row['id'];
    if ((int) $row['versiculo'] === 3) $text = (string) $row['texto'];
  }
  if (array_keys($targetIds) !== [1,2,3] || mb_strlen($text) < 10000) {
    throw new RuntimeException('TORRESAMAT Ester 10:1–3 no posee la estructura esperada.');
  }
  $targetVerseId = $targetIds[3];
  $boundaries = [
    11 => ' 1. El año cuarto del reinado',
    12 => ' 1. Estaba entonces Mardoqueo',
    13 => ' 1. El tenor de la carta',
    14 => ' 1. Asimismo la reina Ester',
    15 => ' 1. Y le envió a decir Mardoqueo',
    16 => ' 1. El gran Artajerjes',
  ];
  $positions = [];
  $previous = 0;
  foreach ($boundaries as $chapter => $needle) {
    $position = mb_strpos($text, $needle, $previous);
    if ($position === false || $position <= $previous) throw new RuntimeException("No se detectó con claridad el comienzo de Ester $chapter.");
    $positions[$chapter] = $position;
    $previous = $position;
  }
  $marker4 = mb_strpos($text, ' 4. ');
  if ($marker4 === false || $marker4 <= 0 || $marker4 >= $positions[11]) {
    throw new RuntimeException('No se detectó el comienzo interno de Ester 10:4.');
  }
  $fragments = [10 => [3 => ['inicio' => 1, 'longitud' => $marker4]]];
  $parseRange = static function (string $text, int $chapter, int $first, int $last, int $start, int $end, array &$fragments): void {
    $cursor = $start;
    for ($verse = $first; $verse <= $last; $verse++) {
      $marker = " $verse. ";
      $markerPosition = mb_strpos($text, $marker, $cursor);
      if ($markerPosition === false || $markerPosition < $start || $markerPosition >= $end) {
        throw new RuntimeException("No se detectó Ester $chapter:$verse dentro de Torres Amat 10:3.");
      }
      $contentStart = $markerPosition + mb_strlen($marker);
      if ($verse < $last) {
        $nextMarker = ' ' . ($verse + 1) . '. ';
        $nextPosition = mb_strpos($text, $nextMarker, $contentStart);
        if ($nextPosition === false || $nextPosition <= $contentStart || $nextPosition > $end) {
          throw new RuntimeException("No se pudo cerrar Ester $chapter:$verse.");
        }
      } else {
        $nextPosition = $end;
      }
      $fragments[$chapter][$verse] = ['inicio' => $contentStart + 1, 'longitud' => $nextPosition - $contentStart];
      $cursor = $contentStart;
    }
  };
  $parseRange($text, 10, 4, 13, $marker4, $positions[11], $fragments);
  foreach ([11,12,13,14,15,16] as $chapter) {
    $end = $chapter < 16 ? $positions[$chapter + 1] : mb_strlen($text);
    $parseRange($text, $chapter, 1, $expected[$chapter], $positions[$chapter], $end, $fragments);
  }
  $fragmentCount = array_sum(array_map('count', $fragments));
  if ($fragmentCount !== 109) throw new RuntimeException('El mapa de Ester no contiene exactamente 109 fragmentos.');

  $existing = $pdo->prepare(
    'SELECT COUNT(*) FROM lvj_bib_unidades_versiculos uv
     INNER JOIN lvj_bib_versiculos v ON v.id=uv.versiculo_id AND v.deleted_at IS NULL
     WHERE uv.deleted_at IS NULL AND
       ((v.version_id=:source AND v.libro_id=:source_book AND v.capitulo BETWEEN 10 AND 16)
        OR (v.version_id=:target AND v.libro_id=:target_book AND v.capitulo=10 AND v.versiculo=3))'
  );
  $existing->execute(['source' => $source['id'], 'source_book' => $sourceBook['id'], 'target' => $target['id'], 'target_book' => $targetBook['id']]);
  if ((int) $existing->fetchColumn() !== 0) throw new RuntimeException('Ester 10–16 ya posee relaciones canónicas; no se duplicaron.');

  $unit = $pdo->prepare(
    "INSERT INTO lvj_bib_unidades_canonicas
       (libro_codigo,codigo_canonico,descripcion,estado_revision,fuente,observaciones)
     VALUES ('EST',:code,:description,'pendiente','Cotejo editorial LVJ / Torres Amat 1825',:notes)"
  );
  $relation = $pdo->prepare(
    "INSERT INTO lvj_bib_unidades_versiculos
       (unidad_canonica_id,versiculo_id,fragmento_inicio,fragmento_longitud,referencia_editorial,orden,tipo_equivalencia,estado_revision)
     VALUES (:unit,:verse,:start,:length,:reference,1,:type,'pendiente')"
  );
  $pdo->beginTransaction();
  try {
    $units = 0; $relations = 0;
    foreach ([1,2] as $verse) {
      $code = sprintf('EST.VULG.010.%03d', $verse);
      $unit->execute(['code' => $code, 'description' => "Ester 10:$verse — equivalencia editorial exacta",
                      'notes' => "SPAPLATENSE 10:$verse ↔ TORRESAMAT 10:$verse"]);
      $unitId = (int) $pdo->lastInsertId();
      $relation->execute(['unit' => $unitId, 'verse' => $sourceIds[10][$verse],
                          'start' => null, 'length' => null, 'reference' => null, 'type' => 'exacta']);
      $relation->execute(['unit' => $unitId, 'verse' => $targetIds[$verse],
                          'start' => null, 'length' => null, 'reference' => null, 'type' => 'exacta']);
      $units++; $relations += 2;
    }
    foreach ($fragments as $chapter => $chapterFragments) {
      foreach ($chapterFragments as $verse => $fragment) {
        $code = sprintf('EST.VULG.%03d.%03d', $chapter, $verse);
        $unit->execute(['code' => $code, 'description' => "Ester $chapter:$verse — equivalencia editorial",
                        'notes' => "SPAPLATENSE $chapter:$verse ↔ fragmento interno de TORRESAMAT 10:3"]);
        $unitId = (int) $pdo->lastInsertId();
        $relation->execute(['unit' => $unitId, 'verse' => $sourceIds[$chapter][$verse],
                            'start' => null, 'length' => null, 'reference' => null, 'type' => 'parcial']);
        $relation->execute(['unit' => $unitId, 'verse' => $targetVerseId,
                            'start' => $fragment['inicio'], 'length' => $fragment['longitud'],
                            'reference' => "$chapter:$verse interno en 10:3", 'type' => 'parcial']);
        $units++; $relations += 2;
      }
    }
    if ($units !== 111 || $relations !== 222) throw new RuntimeException('No se generó el lote completo de Ester.');
    $pdo->commit();
    return ['units' => $units, 'relations' => $relations, 'fragments' => $fragmentCount];
  } catch (Throwable $error) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    throw $error;
  }
}

function bib_equiv_resolve_internal_book(PDO $pdo, string $sourceCode, string $targetCode, string $bookCode): array
{
  if ($sourceCode !== 'SPAPLATENSE' || $targetCode !== 'TORRESAMAT') throw new RuntimeException('Este resolvedor requiere SPAPLATENSE → TORRESAMAT.');
  $columns = array_column($pdo->query('SHOW COLUMNS FROM lvj_bib_unidades_versiculos')->fetchAll(), 'Field');
  if (count(array_intersect(['fragmento_inicio','fragmento_longitud','referencia_editorial'], $columns)) !== 3) throw new RuntimeException('La estructura de fragmentos no está instalada.');
  $source = bib_equiv_version($pdo, $sourceCode); $target = bib_equiv_version($pdo, $targetCode);
  $sourceBook = bib_equiv_book($pdo, (int) $source['id'], $bookCode);
  $targetBook = bib_equiv_book($pdo, (int) $target['id'], $bookCode);
  if ((int) $sourceBook['capitulos'] !== (int) $targetBook['capitulos']) throw new RuntimeException('El resolvedor genérico requiere el mismo número de capítulos.');
  $load = static function (PDO $pdo, int $version, int $book): array {
    $stmt=$pdo->prepare('SELECT id,capitulo,versiculo,texto FROM lvj_bib_versiculos WHERE version_id=:version AND libro_id=:book AND estado=1 AND deleted_at IS NULL ORDER BY capitulo,versiculo');
    $stmt->execute(['version'=>$version,'book'=>$book]); $result=[];
    foreach ($stmt->fetchAll() as $row) $result[(int)$row['capitulo']][(int)$row['versiculo']]=$row;
    return $result;
  };
  $sourceRows=$load($pdo,(int)$source['id'],(int)$sourceBook['id']);
  $targetRows=$load($pdo,(int)$target['id'],(int)$targetBook['id']);
  $linkedStmt=$pdo->prepare('SELECT DISTINCT uv.versiculo_id FROM lvj_bib_unidades_versiculos uv INNER JOIN lvj_bib_versiculos v ON v.id=uv.versiculo_id WHERE uv.deleted_at IS NULL AND v.version_id=:version AND v.libro_id=:book AND v.deleted_at IS NULL');
  $linkedStmt->execute(['version'=>$source['id'],'book'=>$sourceBook['id']]);
  $linked=array_fill_keys(array_map('intval',$linkedStmt->fetchAll(PDO::FETCH_COLUMN)),true);
  $map=[];$fragmentCount=0;
  for ($chapter=1;$chapter<=(int)$sourceBook['capitulos'];$chapter++) {
    $sourceChapter=$sourceRows[$chapter]??[]; $targetChapter=$targetRows[$chapter]??[];
    if (!$sourceChapter || array_keys($sourceChapter)!==range(1,max(array_keys($sourceChapter)))) throw new RuntimeException("La versión principal no es consecutiva en $bookCode $chapter.");
    foreach ($sourceChapter as $number=>$sourceRow) {
      if (isset($targetChapter[$number])) {
        $targetRow=$targetChapter[$number]; $text=(string)$targetRow['texto'];
        $nextMarker=mb_strpos($text,' '.($number+1).'. ');
        if ($nextMarker!==false && isset($targetChapter[$number+1])) throw new RuntimeException("Referencia duplicada interna y externa en $bookCode $chapter:".($number+1).'.');
        $length=$nextMarker===false?null:$nextMarker;
        if (!isset($linked[(int)$sourceRow['id']])) {
          $map[]=compact('chapter','number','sourceRow','targetRow')+['inicio'=>$length===null?null:1,'longitud'=>$length];
          if ($length!==null) $fragmentCount++;
        }
        continue;
      }
      $matches=[];
      foreach ($targetChapter as $candidate) {
        $position=mb_strpos((string)$candidate['texto'],' '.$number.'. ');
        if ($position!==false) $matches[]=['row'=>$candidate,'position'=>$position];
      }
      if (count($matches)!==1) throw new RuntimeException("No se encontró de forma única $bookCode $chapter:$number dentro de TORRESAMAT.");
      $targetRow=$matches[0]['row']; $text=(string)$targetRow['texto'];
      $start=$matches[0]['position']+mb_strlen(' '.$number.'. ');
      $next=mb_strpos($text,' '.($number+1).'. ',$start);
      $end=$next===false?mb_strlen($text):$next;
      if ($end<=$start) throw new RuntimeException("Límite inválido en $bookCode $chapter:$number.");
      if (!isset($linked[(int)$sourceRow['id']])) {
        $map[]=compact('chapter','number','sourceRow','targetRow')+['inicio'=>$start+1,'longitud'=>$end-$start];
        $fragmentCount++;
      }
    }
  }
  if (!$map) throw new RuntimeException("$bookCode no posee referencias ambiguas resolubles pendientes.");
  $unit=$pdo->prepare("INSERT INTO lvj_bib_unidades_canonicas(libro_codigo,codigo_canonico,descripcion,estado_revision,fuente,observaciones) VALUES(:book,:code,:description,'pendiente','Resolvedor de numeración interna LVJ',:notes)");
  $relation=$pdo->prepare("INSERT INTO lvj_bib_unidades_versiculos(unidad_canonica_id,versiculo_id,fragmento_inicio,fragmento_longitud,referencia_editorial,orden,tipo_equivalencia,estado_revision) VALUES(:unit,:verse,:start,:length,:reference,1,:type,'pendiente')");
  $pdo->beginTransaction();
  try {
    $relations=0;
    foreach ($map as $item) {
      $code=sprintf('%s.VULG.%03d.%03d',$bookCode,$item['chapter'],$item['number']);
      $unit->execute(['book'=>$bookCode,'code'=>$code,'description'=>"$bookCode {$item['chapter']}:{$item['number']} — equivalencia editorial",'notes'=>'Texto original conservado; correspondencia validada por secuencia interna.']);
      $unitId=(int)$pdo->lastInsertId(); $fragment=$item['inicio']!==null;
      $relation->execute(['unit'=>$unitId,'verse'=>$item['sourceRow']['id'],'start'=>null,'length'=>null,'reference'=>null,'type'=>$fragment?'parcial':'exacta']);
      $relation->execute(['unit'=>$unitId,'verse'=>$item['targetRow']['id'],'start'=>$item['inicio'],'length'=>$item['longitud'],'reference'=>$fragment?"{$item['chapter']}:{$item['number']} interno":null,'type'=>$fragment?'parcial':'exacta']);
      $relations+=2;
    }
    $pdo->commit(); return ['units'=>count($map),'relations'=>$relations,'fragments'=>$fragmentCount];
  } catch (Throwable $error) { if ($pdo->inTransaction()) $pdo->rollBack(); throw $error; }
}

function bib_equiv_adjust_baruc_heading(PDO $pdo): array
{
  $needle=' Copia de la carta que envió Jeremías';
  $stmt=$pdo->prepare(
    "SELECT uv.id relacion_id,v.texto
     FROM lvj_bib_unidades_canonicas uc
     INNER JOIN lvj_bib_unidades_versiculos uv ON uv.unidad_canonica_id=uc.id AND uv.deleted_at IS NULL
     INNER JOIN lvj_bib_versiculos v ON v.id=uv.versiculo_id AND v.deleted_at IS NULL
     INNER JOIN lvj_bib_versiones ver ON ver.id=v.version_id AND ver.codigo='SPAPLATENSE' AND ver.deleted_at IS NULL
     INNER JOIN lvj_bib_libros lib ON lib.id=v.libro_id AND lib.codigo='BAR' AND lib.deleted_at IS NULL
     WHERE uc.codigo_canonico='BAR.VULG.005.009' AND uc.deleted_at IS NULL
       AND v.capitulo=5 AND v.versiculo=9"
  );
  $stmt->execute(); $rows=$stmt->fetchAll();
  if (count($rows)!==1) throw new RuntimeException('No se encontró una única relación SPAPLATENSE para Baruc 5:9.');
  $text=(string)$rows[0]['texto']; $position=mb_strpos($text,$needle);
  if ($position===false || $position<20 || mb_strpos($text,$needle,$position+1)!==false) throw new RuntimeException('El encabezado de Baruc 6 no se detectó de forma única.');
  $update=$pdo->prepare("UPDATE lvj_bib_unidades_versiculos SET fragmento_inicio=1,fragmento_longitud=:length,referencia_editorial='5:9 sin encabezado editorial de 6:1',tipo_equivalencia='parcial',updated_at=NOW() WHERE id=:id AND deleted_at IS NULL");
  $update->execute(['length'=>$position,'id'=>$rows[0]['relacion_id']]);
  if ($update->rowCount()!==1) throw new RuntimeException('No se pudo ajustar la relación de Baruc 5:9.');
  return ['relations'=>1,'length'=>$position];
}

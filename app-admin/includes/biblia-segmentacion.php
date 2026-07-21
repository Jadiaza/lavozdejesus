<?php

declare(strict_types=1);

function bib_seg_ensure_schema(PDO $pdo): void
{
  $pdo->exec("CREATE TABLE IF NOT EXISTS lvj_bib_segmentacion_lotes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL UNIQUE,
    version_codigo VARCHAR(50) NOT NULL,libro_codigo VARCHAR(30) NOT NULL,
    versiculo_original_id BIGINT UNSIGNED NOT NULL,capitulo INT NOT NULL,versiculo INT NOT NULL,
    texto_original LONGTEXT NOT NULL,estado ENUM('aplicado','revertido') NOT NULL DEFAULT 'aplicado',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_segmentacion_original (versiculo_original_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
  $pdo->exec("CREATE TABLE IF NOT EXISTS lvj_bib_segmentacion_creados (
    lote_id BIGINT UNSIGNED NOT NULL,versiculo_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY(lote_id,versiculo_id),KEY idx_segmentacion_creado(versiculo_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
  $pdo->exec("CREATE TABLE IF NOT EXISTS lvj_bib_segmentacion_relaciones (
    lote_id BIGINT UNSIGNED NOT NULL,relacion_id BIGINT UNSIGNED NOT NULL,
    versiculo_id BIGINT UNSIGNED NOT NULL,fragmento_inicio INT UNSIGNED NULL,
    fragmento_longitud INT UNSIGNED NULL,referencia_editorial VARCHAR(60) NULL,
    tipo_equivalencia VARCHAR(30) NOT NULL,
    PRIMARY KEY(lote_id,relacion_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
  $pdo->exec("CREATE TABLE IF NOT EXISTS lvj_bib_encabezado_lotes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL UNIQUE,
    version_codigo VARCHAR(50) NOT NULL,libro_codigo VARCHAR(30) NOT NULL,
    origen_id BIGINT UNSIGNED NOT NULL,destino_id BIGINT UNSIGNED NOT NULL,
    texto_origen_original LONGTEXT NOT NULL,titulo_destino_original VARCHAR(255) NULL,
    encabezado VARCHAR(255) NOT NULL,estado ENUM('aplicado','revertido') NOT NULL DEFAULT 'aplicado',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}

function bib_seg_baruc_heading(PDO $pdo): ?array
{
  $stmt=$pdo->query("SELECT v.id,v.capitulo,v.versiculo,v.texto,v.titulo_seccion FROM lvj_bib_versiculos v INNER JOIN lvj_bib_versiones ver ON ver.id=v.version_id AND ver.codigo='SPAPLATENSE' AND ver.deleted_at IS NULL INNER JOIN lvj_bib_libros l ON l.id=v.libro_id AND l.codigo='BAR' AND l.deleted_at IS NULL WHERE ((v.capitulo=5 AND v.versiculo=9) OR (v.capitulo=6 AND v.versiculo=1)) AND v.deleted_at IS NULL ORDER BY v.capitulo,v.versiculo");
  $rows=$stmt->fetchAll(); if(count($rows)!==2)return null;
  $source=$rows[0];$target=$rows[1];$needle='Copia de la carta que envió Jeremías';
  $position=mb_strpos((string)$source['texto'],$needle);
  $active=$pdo->query("SELECT id FROM lvj_bib_encabezado_lotes WHERE version_codigo='SPAPLATENSE' AND libro_codigo='BAR' AND estado='aplicado' ORDER BY id DESC LIMIT 1")->fetchColumn();
  return ['origen'=>$source,'destino'=>$target,'posicion'=>$position,'texto_versiculo'=>$position===false?(string)$source['texto']:trim(mb_substr((string)$source['texto'],0,$position)),'encabezado'=>$position===false?(string)$target['titulo_seccion']:trim(mb_substr((string)$source['texto'],$position)),'lote_activo'=>$active?:null];
}

function bib_seg_apply_baruc_heading(PDO $pdo): int
{
  bib_seg_ensure_schema($pdo);$data=bib_seg_baruc_heading($pdo);
  if(!$data||$data['posicion']===false)throw new RuntimeException('El encabezado ya no está dentro de SPAPLATENSE Baruc 5:9 o no se detectó de forma única.');
  if($data['lote_activo'])throw new RuntimeException('El encabezado ya fue organizado.');
  if(trim((string)$data['destino']['titulo_seccion'])!==''&&trim((string)$data['destino']['titulo_seccion'])!==$data['encabezado'])throw new RuntimeException('Baruc 6:1 ya posee otro título de sección. No se reemplazó.');
  $pdo->beginTransaction();try{
    $key='SPAPLATENSE_BAR_ENCABEZADO_5_9_'.date('YmdHis');
    $stmt=$pdo->prepare("INSERT INTO lvj_bib_encabezado_lotes(clave,version_codigo,libro_codigo,origen_id,destino_id,texto_origen_original,titulo_destino_original,encabezado) VALUES (?,'SPAPLATENSE','BAR',?,?,?,?,?)");
    $stmt->execute([$key,(int)$data['origen']['id'],(int)$data['destino']['id'],(string)$data['origen']['texto'],$data['destino']['titulo_seccion'],$data['encabezado']]);$lot=(int)$pdo->lastInsertId();
    $pdo->prepare('UPDATE lvj_bib_versiculos SET texto=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND texto=?')->execute([$data['texto_versiculo'],(int)$data['origen']['id'],(string)$data['origen']['texto']]);
    if($pdo->prepare('SELECT ROW_COUNT()')->execute()===false)throw new RuntimeException('No se pudo asegurar la actualización de 5:9.');
    $pdo->prepare('UPDATE lvj_bib_versiculos SET titulo_seccion=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')->execute([$data['encabezado'],(int)$data['destino']['id']]);
    $pdo->commit();return $lot;
  }catch(Throwable $error){if($pdo->inTransaction())$pdo->rollBack();throw $error;}
}

function bib_seg_revert_baruc_heading(PDO $pdo,int $lotId): void
{
  bib_seg_ensure_schema($pdo);$pdo->beginTransaction();try{
    $stmt=$pdo->prepare("SELECT * FROM lvj_bib_encabezado_lotes WHERE id=? AND estado='aplicado' FOR UPDATE");$stmt->execute([$lotId]);$lot=$stmt->fetch();if(!$lot)throw new RuntimeException('El traslado del encabezado no existe o ya fue revertido.');
    $pdo->prepare('UPDATE lvj_bib_versiculos SET texto=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')->execute([(string)$lot['texto_origen_original'],(int)$lot['origen_id']]);
    $pdo->prepare('UPDATE lvj_bib_versiculos SET titulo_seccion=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')->execute([$lot['titulo_destino_original'],(int)$lot['destino_id']]);
    $pdo->prepare("UPDATE lvj_bib_encabezado_lotes SET estado='revertido',updated_at=CURRENT_TIMESTAMP WHERE id=?")->execute([$lotId]);$pdo->commit();
  }catch(Throwable $error){if($pdo->inTransaction())$pdo->rollBack();throw $error;}
}

function bib_seg_candidates(PDO $pdo,string $versionCode,string $bookCode): array
{
  $stmt=$pdo->prepare("SELECT v.id,v.capitulo,v.versiculo,v.texto,CHAR_LENGTH(v.texto) caracteres
    FROM lvj_bib_versiculos v
    INNER JOIN lvj_bib_versiones ver ON ver.id=v.version_id AND ver.codigo=:version AND ver.deleted_at IS NULL
    INNER JOIN lvj_bib_libros l ON l.id=v.libro_id AND l.codigo=:book AND l.deleted_at IS NULL
    WHERE v.deleted_at IS NULL AND CHAR_LENGTH(v.texto)>=300 ORDER BY v.capitulo,v.versiculo");
  $stmt->execute(['version'=>$versionCode,'book'=>$bookCode]);
  $rows=[];
  foreach ($stmt->fetchAll() as $row) {
    $row['segmentos']=bib_seg_parse_auto((string)$row['texto'],(int)$row['versiculo']);
    if (!$row['segmentos']) continue;
    $row['esperado_hasta']=(int)max(array_keys($row['segmentos']));
    preg_match_all('/(?:^|\s)([0-9]{1,3})\.\s+/u',(string)$row['texto'],$allMarkers);
    $sequence=array_keys($row['segmentos']); array_shift($sequence);
    $extras=array_values(array_diff(array_unique(array_map('intval',$allMarkers[1]??[])),$sequence));
    $row['complejo']=$extras!==[];
    $row['marcadores_adicionales']=$extras;
    $resolved=$pdo->prepare("SELECT COUNT(DISTINCT uv.referencia_editorial) FROM lvj_bib_unidades_versiculos uv WHERE uv.versiculo_id=? AND uv.deleted_at IS NULL AND uv.fragmento_inicio IS NOT NULL AND uv.fragmento_longitud IS NOT NULL AND uv.referencia_editorial IS NOT NULL");
    $resolved->execute([(int)$row['id']]);
    $row['relaciones_fragmentadas']=(int)$resolved->fetchColumn();
    $row['resuelto_equivalencias']=$row['relaciones_fragmentadas']>=count($row['segmentos']);
    $numbers=array_keys($row['segmentos']); array_shift($numbers);
    if ($numbers) {
      $in=implode(',',array_fill(0,count($numbers),'?'));
      $collision=$pdo->prepare("SELECT COUNT(*) FROM lvj_bib_versiculos v INNER JOIN lvj_bib_versiculos original ON original.id=? WHERE v.version_id=original.version_id AND v.libro_id=original.libro_id AND v.capitulo=original.capitulo AND v.versiculo IN ($in) AND v.deleted_at IS NULL");
      $collision->execute(array_merge([(int)$row['id']],$numbers));
      $row['colisiones']=(int)$collision->fetchColumn();
    } else $row['colisiones']=0;
    $check=$pdo->prepare("SELECT estado FROM lvj_bib_segmentacion_lotes WHERE versiculo_original_id=? ORDER BY id DESC LIMIT 1");
    $check->execute([(int)$row['id']]);
    $row['estado_lote']=$check->fetchColumn() ?: null;
    $rows[]=$row;
  }
  return $rows;
}

function bib_seg_parse_auto(string $text,int $first): array
{
  if (!preg_match_all('/(?:^|\s)([0-9]{1,3})\.\s+/u',$text,$matches)) return [];
  $available=array_fill_keys(array_map('intval',$matches[1]),true);
  $last=$first;
  while(isset($available[$last+1])) $last++;
  if($last===$first) return [];
  return bib_seg_parse($text,$first,$last);
}

function bib_seg_parse(string $text,int $first,int $last): array
{
  $markers=[];
  if (preg_match_all('/(?:^|\s)([0-9]{1,3})\.\s+/u',$text,$matches,PREG_OFFSET_CAPTURE)) {
    foreach ($matches[1] as $index=>$number) {
      $value=(int)$number[0];
      if ($value<$first+1 || $value>$last) continue;
      $fullOffset=(int)$matches[0][$index][1];
      $contentByte=$fullOffset+strlen((string)$matches[0][$index][0]);
      $markers[$value]=['marker_byte'=>$fullOffset,'content_byte'=>$contentByte];
    }
  }
  if (array_keys($markers)!==range($first+1,$last)) return [];
  $segments=[];
  $firstEnd=$markers[$first+1]['marker_byte'];
  $segments[$first]=['texto'=>trim(substr($text,0,$firstEnd)),'inicio'=>1,'fin'=>mb_strlen(substr($text,0,$firstEnd))];
  for ($number=$first+1;$number<=$last;$number++) {
    $start=$markers[$number]['content_byte'];
    $end=$number<$last?$markers[$number+1]['marker_byte']:strlen($text);
    $segments[$number]=[
      'texto'=>trim(substr($text,$start,$end-$start)),
      'inicio'=>mb_strlen(substr($text,0,$start))+1,
      'fin'=>mb_strlen(substr($text,0,$end)),
    ];
    if ($segments[$number]['texto']==='') return [];
  }
  return $segments;
}

function bib_seg_apply(PDO $pdo,int $verseId,string $versionCode,string $bookCode): array
{
  bib_seg_ensure_schema($pdo);
  $allowed=[]; foreach (bib_seg_candidates($pdo,$versionCode,$bookCode) as $candidate) $allowed[(int)$candidate['id']]=$candidate;
  if (!isset($allowed[$verseId])) throw new RuntimeException('El bloque seleccionado no pertenece a la auditoría actual.');
  $candidate=$allowed[$verseId]; $segments=$candidate['segmentos'];
  if (!$segments) throw new RuntimeException('No se detectó una secuencia interna completa y consecutiva. No se modificó nada.');
  if (!empty($candidate['complejo'])) throw new RuntimeException('El bloque contiene otras numeraciones internas y requiere revisión editorial manual. No se modificó nada.');
  if ((int)$candidate['colisiones']!==0) throw new RuntimeException('La separación colisiona con versículos existentes. Este caso requiere correspondencia editorial manual y no fue modificado.');
  if ($candidate['estado_lote']==='aplicado') throw new RuntimeException('Este bloque ya fue segmentado.');
  $pdo->beginTransaction();
  try {
    $row=$pdo->prepare('SELECT * FROM lvj_bib_versiculos WHERE id=? AND deleted_at IS NULL FOR UPDATE');
    $row->execute([$verseId]); $original=$row->fetch();
    if (!$original || (string)$original['texto']!==(string)$candidate['texto']) throw new RuntimeException('El texto cambió desde la vista previa. Recarga la página.');
    $numbers=array_keys($segments); $first=(int)array_shift($numbers);
    if ($numbers) {
      $in=implode(',',array_fill(0,count($numbers),'?'));
      $exists=$pdo->prepare("SELECT COUNT(*) FROM lvj_bib_versiculos WHERE version_id=? AND libro_id=? AND capitulo=? AND versiculo IN ($in) AND deleted_at IS NULL");
      $exists->execute(array_merge([(int)$original['version_id'],(int)$original['libro_id'],(int)$original['capitulo']],$numbers));
      if ((int)$exists->fetchColumn()!==0) throw new RuntimeException('Ya existen uno o más versículos de destino; se canceló para evitar duplicados.');
    }
    $key=sprintf('%s_%s_%03d_%03d_%s',$versionCode,$bookCode,(int)$original['capitulo'],(int)$original['versiculo'],date('YmdHis'));
    $lot=$pdo->prepare("INSERT INTO lvj_bib_segmentacion_lotes(clave,version_codigo,libro_codigo,versiculo_original_id,capitulo,versiculo,texto_original) VALUES (?,?,?,?,?,?,?)");
    $lot->execute([$key,$versionCode,$bookCode,$verseId,(int)$original['capitulo'],(int)$original['versiculo'],(string)$original['texto']]);
    $lotId=(int)$pdo->lastInsertId();
    $backup=$pdo->prepare('INSERT INTO lvj_bib_segmentacion_relaciones(lote_id,relacion_id,versiculo_id,fragmento_inicio,fragmento_longitud,referencia_editorial,tipo_equivalencia) SELECT ?,id,versiculo_id,fragmento_inicio,fragmento_longitud,referencia_editorial,tipo_equivalencia FROM lvj_bib_unidades_versiculos WHERE versiculo_id=? AND deleted_at IS NULL');
    $backup->execute([$lotId,$verseId]);
    $pdo->prepare('UPDATE lvj_bib_versiculos SET texto=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')->execute([$segments[$first]['texto'],$verseId]);
    $created=[$first=>$verseId];
    $insert=$pdo->prepare('INSERT INTO lvj_bib_versiculos(version_id,libro_id,capitulo,versiculo,texto,titulo_seccion,tiene_nota,estado,created_at,updated_at,deleted_at) VALUES (?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,NULL)');
    $track=$pdo->prepare('INSERT INTO lvj_bib_segmentacion_creados(lote_id,versiculo_id) VALUES (?,?)');
    foreach ($numbers as $number) {
      $insert->execute([(int)$original['version_id'],(int)$original['libro_id'],(int)$original['capitulo'],$number,$segments[$number]['texto'],$original['titulo_seccion'],$original['tiene_nota'],$original['estado']]);
      $created[$number]=(int)$pdo->lastInsertId(); $track->execute([$lotId,$created[$number]]);
    }
    $relations=$pdo->prepare('SELECT id,fragmento_inicio,referencia_editorial FROM lvj_bib_unidades_versiculos WHERE versiculo_id=? AND deleted_at IS NULL');
    $relations->execute([$verseId]); $move=$pdo->prepare("UPDATE lvj_bib_unidades_versiculos SET versiculo_id=?,fragmento_inicio=NULL,fragmento_longitud=NULL,referencia_editorial=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=?");
    foreach ($relations->fetchAll() as $relation) {
      $number=$first; $reference=(string)($relation['referencia_editorial']??'');
      if (preg_match('/(?:^|\D)([0-9]{1,3}):([0-9]{1,3})(?:\D|$)/',$reference,$match) && (int)$match[1]===(int)$original['capitulo']) $number=(int)$match[2];
      elseif ($relation['fragmento_inicio']!==null) foreach ($segments as $candidateNumber=>$segment) if ((int)$relation['fragmento_inicio']>=$segment['inicio'] && (int)$relation['fragmento_inicio']<=$segment['fin']) {$number=$candidateNumber;break;}
      if (!isset($created[$number])) throw new RuntimeException('Una relación no pudo asignarse inequívocamente.');
      $move->execute([$created[$number],(int)$relation['id']]);
    }
    $pdo->commit(); return ['lote'=>$lotId,'creados'=>count($numbers),'relaciones'=>$backup->rowCount()];
  } catch(Throwable $error) {if($pdo->inTransaction())$pdo->rollBack();throw $error;}
}

function bib_seg_revert(PDO $pdo,int $lotId): void
{
  bib_seg_ensure_schema($pdo); $pdo->beginTransaction();
  try {
    $stmt=$pdo->prepare("SELECT * FROM lvj_bib_segmentacion_lotes WHERE id=? AND estado='aplicado' FOR UPDATE");$stmt->execute([$lotId]);$lot=$stmt->fetch();
    if(!$lot)throw new RuntimeException('La corrección no existe o ya fue revertida.');
    $external=$pdo->prepare('SELECT COUNT(*) FROM lvj_bib_unidades_versiculos uv INNER JOIN lvj_bib_segmentacion_creados c ON c.versiculo_id=uv.versiculo_id AND c.lote_id=? LEFT JOIN lvj_bib_segmentacion_relaciones b ON b.relacion_id=uv.id AND b.lote_id=c.lote_id WHERE uv.deleted_at IS NULL AND b.relacion_id IS NULL');
    $external->execute([$lotId]);
    if((int)$external->fetchColumn()!==0)throw new RuntimeException('No se puede revertir: existen relaciones nuevas creadas después de la segmentación.');
    $restore=$pdo->prepare('UPDATE lvj_bib_unidades_versiculos uv INNER JOIN lvj_bib_segmentacion_relaciones b ON b.relacion_id=uv.id AND b.lote_id=? SET uv.versiculo_id=b.versiculo_id,uv.fragmento_inicio=b.fragmento_inicio,uv.fragmento_longitud=b.fragmento_longitud,uv.referencia_editorial=b.referencia_editorial,uv.tipo_equivalencia=b.tipo_equivalencia,uv.updated_at=CURRENT_TIMESTAMP');$restore->execute([$lotId]);
    $pdo->prepare('DELETE v FROM lvj_bib_versiculos v INNER JOIN lvj_bib_segmentacion_creados c ON c.versiculo_id=v.id AND c.lote_id=? WHERE NOT EXISTS(SELECT 1 FROM lvj_bib_unidades_versiculos uv WHERE uv.versiculo_id=v.id AND uv.deleted_at IS NULL)')->execute([$lotId]);
    $pdo->prepare('UPDATE lvj_bib_versiculos SET texto=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')->execute([(string)$lot['texto_original'],(int)$lot['versiculo_original_id']]);
    $pdo->prepare("UPDATE lvj_bib_segmentacion_lotes SET estado='revertido',updated_at=CURRENT_TIMESTAMP WHERE id=?")->execute([$lotId]);
    $pdo->commit();
  }catch(Throwable $error){if($pdo->inTransaction())$pdo->rollBack();throw $error;}
}

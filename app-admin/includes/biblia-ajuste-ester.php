<?php
declare(strict_types=1);

function ester_expected(): array {
  $limits=[10=>13,11=>12,12=>6,13=>18,14=>19,15=>19,16=>24];$result=[];
  foreach($limits as $chapter=>$last)for($verse=$chapter===10?3:1;$verse<=$last;$verse++)$result["$chapter:$verse"]=[$chapter,$verse];
  return $result;
}
function ester_schema(PDO $pdo): void {
  $pdo->exec("CREATE TABLE IF NOT EXISTS lvj_bib_ester_ajustes(id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,clave VARCHAR(100) CHARACTER SET ascii COLLATE ascii_general_ci UNIQUE NOT NULL,libro_id BIGINT UNSIGNED NOT NULL,versiculo_original_id BIGINT UNSIGNED NOT NULL,capitulos_originales INT NOT NULL,texto_original LONGTEXT NOT NULL,estado ENUM('aplicado','revertido') NOT NULL DEFAULT 'aplicado',created_at DATETIME DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
  $pdo->exec("CREATE TABLE IF NOT EXISTS lvj_bib_ester_ajustes_creados(ajuste_id BIGINT UNSIGNED NOT NULL,versiculo_id BIGINT UNSIGNED NOT NULL,PRIMARY KEY(ajuste_id,versiculo_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
  $pdo->exec("CREATE TABLE IF NOT EXISTS lvj_bib_ester_ajustes_relaciones(ajuste_id BIGINT UNSIGNED NOT NULL,relacion_id BIGINT UNSIGNED NOT NULL,versiculo_id BIGINT UNSIGNED NOT NULL,fragmento_inicio INT UNSIGNED NULL,fragmento_longitud INT UNSIGNED NULL,referencia_editorial VARCHAR(60) NULL,tipo_equivalencia VARCHAR(30) NOT NULL,PRIMARY KEY(ajuste_id,relacion_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}
function ester_audit(PDO $pdo): array {
  ester_schema($pdo);$expected=ester_expected();
  $stmt=$pdo->query("SELECT v.*,l.capitulos FROM lvj_bib_versiculos v INNER JOIN lvj_bib_versiones ver ON ver.id=v.version_id AND ver.codigo='TORRESAMAT' AND ver.deleted_at IS NULL INNER JOIN lvj_bib_libros l ON l.id=v.libro_id AND l.codigo='EST' AND l.deleted_at IS NULL WHERE v.capitulo=10 AND v.versiculo=3 AND v.deleted_at IS NULL");
  $original=$stmt->fetch();if(!$original)throw new RuntimeException('No se encontró TORRESAMAT Ester 10:3.');
  $relations=$pdo->prepare("SELECT uv.id,uv.fragmento_inicio,uv.fragmento_longitud,uv.referencia_editorial,uv.estado_revision,uv.tipo_equivalencia FROM lvj_bib_unidades_versiculos uv WHERE uv.versiculo_id=? AND uv.deleted_at IS NULL AND uv.referencia_editorial IS NOT NULL ORDER BY uv.fragmento_inicio");$relations->execute([(int)$original['id']]);
  $map=[];foreach($relations->fetchAll() as $row){if(!preg_match('/^([0-9]+):([0-9]+)/',(string)$row['referencia_editorial'],$m))continue;$key=(int)$m[1].':'.(int)$m[2];if(isset($expected[$key]))$map[$key]=$row;}
  $preview=[];foreach($expected as $key=>$reference){$row=$map[$key]??null;$text=$row&&$row['fragmento_inicio']!==null&&$row['fragmento_longitud']!==null?trim(mb_substr((string)$original['texto'],(int)$row['fragmento_inicio']-1,(int)$row['fragmento_longitud'])):'';$preview[]=['key'=>$key,'chapter'=>$reference[0],'verse'=>$reference[1],'relation'=>$row,'text'=>$text];}
  $missing=array_values(array_filter($preview,static function($r){return !$r['relation']||$r['text']==='';}));
  $collision=$pdo->prepare("SELECT COUNT(*) FROM lvj_bib_versiculos WHERE version_id=? AND libro_id=? AND ((capitulo=10 AND versiculo BETWEEN 4 AND 13) OR capitulo BETWEEN 11 AND 16) AND deleted_at IS NULL");$collision->execute([(int)$original['version_id'],(int)$original['libro_id']]);
  $collisionCount=(int)$collision->fetchColumn();
  $active=$pdo->query("SELECT id FROM lvj_bib_ester_ajustes WHERE estado='aplicado' ORDER BY id DESC LIMIT 1")->fetchColumn();
  return ['original'=>$original,'preview'=>$preview,'missing'=>count($missing),'collisions'=>$collisionCount,'detected'=>count($map),'active'=>$active?:null,'ready'=>count($map)===109&&!$missing&&$collisionCount===0&&!$active];
}
function ester_apply(PDO $pdo): array {
  $audit=ester_audit($pdo);if(!$audit['ready'])throw new RuntimeException('La auditoría no cumple 109 referencias, cero faltantes y cero colisiones.');$o=$audit['original'];$pdo->beginTransaction();
  try{$key='TORRESAMAT_EST_10_3_'.date('YmdHis');$stmt=$pdo->prepare("INSERT INTO lvj_bib_ester_ajustes(clave,libro_id,versiculo_original_id,capitulos_originales,texto_original) VALUES (?,?,?,?,?)");$stmt->execute([$key,(int)$o['libro_id'],(int)$o['id'],(int)$o['capitulos'],(string)$o['texto']]);$id=(int)$pdo->lastInsertId();
    $backup=$pdo->prepare('INSERT INTO lvj_bib_ester_ajustes_relaciones SELECT ?,id,versiculo_id,fragmento_inicio,fragmento_longitud,referencia_editorial,tipo_equivalencia FROM lvj_bib_unidades_versiculos WHERE versiculo_id=? AND deleted_at IS NULL');$backup->execute([$id,(int)$o['id']]);
    $insert=$pdo->prepare('INSERT INTO lvj_bib_versiculos(version_id,libro_id,capitulo,versiculo,texto,titulo_seccion,tiene_nota,estado,created_at,updated_at,deleted_at) VALUES (?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,NULL)');$track=$pdo->prepare('INSERT INTO lvj_bib_ester_ajustes_creados VALUES (?,?)');$move=$pdo->prepare('UPDATE lvj_bib_unidades_versiculos SET versiculo_id=?,fragmento_inicio=NULL,fragmento_longitud=NULL,referencia_editorial=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=?');$created=0;$moved=0;
    foreach($audit['preview'] as $item){if($item['key']==='10:3'){$verseId=(int)$o['id'];$pdo->prepare('UPDATE lvj_bib_versiculos SET texto=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')->execute([$item['text'],$verseId]);}else{$insert->execute([(int)$o['version_id'],(int)$o['libro_id'],$item['chapter'],$item['verse'],$item['text'],$o['titulo_seccion'],$o['tiene_nota'],$o['estado']]);$verseId=(int)$pdo->lastInsertId();$track->execute([$id,$verseId]);$created++;}$move->execute([$verseId,(int)$item['relation']['id']]);$moved++;}
    $pdo->prepare('UPDATE lvj_bib_libros SET capitulos=16,updated_at=CURRENT_TIMESTAMP WHERE id=?')->execute([(int)$o['libro_id']]);$pdo->commit();return ['id'=>$id,'created'=>$created,'moved'=>$moved];
  }catch(Throwable $e){if($pdo->inTransaction())$pdo->rollBack();throw $e;}
}
function ester_revert(PDO $pdo,int $id): void {
  ester_schema($pdo);$pdo->beginTransaction();try{$s=$pdo->prepare("SELECT * FROM lvj_bib_ester_ajustes WHERE id=? AND estado='aplicado' FOR UPDATE");$s->execute([$id]);$lot=$s->fetch();if(!$lot)throw new RuntimeException('El ajuste no existe o ya fue revertido.');
    $external=$pdo->prepare('SELECT COUNT(*) FROM lvj_bib_unidades_versiculos uv INNER JOIN lvj_bib_ester_ajustes_creados c ON c.versiculo_id=uv.versiculo_id AND c.ajuste_id=? LEFT JOIN lvj_bib_ester_ajustes_relaciones b ON b.relacion_id=uv.id AND b.ajuste_id=c.ajuste_id WHERE uv.deleted_at IS NULL AND b.relacion_id IS NULL');$external->execute([$id]);if((int)$external->fetchColumn())throw new RuntimeException('Existen relaciones posteriores; no se puede revertir automáticamente.');
    $pdo->prepare('UPDATE lvj_bib_unidades_versiculos uv INNER JOIN lvj_bib_ester_ajustes_relaciones b ON b.relacion_id=uv.id AND b.ajuste_id=? SET uv.versiculo_id=b.versiculo_id,uv.fragmento_inicio=b.fragmento_inicio,uv.fragmento_longitud=b.fragmento_longitud,uv.referencia_editorial=b.referencia_editorial,uv.tipo_equivalencia=b.tipo_equivalencia,uv.updated_at=CURRENT_TIMESTAMP')->execute([$id]);
    $pdo->prepare('DELETE v FROM lvj_bib_versiculos v INNER JOIN lvj_bib_ester_ajustes_creados c ON c.versiculo_id=v.id AND c.ajuste_id=?')->execute([$id]);$pdo->prepare('UPDATE lvj_bib_versiculos SET texto=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')->execute([$lot['texto_original'],$lot['versiculo_original_id']]);$pdo->prepare('UPDATE lvj_bib_libros SET capitulos=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')->execute([$lot['capitulos_originales'],$lot['libro_id']]);$pdo->prepare("UPDATE lvj_bib_ester_ajustes SET estado='revertido' WHERE id=?")->execute([$id]);$pdo->commit();
  }catch(Throwable $e){if($pdo->inTransaction())$pdo->rollBack();throw $e;}
}

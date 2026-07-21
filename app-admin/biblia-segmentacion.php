<?php

declare(strict_types=1);

require_once __DIR__.'/includes/auth.php';
require_once __DIR__.'/includes/biblia-segmentacion.php';
require_login();

$pdo=lvj_files_db(); $message=''; $error='';
$version=strtoupper(trim((string)($_POST['version']??$_GET['version']??'TORRESAMAT')));
$book=strtoupper(trim((string)($_POST['libro']??$_GET['libro']??'BAR')));
try {
  bib_seg_ensure_schema($pdo);
  if($_SERVER['REQUEST_METHOD']==='POST'){
    verify_csrf(); $action=(string)($_POST['action']??'');
    if($action==='aplicar'){
      $result=bib_seg_apply($pdo,(int)($_POST['versiculo_id']??0),$version,$book);
      $message=sprintf('Segmentación aplicada: %d versículos creados y %d relaciones reasignadas. Lote %d.',$result['creados'],$result['relaciones'],$result['lote']);
      log_activity('segmentar_versiculo_biblico','lvj_bib_versiculos',(int)($_POST['versiculo_id']??0),$message);
    }elseif($action==='revertir'){
      $lot=(int)($_POST['lote_id']??0); bib_seg_revert($pdo,$lot);
      $message="La segmentación del lote $lot fue revertida.";
      log_activity('revertir_segmentacion_biblica','lvj_bib_segmentacion_lotes',$lot,$message);
    }elseif($action==='organizar_encabezado_baruc'){
      $lot=bib_seg_apply_baruc_heading($pdo);$message="Encabezado de SPAPLATENSE Baruc 5:9 trasladado a titulo_seccion de 6:1. Lote $lot.";
      log_activity('organizar_encabezado_baruc','lvj_bib_encabezado_lotes',$lot,$message);
    }elseif($action==='revertir_encabezado_baruc'){
      $lot=(int)($_POST['lote_id']??0);bib_seg_revert_baruc_heading($pdo,$lot);$message="Traslado del encabezado revertido. Lote $lot.";
      log_activity('revertir_encabezado_baruc','lvj_bib_encabezado_lotes',$lot,$message);
    }else throw new RuntimeException('Acción no permitida.');
  }
  $versions=$pdo->query("SELECT codigo,nombre FROM lvj_bib_versiones WHERE estado=1 AND deleted_at IS NULL ORDER BY id")->fetchAll();
  $booksStmt=$pdo->prepare("SELECT l.codigo,l.nombre,l.orden FROM lvj_bib_libros l INNER JOIN lvj_bib_versiones v ON v.id=l.version_id AND v.codigo=? WHERE l.estado=1 AND l.deleted_at IS NULL ORDER BY l.orden,l.id");
  $booksStmt->execute([$version]);$books=$booksStmt->fetchAll();
  if(!in_array($book,array_column($books,'codigo'),true))$book=(string)($books[0]['codigo']??'');
  $candidates=$book!==''?bib_seg_candidates($pdo,$version,$book):[];
  $lots=$pdo->prepare("SELECT id,clave,capitulo,versiculo,estado,created_at FROM lvj_bib_segmentacion_lotes WHERE version_codigo=? AND libro_codigo=? ORDER BY id DESC");
  $lots->execute([$version,$book]);$history=$lots->fetchAll();
  $barucHeading=($version==='SPAPLATENSE'&&$book==='BAR')?bib_seg_baruc_heading($pdo):null;
}catch(Throwable $exception){$error=$exception->getMessage();$versions=$versions??[];$books=$books??[];$candidates=$candidates??[];$history=$history??[];$barucHeading=$barucHeading??null;}

$pageTitle='Segmentación bíblica';$pageSubtitle='Corrección reversible de importaciones';require __DIR__.'/includes/header.php';
?>
<section class="page-heading"><div><span class="eyebrow">Biblia</span><h1>Segmentación de versículos</h1><p>Detecta numeraciones consecutivas dentro de un registro, muestra la separación y permite aplicarla con respaldo y reversión.</p></div></section>
<?php if($message):?><div class="alert success"><?php echo e($message);?></div><?php endif;?>
<?php if($error):?><div class="alert error"><?php echo e($error);?></div><?php endif;?>
<section class="panel-card"><form method="get" class="form-grid">
<label>Versión<select name="version"><?php foreach($versions as $item):?><option value="<?php echo e((string)$item['codigo']);?>" <?php echo $version===$item['codigo']?'selected':'';?>><?php echo e((string)$item['nombre']);?></option><?php endforeach;?></select></label>
<label>Libro<select name="libro"><?php foreach($books as $item):?><option value="<?php echo e((string)$item['codigo']);?>" <?php echo $book===$item['codigo']?'selected':'';?>><?php echo e((string)$item['nombre']);?></option><?php endforeach;?></select></label>
<div class="form-actions"><button class="btn btn-gold" type="submit">Analizar libro completo</button></div></form></section>
<div class="alert"><strong>Regla de seguridad:</strong> el panel solamente separa secuencias internas consecutivas cuando los nuevos números no existen. Si hay colisiones o cambios de capítulo, bloquea la operación y conserva el caso para revisión editorial.</div>
<?php if($book==='BAR'&&$version!=='SPAPLATENSE'):?><div class="alert"><strong>Encabezado de Baruc 5:9:</strong> para organizarlo selecciona SPAPLATENSE y vuelve a analizar Baruc.</div><?php endif;?>
<?php if($barucHeading):?><section class="panel-card"><h2>Encabezado editorial de Baruc 6</h2><p class="muted">Se conservan todas las palabras: el título incluido en 5:9 pasa a <code>titulo_seccion</code> de 6:1.</p><div class="table-wrap"><table><thead><tr><th>Destino</th><th>Contenido resultante</th></tr></thead><tbody><tr><td>Texto 5:9</td><td><?php echo e((string)$barucHeading['texto_versiculo']);?></td></tr><tr><td>Título de 6:1</td><td><?php echo e((string)$barucHeading['encabezado']);?></td></tr></tbody></table></div>
<?php if($barucHeading['posicion']!==false&&!$barucHeading['lote_activo']):?><div class="alert error"><strong>Advertencia:</strong> cambiarán dos campos: <code>texto</code> de 5:9 y <code>titulo_seccion</code> de 6:1. No se elimina contenido; se crea respaldo reversible.</div><form method="post" class="form-actions" onsubmit="return confirm('CAMBIOS: el encabezado saldrá del texto 5:9 y se guardará como titulo_seccion de 6:1. Se conservarán todas las palabras y habrá respaldo. ¿Continuar?');"><?php echo csrf_field();?><input type="hidden" name="action" value="organizar_encabezado_baruc"><input type="hidden" name="version" value="SPAPLATENSE"><input type="hidden" name="libro" value="BAR"><button class="btn btn-gold" type="submit">Organizar encabezado con respaldo</button></form><?php elseif($barucHeading['lote_activo']):?><div class="alert success">El encabezado ya está organizado.</div><form method="post" onsubmit="return confirm('Se restaurarán el texto original de 5:9 y el título anterior de 6:1. ¿Continuar?');"><?php echo csrf_field();?><input type="hidden" name="action" value="revertir_encabezado_baruc"><input type="hidden" name="version" value="SPAPLATENSE"><input type="hidden" name="libro" value="BAR"><input type="hidden" name="lote_id" value="<?php echo (int)$barucHeading['lote_activo'];?>"><button class="btn btn-soft" type="submit">Revertir traslado</button></form><?php endif;?></section><?php endif;?>
<?php $applicableCandidates=array_filter($candidates,static function(array $row):bool{return (int)$row['colisiones']===0&&empty($row['complejo'])&&$row['estado_lote']!=='aplicado';});?>
<section class="stats-grid"><article class="stat-card"><span>Bloques detectados</span><strong><?php echo count($candidates);?></strong></article><article class="stat-card"><span>Aplicables</span><strong><?php echo count($applicableCandidates);?></strong></article><article class="stat-card"><span>Historial</span><strong><?php echo count($history);?></strong></article></section>
<?php if(!$candidates):?><section class="panel-card"><div class="alert success">No se detectaron bloques consecutivos pendientes en este libro.</div></section><?php endif;?>
<?php foreach($candidates as $candidate):?>
<details class="panel-card" open><summary><strong><?php echo e($version.' '.$book.' '.(int)$candidate['capitulo'].':'.(int)$candidate['versiculo']);?></strong> · <?php echo count($candidate['segmentos']);?> segmentos · <?php echo (int)$candidate['caracteres'];?> caracteres</summary>
<?php if((int)$candidate['colisiones']>0):?><div class="alert error">Bloqueado: <?php echo (int)$candidate['colisiones'];?> números ya existen en este capítulo. Requiere revisión editorial.</div><?php endif;?>
<?php if(!empty($candidate['complejo'])):?><div class="alert error">Bloqueado: también contiene otras numeraciones internas (<?php echo e(implode(', ',array_map('strval',$candidate['marcadores_adicionales'])));?>). Puede incluir notas al pie o cambios de capítulo.</div><?php endif;?>
<div class="table-wrap"><table><thead><tr><th>Referencia propuesta</th><th>Texto conservado</th></tr></thead><tbody><?php foreach($candidate['segmentos'] as $number=>$segment):?><tr><td><strong><?php echo (int)$candidate['capitulo'].':'.(int)$number;?></strong></td><td><?php echo e((string)$segment['texto']);?></td></tr><?php endforeach;?></tbody></table></div>
<?php if((int)$candidate['colisiones']===0&&empty($candidate['complejo'])&&$candidate['estado_lote']!=='aplicado'):?><div class="alert error"><strong>Advertencia:</strong> se actualizará <?php echo (int)$candidate['capitulo'].':'.(int)$candidate['versiculo'];?>, se crearán <?php echo count($candidate['segmentos'])-1;?> versículos y se reasignarán sus equivalencias. El respaldo permite revertirlo.</div><form method="post" class="form-actions" onsubmit="return confirm('CAMBIOS: se dividirá el registro, se crearán versículos y se reasignarán equivalencias. Se guardará respaldo reversible. ¿Continuar?');"><?php echo csrf_field();?><input type="hidden" name="action" value="aplicar"><input type="hidden" name="version" value="<?php echo e($version);?>"><input type="hidden" name="libro" value="<?php echo e($book);?>"><input type="hidden" name="versiculo_id" value="<?php echo (int)$candidate['id'];?>"><button class="btn btn-gold" type="submit">Aplicar esta segmentación</button></form><?php endif;?>
</details><?php endforeach;?>
<?php if($history):?><section class="panel-card"><h2>Historial reversible</h2><div class="table-wrap"><table><thead><tr><th>Lote</th><th>Registro</th><th>Estado</th><th>Acción</th></tr></thead><tbody><?php foreach($history as $lot):?><tr><td><?php echo e((string)$lot['clave']);?></td><td><?php echo (int)$lot['capitulo'].':'.(int)$lot['versiculo'];?></td><td><?php echo e((string)$lot['estado']);?></td><td><?php if($lot['estado']==='aplicado'):?><form method="post" onsubmit="return confirm('¿Revertir esta segmentación y restaurar texto y relaciones originales?');"><?php echo csrf_field();?><input type="hidden" name="action" value="revertir"><input type="hidden" name="version" value="<?php echo e($version);?>"><input type="hidden" name="libro" value="<?php echo e($book);?>"><input type="hidden" name="lote_id" value="<?php echo (int)$lot['id'];?>"><button class="btn btn-soft" type="submit">Revertir</button></form><?php else:?>Revertido<?php endif;?></td></tr><?php endforeach;?></tbody></table></div></section><?php endif;?>
<?php require __DIR__.'/includes/footer.php';?>

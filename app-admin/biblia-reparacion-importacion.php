<?php
declare(strict_types=1);
require_once __DIR__.'/includes/auth.php';
require_once __DIR__.'/includes/biblia-segmentacion.php';
require_login();
$pdo=lvj_files_db();$message='';$error='';$results=[];
$version=strtoupper(trim((string)($_POST['version']??$_GET['version']??'TORRESAMAT')));
try{
  bib_seg_ensure_schema($pdo);
  $versions=$pdo->query("SELECT codigo,nombre FROM lvj_bib_versiones WHERE estado=1 AND deleted_at IS NULL ORDER BY id")->fetchAll();
  if(!in_array($version,array_column($versions,'codigo'),true))$version=(string)($versions[0]['codigo']??'');
  $booksStmt=$pdo->prepare("SELECT l.codigo,l.nombre,l.orden FROM lvj_bib_libros l INNER JOIN lvj_bib_versiones v ON v.id=l.version_id AND v.codigo=? AND v.deleted_at IS NULL WHERE l.estado=1 AND l.deleted_at IS NULL ORDER BY l.orden,l.id");$booksStmt->execute([$version]);$books=$booksStmt->fetchAll();
  $scan=function()use($pdo,$version,$books):array{$all=[];foreach($books as $book){foreach(bib_seg_candidates($pdo,$version,(string)$book['codigo']) as $candidate){$candidate['libro_codigo']=$book['codigo'];$candidate['libro_nombre']=$book['nombre'];$candidate['aplicable']=empty($candidate['resuelto_equivalencias'])&&(int)$candidate['colisiones']===0&&empty($candidate['complejo'])&&$candidate['estado_lote']!=='aplicado';$all[]=$candidate;}}return $all;};
  $candidates=$scan();
  if($_SERVER['REQUEST_METHOD']==='POST'){
    verify_csrf();$action=(string)($_POST['action']??'');
    if($action==='aplicar_uno'){
      $verseId=(int)($_POST['versiculo_id']??0);$bookCode=strtoupper((string)($_POST['libro']??''));
      $allowed=false;foreach($candidates as $item)if((int)$item['id']===$verseId&&$item['libro_codigo']===$bookCode&&!empty($item['aplicable'])){$allowed=true;break;}
      if(!$allowed)throw new RuntimeException('El bloque ya no es aplicable o no pertenece a la auditoría actual.');
      $r=bib_seg_apply($pdo,$verseId,$version,$bookCode);$message="Bloque $bookCode corregido: {$r['creados']} versículos creados, {$r['relaciones']} relaciones respaldadas. Lote {$r['lote']}.";
      log_activity('reparar_bloque_importacion','lvj_bib_segmentacion_lotes',$r['lote'],$message);
    }elseif($action==='aplicar_seguros'){
      $safe=array_values(array_filter($candidates,static function(array $row):bool{return !empty($row['aplicable']);}));
      if(!$safe)throw new RuntimeException('No quedan bloques seguros para aplicar.');
      foreach($safe as $item){try{$r=bib_seg_apply($pdo,(int)$item['id'],$version,(string)$item['libro_codigo']);$results[]=['ok'=>true,'book'=>$item['libro_codigo'],'chapter'=>$item['capitulo'],'verse'=>$item['versiculo'],'created'=>$r['creados'],'lot'=>$r['lote']];}catch(Throwable $failure){$results[]=['ok'=>false,'book'=>$item['libro_codigo'],'chapter'=>$item['capitulo'],'verse'=>$item['versiculo'],'error'=>$failure->getMessage()];}}
      $ok=count(array_filter($results,static function(array $row):bool{return $row['ok'];}));$message="$ok bloques seguros fueron procesados. Cada bloque posee respaldo independiente.";
    }else throw new RuntimeException('Acción no permitida.');
    $candidates=$scan();
  }
}catch(Throwable $exception){$error=$exception->getMessage();$versions=$versions??[];$books=$books??[];$candidates=$candidates??[];}
$safe=array_values(array_filter($candidates,static function(array $row):bool{return !empty($row['aplicable']);}));$resolved=array_values(array_filter($candidates,static function(array $row):bool{return !empty($row['resuelto_equivalencias']);}));$blocked=count($candidates)-count($safe)-count($resolved);
$pageTitle='Reparación de importaciones';$pageSubtitle='Herramienta auxiliar universal';require __DIR__.'/includes/header.php';?>
<section class="page-heading"><div><span class="eyebrow">Herramienta auxiliar</span><h1>Reparación de importaciones bíblicas</h1><p>Analiza todos los libros de una versión sin modificar las pantallas administrativas existentes.</p></div></section>
<?php if($message):?><div class="alert success"><?php echo e($message);?></div><?php endif;?><?php if($error):?><div class="alert error"><?php echo e($error);?></div><?php endif;?>
<section class="panel-card"><form method="get" class="form-grid"><label>Versión<select name="version"><?php foreach($versions as $item):?><option value="<?php echo e((string)$item['codigo']);?>" <?php echo $version===$item['codigo']?'selected':'';?>><?php echo e((string)$item['nombre']);?></option><?php endforeach;?></select></label><div class="form-actions"><button class="btn btn-gold" type="submit">Auditar versión completa</button></div></form></section>
<section class="stats-grid"><article class="stat-card"><span>Bloques detectados</span><strong><?php echo count($candidates);?></strong></article><article class="stat-card"><span>Aplicables automáticamente</span><strong><?php echo count($safe);?></strong></article><article class="stat-card"><span>Resueltos por equivalencias</span><strong><?php echo count($resolved);?></strong></article><article class="stat-card"><span>Bloqueados pendientes</span><strong><?php echo $blocked;?></strong></article></section>
<div class="alert error"><strong>Impacto del proceso automático:</strong> cada bloque seguro actualiza un registro, crea los versículos consecutivos faltantes y reasigna sus relaciones. No cambia palabras. Cada bloque genera su propio respaldo y puede revertirse desde la herramienta de segmentación.</div>
<?php if($safe):?><section class="panel-card"><form method="post" onsubmit="return confirm('Se aplicarán todos los bloques marcados como SEGUROS. Cada uno tendrá respaldo independiente. Los casos bloqueados no serán modificados. ¿Continuar?');"><?php echo csrf_field();?><input type="hidden" name="action" value="aplicar_seguros"><input type="hidden" name="version" value="<?php echo e($version);?>"><button class="btn btn-gold" type="submit">Aplicar todos los casos seguros</button></form></section><?php endif;?>
<?php if($results):?><section class="panel-card"><h2>Resultado del lote</h2><div class="table-wrap"><table><thead><tr><th>Bloque</th><th>Resultado</th></tr></thead><tbody><?php foreach($results as $row):?><tr><td><?php echo e($row['book'].' '.$row['chapter'].':'.$row['verse']);?></td><td><?php echo $row['ok']?'Aplicado · lote '.(int)$row['lot']:e((string)$row['error']);?></td></tr><?php endforeach;?></tbody></table></div></section><?php endif;?>
<section class="panel-card"><h2>Diagnóstico completo</h2><?php if(!$candidates):?><div class="alert success">No se detectaron secuencias internas pendientes.</div><?php else:?><div class="table-wrap"><table><thead><tr><th>Libro</th><th>Registro</th><th>Propuesta</th><th>Estado</th><th>Acción</th></tr></thead><tbody><?php foreach($candidates as $item):?><tr><td><?php echo e((string)$item['libro_nombre']);?></td><td><?php echo (int)$item['capitulo'].':'.(int)$item['versiculo'];?><br><small><?php echo (int)$item['caracteres'];?> caracteres</small></td><td><?php echo count($item['segmentos']);?> segmentos, hasta <?php echo (int)$item['capitulo'].':'.(int)$item['esperado_hasta'];?></td><td><?php if(!empty($item['resuelto_equivalencias'])):?><span class="status-pill status-active">Resuelto por equivalencias</span><br><small><?php echo (int)$item['relaciones_fragmentadas'];?> referencias editoriales</small><?php elseif($item['aplicable']):?><span class="status-pill status-active">Seguro</span><?php else:?><span class="status-pill status-inactive">Bloqueado</span><br><small><?php echo (int)$item['colisiones'];?> colisiones<?php if(!empty($item['complejo'])):?> · numeración compleja<?php endif;?></small><?php endif;?></td><td><?php if($item['aplicable']):?><form method="post" onsubmit="return confirm('Se corregirá solo este bloque con respaldo reversible. ¿Continuar?');"><?php echo csrf_field();?><input type="hidden" name="action" value="aplicar_uno"><input type="hidden" name="version" value="<?php echo e($version);?>"><input type="hidden" name="libro" value="<?php echo e((string)$item['libro_codigo']);?>"><input type="hidden" name="versiculo_id" value="<?php echo (int)$item['id'];?>"><button class="btn btn-soft" type="submit">Aplicar bloque</button></form><?php elseif(!empty($item['resuelto_equivalencias'])):?>Sin acción pendiente<?php else:?>Revisión editorial<?php endif;?></td></tr><?php endforeach;?></tbody></table></div><?php endif;?></section>
<?php require __DIR__.'/includes/footer.php';?>

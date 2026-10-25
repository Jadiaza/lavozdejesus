<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/auth.php';
require_technical_admin();

$pdo = lvj_files_db();
$pageTitle = 'Capa de transmisiones';
$pageSubtitle = 'Administración independiente de la capa superpuesta de LVJPRAYER';
$message = '';
$error = '';
$config = null;
$latestDate = null;
$sampleIntentions = [];
$intentionCount = 0;
$tableReady = true;

try {
  $config = $pdo->query("SELECT * FROM lvj_tx_config WHERE id = 1 LIMIT 1")->fetch();
  if (!$config) {
    $pdo->exec("INSERT INTO lvj_tx_config (id, nombre) VALUES (1, 'Capa de transmisión LVJPRAYER')");
    $config = $pdo->query("SELECT * FROM lvj_tx_config WHERE id = 1 LIMIT 1")->fetch();
  }
} catch (Throwable $e) {
  $tableReady = false;
  $error = 'Falta instalar la migración app-admin/migrations/2026-10-19-create-lvj-transmission-config.sql. No se ejecuta automáticamente.';
}

function tx_escape(mixed $value): string {
  return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}
function tx_value(array $config, string $key, string $default = ''): string {
  return tx_escape($config[$key] ?? $default);
}
function tx_checked(array $config, string $key): string {
  return !empty($config[$key]) ? ' checked' : '';
}
function tx_datetime_local(array $config, string $key): string {
  $value = (string) ($config[$key] ?? '');
  return $value ? tx_escape(date('Y-m-d\\TH:i', strtotime($value))) : '';
}

if ($tableReady && $_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf();
  $mode = (string) ($_POST['modo_capa'] ?? 'desactivada');
  $provider = (string) ($_POST['proveedor'] ?? 'livepush');
  $position = (string) ($_POST['posicion'] ?? 'inferior_derecha');
  $start = trim((string) ($_POST['inicia_en'] ?? ''));
  $end = trim((string) ($_POST['termina_en'] ?? ''));
  $url = trim((string) ($_POST['url_reproduccion'] ?? ''));
  $seconds = max(5, min(30, (int) ($_POST['segundos_tarjeta'] ?? 5)));
  $active = isset($_POST['activa']) ? 1 : 0;
  $scheduled = isset($_POST['programada']) ? 1 : 0;
    try {
    if (!in_array($mode, ['desactivada','video','intenciones'], true)
      || !in_array($provider, ['livepush','xtreamcast','restream','otro'], true)
      || !in_array($position, ['inferior_derecha','inferior_izquierda','superior_derecha','superior_izquierda'], true)) {
      throw new RuntimeException('Hay una opción no válida.');
    }
    if ($url !== '' && (!filter_var($url, FILTER_VALIDATE_URL) || strtolower((string) parse_url($url, PHP_URL_SCHEME)) !== 'https')) {
      throw new RuntimeException('La URL de reproducción debe ser una dirección HTTPS válida.');
    }
    $startValue = $start !== '' ? str_replace('T', ' ', $start) . ':00' : null;
    $endValue = $end !== '' ? str_replace('T', ' ', $end) . ':00' : null;
    if ($startValue && $endValue && strtotime($endValue) <= strtotime($startValue)) {
      throw new RuntimeException('La fecha final debe ser posterior a la fecha inicial.');
    }
    $stmt = $pdo->prepare("UPDATE lvj_tx_config SET proveedor=:proveedor, url_reproduccion=:url, modo_capa=:modo, activa=:activa, programada=:programada, inicia_en=:inicio, termina_en=:fin, segundos_tarjeta=:segundos, solo_marcadas_overlay=0, posicion=:posicion, updated_at=NOW() WHERE id=1");
    $stmt->execute([
      'proveedor'=>$provider, 'url'=>$url !== '' ? $url : null, 'modo'=>$mode, 'activa'=>$active,
      'programada'=>$scheduled, 'inicio'=>$startValue, 'fin'=>$endValue, 'segundos'=>$seconds,
      'posicion'=>$position,
    ]);
    log_activity('actualizar_configuracion', 'lvj_tx_config', 1, 'Configuración de capa de transmisiones');
    $message = 'Configuración guardada. La capa se integra externamente en las rutas de Capilla; permanece apagada hasta validar la reproducción y la conexión con la base de datos.';
    $config = $pdo->query("SELECT * FROM lvj_tx_config WHERE id=1 LIMIT 1")->fetch();
  } catch (Throwable $e) {
    $error = $e instanceof RuntimeException ? $e->getMessage() : 'No fue posible guardar la configuración.';
  }
}

if ($tableReady) {
  try {
    $dateStmt = $pdo->query("SELECT DATE(MAX(fecha_publicacion)) FROM lvj_com_peticiones_oracion WHERE estado='aprobado' AND deleted_at IS NULL AND fecha_publicacion IS NOT NULL AND fecha_publicacion < DATE_ADD(CURDATE(), INTERVAL 1 DAY)");
    $latestDate = $dateStmt->fetchColumn() ?: null;
    if ($latestDate) {
      $stmt = $pdo->prepare("SELECT id, nombre, ciudad, peticion, categoria, fecha_publicacion FROM lvj_com_peticiones_oracion WHERE estado='aprobado' AND deleted_at IS NULL AND DATE(fecha_publicacion)=:fecha AND fecha_publicacion < DATE_ADD(CURDATE(), INTERVAL 1 DAY) ORDER BY id DESC LIMIT 8");
      $stmt->execute(['fecha'=>$latestDate]);
      $sampleIntentions = $stmt->fetchAll();
      $intentionCount = count($sampleIntentions);
    }
  } catch (Throwable $e) {
    $latestDate = null;
  }
}
require __DIR__ . '/includes/header.php';
?>
<section class="page-heading"><div><span class="eyebrow">Transmisiones · Módulo independiente</span><h1>Capa de transmisión</h1><p>Configura el video en vivo o las tarjetas de intenciones que se superpondrán visualmente sobre Capilla, sin modificar el módulo Capilla.</p></div></section>
<?php if ($message): ?><div class="alert success"><?php echo tx_escape($message); ?></div><?php endif; ?>
<?php if ($error): ?><div class="alert error"><?php echo tx_escape($error); ?></div><?php endif; ?>
<?php if (!$tableReady): ?>
<section class="panel-card"><h2>Instalación pendiente</h2><p>Ejecuta manualmente la migración <code>app-admin/migrations/2026-10-19-create-lvj-transmission-config.sql</code> en la base de datos utilizada por el panel. El módulo no crea tablas automáticamente.</p></section>
<?php else: ?>
<section class="dashboard-grid">
 <article class="panel-card"><span class="eyebrow">Estado administrativo</span><h2><?php echo !empty($config['activa']) ? 'Activada' : 'Desactivada'; ?></h2><p>La capa visual se integra desde el router, sin modificar el interior de Capilla. Mantén la activación apagada hasta completar las pruebas.</p></article>
 <article class="panel-card"><span class="eyebrow">Intenciones disponibles</span><h2><?php echo (int)$intentionCount; ?></h2><p>Fecha más reciente disponible: <strong><?php echo tx_escape($latestDate ?: 'Sin registros disponibles'); ?></strong></p></article>
</section>
<section class="panel-card">
<form method="post" class="form-grid">
<?php echo csrf_field(); ?>
<div class="form-section-heading"><h2>Activación y contenido</h2><p>El video aparece al activar la modalidad de video y configurar una URL HTTPS de reproducción compatible. Las intenciones rotan automáticamente cada cinco segundos o según el intervalo elegido.</p></div>
<label class="field">Modalidad<select name="modo_capa"><?php foreach (['desactivada'=>'Desactivada','video'=>'Video en vivo','intenciones'=>'Tarjetas de intenciones'] as $v=>$label): ?><option value="<?php echo $v; ?>"<?php echo ($config['modo_capa'] ?? 'desactivada')===$v?' selected':''; ?>><?php echo $label; ?></option><?php endforeach; ?></select></label>
<label class="field">Proveedor<select name="proveedor"><?php foreach (['livepush'=>'Livepush','xtreamcast'=>'XtreamCast','restream'=>'Restream','otro'=>'Otro'] as $v=>$label): ?><option value="<?php echo $v; ?>"<?php echo ($config['proveedor'] ?? 'livepush')===$v?' selected':''; ?>><?php echo $label; ?></option><?php endforeach; ?></select><small>Se guarda el proveedor preferido. No introduzcas aquí claves RTMP privadas.</small></label>
<label class="field field-wide">URL de reproducción web (HLS/M3U8 o reproductor)<input type="url" name="url_reproduccion" maxlength="1000" value="<?php echo tx_value($config,'url_reproduccion'); ?>" placeholder="https://..."><small>URL pública de reproducción, nunca la clave de emisión RTMP.</small></label>
<label class="field">Posición<select name="posicion"><?php foreach (['inferior_derecha'=>'Inferior derecha (referencia)','inferior_izquierda'=>'Inferior izquierda','superior_derecha'=>'Superior derecha','superior_izquierda'=>'Superior izquierda'] as $v=>$label): ?><option value="<?php echo $v; ?>"<?php echo ($config['posicion'] ?? 'inferior_derecha')===$v?' selected':''; ?>><?php echo $label; ?></option><?php endforeach; ?></select></label>
<label class="field">Segundos por tarjeta<input type="number" name="segundos_tarjeta" min="5" max="30" value="<?php echo tx_value($config,'segundos_tarjeta','5'); ?>"><small>Valor inicial: 5 segundos.</small></label>
<label class="field">Inicio programado<input type="datetime-local" name="inicia_en" value="<?php echo tx_datetime_local($config,'inicia_en'); ?>"></label>
<label class="field">Fin programado<input type="datetime-local" name="termina_en" value="<?php echo tx_datetime_local($config,'termina_en'); ?>"></label>
<label class="checkbox-field"><input type="checkbox" name="activa" value="1"<?php echo tx_checked($config,'activa'); ?>> Activar la capa</label>
<label class="checkbox-field"><input type="checkbox" name="programada" value="1"<?php echo tx_checked($config,'programada'); ?>> Respetar el horario programado</label>
<div class="field-wide"><button class="btn btn-primary" type="submit">Guardar configuración</button></div>
</form></section>
<section class="panel-card"><h2>Vista previa de intenciones</h2><p class="muted">Solo intenciones aprobadas con fecha de publicación hasta hoy; se toma la fecha más reciente disponible.</p>
<?php if (!$sampleIntentions): ?><p>No hay intenciones disponibles con los filtros actuales.</p><?php else: ?><div class="table-wrap"><table><thead><tr><th>Intención</th><th>Categoría</th><th>Fecha</th></tr></thead><tbody><?php foreach ($sampleIntentions as $item): ?><tr><td><?php echo tx_escape($item['peticion']); ?></td><td><?php echo tx_escape($item['categoria']); ?></td><td><?php echo tx_escape($item['fecha_publicacion']); ?></td></tr><?php endforeach; ?></tbody></table></div><?php endif; ?>
</section>
<?php endif; ?>
<?php require __DIR__ . '/includes/footer.php'; ?>

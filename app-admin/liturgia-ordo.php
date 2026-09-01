<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_technical_admin();

$pageTitle = 'Sincronización Ordo';
$pageSubtitle = 'Consulta controlada del Ordo Colombiano y preparación de borradores';
$message = '';
$error = '';
$result = null;

function liturgia_ordo_private_config(): array
{
  $candidates = [dirname(__DIR__) . '/api/config.local.php', dirname(__DIR__) . '/hosting/api/config.local.php'];
  foreach ($candidates as $candidate) {
    if (!is_file($candidate)) continue;
    $config = require $candidate;
    if (is_array($config)) return $config;
  }
  return [];
}

function liturgia_ordo_endpoint(): string
{
  $host = strtolower(trim((string) ($_SERVER['HTTP_HOST'] ?? '')));
  $host = preg_replace('/:\d+$/', '', $host) ?? '';
  if (!in_array($host, ['lavozdejesus.co', 'www.lavozdejesus.co'], true)) {
    throw new RuntimeException('La consola solo puede ejecutarse desde el dominio administrativo autorizado.');
  }
  return 'https://' . $host . '/api/liturgia-sync-ordo.php';
}

function liturgia_ordo_sync(string $date, string $key): array
{
  if (!function_exists('curl_init')) throw new RuntimeException('El servidor no tiene disponible la extensión cURL.');
  $handle = curl_init(liturgia_ordo_endpoint());
  if ($handle === false) throw new RuntimeException('No fue posible iniciar la sincronización.');
  $body = json_encode(['fecha' => $date], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
  curl_setopt_array($handle, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['Accept: application/json', 'Content-Type: application/json', 'X-LVJ-Sync-Key: ' . $key],
    CURLOPT_POSTFIELDS => $body,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 180,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_MAXREDIRS => 0,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
  ]);
  $raw = curl_exec($handle);
  $status = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
  $curlError = curl_error($handle);
  curl_close($handle);
  if ($raw === false || $curlError !== '') throw new RuntimeException('No fue posible contactar el proceso interno de sincronización.');
  try {
    $decoded = json_decode((string) $raw, true, 128, JSON_THROW_ON_ERROR);
  } catch (JsonException $exception) {
    throw new RuntimeException('El proceso de sincronización devolvió una respuesta inválida.', 0, $exception);
  }
  if (!is_array($decoded) || $status < 200 || $status >= 300 || ($decoded['success'] ?? false) !== true) {
    throw new RuntimeException((string) ($decoded['message'] ?? 'La sincronización no pudo completarse.'));
  }
  return $decoded;
}

$config = liturgia_ordo_private_config();
$syncKey = trim((string) ($config['ordo_colombiano_sync_key'] ?? ''));
$providerUrl = trim((string) ($config['ordo_colombiano_api_url'] ?? ''));
$configured = $syncKey !== '';
$selectedDate = substr(trim((string) ($_POST['fecha'] ?? date('Y-m-d'))), 0, 10);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf();
  if ((string) ($_POST['action'] ?? '') !== 'sync') {
    $error = 'Acción no permitida.';
  } elseif (preg_match('/^\d{4}-\d{2}-\d{2}$/', $selectedDate) !== 1) {
    $error = 'Selecciona una fecha válida.';
  } elseif (!$configured) {
    $error = 'La clave privada de sincronización no está configurada en api/config.local.php.';
  } else {
    try {
      $result = liturgia_ordo_sync($selectedDate, $syncKey);
      $message = 'Ordo procesó la fecha ' . $selectedDate . '. Revisa los borradores generados.';
      log_activity('sincronizar_ordo', 'lvj_lit_lectura_dia', null, 'Fecha ' . $selectedDate);
    } catch (Throwable $syncError) {
      error_log('LVJ Admin Ordo sync: ' . $syncError->getMessage());
      $error = 'No fue posible completar la sincronización. Revisa la configuración o los registros del servidor.';
    }
  }
}

require __DIR__ . '/includes/header.php';
?>
<nav class="content-toolbar" aria-label="Administración de Liturgia"><div class="content-tabs"><a href="liturgia-dia.php">Liturgia del Día</a><a class="active" href="liturgia-ordo.php">Sincronizar Ordo</a><a href="lectio-divina.php">Lectio Divina</a><a href="santoral-dia.php">Santo del Día</a></div></nav>
<section class="panel content-overview-panel">
  <div class="content-overview"><div><span class="eyebrow">Ordo Colombiano</span><h2>Consola de sincronización</h2><p class="muted">Consulta una fecha, guarda la Liturgia como borrador y prepara Lectio y Santoral sin publicar automáticamente.</p></div><span class="status-pill <?php echo $configured ? 'status-active' : 'status-inactive'; ?>"><?php echo $configured ? 'Configurado' : 'Configuración pendiente'; ?></span></div>
  <?php if ($message): ?><div class="alert alert-success"><?php echo e($message); ?></div><?php endif; ?>
  <?php if ($error): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>
  <form method="post" class="content-form-grid" onsubmit="return confirm('La fecha seleccionada será consultada en Ordo y cualquier cambio quedará en borrador. ¿Continuar?');">
    <?php echo csrf_field(); ?><input type="hidden" name="action" value="sync">
    <label class="content-field">Fecha del Ordo<input type="date" name="fecha" required value="<?php echo e($selectedDate); ?>"></label>
    <div class="content-field"><span>Proveedor</span><strong>Ordo Colombiano</strong><small class="muted"><?php echo $providerUrl !== '' ? 'Endpoint privado configurado' : 'Endpoint oficial predeterminado'; ?></small></div>
    <div class="form-actions full"><button class="btn btn-gold" type="submit" <?php echo !$configured ? 'disabled' : ''; ?>>Sincronizar fecha</button><a class="btn btn-soft" href="liturgia-dia.php?estado=borrador">Revisar borradores</a></div>
  </form>
</section>
<?php if (is_array($result)): ?>
  <?php $liturgiaResult = is_array($result['liturgia'] ?? null) ? $result['liturgia'] : []; $lectioResult = is_array($result['lectio'] ?? null) ? $result['lectio'] : []; $santoralResult = is_array($result['santoral'] ?? null) ? $result['santoral'] : []; ?>
  <section class="stats-grid pending-stats">
    <article class="stat-card"><div class="stat-icon gold">LI</div><span>Liturgia</span><strong><?php echo e((string) ($liturgiaResult['action'] ?? 'procesada')); ?></strong><small><?php echo !empty($liturgiaResult['requires_review']) ? 'Requiere revisión' : 'Sin cambios editoriales'; ?></small></article>
    <article class="stat-card"><div class="stat-icon green">LD</div><span>Lectio Divina</span><strong><?php echo e((string) ($lectioResult['status'] ?? 'sin resultado')); ?></strong><small>Borrador o contenido reutilizado</small></article>
    <article class="stat-card"><div class="stat-icon gold">SA</div><span>Santoral</span><strong><?php echo e((string) ($santoralResult['status'] ?? 'sin resultado')); ?></strong><small>Identidad determinada por Ordo</small></article>
  </section>
<?php endif; ?>
<section class="panel"><div class="panel-header"><div><h2>Flujo protegido</h2><p class="muted">La clave permanece en el servidor y nunca se envía al navegador.</p></div></div><div class="content-form-grid"><div class="content-field"><strong>1. Consultar Ordo</strong><small class="muted">Fecha validada y conexión HTTPS.</small></div><div class="content-field"><strong>2. Crear borradores</strong><small class="muted">Liturgia, Lectio y Santo según disponibilidad.</small></div><div class="content-field"><strong>3. Revisión humana</strong><small class="muted">Nada se publica desde esta consola.</small></div></div></section>
<?php require __DIR__ . '/includes/footer.php'; ?>

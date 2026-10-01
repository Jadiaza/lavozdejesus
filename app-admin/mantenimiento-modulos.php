<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_technical_admin();

$pdo = lvj_files_db();
$pageTitle = 'Mantenimiento de módulos';
$pageSubtitle = 'Control operativo global y mantenimiento temporal por módulo';

$success = '';
$error = '';

$maintenanceGlobalMessage = 'La aplicación se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde.';
$defaultModuleMessage = 'Este módulo se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde.';

try {
  $emisora = $pdo->query("
    SELECT id, nombre_emisora
    FROM lvj_cfg_emisora
    WHERE estado = 1
    ORDER BY id ASC
    LIMIT 1
  ")->fetch();

  if (!$emisora) {
    throw new RuntimeException('No existe una emisora activa.');
  }

  $emisoraId = (int) $emisora['id'];

  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!hash_equals((string) ($_SESSION['csrf_token'] ?? ''), (string) ($_POST['csrf_token'] ?? ''))) {
      throw new RuntimeException('Token de seguridad inválido. Recarga la página e inténtalo nuevamente.');
    }

    $action = (string) ($_POST['action'] ?? '');

    if ($action === 'global') {
      $value = isset($_POST['modo_mantenimiento']) && (int) $_POST['modo_mantenimiento'] === 1 ? 1 : 0;

      $stmt = $pdo->prepare("
        UPDATE lvj_cfg_app
        SET modo_mantenimiento = :modo_mantenimiento,
            updated_at = CURRENT_TIMESTAMP
        WHERE emisora_id = :emisora_id
          AND estado = 1
      ");
      $stmt->execute([
        'modo_mantenimiento' => $value,
        'emisora_id' => $emisoraId,
      ]);

      log_activity(
        'update',
        'lvj_cfg_app',
        $emisoraId,
        'Mantenimiento global ' . ($value === 1 ? 'activado' : 'desactivado')
      );

      $success = $value === 1
        ? 'El mantenimiento global fue activado.'
        : 'El mantenimiento global fue desactivado.';
    }

    if ($action === 'module') {
      $module = trim((string) ($_POST['modulo'] ?? ''));
      $value = isset($_POST['modo_mantenimiento']) && (int) $_POST['modo_mantenimiento'] === 1 ? 1 : 0;
      $message = trim((string) ($_POST['mensaje_mantenimiento'] ?? ''));

      if ($module === '') {
        throw new RuntimeException('El módulo es obligatorio.');
      }

      if (mb_strlen($module) > 80) {
        throw new RuntimeException('El identificador del módulo supera los 80 caracteres permitidos.');
      }

      if (mb_strlen($message) > 500) {
        throw new RuntimeException('El mensaje de mantenimiento supera los 500 caracteres permitidos.');
      }

      if ($message === '') {
        $message = $defaultModuleMessage;
      }

      $stmt = $pdo->prepare("
        UPDATE lvj_cfg_modulos
        SET modo_mantenimiento = :modo_mantenimiento,
            mensaje_mantenimiento = :mensaje_mantenimiento,
            updated_at = CURRENT_TIMESTAMP
        WHERE emisora_id = :emisora_id
          AND modulo = :modulo
      ");
      $stmt->execute([
        'modo_mantenimiento' => $value,
        'mensaje_mantenimiento' => $message,
        'emisora_id' => $emisoraId,
        'modulo' => $module,
      ]);

      if ($stmt->rowCount() === 0) {
        $check = $pdo->prepare("
          SELECT id
          FROM lvj_cfg_modulos
          WHERE emisora_id = :emisora_id AND modulo = :modulo
          LIMIT 1
        ");
        $check->execute([
          'emisora_id' => $emisoraId,
          'modulo' => $module,
        ]);

        if (!$check->fetch()) {
          throw new RuntimeException('El módulo seleccionado no existe en lvj_cfg_modulos.');
        }
      }

      log_activity(
        'update',
        'lvj_cfg_modulos',
        null,
        'Mantenimiento del módulo ' . $module . ' ' . ($value === 1 ? 'activado' : 'desactivado')
      );

      $success = $value === 1
        ? 'El mantenimiento de ' . $module . ' fue activado.'
        : 'El mantenimiento de ' . $module . ' fue desactivado.';
    }
  }

  $app = $pdo->prepare("
    SELECT modo_mantenimiento
    FROM lvj_cfg_app
    WHERE emisora_id = :emisora_id AND estado = 1
    LIMIT 1
  ");
  $app->execute(['emisora_id' => $emisoraId]);
  $appConfig = $app->fetch() ?: ['modo_mantenimiento' => 0];

  $modulesStmt = $pdo->prepare("
    SELECT id, modulo, modo_mantenimiento, mensaje_mantenimiento, updated_at
    FROM lvj_cfg_modulos
    WHERE emisora_id = :emisora_id
    ORDER BY CASE modulo
      WHEN 'inicio' THEN 1
      WHEN 'radio' THEN 2
      WHEN 'programacion' THEN 3
      WHEN 'capilla_virtual' THEN 4
      WHEN 'oraciones' THEN 5
      WHEN 'rosario' THEN 6
      WHEN 'liturgia' THEN 7
      WHEN 'santoral' THEN 8
      WHEN 'biblia' THEN 9
      WHEN 'biblioteca' THEN 10
      WHEN 'formacion' THEN 11
      WHEN 'comunidad' THEN 12
      WHEN 'podcast' THEN 13
      WHEN 'eventos' THEN 14
      WHEN 'testimonios' THEN 15
      WHEN 'donaciones' THEN 16
      WHEN 'publicidad' THEN 17
      ELSE 99
    END, modulo ASC
  ");
  $modulesStmt->execute(['emisora_id' => $emisoraId]);
  $modules = $modulesStmt->fetchAll();

} catch (Throwable $e) {
  $error = $e->getMessage();
  $modules = $modules ?? [];
  $appConfig = $appConfig ?? ['modo_mantenimiento' => 0];
  $emisoraId = $emisoraId ?? 0;
}

require __DIR__ . '/includes/header.php';
?>

<section class="panel">
  <div class="panel-header">
    <div>
      <h2>Mantenimiento operativo</h2>
      <p class="muted">
        Controla temporalmente la disponibilidad de LVJPRAYER sin eliminar contenido ni modificar las opciones de visibilidad.
      </p>
    </div>
    <span class="badge records-badge">Emisora <?php echo (int) $emisoraId; ?></span>
  </div>

  <?php if ($success): ?>
    <div class="alert alert-success"><?php echo e($success); ?></div>
  <?php endif; ?>

  <?php if ($error): ?>
    <div class="alert alert-error"><?php echo e($error); ?></div>
  <?php endif; ?>

  <div class="maintenance-global-card">
    <div>
      <h3>Mantenimiento global</h3>
      <p class="muted">
        Al activarlo, el estado global tiene prioridad sobre el mantenimiento individual de los módulos.
      </p>
    </div>

    <form method="post" class="maintenance-global-form">
      <?php echo csrf_field(); ?>
      <input type="hidden" name="action" value="global">
      <input type="hidden" name="modo_mantenimiento" value="<?php echo (int) ((int) ($appConfig['modo_mantenimiento'] ?? 0) === 1 ? 0 : 1); ?>">
      <?php if ((int) ($appConfig['modo_mantenimiento'] ?? 0) === 1): ?>
        <span class="status-pill status-active">ACTIVO</span>
        <button class="btn btn-soft" type="submit">Desactivar mantenimiento global</button>
      <?php else: ?>
        <span class="status-pill">INACTIVO</span>
        <button class="btn btn-gold" type="submit">Activar mantenimiento global</button>
      <?php endif; ?>
    </form>
  </div>
</section>

<section class="panel content-records-panel">
  <div class="panel-header content-list-header">
    <div>
      <h2>Mantenimiento por módulo</h2>
      <p class="muted">
        El mantenimiento no elimina ni oculta los contenidos. Solo informa que el módulo está temporalmente en mantenimiento.
      </p>
    </div>
    <span class="badge records-badge"><?php echo count($modules); ?> módulos</span>
  </div>

  <div class="maintenance-module-list">
    <?php foreach ($modules as $module): ?>
      <?php
        $moduleName = (string) ($module['modulo'] ?? '');
        $active = (int) ($module['modo_mantenimiento'] ?? 0) === 1;
        $message = (string) ($module['mensaje_mantenimiento'] ?? '');
      ?>
      <article class="maintenance-module-card<?php echo $active ? ' is-maintenance' : ''; ?>">
        <div class="maintenance-module-head">
          <div>
            <strong><?php echo e(ucwords(str_replace('_', ' ', $moduleName))); ?></strong>
            <small><?php echo e($moduleName); ?></small>
          </div>
          <span class="status-pill <?php echo $active ? 'status-active' : ''; ?>">
            <?php echo $active ? 'EN MANTENIMIENTO' : 'NORMAL'; ?>
          </span>
        </div>

        <form method="post" class="maintenance-module-form">
          <?php echo csrf_field(); ?>
          <input type="hidden" name="action" value="module">
          <input type="hidden" name="modulo" value="<?php echo e($moduleName); ?>">

          <label class="maintenance-toggle">
            <input type="checkbox" name="modo_mantenimiento" value="1" <?php echo $active ? 'checked' : ''; ?>>
            <span>Activar mantenimiento</span>
          </label>

          <label>
            <span>Mensaje de mantenimiento</span>
            <textarea name="mensaje_mantenimiento" rows="2" maxlength="500"><?php echo e($message); ?></textarea>
          </label>

          <div class="maintenance-module-footer">
            <small>
              Última actualización:
              <?php echo e((string) ($module['updated_at'] ?? '')); ?>
            </small>
            <button class="btn <?php echo $active ? 'btn-soft' : 'btn-gold'; ?>" type="submit">
              Guardar cambios
            </button>
          </div>
        </form>
      </article>
    <?php endforeach; ?>

    <?php if (!$modules): ?>
      <div class="muted">No existen módulos configurados en lvj_cfg_modulos.</div>
    <?php endif; ?>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>

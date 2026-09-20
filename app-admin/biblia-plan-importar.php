<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();
$pageTitle = 'Importar plan';
$pageSubtitle = 'Planes e itinerarios de LVJPRAYER';
$message = '';
$error = '';
$summary = null;

function plan_import_columns(PDO $pdo, string $table): array
{
  $rows = $pdo->query("SHOW COLUMNS FROM `{$table}`")->fetchAll(PDO::FETCH_ASSOC);
  $map = [];
  foreach ($rows as $row) $map[(string) $row['Field']] = $row;
  return $map;
}

function plan_import_state(array $column, bool $active): int|string
{
  $type = strtolower((string) ($column['Type'] ?? ''));
  if (str_contains($type, 'int') || str_contains($type, 'bit')) return $active ? 1 : 0;
  if (str_starts_with($type, 'enum(')) {
    preg_match_all("/'([^']+)'/", $type, $matches);
    $allowed = $matches[1] ?? [];
    $preferred = $active
      ? ['activo', 'publicado', 'active', 'published', '1']
      : ['inactivo', 'borrador', 'inactive', 'draft', '0'];
    foreach ($preferred as $candidate) if (in_array($candidate, $allowed, true)) return $candidate;
    return $allowed[0] ?? ($active ? 'activo' : 'inactivo');
  }
  return $active ? 'activo' : 'inactivo';
}

function plan_import_payload(array $source, array $columns, array $allowedFields): array
{
  $payload = [];
  foreach ($allowedFields as $field) {
    if (isset($columns[$field]) && array_key_exists($field, $source)) $payload[$field] = $source[$field];
  }
  return $payload;
}

function plan_import_assignments(array $payload): string
{
  return implode(', ', array_map(static fn(string $field): string => '`' . $field . '` = :' . $field, array_keys($payload)));
}

try {
  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    if ((string) ($_POST['action'] ?? '') !== 'importar') throw new RuntimeException('Acción no permitida.');
    if (!isset($_FILES['plan_json']) || !is_array($_FILES['plan_json'])) throw new RuntimeException('Selecciona el archivo JSON del plan.');
    $upload = $_FILES['plan_json'];
    if ((int) ($upload['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) throw new RuntimeException('No fue posible recibir el archivo del plan.');
    if ((int) ($upload['size'] ?? 0) < 1 || (int) $upload['size'] > 2 * 1024 * 1024) throw new RuntimeException('El archivo debe pesar menos de 2 MB.');
    $name = (string) ($upload['name'] ?? '');
    if (strtolower(pathinfo($name, PATHINFO_EXTENSION)) !== 'json') throw new RuntimeException('El archivo debe ser JSON.');
    $tmp = (string) ($upload['tmp_name'] ?? '');
    if ($tmp === '' || !is_uploaded_file($tmp)) throw new RuntimeException('El archivo recibido no es válido.');

    $package = json_decode((string) file_get_contents($tmp), true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($package)) throw new RuntimeException('El JSON del plan no es válido.');
    $plan = is_array($package['plan'] ?? null) ? $package['plan'] : [];
    $days = is_array($package['dias'] ?? null) ? $package['dias'] : [];
    $title = trim((string) ($plan['titulo'] ?? ''));
    $duration = (int) ($plan['duracion_dias'] ?? 0);
    if ($title === '' || $duration < 1) throw new RuntimeException('El plan debe incluir título y duración.');
    if (count($days) !== $duration) throw new RuntimeException("La duración ({$duration}) no coincide con las jornadas del archivo (" . count($days) . ').');

    $seen = [];
    foreach ($days as $index => $day) {
      $number = (int) ($day['dia'] ?? 0);
      if ($number < 1 || $number > $duration) throw new RuntimeException('Hay una jornada con número inválido en la posición ' . ($index + 1) . '.');
      if (isset($seen[$number])) throw new RuntimeException('La jornada ' . $number . ' está repetida.');
      $seen[$number] = true;
      if (trim((string) ($day['titulo'] ?? '')) === '') throw new RuntimeException('La jornada ' . $number . ' no tiene título.');
    }
    for ($number = 1; $number <= $duration; $number++) if (!isset($seen[$number])) throw new RuntimeException('Falta la jornada ' . $number . '.');

    $planColumns = plan_import_columns($pdo, 'lvj_bib_planes');
    $dayColumns = plan_import_columns($pdo, 'lvj_bib_plan_dias');
    foreach (['titulo', 'duracion_dias', 'estado'] as $field) if (!isset($planColumns[$field])) throw new RuntimeException('Falta la columna requerida lvj_bib_planes.' . $field . '.');
    foreach (['plan_id', 'dia', 'titulo', 'estado'] as $field) if (!isset($dayColumns[$field])) throw new RuntimeException('Falta la columna requerida lvj_bib_plan_dias.' . $field . '.');

    $planPayload = plan_import_payload($plan, $planColumns, ['titulo', 'descripcion', 'duracion_dias', 'categoria', 'imagen_url']);
    $planPayload['estado'] = plan_import_state($planColumns['estado'], !array_key_exists('estado', $plan) || (int) $plan['estado'] === 1 || strtolower((string) $plan['estado']) === 'activo' || strtolower((string) $plan['estado']) === 'publicado');
    if (isset($planColumns['updated_at'])) $planPayload['updated_at'] = date('Y-m-d H:i:s');

    $pdo->beginTransaction();
    $findSql = 'SELECT id FROM lvj_bib_planes WHERE titulo = :titulo';
    if (isset($planColumns['deleted_at'])) $findSql .= ' AND deleted_at IS NULL';
    $findSql .= ' LIMIT 1';
    $find = $pdo->prepare($findSql);
    $find->execute(['titulo' => $title]);
    $planId = (int) ($find->fetchColumn() ?: 0);
    $createdPlan = false;

    if ($planId > 0) {
      $planPayload['record_id'] = $planId;
      $update = $pdo->prepare('UPDATE lvj_bib_planes SET ' . plan_import_assignments(array_diff_key($planPayload, ['record_id' => true])) . ' WHERE id = :record_id');
      $update->execute($planPayload);
    } else {
      if (isset($planColumns['created_at'])) $planPayload['created_at'] = date('Y-m-d H:i:s');
      $fields = array_keys($planPayload);
      $insert = $pdo->prepare('INSERT INTO lvj_bib_planes (`' . implode('`,`', $fields) . '`) VALUES (' . implode(',', array_map(static fn(string $field): string => ':' . $field, $fields)) . ')');
      $insert->execute($planPayload);
      $planId = (int) $pdo->lastInsertId();
      $createdPlan = true;
    }

    $createdDays = 0;
    $updatedDays = 0;
    foreach ($days as $day) {
      $dayPayload = plan_import_payload($day, $dayColumns, ['dia', 'titulo', 'lectura', 'descripcion', 'motivacion', 'oracion_inicial', 'oracion_final']);
      $dayPayload['plan_id'] = $planId;
      $dayPayload['estado'] = plan_import_state($dayColumns['estado'], !array_key_exists('estado', $day) || (int) $day['estado'] === 1 || strtolower((string) $day['estado']) === 'activo' || strtolower((string) $day['estado']) === 'publicado');
      if (isset($dayColumns['updated_at'])) $dayPayload['updated_at'] = date('Y-m-d H:i:s');

      $dayFindSql = 'SELECT id FROM lvj_bib_plan_dias WHERE plan_id = :plan_id AND dia = :dia';
      if (isset($dayColumns['deleted_at'])) $dayFindSql .= ' AND deleted_at IS NULL';
      $dayFindSql .= ' LIMIT 1';
      $dayFind = $pdo->prepare($dayFindSql);
      $dayFind->execute(['plan_id' => $planId, 'dia' => (int) $day['dia']]);
      $dayId = (int) ($dayFind->fetchColumn() ?: 0);

      if ($dayId > 0) {
        $dayPayload['record_id'] = $dayId;
        $updatePayload = array_diff_key($dayPayload, ['record_id' => true]);
        $update = $pdo->prepare('UPDATE lvj_bib_plan_dias SET ' . plan_import_assignments($updatePayload) . ' WHERE id = :record_id');
        $update->execute($dayPayload);
        $updatedDays++;
      } else {
        if (isset($dayColumns['created_at'])) $dayPayload['created_at'] = date('Y-m-d H:i:s');
        $fields = array_keys($dayPayload);
        $insert = $pdo->prepare('INSERT INTO lvj_bib_plan_dias (`' . implode('`,`', $fields) . '`) VALUES (' . implode(',', array_map(static fn(string $field): string => ':' . $field, $fields)) . ')');
        $insert->execute($dayPayload);
        $createdDays++;
      }
    }

    $pdo->commit();
    log_activity('importar_plan', 'lvj_bib_planes', $planId, "{$title}: {$createdDays} jornadas creadas y {$updatedDays} actualizadas.");
    $summary = ['title' => $title, 'duration' => $duration, 'created_plan' => $createdPlan, 'created_days' => $createdDays, 'updated_days' => $updatedDays];
    $message = $createdPlan ? 'Plan creado correctamente.' : 'Plan actualizado correctamente.';
  }
} catch (Throwable $exception) {
  if ($pdo->inTransaction()) $pdo->rollBack();
  $error = $exception->getMessage();
}

require __DIR__ . '/includes/header.php';
?>

<section class="panel content-overview-panel">
  <div class="content-overview">
    <div>
      <span class="eyebrow">Biblia · Planes</span>
      <h2>Importar plan</h2>
      <p class="muted">Carga un paquete JSON editorial sobre las tablas oficiales de planes. La operación es idempotente por título del plan y número de jornada.</p>
    </div>
    <div class="content-actions-bar">
      <a class="btn btn-soft" href="content.php?module=biblia&amp;table=lvj_bib_planes">Volver a Planes</a>
    </div>
  </div>
  <?php if ($message): ?><div class="alert alert-success"><?php echo e($message); ?></div><?php endif; ?>
  <?php if ($error): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>
</section>

<section class="panel">
  <div class="panel-header">
    <div>
      <span class="eyebrow">Paquete editorial</span>
      <h2>Seleccionar JSON</h2>
      <p class="muted">El archivo no se conserva en el servidor: se valida, se importa dentro de una transacción y se descarta al finalizar la petición.</p>
    </div>
  </div>
  <form method="post" enctype="multipart/form-data" onsubmit="return confirm('Se creará o actualizará el plan y sus jornadas. ¿Continuar?');">
    <?php echo csrf_field(); ?>
    <input type="hidden" name="action" value="importar">
    <label class="field-full">Archivo JSON del plan
      <input type="file" name="plan_json" accept="application/json,.json" required>
    </label>
    <div class="content-actions-bar" style="margin-top:16px">
      <button class="btn btn-gold" type="submit">Importar plan</button>
    </div>
  </form>
</section>

<?php if ($summary): ?>
<section class="panel">
  <div class="panel-header"><div><span class="eyebrow">Resultado</span><h2><?php echo e($summary['title']); ?></h2></div></div>
  <div class="stats-grid admin-stats">
    <article class="stat-card"><span>Duración</span><strong><?php echo (int) $summary['duration']; ?></strong><small>jornadas</small></article>
    <article class="stat-card"><span>Nuevas</span><strong><?php echo (int) $summary['created_days']; ?></strong><small>jornadas creadas</small></article>
    <article class="stat-card"><span>Actualizadas</span><strong><?php echo (int) $summary['updated_days']; ?></strong><small>jornadas actualizadas</small></article>
  </div>
</section>
<?php endif; ?>

<?php require __DIR__ . '/includes/footer.php'; ?>

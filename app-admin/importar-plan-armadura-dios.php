<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();
$pageTitle = 'Importar plan';
$pageSubtitle = 'Revístete con la Armadura de Dios';
$sourceFile = __DIR__ . '/data/plan-revistete-armadura-dios.json';
$message = '';
$error = '';
$collection = [];
$days = [];

function lvj_plan_columns(PDO $pdo, string $table): array
{
  $rows = $pdo->query("SHOW COLUMNS FROM `{$table}`")->fetchAll(PDO::FETCH_ASSOC);
  $result = [];
  foreach ($rows as $row) $result[(string) $row['Field']] = $row;
  return $result;
}

function lvj_plan_inactive_state(array $column): mixed
{
  $type = strtolower((string) ($column['Type'] ?? ''));
  if (str_contains($type, 'int') || str_contains($type, 'bit')) return 0;
  if (str_starts_with($type, 'enum(')) {
    preg_match_all("/'([^']+)'/", $type, $matches);
    $allowed = $matches[1] ?? [];
    foreach (['revision', 'borrador', 'inactivo', 'pendiente'] as $candidate) {
      if (in_array($candidate, $allowed, true)) return $candidate;
    }
    return $allowed[0] ?? '';
  }
  return 'inactivo';
}

function lvj_plan_filter_payload(array $payload, array $columns): array
{
  return array_intersect_key($payload, $columns);
}

function lvj_plan_update(PDO $pdo, string $table, int $id, array $payload): void
{
  $assignments = [];
  foreach (array_keys($payload) as $field) $assignments[] = "`{$field}` = :{$field}";
  $payload['record_id'] = $id;
  $stmt = $pdo->prepare("UPDATE `{$table}` SET " . implode(', ', $assignments) . " WHERE id = :record_id");
  $stmt->execute($payload);
}

function lvj_plan_insert(PDO $pdo, string $table, array $payload): int
{
  $fields = array_keys($payload);
  $quoted = array_map(static fn(string $field): string => "`{$field}`", $fields);
  $params = array_map(static fn(string $field): string => ":{$field}", $fields);
  $stmt = $pdo->prepare("INSERT INTO `{$table}` (" . implode(',', $quoted) . ") VALUES (" . implode(',', $params) . ")");
  $stmt->execute($payload);
  return (int) $pdo->lastInsertId();
}

try {
  if (!is_file($sourceFile)) throw new RuntimeException('No se encontró el archivo editorial del plan.');
  $collection = json_decode((string) file_get_contents($sourceFile), true, 512, JSON_THROW_ON_ERROR);
  $plan = is_array($collection['plan'] ?? null) ? $collection['plan'] : [];
  $days = is_array($collection['dias'] ?? null) ? $collection['dias'] : [];
  if (($plan['titulo'] ?? '') === '' || count($days) !== 14) {
    throw new RuntimeException('El archivo del plan debe contener título y exactamente 14 jornadas.');
  }

  $planColumns = lvj_plan_columns($pdo, 'lvj_bib_planes');
  $dayColumns = lvj_plan_columns($pdo, 'lvj_bib_plan_dias');
  foreach (['titulo', 'duracion_dias', 'categoria', 'estado'] as $required) {
    if (!isset($planColumns[$required])) throw new RuntimeException("Falta la columna requerida lvj_bib_planes.{$required}.");
  }
  foreach (['plan_id', 'dia', 'titulo', 'estado'] as $required) {
    if (!isset($dayColumns[$required])) throw new RuntimeException("Falta la columna requerida lvj_bib_plan_dias.{$required}.");
  }

  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    if ((string) ($_POST['action'] ?? '') !== 'importar') throw new RuntimeException('Acción no permitida.');

    $pdo->beginTransaction();

    $planPayload = [
      'titulo' => trim((string) $plan['titulo']),
      'descripcion' => trim((string) ($plan['descripcion'] ?? '')),
      'duracion_dias' => 14,
      'categoria' => trim((string) ($plan['categoria'] ?? 'Combate espiritual')),
      'imagen_url' => trim((string) ($plan['imagen_url'] ?? '')),
      'estado' => lvj_plan_inactive_state($planColumns['estado']),
    ];
    $planPayload = lvj_plan_filter_payload($planPayload, $planColumns);

    $findPlan = $pdo->prepare('SELECT id FROM lvj_bib_planes WHERE titulo = :titulo AND deleted_at IS NULL LIMIT 1');
    try {
      $findPlan->execute(['titulo' => $planPayload['titulo']]);
    } catch (Throwable $e) {
      $findPlan = $pdo->prepare('SELECT id FROM lvj_bib_planes WHERE titulo = :titulo LIMIT 1');
      $findPlan->execute(['titulo' => $planPayload['titulo']]);
    }
    $planId = (int) ($findPlan->fetchColumn() ?: 0);

    if ($planId > 0) {
      lvj_plan_update($pdo, 'lvj_bib_planes', $planId, $planPayload);
    } else {
      $planId = lvj_plan_insert($pdo, 'lvj_bib_planes', $planPayload);
    }

    $created = 0;
    $updated = 0;
    foreach ($days as $day) {
      $number = (int) ($day['dia'] ?? 0);
      if ($number < 1 || $number > 14) throw new RuntimeException('Número de jornada inválido.');

      $payload = [
        'plan_id' => $planId,
        'dia' => $number,
        'titulo' => trim((string) ($day['titulo'] ?? '')),
        'lectura' => trim((string) ($day['lectura'] ?? '')),
        'descripcion' => trim((string) ($day['descripcion'] ?? '')),
        'motivacion' => trim((string) ($day['motivacion'] ?? '')),
        'oracion_inicial' => trim((string) ($day['oracion_inicial'] ?? '')),
        'oracion_final' => trim((string) ($day['oracion_final'] ?? '')),
        'estado' => lvj_plan_inactive_state($dayColumns['estado']),
      ];
      $payload = lvj_plan_filter_payload($payload, $dayColumns);

      $findDay = $pdo->prepare('SELECT id FROM lvj_bib_plan_dias WHERE plan_id = :plan_id AND dia = :dia LIMIT 1');
      $findDay->execute(['plan_id' => $planId, 'dia' => $number]);
      $dayId = (int) ($findDay->fetchColumn() ?: 0);
      if ($dayId > 0) {
        lvj_plan_update($pdo, 'lvj_bib_plan_dias', $dayId, $payload);
        $updated++;
      } else {
        lvj_plan_insert($pdo, 'lvj_bib_plan_dias', $payload);
        $created++;
      }
    }

    $pdo->commit();
    log_activity('importar_plan', 'lvj_bib_planes', $planId, "Revístete con la Armadura de Dios: {$created} jornadas creadas y {$updated} actualizadas.");
    $message = "Plan preparado correctamente: {$created} jornadas creadas y {$updated} actualizadas. Quedó inactivo para revisión antes de publicarlo.";
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
      <h2>Revístete con la Armadura de Dios</h2>
      <p class="muted">Importación idempotente del itinerario de 14 jornadas basado en el libro oficial de La Voz de Jesús.</p>
    </div>
    <div class="content-actions-bar">
      <a class="btn btn-soft" href="content.php?module=biblia&amp;table=lvj_bib_planes">Volver a Planes</a>
    </div>
  </div>
  <?php if ($message): ?><div class="alert alert-success"><?php echo e($message); ?></div><?php endif; ?>
  <?php if ($error): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>
</section>
<?php if (!$error && $days): ?>
<section class="panel">
  <div class="content-overview">
    <div>
      <h2>Confirmar plan</h2>
      <p class="muted">La operación se puede repetir sin duplicar el plan ni sus jornadas. Se dejará inactivo para revisión editorial.</p>
    </div>
    <form method="post" onsubmit="return confirm('Se crearán o actualizarán las 14 jornadas del plan. ¿Continuar?');">
      <?php echo csrf_field(); ?>
      <input type="hidden" name="action" value="importar">
      <button class="btn btn-gold" type="submit">Importar 14 jornadas</button>
    </form>
  </div>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Día</th><th>Título</th><th>Lectura</th><th>Estado inicial</th></tr></thead>
      <tbody>
        <?php foreach ($days as $day): ?>
        <tr>
          <td><?php echo (int) ($day['dia'] ?? 0); ?></td>
          <td><strong><?php echo e((string) ($day['titulo'] ?? '')); ?></strong></td>
          <td><?php echo e((string) ($day['lectura'] ?? '')); ?></td>
          <td><span class="status-pill status-inactive">En revisión</span></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</section>
<?php endif; ?>
<?php require __DIR__ . '/includes/footer.php'; ?>

<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();
$pageTitle = 'Programación';
$pageSubtitle = 'Parrilla semanal de La Voz de Jesús';

$days = [
  'lunes' => 'Lunes',
  'martes' => 'Martes',
  'miercoles' => 'Miércoles',
  'jueves' => 'Jueves',
  'viernes' => 'Viernes',
  'sabado' => 'Sábado',
  'domingo' => 'Domingo',
];

function schedule_day_key(string $value): string
{
  $value = strtolower(trim($value));
  return strtr($value, ['á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','ü'=>'u']);
}

function schedule_status_active($value): bool
{
  $value = strtolower(trim((string) $value));
  return $value === '' || in_array($value, ['1','activo','activa','publicado','publicada','active','true','si','sí','yes'], true);
}

function schedule_time(string $value): string
{
  $value = trim($value);
  if ($value === '') return '—';
  $time = strtotime($value);
  return $time === false ? $value : date('H:i', $time);
}

function schedule_redirect(string $day, string $message = ''): void
{
  $query = ['dia' => $day];
  if ($message !== '') $query['ok'] = $message;
  header('Location: programacion.php?' . http_build_query($query));
  exit;
}

$selectedDay = schedule_day_key((string) ($_GET['dia'] ?? 'lunes'));
if (!isset($days[$selectedDay])) $selectedDay = 'lunes';

$message = trim((string) ($_GET['ok'] ?? ''));
$error = '';
$editId = isset($_GET['edit']) ? (int) $_GET['edit'] : 0;

try {
  $programs = $pdo->query("SELECT id, nombre FROM lvj_rad_programas ORDER BY nombre ASC")->fetchAll();
} catch (Throwable $e) {
  $programs = [];
  $error = 'No fue posible cargar el catálogo de programas.';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf();
  $action = (string) ($_POST['action'] ?? '');

  try {
    if ($action === 'save') {
      $id = (int) ($_POST['id'] ?? 0);
      $programId = (int) ($_POST['programa_id'] ?? 0);
      $dayKey = schedule_day_key((string) ($_POST['dia_semana'] ?? ''));
      $start = trim((string) ($_POST['hora_inicio'] ?? ''));
      $end = trim((string) ($_POST['hora_fin'] ?? ''));
      $status = trim((string) ($_POST['estado'] ?? 'activo'));

      if ($programId <= 0) throw new RuntimeException('Selecciona un programa.');
      if (!isset($days[$dayKey])) throw new RuntimeException('Selecciona un día válido.');
      if (!preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $start)) throw new RuntimeException('La hora de inicio no es válida.');
      if (!preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $end)) throw new RuntimeException('La hora de cierre no es válida.');

      $check = $pdo->prepare('SELECT id FROM lvj_rad_programas WHERE id = :id LIMIT 1');
      $check->execute(['id' => $programId]);
      if (!$check->fetchColumn()) throw new RuntimeException('El programa seleccionado no existe.');

      if ($id > 0) {
        $stmt = $pdo->prepare("UPDATE lvj_rad_programacion
          SET programa_id = :programa_id, dia_semana = :dia_semana, hora_inicio = :hora_inicio, hora_fin = :hora_fin, estado = :estado
          WHERE id = :id LIMIT 1");
        $stmt->execute([
          'programa_id' => $programId,
          'dia_semana' => $days[$dayKey],
          'hora_inicio' => $start . ':00',
          'hora_fin' => $end . ':00',
          'estado' => $status,
          'id' => $id,
        ]);
        log_activity('update', 'lvj_rad_programacion', $id, 'Horario de radio actualizado');
        schedule_redirect($dayKey, 'Horario actualizado.');
      }

      $stmt = $pdo->prepare("INSERT INTO lvj_rad_programacion (programa_id, dia_semana, hora_inicio, hora_fin, estado)
        VALUES (:programa_id, :dia_semana, :hora_inicio, :hora_fin, :estado)");
      $stmt->execute([
        'programa_id' => $programId,
        'dia_semana' => $days[$dayKey],
        'hora_inicio' => $start . ':00',
        'hora_fin' => $end . ':00',
        'estado' => $status,
      ]);
      $newId = (int) $pdo->lastInsertId();
      log_activity('create', 'lvj_rad_programacion', $newId, 'Horario de radio creado');
      schedule_redirect($dayKey, 'Programa agregado a la parrilla.');
    }

    if ($action === 'delete') {
      $id = (int) ($_POST['id'] ?? 0);
      if ($id <= 0) throw new RuntimeException('Registro no válido.');

      $columns = $pdo->query("SHOW COLUMNS FROM lvj_rad_programacion")->fetchAll();
      $columnNames = array_column($columns, 'Field');
      if (in_array('estado', $columnNames, true)) {
        $type = '';
        foreach ($columns as $column) if (($column['Field'] ?? '') === 'estado') $type = strtolower((string) ($column['Type'] ?? ''));
        $inactive = (strpos($type, 'int') !== false) ? '0' : 'eliminado';
        $stmt = $pdo->prepare('UPDATE lvj_rad_programacion SET estado = :estado WHERE id = :id LIMIT 1');
        $stmt->execute(['estado' => $inactive, 'id' => $id]);
      } else {
        $stmt = $pdo->prepare('DELETE FROM lvj_rad_programacion WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
      }
      log_activity('delete', 'lvj_rad_programacion', $id, 'Horario de radio eliminado/desactivado');
      schedule_redirect($selectedDay, 'Horario retirado de la parrilla.');
    }
  } catch (Throwable $e) {
    $error = $e instanceof RuntimeException ? $e->getMessage() : 'No fue posible guardar el cambio. Verifica la estructura de la tabla.';
  }
}

$editRow = null;
if ($editId > 0) {
  try {
    $stmt = $pdo->prepare('SELECT * FROM lvj_rad_programacion WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $editId]);
    $editRow = $stmt->fetch() ?: null;
    if ($editRow) {
      $editDay = schedule_day_key((string) ($editRow['dia_semana'] ?? ''));
      if (isset($days[$editDay])) $selectedDay = $editDay;
    }
  } catch (Throwable $e) {
    $error = 'No fue posible cargar el horario seleccionado.';
  }
}

try {
  $allRows = $pdo->query("SELECT s.*, p.nombre AS programa_nombre
    FROM lvj_rad_programacion s
    LEFT JOIN lvj_rad_programas p ON p.id = s.programa_id
    ORDER BY s.hora_inicio ASC, s.id ASC")->fetchAll();
} catch (Throwable $e) {
  $allRows = [];
  $error = $error ?: 'No fue posible consultar la programación.';
}

$counts = array_fill_keys(array_keys($days), 0);
$rows = [];
foreach ($allRows as $row) {
  if (!schedule_status_active($row['estado'] ?? '')) continue;
  $key = schedule_day_key((string) ($row['dia_semana'] ?? ''));
  if (isset($counts[$key])) $counts[$key]++;
  if ($key === $selectedDay) $rows[] = $row;
}

$showForm = isset($_GET['new']) || $editRow;
$formProgram = (string) ($editRow['programa_id'] ?? '');
$formStart = substr((string) ($editRow['hora_inicio'] ?? ''), 0, 5);
$formEnd = substr((string) ($editRow['hora_fin'] ?? ''), 0, 5);
$formStatus = (string) ($editRow['estado'] ?? 'activo');

require __DIR__ . '/includes/header.php';
?>

<style>
.schedule-toolbar{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:18px;flex-wrap:wrap}
.schedule-days{display:grid;grid-template-columns:repeat(7,minmax(112px,1fr));gap:8px;margin-bottom:18px}
.schedule-day{background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 10px;text-align:center;font-weight:800;color:#344054;box-shadow:0 4px 14px rgba(15,23,42,.04)}
.schedule-day small{display:block;margin-top:4px;color:var(--muted);font-weight:600}
.schedule-day.active{background:var(--navy);color:#fff;border-color:var(--gold);box-shadow:0 8px 22px rgba(7,24,42,.16)}
.schedule-day.active small{color:var(--gold-2)}
.schedule-form{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:14px;align-items:end}
.schedule-form label{display:grid;gap:7px;font-weight:700;color:#344054}
.schedule-form select,.schedule-form input{width:100%;min-height:44px;border:1px solid rgba(15,23,42,.14);border-radius:10px;background:#fff;padding:9px 11px;font:inherit}
.schedule-program{font-weight:800;color:var(--navy)}
.schedule-time{font-variant-numeric:tabular-nums;font-weight:750;white-space:nowrap}
.schedule-empty{text-align:center;padding:42px 18px;color:var(--muted)}
.schedule-actions{display:flex;gap:7px;align-items:center;flex-wrap:wrap}
.schedule-actions form{margin:0}
@media(max-width:900px){.schedule-days{grid-template-columns:repeat(4,1fr)}.schedule-form{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.schedule-days{display:flex;overflow-x:auto;padding-bottom:5px}.schedule-day{min-width:110px}.schedule-form{grid-template-columns:1fr}.admin-grid-table th:nth-child(1),.admin-grid-table td:nth-child(1){display:none}}
</style>

<?php if ($message !== ''): ?><div class="alert alert-success"><?php echo e($message); ?></div><?php endif; ?>
<?php if ($error !== ''): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>

<section class="panel">
  <div class="schedule-toolbar">
    <div>
      <h2>Parrilla semanal</h2>
      <p class="muted">Administra los horarios usando el catálogo existente de programas.</p>
    </div>
    <a class="btn btn-gold" href="programacion.php?<?php echo e(http_build_query(['dia'=>$selectedDay,'new'=>1])); ?>">+ Agregar programa</a>
  </div>

  <nav class="schedule-days" aria-label="Días de programación">
    <?php foreach ($days as $key => $label): ?>
      <a class="schedule-day<?php echo $selectedDay === $key ? ' active' : ''; ?>" href="programacion.php?dia=<?php echo e($key); ?>">
        <?php echo e($label); ?><small><?php echo (int) $counts[$key]; ?> horarios</small>
      </a>
    <?php endforeach; ?>
  </nav>

  <?php if ($showForm): ?>
    <form method="post" class="schedule-form" style="margin-bottom:22px">
      <?php echo csrf_field(); ?>
      <input type="hidden" name="action" value="save">
      <input type="hidden" name="id" value="<?php echo (int) ($editRow['id'] ?? 0); ?>">
      <input type="hidden" name="dia_semana" value="<?php echo e($selectedDay); ?>">
      <label>Programa
        <select name="programa_id" required>
          <option value="">Selecciona un programa</option>
          <?php foreach ($programs as $program): ?>
            <option value="<?php echo (int) $program['id']; ?>"<?php echo (string) $program['id'] === $formProgram ? ' selected' : ''; ?>><?php echo e((string) $program['nombre']); ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <label>Hora de inicio<input type="time" name="hora_inicio" value="<?php echo e($formStart); ?>" required></label>
      <label>Hora de cierre<input type="time" name="hora_fin" value="<?php echo e($formEnd); ?>" required></label>
      <label>Estado
        <select name="estado">
          <option value="activo"<?php echo schedule_status_active($formStatus) ? ' selected' : ''; ?>>Activo</option>
          <option value="inactivo"<?php echo !schedule_status_active($formStatus) ? ' selected' : ''; ?>>Inactivo</option>
        </select>
      </label>
      <div style="grid-column:1/-1;display:flex;gap:9px">
        <button class="btn btn-gold" type="submit"><?php echo $editRow ? 'Actualizar horario' : 'Agregar a ' . e($days[$selectedDay]); ?></button>
        <a class="btn btn-soft" href="programacion.php?dia=<?php echo e($selectedDay); ?>">Cancelar</a>
      </div>
    </form>
  <?php endif; ?>

  <div class="table-wrap">
    <table class="admin-grid-table">
      <thead><tr><th>ID</th><th>Hora</th><th>Programa</th><th>Hasta</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody>
      <?php foreach ($rows as $row): ?>
        <tr>
          <td><?php echo (int) $row['id']; ?></td>
          <td class="schedule-time"><?php echo e(schedule_time((string) ($row['hora_inicio'] ?? ''))); ?></td>
          <td class="schedule-program"><?php echo e((string) (($row['programa_nombre'] ?? '') ?: ('Programa #' . ($row['programa_id'] ?? '')))); ?></td>
          <td class="schedule-time"><?php echo e(schedule_time((string) ($row['hora_fin'] ?? ''))); ?></td>
          <td><span class="status-pill status-active">Activo</span></td>
          <td><div class="schedule-actions">
            <a class="action-button action-edit" href="programacion.php?<?php echo e(http_build_query(['dia'=>$selectedDay,'edit'=>(int)$row['id']])); ?>">Editar</a>
            <form method="post" onsubmit="return confirm('¿Retirar este horario de la parrilla?');">
              <?php echo csrf_field(); ?>
              <input type="hidden" name="action" value="delete">
              <input type="hidden" name="id" value="<?php echo (int) $row['id']; ?>">
              <button class="action-button action-delete danger-action" type="submit">Eliminar</button>
            </form>
          </div></td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$rows): ?><tr><td colspan="6" class="schedule-empty">No hay programas activos para <?php echo e($days[$selectedDay]); ?>.</td></tr><?php endif; ?>
      </tbody>
    </table>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>

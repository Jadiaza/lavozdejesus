<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();
$message = '';
$error = '';
$allowedStates = ['pendiente', 'aprobado', 'rechazado', 'respondida'];
$state = (string) ($_GET['estado'] ?? 'pendiente');
if (!in_array($state, $allowedStates, true)) {
  $state = 'pendiente';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf();
  $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT);
  $action = (string) ($_POST['action'] ?? '');

  try {
    if (!$id || $id < 1) {
      throw new RuntimeException('Intención no válida.');
    }

    if ($action === 'aprobar') {
      $stmt = $pdo->prepare("
        UPDATE lvj_com_peticiones_oracion
        SET estado = 'aprobado', fecha_publicacion = COALESCE(fecha_publicacion, NOW()), updated_at = NOW()
        WHERE id = :id AND deleted_at IS NULL
      ");
    } elseif ($action === 'rechazar') {
      $stmt = $pdo->prepare("UPDATE lvj_com_peticiones_oracion SET estado = 'rechazado', updated_at = NOW() WHERE id = :id AND deleted_at IS NULL");
    } elseif ($action === 'respondida') {
      $stmt = $pdo->prepare("UPDATE lvj_com_peticiones_oracion SET estado = 'respondida', updated_at = NOW() WHERE id = :id AND deleted_at IS NULL");
    } elseif ($action === 'eliminar') {
      $stmt = $pdo->prepare("UPDATE lvj_com_peticiones_oracion SET deleted_at = NOW(), updated_at = NOW() WHERE id = :id AND deleted_at IS NULL");
    } elseif (in_array($action, ['destacada', 'es_urgente', 'mostrar_overlay'], true)) {
      $stmt = $pdo->prepare("UPDATE lvj_com_peticiones_oracion SET {$action} = CASE WHEN {$action} = 1 THEN 0 ELSE 1 END, updated_at = NOW() WHERE id = :id AND deleted_at IS NULL");
    } else {
      throw new RuntimeException('Acción no permitida.');
    }

    $stmt->execute(['id' => $id]);
    log_activity($action, 'lvj_com_peticiones_oracion', (int) $id, 'Moderación de intención de oración');
    $message = 'La intención fue actualizada correctamente.';
  } catch (Throwable $actionError) {
    $error = 'No fue posible actualizar la intención.';
  }
}

$page = max(1, (int) ($_GET['page'] ?? 1));
$limit = 20;
$offset = ($page - 1) * $limit;
$count = $pdo->prepare("SELECT COUNT(*) FROM lvj_com_peticiones_oracion WHERE estado = :estado AND deleted_at IS NULL");
$count->execute(['estado' => $state]);
$total = (int) $count->fetchColumn();
$pages = max(1, (int) ceil($total / $limit));

$list = $pdo->prepare("
  SELECT id, nombre, ciudad, peticion, categoria, estado, total_oraciones,
         es_urgente, destacada, mostrar_overlay, created_at, fecha_publicacion
  FROM lvj_com_peticiones_oracion
  WHERE estado = :estado AND deleted_at IS NULL
  ORDER BY created_at DESC, id DESC
  LIMIT :limit OFFSET :offset
");
$list->bindValue(':estado', $state);
$list->bindValue(':limit', $limit, PDO::PARAM_INT);
$list->bindValue(':offset', $offset, PDO::PARAM_INT);
$list->execute();
$rows = $list->fetchAll();

$pageTitle = 'Intenciones de oración';
require __DIR__ . '/includes/header.php';
?>

<section class="page-heading">
  <div>
    <span class="eyebrow">Comunidad</span>
    <h1>Intenciones de oración</h1>
    <p>Revisa y modera las intenciones depositadas por la comunidad.</p>
  </div>
</section>

<?php if ($message): ?><div class="alert success"><?php echo e($message); ?></div><?php endif; ?>
<?php if ($error): ?><div class="alert error"><?php echo e($error); ?></div><?php endif; ?>

<section class="content-toolbar">
  <div class="content-tabs">
    <?php foreach ($allowedStates as $filter): ?>
      <a class="<?php echo $filter === $state ? 'active' : ''; ?>" href="intenciones.php?estado=<?php echo e($filter); ?>"><?php echo e(ucfirst($filter)); ?></a>
    <?php endforeach; ?>
  </div>
</section>

<section class="panel-card">
  <div class="table-wrap">
    <table>
      <thead><tr><th>Intención</th><th>Categoría</th><th>Oraciones</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr></thead>
      <tbody>
      <?php if (!$rows): ?>
        <tr><td colspan="6">No hay intenciones en este estado.</td></tr>
      <?php endif; ?>
      <?php foreach ($rows as $row): ?>
        <tr>
          <td><strong><?php echo e((string) ($row['nombre'] ?: 'Anónimo')); ?></strong><?php echo $row['ciudad'] ? ' · ' . e((string) $row['ciudad']) : ''; ?><br><span class="muted"><?php echo e((string) $row['peticion']); ?></span></td>
          <td><?php echo e((string) $row['categoria']); ?></td>
          <td><?php echo (int) $row['total_oraciones']; ?></td>
          <td><?php echo e((string) $row['estado']); ?><br><?php if ($row['es_urgente']): ?><small>Urgente</small> <?php endif; ?><?php if ($row['destacada']): ?><small>Destacada</small> <?php endif; ?><?php if ($row['mostrar_overlay']): ?><small>Overlay</small><?php endif; ?></td>
          <td><?php echo e((string) ($row['fecha_publicacion'] ?: $row['created_at'])); ?></td>
          <td class="table-actions">
            <?php foreach ([
              'aprobar' => 'Aprobar', 'rechazar' => 'Rechazar', 'destacada' => 'Destacar',
              'es_urgente' => 'Urgente', 'mostrar_overlay' => 'Overlay', 'respondida' => 'Respondida',
            ] as $action => $label): ?>
              <form method="post">
                <?php echo csrf_field(); ?><input type="hidden" name="id" value="<?php echo (int) $row['id']; ?>"><input type="hidden" name="action" value="<?php echo e($action); ?>">
                <button class="action-button" type="submit"><?php echo e($label); ?></button>
              </form>
            <?php endforeach; ?>
            <form method="post" onsubmit="return confirm('¿Eliminar lógicamente esta intención?');">
              <?php echo csrf_field(); ?><input type="hidden" name="id" value="<?php echo (int) $row['id']; ?>"><input type="hidden" name="action" value="eliminar">
              <button class="action-button action-delete danger-action" type="submit">Eliminar</button>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  <?php if ($pages > 1): ?>
    <div class="pagination">
      <?php for ($number = 1; $number <= $pages; $number++): ?><a class="<?php echo $number === $page ? 'active' : ''; ?>" href="intenciones.php?estado=<?php echo e($state); ?>&amp;page=<?php echo $number; ?>"><?php echo $number; ?></a><?php endfor; ?>
    </div>
  <?php endif; ?>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>

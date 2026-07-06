<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();
$logs = $pdo->query("
  SELECT l.*, u.email
  FROM lvj_file_logs l
  LEFT JOIN lvj_file_users u ON u.id = l.user_id
  ORDER BY l.created_at DESC
  LIMIT 120
")->fetchAll();

include __DIR__ . '/includes/header.php';
include __DIR__ . '/includes/sidebar.php';
?>

<main class="main">
  <section class="topbar">
    <button class="menu-toggle" data-toggle-sidebar type="button">Menu</button>
    <div>
      <h1>Actividad</h1>
      <p>Registro de acciones del administrador de archivos.</p>
    </div>
  </section>

  <section class="panel">
    <div class="panel-header">
      <h2>Logs recientes</h2>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Accion</th>
            <th>Entidad</th>
            <th>Detalle</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($logs as $log): ?>
            <tr>
              <td><?php echo e($log['created_at']); ?></td>
              <td><?php echo e($log['email'] ?: 'Sistema'); ?></td>
              <td><span class="badge"><?php echo e($log['action']); ?></span></td>
              <td><?php echo e($log['entity_type']); ?> #<?php echo e((string) ($log['entity_id'] ?? '')); ?></td>
              <td><?php echo e((string) ($log['details'] ?? '')); ?></td>
              <td><?php echo e((string) ($log['ip'] ?? '')); ?></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </section>
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>

<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();
$message = '';
$error = '';
$editing = null;

function bib_map_table_exists(PDO $pdo): bool
{
  try {
    $pdo->query('SELECT 1 FROM lvj_bib_mapas LIMIT 1');
    return true;
  } catch (Throwable $error) {
    return false;
  }
}

function bib_map_clean_url(string $value): string
{
  $value = trim($value);
  if ($value === '') return '';
  if (!filter_var($value, FILTER_VALIDATE_URL) || !preg_match('#^https?://#i', $value)) {
    throw new RuntimeException('La URL ingresada no es válida.');
  }
  return $value;
}

$tableReady = bib_map_table_exists($pdo);

if ($tableReady && $_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf();
  try {
    $action = (string) ($_POST['action'] ?? 'guardar');
    $id = max(0, (int) ($_POST['id'] ?? 0));

    if ($action === 'estado') {
      $stmt = $pdo->prepare('UPDATE lvj_bib_mapas SET estado = IF(estado = 1, 0, 1), updated_at = NOW() WHERE id = :id AND deleted_at IS NULL');
      $stmt->execute(['id' => $id]);
      if ($stmt->rowCount() !== 1) throw new RuntimeException('El mapa no fue encontrado.');
      log_activity('estado', 'lvj_bib_mapas', $id, 'Cambio de publicación del mapa');
      $message = 'Estado del mapa actualizado.';
    } elseif ($action === 'eliminar') {
      $stmt = $pdo->prepare('UPDATE lvj_bib_mapas SET estado = 0, deleted_at = NOW(), updated_at = NOW() WHERE id = :id AND deleted_at IS NULL');
      $stmt->execute(['id' => $id]);
      if ($stmt->rowCount() !== 1) throw new RuntimeException('El mapa no fue encontrado.');
      log_activity('eliminar', 'lvj_bib_mapas', $id, 'Eliminación lógica del mapa');
      $message = 'Mapa archivado correctamente.';
    } elseif ($action === 'guardar') {
      $title = trim((string) ($_POST['titulo'] ?? ''));
      if ($title === '' || mb_strlen($title) > 150) {
        throw new RuntimeException('Escribe un título de máximo 150 caracteres.');
      }

      $imageUrl = bib_map_clean_url((string) ($_POST['imagen_url'] ?? ''));
      if ($imageUrl === '') throw new RuntimeException('Indica la URL pública de la imagen.');

      $values = [
        'titulo' => $title,
        'descripcion' => trim((string) ($_POST['descripcion'] ?? '')),
        'periodo' => trim((string) ($_POST['periodo'] ?? '')),
        'imagen_url' => $imageUrl,
        'fuente' => trim((string) ($_POST['fuente'] ?? '')),
        'fuente_url' => bib_map_clean_url((string) ($_POST['fuente_url'] ?? '')),
        'licencia' => trim((string) ($_POST['licencia'] ?? '')),
        'orden' => max(0, (int) ($_POST['orden'] ?? 0)),
        'estado' => isset($_POST['estado']) ? 1 : 0,
      ];

      if ($values['fuente'] === '' || $values['licencia'] === '') {
        throw new RuntimeException('La fuente y la licencia son obligatorias.');
      }

      if ($id > 0) {
        $values['id'] = $id;
        $stmt = $pdo->prepare('UPDATE lvj_bib_mapas SET titulo=:titulo, descripcion=:descripcion, periodo=:periodo, imagen_url=:imagen_url, fuente=:fuente, fuente_url=:fuente_url, licencia=:licencia, orden=:orden, estado=:estado, updated_at=NOW() WHERE id=:id AND deleted_at IS NULL');
        $stmt->execute($values);
        if ($stmt->rowCount() === 0) {
          $exists = $pdo->prepare('SELECT id FROM lvj_bib_mapas WHERE id=:id AND deleted_at IS NULL');
          $exists->execute(['id' => $id]);
          if (!$exists->fetchColumn()) throw new RuntimeException('El mapa no fue encontrado.');
        }
        log_activity('editar', 'lvj_bib_mapas', $id, $title);
        $message = 'Mapa actualizado correctamente.';
      } else {
        $stmt = $pdo->prepare('INSERT INTO lvj_bib_mapas (titulo,descripcion,periodo,imagen_url,fuente,fuente_url,licencia,orden,estado) VALUES (:titulo,:descripcion,:periodo,:imagen_url,:fuente,:fuente_url,:licencia,:orden,:estado)');
        $stmt->execute($values);
        $id = (int) $pdo->lastInsertId();
        log_activity('crear', 'lvj_bib_mapas', $id, $title);
        $message = 'Mapa creado correctamente.';
      }
    } else {
      throw new RuntimeException('Acción no permitida.');
    }
  } catch (Throwable $exception) {
    $error = $exception->getMessage();
  }
}

if ($tableReady && isset($_GET['editar'])) {
  $stmt = $pdo->prepare('SELECT * FROM lvj_bib_mapas WHERE id = :id AND deleted_at IS NULL LIMIT 1');
  $stmt->execute(['id' => max(0, (int) $_GET['editar'])]);
  $editing = $stmt->fetch() ?: null;
}

$maps = $tableReady
  ? $pdo->query('SELECT * FROM lvj_bib_mapas WHERE deleted_at IS NULL ORDER BY orden ASC, id DESC')->fetchAll()
  : [];

$pageTitle = 'Mapas bíblicos';
$pageSubtitle = 'Galería de Biblia > Explorar > Mapas';
require __DIR__ . '/includes/header.php';
?>

<?php if (!$tableReady): ?>
  <div class="alert alert-error">Primero ejecuta la migración <strong>2026-07-15-add-biblia-mapas.sql</strong> en la base de datos.</div>
<?php else: ?>
  <?php if ($message): ?><div class="alert alert-success"><?php echo e($message); ?></div><?php endif; ?>
  <?php if ($error): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>

  <section class="panel">
    <div class="panel-header">
      <div>
        <h2><?php echo $editing ? 'Editar mapa' : 'Agregar mapa'; ?></h2>
        <p class="muted">La fuente y la licencia siempre deben acompañar la imagen.</p>
      </div>
      <?php if ($editing): ?><a class="btn btn-soft" href="biblia-mapas.php">Cancelar edición</a><?php endif; ?>
    </div>

    <form method="post" class="form-grid bible-map-form">
      <?php echo csrf_field(); ?>
      <input type="hidden" name="action" value="guardar">
      <input type="hidden" name="id" value="<?php echo (int) ($editing['id'] ?? 0); ?>">

      <label>Título
        <input type="text" name="titulo" maxlength="150" required value="<?php echo e($editing['titulo'] ?? ''); ?>" placeholder="Palestina en tiempos de Jesús">
      </label>
      <label>Periodo
        <input type="text" name="periodo" maxlength="100" value="<?php echo e($editing['periodo'] ?? ''); ?>" placeholder="Nuevo Testamento">
      </label>
      <label class="form-span-2">Descripción
        <textarea name="descripcion" rows="3" placeholder="Resumen breve del territorio o recorrido representado."><?php echo e($editing['descripcion'] ?? ''); ?></textarea>
      </label>
      <label class="form-span-2">URL pública de la imagen
        <input type="url" name="imagen_url" required value="<?php echo e($editing['imagen_url'] ?? ''); ?>" placeholder="https://servidor-o-cdn.com/mapa.webp">
      </label>
      <label>Fuente
        <input type="text" name="fuente" maxlength="200" required value="<?php echo e($editing['fuente'] ?? ''); ?>" placeholder="Wikimedia Commons">
      </label>
      <label>Enlace de la fuente
        <input type="url" name="fuente_url" value="<?php echo e($editing['fuente_url'] ?? ''); ?>" placeholder="https://commons.wikimedia.org/..."></label>
      <label>Licencia
        <input type="text" name="licencia" maxlength="120" required value="<?php echo e($editing['licencia'] ?? ''); ?>" placeholder="CC BY-SA 4.0">
      </label>
      <label>Orden
        <input type="number" name="orden" min="0" value="<?php echo (int) ($editing['orden'] ?? 0); ?>">
      </label>
      <label class="checkbox-row"><input type="checkbox" name="estado" value="1" <?php echo !isset($editing['estado']) || (int) $editing['estado'] === 1 ? 'checked' : ''; ?>> Publicado</label>
      <div><button class="btn btn-gold" type="submit"><?php echo $editing ? 'Guardar cambios' : 'Agregar mapa'; ?></button></div>
    </form>
  </section>

  <section class="panel">
    <div class="panel-header"><div><h2>Mapas registrados</h2><p class="muted"><?php echo count($maps); ?> registros</p></div></div>
    <div class="table-wrap">
      <table class="admin-grid-table bible-map-table">
        <thead><tr><th>Mapa</th><th>Periodo</th><th>Fuente / licencia</th><th>Orden</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
        <?php if (!$maps): ?>
          <tr><td colspan="6">Todavía no hay mapas registrados.</td></tr>
        <?php endif; ?>
        <?php foreach ($maps as $map): ?>
          <tr>
            <td><div class="bible-map-admin-title"><img src="<?php echo e($map['imagen_url']); ?>" alt=""><div><strong><?php echo e($map['titulo']); ?></strong><small><?php echo e(mb_strimwidth((string) $map['descripcion'], 0, 100, '…')); ?></small></div></div></td>
            <td><?php echo e($map['periodo']); ?></td>
            <td><?php echo e($map['fuente']); ?><small><?php echo e($map['licencia']); ?></small></td>
            <td><?php echo (int) $map['orden']; ?></td>
            <td><span class="status-pill <?php echo (int) $map['estado'] === 1 ? 'status-active' : 'status-inactive'; ?>"><?php echo (int) $map['estado'] === 1 ? 'Publicado' : 'Oculto'; ?></span></td>
            <td><div class="actions">
              <a href="biblia-mapas.php?editar=<?php echo (int) $map['id']; ?>">Editar</a>
              <form method="post"><?php echo csrf_field(); ?><input type="hidden" name="action" value="estado"><input type="hidden" name="id" value="<?php echo (int) $map['id']; ?>"><button type="submit"><?php echo (int) $map['estado'] === 1 ? 'Ocultar' : 'Publicar'; ?></button></form>
              <form method="post" onsubmit="return confirm('¿Archivar este mapa?');"><?php echo csrf_field(); ?><input type="hidden" name="action" value="eliminar"><input type="hidden" name="id" value="<?php echo (int) $map['id']; ?>"><button class="danger-action" type="submit">Archivar</button></form>
            </div></td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </section>
<?php endif; ?>

<?php require __DIR__ . '/includes/footer.php'; ?>

<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();
$message = '';
$error = '';
$editing = null;
$categories = ['Mesías', 'Patriarca', 'Matriarca', 'Profeta', 'Rey', 'Juez', 'Apóstol', 'Discípulo', 'Mujer bíblica', 'Sacerdote', 'Evangelista', 'Otro'];

function bib_character_table_exists(PDO $pdo): bool
{
  try {
    $pdo->query('SELECT 1 FROM lvj_bib_personajes LIMIT 1');
    return true;
  } catch (Throwable $error) {
    return false;
  }
}

function bib_character_url(string $value): string
{
  $value = trim($value);
  if ($value === '') return '';
  if (!filter_var($value, FILTER_VALIDATE_URL) || !preg_match('#^https?://#i', $value)) {
    throw new RuntimeException('La URL ingresada no es válida.');
  }
  return $value;
}

$tableReady = bib_character_table_exists($pdo);

if ($tableReady && $_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf();
  try {
    $action = (string) ($_POST['action'] ?? 'guardar');
    $id = max(0, (int) ($_POST['id'] ?? 0));

    if ($action === 'estado') {
      $stmt = $pdo->prepare('UPDATE lvj_bib_personajes SET estado=IF(estado=1,0,1), updated_at=NOW() WHERE id=:id AND deleted_at IS NULL');
      $stmt->execute(['id' => $id]);
      if ($stmt->rowCount() !== 1) throw new RuntimeException('El personaje no fue encontrado.');
      log_activity('estado', 'lvj_bib_personajes', $id, 'Cambio de publicación del personaje');
      $message = 'Estado del personaje actualizado.';
    } elseif ($action === 'eliminar') {
      $stmt = $pdo->prepare('UPDATE lvj_bib_personajes SET estado=0, deleted_at=NOW(), updated_at=NOW() WHERE id=:id AND deleted_at IS NULL');
      $stmt->execute(['id' => $id]);
      if ($stmt->rowCount() !== 1) throw new RuntimeException('El personaje no fue encontrado.');
      log_activity('eliminar', 'lvj_bib_personajes', $id, 'Eliminación lógica del personaje');
      $message = 'Personaje archivado correctamente.';
    } elseif ($action === 'guardar') {
      $name = trim((string) ($_POST['nombre'] ?? ''));
      $summary = trim((string) ($_POST['resumen'] ?? ''));
      $testament = strtoupper(trim((string) ($_POST['testamento'] ?? '')));
      $category = trim((string) ($_POST['categoria'] ?? ''));
      if ($name === '' || mb_strlen($name) > 150) throw new RuntimeException('Escribe un nombre de máximo 150 caracteres.');
      if ($summary === '') throw new RuntimeException('El resumen biográfico es obligatorio.');
      if (!in_array($testament, ['AT', 'NT'], true)) throw new RuntimeException('Selecciona un testamento válido.');
      if (!in_array($category, $categories, true)) throw new RuntimeException('Selecciona una categoría válida.');

      $values = [
        'nombre' => $name,
        'nombre_alternativo' => trim((string) ($_POST['nombre_alternativo'] ?? '')),
        'testamento' => $testament,
        'categoria' => $category,
        'resumen' => $summary,
        'pasajes_principales' => trim((string) ($_POST['pasajes_principales'] ?? '')),
        'ensenanza' => trim((string) ($_POST['ensenanza'] ?? '')),
        'imagen_url' => bib_character_url((string) ($_POST['imagen_url'] ?? '')),
        'fuente' => trim((string) ($_POST['fuente'] ?? '')),
        'fuente_url' => bib_character_url((string) ($_POST['fuente_url'] ?? '')),
        'licencia' => trim((string) ($_POST['licencia'] ?? '')),
        'orden' => max(0, (int) ($_POST['orden'] ?? 0)),
        'estado' => isset($_POST['estado']) ? 1 : 0,
      ];
      if ($values['imagen_url'] === '') throw new RuntimeException('La URL pública de la imagen es obligatoria.');
      if ($values['fuente'] === '' || $values['licencia'] === '') throw new RuntimeException('La fuente y la licencia son obligatorias.');

      if ($id > 0) {
        $values['id'] = $id;
        $stmt = $pdo->prepare('UPDATE lvj_bib_personajes SET nombre=:nombre,nombre_alternativo=:nombre_alternativo,testamento=:testamento,categoria=:categoria,resumen=:resumen,pasajes_principales=:pasajes_principales,ensenanza=:ensenanza,imagen_url=:imagen_url,fuente=:fuente,fuente_url=:fuente_url,licencia=:licencia,orden=:orden,estado=:estado,updated_at=NOW() WHERE id=:id AND deleted_at IS NULL');
        $stmt->execute($values);
        if ($stmt->rowCount() === 0) {
          $check = $pdo->prepare('SELECT id FROM lvj_bib_personajes WHERE id=:id AND deleted_at IS NULL');
          $check->execute(['id' => $id]);
          if (!$check->fetchColumn()) throw new RuntimeException('El personaje no fue encontrado.');
        }
        log_activity('editar', 'lvj_bib_personajes', $id, $name);
        $message = 'Personaje actualizado correctamente.';
      } else {
        $stmt = $pdo->prepare('INSERT INTO lvj_bib_personajes (nombre,nombre_alternativo,testamento,categoria,resumen,pasajes_principales,ensenanza,imagen_url,fuente,fuente_url,licencia,orden,estado) VALUES (:nombre,:nombre_alternativo,:testamento,:categoria,:resumen,:pasajes_principales,:ensenanza,:imagen_url,:fuente,:fuente_url,:licencia,:orden,:estado)');
        $stmt->execute($values);
        $id = (int) $pdo->lastInsertId();
        log_activity('crear', 'lvj_bib_personajes', $id, $name);
        $message = 'Personaje creado correctamente.';
      }
    } else {
      throw new RuntimeException('Acción no permitida.');
    }
  } catch (Throwable $exception) {
    $error = $exception->getMessage();
  }
}

if ($tableReady && isset($_GET['editar'])) {
  $stmt = $pdo->prepare('SELECT * FROM lvj_bib_personajes WHERE id=:id AND deleted_at IS NULL LIMIT 1');
  $stmt->execute(['id' => max(0, (int) $_GET['editar'])]);
  $editing = $stmt->fetch() ?: null;
}

$characters = $tableReady
  ? $pdo->query('SELECT * FROM lvj_bib_personajes WHERE deleted_at IS NULL ORDER BY orden ASC, id DESC')->fetchAll()
  : [];

$pageTitle = 'Personajes bíblicos';
$pageSubtitle = 'Galería de Biblia > Explorar > Personajes bíblicos';
require __DIR__ . '/includes/header.php';
?>

<?php if (!$tableReady): ?>
  <div class="alert alert-error">Primero ejecuta la migración <strong>2026-07-16-add-biblia-personajes.sql</strong> en la base de datos.</div>
<?php else: ?>
  <?php if ($message): ?><div class="alert alert-success"><?php echo e($message); ?></div><?php endif; ?>
  <?php if ($error): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>

  <section class="panel">
    <div class="panel-header">
      <div><h2><?php echo $editing ? 'Editar personaje' : 'Agregar personaje'; ?></h2><p class="muted">Registra información editorial y una imagen con licencia verificable.</p></div>
      <?php if ($editing): ?><a class="btn btn-soft" href="biblia-personajes.php">Cancelar edición</a><?php endif; ?>
    </div>
    <form method="post" class="form-grid bible-map-form">
      <?php echo csrf_field(); ?><input type="hidden" name="action" value="guardar"><input type="hidden" name="id" value="<?php echo (int) ($editing['id'] ?? 0); ?>">
      <label>Nombre<input type="text" name="nombre" maxlength="150" required value="<?php echo e($editing['nombre'] ?? ''); ?>" placeholder="Moisés"></label>
      <label>Nombre alternativo<input type="text" name="nombre_alternativo" maxlength="180" value="<?php echo e($editing['nombre_alternativo'] ?? ''); ?>" placeholder="Forma alternativa o significado"></label>
      <label>Testamento<select name="testamento" required><option value="AT" <?php echo ($editing['testamento'] ?? '') === 'AT' ? 'selected' : ''; ?>>Antiguo Testamento</option><option value="NT" <?php echo ($editing['testamento'] ?? '') === 'NT' ? 'selected' : ''; ?>>Nuevo Testamento</option></select></label>
      <label>Categoría<select name="categoria" required><?php foreach ($categories as $category): ?><option value="<?php echo e($category); ?>" <?php echo ($editing['categoria'] ?? '') === $category ? 'selected' : ''; ?>><?php echo e($category); ?></option><?php endforeach; ?></select></label>
      <label class="form-span-2">Resumen biográfico<textarea name="resumen" rows="5" required placeholder="Presentación clara y fiel del personaje."><?php echo e($editing['resumen'] ?? ''); ?></textarea></label>
      <label>Pasajes principales<textarea name="pasajes_principales" rows="3" placeholder="Éxodo 2–20; Deuteronomio 34"><?php echo e($editing['pasajes_principales'] ?? ''); ?></textarea></label>
      <label>Enseñanza<textarea name="ensenanza" rows="3" placeholder="Aporte espiritual y lugar en la historia de la salvación."><?php echo e($editing['ensenanza'] ?? ''); ?></textarea></label>
      <label class="form-span-2">URL pública de la imagen<input type="url" name="imagen_url" required value="<?php echo e($editing['imagen_url'] ?? ''); ?>" placeholder="https://servidor-o-cdn.com/personaje.jpg"></label>
      <label>Fuente<input type="text" name="fuente" maxlength="200" required value="<?php echo e($editing['fuente'] ?? ''); ?>" placeholder="Wikimedia Commons — autor"></label>
      <label>Enlace de la fuente<input type="url" name="fuente_url" value="<?php echo e($editing['fuente_url'] ?? ''); ?>" placeholder="https://commons.wikimedia.org/..."></label>
      <label>Licencia<input type="text" name="licencia" maxlength="120" required value="<?php echo e($editing['licencia'] ?? ''); ?>" placeholder="Dominio público o CC BY-SA 4.0"></label>
      <label>Orden<input type="number" name="orden" min="0" value="<?php echo (int) ($editing['orden'] ?? 0); ?>"></label>
      <label class="checkbox-row"><input type="checkbox" name="estado" value="1" <?php echo !isset($editing['estado']) || (int) $editing['estado'] === 1 ? 'checked' : ''; ?>> Publicado</label>
      <div><button class="btn btn-gold" type="submit"><?php echo $editing ? 'Guardar cambios' : 'Agregar personaje'; ?></button></div>
    </form>
  </section>

  <section class="panel">
    <div class="panel-header"><div><h2>Personajes registrados</h2><p class="muted"><?php echo count($characters); ?> registros</p></div></div>
    <div class="table-wrap"><table class="admin-grid-table bible-map-table"><thead><tr><th>Personaje</th><th>Clasificación</th><th>Pasajes</th><th>Orden</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
      <?php if (!$characters): ?><tr><td colspan="6">Todavía no hay personajes registrados.</td></tr><?php endif; ?>
      <?php foreach ($characters as $character): ?><tr>
        <td><div class="bible-map-admin-title"><img src="<?php echo e($character['imagen_url']); ?>" alt=""><div><strong><?php echo e($character['nombre']); ?></strong><small><?php echo e(mb_strimwidth((string) $character['resumen'], 0, 100, '…')); ?></small></div></div></td>
        <td><?php echo e($character['categoria']); ?><small><?php echo $character['testamento'] === 'AT' ? 'Antiguo Testamento' : 'Nuevo Testamento'; ?></small></td>
        <td><?php echo e(mb_strimwidth((string) $character['pasajes_principales'], 0, 80, '…')); ?></td><td><?php echo (int) $character['orden']; ?></td>
        <td><span class="status-pill <?php echo (int) $character['estado'] === 1 ? 'status-active' : 'status-inactive'; ?>"><?php echo (int) $character['estado'] === 1 ? 'Publicado' : 'Oculto'; ?></span></td>
        <td><div class="actions"><a href="biblia-personajes.php?editar=<?php echo (int) $character['id']; ?>">Editar</a><form method="post"><?php echo csrf_field(); ?><input type="hidden" name="action" value="estado"><input type="hidden" name="id" value="<?php echo (int) $character['id']; ?>"><button type="submit"><?php echo (int) $character['estado'] === 1 ? 'Ocultar' : 'Publicar'; ?></button></form><form method="post" onsubmit="return confirm('¿Archivar este personaje?');"><?php echo csrf_field(); ?><input type="hidden" name="action" value="eliminar"><input type="hidden" name="id" value="<?php echo (int) $character['id']; ?>"><button class="danger-action" type="submit">Archivar</button></form></div></td>
      </tr><?php endforeach; ?>
    </tbody></table></div>
  </section>
<?php endif; ?>

<?php require __DIR__ . '/includes/footer.php'; ?>

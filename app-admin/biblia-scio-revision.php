<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();
$message = '';
$error = '';

function scio_review_version(PDO $pdo): ?array
{
  $stmt = $pdo->query("SELECT id,nombre,codigo,estado FROM lvj_bib_versiones WHERE UPPER(codigo)='SCIO' AND deleted_at IS NULL LIMIT 1");
  $row = $stmt->fetch();
  return $row ?: null;
}

function scio_review_book(PDO $pdo, int $versionId, string $code): ?array
{
  $stmt = $pdo->prepare('SELECT id,codigo,nombre,abreviatura,testamento,orden,capitulos,estado FROM lvj_bib_libros WHERE version_id=:version AND codigo=:codigo AND deleted_at IS NULL LIMIT 1');
  $stmt->execute(['version' => $versionId, 'codigo' => strtoupper($code)]);
  $row = $stmt->fetch();
  return $row ?: null;
}

$version = scio_review_version($pdo);
$bookCode = strtoupper(trim((string) ($_POST['libro'] ?? $_GET['libro'] ?? 'GEN')));
$chapter = max(1, (int) ($_POST['capitulo'] ?? $_GET['capitulo'] ?? 1));

if ($version && $_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf();
  $action = (string) ($_POST['action'] ?? '');
  $book = scio_review_book($pdo, (int) $version['id'], $bookCode);
  try {
    if (!$book) throw new RuntimeException('El libro de Scío seleccionado no existe.');
    if ($action === 'iniciar_revision') {
      if ((int) $version['estado'] !== 0) {
        throw new RuntimeException('La inicialización solo está permitida mientras SCIO permanezca en estado 0.');
      }
      if ((string) ($_POST['confirmacion'] ?? '') !== 'INICIAR REVISION SCIO') {
        throw new RuntimeException('Escribe INICIAR REVISION SCIO para confirmar.');
      }
      $pdo->beginTransaction();
      $pdo->prepare('UPDATE lvj_bib_libros SET estado=0,updated_at=NOW() WHERE version_id=:version AND deleted_at IS NULL')->execute(['version' => $version['id']]);
      $pdo->commit();
      $message = 'La revisión de SCIO fue inicializada: los 73 libros quedaron pendientes y la versión continúa oculta.';
      log_activity('iniciar_revision', 'lvj_bib_versiones', (int) $version['id'], 'SCIO estado 0; libros reiniciados como pendientes');
    } elseif ($action === 'guardar_capitulo') {
      if ((int) $book['estado'] === 1) {
        throw new RuntimeException('El libro está marcado como revisado. Reábrelo antes de modificar el texto.');
      }
      $texts = is_array($_POST['texto'] ?? null) ? $_POST['texto'] : [];
      $current = $pdo->prepare('SELECT id FROM lvj_bib_versiculos WHERE version_id=:version AND libro_id=:libro AND capitulo=:capitulo AND deleted_at IS NULL ORDER BY versiculo');
      $current->execute(['version' => $version['id'], 'libro' => $book['id'], 'capitulo' => $chapter]);
      $allowed = array_fill_keys(array_map('intval', $current->fetchAll(PDO::FETCH_COLUMN)), true);
      if (!$allowed) throw new RuntimeException('El capítulo seleccionado no contiene versículos.');
      $update = $pdo->prepare('UPDATE lvj_bib_versiculos SET texto=:texto,updated_at=NOW() WHERE id=:id AND version_id=:version AND libro_id=:libro AND capitulo=:capitulo');
      $pdo->beginTransaction();
      $changed = 0;
      foreach ($texts as $id => $text) {
        $id = (int) $id;
        $text = trim((string) $text);
        if (!isset($allowed[$id])) throw new RuntimeException('Se recibió un versículo ajeno al capítulo.');
        if ($text === '') throw new RuntimeException('No se permiten versículos vacíos.');
        $update->execute(['texto' => $text, 'id' => $id, 'version' => $version['id'], 'libro' => $book['id'], 'capitulo' => $chapter]);
        $changed += $update->rowCount();
      }
      $pdo->commit();
      $message = "Capítulo {$chapter} guardado. {$changed} versículos modificados.";
      log_activity('revisar_capitulo', 'lvj_bib_libros', (int) $book['id'], "SCIO {$bookCode} {$chapter}: {$changed} cambios");
    } elseif ($action === 'aprobar_libro') {
      if ((string) ($_POST['confirmacion'] ?? '') !== 'APROBAR ' . $bookCode) {
        throw new RuntimeException('Escribe APROBAR ' . $bookCode . ' para confirmar.');
      }
      $audit = $pdo->prepare('SELECT COUNT(*) total,COUNT(DISTINCT capitulo) capitulos,SUM(CASE WHEN CHAR_LENGTH(TRIM(texto))=0 THEN 1 ELSE 0 END) vacios,MIN(capitulo) minimo,MAX(capitulo) maximo FROM lvj_bib_versiculos WHERE version_id=:version AND libro_id=:libro AND deleted_at IS NULL');
      $audit->execute(['version' => $version['id'], 'libro' => $book['id']]);
      $check = $audit->fetch();
      if ((int) $check['total'] < 1 || (int) $check['vacios'] > 0 || (int) $check['capitulos'] !== (int) $book['capitulos'] || (int) $check['minimo'] !== 1 || (int) $check['maximo'] !== (int) $book['capitulos']) {
        throw new RuntimeException('El libro no supera la validación de capítulos y textos completos.');
      }
      $pdo->beginTransaction();
      $pdo->prepare('UPDATE lvj_bib_libros SET estado=1,updated_at=NOW() WHERE id=:id')->execute(['id' => $book['id']]);
      $pdo->prepare('UPDATE lvj_bib_versiones SET estado=1,updated_at=NOW() WHERE id=:id')->execute(['id' => $version['id']]);
      $pdo->commit();
      $message = $book['nombre'] . ' quedó marcado como Revisado OK y ya puede utilizarse en el Estudio Bíblico.';
      log_activity('revisar_libro_ok', 'lvj_bib_libros', (int) $book['id'], 'SCIO ' . $bookCode . ' revisado OK y habilitado para consulta');
    } elseif ($action === 'reabrir_libro') {
      if ((string) ($_POST['confirmacion'] ?? '') !== 'REABRIR ' . $bookCode) {
        throw new RuntimeException('Escribe REABRIR ' . $bookCode . ' para confirmar.');
      }
      $pdo->beginTransaction();
      $pdo->prepare('UPDATE lvj_bib_libros SET estado=0,updated_at=NOW() WHERE id=:id')->execute(['id' => $book['id']]);
      $pdo->commit();
      $message = $book['nombre'] . ' volvió a revisión.';
      log_activity('reabrir_libro', 'lvj_bib_libros', (int) $book['id'], 'SCIO ' . $bookCode . ' reabierto');
    } else {
      throw new RuntimeException('Acción de revisión no permitida.');
    }
  } catch (Throwable $exception) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    $error = $exception->getMessage();
  }
  $version = scio_review_version($pdo);
}

$books = [];
$selectedBook = null;
$verses = [];
$referenceVerses = [];
$summary = ['total' => 0, 'approved' => 0, 'pending' => 0];
if ($version) {
  $stmt = $pdo->prepare('SELECT l.id,l.codigo,l.nombre,l.abreviatura,l.testamento,l.orden,l.capitulos,l.estado,COUNT(v.id) versiculos,COUNT(DISTINCT v.capitulo) capitulos_cargados FROM lvj_bib_libros l LEFT JOIN lvj_bib_versiculos v ON v.libro_id=l.id AND v.version_id=l.version_id AND v.deleted_at IS NULL WHERE l.version_id=:version AND l.deleted_at IS NULL GROUP BY l.id ORDER BY l.orden');
  $stmt->execute(['version' => $version['id']]);
  $books = $stmt->fetchAll();
  $available = array_column($books, 'codigo');
  if (!in_array($bookCode, $available, true)) $bookCode = (string) ($books[0]['codigo'] ?? '');
  foreach ($books as $row) {
    $isApproved = (int) $row['estado'] === 1;
    $summary['total']++;
    $summary[$isApproved ? 'approved' : 'pending']++;
    if ($row['codigo'] === $bookCode) {
      $row['aprobado'] = $isApproved;
      $selectedBook = $row;
    }
  }
  if ($selectedBook) {
    $chapter = min(max(1, $chapter), (int) $selectedBook['capitulos']);
    $stmt = $pdo->prepare('SELECT id,versiculo,texto,titulo_seccion FROM lvj_bib_versiculos WHERE version_id=:version AND libro_id=:libro AND capitulo=:capitulo AND deleted_at IS NULL ORDER BY versiculo');
    $stmt->execute(['version' => $version['id'], 'libro' => $selectedBook['id'], 'capitulo' => $chapter]);
    $verses = $stmt->fetchAll();
    $reference = $pdo->prepare("SELECT v.versiculo,v.texto FROM lvj_bib_versiculos v INNER JOIN lvj_bib_versiones ver ON ver.id=v.version_id AND ver.codigo='SPAPLATENSE' AND ver.estado=1 AND ver.deleted_at IS NULL INNER JOIN lvj_bib_libros l ON l.id=v.libro_id AND l.codigo=:codigo AND l.estado=1 AND l.deleted_at IS NULL WHERE v.capitulo=:capitulo AND v.estado=1 AND v.deleted_at IS NULL ORDER BY v.versiculo");
    $reference->execute(['codigo' => $bookCode, 'capitulo' => $chapter]);
    foreach ($reference->fetchAll() as $row) $referenceVerses[(int) $row['versiculo']] = (string) $row['texto'];
  }
}

$pageTitle = 'Revisión Biblia Scío';
$pageSubtitle = 'Verificación editorial individual por libros';
require __DIR__ . '/includes/header.php';
?>
<section class="page-heading">
  <div><span class="eyebrow">Mantenimiento bíblico</span><h1>Revisión de la Biblia Scío</h1><p>Compara, corrige y marca cada libro como Revisado OK. Scío permanece oculta durante todo el proceso.</p></div>
  <div class="form-actions"><a class="btn btn-soft" href="biblia-equivalencias.php">Volver a equivalencias</a></div>
</section>
<?php if ($message): ?><div class="alert success"><?php echo e($message); ?></div><?php endif; ?>
<?php if ($error): ?><div class="alert error"><?php echo e($error); ?></div><?php endif; ?>
<?php if (!$version): ?>
  <div class="alert error">SCIO todavía no está importada. Primero utiliza <a href="biblia-importar.php?version=scio">Importar / Subir Biblias</a>.</div>
<?php else: ?>
  <section class="stats-grid">
    <article class="stat-card"><span>Libros cargados</span><strong><?php echo $summary['total']; ?></strong></article>
    <article class="stat-card"><span>Revisados OK</span><strong><?php echo $summary['approved']; ?></strong></article>
    <article class="stat-card"><span>Pendientes</span><strong><?php echo $summary['pending']; ?></strong></article>
  </section>
  <?php if ((int) $version['estado'] === 0 && $summary['approved'] === $summary['total'] && $summary['total'] > 0): ?>
    <section class="panel-card">
      <h2>Inicializar revisión de la importación existente</h2>
      <p class="muted">Utiliza esta acción una sola vez si los 73 libros aparecen como OK inmediatamente después de importar. No modifica versículos; solamente coloca los libros en estado Pendiente. SCIO continúa con estado 0.</p>
      <form method="post">
        <?php echo csrf_field(); ?><input type="hidden" name="action" value="iniciar_revision"><input type="hidden" name="libro" value="<?php echo e($bookCode); ?>"><input type="hidden" name="capitulo" value="<?php echo $chapter; ?>">
        <label><span>Confirmación</span><input name="confirmacion" required placeholder="INICIAR REVISION SCIO"></label>
        <button class="btn btn-gold" type="submit">Inicializar los 73 libros como pendientes</button>
      </form>
    </section>
  <?php endif; ?>  <section class="panel-card">
    <div class="panel-header"><div><h2>Progreso por libros</h2><p class="muted">Dorado: Revisado OK. Pendiente: requiere comprobación.</p></div></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px">
      <?php foreach ($books as $book): $approved = (int) $book['estado'] === 1; ?>
        <a class="btn <?php echo $approved ? 'btn-gold' : 'btn-soft'; ?>" href="?libro=<?php echo e((string) $book['codigo']); ?>&amp;capitulo=1"><?php echo e((string) $book['abreviatura']); ?> · <?php echo $approved ? 'OK' : 'Pendiente'; ?></a>
      <?php endforeach; ?>
    </div>
  </section>
  <?php if ($selectedBook): ?>
    <section class="panel-card">
      <div class="panel-header"><div><h2><?php echo e((string) $selectedBook['nombre']); ?></h2><p class="muted"><?php echo (int) $selectedBook['capitulos_cargados']; ?>/<?php echo (int) $selectedBook['capitulos']; ?> capítulos · <?php echo (int) $selectedBook['versiculos']; ?> versículos · <?php echo $selectedBook['aprobado'] ? 'Revisado OK' : 'En revisión'; ?></p></div></div>
      <div class="content-tabs">
        <?php for ($number=1; $number <= (int) $selectedBook['capitulos']; $number++): ?><a class="<?php echo $number === $chapter ? 'active' : ''; ?>" href="?libro=<?php echo e($bookCode); ?>&amp;capitulo=<?php echo $number; ?>"><?php echo $number; ?></a><?php endfor; ?>
      </div>
    </section>
    <form method="post" class="panel-card">
      <?php echo csrf_field(); ?><input type="hidden" name="action" value="guardar_capitulo"><input type="hidden" name="libro" value="<?php echo e($bookCode); ?>"><input type="hidden" name="capitulo" value="<?php echo $chapter; ?>">
      <div class="panel-header"><div><h2>Capítulo <?php echo $chapter; ?></h2><p class="muted">Scío editable a la izquierda; SpaPlatense como referencia a la derecha.</p></div><button class="btn btn-gold" type="submit" <?php echo $selectedBook['aprobado'] ? 'disabled' : ''; ?>>Guardar capítulo</button></div>
      <div class="table-wrap"><table><thead><tr><th style="width:56px">V.</th><th>Scío</th><th>SpaPlatense (referencia)</th></tr></thead><tbody>
      <?php foreach ($verses as $verse): ?><tr><td><?php echo (int) $verse['versiculo']; ?></td><td><textarea name="texto[<?php echo (int) $verse['id']; ?>]" rows="4" style="width:100%" <?php echo $selectedBook['aprobado'] ? 'readonly' : ''; ?>><?php echo e((string) $verse['texto']); ?></textarea></td><td><?php echo e((string) ($referenceVerses[(int) $verse['versiculo']] ?? '—')); ?></td></tr><?php endforeach; ?>
      </tbody></table></div>
    </form>
    <section class="panel-card">
      <h2><?php echo $selectedBook['aprobado'] ? 'Reabrir libro' : 'Aprobar libro completo'; ?></h2>
      <?php if ($selectedBook['aprobado']): ?>
        <p class="muted">Al reabrirlo volverá al estado pendiente para permitir nuevas correcciones.</p>
        <form method="post"><?php echo csrf_field(); ?><input type="hidden" name="action" value="reabrir_libro"><input type="hidden" name="libro" value="<?php echo e($bookCode); ?>"><input type="hidden" name="capitulo" value="<?php echo $chapter; ?>"><label><span>Confirmación</span><input name="confirmacion" required placeholder="REABRIR <?php echo e($bookCode); ?>"></label><button class="btn btn-soft" type="submit">Reabrir libro</button></form>
      <?php else: ?>
        <p class="muted">Confirma únicamente después de revisar todos los capítulos. Este OK es editorial y no publica Scío en la aplicación.</p>
        <form method="post"><?php echo csrf_field(); ?><input type="hidden" name="action" value="aprobar_libro"><input type="hidden" name="libro" value="<?php echo e($bookCode); ?>"><input type="hidden" name="capitulo" value="<?php echo $chapter; ?>"><label><span>Confirmación</span><input name="confirmacion" required placeholder="APROBAR <?php echo e($bookCode); ?>"></label><button class="btn btn-gold" type="submit">Marcar libro Revisado OK</button></form>
      <?php endif; ?>
    </section>
  <?php endif; ?>
<?php endif; ?>
<?php require __DIR__ . '/includes/footer.php'; ?>

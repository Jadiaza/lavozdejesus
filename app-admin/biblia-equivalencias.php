<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/biblia-equivalencias.php';
require_login();

$pdo = lvj_files_db();
$message = '';
$error = '';
$result = null;
$preview = null;
$versions = [];
$books = [];
$sourceCode = strtoupper(trim((string) ($_POST['version_origen'] ?? $_GET['version_origen'] ?? 'SPAPLATENSE')));
$targetCode = strtoupper(trim((string) ($_POST['version_destino'] ?? $_GET['version_destino'] ?? 'TORRESAMAT')));
$bookCode = strtoupper(trim((string) ($_POST['libro'] ?? $_GET['libro'] ?? 'PSA')));

try {
  $versions = bib_equiv_versions($pdo);
  if (count($versions) < 2) throw new RuntimeException('Se requieren al menos dos versiones bíblicas activas.');
  $availableCodes = array_column($versions, 'codigo');
  if (!in_array($sourceCode, $availableCodes, true)) $sourceCode = (string) $versions[0]['codigo'];
  if (!in_array($targetCode, $availableCodes, true) || $targetCode === $sourceCode) {
    $targetCode = (string) ($versions[1]['codigo'] ?? $versions[0]['codigo']);
  }
  $source = bib_equiv_version($pdo, $sourceCode);
  $target = bib_equiv_version($pdo, $targetCode);
  $books = bib_equiv_common_books($pdo, (int) $source['id'], (int) $target['id']);
  $availableBooks = array_column($books, 'codigo');
  if (!in_array($bookCode, $availableBooks, true)) $bookCode = (string) ($books[0]['codigo'] ?? '');

  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    if ((string) ($_POST['action'] ?? '') !== 'generar') throw new RuntimeException('Acción no permitida.');
    if (bib_equiv_requires_source_audit($bookCode)) {
      throw new RuntimeException("$bookCode está en auditoría de fuente. No se crearán equivalencias nuevas hasta verificar la segmentación de la versión comparativa seleccionada.");
    }
    $result = bib_equiv_generate($pdo, $sourceCode, $targetCode, $bookCode);
    log_activity(
      'generar_equivalencias',
      'lvj_bib_unidades_canonicas',
      null,
      sprintf('%s → %s, libro %s, %d propuestas', $sourceCode, $targetCode, $bookCode, $result['processed'])
    );
    $message = sprintf(
      'Lote generado: %d propuestas procesadas, %d unidades nuevas y %d relaciones nuevas.',
      $result['processed'], $result['units_created'], $result['relations_created']
    );
  }
  if ($bookCode !== '') $preview = bib_equiv_candidates($pdo, $sourceCode, $targetCode, $bookCode);
} catch (Throwable $exception) {
  $error = $exception->getMessage();
}

$pendingUnits = 0;
$pendingRelations = 0;
try {
  $pendingUnits = (int) $pdo->query("SELECT COUNT(*) FROM lvj_bib_unidades_canonicas WHERE estado_revision='pendiente' AND deleted_at IS NULL")->fetchColumn();
  $pendingRelations = (int) $pdo->query("SELECT COUNT(*) FROM lvj_bib_unidades_versiculos WHERE estado_revision='pendiente' AND deleted_at IS NULL")->fetchColumn();
} catch (Throwable $ignored) {
}

$pageTitle = 'Equivalencias bíblicas';
$pageSubtitle = 'Generador de propuestas canónicas';
require __DIR__ . '/includes/header.php';
?>
<section class="page-heading">
  <div>
    <span class="eyebrow">Biblia</span>
    <h1>Generador de equivalencias</h1>
    <p>Propone correspondencias estructurales entre versiones. Ningún registro se aprueba automáticamente.</p>
  </div>
  <div class="form-actions"><a class="btn btn-soft" href="biblia-scio-revision.php">Revisar Scío por libros</a><a class="btn btn-soft" href="biblia-equivalencias-auditar.php?version_origen=<?php echo e($sourceCode); ?>&amp;version_destino=<?php echo e($targetCode); ?>&amp;libro=<?php echo e($bookCode); ?>">Auditar libro completo</a><a class="btn btn-gold" href="biblia-equivalencias-revisar.php">Revisar equivalencias</a></div>
</section>

<?php if ($message): ?><div class="alert success"><?php echo e($message); ?></div><?php endif; ?>
<?php if ($error): ?><div class="alert error"><?php echo e($error); ?></div><?php endif; ?>

<section class="stats-grid">
  <article class="stat-card"><span>Unidades pendientes</span><strong><?php echo $pendingUnits; ?></strong></article>
  <article class="stat-card"><span>Relaciones pendientes</span><strong><?php echo $pendingRelations; ?></strong></article>
  <article class="stat-card"><span>Límite por lote</span><strong><?php echo BIB_EQUIV_BATCH_LIMIT; ?></strong></article>
</section>

<section class="panel-card">
  <div class="panel-header">
    <div><h2>Preparar lote</h2><p class="muted">Selecciona dos versiones y procesa un libro por vez.</p></div>
  </div>
  <form method="get" class="form-grid">
    <label>Versión principal
      <select name="version_origen" required>
        <?php foreach ($versions as $version): ?>
          <option value="<?php echo e((string) $version['codigo']); ?>" <?php echo $sourceCode === $version['codigo'] ? 'selected' : ''; ?>>
            <?php echo e((string) $version['nombre']); ?> · <?php echo e((string) $version['versificacion']); ?>
          </option>
        <?php endforeach; ?>
      </select>
    </label>
    <label>Versión comparativa
      <select name="version_destino" required>
        <?php foreach ($versions as $version): ?>
          <option value="<?php echo e((string) $version['codigo']); ?>" <?php echo $targetCode === $version['codigo'] ? 'selected' : ''; ?>>
            <?php echo e((string) $version['nombre']); ?> · <?php echo e((string) $version['versificacion']); ?>
          </option>
        <?php endforeach; ?>
      </select>
    </label>
    <label>Libro
      <select name="libro" required>
        <?php foreach ($books as $book): ?>
          <option value="<?php echo e((string) $book['codigo']); ?>" <?php echo $bookCode === $book['codigo'] ? 'selected' : ''; ?>>
            <?php echo e((string) $book['nombre']); ?> (<?php echo (int) $book['capitulos_origen']; ?>/<?php echo (int) $book['capitulos_destino']; ?> capítulos)
          </option>
        <?php endforeach; ?>
      </select>
    </label>
    <div class="form-actions"><button class="btn btn-gold" type="submit">Analizar</button></div>
  </form>
</section>

<?php if ($preview): ?>
  <?php if (bib_equiv_requires_source_audit($bookCode)): ?>
    <div class="alert error"><strong>Libro en auditoría de fuente.</strong> Se muestran los datos para diagnóstico, pero la generación está bloqueada porque puede haber versículos concatenados durante la importación. No apruebes equivalencias de este libro hasta completar la revisión.</div>
  <?php endif; ?>
  <section class="panel-card">
    <div class="panel-header">
      <div>
        <h2><?php echo e((string) $preview['book']['nombre']); ?></h2>
        <p class="muted">
          <?php echo e((string) $preview['source']['codigo']); ?> → <?php echo e((string) $preview['target']['codigo']); ?>
        </p>
      </div>
    </div>
    <div class="stats-grid">
      <article class="stat-card"><span>Capítulos compatibles</span><strong><?php echo (int) $preview['eligible_chapters']; ?></strong></article>
      <article class="stat-card"><span>Propuestas restantes</span><strong><?php echo count($preview['candidates']); ?></strong></article>
      <article class="stat-card"><span>Capítulos ambiguos</span><strong><?php echo count($preview['ambiguous']); ?></strong></article>
    </div>

    <?php if ($preview['candidates'] && !bib_equiv_requires_source_audit($bookCode)): ?>
      <form method="post" class="form-actions">
        <?php echo csrf_field(); ?>
        <input type="hidden" name="action" value="generar">
        <input type="hidden" name="version_origen" value="<?php echo e($sourceCode); ?>">
        <input type="hidden" name="version_destino" value="<?php echo e($targetCode); ?>">
        <input type="hidden" name="libro" value="<?php echo e($bookCode); ?>">
        <button class="btn btn-gold" type="submit">Generar siguiente lote pendiente</button>
      </form>
    <?php else: ?>
      <div class="alert success">No quedan propuestas estructurales pendientes para este libro y esta pareja de versiones.</div>
    <?php endif; ?>

    <?php if ($preview['ambiguous']): ?>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Capítulo origen</th><th>Capítulo destino</th><th>Motivo</th></tr></thead>
          <tbody>
          <?php foreach (array_slice($preview['ambiguous'], 0, 40) as $row): ?>
            <tr>
              <td><?php echo (int) $row['origen']; ?></td>
              <td><?php echo $row['destino'] === null ? '—' : (int) $row['destino']; ?></td>
              <td><?php echo e((string) $row['motivo']); ?></td>
            </tr>
          <?php endforeach; ?>
          </tbody>
        </table>
      </div>
      <p class="muted">Los capítulos ambiguos no se insertan. Requieren correspondencias editoriales uno-a-varios o varios-a-uno.</p>
    <?php endif; ?>
  </section>
<?php endif; ?>

<section class="panel-card">
  <h2>Reglas de seguridad</h2>
  <ul>
    <li>Todas las unidades y relaciones se crean con estado <strong>pendiente</strong>.</li>
    <li>Los capítulos con numeración interna diferente quedan excluidos.</li>
    <li>El proceso es reanudable y no duplica relaciones existentes.</li>
    <li>Las equivalencias no deben consumirse públicamente hasta su aprobación editorial.</li>
  </ul>
</section>
<?php require __DIR__ . '/includes/footer.php'; ?>

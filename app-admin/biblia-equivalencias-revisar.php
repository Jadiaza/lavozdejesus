<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/biblia-equivalencias.php';
require_once __DIR__ . '/includes/biblia-equivalencias-revision.php';
require_login();

$pdo = lvj_files_db();
$message = '';
$error = '';
$sourceCode = strtoupper(trim((string) ($_POST['version_origen'] ?? $_GET['version_origen'] ?? 'SPAPLATENSE')));
$targetCode = strtoupper(trim((string) ($_POST['version_destino'] ?? $_GET['version_destino'] ?? 'TORRESAMAT')));
$bookCode = strtoupper(trim((string) ($_POST['libro'] ?? $_GET['libro'] ?? 'PSA')));
$chapter = max(1, (int) ($_POST['capitulo'] ?? $_GET['capitulo'] ?? 22));
$state = (string) ($_POST['estado'] ?? $_GET['estado'] ?? 'pendiente');
if (!in_array($state, ['pendiente', 'aprobado', 'rechazado'], true)) $state = 'pendiente';
$versions = [];
$books = [];
$chapters = [];
$units = [];
$supportsRejected = false;
$reviewedChapter = null;

try {
  $versions = bib_equiv_versions($pdo);
  $supportsRejected = bib_equiv_review_supports_rejected($pdo);
  $source = bib_equiv_version($pdo, $sourceCode);
  $target = bib_equiv_version($pdo, $targetCode);
  if ((int) $source['id'] === (int) $target['id']) throw new RuntimeException('Selecciona dos versiones diferentes.');
  $books = bib_equiv_common_books($pdo, (int) $source['id'], (int) $target['id']);
  bib_equiv_book($pdo, (int) $source['id'], $bookCode);

  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = (string) ($_POST['action'] ?? '');
    if (!in_array($action, ['aprobar_capitulo', 'rechazar_capitulo'], true)) throw new RuntimeException('Acción no permitida.');
    $newState = $action === 'aprobar_capitulo' ? 'aprobado' : 'rechazado';
    $count = bib_equiv_review_update_chapter($pdo, $sourceCode, $targetCode, $bookCode, $chapter, $newState);
    log_activity($action, 'lvj_bib_unidades_canonicas', null, sprintf('%s → %s, %s %d, %d unidades', $sourceCode, $targetCode, $bookCode, $chapter, $count));
    $message = sprintf('%d equivalencias del capítulo fueron marcadas como %s.', $count, $newState);
    $reviewedChapter = $chapter;
    $state = 'pendiente';
  }
  $chapters = bib_equiv_review_chapters($pdo, $sourceCode, $targetCode, $bookCode, $state);
  if ($chapters && $reviewedChapter !== null) {
    $nextChapters = array_values(array_filter($chapters, static function (int $number) use ($reviewedChapter): bool {
      return $number > $reviewedChapter;
    }));
    $chapter = (int) ($nextChapters[0] ?? $chapters[0]);
  } elseif ($chapters && !in_array($chapter, $chapters, true)) {
    $chapter = (int) $chapters[0];
  }
  if ($chapters) {
    $units = bib_equiv_review_units($pdo, $sourceCode, $targetCode, $bookCode, $chapter, $state);
    $knownUnitIds = array_fill_keys(array_map(static function (array $unit): int { return (int) $unit['id']; }, $units), true);
    foreach (['pendiente', 'aprobado'] as $contextState) {
      foreach (bib_equiv_review_units($pdo, $sourceCode, $targetCode, $bookCode, $chapter, $contextState, true) as $contextUnit) {
        $unitId = (int) $contextUnit['id'];
        if (empty($contextUnit['contexto_destino']) || isset($knownUnitIds[$unitId])) continue;
        $units[] = $contextUnit;
        $knownUnitIds[$unitId] = true;
      }
    }
    usort($units, static function (array $left, array $right) use ($sourceCode, $targetCode): int {
      $leftRow = $left['versiones'][$targetCode][0] ?? $left['versiones'][$sourceCode][0];
      $rightRow = $right['versiones'][$targetCode][0] ?? $right['versiones'][$sourceCode][0];
      return [(int) $leftRow['capitulo'], (int) $leftRow['versiculo'], (int) $left['id']]
        <=> [(int) $rightRow['capitulo'], (int) $rightRow['versiculo'], (int) $right['id']];
    });
  }
} catch (Throwable $exception) {
  $error = $exception->getMessage();
}

$pageTitle = 'Revisión de equivalencias';
$pageSubtitle = 'Aprobación editorial';
require __DIR__ . '/includes/header.php';
?>
<section class="page-heading"><div><span class="eyebrow">Biblia</span><h1>Revisión de equivalencias</h1><p>Compara ambos textos antes de aprobar o rechazar el capítulo.</p></div></section>
<?php if ($message): ?><div class="alert success"><?php echo e($message); ?></div><?php endif; ?>
<?php if ($error): ?><div class="alert error"><?php echo e($error); ?></div><?php endif; ?>
<?php if (!$supportsRejected): ?><div class="alert">La aprobación está disponible. Para habilitar el rechazo editorial, ejecuta la migración <code>2026-07-19-add-estado-rechazado-equivalencias.sql</code>.</div><?php endif; ?>

<section class="panel-card">
  <form method="get" class="form-grid">
    <label>Versión principal<select name="version_origen"><?php foreach ($versions as $version): ?><option value="<?php echo e((string) $version['codigo']); ?>" <?php echo $sourceCode === $version['codigo'] ? 'selected' : ''; ?>><?php echo e((string) $version['nombre']); ?></option><?php endforeach; ?></select></label>
    <label>Versión comparativa<select name="version_destino"><?php foreach ($versions as $version): ?><option value="<?php echo e((string) $version['codigo']); ?>" <?php echo $targetCode === $version['codigo'] ? 'selected' : ''; ?>><?php echo e((string) $version['nombre']); ?></option><?php endforeach; ?></select></label>
    <label>Libro<select name="libro"><?php foreach ($books as $book): ?><option value="<?php echo e((string) $book['codigo']); ?>" <?php echo $bookCode === $book['codigo'] ? 'selected' : ''; ?>><?php echo e((string) $book['nombre']); ?></option><?php endforeach; ?></select></label>
    <label>Capítulo<select name="capitulo" <?php echo !$chapters ? 'disabled' : ''; ?>><?php if (!$chapters): ?><option>Sin capítulos en este estado</option><?php endif; ?><?php foreach ($chapters as $number): ?><option value="<?php echo $number; ?>" <?php echo $chapter === $number ? 'selected' : ''; ?>><?php echo $number; ?></option><?php endforeach; ?></select></label>
    <label>Estado<select name="estado"><option value="pendiente" <?php echo $state === 'pendiente' ? 'selected' : ''; ?>>Pendiente</option><option value="aprobado" <?php echo $state === 'aprobado' ? 'selected' : ''; ?>>Aprobado</option><option value="rechazado" <?php echo $state === 'rechazado' ? 'selected' : ''; ?>>Rechazado</option></select></label>
    <div class="form-actions"><button class="btn btn-gold" type="submit">Consultar</button><a class="btn btn-soft" href="biblia-equivalencias.php">Volver al generador</a></div>
  </form>
</section>

<section class="panel-card">
  <?php $stateLabels = ['pendiente' => 'pendientes', 'aprobado' => 'aprobadas', 'rechazado' => 'rechazadas']; ?>
  <?php $actionableUnits = array_values(array_filter($units, static function (array $unit): bool { return empty($unit['contexto_destino']); })); ?>
  <div class="panel-header"><div><h2><?php echo e($bookCode); ?> <?php echo $chapter; ?></h2><p class="muted"><?php echo count($actionableUnits); ?> equivalencias <?php echo e($stateLabels[$state] ?? $state); ?><?php if (count($units) !== count($actionableUnits)): ?> · <?php echo count($units) - count($actionableUnits); ?> referencias de contexto<?php endif; ?></p></div></div>
  <?php if (!$units): ?><div class="alert">No hay parejas completas para este filtro.</div><?php else: ?>
  <div class="table-wrap"><table><thead><tr><th>Unidad</th><th><?php echo e($sourceCode); ?></th><th><?php echo e($targetCode); ?></th></tr></thead><tbody>
  <?php foreach ($units as $unit): $sourceRows = $unit['versiones'][$sourceCode]; $targetRows = $unit['versiones'][$targetCode] ?? []; ?>
    <tr>
      <td><strong><?php echo e((string) $unit['codigo']); ?></strong><br><small><?php echo e((string) $unit['estado']); ?></small></td>
      <td><?php if (!empty($unit['contexto_destino'])): ?><strong>Sin referencia dentro del capítulo <?php echo $chapter; ?> en <?php echo e($sourceCode); ?></strong><br><span class="muted">El pasaje equivalente se encuentra en <?php echo e($sourceCode); ?> <?php echo (int) $sourceRows[0]['capitulo']; ?>:<?php echo (int) $sourceRows[0]['versiculo']; ?>.</span><?php else: ?><?php foreach ($sourceRows as $index => $sourceRow): ?><?php if ($index): ?><hr><?php endif; ?><strong><?php echo (int) $sourceRow['capitulo']; ?>:<?php echo (int) $sourceRow['versiculo']; ?></strong><?php if ($sourceRow['referencia_editorial']): ?> <small class="muted">(<?php echo e((string) $sourceRow['referencia_editorial']); ?>)</small><?php endif; ?><br><?php echo e((string) $sourceRow['texto_mostrado']); ?><?php endforeach; ?><?php endif; ?></td>
      <td><?php if (!$targetRows): ?><strong>Sin equivalente en <?php echo e($targetCode); ?></strong><br><span class="muted">El texto se conserva y se muestra únicamente en <?php echo e($sourceCode); ?>.</span><?php endif; ?><?php foreach ($targetRows as $index => $targetRow): ?><?php if ($index): ?><hr><?php endif; ?><?php $sourceChapter = (int) $sourceRows[0]['capitulo']; $targetChapter = (int) $targetRow['capitulo']; $targetVerse = (int) $targetRow['versiculo']; $hasEditorialReference = preg_match('/^([0-9]+):([0-9]+)/', (string) ($targetRow['referencia_editorial'] ?? ''), $editorialMatch) === 1; $displayChapter = $hasEditorialReference ? (int) $editorialMatch[1] : $targetChapter; $displayVerse = $hasEditorialReference ? (int) $editorialMatch[2] : $targetVerse; ?><?php if (!$unit['contexto_destino'] && $sourceChapter !== $displayChapter): ?><strong>Sin referencia dentro del capítulo <?php echo $sourceChapter; ?> en <?php echo e($targetCode); ?></strong><br><span class="muted">El texto equivalente continúa en <?php echo e($targetCode); ?> <?php echo $displayChapter; ?>:<?php echo $displayVerse; ?>.</span><?php else: ?><strong><?php echo $displayChapter; ?>:<?php echo $displayVerse; ?></strong><?php endif; ?><br><?php echo e((string) $targetRow['texto_mostrado']); ?><?php endforeach; ?></td>
    </tr>
  <?php endforeach; ?>
  </tbody></table></div>
  <?php if ($state === 'pendiente'): ?>
    <div class="form-actions" style="margin-top:16px">
      <form method="post" onsubmit="return confirm('CAMBIOS: todas las unidades y relaciones pendientes de este capítulo pasarán a aprobado y podrán ser consumidas por la aplicación. ¿Continuar?');"><?php echo csrf_field(); ?><input type="hidden" name="action" value="aprobar_capitulo"><input type="hidden" name="version_origen" value="<?php echo e($sourceCode); ?>"><input type="hidden" name="version_destino" value="<?php echo e($targetCode); ?>"><input type="hidden" name="libro" value="<?php echo e($bookCode); ?>"><input type="hidden" name="capitulo" value="<?php echo $chapter; ?>"><input type="hidden" name="estado" value="pendiente"><button class="btn btn-gold" type="submit">Aprobar capítulo completo</button></form>
      <?php if ($supportsRejected): ?><form method="post" onsubmit="return confirm('¿Rechazar todas las equivalencias pendientes de este capítulo?');"><?php echo csrf_field(); ?><input type="hidden" name="action" value="rechazar_capitulo"><input type="hidden" name="version_origen" value="<?php echo e($sourceCode); ?>"><input type="hidden" name="version_destino" value="<?php echo e($targetCode); ?>"><input type="hidden" name="libro" value="<?php echo e($bookCode); ?>"><input type="hidden" name="capitulo" value="<?php echo $chapter; ?>"><input type="hidden" name="estado" value="pendiente"><button class="btn btn-soft" type="submit">Rechazar capítulo</button></form><?php endif; ?>
    </div>
  <?php endif; endif; ?>
</section>
<?php require __DIR__ . '/includes/footer.php'; ?>

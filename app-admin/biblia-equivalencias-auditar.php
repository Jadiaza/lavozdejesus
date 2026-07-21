<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/biblia-equivalencias.php';
require_once __DIR__ . '/includes/biblia-equivalencias-resolvers.php';
require_login();

$pdo = lvj_files_db();
$error = '';
$message = '';
$versions = [];
$books = [];
$audit = null;
$sourceCode = strtoupper(trim((string) ($_POST['version_origen'] ?? $_GET['version_origen'] ?? 'SPAPLATENSE')));
$targetCode = strtoupper(trim((string) ($_POST['version_destino'] ?? $_GET['version_destino'] ?? 'TORRESAMAT')));
$bookCode = strtoupper(trim((string) ($_POST['libro'] ?? $_GET['libro'] ?? 'EST')));

try {
  $versions = bib_equiv_versions($pdo);
  $source = bib_equiv_version($pdo, $sourceCode);
  $target = bib_equiv_version($pdo, $targetCode);
  if ((int) $source['id'] === (int) $target['id']) throw new RuntimeException('Selecciona dos versiones diferentes.');
  $books = bib_equiv_common_books($pdo, (int) $source['id'], (int) $target['id']);
  $availableBooks = array_column($books, 'codigo');
  if (!in_array($bookCode, $availableBooks, true)) $bookCode = (string) ($availableBooks[0] ?? '');
  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = (string) ($_POST['action'] ?? '');
    if (bib_equiv_requires_source_audit($bookCode)) {
      throw new RuntimeException("$bookCode está en auditoría de fuente. Los resolvedores automáticos permanecen bloqueados hasta verificar la segmentación importada.");
    }
    if ($action === 'resolver_ester') $result = bib_equiv_resolve_ester($pdo, $sourceCode, $targetCode);
    elseif ($action === 'resolver_interno' && !in_array($bookCode, ['EST','DAN'], true)) $result = bib_equiv_resolve_internal_book($pdo, $sourceCode, $targetCode, $bookCode);
    elseif ($action === 'ajustar_baruc' && $bookCode === 'BAR') {
      $adjusted = bib_equiv_adjust_baruc_heading($pdo);
      $result = ['units'=>0,'relations'=>$adjusted['relations'],'fragments'=>1];
    }
    else throw new RuntimeException('Acción no permitida.');
    log_activity('resolver_equivalencias_' . strtolower($bookCode), 'lvj_bib_unidades_canonicas', null,
      sprintf('%d unidades, %d relaciones, %d fragmentos', $result['units'], $result['relations'], $result['fragments']));
    $message = $action === 'ajustar_baruc'
      ? 'Baruc 5:9 ajustado para el estudio: el encabezado de Baruc 6 permanece en el texto original, pero ya no se compara como parte del versículo.'
      : sprintf('%s preparado: %d unidades y %d relaciones pendientes; los textos originales no se modificaron.', $bookCode, $result['units'], $result['relations']);
  }
  if ($bookCode !== '') $audit = bib_equiv_audit_book($pdo, $sourceCode, $targetCode, $bookCode);
} catch (Throwable $exception) {
  $error = $exception->getMessage();
}

$pageTitle = 'Auditoría de equivalencias';
$pageSubtitle = 'Libro completo y diferencias estructurales';
require __DIR__ . '/includes/header.php';
?>
<section class="page-heading">
  <div><span class="eyebrow">Biblia</span><h1>Auditoría completa del libro</h1><p>Muestra todos los capítulos y versículos, incluso cuando falten, estén desplazados o contengan numeraciones internas.</p></div>
  <div class="form-actions"><a class="btn btn-soft" href="biblia-equivalencias.php?version_origen=<?php echo e($sourceCode); ?>&amp;version_destino=<?php echo e($targetCode); ?>&amp;libro=<?php echo e($bookCode); ?>">Generar compatibles</a><a class="btn btn-gold" href="biblia-equivalencias-revisar.php?version_origen=<?php echo e($sourceCode); ?>&amp;version_destino=<?php echo e($targetCode); ?>&amp;libro=<?php echo e($bookCode); ?>&amp;estado=pendiente">Revisión editorial</a></div>
</section>
<?php if ($error): ?><div class="alert error"><?php echo e($error); ?></div><?php endif; ?>
<?php if ($message): ?><div class="alert success"><?php echo e($message); ?></div><?php endif; ?>

<section class="panel-card">
  <form method="get" class="form-grid">
    <label>Versión principal<select name="version_origen"><?php foreach ($versions as $version): ?><option value="<?php echo e((string) $version['codigo']); ?>" <?php echo $sourceCode === $version['codigo'] ? 'selected' : ''; ?>><?php echo e((string) $version['nombre']); ?></option><?php endforeach; ?></select></label>
    <label>Versión comparativa<select name="version_destino"><?php foreach ($versions as $version): ?><option value="<?php echo e((string) $version['codigo']); ?>" <?php echo $targetCode === $version['codigo'] ? 'selected' : ''; ?>><?php echo e((string) $version['nombre']); ?></option><?php endforeach; ?></select></label>
    <label>Libro<select name="libro"><?php foreach ($books as $book): ?><option value="<?php echo e((string) $book['codigo']); ?>" <?php echo $bookCode === $book['codigo'] ? 'selected' : ''; ?>><?php echo e((string) $book['nombre']); ?> (<?php echo (int) $book['capitulos_origen']; ?>/<?php echo (int) $book['capitulos_destino']; ?>)</option><?php endforeach; ?></select></label>
    <div class="form-actions"><button class="btn btn-gold" type="submit">Auditar libro completo</button></div>
  </form>
</section>

<?php if ($audit): $summary = $audit['summary']; ?>
<?php if (bib_equiv_requires_source_audit($bookCode)): ?><div class="alert error"><strong>Solo diagnóstico.</strong> <?php echo e($bookCode); ?> está en auditoría de fuente; no se crearán ni ajustarán fragmentos automáticamente.</div><?php endif; ?>
<section class="stats-grid">
  <article class="stat-card"><span>Capítulos inspeccionados</span><strong><?php echo (int) $summary['chapters']; ?></strong></article>
  <article class="stat-card"><span>Compatibles</span><strong><?php echo (int) $summary['compatible']; ?></strong></article>
  <article class="stat-card"><span>Numeración diferente</span><strong><?php echo (int) $summary['different']; ?></strong></article>
  <article class="stat-card"><span>Capítulos faltantes</span><strong><?php echo (int) $summary['missing']; ?></strong></article>
  <article class="stat-card"><span>Textos para revisar</span><strong><?php echo (int) $summary['suspicious']; ?></strong></article>
</section>

<section class="panel-card">
  <div class="panel-header">
    <div><h2><?php echo e((string) $audit['source_book']['nombre']); ?></h2><p class="muted"><?php echo e($sourceCode); ?> → <?php echo e($targetCode); ?> · no modifica la base de datos</p></div>
    <div class="form-actions"><button class="btn btn-soft" type="button" data-audit-expand>Expandir todos</button><button class="btn btn-soft" type="button" data-audit-collapse>Contraer compatibles</button></div>
  </div>
  <?php if ($bookCode === 'EST' && !bib_equiv_requires_source_audit($bookCode) && $sourceCode === 'SPAPLATENSE' && $targetCode === 'TORRESAMAT'): ?>
  <form method="post" class="form-actions" onsubmit="return confirm('Se crearán propuestas pendientes para Ester 10–16. Ningún texto bíblico será modificado. ¿Continuar?');">
    <?php echo csrf_field(); ?><input type="hidden" name="action" value="resolver_ester"><input type="hidden" name="version_origen" value="SPAPLATENSE"><input type="hidden" name="version_destino" value="TORRESAMAT"><input type="hidden" name="libro" value="EST"><button class="btn btn-gold" type="submit">Preparar equivalencias de Ester</button>
  </form>
  <?php endif; ?>
  <?php if ($bookCode === 'BAR' && !bib_equiv_requires_source_audit($bookCode) && $sourceCode === 'SPAPLATENSE' && $targetCode === 'TORRESAMAT'): ?>
  <form method="post" class="form-actions" onsubmit="return confirm('Se excluirá el encabezado de Baruc 6 de la comparación de Baruc 5:9 sin modificar el texto original. ¿Continuar?');">
    <?php echo csrf_field(); ?><input type="hidden" name="action" value="ajustar_baruc"><input type="hidden" name="version_origen" value="SPAPLATENSE"><input type="hidden" name="version_destino" value="TORRESAMAT"><input type="hidden" name="libro" value="BAR"><button class="btn btn-soft" type="submit">Ajustar encabezado de Baruc 6</button>
  </form>
  <?php endif; ?>
  <?php if (!bib_equiv_requires_source_audit($bookCode) && !in_array($bookCode, ['EST','DAN'], true) && $sourceCode === 'SPAPLATENSE' && $targetCode === 'TORRESAMAT' && ((int) $summary['different'] > 0 || (int) $summary['suspicious'] > 0)): ?>
  <form method="post" class="form-actions" onsubmit="return confirm('El sistema solo creará propuestas cuando todas las referencias internas sean completas y únicas. ¿Continuar?');">
    <?php echo csrf_field(); ?><input type="hidden" name="action" value="resolver_interno"><input type="hidden" name="version_origen" value="SPAPLATENSE"><input type="hidden" name="version_destino" value="TORRESAMAT"><input type="hidden" name="libro" value="<?php echo e($bookCode); ?>"><button class="btn btn-gold" type="submit">Resolver inconsistencias seguras de <?php echo e((string) $audit['source_book']['nombre']); ?></button>
  </form>
  <?php endif; ?>
  <div class="audit-legend"><span class="status-pill status-active">Compatible</span><span class="status-pill status-draft">Diferente</span><span class="status-pill status-inactive">Faltante</span><span class="badge">Numeración interna</span></div>
</section>

<?php foreach ($audit['chapters'] as $chapter):
  $hasSuspicious = false;
  foreach ($chapter['filas'] as $auditRow) {
    if (($auditRow['origen']['sospechoso'] ?? false) || ($auditRow['destino']['sospechoso'] ?? false)) { $hasSuspicious = true; break; }
  }
  $open = $chapter['estado'] !== 'compatible' || $hasSuspicious;
?>
<details class="panel-card audit-chapter" data-status="<?php echo e((string) $chapter['estado']); ?>" <?php echo $open ? 'open' : ''; ?>>
  <summary><strong>Capítulo <?php echo (int) $chapter['numero']; ?></strong><span><?php echo (int) $chapter['origen_total']; ?> / <?php echo (int) $chapter['destino_total']; ?> versículos</span><span class="status-pill <?php echo $chapter['estado'] === 'compatible' ? 'status-active' : ($chapter['estado'] === 'diferente' ? 'status-draft' : 'status-inactive'); ?>"><?php echo e((string) $chapter['estado']); ?></span></summary>
  <div class="table-wrap"><table class="audit-table"><thead><tr><th>Versículo</th><th><?php echo e($sourceCode); ?></th><th><?php echo e($targetCode); ?></th></tr></thead><tbody>
  <?php foreach ($chapter['filas'] as $row): ?>
    <tr class="<?php echo !$row['origen'] || !$row['destino'] ? 'audit-row-missing' : ''; ?>">
      <td><strong><?php echo (int) $chapter['numero']; ?>:<?php echo (int) $row['numero']; ?></strong></td>
      <?php foreach (['origen', 'destino'] as $side): $verse = $row[$side]; ?>
      <td><?php if (!$verse): ?><strong>Sin referencia en esta versión</strong><?php else: ?><div class="audit-verse-meta"><strong><?php echo (int) $verse['capitulo']; ?>:<?php echo (int) $verse['versiculo']; ?></strong><span><?php echo (int) $verse['caracteres']; ?> caracteres</span><?php if ((int) $verse['equivalencia_aprobada'] === 1): ?><span class="status-pill status-active">equivalencia aprobada</span><?php endif; ?></div><?php if ($verse['marcadores_internos']): ?><div class="alert audit-warning">Posible numeración interna: <?php echo e(implode(', ', $verse['marcadores_internos'])); ?></div><?php endif; ?><div class="audit-text"><?php echo nl2br(e((string) $verse['texto'])); ?></div><?php endif; ?></td>
      <?php endforeach; ?>
    </tr>
  <?php endforeach; ?>
  </tbody></table></div>
</details>
<?php endforeach; ?>
<script>
document.querySelector('[data-audit-expand]')?.addEventListener('click',()=>document.querySelectorAll('.audit-chapter').forEach(item=>item.open=true));
document.querySelector('[data-audit-collapse]')?.addEventListener('click',()=>document.querySelectorAll('.audit-chapter[data-status="compatible"]').forEach(item=>item.open=false));
</script>
<?php endif; ?>
<?php require __DIR__ . '/includes/footer.php'; ?>

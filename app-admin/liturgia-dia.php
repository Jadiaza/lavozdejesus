<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();
$table = 'lvj_lit_lectura_dia';
$pageTitle = 'Liturgia del Día';
$pageSubtitle = 'Revisión editorial de las lecturas sincronizadas desde Ordo Colombiano';
$message = '';
$error = '';

function liturgia_admin_columns(PDO $pdo): array
{
  try {
    $rows = $pdo->query('SHOW COLUMNS FROM lvj_lit_lectura_dia')->fetchAll();
  } catch (Throwable $error) {
    return [];
  }

  $columns = [];
  foreach ($rows as $row) {
    $field = trim((string) ($row['Field'] ?? ''));
    if ($field !== '') {
      $columns[$field] = $row;
    }
  }

  return $columns;
}

function liturgia_admin_with_base(PDO $pdo, array $row): array
{
  $baseId = trim((string) ($row['lectura_base_id'] ?? ''));
  if ($baseId === '') return $row;
  try {
    $statement = $pdo->prepare('SELECT * FROM lvj_lit_lecturas_base WHERE id = :id LIMIT 1');
    $statement->execute(['id' => $baseId]);
    $base = $statement->fetch() ?: [];
  } catch (Throwable $error) {
    return $row;
  }
  foreach ($base as $field => $value) {
    if (trim((string) ($row[$field] ?? '')) === '') $row[$field] = $value;
  }
  return $row;
}
function liturgia_admin_text(mixed $value): string
{
  return trim((string) ($value ?? ''));
}

function liturgia_admin_is_published(mixed $value): bool
{
  $value = strtolower(liturgia_admin_text($value));
  return in_array($value, ['1', 'true', 'si', 'sí', 'yes', 'activo', 'publicado'], true);
}

function liturgia_admin_state_value(array $columns, string $state): mixed
{
  $type = strtolower((string) ($columns['estado']['Type'] ?? ''));
  $numeric = str_contains($type, 'int') || str_contains($type, 'bit');

  if ($numeric) {
    return $state === 'publicado' ? 1 : 0;
  }

  return $state === 'publicado' ? 'publicado' : 'borrador';
}

function liturgia_admin_required_for_publish(array $data): string
{
  $required = [
    'primera_lectura_cita' => 'Cita de la primera lectura',
    'primera_lectura_texto' => 'Texto de la primera lectura',
    'salmo_cita' => 'Cita del salmo',
    'salmo_texto' => 'Texto del salmo',
    'evangelio_cita' => 'Cita del Evangelio',
    'evangelio_texto' => 'Texto del Evangelio',
  ];

  foreach ($required as $field => $label) {
    if (liturgia_admin_text($data[$field] ?? '') === '') {
      return 'Para publicar debes completar: ' . $label . '.';
    }
  }

  return '';
}

function liturgia_admin_display_citation(string $kind, string $citation, string $readingText = ''): string
{
  $citation = trim($citation);
  if ($citation === '' || preg_match('/^(?:De(?:l| la| los| las)?|Lectura|Del santo evangelio|Santo evangelio)/iu', $citation) === 1) return $citation;
  if ($kind === 'salmo') return preg_replace('/^Sal\s+/iu', 'Salmo ', $citation) ?? $citation;
  if ($kind === 'evangelio' && preg_match('/^(Mt|Mc|Lc|Jn)\s+(.+)$/u', $citation, $matches) === 1) {
    $names = ['Mt' => 'Mateo', 'Mc' => 'Marcos', 'Lc' => 'Lucas', 'Jn' => 'Juan'];
    return 'Del santo evangelio según san ' . $names[$matches[1]] . ' ' . $matches[2];
  }
  foreach (array_slice(preg_split('/\R/u', $readingText) ?: [], 0, 4) as $line) {
    $line = trim((string) $line);
    if (preg_match('/^Lectura\s+((?:del|de la|de los|de las)\s+.+?)[.:;]*$/iu', $line, $matches) !== 1) continue;
    $numbers = preg_replace('/^[^\d]+(?=\d)/u', '', $citation) ?? $citation;
    return ucfirst($matches[1]) . ' ' . $numbers;
  }
  return $citation;
}
function liturgia_admin_json_payload(array $row): array
{
  return [
    'liturgia_del_dia' => [
      'fecha' => liturgia_admin_text($row['fecha'] ?? ''),
      'tiempo_liturgico' => liturgia_admin_text($row['tiempo_liturgico'] ?? ''),
      'celebracion' => liturgia_admin_text($row['celebracion'] ?? ''),
      'grado_celebracion' => liturgia_admin_text($row['grado_celebracion'] ?? ''),
      'color_liturgico' => liturgia_admin_text($row['color_liturgico'] ?? ''),
      'primera_lectura_cita' => liturgia_admin_text($row['primera_lectura_cita'] ?? ''),
      'primera_lectura_texto' => liturgia_admin_text($row['primera_lectura_texto'] ?? ''),
      'salmo_cita' => liturgia_admin_text($row['salmo_cita'] ?? ''),
      'salmo_respuesta' => liturgia_admin_text($row['salmo_respuesta'] ?? ''),
      'salmo_texto' => liturgia_admin_text($row['salmo_texto'] ?? ''),
      'segunda_lectura_cita' => liturgia_admin_text($row['segunda_lectura_cita'] ?? ''),
      'segunda_lectura_texto' => liturgia_admin_text($row['segunda_lectura_texto'] ?? ''),
      'evangelio_cita' => liturgia_admin_text($row['evangelio_cita'] ?? ''),
      'evangelio_texto' => liturgia_admin_text($row['evangelio_texto'] ?? ''),
      'fuente' => liturgia_admin_text($row['fuente'] ?? ''),
      'estado' => liturgia_admin_is_published($row['estado'] ?? '') ? 'publicado' : 'borrador',
    ],
    'revision_editorial' => [
      'id' => (int) ($row['id'] ?? 0),
      'origen' => liturgia_admin_text($row['fuente'] ?? '') ?: 'Manual',
      'updated_at' => liturgia_admin_text($row['updated_at'] ?? ''),
    ],
  ];
}

$columns = liturgia_admin_columns($pdo);
$requiredSchema = [
  'id', 'fecha', 'primera_lectura_cita', 'primera_lectura_texto',
  'salmo_cita', 'salmo_texto', 'evangelio_cita', 'evangelio_texto', 'estado',
];
$missingColumns = array_values(array_filter(
  $requiredSchema,
  static fn (string $field): bool => !isset($columns[$field]),
));
$schemaReady = $missingColumns === [];
$hasDeletedAt = isset($columns['deleted_at']);

$editableFields = [
  'tiempo_liturgico',
  'celebracion',
  'grado_celebracion',
  'color_liturgico',
  'primera_lectura_cita',
  'primera_lectura_texto',
  'salmo_cita',
  'salmo_respuesta',
  'salmo_texto',
  'segunda_lectura_cita',
  'segunda_lectura_texto',
  'evangelio_cita',
  'evangelio_texto',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf();

  if (!$schemaReady) {
    $error = 'La estructura de Liturgia del Día no está completa en la base de datos.';
  } elseif ((string) ($_POST['action'] ?? '') === 'save') {
    $id = max(0, (int) ($_POST['id'] ?? 0));
    $existingSql = 'SELECT * FROM lvj_lit_lectura_dia WHERE id = :id';
    if ($hasDeletedAt) {
      $existingSql .= ' AND deleted_at IS NULL';
    }
    $existingSql .= ' LIMIT 1';

    $existingStmt = $pdo->prepare($existingSql);
    $existingStmt->execute(['id' => $id]);
    $existing = liturgia_admin_with_base($pdo, $existingStmt->fetch() ?: []);

    if (!$existing) {
      $error = 'La Liturgia seleccionada ya no está disponible.';
    } else {
      $data = [];
      foreach ($editableFields as $field) {
        if (!isset($columns[$field])) {
          continue;
        }
        $value = liturgia_admin_text($_POST[$field] ?? '');
        $data[$field] = $value !== '' ? $value : null;
      }

      $estado = strtolower(liturgia_admin_text($_POST['estado'] ?? 'borrador'));
      $estado = $estado === 'publicado' ? 'publicado' : 'borrador';
      $data['estado'] = liturgia_admin_state_value($columns, $estado);

      foreach (['imagen_home', 'imagen_lectura', 'banner', 'logo_especial', 'audio_url', 'video_url'] as $urlField) {
        $value = liturgia_admin_text($data[$urlField] ?? '');
        if ($value !== '' && (!filter_var($value, FILTER_VALIDATE_URL) || !preg_match('/^https?:\/\//i', $value))) {
          $error = 'La URL indicada en ' . $urlField . ' no es válida.';
          break;
        }
      }

      if ($error === '' && $estado === 'publicado') {
        $error = liturgia_admin_required_for_publish($data);
      }

      if ($error === '') {
        try {
          $sets = [];
          $params = ['id' => $id];
          foreach ($data as $field => $value) {
            $sets[] = "`{$field}` = :{$field}";
            $params[$field] = $value;
          }
          if (isset($columns['updated_at'])) {
            $sets[] = 'updated_at = NOW()';
          }

          $stmt = $pdo->prepare(
            'UPDATE lvj_lit_lectura_dia SET ' . implode(', ', $sets) . ' WHERE id = :id LIMIT 1'
          );
          $stmt->execute($params);
          log_activity(
            'update',
            $table,
            $id,
            $estado === 'publicado' ? 'Liturgia revisada y publicada' : 'Liturgia guardada como borrador',
          );
          header(
            'Location: liturgia-dia.php?edit=' . $id
            . '&vista=preview&saved=' . ($estado === 'publicado' ? 'published' : 'draft')
          );
          exit;
        } catch (Throwable $saveError) {
          $error = 'No se pudo guardar la Liturgia: ' . $saveError->getMessage();
        }
      }
    }
  }
}

if (isset($_GET['saved'])) {
  $message = (string) $_GET['saved'] === 'published'
    ? 'Liturgia revisada y publicada correctamente.'
    : 'Liturgia guardada como borrador.';
}

$editId = max(0, (int) ($_GET['edit'] ?? 0));
$editRow = [];
if ($schemaReady && $editId > 0) {
  try {
    $editSql = 'SELECT * FROM lvj_lit_lectura_dia WHERE id = :id';
    if ($hasDeletedAt) {
      $editSql .= ' AND deleted_at IS NULL';
    }
    $editSql .= ' LIMIT 1';

    $stmt = $pdo->prepare($editSql);
    $stmt->execute(['id' => $editId]);
    $editRow = liturgia_admin_with_base($pdo, $stmt->fetch() ?: []);
  } catch (Throwable $editError) {
    $editRow = [];
  }
}

$reviewView = strtolower(liturgia_admin_text($_GET['vista'] ?? 'preview'));
if (!in_array($reviewView, ['preview', 'editar', 'json'], true)) {
  $reviewView = 'preview';
}

$jsonPreview = '';
if ($editRow) {
  try {
    $jsonPreview = json_encode(
      liturgia_admin_json_payload($editRow),
      JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR,
    );
  } catch (Throwable $jsonError) {
    $jsonPreview = '{"error":"No fue posible construir la vista JSON."}';
  }
}

$estadoFiltro = strtolower(liturgia_admin_text($_GET['estado'] ?? 'borrador'));
if (!in_array($estadoFiltro, ['borrador', 'publicado', 'todos'], true)) {
  $estadoFiltro = 'borrador';
}
$search = liturgia_admin_text($_GET['q'] ?? '');
$counts = ['borrador' => 0, 'publicado' => 0];
$rows = [];

if ($schemaReady) {
  try {
    $baseWhere = $hasDeletedAt ? 'deleted_at IS NULL' : '1=1';
    foreach (['borrador', 'publicado'] as $state) {
      $count = $pdo->prepare(
        'SELECT COUNT(*) FROM lvj_lit_lectura_dia WHERE ' . $baseWhere . ' AND estado = :estado'
      );
      $count->execute(['estado' => liturgia_admin_state_value($columns, $state)]);
      $counts[$state] = (int) $count->fetchColumn();
    }

    $where = [$baseWhere];
    $params = [];
    if ($estadoFiltro !== 'todos') {
      $where[] = 'estado = :estado';
      $params['estado'] = liturgia_admin_state_value($columns, $estadoFiltro);
    }
    if ($search !== '') {
      $where[] = '(fecha LIKE :q OR celebracion LIKE :q OR evangelio_cita LIKE :q)';
      $params['q'] = '%' . $search . '%';
    }

    $stmt = $pdo->prepare(
      'SELECT * FROM lvj_lit_lectura_dia WHERE ' . implode(' AND ', $where)
      . ' ORDER BY fecha DESC, id DESC LIMIT 250'
    );
    $stmt->execute($params);
    $rows = array_map(static fn (array $row): array => liturgia_admin_with_base($pdo, $row), $stmt->fetchAll());
  } catch (Throwable $listError) {
    $error = $error ?: 'No se pudieron cargar las Liturgias: ' . $listError->getMessage();
  }
}

require __DIR__ . '/includes/header.php';
?>

<nav class="content-toolbar" aria-label="Revisión editorial de Liturgia">
  <div class="content-tabs">
    <a class="active" href="liturgia-dia.php">Liturgia del Día</a>
    <a href="liturgia-ordo.php">Sincronizar Ordo</a>
    <a href="lectio-divina.php">Lectio Divina</a>
    <a href="santoral-dia.php">Santo del Día</a>
    <a href="content.php?module=liturgia&amp;table=lvj_lit_dia">Configuración litúrgica</a>
  </div>
</nav>

<section class="panel content-overview-panel">
  <div class="content-overview">
    <div>
      <span class="eyebrow">Liturgia</span>
      <h2>Liturgia del Día</h2>
      <p class="muted">Revisa las lecturas recibidas desde Ordo antes de publicarlas en la PWA.</p>
    </div>
    <div class="content-actions-bar">
      <a class="btn btn-soft" href="lectio-divina.php">Lectio Divina</a>
      <a class="btn btn-soft" href="santoral-dia.php">Santo del Día</a>
    </div>
  </div>

  <?php if ($message): ?><div class="alert alert-success"><?php echo e($message); ?></div><?php endif; ?>
  <?php if ($error): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>
  <?php if (!$schemaReady): ?>
    <div class="alert alert-error">Faltan columnas requeridas en Liturgia del Día: <?php echo e(implode(', ', $missingColumns)); ?>.</div>
  <?php endif; ?>
</section>

<?php if ($schemaReady): ?>
<section class="stats-grid pending-stats">
  <a class="stat-card stat-card-link" href="liturgia-dia.php?estado=borrador">
    <div class="stat-icon gold">LI</div><span>Borradores</span><strong><?php echo (int) $counts['borrador']; ?></strong><small>Pendientes de revisión humana</small>
  </a>
  <a class="stat-card stat-card-link" href="liturgia-dia.php?estado=publicado">
    <div class="stat-icon green">OK</div><span>Publicadas</span><strong><?php echo (int) $counts['publicado']; ?></strong><small>Visibles en la PWA</small>
  </a>
</section>
<?php endif; ?>

<?php if ($editRow): ?>
<section class="panel content-editor-panel">
  <div class="panel-header">
    <div>
      <h2>Revisar Liturgia del Día</h2>
      <p class="muted">
        <?php echo e((string) ($editRow['fecha'] ?? '')); ?>
        <?php if (!empty($editRow['celebracion'])): ?> · <?php echo e((string) $editRow['celebracion']); ?><?php endif; ?>
      </p>
    </div>
    <a class="btn btn-soft" href="liturgia-dia.php">Volver</a>
  </div>

  <nav class="content-toolbar" aria-label="Vista de revisión de Liturgia del Día">
    <div class="content-tabs">
      <a class="<?php echo $reviewView === 'preview' ? 'active' : ''; ?>" href="liturgia-dia.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=preview">Vista previa</a>
      <a class="<?php echo $reviewView === 'editar' ? 'active' : ''; ?>" href="liturgia-dia.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=editar">Editar contenido</a>
      <a class="<?php echo $reviewView === 'json' ? 'active' : ''; ?>" href="liturgia-dia.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=json">JSON</a>
    </div>
  </nav>

  <?php if ($reviewView === 'preview'): ?>
    <?php $previewPublished = liturgia_admin_is_published($editRow['estado'] ?? ''); ?>
    <div class="content-form-grid">
      <article class="panel content-field full">
        <div class="panel-header">
          <div>
            <span class="eyebrow"><?php echo e((string) ($editRow['tiempo_liturgico'] ?? 'Liturgia')); ?></span>
            <h2><?php echo e((string) ($editRow['celebracion'] ?? 'Liturgia del Día')); ?></h2>
            <p class="muted"><?php echo e((string) ($editRow['fecha'] ?? '')); ?><?php echo !empty($editRow['color_liturgico']) ? ' · ' . e((string) $editRow['color_liturgico']) : ''; ?></p>
          </div>
          <span class="status-pill status-<?php echo $previewPublished ? 'active' : 'draft'; ?>"><?php echo $previewPublished ? 'Publicado' : 'Borrador'; ?></span>
        </div>
      </article>

      <?php
        $readingSections = [
          ['Primera lectura', 'primera_lectura_cita', 'primera_lectura_texto'],
          ['Salmo', 'salmo_cita', 'salmo_texto'],
          ['Segunda lectura', 'segunda_lectura_cita', 'segunda_lectura_texto'],
          ['Evangelio', 'evangelio_cita', 'evangelio_texto'],
        ];
      ?>
      <?php foreach ($readingSections as [$title, $citationField, $textField]): ?>
        <?php
          $citation = liturgia_admin_display_citation($title === 'Salmo' ? 'salmo' : ($title === 'Evangelio' ? 'evangelio' : 'lectura'), liturgia_admin_text($editRow[$citationField] ?? ''), liturgia_admin_text($editRow[$textField] ?? ''));
          $text = liturgia_admin_text($editRow[$textField] ?? '');
          if ($citation === '' && $text === '') {
            continue;
          }
        ?>
        <article class="panel content-field full">
          <div class="panel-header">
            <div>
              <span class="eyebrow">Lecturas</span>
              <h2><?php echo e($title); ?></h2>
              <?php if ($citation !== ''): ?><p class="muted"><?php echo e($citation); ?></p><?php endif; ?>
            </div>
          </div>
          <?php if ($title === 'Salmo' && !empty($editRow['salmo_respuesta'])): ?>
            <div class="alert alert-success"><?php echo e((string) $editRow['salmo_respuesta']); ?></div>
          <?php endif; ?>
          <div style="white-space:pre-wrap;line-height:1.75;"><?php echo e($text); ?></div>
        </article>
      <?php endforeach; ?>


    </div>

    <div class="form-actions">
      <a class="btn btn-gold" href="liturgia-dia.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=editar">Editar contenido</a>
      <a class="btn btn-soft" href="liturgia-dia.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=json">Ver JSON</a>
    </div>

  <?php elseif ($reviewView === 'json'): ?>
    <div class="alert alert-success">Vista JSON de solo lectura. La edición se realiza únicamente desde el formulario validado.</div>
    <article class="panel">
      <div class="panel-header">
        <div><span class="eyebrow">Auditoría</span><h2>JSON de Liturgia del Día</h2></div>
        <a class="btn btn-gold" href="liturgia-dia.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=editar">Editar</a>
      </div>
      <pre style="margin:0;max-height:720px;overflow:auto;white-space:pre-wrap;word-break:break-word;background:#071a33;color:#f8f5ea;border-radius:14px;padding:18px;line-height:1.55;"><code><?php echo e($jsonPreview); ?></code></pre>
    </article>

  <?php else: ?>
    <form method="post" class="content-form">
      <?php echo csrf_field(); ?>
      <input type="hidden" name="action" value="save">
      <input type="hidden" name="id" value="<?php echo (int) $editRow['id']; ?>">

      <div class="content-step-tabs" data-content-section-tabs>
        <button type="button" class="active" data-content-section-tab="general">General</button>
        <button type="button" data-content-section-tab="lecturas">Lecturas</button>

      </div>

      <div class="content-form-grid">
        <div class="content-section-shell" data-content-section="general">
          <label class="content-field">Fecha
            <input type="date" value="<?php echo e((string) ($editRow['fecha'] ?? '')); ?>" disabled>
          </label>
        </div>

        <?php foreach ([
          'tiempo_liturgico' => 'Tiempo litúrgico',
          'celebracion' => 'Celebración',
          'grado_celebracion' => 'Grado de celebración',
          'color_liturgico' => 'Color litúrgico',
        ] as $field => $label): ?>
          <?php if (isset($columns[$field])): ?>
            <div class="content-section-shell" data-content-section="general">
              <label class="content-field"><?php echo e($label); ?>
                <input type="text" name="<?php echo e($field); ?>" value="<?php echo e((string) ($editRow[$field] ?? '')); ?>">
              </label>
            </div>
          <?php endif; ?>
        <?php endforeach; ?>

        <?php
          $readingFields = [
            'primera_lectura_cita' => ['Primera lectura · cita', 1],
            'primera_lectura_texto' => ['Primera lectura · texto', 8],
            'salmo_cita' => ['Salmo · cita', 1],
            'salmo_respuesta' => ['Salmo · respuesta', 3],
            'salmo_texto' => ['Salmo · texto', 8],
            'segunda_lectura_cita' => ['Segunda lectura · cita', 1],
            'segunda_lectura_texto' => ['Segunda lectura · texto', 8],
            'evangelio_cita' => ['Evangelio · cita', 1],
            'evangelio_texto' => ['Evangelio · texto', 10],
          ];
        ?>
        <?php foreach ($readingFields as $field => [$label, $rowsCount]): ?>
          <?php if (isset($columns[$field])): ?>
            <div class="content-section-shell" data-content-section="lecturas" hidden>
              <?php if ($rowsCount === 1): ?>
                <label class="content-field"><?php echo e($label); ?>
                  <input type="text" name="<?php echo e($field); ?>" value="<?php echo e((string) ($editRow[$field] ?? '')); ?>">
                </label>
              <?php else: ?>
                <label class="content-field full"><?php echo e($label); ?>
                  <textarea name="<?php echo e($field); ?>" rows="<?php echo (int) $rowsCount; ?>"><?php echo e((string) ($editRow[$field] ?? '')); ?></textarea>
                </label>
              <?php endif; ?>
            </div>
          <?php endif; ?>
        <?php endforeach; ?>



        <div class="content-section-shell" data-content-section="general">
          <label class="content-field status-field">Estado
            <select name="estado" required>
              <option value="borrador" <?php echo !liturgia_admin_is_published($editRow['estado'] ?? '') ? 'selected' : ''; ?>>Borrador · pendiente de revisión</option>
              <option value="publicado" <?php echo liturgia_admin_is_published($editRow['estado'] ?? '') ? 'selected' : ''; ?>>Publicado · visible en la PWA</option>
            </select>
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn btn-gold" type="submit">Guardar revisión</button>
        <a class="btn btn-soft" href="liturgia-dia.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=preview">Cancelar</a>
      </div>
    </form>
  <?php endif; ?>
</section>
<?php endif; ?>

<?php if ($schemaReady): ?>
<section class="panel content-records-panel content-grid-card">
  <div class="panel-header content-list-header">
    <div>
      <h2>Calendario de Liturgias</h2>
      <p class="muted">Las sincronizaciones nuevas o modificadas quedan como borrador hasta que una persona las apruebe.</p>
    </div>
    <div class="content-list-tools">
      <form method="get" class="content-filter-form">
        <select name="estado">
          <option value="borrador" <?php echo $estadoFiltro === 'borrador' ? 'selected' : ''; ?>>Borradores</option>
          <option value="publicado" <?php echo $estadoFiltro === 'publicado' ? 'selected' : ''; ?>>Publicadas</option>
          <option value="todos" <?php echo $estadoFiltro === 'todos' ? 'selected' : ''; ?>>Todas</option>
        </select>
        <input type="search" name="q" value="<?php echo e($search); ?>" placeholder="Buscar fecha, celebración o Evangelio...">
        <button class="btn btn-soft" type="submit">Filtrar</button>
      </form>
    </div>
  </div>

  <div class="table-wrap">
    <table class="admin-grid-table">
      <thead><tr><th>Fecha</th><th>Celebración</th><th>Evangelio</th><th>Fuente</th><th>Estado</th><th>Actualizado</th><th>Acciones</th></tr></thead>
      <tbody>
      <?php foreach ($rows as $row): ?>
        <?php $published = liturgia_admin_is_published($row['estado'] ?? ''); ?>
        <tr>
          <td><?php echo e((string) ($row['fecha'] ?? '')); ?></td>
          <td><?php echo e((string) ($row['celebracion'] ?? '')); ?></td>
          <td><?php echo e((string) ($row['evangelio_cita'] ?? '')); ?></td>
          <td><?php echo e((string) ($row['fuente'] ?? '')); ?></td>
          <td><span class="status-pill status-<?php echo $published ? 'active' : 'draft'; ?>"><?php echo $published ? 'Publicado' : 'Borrador'; ?></span></td>
          <td><?php echo e((string) ($row['updated_at'] ?? '')); ?></td>
          <td class="actions grid-actions"><a class="action-button action-edit" href="liturgia-dia.php?edit=<?php echo (int) $row['id']; ?>&amp;vista=preview">Revisar</a></td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$rows): ?><tr><td colspan="7" class="muted">No hay Liturgias para este filtro.</td></tr><?php endif; ?>
      </tbody>
    </table>
  </div>
</section>
<?php endif; ?>

<?php require __DIR__ . '/includes/footer.php'; ?>

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
  } elseif ((string) ($_POST['action'] ?? '') === 'save_json') {
    $id = max(0, (int) ($_POST['id'] ?? 0));
    $rawJson = trim((string) ($_POST['json_content'] ?? ''));

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
    } elseif ($rawJson === '') {
      $error = 'El JSON no puede estar vacío.';
    } else {
      try {
        $decoded = json_decode($rawJson, true, 128, JSON_THROW_ON_ERROR);
      } catch (JsonException $jsonError) {
        $decoded = null;
        $error = 'JSON inválido: ' . $jsonError->getMessage();
      }

      if ($error === '') {
        if (!is_array($decoded)) {
          $error = 'El contenido debe ser un objeto JSON válido.';
        } else {
          $payload = isset($decoded['liturgia_del_dia']) && is_array($decoded['liturgia_del_dia'])
            ? $decoded['liturgia_del_dia']
            : $decoded;

          $allowedJsonFields = array_values(array_filter(
            array_merge($editableFields, ['estado']),
            static fn (string $field): bool => isset($columns[$field]),
          ));
          $unknownFields = array_values(array_diff(
            array_keys($payload),
            array_merge($allowedJsonFields, ['fecha', 'fuente'])
          ));

          if ($unknownFields) {
            $error = 'El JSON contiene campos no permitidos: ' . implode(', ', $unknownFields) . '.';
          } else {
            $data = [];
            foreach ($editableFields as $field) {
              if (!isset($columns[$field]) || !array_key_exists($field, $payload)) {
                continue;
              }
              $value = liturgia_admin_text($payload[$field]);
              $data[$field] = $value !== '' ? $value : null;
            }

            $estado = strtolower(liturgia_admin_text(
              $payload['estado'] ?? ($existing['estado'] ?? 'borrador')
            ));
            $estado = $estado === 'publicado' ? 'publicado' : 'borrador';
            $data['estado'] = liturgia_admin_state_value($columns, $estado);

            $merged = array_merge($existing, $data);
            if ($estado === 'publicado') {
              $error = liturgia_admin_required_for_publish($merged);
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
                  'UPDATE lvj_lit_lectura_dia SET ' . implode(', ', $sets)
                  . ' WHERE id = :id LIMIT 1'
                );
                $stmt->execute($params);

                log_activity(
                  'update_json',
                  $table,
                  $id,
                  $estado === 'publicado'
                    ? 'Liturgia actualizada por JSON y publicada'
                    : 'Liturgia actualizada por JSON como borrador',
                );

                header(
                  'Location: liturgia-dia.php?edit=' . $id
                  . '&vista=json&saved='
                  . ($estado === 'publicado' ? 'published' : 'draft')
                );
                exit;
              } catch (Throwable $saveError) {
                $error = 'No se pudo guardar el JSON de la Liturgia: '
                  . $saveError->getMessage();
              }
            }
          }
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
    <a href="content.php?module=liturgia&amp;table=lvj_lit_tiempos">Configuración litúrgica</a>
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
      <a class="btn btn-soft" href="liturgia-dia.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=json">Editar JSON</a>
    </div>

  <?php elseif ($reviewView === 'json'): ?>
    <?php $jsonSaved = isset($_GET['saved']); ?>
    <?php if ($jsonSaved): ?>
      <div class="alert alert-success">
        <?php echo $_GET['saved'] === 'published' ? 'Liturgia actualizada y publicada correctamente.' : 'Liturgia actualizada correctamente como borrador.'; ?>
      </div>
    <?php endif; ?>

    <div class="alert alert-success">
      <strong>Editor JSON de Liturgia del Día.</strong>
      Puedes editar el contenido editorial directamente. La fecha, el origen y los campos técnicos permanecen protegidos.
      En los textos puedes utilizar <strong>**negrita**</strong>, <em>*cursiva*</em>, <strong>## Título</strong>, <strong>&gt; Cita</strong> y <strong>- Lista</strong>.
    </div>

    <article class="panel">
      <div class="panel-header">
        <div>
          <span class="eyebrow">Edición estructurada</span>
          <h2>JSON de Liturgia del Día</h2>
          <p class="muted">Corrige lecturas, celebración, tiempo litúrgico, color y estado. Los cambios se validan antes de guardarse.</p>
        </div>
        <a class="btn btn-soft" href="liturgia-dia.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=preview">Vista previa</a>
      </div>

      <form method="post" class="content-form" id="liturgia-json-form">
        <?php echo csrf_field(); ?>
        <input type="hidden" name="action" value="save_json">
        <input type="hidden" name="id" value="<?php echo (int) $editRow['id']; ?>">

        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px;">
          <button type="button" class="btn btn-soft" data-json-format>✣ Formatear</button>
          <button type="button" class="btn btn-soft" data-json-copy>▣ Copiar</button>
          <button type="button" class="btn btn-soft" data-json-bold><strong>Negrita</strong></button>
          <button type="button" class="btn btn-soft" data-json-italic><em>Cursiva</em></button>
          <button type="button" class="btn btn-soft" data-json-heading>## Título</button>
          <button type="button" class="btn btn-soft" data-json-quote>&gt; Cita</button>
          <button type="button" class="btn btn-soft" data-json-list>- Lista</button>
          <button type="button" class="btn btn-soft" data-json-restore>↶ Restaurar</button>
          <span id="liturgia-json-status" style="font-size:12px;opacity:.75;margin-left:auto;">JSON válido</span>
        </div>

        <label class="content-field full">
          <span>JSON editable</span>
          <textarea id="liturgia-json-editor" name="json_content" rows="32" spellcheck="false"
            style="width:100%;box-sizing:border-box;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;line-height:1.55;white-space:pre;tab-size:2;background:#ffffff;color:#111827;border:1px solid rgba(212,175,55,.55);border-radius:14px;padding:18px;resize:vertical;"><?php echo e($jsonPreview); ?></textarea>
        </label>

        <div class="form-actions">
          <button class="btn btn-gold" type="submit">Guardar JSON</button>
          <a class="btn btn-soft" href="liturgia-dia.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=preview">Cancelar</a>
        </div>
      </form>
    </article>

    <script>
    document.addEventListener('DOMContentLoaded', function () {
      const editor = document.getElementById('liturgia-json-editor');
      const status = document.getElementById('liturgia-json-status');
      if (!editor) return;
      const original = editor.value;

      function setStatus(message, valid) {
        if (!status) return;
        status.textContent = message;
        status.style.color = valid === false ? '#dc2626' : '#6b7280';
      }

      function validate() {
        try {
          JSON.parse(editor.value);
          setStatus('JSON válido', true);
          return true;
        } catch (error) {
          setStatus('JSON inválido: ' + error.message, false);
          return false;
        }
      }

      function wrapSelection(prefix, suffix) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selected = editor.value.slice(start, end) || 'texto';
        editor.setRangeText(prefix + selected + suffix, start, end, 'select');
        editor.focus();
      }

      function prefixLines(prefix) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selected = editor.value.slice(start, end) || 'texto';
        const replacement = selected.split('\n').map(function (line) {
          return line ? prefix + line : line;
        }).join('\n');
        editor.setRangeText(replacement, start, end, 'select');
        editor.focus();
      }

      document.querySelector('[data-json-format]')?.addEventListener('click', function () {
        try {
          editor.value = JSON.stringify(JSON.parse(editor.value), null, 2);
          setStatus('JSON formateado y válido', true);
        } catch (error) {
          setStatus('No se puede formatear: JSON inválido', false);
        }
      });

      document.querySelector('[data-json-copy]')?.addEventListener('click', async function () {
        try {
          await navigator.clipboard.writeText(editor.value);
          setStatus('JSON copiado', true);
        } catch (error) {
          editor.select();
          document.execCommand('copy');
          setStatus('JSON copiado', true);
        }
      });

      document.querySelector('[data-json-bold]')?.addEventListener('click', function () {
        wrapSelection('**', '**');
      });

      document.querySelector('[data-json-italic]')?.addEventListener('click', function () {
        wrapSelection('*', '*');
      });

      document.querySelector('[data-json-heading]')?.addEventListener('click', function () {
        prefixLines('## ');
      });

      document.querySelector('[data-json-quote]')?.addEventListener('click', function () {
        prefixLines('> ');
      });

      document.querySelector('[data-json-list]')?.addEventListener('click', function () {
        prefixLines('- ');
      });

      document.querySelector('[data-json-restore]')?.addEventListener('click', function () {
        if (confirm('¿Restaurar el JSON original? Se perderán los cambios no guardados.')) {
          editor.value = original;
          validate();
        }
      });

      editor.addEventListener('input', validate);

      document.getElementById('liturgia-json-form')?.addEventListener('submit', function (event) {
        if (!validate()) {
          event.preventDefault();
          alert('Corrige el JSON antes de guardar.');
        }
      });
    });
    </script>

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
          <td class="actions grid-actions"><a class="action-button action-edit" href="liturgia-dia.php?edit=<?php echo (int) $row['id']; ?>&amp;vista=preview">Revisar</a> <a class="action-button" href="liturgia-dia.php?edit=<?php echo (int) $row['id']; ?>&amp;vista=json">JSON</a></td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$rows): ?><tr><td colspan="7" class="muted">No hay Liturgias para este filtro.</td></tr><?php endif; ?>
      </tbody>
    </table>
  </div>
</section>
<?php endif; ?>


<style id="lvj-rich-editor-styles">
.lvj-rich-editor{width:100%;}
.lvj-rich-toolbar{display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:9px 12px;border:1px solid #e5e7eb;border-bottom:0;border-radius:12px 12px 0 0;background:#f8fafc;color:#1f2937;}
.lvj-rich-toolbar button{appearance:none;border:0;background:transparent;color:#1f2937;cursor:pointer;min-width:28px;height:28px;padding:3px 6px;border-radius:6px;font:600 14px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}
.lvj-rich-toolbar button:hover{background:#e5e7eb;}
.lvj-rich-toolbar .lvj-tool-heading{font-size:13px;font-weight:800;}
.lvj-rich-toolbar .lvj-tool-bold{font-weight:900;}
.lvj-rich-toolbar .lvj-tool-italic{font-style:italic;font-family:Georgia,serif;}
.lvj-rich-toolbar .lvj-tool-quote{font-size:18px;font-weight:900;}
.lvj-rich-toolbar .lvj-tool-list{font-size:17px;}
.lvj-rich-toolbar .lvj-tool-preview{margin-left:auto;display:inline-flex;align-items:center;gap:5px;font-size:12px;white-space:nowrap;}
.lvj-rich-editor textarea{border-radius:0 0 12px 12px !important;}
.lvj-rich-preview{display:none;margin-top:8px;padding:14px 16px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;color:#1f2937;line-height:1.7;}
.lvj-rich-preview.is-visible{display:block;}
.lvj-rich-preview h2,.lvj-rich-preview h3{margin:.2rem 0 .55rem;color:#17324d;}
.lvj-rich-preview blockquote{margin:.7rem 0;padding:.45rem .8rem;border-left:3px solid #d4af37;background:#fffbeb;}
.lvj-rich-preview ul,.lvj-rich-preview ol{padding-left:1.4rem;}
.lvj-rich-preview p{margin:.45rem 0;}
</style>

<script id="lvj-rich-editor-script">
document.addEventListener('DOMContentLoaded', function () {
  const textareas = document.querySelectorAll('textarea[name]:not([name="json_content"])');
  if (!textareas.length) return;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, function (char) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[char];
    });
  }

  function markdownToHtml(value) {
    const lines = String(value ?? '').split('\n');
    let html = '';
    let listType = null;

    function closeList() {
      if (listType === 'ul') html += '</ul>';
      if (listType === 'ol') html += '</ol>';
      listType = null;
    }

    lines.forEach(function (rawLine) {
      const line = rawLine.trimEnd();
      const safe = escapeHtml(line);

      if (/^###\s+/.test(line)) {
        closeList();
        html += '<h3>' + escapeHtml(line.replace(/^###\s+/, '')) + '</h3>';
        return;
      }
      if (/^##\s+/.test(line)) {
        closeList();
        html += '<h2>' + escapeHtml(line.replace(/^##\s+/, '')) + '</h2>';
        return;
      }
      if (/^>\s?/.test(line)) {
        closeList();
        html += '<blockquote>' + inlineMarkdown(escapeHtml(line.replace(/^>\s?/, ''))) + '</blockquote>';
        return;
      }
      if (/^[-*]\s+/.test(line)) {
        if (listType !== 'ul') { closeList(); html += '<ul>'; listType = 'ul'; }
        html += '<li>' + inlineMarkdown(escapeHtml(line.replace(/^[-*]\s+/, ''))) + '</li>';
        return;
      }
      if (/^\d+[.)]\s+/.test(line)) {
        if (listType !== 'ol') { closeList(); html += '<ol>'; listType = 'ol'; }
        html += '<li>' + inlineMarkdown(escapeHtml(line.replace(/^\d+[.)]\s+/, ''))) + '</li>';
        return;
      }

      closeList();
      if (line.trim() === '') {
        html += '<div style="height:.45rem"></div>';
      } else {
        html += '<p>' + inlineMarkdown(safe) + '</p>';
      }
    });

    closeList();
    return html;
  }

  function inlineMarkdown(value) {
    return value
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  }

  function selectedText(editor) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    return {start, end, text: editor.value.slice(start, end)};
  }

  function wrapSelection(editor, prefix, suffix) {
    const selection = selectedText(editor);
    const text = selection.text || 'texto';
    editor.setRangeText(prefix + text + suffix, selection.start, selection.end, 'select');
    editor.focus();
    editor.dispatchEvent(new Event('input', {bubbles:true}));
  }

  function prefixLines(editor, prefix) {
    const selection = selectedText(editor);
    const text = selection.text || 'texto';
    const replacement = text.split('\n').map(function (line) {
      return prefix + line;
    }).join('\n');
    editor.setRangeText(replacement, selection.start, selection.end, 'select');
    editor.focus();
    editor.dispatchEvent(new Event('input', {bubbles:true}));
  }

  function addButton(toolbar, label, className, action, title) {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = label;
    button.className = className || '';
    button.title = title || '';
    button.setAttribute('aria-label', title || label);
    button.addEventListener('click', function () { action(); });
    toolbar.appendChild(button);
    return button;
  }

  textareas.forEach(function (editor) {
    if (editor.dataset.richToolbarReady === '1') return;
    editor.dataset.richToolbarReady = '1';

    const wrapper = document.createElement('div');
    wrapper.className = 'lvj-rich-editor';

    const toolbar = document.createElement('div');
    toolbar.className = 'lvj-rich-toolbar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', 'Herramientas de formato');

    addButton(toolbar, 'H₂', 'lvj-tool-heading', function () { prefixLines(editor, '## '); }, 'Título H2');
    addButton(toolbar, 'H₃', 'lvj-tool-heading', function () { prefixLines(editor, '### '); }, 'Subtítulo H3');
    addButton(toolbar, 'B', 'lvj-tool-bold', function () { wrapSelection(editor, '**', '**'); }, 'Negrita');
    addButton(toolbar, 'I', 'lvj-tool-italic', function () { wrapSelection(editor, '*', '*'); }, 'Cursiva');
    addButton(toolbar, '❞', 'lvj-tool-quote', function () { prefixLines(editor, '> '); }, 'Cita');
    addButton(toolbar, '•', 'lvj-tool-list', function () { prefixLines(editor, '- '); }, 'Lista');
    addButton(toolbar, '1.', 'lvj-tool-list', function () { prefixLines(editor, '1. '); }, 'Lista numerada');

    const previewButton = addButton(toolbar, '◉ Vista previa', 'lvj-tool-preview', function () {
      preview.classList.toggle('is-visible');
      previewButton.innerHTML = preview.classList.contains('is-visible') ? '◉ Ocultar vista previa' : '◉ Vista previa';
      if (preview.classList.contains('is-visible')) preview.innerHTML = markdownToHtml(editor.value);
    }, 'Vista previa');

    const preview = document.createElement('div');
    preview.className = 'lvj-rich-preview';
    preview.setAttribute('aria-live', 'polite');

    const parent = editor.parentNode;
    parent.insertBefore(wrapper, editor);
    wrapper.appendChild(toolbar);
    wrapper.appendChild(editor);
    wrapper.appendChild(preview);

    editor.addEventListener('input', function () {
      if (preview.classList.contains('is-visible')) preview.innerHTML = markdownToHtml(editor.value);
    });
  });
});
</script>
<?php require __DIR__ . '/includes/footer.php'; ?>
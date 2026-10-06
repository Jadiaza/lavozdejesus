<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();
$table = 'lvj_lit_lectio_divina';
$pageTitle = 'Lectio Divina';
$pageSubtitle = 'Revisión editorial del contenido pastoral generado para la Liturgia';
$message = '';
$error = '';

function lectio_admin_columns(PDO $pdo): array
{
  try {
    $rows = $pdo->query('SHOW COLUMNS FROM lvj_lit_lectio_divina')->fetchAll();
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

function lectio_admin_text(mixed $value): string
{
  return trim((string) ($value ?? ''));
}

function lectio_admin_status(string $value): string
{
  $value = strtolower(trim($value));
  return in_array($value, ['borrador', 'publicado'], true) ? $value : 'borrador';
}

function lectio_admin_required_for_publish(array $data): string
{
  $required = [
    'cita' => 'Cita bíblica',
    'frase_destacada' => 'Frase destacada',
    'cita_destacada' => 'Cita del versículo destacado',
    'reflexion' => 'Reflexión',
    'pregunta_meditar' => 'Pregunta para meditar',
    'oracion' => 'Oración',
    'compromiso' => 'Compromiso',
    'mensaje_final' => 'Mensaje final',
  ];

  foreach ($required as $field => $label) {
    if (lectio_admin_text($data[$field] ?? '') === '') {
      return 'Para publicar debes completar: ' . $label . '.';
    }
  }

  return '';
}

function lectio_admin_json_payload(array $row): array
{
  return [
    'lectio_divina' => [
      'fecha' => lectio_admin_text($row['fecha'] ?? ''),
      'cita' => lectio_admin_text($row['cita'] ?? ''),
      'frase_destacada' => lectio_admin_text($row['frase_destacada'] ?? ''),
      'cita_destacada' => lectio_admin_text($row['cita_destacada'] ?? $row['cita'] ?? ''),
      'reflexion' => lectio_admin_text($row['reflexion'] ?? ''),
      'pregunta_meditar' => lectio_admin_text($row['pregunta_meditar'] ?? ''),
      'oracion' => lectio_admin_text($row['oracion'] ?? ''),
      'compromiso' => lectio_admin_text($row['compromiso'] ?? ''),
      'mensaje_final' => lectio_admin_text($row['mensaje_final'] ?? ''),
      'audio_url' => lectio_admin_text($row['audio_url'] ?? ''),
      'estado' => lectio_admin_status((string) ($row['estado'] ?? 'borrador')),
    ],
    'revision_editorial' => [
      'id' => (int) ($row['id'] ?? 0),
      'cita_clave' => lectio_admin_text($row['cita_clave'] ?? ''),
      'origen' => (int) ($row['generada_ia'] ?? 0) === 1 ? 'IA' : 'Manual',
      'generada_ia' => (int) ($row['generada_ia'] ?? 0) === 1,
      'modelo_ia' => lectio_admin_text($row['modelo_ia'] ?? ''),
      'prompt_version' => lectio_admin_text($row['prompt_version'] ?? ''),
      'revisado_at' => lectio_admin_text($row['revisado_at'] ?? ''),
      'updated_at' => lectio_admin_text($row['updated_at'] ?? ''),
    ],
  ];
}

$columns = lectio_admin_columns($pdo);
$requiredSchema = [
  'id', 'fecha', 'cita', 'cita_clave', 'frase_destacada', 'cita_destacada', 'reflexion',
  'pregunta_meditar', 'oracion', 'compromiso', 'mensaje_final', 'estado',
  'generada_ia', 'modelo_ia', 'prompt_version', 'revisado_at',
];
$missingColumns = array_values(array_filter(
  $requiredSchema,
  static fn (string $field): bool => !isset($columns[$field]),
));
$schemaReady = $missingColumns === [];
$hasDeletedAt = isset($columns['deleted_at']);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf();

  if (!$schemaReady) {
    $error = 'La estructura de Lectio Divina no está completa en la base de datos.';
  } elseif ((string) ($_POST['action'] ?? '') === 'save_json') {
    $id = max(0, (int) ($_POST['id'] ?? 0));
    $jsonContent = (string) ($_POST['json_content'] ?? '');
    $decoded = null;

    try {
      $decoded = json_decode($jsonContent, true, 512, JSON_THROW_ON_ERROR);
    } catch (Throwable $jsonSaveError) {
      $error = 'El JSON no es válido: ' . $jsonSaveError->getMessage();
    }

    if ($error === '' && $id <= 0) {
      $error = 'No se indicó una Lectio válida para editar.';
    }

    if ($error === '' && (!is_array($decoded) || !isset($decoded['lectio_divina']) || !is_array($decoded['lectio_divina']))) {
      $error = 'El JSON debe contener el objeto "lectio_divina".';
    }

    if ($error === '') {
      try {
        $existingSql = 'SELECT * FROM lvj_lit_lectio_divina WHERE id = :id';
        if ($hasDeletedAt) $existingSql .= ' AND deleted_at IS NULL';
        $existingSql .= ' LIMIT 1';
        $existingStmt = $pdo->prepare($existingSql);
        $existingStmt->execute(['id' => $id]);
        $existing = $existingStmt->fetch() ?: [];

        if (!$existing) {
          $error = 'La Lectio seleccionada ya no está disponible.';
        } else {
          $payload = $decoded['lectio_divina'];

          // Fecha, cita canónica y metadatos técnicos permanecen protegidos.
          $data = [
            'frase_destacada' => lectio_admin_text($payload['frase_destacada'] ?? '') ?: null,
            'cita_destacada' => mb_substr(lectio_admin_text($payload['cita_destacada'] ?? ''), 0, 80, 'UTF-8') ?: null,
            'reflexion' => lectio_admin_text($payload['reflexion'] ?? '') ?: null,
            'pregunta_meditar' => lectio_admin_text($payload['pregunta_meditar'] ?? '') ?: null,
            'oracion' => lectio_admin_text($payload['oracion'] ?? '') ?: null,
            'compromiso' => lectio_admin_text($payload['compromiso'] ?? '') ?: null,
            'mensaje_final' => lectio_admin_text($payload['mensaje_final'] ?? '') ?: null,
            'audio_url' => lectio_admin_text($payload['audio_url'] ?? '') ?: null,
          ];

          if (isset($payload['estado'])) $data['estado'] = lectio_admin_status((string) $payload['estado']);

          if ($data['audio_url'] !== null && (!filter_var($data['audio_url'], FILTER_VALIDATE_URL) || !preg_match('/^https?:\/\//i', $data['audio_url']))) {
            $error = 'La URL del audio no es válida.';
          }

          $targetState = $data['estado'] ?? ($existing['estado'] ?? 'borrador');
          if ($error === '' && $targetState === 'publicado') {
            $error = lectio_admin_required_for_publish(array_merge($existing, $data));
          }

          if ($error === '') {
            $assignments = [];
            $params = ['id' => $id];
            foreach ($data as $field => $value) {
              if (!isset($columns[$field])) continue;
              $assignments[] = "`{$field}` = :{$field}";
              $params[$field] = $value;
            }
            if (isset($columns['updated_at'])) $assignments[] = 'updated_at = NOW()';
            if ($targetState === 'publicado' && isset($columns['revisado_at'])) $assignments[] = 'revisado_at = NOW()';

            if ($assignments) {
              $stmt = $pdo->prepare(
                'UPDATE lvj_lit_lectio_divina SET ' . implode(', ', $assignments) . ' WHERE id = :id LIMIT 1'
              );
              $stmt->execute($params);
            }

            log_activity('update', $table, $id, $targetState === 'publicado' ? 'Lectio editada desde JSON y publicada' : 'Lectio editada desde JSON');
            header('Location: lectio-divina.php?edit=' . $id . '&vista=json&saved=json');
            exit;
          }
        }
      } catch (Throwable $jsonSaveDbError) {
        $error = 'No se pudo guardar el JSON: ' . $jsonSaveDbError->getMessage();
      }
    }
  } elseif ((string) ($_POST['action'] ?? '') === 'save') {
    $id = max(0, (int) ($_POST['id'] ?? 0));
    $existing = [];

    if ($id > 0) {
      $existingSql = 'SELECT * FROM lvj_lit_lectio_divina WHERE id = :id';
      if ($hasDeletedAt) {
        $existingSql .= ' AND deleted_at IS NULL';
      }
      $existingSql .= ' LIMIT 1';
      $existingStmt = $pdo->prepare($existingSql);
      $existingStmt->execute(['id' => $id]);
      $existing = $existingStmt->fetch() ?: [];
      if (!$existing) {
        $error = 'La Lectio seleccionada ya no está disponible.';
      }
    }

    if ($error === '') {
      $generatedLocked = $existing && (
        (int) ($existing['generada_ia'] ?? 0) === 1
        || lectio_admin_text($existing['cita_clave'] ?? '') !== ''
      );

      $fecha = $generatedLocked
        ? substr(lectio_admin_text($existing['fecha'] ?? ''), 0, 10)
        : substr(lectio_admin_text($_POST['fecha'] ?? ''), 0, 10);

      $cita = $generatedLocked
        ? mb_substr(lectio_admin_text($existing['cita'] ?? ''), 0, 160, 'UTF-8')
        : mb_substr(lectio_admin_text($_POST['cita'] ?? ''), 0, 160, 'UTF-8');

      $estado = lectio_admin_status((string) ($_POST['estado'] ?? 'borrador'));
      $audioUrl = lectio_admin_text($_POST['audio_url'] ?? '');

      $data = [
        'fecha' => $fecha,
        'cita' => $cita !== '' ? $cita : null,
        'frase_destacada' => lectio_admin_text($_POST['frase_destacada'] ?? '') ?: null,
        'cita_destacada' => mb_substr(lectio_admin_text($_POST['cita_destacada'] ?? ''), 0, 80, 'UTF-8') ?: null,
        'reflexion' => lectio_admin_text($_POST['reflexion'] ?? '') ?: null,
        'pregunta_meditar' => lectio_admin_text($_POST['pregunta_meditar'] ?? '') ?: null,
        'oracion' => lectio_admin_text($_POST['oracion'] ?? '') ?: null,
        'compromiso' => lectio_admin_text($_POST['compromiso'] ?? '') ?: null,
        'mensaje_final' => lectio_admin_text($_POST['mensaje_final'] ?? '') ?: null,
        'audio_url' => $audioUrl !== '' ? $audioUrl : null,
        'estado' => $estado,
      ];

      if ($fecha === '' || preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha) !== 1) {
        $error = 'La fecha es obligatoria y debe usar el formato YYYY-MM-DD.';
      } elseif ($audioUrl !== '' && (!filter_var($audioUrl, FILTER_VALIDATE_URL) || !preg_match('/^https?:\/\//i', $audioUrl))) {
        $error = 'La URL del audio no es válida.';
      } elseif ($estado === 'publicado') {
        $error = lectio_admin_required_for_publish($data);
      }

      if ($error === '') {
        try {
          if ($id > 0) {
            $assignments = [];
            $params = ['id' => $id];
            foreach ($data as $field => $value) {
              if (!isset($columns[$field])) {
                continue;
              }
              $assignments[] = "`{$field}` = :{$field}";
              $params[$field] = $value;
            }
            if (isset($columns['updated_at'])) {
              $assignments[] = 'updated_at = NOW()';
            }
            if ($estado === 'publicado' && isset($columns['revisado_at'])) {
              $assignments[] = 'revisado_at = NOW()';
            }

            $stmt = $pdo->prepare(
              'UPDATE lvj_lit_lectio_divina SET ' . implode(', ', $assignments) . ' WHERE id = :id LIMIT 1'
            );
            $stmt->execute($params);
            log_activity(
              'update',
              $table,
              $id,
              $estado === 'publicado' ? 'Lectio revisada y publicada' : 'Lectio guardada como borrador',
            );
            header(
              'Location: lectio-divina.php?edit=' . $id
              . '&vista=preview&saved=' . ($estado === 'publicado' ? 'published' : 'draft')
            );
            exit;
          }

          $fields = [];
          $placeholders = [];
          $params = [];
          foreach ($data as $field => $value) {
            if (!isset($columns[$field])) {
              continue;
            }
            $fields[] = $field;
            $placeholders[] = ':' . $field;
            $params[$field] = $value;
          }

          $stmt = $pdo->prepare(
            'INSERT INTO lvj_lit_lectio_divina (`' . implode('`,`', $fields) . '`) VALUES (' . implode(',', $placeholders) . ')'
          );
          $stmt->execute($params);
          $savedId = (int) $pdo->lastInsertId();

          if ($estado === 'publicado' && isset($columns['revisado_at'])) {
            $pdo->prepare(
              'UPDATE lvj_lit_lectio_divina SET revisado_at = NOW() WHERE id = :id LIMIT 1'
            )->execute(['id' => $savedId]);
          }

          log_activity('create', $table, $savedId, 'Lectio creada manualmente');
          header(
            'Location: lectio-divina.php?edit=' . $savedId
            . '&vista=preview&saved=' . ($estado === 'publicado' ? 'published' : 'created')
          );
          exit;
        } catch (Throwable $saveError) {
          $error = 'No se pudo guardar la Lectio: ' . $saveError->getMessage();
        }
      }
    }
  }
}

if (isset($_GET['saved'])) {
  $saved = (string) $_GET['saved'];
  $message = $saved === 'published'
    ? 'Lectio revisada y publicada correctamente.'
    : ($saved === 'draft' ? 'Lectio guardada como borrador.' : 'Lectio creada correctamente.');
}

$editId = max(0, (int) ($_GET['edit'] ?? 0));
$editRow = [];
if ($schemaReady && $editId > 0) {
  try {
    $editSql = 'SELECT * FROM lvj_lit_lectio_divina WHERE id = :id';
    if ($hasDeletedAt) {
      $editSql .= ' AND deleted_at IS NULL';
    }
    $editSql .= ' LIMIT 1';

    $stmt = $pdo->prepare($editSql);
    $stmt->execute(['id' => $editId]);
    $editRow = $stmt->fetch() ?: [];
  } catch (Throwable $editError) {
    $editRow = [];
  }
}

$reviewView = strtolower(lectio_admin_text($_GET['vista'] ?? 'preview'));
if (!in_array($reviewView, ['preview', 'editar', 'json'], true)) {
  $reviewView = 'preview';
}

$isNew = ((string) ($_GET['action'] ?? '')) === 'new';
if ($isNew) {
  $reviewView = 'editar';
}

$jsonPreview = '';
if ($editRow) {
  try {
    $jsonPreview = json_encode(
      lectio_admin_json_payload($editRow),
      JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR,
    );
  } catch (Throwable $jsonError) {
    $jsonPreview = '{"error":"No fue posible construir la vista JSON."}';
  }
}

$estadoFiltro = strtolower(lectio_admin_text($_GET['estado'] ?? 'borrador'));
if (!in_array($estadoFiltro, ['borrador', 'publicado', 'todos'], true)) {
  $estadoFiltro = 'borrador';
}
$search = lectio_admin_text($_GET['q'] ?? '');
$counts = ['borrador' => 0, 'publicado' => 0];
$rows = [];

if ($schemaReady) {
  try {
    $baseWhere = $hasDeletedAt ? 'deleted_at IS NULL' : '1=1';
    foreach (array_keys($counts) as $state) {
      $count = $pdo->prepare(
        "SELECT COUNT(*) FROM lvj_lit_lectio_divina WHERE {$baseWhere} AND estado = :estado"
      );
      $count->execute(['estado' => $state]);
      $counts[$state] = (int) $count->fetchColumn();
    }

    $where = [$baseWhere];
    $params = [];
    if ($estadoFiltro !== 'todos') {
      $where[] = 'estado = :estado';
      $params['estado'] = $estadoFiltro;
    }
    if ($search !== '') {
      $where[] = '(fecha LIKE :q OR cita LIKE :q OR frase_destacada LIKE :q)';
      $params['q'] = '%' . $search . '%';
    }

    $stmt = $pdo->prepare(
      'SELECT id, fecha, cita, frase_destacada, estado, generada_ia, modelo_ia, prompt_version, revisado_at, updated_at '
      . 'FROM lvj_lit_lectio_divina WHERE ' . implode(' AND ', $where)
      . ' ORDER BY id DESC LIMIT 200'
    );
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
  } catch (Throwable $listError) {
    $error = $error ?: 'No se pudieron cargar las Lectio: ' . $listError->getMessage();
  }
}

$formRow = $editRow ?: [
  'id' => 0,
  'fecha' => date('Y-m-d'),
  'cita' => '',
  'frase_destacada' => '',
  'reflexion' => '',
  'pregunta_meditar' => '',
  'oracion' => '',
  'compromiso' => '',
  'mensaje_final' => '',
  'audio_url' => '',
  'estado' => 'borrador',
  'generada_ia' => 0,
  'cita_clave' => '',
];

require __DIR__ . '/includes/header.php';
?>

<nav class="content-toolbar" aria-label="Revisión editorial de Liturgia">
  <div class="content-tabs">
    <a href="liturgia-dia.php">Liturgia del Día</a>
    <a href="liturgia-ordo.php">Sincronizar Ordo</a>
    <a class="active" href="lectio-divina.php">Lectio Divina</a>
    <a href="santoral-dia.php">Santo del Día</a>
    <a href="content.php?module=liturgia&amp;table=lvj_lit_dia">Configuración litúrgica</a>
  </div>
</nav>

<section class="panel content-overview-panel">
  <div class="content-overview">
    <div>
      <span class="eyebrow">Liturgia</span>
      <h2>Lectio Divina</h2>
      <p class="muted">Revisa el contenido pastoral, compáralo visualmente y publícalo solo después de aprobación humana.</p>
    </div>
    <div class="content-actions-bar">
      <a class="btn btn-soft" href="liturgia-dia.php">Liturgia del Día</a>
      <a class="btn btn-gold" href="lectio-divina.php?action=new">+ Nueva Lectio manual</a>
    </div>
  </div>

  <?php if ($message): ?><div class="alert alert-success"><?php echo e($message); ?></div><?php endif; ?>
  <?php if ($error): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>
  <?php if (!$schemaReady): ?>
    <div class="alert alert-error">Faltan columnas de la migración de Lectio: <?php echo e(implode(', ', $missingColumns)); ?>.</div>
  <?php endif; ?>
</section>

<?php if ($schemaReady): ?>
<section class="stats-grid pending-stats">
  <a class="stat-card stat-card-link" href="lectio-divina.php?estado=borrador">
    <div class="stat-icon gold">LD</div><span>Borradores</span><strong><?php echo (int) $counts['borrador']; ?></strong><small>Pendientes de revisión humana</small>
  </a>
  <a class="stat-card stat-card-link" href="lectio-divina.php?estado=publicado">
    <div class="stat-icon green">OK</div><span>Publicadas</span><strong><?php echo (int) $counts['publicado']; ?></strong><small>Disponibles para la PWA</small>
  </a>
</section>
<?php endif; ?>

<?php if ($editRow || $isNew): ?>
<section class="panel content-editor-panel">
  <div class="panel-header">
    <div>
      <h2><?php echo $isNew ? 'Crear Lectio manual' : 'Revisar Lectio Divina'; ?></h2>
      <p class="muted">
        <?php echo $isNew
          ? 'Contenido editorial manual.'
          : e((string) ($editRow['cita'] ?? '')); ?>
      </p>
    </div>
    <a class="btn btn-soft" href="lectio-divina.php">Volver</a>
  </div>

  <?php if ($editRow && (int) ($editRow['generada_ia'] ?? 0) === 1): ?>
    <div class="alert alert-success">
      Generada por IA · Modelo: <?php echo e((string) ($editRow['modelo_ia'] ?? '')); ?> · Prompt: <?php echo e((string) ($editRow['prompt_version'] ?? '')); ?>.
      La cita canónica y los metadatos técnicos están protegidos.
    </div>
  <?php endif; ?>

  <?php if (!$isNew): ?>
  <nav class="content-toolbar" aria-label="Vista de revisión de Lectio Divina">
    <div class="content-tabs">
      <a class="<?php echo $reviewView === 'preview' ? 'active' : ''; ?>" href="lectio-divina.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=preview">Vista previa</a>
      <a class="<?php echo $reviewView === 'editar' ? 'active' : ''; ?>" href="lectio-divina.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=editar">Editar contenido</a>
      <a class="<?php echo $reviewView === 'json' ? 'active' : ''; ?>" href="lectio-divina.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=json">JSON</a>
    </div>
  </nav>
  <?php endif; ?>

  <?php if (!$isNew && $reviewView === 'preview'): ?>
    <?php
      $previewSections = [
        'Reflexión' => lectio_admin_text($editRow['reflexion'] ?? ''),
        'Pregunta para meditar' => lectio_admin_text($editRow['pregunta_meditar'] ?? ''),
        'Oración' => lectio_admin_text($editRow['oracion'] ?? ''),
        'Compromiso' => lectio_admin_text($editRow['compromiso'] ?? ''),
        'Mensaje final' => lectio_admin_text($editRow['mensaje_final'] ?? ''),
      ];
      $previewPublished = lectio_admin_status((string) ($editRow['estado'] ?? 'borrador')) === 'publicado';
    ?>

    <div class="content-form-grid">
      <article class="panel content-field full">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Lectio Divina</span>
            <h2><?php echo e((string) ($editRow['cita'] ?? '')); ?></h2>
            <p class="muted"><?php echo e((string) ($editRow['fecha'] ?? '')); ?></p>
          </div>
          <span class="status-pill status-<?php echo $previewPublished ? 'active' : 'draft'; ?>"><?php echo $previewPublished ? 'Publicado' : 'Borrador'; ?></span>
        </div>

        <?php if (!empty($editRow['frase_destacada'])): ?>
          <div class="alert alert-success">
            <div>«<?php echo e(trim((string) $editRow['frase_destacada'], " \t\n\r\0\x0B«»\"“”")); ?>»</div>
            <?php if (!empty($editRow['cita_destacada'])): ?>
              <div style="margin-top:8px;color:#a56f08;font-weight:800;"><?php echo e((string) $editRow['cita_destacada']); ?></div>
            <?php endif; ?>
          </div>
        <?php endif; ?>
      </article>

      <?php foreach ($previewSections as $sectionTitle => $sectionText): ?>
        <article class="panel content-field full">
          <div class="panel-header">
            <div><span class="eyebrow">Lectio Divina</span><h2><?php echo e($sectionTitle); ?></h2></div>
          </div>
          <?php if ($sectionText !== ''): ?>
            <div style="white-space:pre-wrap;line-height:1.75;"><?php echo e($sectionText); ?></div>
          <?php else: ?>
            <p class="muted">Este campo todavía está vacío.</p>
          <?php endif; ?>
        </article>
      <?php endforeach; ?>

      <?php if (!empty($editRow['audio_url'])): ?>
        <article class="panel content-field full">
          <div class="panel-header"><div><span class="eyebrow">Multimedia</span><h2>Audio</h2></div></div>
          <audio controls preload="none" src="<?php echo e((string) $editRow['audio_url']); ?>" style="width:100%;"></audio>
        </article>
      <?php endif; ?>
    </div>

    <div class="form-actions">
      <a class="btn btn-gold" href="lectio-divina.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=editar">Editar contenido</a>
      <a class="btn btn-soft" href="lectio-divina.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=json">Ver JSON</a>
    </div>

  <?php elseif (!$isNew && $reviewView === 'json'): ?>
    <?php $jsonSaved = isset($_GET['saved']) && $_GET['saved'] === 'json'; ?>
    <?php if ($jsonSaved): ?><div class="alert alert-success">JSON actualizado correctamente.</div><?php endif; ?>
    <div class="alert alert-success">
      <strong>Editor JSON de Lectio Divina.</strong>
      Puedes editar el contenido pastoral directamente. La fecha, cita canónica y metadatos técnicos permanecen protegidos.
      Para el texto puedes usar <strong>**negrita**</strong>, <em>*cursiva*</em>, <strong>## Título</strong>, <strong>&gt; Cita</strong> y <strong>- Lista</strong>.
    </div>
    <article class="panel">
      <div class="panel-header">
        <div><span class="eyebrow">Edición estructurada</span><h2>JSON de Lectio Divina</h2></div>
        <a class="btn btn-soft" href="lectio-divina.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=preview">Vista previa</a>
      </div>

      <form method="post" id="lectio-json-form">
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
          <span id="json-editor-status" style="font-size:12px;opacity:.75;margin-left:auto;">JSON válido</span>
        </div>

        <textarea id="lectio-json-editor" name="json_content" rows="32" spellcheck="false"
          style="width:100%;box-sizing:border-box;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;line-height:1.55;tab-size:2;background:#ffffff;color:#111827;border:1px solid rgba(212,175,55,.55);border-radius:14px;padding:18px;resize:vertical;"><?php echo e($jsonPreview); ?></textarea>

        <div class="form-actions" style="margin-top:14px;">
          <button class="btn btn-gold" type="submit">Guardar JSON</button>
          <a class="btn btn-soft" href="lectio-divina.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=editar">Editar por campos</a>
        </div>
      </form>
    </article>

    <script>
    document.addEventListener('DOMContentLoaded', function () {
      const editor = document.getElementById('lectio-json-editor');
      const status = document.getElementById('json-editor-status');
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
      document.querySelector('[data-json-bold]')?.addEventListener('click', function () { wrapSelection('**', '**'); });
      document.querySelector('[data-json-italic]')?.addEventListener('click', function () { wrapSelection('*', '*'); });
      document.querySelector('[data-json-heading]')?.addEventListener('click', function () { prefixLines('## '); });
      document.querySelector('[data-json-quote]')?.addEventListener('click', function () { prefixLines('> '); });
      document.querySelector('[data-json-list]')?.addEventListener('click', function () { prefixLines('- '); });
      document.querySelector('[data-json-restore]')?.addEventListener('click', function () {
        if (confirm('¿Restaurar el JSON original? Se perderán los cambios no guardados.')) {
          editor.value = original;
          validate();
        }
      });
      editor.addEventListener('input', validate);
      document.getElementById('lectio-json-form')?.addEventListener('submit', function (event) {
        if (!validate()) {
          event.preventDefault();
          alert('Corrige el JSON antes de guardar.');
        }
      });
    });
    </script>

  <?php else: ?>
    <?php $generatedLocked = !$isNew && (
      (int) ($formRow['generada_ia'] ?? 0) === 1
      || lectio_admin_text($formRow['cita_clave'] ?? '') !== ''
    ); ?>

    <form method="post" class="content-form">
      <?php echo csrf_field(); ?>
      <input type="hidden" name="action" value="save">
      <input type="hidden" name="id" value="<?php echo (int) ($formRow['id'] ?? 0); ?>">

      <div class="content-form-grid">
        <label class="content-field">Fecha
          <input type="date" name="fecha" required value="<?php echo e((string) ($formRow['fecha'] ?? date('Y-m-d'))); ?>" <?php echo $generatedLocked ? 'disabled' : ''; ?>>
        </label>
        <label class="content-field">Cita bíblica
          <input type="text" name="cita" maxlength="160" value="<?php echo e((string) ($formRow['cita'] ?? '')); ?>" placeholder="Ej. Mt 8,28-34" <?php echo $generatedLocked ? 'disabled' : ''; ?>>
        </label>
        <label class="content-field full">Frase destacada
          <textarea name="frase_destacada" rows="3" placeholder="Frase textual del Evangelio"><?php echo e((string) ($formRow['frase_destacada'] ?? '')); ?></textarea>
        </label>
        <label class="content-field">Cita del versículo destacado
          <input type="text" name="cita_destacada" maxlength="80" value="<?php echo e((string) ($formRow['cita_destacada'] ?? $formRow['cita'] ?? '')); ?>" placeholder="Ej. Mc 6, 20">
        </label>        <label class="content-field full">Reflexión
          <textarea name="reflexion" rows="9"><?php echo e((string) ($formRow['reflexion'] ?? '')); ?></textarea>
        </label>
        <label class="content-field full">Pregunta para meditar
          <textarea name="pregunta_meditar" rows="3"><?php echo e((string) ($formRow['pregunta_meditar'] ?? '')); ?></textarea>
        </label>
        <label class="content-field full">Oración
          <textarea name="oracion" rows="9"><?php echo e((string) ($formRow['oracion'] ?? '')); ?></textarea>
        </label>
        <label class="content-field full">Compromiso
          <textarea name="compromiso" rows="3"><?php echo e((string) ($formRow['compromiso'] ?? '')); ?></textarea>
        </label>
        <label class="content-field full">Mensaje final
          <textarea name="mensaje_final" rows="3"><?php echo e((string) ($formRow['mensaje_final'] ?? '')); ?></textarea>
        </label>
        <label class="content-field">Audio
          <input type="url" name="audio_url" value="<?php echo e((string) ($formRow['audio_url'] ?? '')); ?>" placeholder="https://...">
        </label>
        <label class="content-field status-field">Estado
          <?php $currentState = lectio_admin_status((string) ($formRow['estado'] ?? 'borrador')); ?>
          <select name="estado" required>
            <option value="borrador" <?php echo $currentState === 'borrador' ? 'selected' : ''; ?>>Borrador · pendiente de revisión</option>
            <option value="publicado" <?php echo $currentState === 'publicado' ? 'selected' : ''; ?>>Publicado · visible en la PWA</option>
          </select>
        </label>
      </div>

      <div class="form-actions">
        <button class="btn btn-gold" type="submit"><?php echo $isNew ? 'Crear Lectio' : 'Guardar revisión'; ?></button>
        <a class="btn btn-soft" href="<?php echo $isNew ? 'lectio-divina.php' : 'lectio-divina.php?edit=' . (int) $formRow['id'] . '&amp;vista=preview'; ?>">Cancelar</a>
      </div>
    </form>
  <?php endif; ?>
</section>
<?php endif; ?>

<?php if ($schemaReady): ?>
<section class="panel content-records-panel content-grid-card">
  <div class="panel-header content-list-header">
    <div>
      <h2>Biblioteca de Lectio</h2>
      <p class="muted">Los borradores no salen por la API pública. Solo el estado Publicado queda disponible para la aplicación.</p>
    </div>
    <div class="content-list-tools">
      <form method="get" class="content-filter-form">
        <select name="estado">
          <option value="borrador" <?php echo $estadoFiltro === 'borrador' ? 'selected' : ''; ?>>Borradores</option>
          <option value="publicado" <?php echo $estadoFiltro === 'publicado' ? 'selected' : ''; ?>>Publicadas</option>
          <option value="todos" <?php echo $estadoFiltro === 'todos' ? 'selected' : ''; ?>>Todas</option>
        </select>
        <input type="search" name="q" value="<?php echo e($search); ?>" placeholder="Buscar fecha, cita o frase...">
        <button class="btn btn-soft" type="submit">Filtrar</button>
      </form>
    </div>
  </div>

  <div class="table-wrap">
    <table class="admin-grid-table">
      <thead><tr><th>Fecha</th><th>Cita</th><th>Frase destacada</th><th>Origen</th><th>Estado</th><th>Revisión</th><th>Acciones</th></tr></thead>
      <tbody>
      <?php foreach ($rows as $row): ?>
        <?php $published = lectio_admin_status((string) ($row['estado'] ?? 'borrador')) === 'publicado'; ?>
        <tr>
          <td><?php echo e((string) ($row['fecha'] ?? '')); ?></td>
          <td><?php echo e((string) ($row['cita'] ?? '')); ?></td>
          <td><?php echo e(mb_strimwidth((string) ($row['frase_destacada'] ?? ''), 0, 100, '…', 'UTF-8')); ?></td>
          <td><?php echo (int) ($row['generada_ia'] ?? 0) === 1 ? 'IA' : 'Manual'; ?></td>
          <td><span class="status-pill status-<?php echo $published ? 'active' : 'draft'; ?>"><?php echo $published ? 'Publicado' : 'Borrador'; ?></span></td>
          <td><?php echo e((string) ($row['revisado_at'] ?? '')); ?></td>
          <td class="actions grid-actions"><a class="action-button action-edit" href="lectio-divina.php?edit=<?php echo (int) $row['id']; ?>&amp;vista=preview">Revisar</a></td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$rows): ?><tr><td colspan="7" class="muted">No hay Lectio para este filtro.</td></tr><?php endif; ?>
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
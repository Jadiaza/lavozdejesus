<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();
$table = 'lvj_san_santo_dia';
$pageTitle = 'Santo del Día';
$pageSubtitle = 'Revisión y publicación del Santoral preparado desde Ordo Colombiano';
$message = '';
$error = '';

function santoral_admin_columns(PDO $pdo): array
{
  try {
    $rows = $pdo->query('SHOW COLUMNS FROM lvj_san_santo_dia')->fetchAll();
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

function santoral_admin_text(mixed $value): string
{
  return trim((string) ($value ?? ''));
}

function santoral_admin_status(string $value): string
{
  $value = strtolower(trim($value));
  return in_array($value, ['borrador', 'publicado'], true) ? $value : 'borrador';
}

function santoral_admin_required_for_publish(array $data, string $name): string
{
  $required = [
    'frase_destacada' => 'Frase destacada',
    'quien_fue' => 'Quién fue',
    'lucha_que_enfrento' => 'La lucha que enfrentó',
    'secreto_de_santidad' => 'El secreto de su santidad',
    'ensenanza_para_hoy' => 'Enseñanza para hoy',
    'como_puedo_imitarlo' => 'Cómo puedo imitarlo',
    'paso_concreto' => 'Paso concreto para hoy',
    'oracion_intercesion' => 'Oración de intercesión',
  ];

  if ($name === '') {
    return 'El nombre del santo no está disponible.';
  }

  foreach ($required as $field => $label) {
    if (santoral_admin_text($data[$field] ?? '') === '') {
      return 'Para publicar debes completar: ' . $label . '.';
    }
  }

  return '';
}

function santoral_admin_has_liturgia_link(PDO $pdo): bool
{
  try {
    return (bool) $pdo->query("SHOW COLUMNS FROM lvj_lit_lectura_dia LIKE 'santo_id'")->fetch();
  } catch (Throwable $error) {
    return false;
  }
}

/** @return array<string,mixed> */
function santoral_admin_public_payload(array $row): array
{
  return [
    'fecha' => santoral_admin_text($row['fecha'] ?? ''),
    'mes' => santoral_admin_text($row['mes'] ?? ''),
    'dia' => santoral_admin_text($row['dia'] ?? ''),
    'nombre' => santoral_admin_text($row['nombre'] ?? ''),
    'titulo' => santoral_admin_text($row['titulo'] ?? ''),
    'resumen' => santoral_admin_text($row['quien_fue'] ?? ''),
    'lucha_que_enfrento' => santoral_admin_text($row['lucha_que_enfrento'] ?? ''),
    'secreto_de_santidad' => santoral_admin_text($row['secreto_de_santidad'] ?? ''),
    'ensenanza_para_hoy' => santoral_admin_text($row['ensenanza_para_hoy'] ?? ''),
    'como_puedo_imitarlo' => santoral_admin_text($row['como_puedo_imitarlo'] ?? ''),
    'paso_concreto' => santoral_admin_text($row['paso_concreto'] ?? ''),
    'oracion_intercesion' => santoral_admin_text($row['oracion_intercesion'] ?? ''),
    'imagen_url' => santoral_admin_text($row['imagen_url'] ?? ''),
    'frase_destacada' => santoral_admin_text($row['frase_destacada'] ?? ''),
    'estado' => santoral_admin_status((string) ($row['estado'] ?? 'borrador')),
  ];
}

/** @return array<string,mixed> */
function santoral_admin_json_payload(array $row): array
{
  return [
    'santo_del_dia' => santoral_admin_public_payload($row),
    'revision_editorial' => [
      'id' => (int) ($row['id'] ?? 0),
      'ordo_santo_id' => santoral_admin_text($row['ordo_santo_id'] ?? ''),
      'origen' => (int) ($row['generada_ia'] ?? 0) === 1 ? 'Ordo + IA' : 'Manual',
      'generada_ia' => (int) ($row['generada_ia'] ?? 0) === 1,
      'modelo_ia' => santoral_admin_text($row['modelo_ia'] ?? ''),
      'prompt_version' => santoral_admin_text($row['prompt_version'] ?? ''),
      'destacado' => (int) ($row['destacado'] ?? 0) === 1,
      'orden' => (int) ($row['orden'] ?? 0),
      'revisado_at' => santoral_admin_text($row['revisado_at'] ?? ''),
    ],
  ];
}

$columns = santoral_admin_columns($pdo);
$requiredSchema = [
  'id', 'fecha', 'mes', 'dia', 'nombre', 'titulo', 'frase_destacada', 'quien_fue',
  'imagen_url', 'lucha_que_enfrento', 'secreto_de_santidad', 'ensenanza_para_hoy',
  'como_puedo_imitarlo', 'paso_concreto', 'oracion_intercesion', 'destacado', 'orden',
  'estado', 'ordo_santo_id', 'generada_ia', 'modelo_ia', 'prompt_version', 'revisado_at',
];
$missingColumns = array_values(array_filter($requiredSchema, static fn (string $field): bool => !isset($columns[$field])));
$schemaReady = $missingColumns === [];
$canLinkLiturgia = $schemaReady && santoral_admin_has_liturgia_link($pdo);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf();

  if (!$schemaReady) {
    $error = 'La estructura del Santoral automático no está completa en la base de datos.';
  } elseif ((string) ($_POST['action'] ?? '') === 'save') {
    $id = max(0, (int) ($_POST['id'] ?? 0));
    $existingStmt = $pdo->prepare('SELECT * FROM lvj_san_santo_dia WHERE id = :id AND deleted_at IS NULL LIMIT 1');
    $existingStmt->execute(['id' => $id]);
    $existing = $existingStmt->fetch() ?: [];

    if (!$existing) {
      $error = 'El registro seleccionado ya no está disponible.';
    } else {
      $estado = santoral_admin_status((string) ($_POST['estado'] ?? 'borrador'));
      $imageUrl = santoral_admin_text($_POST['imagen_url'] ?? '');
      $destacado = isset($_POST['destacado']) ? 1 : 0;
      $orden = max(0, (int) ($_POST['orden'] ?? 0));
      $name = santoral_admin_text($existing['nombre'] ?? '');

      $data = [
        'titulo' => santoral_admin_text($_POST['titulo'] ?? '') ?: null,
        'frase_destacada' => santoral_admin_text($_POST['frase_destacada'] ?? '') ?: null,
        'quien_fue' => santoral_admin_text($_POST['quien_fue'] ?? '') ?: null,
        'imagen_url' => $imageUrl !== '' ? $imageUrl : null,
        'lucha_que_enfrento' => santoral_admin_text($_POST['lucha_que_enfrento'] ?? '') ?: null,
        'secreto_de_santidad' => santoral_admin_text($_POST['secreto_de_santidad'] ?? '') ?: null,
        'ensenanza_para_hoy' => santoral_admin_text($_POST['ensenanza_para_hoy'] ?? '') ?: null,
        'como_puedo_imitarlo' => santoral_admin_text($_POST['como_puedo_imitarlo'] ?? '') ?: null,
        'paso_concreto' => santoral_admin_text($_POST['paso_concreto'] ?? '') ?: null,
        'oracion_intercesion' => santoral_admin_text($_POST['oracion_intercesion'] ?? '') ?: null,
        'destacado' => $destacado,
        'orden' => $orden,
        'estado' => $estado,
      ];

      if ($imageUrl !== '' && (!filter_var($imageUrl, FILTER_VALIDATE_URL) || !preg_match('/^https?:\/\//i', $imageUrl))) {
        $error = 'La URL de la imagen no es válida.';
      } elseif ($estado === 'publicado') {
        $error = santoral_admin_required_for_publish($data, $name);
      }

      if ($error === '') {
        try {
          $pdo->beginTransaction();

          if ($estado === 'publicado' && $destacado === 1) {
            $clearFeatured = $pdo->prepare(
              'UPDATE lvj_san_santo_dia
               SET destacado = 0, updated_at = NOW()
               WHERE mes = :mes AND dia = :dia AND id <> :id AND deleted_at IS NULL'
            );
            $clearFeatured->execute([
              'mes' => (int) ($existing['mes'] ?? 0),
              'dia' => (int) ($existing['dia'] ?? 0),
              'id' => $id,
            ]);
          }

          $stmt = $pdo->prepare(
            'UPDATE lvj_san_santo_dia SET
              titulo = :titulo,
              frase_destacada = :frase_destacada,
              quien_fue = :quien_fue,
              imagen_url = :imagen_url,
              lucha_que_enfrento = :lucha_que_enfrento,
              secreto_de_santidad = :secreto_de_santidad,
              ensenanza_para_hoy = :ensenanza_para_hoy,
              como_puedo_imitarlo = :como_puedo_imitarlo,
              paso_concreto = :paso_concreto,
              oracion_intercesion = :oracion_intercesion,
              destacado = :destacado,
              orden = :orden,
              estado = :estado,
              revisado_at = CASE WHEN :estado_revision = \'publicado\' THEN NOW() ELSE revisado_at END,
              updated_at = NOW()
             WHERE id = :id AND deleted_at IS NULL
             LIMIT 1'
          );
          $stmt->execute($data + [
            'estado_revision' => $estado,
            'id' => $id,
          ]);

          if ($canLinkLiturgia) {
            $date = substr(santoral_admin_text($existing['fecha'] ?? ''), 0, 10);
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) === 1) {
              if ($estado === 'publicado' && $destacado === 1) {
                $link = $pdo->prepare(
                  'UPDATE lvj_lit_lectura_dia SET santo_id = :santo_id WHERE fecha = :fecha LIMIT 1'
                );
                $link->execute(['santo_id' => $id, 'fecha' => $date]);
              } else {
                $unlink = $pdo->prepare(
                  'UPDATE lvj_lit_lectura_dia SET santo_id = NULL WHERE fecha = :fecha AND santo_id = :santo_id LIMIT 1'
                );
                $unlink->execute(['fecha' => $date, 'santo_id' => $id]);
              }
            }
          }

          $pdo->commit();
          log_activity('update', $table, $id, $estado === 'publicado' ? 'Santo revisado y publicado' : 'Santo guardado como borrador');
          header('Location: santoral-dia.php?edit=' . $id . '&vista=preview&saved=' . ($estado === 'publicado' ? 'published' : 'draft'));
          exit;
        } catch (Throwable $saveError) {
          if ($pdo->inTransaction()) {
            $pdo->rollBack();
          }
          $error = 'No se pudo guardar el Santoral: ' . $saveError->getMessage();
        }
      }
    }
  }
}

if (isset($_GET['saved'])) {
  $message = (string) $_GET['saved'] === 'published'
    ? 'Santo revisado y publicado correctamente.'
    : 'Santo guardado como borrador.';
}

$editId = max(0, (int) ($_GET['edit'] ?? 0));
$editRow = [];
if ($schemaReady && $editId > 0) {
  try {
    $stmt = $pdo->prepare('SELECT * FROM lvj_san_santo_dia WHERE id = :id AND deleted_at IS NULL LIMIT 1');
    $stmt->execute(['id' => $editId]);
    $editRow = $stmt->fetch() ?: [];
  } catch (Throwable $editError) {
    $editRow = [];
  }
}

$reviewView = strtolower(trim((string) ($_GET['vista'] ?? 'preview')));
if (!in_array($reviewView, ['preview', 'editar', 'json'], true)) {
  $reviewView = 'preview';
}

$jsonPreview = '';
if ($editRow) {
  try {
    $jsonPreview = json_encode(
      santoral_admin_json_payload($editRow),
      JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR,
    );
  } catch (Throwable $jsonError) {
    $jsonPreview = '{"error":"No fue posible construir la vista JSON."}';
  }
}

$estadoFiltro = strtolower(trim((string) ($_GET['estado'] ?? 'borrador')));
if (!in_array($estadoFiltro, ['borrador', 'publicado', 'todos'], true)) {
  $estadoFiltro = 'borrador';
}
$search = trim((string) ($_GET['q'] ?? ''));
$counts = ['borrador' => 0, 'publicado' => 0];
$rows = [];

if ($schemaReady) {
  try {
    foreach (array_keys($counts) as $state) {
      $count = $pdo->prepare("SELECT COUNT(*) FROM lvj_san_santo_dia WHERE estado = :estado AND deleted_at IS NULL");
      $count->execute(['estado' => $state]);
      $counts[$state] = (int) $count->fetchColumn();
    }

    $where = ['deleted_at IS NULL'];
    $params = [];
    if ($estadoFiltro !== 'todos') {
      $where[] = 'estado = :estado';
      $params['estado'] = $estadoFiltro;
    }
    if ($search !== '') {
      $where[] = '(nombre LIKE :q OR titulo LIKE :q OR frase_destacada LIKE :q OR fecha LIKE :q)';
      $params['q'] = '%' . $search . '%';
    }

    $stmt = $pdo->prepare(
      'SELECT id, fecha, mes, dia, nombre, titulo, frase_destacada, imagen_url, destacado, orden,
              estado, ordo_santo_id, generada_ia, modelo_ia, prompt_version, revisado_at
       FROM lvj_san_santo_dia
       WHERE ' . implode(' AND ', $where) . '
       ORDER BY fecha DESC, destacado DESC, orden ASC, id ASC
       LIMIT 250'
    );
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
  } catch (Throwable $listError) {
    $error = $error ?: 'No se pudo cargar el Santoral: ' . $listError->getMessage();
  }
}

require __DIR__ . '/includes/header.php';
?>

<section class="panel content-overview-panel">
  <div class="content-overview">
    <div>
      <span class="eyebrow">Santoral</span>
      <h2>Santo del Día</h2>
      <p class="muted">Ordo determina los santos asociados a la fecha; la IA prepara el borrador LVJ y una persona decide qué contenido publicar.</p>
    </div>
    <div class="content-actions-bar">
      <a class="btn btn-soft" href="content.php?module=santoral&amp;table=lvj_san_santo_dia">Administración general</a>
      <a class="btn btn-soft" href="content.php?module=liturgia&amp;table=lvj_lit_lectura_dia">Lecturas del día</a>
    </div>
  </div>

  <?php if ($message): ?><div class="alert alert-success"><?php echo e($message); ?></div><?php endif; ?>
  <?php if ($error): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>
  <?php if (!$schemaReady): ?>
    <div class="alert alert-error">Faltan columnas de la migración de Santoral automático: <?php echo e(implode(', ', $missingColumns)); ?>.</div>
  <?php endif; ?>
</section>

<?php if ($schemaReady): ?>
<section class="stats-grid pending-stats">
  <a class="stat-card stat-card-link" href="santoral-dia.php?estado=borrador">
    <div class="stat-icon gold">SA</div><span>Borradores</span><strong><?php echo (int) $counts['borrador']; ?></strong><small>Pendientes de revisión humana</small>
  </a>
  <a class="stat-card stat-card-link" href="santoral-dia.php?estado=publicado">
    <div class="stat-icon green">OK</div><span>Publicados</span><strong><?php echo (int) $counts['publicado']; ?></strong><small>Disponibles para la PWA</small>
  </a>
</section>
<?php endif; ?>

<?php if ($editRow): ?>
<section class="panel content-editor-panel">
  <div class="panel-header">
    <div>
      <h2>Revisar Santo del Día</h2>
      <p class="muted"><?php echo e((string) ($editRow['nombre'] ?? '')); ?><?php echo !empty($editRow['titulo']) ? ' · ' . e((string) $editRow['titulo']) : ''; ?></p>
    </div>
    <a class="btn btn-soft" href="santoral-dia.php">Volver</a>
  </div>

  <?php if ((int) ($editRow['generada_ia'] ?? 0) === 1): ?>
    <div class="alert alert-success">
      Identidad tomada de Ordo · ID: <?php echo e((string) ($editRow['ordo_santo_id'] ?? '')); ?> · Modelo: <?php echo e((string) ($editRow['modelo_ia'] ?? '')); ?> · Prompt: <?php echo e((string) ($editRow['prompt_version'] ?? '')); ?>.
      El nombre, el ID de Ordo y los metadatos técnicos no se editan aquí.
    </div>
  <?php endif; ?>

  <nav class="content-toolbar" aria-label="Vista de revisión del Santo del Día">
    <div class="content-tabs">
      <a class="<?php echo $reviewView === 'preview' ? 'active' : ''; ?>" href="santoral-dia.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=preview">Vista previa</a>
      <a class="<?php echo $reviewView === 'editar' ? 'active' : ''; ?>" href="santoral-dia.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=editar">Editar contenido</a>
      <a class="<?php echo $reviewView === 'json' ? 'active' : ''; ?>" href="santoral-dia.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=json">JSON</a>
    </div>
  </nav>

  <?php if ($reviewView === 'preview'): ?>
    <?php
      $previewImage = santoral_admin_text($editRow['imagen_url'] ?? '');
      $hasPreviewImage = $previewImage !== '' && preg_match('/^https?:\/\//i', $previewImage) === 1;
      $previewSections = [
        'Quién fue' => santoral_admin_text($editRow['quien_fue'] ?? ''),
        'La lucha que enfrentó' => santoral_admin_text($editRow['lucha_que_enfrento'] ?? ''),
        'El secreto de su santidad' => santoral_admin_text($editRow['secreto_de_santidad'] ?? ''),
        'Enseñanza para hoy' => santoral_admin_text($editRow['ensenanza_para_hoy'] ?? ''),
        'Cómo puedo imitarlo' => santoral_admin_text($editRow['como_puedo_imitarlo'] ?? ''),
        'Paso concreto para hoy' => santoral_admin_text($editRow['paso_concreto'] ?? ''),
        'Oración de intercesión' => santoral_admin_text($editRow['oracion_intercesion'] ?? ''),
      ];
      $previewPublished = santoral_admin_status((string) ($editRow['estado'] ?? 'borrador')) === 'publicado';
    ?>

    <div class="content-form-grid">
      <article class="panel content-field full">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Vista como contenido</span>
            <h2><?php echo e((string) ($editRow['nombre'] ?? '')); ?></h2>
            <?php if (!empty($editRow['titulo'])): ?><p class="muted"><?php echo e((string) $editRow['titulo']); ?></p><?php endif; ?>
          </div>
          <span class="status-pill status-<?php echo $previewPublished ? 'active' : 'draft'; ?>"><?php echo $previewPublished ? 'Publicado' : 'Borrador'; ?></span>
        </div>

        <?php if ($hasPreviewImage): ?>
          <div style="margin:1rem 0 1.25rem;display:flex;justify-content:center;">
            <img src="<?php echo e($previewImage); ?>" alt="<?php echo e((string) ($editRow['nombre'] ?? 'Santo del Día')); ?>" style="width:170px;height:170px;object-fit:cover;border-radius:50%;border:4px solid #d4af37;">
          </div>
        <?php else: ?>
          <p class="muted">Imagen pendiente de revisión o carga manual.</p>
        <?php endif; ?>

        <?php if (!empty($editRow['frase_destacada'])): ?>
          <div class="alert alert-success">«<?php echo e(trim((string) $editRow['frase_destacada'], " \t\n\r\0\x0B«»\"“”")); ?>»</div>
        <?php endif; ?>
      </article>

      <?php foreach ($previewSections as $sectionTitle => $sectionText): ?>
        <article class="panel content-field full">
          <div class="panel-header">
            <div><span class="eyebrow">Santo del Día</span><h2><?php echo e($sectionTitle); ?></h2></div>
          </div>
          <?php if ($sectionText !== ''): ?>
            <div style="white-space:pre-wrap;line-height:1.75;"><?php echo e($sectionText); ?></div>
          <?php else: ?>
            <p class="muted">Este campo todavía está vacío.</p>
          <?php endif; ?>
        </article>
      <?php endforeach; ?>
    </div>

    <div class="form-actions">
      <a class="btn btn-gold" href="santoral-dia.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=editar">Editar contenido</a>
      <a class="btn btn-soft" href="santoral-dia.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=json">Ver JSON</a>
    </div>

  <?php elseif ($reviewView === 'json'): ?>
    <div class="alert alert-success">Vista JSON de solo lectura. Representa el contenido público y los metadatos editoriales de revisión; no permite guardar cambios para evitar saltarse las validaciones del formulario.</div>
    <article class="panel">
      <div class="panel-header">
        <div><span class="eyebrow">Auditoría</span><h2>JSON del Santo del Día</h2></div>
        <a class="btn btn-gold" href="santoral-dia.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=editar">Editar</a>
      </div>
      <pre style="margin:0;max-height:720px;overflow:auto;white-space:pre-wrap;word-break:break-word;background:#071a33;color:#f8f5ea;border-radius:14px;padding:18px;line-height:1.55;"><code><?php echo e($jsonPreview); ?></code></pre>
    </article>

  <?php else: ?>
    <form method="post" class="content-form">
      <?php echo csrf_field(); ?>
      <input type="hidden" name="action" value="save">
      <input type="hidden" name="id" value="<?php echo (int) $editRow['id']; ?>">

      <div class="content-form-grid">
        <label class="content-field">Fecha de origen
          <input type="date" value="<?php echo e((string) ($editRow['fecha'] ?? '')); ?>" disabled>
        </label>
        <label class="content-field">Nombre según Ordo
          <input type="text" value="<?php echo e((string) ($editRow['nombre'] ?? '')); ?>" disabled>
        </label>
        <label class="content-field">Título / condición
          <input type="text" name="titulo" maxlength="180" value="<?php echo e((string) ($editRow['titulo'] ?? '')); ?>" placeholder="presbítero, mártir, obispo...">
        </label>
        <label class="content-field">Imagen
          <input type="url" name="imagen_url" value="<?php echo e((string) ($editRow['imagen_url'] ?? '')); ?>" placeholder="https://...">
        </label>
        <label class="content-field full">Frase destacada
          <textarea name="frase_destacada" rows="3"><?php echo e((string) ($editRow['frase_destacada'] ?? '')); ?></textarea>
        </label>
        <label class="content-field full">Quién fue
          <textarea name="quien_fue" rows="7"><?php echo e((string) ($editRow['quien_fue'] ?? '')); ?></textarea>
        </label>
        <label class="content-field full">La lucha que enfrentó
          <textarea name="lucha_que_enfrento" rows="5"><?php echo e((string) ($editRow['lucha_que_enfrento'] ?? '')); ?></textarea>
        </label>
        <label class="content-field full">El secreto de su santidad
          <textarea name="secreto_de_santidad" rows="5"><?php echo e((string) ($editRow['secreto_de_santidad'] ?? '')); ?></textarea>
        </label>
        <label class="content-field full">Enseñanza para hoy
          <textarea name="ensenanza_para_hoy" rows="5"><?php echo e((string) ($editRow['ensenanza_para_hoy'] ?? '')); ?></textarea>
        </label>
        <label class="content-field full">Cómo puedo imitarlo
          <textarea name="como_puedo_imitarlo" rows="5"><?php echo e((string) ($editRow['como_puedo_imitarlo'] ?? '')); ?></textarea>
        </label>
        <label class="content-field full">Paso concreto para hoy
          <textarea name="paso_concreto" rows="3"><?php echo e((string) ($editRow['paso_concreto'] ?? '')); ?></textarea>
        </label>
        <label class="content-field full">Oración de intercesión
          <textarea name="oracion_intercesion" rows="7"><?php echo e((string) ($editRow['oracion_intercesion'] ?? '')); ?></textarea>
        </label>
        <label class="check-field content-field"><input type="checkbox" name="destacado" value="1" <?php echo (int) ($editRow['destacado'] ?? 0) === 1 ? 'checked' : ''; ?>> Mostrar como santo destacado del día</label>
        <label class="content-field">Orden
          <input type="number" name="orden" min="0" step="1" value="<?php echo (int) ($editRow['orden'] ?? 0); ?>">
        </label>
        <label class="content-field status-field">Estado
          <?php $currentState = santoral_admin_status((string) ($editRow['estado'] ?? 'borrador')); ?>
          <select name="estado" required>
            <option value="borrador" <?php echo $currentState === 'borrador' ? 'selected' : ''; ?>>Borrador · pendiente de revisión</option>
            <option value="publicado" <?php echo $currentState === 'publicado' ? 'selected' : ''; ?>>Publicado · visible en la PWA</option>
          </select>
        </label>
      </div>

      <div class="form-actions">
        <button class="btn btn-gold" type="submit">Guardar revisión</button>
        <a class="btn btn-soft" href="santoral-dia.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=preview">Vista previa</a>
        <a class="btn btn-soft" href="santoral-dia.php?edit=<?php echo (int) $editRow['id']; ?>&amp;vista=json">Ver JSON</a>
      </div>
    </form>
  <?php endif; ?>
</section>
<?php endif; ?>

<?php if ($schemaReady): ?>
<section class="panel content-records-panel content-grid-card">
  <div class="panel-header content-list-header">
    <div><h2>Santos detectados</h2><p class="muted">Puede haber varios candidatos en una fecha. Marca como destacado el que debe enlazarse a la Liturgia del Día.</p></div>
    <div class="content-list-tools">
      <form method="get" class="content-filter-form">
        <select name="estado">
          <option value="borrador" <?php echo $estadoFiltro === 'borrador' ? 'selected' : ''; ?>>Borradores</option>
          <option value="publicado" <?php echo $estadoFiltro === 'publicado' ? 'selected' : ''; ?>>Publicados</option>
          <option value="todos" <?php echo $estadoFiltro === 'todos' ? 'selected' : ''; ?>>Todos</option>
        </select>
        <input type="search" name="q" value="<?php echo e($search); ?>" placeholder="Buscar fecha o santo...">
        <button class="btn btn-soft" type="submit">Filtrar</button>
      </form>
    </div>
  </div>

  <div class="table-wrap">
    <table class="admin-grid-table">
      <thead><tr><th>Fecha</th><th>Santo</th><th>Título</th><th>Origen</th><th>Destacado</th><th>Estado</th><th>Revisión</th><th>Acciones</th></tr></thead>
      <tbody>
      <?php foreach ($rows as $row): ?>
        <?php $published = strtolower((string) ($row['estado'] ?? '')) === 'publicado'; ?>
        <tr>
          <td><?php echo e((string) ($row['fecha'] ?? '')); ?></td>
          <td><?php echo e((string) ($row['nombre'] ?? '')); ?></td>
          <td><?php echo e((string) ($row['titulo'] ?? '')); ?></td>
          <td><?php echo (int) ($row['generada_ia'] ?? 0) === 1 ? 'Ordo + IA' : 'Manual'; ?></td>
          <td><?php echo (int) ($row['destacado'] ?? 0) === 1 ? 'Sí' : 'No'; ?></td>
          <td><span class="status-pill status-<?php echo $published ? 'active' : 'draft'; ?>"><?php echo $published ? 'Publicado' : 'Borrador'; ?></span></td>
          <td><?php echo e((string) ($row['revisado_at'] ?? '')); ?></td>
          <td class="actions grid-actions"><a class="action-button action-edit" href="santoral-dia.php?edit=<?php echo (int) $row['id']; ?>&amp;vista=preview">Revisar</a></td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$rows): ?><tr><td colspan="8" class="muted">No hay santos para este filtro.</td></tr><?php endif; ?>
      </tbody>
    </table>
  </div>
</section>
<?php endif; ?>

<?php require __DIR__ . '/includes/footer.php'; ?>

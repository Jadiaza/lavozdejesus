<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();
$table = 'lvj_lit_lectio_divina';
$pageTitle = 'Lectio Divina';
$pageSubtitle = 'Revisión y publicación del contenido generado para la Liturgia';
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

$columns = lectio_admin_columns($pdo);
$requiredSchema = [
  'id', 'fecha', 'cita', 'cita_clave', 'frase_destacada', 'reflexion',
  'pregunta_meditar', 'oracion', 'compromiso', 'mensaje_final', 'estado',
  'generada_ia', 'modelo_ia', 'prompt_version', 'revisado_at',
];
$missingColumns = array_values(array_filter($requiredSchema, static fn (string $field): bool => !isset($columns[$field])));
$schemaReady = $missingColumns === [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf();

  if (!$schemaReady) {
    $error = 'La estructura de Lectio Divina no está completa en la base de datos.';
  } elseif ((string) ($_POST['action'] ?? '') === 'save') {
    $id = max(0, (int) ($_POST['id'] ?? 0));
    $fecha = substr(lectio_admin_text($_POST['fecha'] ?? ''), 0, 10);
    $cita = mb_substr(lectio_admin_text($_POST['cita'] ?? ''), 0, 160, 'UTF-8');
    $estado = lectio_admin_status((string) ($_POST['estado'] ?? 'borrador'));
    $audioUrl = lectio_admin_text($_POST['audio_url'] ?? '');

    $data = [
      'fecha' => $fecha,
      'cita' => $cita !== '' ? $cita : null,
      'frase_destacada' => lectio_admin_text($_POST['frase_destacada'] ?? '') ?: null,
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
          $existing = $pdo->prepare('SELECT id FROM lvj_lit_lectio_divina WHERE id = :id AND deleted_at IS NULL LIMIT 1');
          $existing->execute(['id' => $id]);
          if (!$existing->fetchColumn()) {
            throw new RuntimeException('La Lectio seleccionada ya no está disponible.');
          }

          $assignments = [];
          $params = ['id' => $id];
          foreach ($data as $field => $value) {
            if (!isset($columns[$field])) {
              continue;
            }
            $assignments[] = "{$field} = :{$field}";
            $params[$field] = $value;
          }
          if (isset($columns['updated_at'])) {
            $assignments[] = 'updated_at = NOW()';
          }
          if ($estado === 'publicado' && isset($columns['revisado_at'])) {
            $assignments[] = 'revisado_at = NOW()';
          }

          $stmt = $pdo->prepare('UPDATE lvj_lit_lectio_divina SET ' . implode(', ', $assignments) . ' WHERE id = :id LIMIT 1');
          $stmt->execute($params);
          log_activity('update', $table, $id, $estado === 'publicado' ? 'Lectio revisada y publicada' : 'Lectio guardada como borrador');
          header('Location: lectio-divina.php?saved=' . ($estado === 'publicado' ? 'published' : 'draft'));
          exit;
        }

        // Alta manual compatible con el esquema histórico. No genera cita_clave:
        // la reutilización automática queda reservada al flujo Ordo + IA.
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

        $stmt = $pdo->prepare('INSERT INTO lvj_lit_lectio_divina (`' . implode('`,`', $fields) . '`) VALUES (' . implode(',', $placeholders) . ')');
        $stmt->execute($params);
        $savedId = (int) $pdo->lastInsertId();
        if ($estado === 'publicado' && isset($columns['revisado_at'])) {
          $pdo->prepare('UPDATE lvj_lit_lectio_divina SET revisado_at = NOW() WHERE id = :id LIMIT 1')->execute(['id' => $savedId]);
        }
        log_activity('create', $table, $savedId, 'Lectio creada manualmente');
        header('Location: lectio-divina.php?saved=' . ($estado === 'publicado' ? 'published' : 'created'));
        exit;
      } catch (Throwable $saveError) {
        $error = 'No se pudo guardar la Lectio: ' . $saveError->getMessage();
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
    $stmt = $pdo->prepare('SELECT * FROM lvj_lit_lectio_divina WHERE id = :id AND deleted_at IS NULL LIMIT 1');
    $stmt->execute(['id' => $editId]);
    $editRow = $stmt->fetch() ?: [];
  } catch (Throwable $editError) {
    $editRow = [];
  }
}

$showForm = $schemaReady && (((string) ($_GET['action'] ?? '')) === 'new' || $editRow !== []);
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
      $count = $pdo->prepare("SELECT COUNT(*) FROM lvj_lit_lectio_divina WHERE estado = :estado AND deleted_at IS NULL");
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

require __DIR__ . '/includes/header.php';
?>

<section class="panel content-overview-panel">
  <div class="content-overview">
    <div>
      <span class="eyebrow">Liturgia</span>
      <h2>Lectio Divina</h2>
      <p class="muted">Revisa los borradores generados, corrige los seis campos pastorales y publica solo cuando el contenido esté aprobado.</p>
    </div>
    <div class="content-actions-bar">
      <a class="btn btn-soft" href="content.php?module=liturgia&amp;table=lvj_lit_lectura_dia">Lecturas del día</a>
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

<?php if ($showForm): ?>
<section class="panel content-editor-panel">
  <div class="panel-header">
    <div>
      <h2><?php echo $editRow ? 'Revisar Lectio' : 'Crear Lectio manual'; ?></h2>
      <p class="muted"><?php echo $editRow && (int) ($editRow['generada_ia'] ?? 0) === 1 ? 'Borrador generado por IA. Los metadatos técnicos están protegidos.' : 'Contenido editorial de Lectio Divina.'; ?></p>
    </div>
    <a class="btn btn-soft" href="lectio-divina.php">Volver</a>
  </div>

  <?php if ($editRow && (int) ($editRow['generada_ia'] ?? 0) === 1): ?>
    <div class="alert alert-success">
      Generada por IA · Modelo: <?php echo e((string) ($editRow['modelo_ia'] ?? '')); ?> · Prompt: <?php echo e((string) ($editRow['prompt_version'] ?? '')); ?>.
      La clave canónica y estos metadatos no se editan desde el formulario.
    </div>
  <?php endif; ?>

  <form method="post" class="content-form">
    <?php echo csrf_field(); ?>
    <input type="hidden" name="action" value="save">
    <input type="hidden" name="id" value="<?php echo (int) ($editRow['id'] ?? 0); ?>">

    <div class="content-form-grid">
      <label class="content-field">Fecha
        <input type="date" name="fecha" required value="<?php echo e((string) ($editRow['fecha'] ?? date('Y-m-d'))); ?>">
      </label>
      <label class="content-field">Cita bíblica
        <input type="text" name="cita" maxlength="160" value="<?php echo e((string) ($editRow['cita'] ?? '')); ?>" placeholder="Ej. Mt 8,28-34">
      </label>
      <label class="content-field full">Frase destacada
        <textarea name="frase_destacada" rows="3" placeholder="Frase textual del Evangelio"><?php echo e((string) ($editRow['frase_destacada'] ?? '')); ?></textarea>
      </label>
      <label class="content-field full">Reflexión
        <textarea name="reflexion" rows="9"><?php echo e((string) ($editRow['reflexion'] ?? '')); ?></textarea>
      </label>
      <label class="content-field full">Pregunta para meditar
        <textarea name="pregunta_meditar" rows="3"><?php echo e((string) ($editRow['pregunta_meditar'] ?? '')); ?></textarea>
      </label>
      <label class="content-field full">Oración
        <textarea name="oracion" rows="9"><?php echo e((string) ($editRow['oracion'] ?? '')); ?></textarea>
      </label>
      <label class="content-field full">Compromiso
        <textarea name="compromiso" rows="3"><?php echo e((string) ($editRow['compromiso'] ?? '')); ?></textarea>
      </label>
      <label class="content-field full">Mensaje final
        <textarea name="mensaje_final" rows="3"><?php echo e((string) ($editRow['mensaje_final'] ?? '')); ?></textarea>
      </label>
      <label class="content-field">Audio
        <input type="url" name="audio_url" value="<?php echo e((string) ($editRow['audio_url'] ?? '')); ?>" placeholder="https://...">
      </label>
      <label class="content-field status-field">Estado
        <select name="estado" required>
          <?php $currentState = lectio_admin_status((string) ($editRow['estado'] ?? 'borrador')); ?>
          <option value="borrador" <?php echo $currentState === 'borrador' ? 'selected' : ''; ?>>Borrador · pendiente de revisión</option>
          <option value="publicado" <?php echo $currentState === 'publicado' ? 'selected' : ''; ?>>Publicado · visible en la PWA</option>
        </select>
      </label>
    </div>

    <div class="form-actions">
      <button class="btn btn-gold" type="submit"><?php echo $editRow ? 'Guardar revisión' : 'Crear Lectio'; ?></button>
      <a class="btn btn-soft" href="lectio-divina.php">Cancelar</a>
    </div>
  </form>
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
        <?php $published = strtolower((string) ($row['estado'] ?? '')) === 'publicado'; ?>
        <tr>
          <td><?php echo e((string) ($row['fecha'] ?? '')); ?></td>
          <td><?php echo e((string) ($row['cita'] ?? '')); ?></td>
          <td><?php echo e(mb_strimwidth((string) ($row['frase_destacada'] ?? ''), 0, 100, '…', 'UTF-8')); ?></td>
          <td><?php echo (int) ($row['generada_ia'] ?? 0) === 1 ? 'IA' : 'Manual'; ?></td>
          <td><span class="status-pill status-<?php echo $published ? 'active' : 'draft'; ?>"><?php echo $published ? 'Publicado' : 'Borrador'; ?></span></td>
          <td><?php echo e((string) ($row['revisado_at'] ?? '')); ?></td>
          <td class="actions grid-actions"><a class="action-button action-edit" href="lectio-divina.php?edit=<?php echo (int) $row['id']; ?>">Revisar</a></td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$rows): ?><tr><td colspan="7" class="muted">No hay Lectio para este filtro.</td></tr><?php endif; ?>
      </tbody>
    </table>
  </div>
</section>
<?php endif; ?>

<?php require __DIR__ . '/includes/footer.php'; ?>

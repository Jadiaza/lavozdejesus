<?php

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();

$allowedTables = [
  'lvj_lit_lectura_dia' => ['module' => 'liturgia', 'label' => 'Liturgia del Día'],
  'lvj_lit_lectio_divina' => ['module' => 'liturgia', 'label' => 'Lectio Divina'],
  'lvj_san_santo_dia' => ['module' => 'santoral', 'label' => 'Santo del Día'],
];

function json_editor_columns(PDO $pdo, string $table): array
{
  try { return $pdo->query("SHOW COLUMNS FROM {$table}")->fetchAll(); }
  catch (Throwable $error) { return []; }
}

function json_editor_editable_columns(array $columns, string $table): array
{
  $blocked = ['id', 'created_at', 'updated_at', 'deleted_at'];
  if ($table === 'lvj_san_santo_dia') $blocked[] = 'fecha';
  $result = [];
  foreach ($columns as $column) {
    $field = (string) ($column['Field'] ?? '');
    $extra = strtolower((string) ($column['Extra'] ?? ''));
    if ($field === '' || in_array($field, $blocked, true) || strpos($extra, 'auto_increment') !== false) continue;
    $result[$field] = $column;
  }
  return $result;
}

function json_editor_normalize(array $column, $value)
{
  $type = strtolower((string) ($column['Type'] ?? ''));
  $nullable = strtoupper((string) ($column['Null'] ?? '')) === 'YES';
  if ($value === null) {
    if ($nullable) return null;
    $value = '';
  }
  if (strpos($type, 'tinyint') === 0 || strpos($type, 'int') !== false) {
    if ($value === '' && $nullable) return null;
    return (int) $value;
  }
  if (strpos($type, 'decimal') !== false || strpos($type, 'float') !== false || strpos($type, 'double') !== false) {
    if ($value === '' && $nullable) return null;
    return (float) $value;
  }
  if (is_array($value) || is_object($value)) return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  return trim((string) $value);
}

$table = (string) ($_GET['table'] ?? $_POST['table'] ?? '');
$id = (int) ($_GET['id'] ?? $_POST['id'] ?? 0);
if (!isset($allowedTables[$table]) || $id <= 0) { http_response_code(400); exit('Solicitud no válida.'); }

$config = $allowedTables[$table];
$columns = json_editor_columns($pdo, $table);
$editableColumns = json_editor_editable_columns($columns, $table);
if (!$columns) { http_response_code(404); exit('La tabla solicitada no está disponible.'); }

$stmt = $pdo->prepare("SELECT * FROM {$table} WHERE id = :id LIMIT 1");
$stmt->execute(['id' => $id]);
$row = $stmt->fetch();
if (!$row) { http_response_code(404); exit('Registro no encontrado.'); }

$message = '';
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf();
  $rawJson = trim((string) ($_POST['json_content'] ?? ''));
  $decoded = json_decode($rawJson, true);
  if ($rawJson === '' || !is_array($decoded) || array_is_list($decoded)) {
    $error = 'El contenido debe ser un objeto JSON válido.';
  } elseif (json_last_error() !== JSON_ERROR_NONE) {
    $error = 'JSON inválido: ' . json_last_error_msg();
  } else {
    $unknownFields = array_values(array_diff(array_keys($decoded), array_keys($editableColumns)));
    if ($unknownFields) $error = 'El JSON contiene campos no permitidos: ' . implode(', ', $unknownFields) . '.';
  }

  if ($error === '') {
    $assignments = [];
    $params = ['id' => $id];
    foreach ($decoded as $field => $value) {
      if (!isset($editableColumns[$field])) continue;
      $assignments[] = "`{$field}` = :{$field}";
      $params[$field] = json_editor_normalize($editableColumns[$field], $value);
    }
    if (!$assignments) {
      $error = 'No hay campos editables para guardar.';
    } else {
      try {
        $pdo->beginTransaction();
        $update = "UPDATE {$table} SET " . implode(', ', $assignments);
        foreach ($columns as $column) {
          if ((string) ($column['Field'] ?? '') === 'updated_at') { $update .= ', updated_at = NOW()'; break; }
        }
        $update .= ' WHERE id = :id LIMIT 1';
        $pdo->prepare($update)->execute($params);
        $pdo->commit();
        log_activity('update_json', $table, $id, 'Edición manual de JSON desde el administrador');
        $message = $config['label'] . ' actualizado correctamente.';
        $stmt = $pdo->prepare("SELECT * FROM {$table} WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch() ?: $row;
      } catch (Throwable $saveError) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        $error = 'No se pudo guardar el JSON. Revisa el contenido e intenta nuevamente.';
      }
    }
  }
}

$editablePayload = [];
foreach ($editableColumns as $field => $column) $editablePayload[$field] = $row[$field] ?? null;
$jsonContent = json_encode($editablePayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
$pageTitle = 'Editar JSON · ' . $config['label'];
$pageSubtitle = 'Edición avanzada del contenido almacenado en MySQL';
require __DIR__ . '/includes/header.php';
?>
<section class="panel content-editor-panel">
  <div class="panel-header"><div><h2>Editar JSON · <?php echo e($config['label']); ?></h2><p class="muted">Registro #<?php echo (int) $id; ?>. Los campos técnicos y de auditoría están protegidos.</p></div><a class="btn btn-soft" href="content.php?module=<?php echo e($config['module']); ?>&table=<?php echo e($table); ?>&edit=<?php echo (int) $id; ?>">Volver al registro</a></div>
  <?php if ($message): ?><div class="alert alert-success"><?php echo e($message); ?></div><?php endif; ?>
  <?php if ($error): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>
  <form method="post" class="content-form">
    <?php echo csrf_field(); ?>
    <input type="hidden" name="table" value="<?php echo e($table); ?>"><input type="hidden" name="id" value="<?php echo (int) $id; ?>">
    <label class="content-field full">JSON<textarea name="json_content" rows="28" spellcheck="false" style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; line-height: 1.5; white-space: pre; tab-size: 2;"><?php echo e((string) $jsonContent); ?></textarea></label>
    <div class="form-actions"><button class="btn btn-gold" type="submit">Validar y guardar JSON</button><a class="btn btn-soft" href="content.php?module=<?php echo e($config['module']); ?>&table=<?php echo e($table); ?>&edit=<?php echo (int) $id; ?>">Cancelar</a></div>
  </form>
</section>
<section class="panel"><h3>Campos protegidos</h3><p class="muted">No se permite modificar id, created_at, updated_at, deleted_at ni la fecha derivada del Santoral. Cualquier propiedad desconocida es rechazada por el backend.</p></section>
<?php require __DIR__ . '/includes/footer.php'; ?>

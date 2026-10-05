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
    <div class="json-editor-guide">
      <strong>Editor estructurado</strong>
      <span>El JSON es editable. Puedes aplicar formato al texto almacenado usando Markdown, igual que en Consagraciones.</span>
      <small>Usa <b>**negrita**</b>, <i>*cursiva*</i>, <b>## Título</b>, <b>&gt; Cita</b> y <b>- Lista</b>. El formato se guarda dentro del texto y se valida antes de actualizar.</small>
    </div>
    <div class="json-editor-actions">
      <button type="button" class="btn btn-soft" data-json-format>✣ Formatear</button>
      <button type="button" class="btn btn-soft" data-json-copy>▣ Copiar</button>
      <button type="button" class="btn btn-soft" data-json-restore>↶ Restaurar</button>
      <button type="button" class="btn btn-soft" data-json-bold><b>Negrita</b></button>
      <button type="button" class="btn btn-soft" data-json-italic><i>Cursiva</i></button>
      <button type="button" class="btn btn-soft" data-json-heading>## Título</button>
      <button type="button" class="btn btn-soft" data-json-quote>&gt; Cita</button>
      <button type="button" class="btn btn-soft" data-json-list>- Lista</button>
      <span data-json-status>JSON válido pendiente de validar.</span>
    </div>
    <label class="content-field full">JSON<textarea id="json-content-editor" name="json_content" rows="28" spellcheck="false" style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; line-height: 1.5; white-space: pre; tab-size: 2;"><?php echo e((string) $jsonContent); ?></textarea></label>
    <div class="form-actions"><button class="btn btn-gold" type="submit">Validar y guardar JSON</button><a class="btn btn-soft" href="content.php?module=<?php echo e($config['module']); ?>&table=<?php echo e($table); ?>&edit=<?php echo (int) $id; ?>">Cancelar</a></div>
  </form>
</section>
<section class="panel"><h3>Campos protegidos</h3><p class="muted">No se permite modificar id, created_at, updated_at, deleted_at ni la fecha derivada del Santoral. Cualquier propiedad desconocida es rechazada por el backend.</p></section>
<style>
.json-editor-guide{display:flex;flex-direction:column;gap:6px;padding:14px 16px;margin-bottom:12px;border:1px solid rgba(212,175,55,.25);border-radius:12px;background:rgba(212,175,55,.06)}
.json-editor-guide strong{color:#d4af37}.json-editor-guide small{opacity:.8}
.json-editor-actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:12px}
.json-editor-actions [data-json-status]{font-size:12px;opacity:.75;margin-left:auto}
</style>
<script>
document.addEventListener('DOMContentLoaded', function () {
  var editor = document.getElementById('json-content-editor');
  if (!editor) return;
  var original = editor.value;
  var status = document.querySelector('[data-json-status]');

  function setStatus(message, ok) {
    if (!status) return;
    status.textContent = message;
    status.style.color = ok === false ? '#dc2626' : '#6b7280';
  }

  function formatJson() {
    try {
      var parsed = JSON.parse(editor.value);
      editor.value = JSON.stringify(parsed, null, 2);
      setStatus('JSON válido y formateado.', true);
    } catch (error) {
      setStatus('JSON inválido: ' + error.message, false);
    }
  }

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(editor.value);
      setStatus('JSON copiado.', true);
    } catch (error) {
      editor.select();
      document.execCommand('copy');
      setStatus('JSON copiado.', true);
    }
  }

  function restoreJson() {
    if (!window.confirm('¿Restaurar el JSON original? Se perderán los cambios no guardados.')) return;
    editor.value = original;
    setStatus('JSON original restaurado.', true);
  }

  function wrapSelection(prefix, suffix) {
    var start = editor.selectionStart;
    var end = editor.selectionEnd;
    var selected = editor.value.slice(start, end);
    if (!selected) {
      selected = 'texto';
    }
    var replacement = prefix + selected + suffix;
    editor.setRangeText(replacement, start, end, 'select');
    editor.focus();
  }

  function prefixLines(prefix) {
    var start = editor.selectionStart;
    var end = editor.selectionEnd;
    var selected = editor.value.slice(start, end) || 'texto';
    var replacement = selected.split('\n').map(function (line) {
      return line ? prefix + line : line;
    }).join('\n');
    editor.setRangeText(replacement, start, end, 'select');
    editor.focus();
  }

  document.querySelector('[data-json-format]')?.addEventListener('click', formatJson);
  document.querySelector('[data-json-copy]')?.addEventListener('click', copyJson);
  document.querySelector('[data-json-restore]')?.addEventListener('click', restoreJson);
  document.querySelector('[data-json-bold]')?.addEventListener('click', function(){ wrapSelection('**','**'); });
  document.querySelector('[data-json-italic]')?.addEventListener('click', function(){ wrapSelection('*','*'); });
  document.querySelector('[data-json-heading]')?.addEventListener('click', function(){ prefixLines('## '); });
  document.querySelector('[data-json-quote]')?.addEventListener('click', function(){ prefixLines('> '); });
  document.querySelector('[data-json-list]')?.addEventListener('click', function(){ prefixLines('- '); });

  editor.addEventListener('input', function () {
    try {
      JSON.parse(editor.value);
      setStatus('JSON válido.', true);
    } catch (error) {
      setStatus('JSON pendiente de corrección.', false);
    }
  });
});
</script>
<?php require __DIR__ . '/includes/footer.php'; ?>

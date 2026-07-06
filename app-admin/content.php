<?php

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();

$modules = [
  'configuracion' => [
    'title' => 'Configuracion',
    'subtitle' => 'Datos base de la emisora, app, apariencia y redes',
    'tables' => [
      'lvj_cfg_emisora' => 'Emisora',
      'lvj_cfg_app' => 'App',
      'lvj_cfg_apariencia' => 'Apariencia',
      'lvj_cfg_redes_sociales' => 'Redes sociales',
    ],
  ],
  'radio' => [
    'title' => 'Radio en Vivo',
    'subtitle' => 'Streams, programas, programacion y locutores',
    'tables' => [
      'lvj_rad_streams' => 'Streams',
      'lvj_rad_programas' => 'Programas',
      'lvj_rad_programacion' => 'Programacion',
      'lvj_rad_locutores' => 'Locutores',
    ],
  ],
  'liturgia' => [
    'title' => 'Liturgia del Dia',
    'subtitle' => 'Liturgia, palabra diaria, lectio divina y tiempos',
    'tables' => [
      'lvj_lit_lectura_dia' => 'Lectura del Dia',
      'lvj_lit_tiempos' => 'Tiempos liturgicos',
      'lvj_lit_temas' => 'Temas',
    ],
  ],
  'capilla' => [
    'title' => 'Capilla Virtual',
    'subtitle' => 'Recursos e intenciones para la capilla',
    'tables' => [
      'lvj_com_peticiones_oracion' => 'Peticiones de oracion',
      'lvj_com_grupos_oracion' => 'Grupos de oracion',
      'lvj_com_testimonios' => 'Testimonios',
    ],
  ],
  'biblia' => [
    'title' => 'Biblia y Planes',
    'subtitle' => 'Libros, versiculos, planes y progreso',
    'tables' => [
      'lvj_bib_planes' => 'Planes biblicos',
      'lvj_bib_plan_dias' => 'Dias de planes',
      'lvj_bib_libros' => 'Libros',
      'lvj_bib_versiculos' => 'Versiculos',
      'lvj_bib_versiculos_tematicos' => 'Versiculos tematicos',
      'lvj_bib_versiones' => 'Versiones',
    ],
  ],
  'oracion' => [
    'title' => 'Oracion y Rosario',
    'subtitle' => 'Rosarios, novenas, misterios, devociones y oraciones',
    'tables' => [
      'lvj_ora_rosarios' => 'Rosarios',
      'lvj_ora_misterios_rosario' => 'Misterios',
      'lvj_ora_oraciones' => 'Oraciones',
      'lvj_ora_devociones' => 'Devociones',
      'lvj_ora_novenas' => 'Novenas',
      'lvj_ora_novena_dias' => 'Dias de novena',
    ],
  ],
  'podcast' => [
    'title' => 'Podcast',
    'subtitle' => 'Categorias y episodios',
    'tables' => [
      'lvj_pod_categorias' => 'Categorias',
      'lvj_pod_podcasts' => 'Podcasts',
    ],
  ],
  'santoral' => [
    'title' => 'Santoral',
    'subtitle' => 'Santos y celebraciones del dia',
    'tables' => [
      'lvj_san_santo_dia' => 'Santo del dia',
    ],
  ],
  'economia' => [
    'title' => 'Donaciones',
    'subtitle' => 'Apoyos, padrinos, bonos y donaciones',
    'tables' => [
      'lvj_eco_apoyos_emisora' => 'Apoyos a la emisora',
      'lvj_eco_plan_padrino' => 'Planes padrino',
      'lvj_eco_padrinos' => 'Padrinos',
      'lvj_eco_donaciones' => 'Donaciones',
      'lvj_eco_bono_config' => 'Bonos',
      'lvj_eco_bono_numeros' => 'Numeros de bono',
      'lvj_eco_bono_compras' => 'Compras de bono',
    ],
  ],
  'publicidad' => [
    'title' => 'Publicidad',
    'subtitle' => 'AdSense, patrocinadores y publicidad comercial',
    'tables' => [
      'lvj_pub_adsense' => 'AdSense',
      'lvj_pub_patrocinadores' => 'Patrocinadores',
      'lvj_pub_publicidad_comercial' => 'Publicidad comercial',
      'lvj_pub_clicks' => 'Clicks',
      'lvj_pub_impresiones' => 'Impresiones',
    ],
  ],
  'usuarios' => [
    'title' => 'Usuarios y Comunidad',
    'subtitle' => 'Usuarios, roles, favoritos y actividad comunitaria',
    'tables' => [
      'lvj_com_usuarios' => 'Usuarios app',
      'lvj_adm_roles' => 'Roles',
      'lvj_adm_logs' => 'Logs administrativos',
      'lvj_com_favoritos' => 'Favoritos',
      'lvj_com_notas_espirituales' => 'Notas espirituales',
    ],
  ],
];

function content_table_allowed(array $modules, string $table): bool
{
  foreach ($modules as $module) {
    if (isset($module['tables'][$table])) {
      return true;
    }
  }

  return false;
}

function content_columns(PDO $pdo, string $table): array
{
  try {
    return $pdo->query("SHOW COLUMNS FROM {$table}")->fetchAll();
  } catch (Throwable $error) {
    return [];
  }
}

function content_column_map(array $columns): array
{
  $map = [];
  foreach ($columns as $column) {
    $map[(string) $column['Field']] = $column;
  }

  return $map;
}

function content_label(string $column): string
{
  $labels = [
    'emisora_id' => 'Emisora',
    'liturgia_id' => 'Liturgia relacionada',
    'programa_id' => 'Programa',
    'categoria_id' => 'Categoria',
    'imagen_url' => 'Imagen',
    'image_url' => 'Imagen',
    'video_url' => 'Video',
    'audio_url' => 'Audio',
    'stream_url' => 'URL del stream',
    'metadata_url' => 'URL de metadata',
    'cliente_id' => 'Cliente AdSense',
    'slot_radio' => 'Slot Radio',
    'slot_programacion' => 'Slot Programacion',
    'titulo' => 'Titulo',
    'nombre' => 'Nombre',
    'descripcion' => 'Descripcion',
    'fecha' => 'Fecha',
    'hora_inicio' => 'Hora de inicio',
    'hora_fin' => 'Hora de cierre',
    'cita' => 'Cita biblica',
    'texto' => 'Texto',
    'frase_destacada' => 'Frase destacada',
    'estado' => 'Estado',
    'activo' => 'Activo',
    'status' => 'Estado',
    'locutor_id' => 'Locutor',
    'conductor_id' => 'Conductor',
    'rol_id' => 'Rol',
    'folder_id' => 'Carpeta',
    'user_id' => 'Usuario',
    'plan_id' => 'Plan',
    'libro_id' => 'Libro',
    'tiempo_id' => 'Tiempo liturgico',
    'tema_id' => 'Tema visual',
    'santo_id' => 'Santo del dia',
    'pregunta_meditar' => 'Pregunta para meditar',
    'mensaje_final' => 'Mensaje final',
    'imagen_home' => 'Imagen home',
    'imagen_lectura' => 'Imagen lectura',
    'logo_especial' => 'Logo especial',
  ];

  if (isset($labels[$column])) {
    return $labels[$column];
  }

  return ucwords(str_replace('_', ' ', $column));
}

function content_is_status_field(string $field): bool
{
  return in_array($field, ['estado', 'activo', 'status'], true);
}

function content_is_auto_column(array $column): bool
{
  $field = (string) $column['Field'];
  $extra = strtolower((string) ($column['Extra'] ?? ''));

  return $field === 'id'
    || strpos($extra, 'auto_increment') !== false
    || in_array($field, ['created_at', 'updated_at', 'last_login', 'deleted_at'], true);
}

function content_is_derived_column(string $table, string $field): bool
{
  $derivedByTable = [
    'lvj_lit_dia' => ['tiempo_liturgico', 'color_liturgico'],
    'lvj_lit_lectura_dia' => ['color_liturgico'],
  ];

  return in_array($field, $derivedByTable[$table] ?? [], true);
}

function content_editable_columns(array $columns, string $table = ''): array
{
  return array_values(array_filter($columns, function ($column) use ($table) {
    $field = (string) $column['Field'];

    return !content_is_auto_column($column) && !content_is_derived_column($table, $field);
  }));
}

function content_list_columns(array $columns, string $table = ''): array
{
  return array_values(array_filter($columns, function ($column) use ($table) {
    $field = (string) $column['Field'];

    return !content_is_derived_column($table, $field);
  }));
}

function content_form_sections(string $table): array
{
  if ($table !== 'lvj_lit_lectura_dia') {
    return [];
  }

  return [
    'general' => 'General',
    'liturgia' => 'Liturgia',
    'espiritual' => 'Reflexion y multimedia',
  ];
}

function content_field_section(string $table, string $field): string
{
  if ($table !== 'lvj_lit_lectura_dia') {
    return '';
  }

  $liturgiaFields = [
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

  $spiritualFields = [
    'frase_destacada',
    'reflexion',
    'pregunta_meditar',
    'oracion',
    'compromiso',
    'mensaje_final',
    'imagen_home',
    'imagen_lectura',
    'banner',
    'logo_especial',
    'audio_url',
    'video_url',
  ];

  if (in_array($field, $liturgiaFields, true)) {
    return 'liturgia';
  }

  if (in_array($field, $spiritualFields, true)) {
    return 'espiritual';
  }

  return 'general';
}

function content_normalize_value(array $column, array $source)
{
  $field = (string) $column['Field'];
  $type = strtolower((string) $column['Type']);
  $isNullable = strtoupper((string) ($column['Null'] ?? '')) === 'YES';

  if (strpos($type, 'tinyint') === 0) {
    if (content_is_status_field($field) && array_key_exists($field, $source)) {
      return (int) $source[$field];
    }

    return isset($source[$field]) ? 1 : 0;
  }

  $value = trim((string) ($source[$field] ?? ''));

  if ($value === '' && $isNullable) {
    return null;
  }

  if ($value === '' && (strpos($type, 'int') !== false || strpos($type, 'decimal') !== false || strpos($type, 'float') !== false)) {
    return 0;
  }

  return $value;
}

function content_foreign_key_fallback(string $table, string $field): ?array
{
  $map = [
    'emisora_id' => ['table' => 'lvj_cfg_emisora', 'column' => 'id'],
    'programa_id' => ['table' => 'lvj_rad_programas', 'column' => 'id'],
    'locutor_id' => ['table' => 'lvj_rad_locutores', 'column' => 'id'],
    'conductor_id' => ['table' => 'lvj_rad_locutores', 'column' => 'id'],
    'liturgia_id' => ['table' => 'lvj_lit_dia', 'column' => 'id'],
    'tiempo_id' => ['table' => 'lvj_lit_tiempos', 'column' => 'id'],
    'tema_id' => ['table' => 'lvj_lit_temas', 'column' => 'id'],
    'santo_id' => ['table' => 'lvj_san_santo_dia', 'column' => 'id'],
    'rol_id' => ['table' => 'lvj_adm_roles', 'column' => 'id'],
    'folder_id' => ['table' => 'lvj_file_folders', 'column' => 'id'],
    'user_id' => ['table' => 'lvj_file_users', 'column' => 'id'],
    'usuario_id' => ['table' => 'lvj_com_usuarios', 'column' => 'id'],
    'plan_id' => ['table' => 'lvj_bib_planes', 'column' => 'id'],
    'libro_id' => ['table' => 'lvj_bib_libros', 'column' => 'id'],
    'version_id' => ['table' => 'lvj_bib_versiones', 'column' => 'id'],
    'rosario_id' => ['table' => 'lvj_ora_rosarios', 'column' => 'id'],
    'novena_id' => ['table' => 'lvj_ora_novenas', 'column' => 'id'],
  ];

  if ($field === 'categoria_id') {
    if (strpos($table, 'lvj_pod_') === 0) {
      return ['table' => 'lvj_pod_categorias', 'column' => 'id'];
    }
    if (strpos($table, 'lvj_rad_') === 0) {
      return ['table' => 'lvj_rad_programas', 'column' => 'id'];
    }
  }

  return $map[$field] ?? null;
}

function content_foreign_key_ref(PDO $pdo, string $table, string $field): ?array
{
  if (!preg_match('/_id$/', $field)) {
    return null;
  }

  try {
    $stmt = $pdo->prepare("
      SELECT REFERENCED_TABLE_NAME AS ref_table, REFERENCED_COLUMN_NAME AS ref_column
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = :table_name
        AND COLUMN_NAME = :column_name
        AND REFERENCED_TABLE_NAME IS NOT NULL
      LIMIT 1
    ");
    $stmt->execute(['table_name' => $table, 'column_name' => $field]);
    $row = $stmt->fetch();

    if ($row && $row['ref_table'] && $row['ref_column']) {
      return ['table' => (string) $row['ref_table'], 'column' => (string) $row['ref_column']];
    }
  } catch (Throwable $error) {
    // If the host restricts information_schema, the curated fallback below still helps.
  }

  return content_foreign_key_fallback($table, $field);
}

function content_reference_label(array $row): string
{
  foreach (['nombre', 'nombre_emisora', 'nombre_programa', 'nombre_locutor', 'titulo', 'name', 'title', 'email', 'cita', 'fecha', 'slug'] as $field) {
    if (isset($row[$field]) && trim((string) $row[$field]) !== '') {
      return (string) $row[$field];
    }
  }

  return 'Registro #' . (string) ($row['id'] ?? '');
}

function content_reference_options(PDO $pdo, string $refTable, string $refColumn): array
{
  if (!preg_match('/^[a-zA-Z0-9_]+$/', $refTable) || !preg_match('/^[a-zA-Z0-9_]+$/', $refColumn)) {
    return [];
  }

  try {
    $rows = $pdo->query("SELECT * FROM {$refTable} ORDER BY {$refColumn} DESC LIMIT 250")->fetchAll();
  } catch (Throwable $error) {
    return [];
  }

  $options = [];
  foreach ($rows as $row) {
    $value = (string) ($row[$refColumn] ?? '');
    if ($value === '') {
      continue;
    }
    $options[] = [
      'value' => $value,
      'label' => content_reference_label($row),
      'data' => $row,
    ];
  }

  return $options;
}

function content_select_html(string $field, string $label, $value, array $options, bool $required, string $class = 'content-field', string $selectAttrs = ''): string
{
  $html = '<label class="' . e($class) . '">' . e($label) . '<select name="' . e($field) . '"' . ($required ? ' required' : '') . $selectAttrs . '>';
  if (!$required) {
    $html .= '<option value="">Sin seleccionar</option>';
  }

  foreach ($options as $option) {
    $selected = (string) $value === (string) $option['value'] ? ' selected' : '';
    $dataAttrs = '';

    if (isset($option['data']) && is_array($option['data'])) {
      foreach ($option['data'] as $dataKey => $dataValue) {
        if (!is_scalar($dataValue) || $dataValue === null) {
          continue;
        }
        $dataAttrs .= ' data-' . e(str_replace('_', '-', (string) $dataKey)) . '="' . e((string) $dataValue) . '"';
      }
    }

    $html .= '<option value="' . e((string) $option['value']) . '"' . $selected . $dataAttrs . '>' . e((string) $option['label']) . '</option>';
  }

  return $html . '</select></label>';
}

function content_liturgical_time_summary(array $options, $value): string
{
  $selected = null;
  foreach ($options as $option) {
    if ((string) $value === (string) $option['value']) {
      $selected = $option['data'] ?? null;
      break;
    }
  }

  $name = is_array($selected) ? (string) ($selected['nombre'] ?? '') : '';
  $color = is_array($selected) ? (string) ($selected['color_liturgico'] ?? '') : '';
  $cleanName = trim((string) preg_replace('/^tiempo\s+/i', '', $name));

  return '<div class="derived-field-note" data-liturgical-time-summary>'
    . '<span>Tiempo calculado: <strong data-liturgical-name-preview>' . e($cleanName ?: 'Sin seleccionar') . '</strong></span>'
    . '<span>Color liturgico: <strong data-liturgical-color-preview>' . e($color ?: 'Sin seleccionar') . '</strong></span>'
    . '</div>';
}

function content_display_value($value): string
{
  $text = trim((string) $value);
  if (strlen($text) > 90) {
    return substr($text, 0, 87) . '...';
  }

  return $text;
}

function content_field_class(string $field, string $type): string
{
  $wideHints = ['descripcion', 'contenido', 'reflexion', 'texto', 'frase', 'notas', 'beneficios'];
  $urlHints = ['url', 'web', 'imagen', 'logo', 'video', 'audio', 'stream', 'metadata'];

  foreach ($urlHints as $hint) {
    if (strpos($field, $hint) !== false) {
      return 'content-field';
    }
  }

  foreach ($wideHints as $hint) {
    if (strpos($field, $hint) !== false) {
      return 'content-field full';
    }
  }

  if (strpos($type, 'text') !== false || strpos($type, 'longtext') !== false) {
    return 'content-field full';
  }

  return 'content-field';
}

function content_field_html(PDO $pdo, string $table, array $column, array $row = []): string
{
  $field = (string) $column['Field'];
  $type = strtolower((string) $column['Type']);
  $value = $row[$field] ?? ($column['Default'] ?? '');
  $label = content_label($field);
  $isRequired = strtoupper((string) ($column['Null'] ?? '')) === 'NO' && $column['Default'] === null;
  $required = $isRequired ? ' required' : '';
  $fieldClass = content_field_class($field, $type);

  if (content_is_status_field($field)) {
    if (strpos($type, 'tinyint') === 0 || strpos($type, 'int') !== false) {
      return content_select_html($field, $label, $value, [
        ['value' => '1', 'label' => 'Activo'],
        ['value' => '0', 'label' => 'Desactivado'],
      ], true, 'content-field status-field');
    }

    return content_select_html($field, $label, $value, [
      ['value' => 'publicado', 'label' => 'Publicado'],
      ['value' => 'borrador', 'label' => 'Borrador'],
      ['value' => 'activo', 'label' => 'Activo'],
      ['value' => 'inactivo', 'label' => 'Desactivado'],
    ], $isRequired, 'content-field status-field');
  }

  $foreignKey = content_foreign_key_ref($pdo, $table, $field);
  if ($foreignKey) {
    $options = content_reference_options($pdo, $foreignKey['table'], $foreignKey['column']);
    if ($options) {
      $selectAttrs = $field === 'tiempo_id' ? ' data-liturgical-time-select' : '';
      $select = content_select_html($field, $label, $value, $options, $isRequired, 'content-field relation-field', $selectAttrs);

      if (in_array($table, ['lvj_lit_dia', 'lvj_lit_lectura_dia'], true) && $field === 'tiempo_id') {
        return $select . content_liturgical_time_summary($options, $value);
      }

      return $select;
    }
  }

  if (strpos($type, 'tinyint') === 0) {
    $checked = (int) $value === 1 ? ' checked' : '';
    return '<label class="check-field content-field"><input type="checkbox" name="' . e($field) . '" value="1"' . $checked . '> ' . e($label) . '</label>';
  }

  $inputType = 'text';
  if (strpos($type, 'int') !== false || strpos($type, 'decimal') !== false || strpos($type, 'float') !== false) {
    $inputType = 'number';
  }
  if (strpos($field, 'fecha') !== false) {
    $inputType = 'date';
  }
  if (strpos($field, 'email') !== false || strpos($field, 'correo') !== false) {
    $inputType = 'email';
  }
  if (strpos($field, 'url') !== false || strpos($field, 'web') !== false || strpos($field, 'imagen') !== false || strpos($field, 'logo') !== false || strpos($field, 'video') !== false) {
    $inputType = 'url';
  }

  if ($inputType !== 'url' && (strpos($type, 'text') !== false || strpos($type, 'longtext') !== false || strpos($field, 'descripcion') !== false || strpos($field, 'contenido') !== false || strpos($field, 'reflexion') !== false)) {
    return '<label class="' . e($fieldClass) . '">' . e($label) . '<textarea name="' . e($field) . '" rows="5"' . $required . ' placeholder="' . e($label) . '">' . e((string) $value) . '</textarea></label>';
  }

  return '<label class="' . e($fieldClass) . '">' . e($label) . '<input type="' . e($inputType) . '" name="' . e($field) . '" value="' . e((string) $value) . '"' . $required . ' placeholder="' . e($label) . '"></label>';
}

function content_inactive_filter(array $columns): string
{
  $map = content_column_map($columns);

  foreach (['estado', 'activo', 'status'] as $field) {
    if (!isset($map[$field])) {
      continue;
    }

    $type = strtolower((string) $map[$field]['Type']);
    if (strpos($type, 'tinyint') === 0 || strpos($type, 'int') !== false) {
      return "{$field} <> 0";
    }

    return "LOWER(COALESCE({$field}, '')) NOT IN ('0', 'inactivo', 'desactivado', 'eliminado', 'deleted')";
  }

  return '';
}

function content_delete_statement(PDO $pdo, string $table, string $primaryColumn, array $columns): PDOStatement
{
  $map = content_column_map($columns);

  if (isset($map['estado'])) {
    $type = strtolower((string) $map['estado']['Type']);
    $value = (strpos($type, 'tinyint') === 0 || strpos($type, 'int') !== false) ? '0' : "'eliminado'";
    return $pdo->prepare("UPDATE {$table} SET estado = {$value} WHERE {$primaryColumn} = :id LIMIT 1");
  }

  if (isset($map['activo'])) {
    return $pdo->prepare("UPDATE {$table} SET activo = 0 WHERE {$primaryColumn} = :id LIMIT 1");
  }

  if (isset($map['status'])) {
    $type = strtolower((string) $map['status']['Type']);
    $value = (strpos($type, 'tinyint') === 0 || strpos($type, 'int') !== false) ? '0' : "'inactivo'";
    return $pdo->prepare("UPDATE {$table} SET status = {$value} WHERE {$primaryColumn} = :id LIMIT 1");
  }

  return $pdo->prepare("DELETE FROM {$table} WHERE {$primaryColumn} = :id LIMIT 1");
}

$moduleKey = (string) ($_GET['module'] ?? 'configuracion');
if (!isset($modules[$moduleKey])) {
  $moduleKey = 'configuracion';
}

$module = $modules[$moduleKey];
$table = (string) ($_GET['table'] ?? array_key_first($module['tables']));
if (!isset($module['tables'][$table]) || !content_table_allowed($modules, $table)) {
  $table = (string) array_key_first($module['tables']);
}

$columns = content_columns($pdo, $table);
$editableColumns = content_editable_columns($columns, $table);
$listColumns = content_list_columns($columns, $table);
$formSections = content_form_sections($table);
$primaryColumn = 'id';
$message = '';
$error = '';
$editId = isset($_GET['edit']) ? (int) $_GET['edit'] : 0;
$editRow = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf();
  $action = (string) ($_POST['action'] ?? '');
  $postedTable = (string) ($_POST['table'] ?? '');

  if ($postedTable !== $table || !content_table_allowed($modules, $postedTable)) {
    $error = 'Tabla no permitida.';
  } elseif (!$columns) {
    $error = 'La tabla seleccionada no existe o no esta disponible.';
  } elseif ($action === 'save') {
    $id = (int) ($_POST['id'] ?? 0);
    $data = [];

    foreach ($editableColumns as $column) {
      $field = (string) $column['Field'];
      $data[$field] = content_normalize_value($column, $_POST);
    }

    try {
      if ($id > 0) {
        $set = [];
        foreach ($data as $field => $value) {
          $set[] = "{$field} = :{$field}";
        }
        $data['id'] = $id;
        $stmt = $pdo->prepare("UPDATE {$table} SET " . implode(', ', $set) . " WHERE {$primaryColumn} = :id LIMIT 1");
        $stmt->execute($data);
        log_activity('update', $table, $id, 'Registro actualizado');
        $message = 'Registro actualizado.';
      } else {
        $fields = array_keys($data);
        $placeholders = array_map(function ($field) {
          return ':' . $field;
        }, $fields);
        $stmt = $pdo->prepare("INSERT INTO {$table} (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")");
        $stmt->execute($data);
        log_activity('create', $table, (int) $pdo->lastInsertId(), 'Registro creado');
        $message = 'Registro creado.';
      }
      $editId = 0;
    } catch (Throwable $saveError) {
      $error = 'No se pudo guardar: ' . $saveError->getMessage();
    }
  } elseif ($action === 'delete') {
    $id = (int) ($_POST['id'] ?? 0);
    try {
      $stmt = content_delete_statement($pdo, $table, $primaryColumn, $columns);
      $stmt->execute(['id' => $id]);
      log_activity('delete', $table, $id, 'Registro eliminado o desactivado');
      header('Location: content.php?module=' . urlencode($moduleKey) . '&table=' . urlencode($table) . '&deleted=1');
      exit;
    } catch (Throwable $deleteError) {
      $error = 'No se pudo eliminar: ' . $deleteError->getMessage();
    }
  }
}

if (isset($_GET['deleted'])) {
  $message = 'Registro eliminado o desactivado.';
}

if ($editId > 0 && $columns) {
  try {
    $stmt = $pdo->prepare("SELECT * FROM {$table} WHERE {$primaryColumn} = :id LIMIT 1");
    $stmt->execute(['id' => $editId]);
    $editRow = $stmt->fetch() ?: [];
  } catch (Throwable $editError) {
    $editRow = [];
  }
}

try {
  $where = $columns ? content_inactive_filter($columns) : '';
  $whereSql = $where ? " WHERE {$where}" : '';
  $rows = $columns ? $pdo->query("SELECT * FROM {$table}{$whereSql} ORDER BY {$primaryColumn} DESC LIMIT 80")->fetchAll() : [];
} catch (Throwable $listError) {
  $rows = [];
  $error = $error ?: 'No se pudieron cargar registros: ' . $listError->getMessage();
}

$pageTitle = $module['title'];
$pageSubtitle = $module['subtitle'];
require __DIR__ . '/includes/header.php';
?>

<section class="content-toolbar">
  <div class="content-tabs">
    <?php foreach ($modules as $key => $item): ?>
      <a class="<?php echo $key === $moduleKey ? 'active' : ''; ?>" href="content.php?module=<?php echo e($key); ?>"><?php echo e($item['title']); ?></a>
    <?php endforeach; ?>
  </div>
</section>

<section class="panel content-editor-panel">
  <div class="panel-header">
    <div>
      <h2><?php echo e($module['tables'][$table]); ?></h2>
      <p class="muted">Gestiona el contenido que luego consumira la app. Los campos relacionados se seleccionan desde sus registros disponibles.</p>
    </div>
    <form method="get" class="table-selector">
      <input type="hidden" name="module" value="<?php echo e($moduleKey); ?>">
      <select name="table" onchange="this.form.submit()">
        <?php foreach ($module['tables'] as $tableName => $label): ?>
          <option value="<?php echo e($tableName); ?>" <?php echo $tableName === $table ? 'selected' : ''; ?>><?php echo e($label); ?></option>
        <?php endforeach; ?>
      </select>
    </form>
  </div>

  <?php if ($message): ?><div class="alert alert-success"><?php echo e($message); ?></div><?php endif; ?>
  <?php if ($error): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>

  <?php if (!$columns): ?>
    <p class="muted">Esta tabla aun no esta disponible en la base de datos.</p>
  <?php else: ?>
    <form method="post" class="content-form">
      <?php echo csrf_field(); ?>
      <input type="hidden" name="action" value="save">
      <input type="hidden" name="table" value="<?php echo e($table); ?>">
      <input type="hidden" name="id" value="<?php echo (int) ($editRow['id'] ?? 0); ?>">

      <?php if ($formSections): ?>
        <div class="content-step-tabs" data-content-section-tabs>
          <?php foreach ($formSections as $sectionKey => $sectionLabel): ?>
            <button type="button" class="<?php echo $sectionKey === 'general' ? 'active' : ''; ?>" data-content-section-tab="<?php echo e($sectionKey); ?>">
              <?php echo e($sectionLabel); ?>
            </button>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>

      <div class="content-form-grid">
        <?php foreach ($editableColumns as $column): ?>
          <?php
            $field = (string) $column['Field'];
            $section = content_field_section($table, $field);
          ?>
          <?php if ($section): ?>
            <div class="content-section-shell" data-content-section="<?php echo e($section); ?>" <?php echo $section !== 'general' ? 'hidden' : ''; ?>>
              <?php echo content_field_html($pdo, $table, $column, $editRow); ?>
            </div>
          <?php else: ?>
            <?php echo content_field_html($pdo, $table, $column, $editRow); ?>
          <?php endif; ?>
        <?php endforeach; ?>
      </div>

      <div class="form-actions">
        <button class="btn btn-gold" type="submit"><?php echo $editRow ? 'Actualizar registro' : 'Crear registro'; ?></button>
        <?php if ($editRow): ?><a class="btn btn-soft" href="content.php?module=<?php echo e($moduleKey); ?>&table=<?php echo e($table); ?>">Cancelar edicion</a><?php endif; ?>
      </div>
    </form>
  <?php endif; ?>
</section>

<?php if ($moduleKey === 'liturgia'): ?>
  <section class="panel import-panel">
    <h2>Importador asistido</h2>
    <p class="muted">Preparado para pegar una URL o texto largo y distribuirlo luego en lecturas, salmo, evangelio y reflexion. Por ahora no guarda automaticamente para evitar errores de contenido.</p>
    <textarea rows="5" placeholder="Pega aqui el texto de la liturgia para revisarlo antes de guardarlo..."></textarea>
  </section>
<?php endif; ?>

<section class="panel content-records-panel">
  <div class="panel-header">
    <h2>Registros</h2>
    <span class="badge"><?php echo count($rows); ?> visibles</span>
  </div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <?php foreach (array_slice($listColumns, 0, 6) as $column): ?>
            <th><?php echo e(content_label((string) $column['Field'])); ?></th>
          <?php endforeach; ?>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($rows as $row): ?>
          <tr>
            <?php foreach (array_slice($listColumns, 0, 6) as $column): ?>
              <?php $field = (string) $column['Field']; ?>
              <td><?php echo e(content_display_value($row[$field] ?? '')); ?></td>
            <?php endforeach; ?>
            <td class="actions">
              <a href="content.php?module=<?php echo e($moduleKey); ?>&table=<?php echo e($table); ?>&edit=<?php echo (int) $row['id']; ?>">Editar</a>
              <form method="post" onsubmit="return confirm('Eliminar o desactivar este registro?');">
                <?php echo csrf_field(); ?>
                <input type="hidden" name="action" value="delete">
                <input type="hidden" name="table" value="<?php echo e($table); ?>">
                <input type="hidden" name="id" value="<?php echo (int) $row['id']; ?>">
                <button type="submit">Eliminar</button>
              </form>
            </td>
          </tr>
        <?php endforeach; ?>
        <?php if (!$rows): ?>
          <tr><td colspan="7" class="muted">No hay registros cargados.</td></tr>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>

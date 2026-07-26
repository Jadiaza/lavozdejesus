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
    'title' => 'Liturgia',
    'subtitle' => 'Liturgia diaria, calendario, lectio divina y catálogos',
    'tables' => [
      'lvj_lit_lectura_dia' => 'Lectura del Dia',
      'lvj_lit_dia' => 'Calendario liturgico',
      'lvj_lit_lectio_divina' => 'Lectio Divina',
      'lvj_lit_palabra_dia' => 'Palabra del Dia',
      'lvj_lit_tiempos' => 'Tiempos liturgicos',
      'lvj_lit_temas' => 'Temas',
      'lvj_lit_celebraciones' => 'Celebraciones',
      'lvj_lit_tipos_celebracion' => 'Tipos de celebracion',
    ],
  ],
  'santoral' => [
    'title' => 'Santoral',
    'subtitle' => 'Santos, fiestas y contenido espiritual del calendario',
    'tables' => [
      'lvj_san_santo_dia' => 'Santoral',
    ],
  ],
  'capilla' => [
    'title' => 'Capilla y Oracion',
    'subtitle' => 'Capillas, transmisiones, selección activa e historial técnico',
    'tables' => [
      'lvj_capillas' => 'Capillas',
      'lvj_capilla_streams' => 'Streams',
      'lvj_capilla_config' => 'Activar capilla',
      'lvj_capilla_logs' => 'Logs',
    ],
    'tabs' => [
      ['label' => 'Capillas', 'table' => 'lvj_capillas'],
      ['label' => 'Streams', 'table' => 'lvj_capilla_streams'],
      ['label' => 'Intenciones', 'href' => 'intenciones.php'],
      ['label' => 'Activar capilla', 'table' => 'lvj_capilla_config'],
      ['label' => 'Logs', 'table' => 'lvj_capilla_logs'],
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
      'lvj_bib_mapas' => 'Mapas',
      'lvj_bib_personajes' => 'Personajes bíblicos',
    ],
  ],
  'inteligencia-artificial' => [
    'title' => 'Formación y Supervisión IA',
    'subtitle' => 'Perfiles, instrucciones, reglas, fuentes, pruebas y auditoría técnica',
    'tables' => [
      'lvj_ai_profiles' => 'Perfiles',
      'lvj_ai_prompt_versions' => 'Instrucciones',
      'lvj_ai_rules' => 'Reglas',
      'lvj_ai_profile_rules' => 'Reglas por perfil',
      'lvj_ai_knowledge_sources' => 'Fuentes',
      'lvj_ai_source_files' => 'Archivos de fuentes',
      'lvj_ai_examples' => 'Ejemplos',
      'lvj_ai_test_cases' => 'Casos de prueba',
      'lvj_ai_test_runs' => 'Ejecuciones',
      'lvj_ai_test_results' => 'Resultados',
      'lvj_ai_response_logs' => 'Respuestas',
      'lvj_ai_response_reviews' => 'Revisiones',
      'lvj_ai_deployments' => 'Despliegues',
      'lvj_ai_settings' => 'Configuración',
      'lvj_ai_audit_logs' => 'Auditoría',
    ],
  ],
  'oracion' => [
    'title' => 'Rosarios y Oraciones',
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
    'capilla_activa_id' => 'Capilla activa',
    'stream_activo_id' => 'Stream activo',
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
    'mes' => 'Mes',
    'dia' => 'Dia',
    'hora_inicio' => 'Hora de inicio',
    'hora_fin' => 'Hora de cierre',
    'cita' => 'Cita biblica',
    'texto' => 'Texto',
    'frase_destacada' => 'Frase destacada',
    'estado' => 'Estado',
    'subtitulo' => 'Subtitulo',
    'pais' => 'Pais',
    'ciudad' => 'Ciudad',
    'sitio_web' => 'Sitio web',
    'logo_url' => 'Logo',
    'es_principal' => 'Es principal',
    'es_respaldo' => 'Es respaldo',
    'prioridad' => 'Prioridad',
    'updated_at' => 'Actualizado',
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
    'quien_fue' => 'Quien fue',
    'lucha_que_enfrento' => 'La lucha que enfrento',
    'secreto_de_santidad' => 'El secreto de su santidad',
    'ensenanza_para_hoy' => 'Ensenanza para hoy',
    'como_puedo_imitarlo' => 'Como puedo imitarlo',
    'paso_concreto' => 'Paso concreto para hoy',
    'oracion_intercesion' => 'Oracion de intercesion',
    'destacado' => 'Destacado',
    'orden' => 'Orden',
    'profile_id' => 'Perfil IA',
    'prompt_version_id' => 'Versión de instrucciones',
    'previous_prompt_version_id' => 'Versión anterior',
    'rule_id' => 'Regla',
    'source_id' => 'Fuente',
    'response_log_id' => 'Respuesta',
    'test_run_id' => 'Ejecución de prueba',
    'test_case_id' => 'Caso de prueba',
    'public_id' => 'Identificador público',
    'code' => 'Código',
    'module_code' => 'Módulo',
    'instructions' => 'Instrucciones',
    'instructions_summary' => 'Resumen de instrucciones',
    'output_structure' => 'Estructura de salida',
    'reasoning_effort' => 'Esfuerzo de razonamiento',
    'response_length' => 'Longitud de respuesta',
    'verification_status' => 'Verificación',
    'processing_status' => 'Procesamiento',
    'user_question' => 'Pregunta',
    'ideal_response' => 'Respuesta ideal',
    'rejected_response' => 'Respuesta rechazada',
    'rule_text' => 'Contenido de la regla',
    'setting_key' => 'Clave',
    'setting_value' => 'Valor',
    'review_status' => 'Estado de revisión',
    'generated_response' => 'Respuesta generada',
    'deployment_notes' => 'Notas del despliegue',
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
    'lvj_san_santo_dia' => ['fecha'],
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
  if ($table === 'lvj_capillas') {
    $map = content_column_map($columns);
    $preferred = ['id', 'nombre', 'ciudad', 'pais', 'estado', 'es_principal', 'es_respaldo', 'prioridad', 'updated_at'];
    $ordered = [];
    foreach ($preferred as $field) {
      if (isset($map[$field])) {
        $ordered[] = $map[$field];
      }
    }

    return $ordered;
  }

  return array_values(array_filter($columns, function ($column) use ($table) {
    $field = (string) $column['Field'];

    return !content_is_derived_column($table, $field);
  }));
}

function content_search_columns(array $columns, string $table): array
{
  if ($table === 'lvj_capillas') {
    $map = content_column_map($columns);
    return array_values(array_filter([
      $map['nombre'] ?? null,
      $map['ciudad'] ?? null,
      $map['pais'] ?? null,
    ]));
  }

  return array_slice(content_list_columns($columns, $table), 0, 8);
}

function content_order_columns_for_form(array $columns, string $table): array
{
  $orders = [
    'lvj_capillas' => [
      'nombre',
      'subtitulo',
      'descripcion',
      'pais',
      'ciudad',
      'sitio_web',
      'imagen_url',
      'logo_url',
      'es_principal',
      'es_respaldo',
      'prioridad',
      'estado',
    ],
    'lvj_san_santo_dia' => [
      'mes',
      'dia',
      'nombre',
      'titulo',
      'imagen_url',
      'frase_destacada',
      'quien_fue',
      'destacado',
      'orden',
      'estado',
      'lucha_que_enfrento',
      'secreto_de_santidad',
      'ensenanza_para_hoy',
      'como_puedo_imitarlo',
      'paso_concreto',
      'oracion_intercesion',
    ],
  ];

  if (!isset($orders[$table])) {
    return $columns;
  }

  $position = array_flip($orders[$table]);
  usort($columns, function ($left, $right) use ($position) {
    $leftField = (string) $left['Field'];
    $rightField = (string) $right['Field'];
    $leftOrder = $position[$leftField] ?? 999;
    $rightOrder = $position[$rightField] ?? 999;

    if ($leftOrder === $rightOrder) {
      return 0;
    }

    return $leftOrder <=> $rightOrder;
  });

  return $columns;
}

function content_form_sections(string $table): array
{
  if ($table === 'lvj_capillas') {
    return [
      'identidad' => 'Identidad',
      'recursos' => 'Recursos',
      'estado' => 'Estado',
    ];
  }

  if ($table === 'lvj_lit_lectura_dia') {
    return [
      'general' => 'General',
      'liturgia' => 'Liturgia',
      'espiritual' => 'Reflexion y multimedia',
    ];
  }

  if ($table === 'lvj_san_santo_dia') {
    return [
      'identidad' => 'Identidad',
      'camino' => 'Camino de santidad',
      'practica' => 'Para vivir hoy',
    ];
  }

  return [];
}

function content_field_section(string $table, string $field): string
{
  if ($table === 'lvj_capillas') {
    if (in_array($field, ['nombre', 'subtitulo', 'descripcion', 'pais', 'ciudad'], true)) {
      return 'identidad';
    }

    if (in_array($field, ['sitio_web', 'imagen_url', 'logo_url'], true)) {
      return 'recursos';
    }

    return 'estado';
  }

  if ($table === 'lvj_san_santo_dia') {
    $identityFields = [
      'mes',
      'dia',
      'nombre',
      'titulo',
      'quien_fue',
      'imagen_url',
      'frase_destacada',
      'destacado',
      'orden',
      'estado',
    ];

    $holinessFields = [
      'lucha_que_enfrento',
      'secreto_de_santidad',
      'ensenanza_para_hoy',
    ];

    $practiceFields = [
      'como_puedo_imitarlo',
      'paso_concreto',
      'oracion_intercesion',
    ];

    if (in_array($field, $identityFields, true)) {
      return 'identidad';
    }

    if (in_array($field, $holinessFields, true)) {
      return 'camino';
    }

    if (in_array($field, $practiceFields, true)) {
      return 'practica';
    }

    return 'identidad';
  }

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
    if (in_array($field, ['mes', 'dia'], true)) {
      $value = trim((string) ($source[$field] ?? ''));
      if ($value === '' && $isNullable) {
        return null;
      }

      $number = (int) $value;
      if ($field === 'mes') {
        return max(1, min(12, $number));
      }

      return max(1, min(31, $number));
    }

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
    'capilla_id' => ['table' => 'lvj_capillas', 'column' => 'id'],
    'capilla_activa_id' => ['table' => 'lvj_capillas', 'column' => 'id'],
    'stream_id' => ['table' => 'lvj_capilla_streams', 'column' => 'id'],
    'stream_activo_id' => ['table' => 'lvj_capilla_streams', 'column' => 'id'],
    'rol_id' => ['table' => 'lvj_adm_roles', 'column' => 'id'],
    'folder_id' => ['table' => 'lvj_file_folders', 'column' => 'id'],
    'user_id' => ['table' => 'lvj_file_users', 'column' => 'id'],
    'usuario_id' => ['table' => 'lvj_com_usuarios', 'column' => 'id'],
    'plan_id' => ['table' => 'lvj_bib_planes', 'column' => 'id'],
    'libro_id' => ['table' => 'lvj_bib_libros', 'column' => 'id'],
    'version_id' => ['table' => 'lvj_bib_versiones', 'column' => 'id'],
    'rosario_id' => ['table' => 'lvj_ora_rosarios', 'column' => 'id'],
    'novena_id' => ['table' => 'lvj_ora_novenas', 'column' => 'id'],
    'profile_id' => ['table' => 'lvj_ai_profiles', 'column' => 'id'],
    'prompt_version_id' => ['table' => 'lvj_ai_prompt_versions', 'column' => 'id'],
    'previous_prompt_version_id' => ['table' => 'lvj_ai_prompt_versions', 'column' => 'id'],
    'rule_id' => ['table' => 'lvj_ai_rules', 'column' => 'id'],
    'source_id' => ['table' => 'lvj_ai_knowledge_sources', 'column' => 'id'],
    'response_log_id' => ['table' => 'lvj_ai_response_logs', 'column' => 'id'],
    'test_run_id' => ['table' => 'lvj_ai_test_runs', 'column' => 'id'],
    'test_case_id' => ['table' => 'lvj_ai_test_cases', 'column' => 'id'],
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

function content_month_options(): array
{
  return [
    ['value' => '1', 'label' => 'Enero'],
    ['value' => '2', 'label' => 'Febrero'],
    ['value' => '3', 'label' => 'Marzo'],
    ['value' => '4', 'label' => 'Abril'],
    ['value' => '5', 'label' => 'Mayo'],
    ['value' => '6', 'label' => 'Junio'],
    ['value' => '7', 'label' => 'Julio'],
    ['value' => '8', 'label' => 'Agosto'],
    ['value' => '9', 'label' => 'Septiembre'],
    ['value' => '10', 'label' => 'Octubre'],
    ['value' => '11', 'label' => 'Noviembre'],
    ['value' => '12', 'label' => 'Diciembre'],
  ];
}

function content_day_options(): array
{
  $options = [];
  for ($day = 1; $day <= 31; $day++) {
    $options[] = ['value' => (string) $day, 'label' => (string) $day];
  }

  return $options;
}

function content_has_column(array $columns, string $field): bool
{
  foreach ($columns as $column) {
    if ((string) $column['Field'] === $field) {
      return true;
    }
  }

  return false;
}

function content_display_value($value): string
{
  $text = trim((string) $value);
  if (strlen($text) > 90) {
    return substr($text, 0, 87) . '...';
  }

  return $text;
}

function content_display_cell(string $table, string $field, $value): string
{
  if ($table === 'lvj_san_santo_dia' && $field === 'mes') {
    foreach (content_month_options() as $option) {
      if ((string) $value === (string) $option['value']) {
        return (string) $option['label'];
      }
    }
  }

  return content_display_value($value);
}

function content_status_label($value): array
{
  $raw = trim((string) $value);
  $normalized = strtolower($raw);

  if ($raw === '1' || in_array($normalized, ['activo', 'activa', 'publicado', 'active'], true)) {
    return ['Activo', 'active'];
  }

  if ($raw === '0' || in_array($normalized, ['inactivo', 'inactiva', 'desactivado', 'desactivada', 'inactive'], true)) {
    return ['Inactivo', 'inactive'];
  }

  if (in_array($normalized, ['borrador', 'draft'], true)) {
    return ['Borrador', 'draft'];
  }

  if (in_array($normalized, ['eliminado', 'deleted'], true)) {
    return ['Eliminado', 'inactive'];
  }

  return [$raw !== '' ? ucfirst($raw) : 'Sin estado', 'neutral'];
}

function content_cell_html(string $table, string $field, $value): string
{
  if (content_is_status_field($field)) {
    [$label, $state] = content_status_label($value);
    return '<span class="status-pill status-' . e($state) . '">' . e($label) . '</span>';
  }

  if (in_array($field, ['es_principal', 'es_respaldo'], true)) {
    $active = (int) $value === 1;
    return '<span class="status-pill status-' . ($active ? 'active' : 'neutral') . '">' . ($active ? 'Si' : 'No') . '</span>';
  }

  if (strpos($field, 'url') !== false || strpos($field, 'imagen') !== false || strpos($field, 'audio') !== false || strpos($field, 'video') !== false) {
    $text = trim((string) $value);
    if ($text === '') {
      return '<span class="muted">Sin recurso</span>';
    }

    return '<a class="resource-link" href="' . e($text) . '" target="_blank" rel="noopener">Ver recurso</a>';
  }

  return e(content_display_cell($table, $field, $value));
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
  if ($table === 'lvj_capillas' && $field === 'nombre') {
    $isRequired = true;
  }
  $required = $isRequired ? ' required' : '';
  $fieldClass = content_field_class($field, $type);

  if ($table === 'lvj_san_santo_dia' && $field === 'mes') {
    return content_select_html($field, $label, $value, content_month_options(), true, 'content-field relation-field');
  }

  if ($table === 'lvj_san_santo_dia' && $field === 'dia') {
    return content_select_html($field, $label, $value, content_day_options(), true, 'content-field relation-field');
  }

  if ($table === 'lvj_capillas' && $field === 'estado') {
    $activeValue = (strpos($type, 'tinyint') === 0 || strpos($type, 'int') !== false) ? '1' : 'activo';
    $inactiveValue = (strpos($type, 'tinyint') === 0 || strpos($type, 'int') !== false) ? '0' : 'inactivo';
    return content_select_html($field, $label, $value, [
      ['value' => $activeValue, 'label' => 'Activo'],
      ['value' => $inactiveValue, 'label' => 'Inactivo'],
    ], true, 'content-field status-field');
  }

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
      if ($table === 'lvj_capilla_config' && $field === 'capilla_activa_id') {
        array_unshift($options, ['value' => '', 'label' => 'Selecciona una capilla']);
        $selectAttrs = ' data-capilla-active-select';
      } elseif ($table === 'lvj_capilla_config' && $field === 'stream_activo_id') {
        array_unshift($options, ['value' => '', 'label' => 'Selecciona un stream']);
        $selectAttrs = ' data-stream-active-select';
      }
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

  $extraAttrs = $table === 'lvj_capillas' && $field === 'prioridad' ? ' min="0" step="1"' : '';

  return '<label class="' . e($fieldClass) . '">' . e($label) . '<input type="' . e($inputType) . '" name="' . e($field) . '" value="' . e((string) $value) . '"' . $required . $extraAttrs . ' placeholder="' . e($label) . '"></label>';
}

function content_status_active_value(array $columns)
{
  $map = content_column_map($columns);
  if (!isset($map['estado'])) {
    return null;
  }

  $type = strtolower((string) $map['estado']['Type']);
  return (strpos($type, 'tinyint') === 0 || strpos($type, 'int') !== false) ? 1 : 'activo';
}

function content_status_inactive_value(array $columns)
{
  $map = content_column_map($columns);
  if (!isset($map['estado'])) {
    return null;
  }

  $type = strtolower((string) $map['estado']['Type']);
  return (strpos($type, 'tinyint') === 0 || strpos($type, 'int') !== false) ? 0 : 'inactivo';
}

function content_is_active_status(array $columns, $value): bool
{
  $normalized = strtolower(trim((string) $value));
  return (string) $value === (string) content_status_active_value($columns)
    || in_array($normalized, ['1', 'activo', 'activa', 'active'], true);
}

function content_update_timestamp_clause(array $columns): string
{
  return content_has_column($columns, 'updated_at') ? ', updated_at = NOW()' : '';
}

function content_capilla_validate(array $columns, array &$data): string
{
  $map = content_column_map($columns);
  $name = trim((string) ($data['nombre'] ?? ''));
  if ($name === '') {
    return 'El nombre de la capilla es obligatorio.';
  }
  $data['nombre'] = $name;

  if (isset($map['prioridad'])) {
    $rawPriority = trim((string) ($_POST['prioridad'] ?? ''));
    if ($rawPriority === '') {
      $data['prioridad'] = 0;
    } elseif (!ctype_digit($rawPriority)) {
      return 'La prioridad debe ser numerica y no negativa.';
    } else {
      $data['prioridad'] = (int) $rawPriority;
    }
  }

  foreach (['sitio_web', 'imagen_url', 'logo_url'] as $field) {
    if (!isset($map[$field])) {
      continue;
    }

    $url = trim((string) ($data[$field] ?? ''));
    if ($url === '') {
      $data[$field] = strtoupper((string) ($map[$field]['Null'] ?? '')) === 'YES' ? null : '';
      continue;
    }

    if (!filter_var($url, FILTER_VALIDATE_URL) || !preg_match('/^https?:\/\//i', $url)) {
      return 'La URL de ' . content_label($field) . ' no es valida.';
    }
    $data[$field] = $url;
  }

  if (isset($map['estado']) && ($data['estado'] ?? '') === '') {
    $data['estado'] = content_status_active_value($columns);
  }

  if (isset($map['es_principal']) && isset($map['estado']) && !content_is_active_status($columns, $data['estado'] ?? null)) {
    $data['es_principal'] = 0;
  }

  return '';
}

function content_capilla_config_validate(PDO $pdo, array $columns, array $data): string
{
  $map = content_column_map($columns);
  $capillaId = (int) ($data['capilla_activa_id'] ?? 0);
  $streamId = (int) ($data['stream_activo_id'] ?? 0);

  if (isset($map['capilla_activa_id']) && $capillaId <= 0) {
    return 'Selecciona la capilla que deseas activar.';
  }

  if (isset($map['stream_activo_id']) && $streamId <= 0) {
    return 'Selecciona el stream activo de la capilla.';
  }

  if ($capillaId > 0) {
    $capilla = $pdo->prepare('SELECT id FROM lvj_capillas WHERE id = :id AND deleted_at IS NULL LIMIT 1');
    $capilla->execute(['id' => $capillaId]);
    if (!$capilla->fetchColumn()) {
      return 'La capilla seleccionada no existe o fue eliminada.';
    }
  }

  if ($streamId > 0) {
    $stream = $pdo->prepare('SELECT id FROM lvj_capilla_streams WHERE id = :stream_id AND capilla_id = :capilla_id AND deleted_at IS NULL LIMIT 1');
    $stream->execute([
      'stream_id' => $streamId,
      'capilla_id' => $capillaId,
    ]);
    if (!$stream->fetchColumn()) {
      return 'El stream seleccionado no pertenece a la capilla activa.';
    }
  }

  return '';
}

function content_save_capilla(PDO $pdo, array $columns, string $primaryColumn, int $id, array $data): int
{
  $isPrincipal = (int) ($data['es_principal'] ?? 0) === 1
    && content_is_active_status($columns, $data['estado'] ?? null);
  $pdo->beginTransaction();

  try {
    if ($isPrincipal) {
      $stmt = $pdo->prepare("UPDATE lvj_capillas SET es_principal = 0" . content_update_timestamp_clause($columns) . " WHERE {$primaryColumn} <> :id AND deleted_at IS NULL");
      $stmt->execute(['id' => $id]);
    }

    if ($id > 0) {
      $set = [];
      foreach ($data as $field => $value) {
        $set[] = "{$field} = :{$field}";
      }
      if (content_has_column($columns, 'updated_at')) {
        $set[] = 'updated_at = NOW()';
      }
      $data['id'] = $id;
      $stmt = $pdo->prepare("UPDATE lvj_capillas SET " . implode(', ', $set) . " WHERE {$primaryColumn} = :id AND deleted_at IS NULL LIMIT 1");
      $stmt->execute($data);
      $savedId = $id;
    } else {
      $fields = array_keys($data);
      $placeholders = array_map(function ($field) {
        return ':' . $field;
      }, $fields);
      $stmt = $pdo->prepare("INSERT INTO lvj_capillas (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")");
      $stmt->execute($data);
      $savedId = (int) $pdo->lastInsertId();
    }

    if ($isPrincipal && $id <= 0) {
      $stmt = $pdo->prepare("UPDATE lvj_capillas SET es_principal = 0" . content_update_timestamp_clause($columns) . " WHERE {$primaryColumn} <> :id AND deleted_at IS NULL");
      $stmt->execute(['id' => $savedId]);
    }

    $pdo->commit();
    return $savedId;
  } catch (Throwable $error) {
    if ($pdo->inTransaction()) {
      $pdo->rollBack();
    }
    throw $error;
  }
}

function content_inactive_filter(array $columns, string $table = ''): string
{
  $map = content_column_map($columns);

  if ($table === 'lvj_capillas' && isset($map['deleted_at'])) {
    return 'deleted_at IS NULL';
  }

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

  if ($table === 'lvj_capillas' && isset($map['deleted_at'])) {
    return $pdo->prepare("UPDATE {$table} SET deleted_at = NOW()" . content_update_timestamp_clause($columns) . " WHERE {$primaryColumn} = :id AND deleted_at IS NULL LIMIT 1");
  }

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

if ($moduleKey === 'inteligencia-artificial') {
  require_technical_admin();
}

$module = $modules[$moduleKey];
$table = (string) ($_GET['table'] ?? array_key_first($module['tables']));
if (!isset($module['tables'][$table]) || !content_table_allowed($modules, $table)) {
  $table = (string) array_key_first($module['tables']);
}
$readOnly = in_array($table, [
  'lvj_capilla_logs',
  'lvj_ai_source_files',
  'lvj_ai_test_runs',
  'lvj_ai_test_results',
  'lvj_ai_response_logs',
  'lvj_ai_deployments',
  'lvj_ai_audit_logs',
], true);

$columns = content_columns($pdo, $table);
$editableColumns = content_order_columns_for_form(content_editable_columns($columns, $table), $table);
$listColumns = content_list_columns($columns, $table);
$formSections = content_form_sections($table);
$firstFormSection = $formSections ? (string) array_key_first($formSections) : '';
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
  } elseif ($readOnly) {
    $error = 'Esta sección es únicamente de consulta.';
  } elseif (!$columns) {
    $error = 'La tabla seleccionada no existe o no esta disponible.';
  } elseif ($table === 'lvj_capillas' && in_array($action, ['set_status', 'set_principal', 'set_active', 'toggle_respaldo'], true)) {
    $id = (int) ($_POST['id'] ?? 0);
    if ($id <= 0) {
      $error = 'ID de capilla no valido.';
    } else {
      try {
        if ($action === 'set_active') {
          $pdo->beginTransaction();

          $stream = $pdo->prepare("
            SELECT id
            FROM lvj_capilla_streams
            WHERE capilla_id = :capilla_id
              AND deleted_at IS NULL
              AND LOWER(COALESCE(CAST(estado AS CHAR), '')) IN ('', '1', 'activo', 'activa', 'publicado')
            ORDER BY es_principal DESC, prioridad ASC, id ASC
            LIMIT 1
          ");
          $stream->execute(['capilla_id' => $id]);
          $streamId = (int) $stream->fetchColumn();
          if ($streamId <= 0) {
            throw new RuntimeException('La capilla necesita al menos un stream activo.');
          }

          $configId = (int) $pdo->query('SELECT id FROM lvj_capilla_config ORDER BY updated_at DESC, id DESC LIMIT 1 FOR UPDATE')->fetchColumn();
          if ($configId <= 0) {
            throw new RuntimeException('No existe la configuración base de la capilla.');
          }

          $activateCapilla = $pdo->prepare("UPDATE lvj_capillas SET estado = :estado" . content_update_timestamp_clause($columns) . " WHERE {$primaryColumn} = :id AND deleted_at IS NULL LIMIT 1");
          $activateCapilla->execute([
            'estado' => content_status_active_value($columns),
            'id' => $id,
          ]);

          $activateConfig = $pdo->prepare("
            UPDATE lvj_capilla_config
            SET capilla_activa_id = :capilla_id,
                stream_activo_id = :stream_id,
                updated_at = NOW()
            WHERE id = :config_id
            LIMIT 1
          ");
          $activateConfig->execute([
            'capilla_id' => $id,
            'stream_id' => $streamId,
            'config_id' => $configId,
          ]);

          $pdo->commit();
          log_activity('activate', $table, $id, 'Capilla activada en la aplicación');
          header('Location: content.php?module=' . urlencode($moduleKey) . '&table=' . urlencode($table) . '&saved=activated');
          exit;
        }

        if ($action === 'set_status') {
          $newStatus = (string) ($_POST['estado'] ?? '');
          $allowedStatuses = [
            (string) content_status_active_value($columns),
            (string) content_status_inactive_value($columns),
          ];
          if (!in_array($newStatus, $allowedStatuses, true)) {
            throw new RuntimeException('Estado no valido.');
          }

          $principalClause = $newStatus === (string) content_status_inactive_value($columns) ? ', es_principal = 0' : '';
          $stmt = $pdo->prepare("UPDATE {$table} SET estado = :estado{$principalClause}" . content_update_timestamp_clause($columns) . " WHERE {$primaryColumn} = :id AND deleted_at IS NULL LIMIT 1");
          $stmt->execute(['estado' => $newStatus, 'id' => $id]);
          log_activity('status', $table, $id, 'Estado de capilla actualizado');
          header('Location: content.php?module=' . urlencode($moduleKey) . '&table=' . urlencode($table) . '&saved=updated');
          exit;
        }

        if ($action === 'set_principal') {
          $pdo->beginTransaction();
          $stmt = $pdo->prepare("UPDATE {$table} SET es_principal = 0" . content_update_timestamp_clause($columns) . " WHERE deleted_at IS NULL");
          $stmt->execute();
          $stmt = $pdo->prepare("UPDATE {$table} SET es_principal = 1, estado = :estado" . content_update_timestamp_clause($columns) . " WHERE {$primaryColumn} = :id AND deleted_at IS NULL LIMIT 1");
          $stmt->execute(['estado' => content_status_active_value($columns), 'id' => $id]);
          $pdo->commit();
          log_activity('principal', $table, $id, 'Capilla marcada como principal');
          header('Location: content.php?module=' . urlencode($moduleKey) . '&table=' . urlencode($table) . '&saved=updated');
          exit;
        }

        $newValue = (int) ($_POST['es_respaldo'] ?? 0) === 1 ? 1 : 0;
        $stmt = $pdo->prepare("UPDATE {$table} SET es_respaldo = :es_respaldo" . content_update_timestamp_clause($columns) . " WHERE {$primaryColumn} = :id AND deleted_at IS NULL LIMIT 1");
        $stmt->execute(['es_respaldo' => $newValue, 'id' => $id]);
        log_activity('backup', $table, $id, 'Marca de respaldo actualizada');
        header('Location: content.php?module=' . urlencode($moduleKey) . '&table=' . urlencode($table) . '&saved=updated');
        exit;
      } catch (Throwable $actionError) {
        if ($pdo->inTransaction()) {
          $pdo->rollBack();
        }
        $safeActionErrors = [
          'La capilla necesita al menos un stream activo.',
          'No existe la configuración base de la capilla.',
        ];
        $error = in_array($actionError->getMessage(), $safeActionErrors, true)
          ? $actionError->getMessage()
          : 'No se pudo actualizar la capilla. Revisa los datos e intenta nuevamente.';
      }
    }
  } elseif ($action === 'save') {
    $id = (int) ($_POST['id'] ?? 0);
    $data = [];

    foreach ($editableColumns as $column) {
      $field = (string) $column['Field'];
      $data[$field] = content_normalize_value($column, $_POST);
    }

    if ($table === 'lvj_san_santo_dia' && content_has_column($columns, 'nombre')) {
      $saintName = trim((string) ($data['nombre'] ?? ''));
      if ($saintName !== '') {
        $duplicateSql = "SELECT {$primaryColumn} FROM {$table} WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(:nombre))";
        $duplicateParams = ['nombre' => $saintName];
        if ($id > 0) {
          $duplicateSql .= " AND {$primaryColumn} <> :id";
          $duplicateParams['id'] = $id;
        }
        $duplicateSql .= ' LIMIT 1';
        $duplicateStmt = $pdo->prepare($duplicateSql);
        $duplicateStmt->execute($duplicateParams);
        if ($duplicateStmt->fetchColumn()) {
          $error = 'Ya existe un santo registrado con ese nombre.';
        }
      }
    }

    if (!$error && $table === 'lvj_capillas') {
      $error = content_capilla_validate($columns, $data);
    }

    if (!$error && $table === 'lvj_capilla_config') {
      $error = content_capilla_config_validate($pdo, $columns, $data);
    }

    if (!$error && $table === 'lvj_san_santo_dia' && content_has_column($columns, 'fecha') && $id <= 0) {
      $data['fecha'] = date('Y-m-d');
    }

    try {
      if ($error) {
        throw new RuntimeException($error);
      }

      if ($table === 'lvj_capillas') {
        $savedId = content_save_capilla($pdo, $columns, $primaryColumn, $id, $data);
        log_activity($id > 0 ? 'update' : 'create', $table, $savedId, $id > 0 ? 'Capilla actualizada' : 'Capilla creada');
        header('Location: content.php?module=' . urlencode($moduleKey) . '&table=' . urlencode($table) . '&saved=' . ($id > 0 ? 'updated' : 'created'));
        exit;
      } elseif ($id > 0) {
        $set = [];
        foreach ($data as $field => $value) {
          $set[] = "{$field} = :{$field}";
        }
        $data['id'] = $id;
        $stmt = $pdo->prepare("UPDATE {$table} SET " . implode(', ', $set) . " WHERE {$primaryColumn} = :id LIMIT 1");
        $stmt->execute($data);
        log_activity('update', $table, $id, 'Registro actualizado');
        header('Location: content.php?module=' . urlencode($moduleKey) . '&table=' . urlencode($table) . '&saved=updated');
        exit;
      } else {
        $fields = array_keys($data);
        $placeholders = array_map(function ($field) {
          return ':' . $field;
        }, $fields);
        $stmt = $pdo->prepare("INSERT INTO {$table} (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")");
        $stmt->execute($data);
        log_activity('create', $table, (int) $pdo->lastInsertId(), 'Registro creado');
        header('Location: content.php?module=' . urlencode($moduleKey) . '&table=' . urlencode($table) . '&saved=created');
        exit;
      }
    } catch (Throwable $saveError) {
      if (in_array($table, ['lvj_capillas', 'lvj_capilla_config'], true)) {
        $error = $error ?: 'No se pudo guardar la capilla. Revisa los datos e intenta nuevamente.';
      } else {
        $error = $error ?: 'No se pudo guardar: ' . $saveError->getMessage();
      }
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
if (isset($_GET['saved'])) {
  $message = $_GET['saved'] === 'activated'
    ? 'La capilla y su stream principal están activos en la aplicación.'
    : ($_GET['saved'] === 'updated' ? 'Registro actualizado.' : 'Registro creado.');
}

if ($editId > 0 && $columns) {
  try {
    $editWhere = "{$primaryColumn} = :id";
    if ($table === 'lvj_capillas' && content_has_column($columns, 'deleted_at')) {
      $editWhere .= ' AND deleted_at IS NULL';
    }
    $stmt = $pdo->prepare("SELECT * FROM {$table} WHERE {$editWhere} LIMIT 1");
    $stmt->execute(['id' => $editId]);
    $editRow = $stmt->fetch() ?: [];
    if ($table === 'lvj_san_santo_dia' && $editRow && !empty($editRow['fecha']) && preg_match('/^2000-\d{2}-\d{2}$/', (string) $editRow['fecha'])) {
      $timestamp = strtotime((string) $editRow['fecha']);
      if ($timestamp) {
        if (empty($editRow['mes'])) {
          $editRow['mes'] = (string) (int) date('n', $timestamp);
        }
        if (empty($editRow['dia'])) {
          $editRow['dia'] = (string) (int) date('j', $timestamp);
        }
      }
    }
  } catch (Throwable $editError) {
    $editRow = [];
  }
}

$formMode = (string) ($_GET['action'] ?? '');
$showForm = !$readOnly && ($formMode === 'new' || ($editId > 0 && $editRow));
$search = trim((string) ($_GET['q'] ?? ''));
$page = max(1, (int) ($_GET['page'] ?? 1));
$perPage = 20;
$totalRows = 0;
$totalPages = 1;
$searchPlaceholder = $moduleKey === 'liturgia' ? 'Buscar por fecha, tema, santo...' : 'Buscar registros...';
if ($table === 'lvj_capillas') {
  $searchPlaceholder = 'Buscar por nombre, ciudad o pais...';
}

try {
  $whereParts = [];
  $params = [];
  $where = $columns ? content_inactive_filter($columns, $table) : '';
  if ($where) {
    $whereParts[] = $where;
  }

  if ($search !== '' && $listColumns) {
    $searchParts = [];
    foreach (content_search_columns($columns, $table) as $index => $column) {
      $field = (string) $column['Field'];
      $type = strtolower((string) $column['Type']);
      if (!preg_match('/^[a-zA-Z0-9_]+$/', $field)) {
        continue;
      }
      if (strpos($type, 'char') !== false || strpos($type, 'text') !== false || strpos($type, 'date') !== false) {
        $key = 'q' . $index;
        $searchParts[] = "{$field} LIKE :{$key}";
        $params[$key] = '%' . $search . '%';
      }
    }

    if ($searchParts) {
      $whereParts[] = '(' . implode(' OR ', $searchParts) . ')';
    }
  }

  $whereSql = $whereParts ? ' WHERE ' . implode(' AND ', $whereParts) : '';
  if ($columns) {
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM {$table}{$whereSql}");
    $countStmt->execute($params);
    $totalRows = (int) $countStmt->fetchColumn();
    $totalPages = max(1, (int) ceil($totalRows / $perPage));
    $page = min($page, $totalPages);
    $offset = ($page - 1) * $perPage;
    $orderSql = $table === 'lvj_capillas' && content_has_column($columns, 'prioridad')
      ? " ORDER BY prioridad ASC, {$primaryColumn} DESC"
      : " ORDER BY {$primaryColumn} DESC";
    $stmt = $pdo->prepare("SELECT * FROM {$table}{$whereSql}{$orderSql} LIMIT {$perPage} OFFSET {$offset}");
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
  } else {
    $rows = [];
  }
} catch (Throwable $listError) {
  $rows = [];
  $error = $error ?: 'No se pudieron cargar registros: ' . $listError->getMessage();
}

$shownFrom = $totalRows > 0 ? (($page - 1) * $perPage) + 1 : 0;
$shownTo = $totalRows > 0 ? min($totalRows, $page * $perPage) : 0;
$visibleListColumns = $table === 'lvj_capillas' ? $listColumns : array_slice($listColumns, 0, 6);

$pageTitle = $module['title'];
$pageSubtitle = $module['subtitle'];
require __DIR__ . '/includes/header.php';
?>

<?php $moduleTabs = $module['tabs'] ?? null; ?>
<?php if (($moduleTabs && count($moduleTabs) > 1) || (!$moduleTabs && count($module['tables']) > 1)): ?>
  <nav class="content-toolbar" aria-label="Secciones de <?php echo e($module['title']); ?>">
    <div class="content-tabs">
      <?php if ($moduleTabs): ?>
        <?php foreach ($moduleTabs as $tab): ?>
          <?php
            $tabTable = (string) ($tab['table'] ?? '');
            $tabHref = (string) ($tab['href'] ?? ('content.php?module=' . $moduleKey . '&table=' . $tabTable));
            $tabActive = $tabTable !== '' && $tabTable === $table;
          ?>
          <a class="<?php echo $tabActive ? 'active' : ''; ?>" href="<?php echo e($tabHref); ?>" <?php echo $tabActive ? 'aria-current="page"' : ''; ?>><?php echo e($tab['label']); ?></a>
        <?php endforeach; ?>
      <?php else: ?>
        <?php foreach ($module['tables'] as $tableName => $label): ?>
          <a class="<?php echo $tableName === $table ? 'active' : ''; ?>" href="content.php?module=<?php echo e($moduleKey); ?>&table=<?php echo e($tableName); ?>" <?php echo $tableName === $table ? 'aria-current="page"' : ''; ?>><?php echo e($label); ?></a>
        <?php endforeach; ?>
      <?php endif; ?>
    </div>
  </nav>
<?php endif; ?>

<section class="panel content-overview-panel">
  <div class="content-overview">
    <div>
      <h2><?php echo e($module['tables'][$table]); ?></h2>
      <p class="muted">Gestiona el contenido que luego consumira la app. La vista principal muestra registros; los formularios se abren solo para crear o editar.</p>
    </div>
    <div class="content-actions-bar">
      <?php if ($columns && !$readOnly): ?>
        <a class="btn btn-gold add-record-button" href="content.php?module=<?php echo e($moduleKey); ?>&table=<?php echo e($table); ?>&action=new"><span>+</span> Agregar registro</a>
      <?php endif; ?>
    </div>
  </div>

  <?php if ($message): ?><div class="alert alert-success"><?php echo e($message); ?></div><?php endif; ?>
  <?php if ($error): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>
  <?php if (!$columns): ?><p class="muted">Esta tabla aun no esta disponible en la base de datos.</p><?php endif; ?>
</section>

<?php if ($showForm && $columns): ?>
  <section class="panel content-editor-panel">
    <div class="panel-header">
      <div>
        <h2><?php echo $editRow ? 'Editar registro' : 'Agregar registro'; ?></h2>
        <p class="muted"><?php echo e($module['tables'][$table]); ?></p>
      </div>
      <a class="btn btn-soft" href="content.php?module=<?php echo e($moduleKey); ?>&table=<?php echo e($table); ?>">Volver al listado</a>
    </div>

    <form method="post" class="content-form">
      <?php echo csrf_field(); ?>
      <input type="hidden" name="action" value="save">
      <input type="hidden" name="table" value="<?php echo e($table); ?>">
      <input type="hidden" name="id" value="<?php echo (int) ($editRow['id'] ?? 0); ?>">

      <?php if ($formSections): ?>
        <div class="content-step-tabs" data-content-section-tabs>
          <?php foreach ($formSections as $sectionKey => $sectionLabel): ?>
            <button type="button" class="<?php echo $sectionKey === $firstFormSection ? 'active' : ''; ?>" data-content-section-tab="<?php echo e($sectionKey); ?>">
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
            <div class="content-section-shell" data-content-section="<?php echo e($section); ?>" <?php echo $section !== $firstFormSection ? 'hidden' : ''; ?>>
              <?php echo content_field_html($pdo, $table, $column, $editRow); ?>
            </div>
          <?php else: ?>
            <?php echo content_field_html($pdo, $table, $column, $editRow); ?>
          <?php endif; ?>
        <?php endforeach; ?>
      </div>

      <div class="form-actions">
        <button class="btn btn-gold" type="submit"><?php echo $editRow ? 'Actualizar registro' : 'Crear registro'; ?></button>
        <a class="btn btn-soft" href="content.php?module=<?php echo e($moduleKey); ?>&table=<?php echo e($table); ?>">Cancelar</a>
      </div>
    </form>
  </section>
<?php endif; ?>

<?php if ($moduleKey === 'liturgia'): ?>
  <section class="panel import-panel">
    <h2>Importador asistido</h2>
    <p class="muted">Preparado para pegar una URL o texto largo y distribuirlo luego en lecturas, salmo, evangelio y reflexion. Por ahora no guarda automaticamente para evitar errores de contenido.</p>
    <textarea rows="5" placeholder="Pega aqui el texto de la liturgia para revisarlo antes de guardarlo..."></textarea>
  </section>
<?php endif; ?>

<section class="panel content-records-panel content-grid-card">
  <div class="panel-header content-list-header">
    <div>
      <h2>Registros</h2>
      <p class="muted">Consulta, filtra y administra los registros existentes antes de abrir un formulario.</p>
    </div>
    <div class="content-list-tools">
      <form method="get" class="content-filter-form">
        <input type="hidden" name="module" value="<?php echo e($moduleKey); ?>">
        <input type="hidden" name="table" value="<?php echo e($table); ?>">
        <input type="search" name="q" value="<?php echo e($search); ?>" placeholder="<?php echo e($searchPlaceholder); ?>">
        <button class="btn btn-soft" type="submit">Buscar</button>
        <?php if ($search !== ''): ?>
          <a class="btn btn-soft" href="content.php?module=<?php echo e($moduleKey); ?>&table=<?php echo e($table); ?>">Limpiar</a>
        <?php endif; ?>
      </form>
      <span class="badge records-badge"><?php echo (int) $totalRows; ?> registros</span>
    </div>
  </div>

  <div class="table-wrap">
    <table class="admin-grid-table">
      <thead>
        <tr>
          <?php foreach ($visibleListColumns as $column): ?>
            <th><?php echo e(content_label((string) $column['Field'])); ?></th>
          <?php endforeach; ?>
          <?php if (!$readOnly): ?><th>Acciones</th><?php endif; ?>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($rows as $row): ?>
          <tr>
            <?php foreach ($visibleListColumns as $column): ?>
              <?php $field = (string) $column['Field']; ?>
              <td><?php echo content_cell_html($table, $field, $row[$field] ?? ''); ?></td>
            <?php endforeach; ?>
            <?php if (!$readOnly): ?><td class="actions grid-actions">
              <a class="action-button action-edit" title="Editar registro" href="content.php?module=<?php echo e($moduleKey); ?>&table=<?php echo e($table); ?>&edit=<?php echo (int) $row['id']; ?>">Editar</a>
              <?php if ($table === 'lvj_capillas'): ?>
                <?php
                  $isActiveCapilla = content_is_active_status($columns, $row['estado'] ?? null);
                  $nextStatus = $isActiveCapilla ? content_status_inactive_value($columns) : content_status_active_value($columns);
                  $isBackup = (int) ($row['es_respaldo'] ?? 0) === 1;
                  $isPrincipal = (int) ($row['es_principal'] ?? 0) === 1;
                ?>
                <form method="post">
                  <?php echo csrf_field(); ?>
                  <input type="hidden" name="action" value="set_status">
                  <input type="hidden" name="table" value="<?php echo e($table); ?>">
                  <input type="hidden" name="id" value="<?php echo (int) $row['id']; ?>">
                  <input type="hidden" name="estado" value="<?php echo e((string) $nextStatus); ?>">
                  <button class="action-button action-edit" type="submit" title="<?php echo $isActiveCapilla ? 'Inactivar capilla' : 'Activar capilla'; ?>"><?php echo $isActiveCapilla ? 'Inactivar' : 'Activar'; ?></button>
                </form>
                <form method="post" onsubmit="return confirm('¿Activar esta capilla y su stream principal en la aplicación?');">
                  <?php echo csrf_field(); ?>
                  <input type="hidden" name="action" value="set_active">
                  <input type="hidden" name="table" value="<?php echo e($table); ?>">
                  <input type="hidden" name="id" value="<?php echo (int) $row['id']; ?>">
                  <button class="action-button action-edit" type="submit" title="Seleccionar como capilla activa">Activar en la app</button>
                </form>
                <?php if (!$isPrincipal): ?>
                  <form method="post" onsubmit="return confirm('Marcar esta capilla como principal? Se desmarcara la principal anterior.');">
                    <?php echo csrf_field(); ?>
                    <input type="hidden" name="action" value="set_principal">
                    <input type="hidden" name="table" value="<?php echo e($table); ?>">
                    <input type="hidden" name="id" value="<?php echo (int) $row['id']; ?>">
                    <button class="action-button action-edit" type="submit" title="Marcar como principal">Principal</button>
                  </form>
                <?php endif; ?>
                <form method="post">
                  <?php echo csrf_field(); ?>
                  <input type="hidden" name="action" value="toggle_respaldo">
                  <input type="hidden" name="table" value="<?php echo e($table); ?>">
                  <input type="hidden" name="id" value="<?php echo (int) $row['id']; ?>">
                  <input type="hidden" name="es_respaldo" value="<?php echo $isBackup ? 0 : 1; ?>">
                  <button class="action-button action-edit" type="submit" title="<?php echo $isBackup ? 'Quitar respaldo' : 'Marcar respaldo'; ?>"><?php echo $isBackup ? 'Quitar respaldo' : 'Respaldo'; ?></button>
                </form>
              <?php endif; ?>
              <form method="post" onsubmit="return confirm('Eliminar o desactivar este registro?');">
                <?php echo csrf_field(); ?>
                <input type="hidden" name="action" value="delete">
                <input type="hidden" name="table" value="<?php echo e($table); ?>">
                <input type="hidden" name="id" value="<?php echo (int) $row['id']; ?>">
                <button class="action-button action-delete danger-action" type="submit" title="Eliminar registro">Eliminar</button>
              </form>
            </td><?php endif; ?>
          </tr>
        <?php endforeach; ?>
        <?php if (!$rows): ?>
          <tr><td colspan="<?php echo count($visibleListColumns) + ($readOnly ? 0 : 1); ?>" class="muted"><?php echo $search !== '' ? 'No hay registros que coincidan con la busqueda.' : 'No hay registros cargados.'; ?></td></tr>
        <?php endif; ?>
      </tbody>
    </table>
  </div>

  <div class="records-footer">
    <p>Mostrando <?php echo (int) $shownFrom; ?> a <?php echo (int) $shownTo; ?> de <?php echo (int) $totalRows; ?> registros</p>
    <?php if ($totalPages > 1): ?>
      <nav class="pagination" aria-label="Paginacion de registros">
        <?php
          $paginationBase = ['module' => $moduleKey, 'table' => $table];
          if ($search !== '') {
            $paginationBase['q'] = $search;
          }
        ?>
        <?php if ($page > 1): ?>
          <a href="content.php?<?php echo e(http_build_query($paginationBase + ['page' => $page - 1])); ?>">Anterior</a>
        <?php endif; ?>
        <?php
          $startPage = max(1, $page - 2);
          $endPage = min($totalPages, $page + 2);
        ?>
        <?php for ($pageItem = $startPage; $pageItem <= $endPage; $pageItem++): ?>
          <?php if ($pageItem === $page): ?>
            <span class="active"><?php echo (int) $pageItem; ?></span>
          <?php else: ?>
            <a href="content.php?<?php echo e(http_build_query($paginationBase + ['page' => $pageItem])); ?>"><?php echo (int) $pageItem; ?></a>
          <?php endif; ?>
        <?php endfor; ?>
        <?php if ($page < $totalPages): ?>
          <a href="content.php?<?php echo e(http_build_query($paginationBase + ['page' => $page + 1])); ?>">Siguiente</a>
        <?php endif; ?>
      </nav>
    <?php endif; ?>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>

<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/biblia-bblx.php';
require_once __DIR__ . '/includes/biblia-scio-import.php';
require_login();

$pdo = lvj_files_db();
$root = dirname(__DIR__);
$bibleStorageRoot = $root . '/storage/biblia';
$availableVersions = [];
foreach (glob($bibleStorageRoot . '/*', GLOB_ONLYDIR) ?: [] as $directory) {
  $slug = basename($directory);
  if (preg_match('/^[a-z0-9][a-z0-9_-]*$/', $slug)) {
    $availableVersions[$slug] = ucwords(str_replace(['-', '_'], ' ', $slug));
  }
}
if (!$availableVersions) {
  $availableVersions['spaplatense'] = 'Biblia Platense / Straubinger';
}
$selectedVersion = strtolower((string) ($_GET['version'] ?? 'spaplatense'));
if (!isset($availableVersions[$selectedVersion])) {
  $selectedVersion = (string) array_key_first($availableVersions);
}
$sourceRoot = $bibleStorageRoot . '/' . $selectedVersion;
$versionDefaults = [
  'scio' => [
    'nombre' => 'Biblia de Felipe Scío de San Miguel',
    'codigo' => 'SCIO',
    'abreviatura' => 'Scío',
    'idioma' => 'es',
    'traductor' => 'Felipe Scío de San Miguel',
    'anio' => '1797',
    'licencia' => 'Dominio público',
    'versificacion' => 'Vulgata',
    'canon' => '73',
  ],
  'spaplatense' => [
    'nombre' => 'Biblia Platense / Straubinger',
    'codigo' => 'SPAPLATENSE',
    'abreviatura' => 'SpaPlatense',
    'idioma' => 'es',
    'traductor' => 'Mons. Juan Straubinger',
    'anio' => '1948',
    'licencia' => 'Dominio público',
    'versificacion' => 'Vulgata',
    'canon' => '73',
  ],
];
$versionMeta = $versionDefaults[$selectedVersion] ?? [
  'nombre' => $availableVersions[$selectedVersion], 'codigo' => strtoupper($selectedVersion),
  'abreviatura' => $availableVersions[$selectedVersion], 'idioma' => 'es',
  'traductor' => '', 'anio' => '', 'licencia' => '', 'versificacion' => 'Católica', 'canon' => '73',
];
$requiredFiles = $selectedVersion === 'scio' ? [
  'Libros canonicos' => $sourceRoot . '/procesado/libros.json',
  'Versiculos canonicos' => $sourceRoot . '/procesado/versiculos.json',
  'Reporte de validacion' => $sourceRoot . '/procesado/reporte-validacion.json',
  'Manifiesto de integridad' => $sourceRoot . '/procesado/manifiesto.json',
] : [
  'SWORD: configuración' => $sourceRoot . '/fuente/sword/spaplatense.conf',
  'SWORD: Antiguo Testamento (bzs)' => $sourceRoot . '/fuente/sword/ot.bzs',
  'SWORD: Antiguo Testamento (bzv)' => $sourceRoot . '/fuente/sword/ot.bzv',
  'SWORD: Antiguo Testamento (bzz)' => $sourceRoot . '/fuente/sword/ot.bzz',
  'SWORD: Nuevo Testamento (bzs)' => $sourceRoot . '/fuente/sword/nt.bzs',
  'SWORD: Nuevo Testamento (bzv)' => $sourceRoot . '/fuente/sword/nt.bzv',
  'SWORD: Nuevo Testamento (bzz)' => $sourceRoot . '/fuente/sword/nt.bzz',
  'JSON: lectura limpia' => $sourceRoot . '/fuente/json/SpaPlatense.json',
  'JSON: estudio OSIS' => $sourceRoot . '/fuente/json/SpaPlatense-osis.json',
  'JSON: documentación' => $sourceRoot . '/fuente/json/README.md',
];
$processedFiles = $selectedVersion === 'scio' ? [
  'Libros' => $sourceRoot . '/procesado/libros.json',
  'Versiculos' => $sourceRoot . '/procesado/versiculos.json',
  'Reporte' => $sourceRoot . '/procesado/reporte-validacion.json',
  'Manifiesto' => $sourceRoot . '/procesado/manifiesto.json',
] : [
  'Libros' => $sourceRoot . '/procesado/libros.json',
  'Versículos' => $sourceRoot . '/procesado/versiculos.json',
  'Notas' => $sourceRoot . '/procesado/notas.json',
  'Secciones' => $sourceRoot . '/procesado/secciones.json',
  'Reporte' => $sourceRoot . '/procesado/reporte-importacion.json',
  'Manifiesto' => $sourceRoot . '/procesado/manifiesto.json',
];
$requiredTables = [
  'lvj_bib_versiones',
  'lvj_bib_libros',
  'lvj_bib_versiculos',
  'lvj_bib_notas_versiones',
  'lvj_bib_paquetes_offline',
];

function bib_import_file_status(array $files, string $root): array
{
  $rows = [];
  foreach ($files as $label => $path) {
    $exists = is_file($path);
    $rows[] = [
      'label' => $label,
      'path' => ltrim(str_replace($root, '', $path), '/'),
      'exists' => $exists,
      'size' => $exists ? filesize($path) : 0,
      'hash' => $exists ? hash_file('sha256', $path) : '',
    ];
  }
  return $rows;
}

function bib_import_table_status(PDO $pdo, array $tables): array
{
  $result = [];
  foreach ($tables as $table) {
    try {
      $columns = $pdo->query("SHOW COLUMNS FROM `{$table}`")->fetchAll();
      $count = (int) $pdo->query("SELECT COUNT(*) FROM `{$table}`")->fetchColumn();
      $result[$table] = ['exists' => true, 'columns' => $columns, 'count' => $count];
    } catch (Throwable $error) {
      $result[$table] = ['exists' => false, 'columns' => [], 'count' => 0];
    }
  }
  return $result;
}

function bib_import_json_count(string $path): ?int
{
  if (!is_file($path)) return null;
  $data = json_decode((string) file_get_contents($path), true);
  return is_array($data) ? count($data) : null;
}

function bib_import_read_json(string $path): array
{
  if (!is_file($path)) throw new RuntimeException('Falta el archivo procesado: ' . basename($path));
  $data = json_decode((string) file_get_contents($path), true);
  if (!is_array($data)) throw new RuntimeException('JSON procesado inválido: ' . basename($path));
  return $data;
}

function bib_import_insert_batches(PDO $pdo, string $table, array $columns, array $rows, int $batchSize = 250): int
{
  $total = 0;
  foreach (array_chunk($rows, $batchSize) as $batch) {
    $params = [];
    $groups = [];
    foreach ($batch as $row) {
      $placeholders = [];
      foreach ($columns as $column) {
        $placeholders[] = '?';
        $params[] = $row[$column] ?? null;
      }
      $groups[] = '(' . implode(',', $placeholders) . ')';
    }
    $sql = "INSERT INTO `{$table}` (`" . implode('`,`', $columns) . '`) VALUES ' . implode(',', $groups);
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $total += count($batch);
  }
  return $total;
}

function bib_import_spaplatense(PDO $pdo, array $files, array $meta): array
{
  @set_time_limit(0);
  @ini_set('memory_limit', '512M');
  $libros = bib_import_read_json($files['Libros']);
  if (count($libros) !== 73) {
    throw new RuntimeException('Los conteos procesados no son válidos para iniciar la importación.');
  }

  $existing = $pdo->prepare('SELECT id FROM lvj_bib_versiones WHERE codigo = :codigo AND deleted_at IS NULL LIMIT 1');
  $existing->execute(['codigo' => $meta['codigo']]);
  if ($existing->fetchColumn()) {
    throw new RuntimeException('La versión ' . $meta['codigo'] . ' ya existe. No se importó para evitar duplicados.');
  }

  $pdo->beginTransaction();
  try {
    $version = $pdo->prepare("INSERT INTO lvj_bib_versiones
      (nombre, abreviatura, codigo, idioma, fuente, licencia, fuente_url, copyright_notas, canon, versificacion, estado, created_at, updated_at)
      VALUES (:nombre, :abreviatura, :codigo, :idioma, :fuente, :licencia, :fuente_url, :copyright_notas, :canon, :versificacion, 1, NOW(), NOW())");
    $version->execute([
      'nombre' => $meta['nombre'], 'abreviatura' => $meta['abreviatura'], 'codigo' => $meta['codigo'],
      'idioma' => $meta['idioma'], 'fuente' => 'SpaPlatense SWORD / OSIS', 'licencia' => $meta['licencia'],
      'fuente_url' => 'https://gitlab.com/crosswire-bible-society/esplatense',
      'copyright_notas' => 'Fuente declarada de dominio público. Publicación original: 1948.',
      'canon' => (int) $meta['canon'], 'versificacion' => $meta['versificacion'],
    ]);
    $versionId = (int) $pdo->lastInsertId();

    $bookStatement = $pdo->prepare("INSERT INTO lvj_bib_libros
      (version_id, testamento, grupo, orden, nombre, abreviatura, codigo, capitulos, estado, created_at, updated_at)
      VALUES (:version_id, :testamento, :grupo, :orden, :nombre, :abreviatura, :codigo, :capitulos, 1, NOW(), NOW())");
    $bookIds = [];
    foreach ($libros as $book) {
      $bookStatement->execute([
        'version_id' => $versionId, 'testamento' => $book['testamento'], 'grupo' => $book['grupo'],
        'orden' => $book['orden'], 'nombre' => $book['nombre'], 'abreviatura' => $book['abreviatura'],
        'codigo' => $book['codigo'], 'capitulos' => $book['capitulos'],
      ]);
      $bookIds[$book['codigo']] = (int) $pdo->lastInsertId();
    }

    $secciones = bib_import_read_json($files['Secciones']);
    $titles = [];
    foreach ($secciones as $section) {
      $key = $section['libro_codigo'] . '.' . $section['capitulo'] . '.' . $section['versiculo_inicio'];
      if (!isset($titles[$key])) $titles[$key] = $section['titulo'];
    }
    unset($secciones);
    $versiculos = bib_import_read_json($files['Versículos']);
    if (!$versiculos) throw new RuntimeException('El archivo de versículos está vacío.');
    $verseTotal = 0;
    $verseRows = [];
    foreach ($versiculos as $verse) {
      $code = $verse['libro_codigo'];
      if (!isset($bookIds[$code])) throw new RuntimeException('Libro no mapeado: ' . $code);
      $key = $code . '.' . $verse['capitulo'] . '.' . $verse['versiculo'];
      $verseRows[] = [
        'version_id' => $versionId, 'libro_id' => $bookIds[$code], 'capitulo' => $verse['capitulo'],
        'versiculo' => $verse['versiculo'], 'texto' => $verse['texto'],
        'titulo_seccion' => $titles[$key] ?? null, 'tiene_nota' => !empty($verse['tiene_nota']) ? 1 : 0,
        'estado' => 1,
      ];
      if (count($verseRows) >= 250) {
        $verseTotal += bib_import_insert_batches($pdo, 'lvj_bib_versiculos',
          ['version_id','libro_id','capitulo','versiculo','texto','titulo_seccion','tiene_nota','estado'], $verseRows, 250);
        $verseRows = [];
      }
    }
    if ($verseRows) {
      $verseTotal += bib_import_insert_batches($pdo, 'lvj_bib_versiculos',
        ['version_id','libro_id','capitulo','versiculo','texto','titulo_seccion','tiene_nota','estado'], $verseRows, 250);
    }
    unset($verseRows, $versiculos, $secciones, $titles);

    $notas = bib_import_read_json($files['Notas']);
    if (!$notas) throw new RuntimeException('El archivo de notas está vacío.');
    $noteTotal = 0;
    $noteRows = [];
    foreach ($notas as $note) {
      $code = $note['libro_codigo'];
      if (!isset($bookIds[$code])) throw new RuntimeException('Nota con libro no mapeado: ' . $code);
      $noteRows[] = [
        'version_id' => $versionId, 'libro_id' => $bookIds[$code], 'capitulo' => $note['capitulo'],
        'versiculo' => $note['versiculo'], 'nivel' => 1, 'orden' => $note['posicion'] ?? 1,
        'numero_nota' => $note['posicion'] ?? null, 'contenido' => $note['contenido'], 'tipo' => 'nota',
        'titulo' => null, 'referencia' => $code . ' ' . $note['capitulo'] . ',' . $note['versiculo'],
        'fuente' => $note['fuente'] ?? 'SpaPlatense-osis.json', 'estado' => 1,
        'hash_importacion' => $note['hash_importacion'],
      ];
      if (count($noteRows) >= 150) {
        $noteTotal += bib_import_insert_batches($pdo, 'lvj_bib_notas_versiones',
          ['version_id','libro_id','capitulo','versiculo','nivel','orden','numero_nota','contenido','tipo','titulo','referencia','fuente','estado','hash_importacion'], $noteRows, 150);
        $noteRows = [];
      }
    }
    if ($noteRows) {
      $noteTotal += bib_import_insert_batches($pdo, 'lvj_bib_notas_versiones',
        ['version_id','libro_id','capitulo','versiculo','nivel','orden','numero_nota','contenido','tipo','titulo','referencia','fuente','estado','hash_importacion'], $noteRows, 150);
    }
    $pdo->commit();
    return ['version_id' => $versionId, 'libros' => count($libros), 'versiculos' => $verseTotal, 'notas' => $noteTotal];
  } catch (Throwable $error) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    throw $error;
  }
}

$message = '';
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf();
  $action = (string) ($_POST['action'] ?? '');
  if ($action === 'diagnosticar') {
    $message = 'Diagnóstico actualizado. No se modificó ningún registro de la base de datos.';
    log_activity('diagnosticar', 'biblia_importacion', null, 'Diagnóstico de fuentes SpaPlatense');
  } elseif ($action === 'importar_bblx') {
    if ((string) ($_POST['confirmacion_bblx'] ?? '') !== 'IMPORTAR BBLX') {
      $error = 'Escribe IMPORTAR BBLX para confirmar.';
    } else {
      try {
        $result = bib_bblx_import($pdo, $_FILES['archivo_bblx'] ?? [], $_POST, $bibleStorageRoot);
        $message = "Importación BBLX completada: {$result['libros']} libros y {$result['versiculos']} versículos.";
        log_activity('importar', 'biblia_version', (int) $result['version_id'], $message);
      } catch (Throwable $importError) {
        error_log('LVJ Biblia BBLX: ' . $importError->getMessage());
        $error = 'No se importó ningún dato BBLX: ' . $importError->getMessage();
      }
    }
  } elseif ($action === 'importar_scio') {
    if ($selectedVersion !== 'scio') {
      $error = 'Selecciona la versión Scío antes de importarla.';
    } elseif ((string) ($_POST['confirmacion_scio'] ?? '') !== 'IMPORTAR SCIO') {
      $error = 'Escribe IMPORTAR SCIO para confirmar.';
    } else {
      try {
        $result = bib_scio_import($pdo, dirname(__DIR__));
        $spanish = $result['spanish'];
        $message = "Importación Scío completada en revisión: {$spanish['libros']} libros y {$spanish['versiculos']} versículos.";
        log_activity('importar', 'biblia_version', (int) $spanish['id'], $message);
      } catch (Throwable $importError) {
        error_log('LVJ Biblia Scío: ' . $importError->getMessage());
        $error = 'No se importó ningún dato de Scío: ' . $importError->getMessage();
      }
    }
  } elseif ($action === 'importar') {
    if ((string) ($_POST['confirmacion'] ?? '') !== 'IMPORTAR SPAPLATENSE') {
      $error = 'Escribe IMPORTAR SPAPLATENSE para confirmar.';
    } else {
      try {
        $result = bib_import_spaplatense($pdo, $processedFiles, $versionMeta);
        $message = "Importación completada: {$result['libros']} libros, {$result['versiculos']} versículos y {$result['notas']} notas.";
        log_activity('importar', 'biblia_version', (int) $result['version_id'], $message);
      } catch (Throwable $importError) {
        error_log('LVJ Biblia importación: ' . $importError->getMessage());
        $error = 'No se importó ningún dato: ' . $importError->getMessage();
      }
    }
  } else {
    $error = 'La acción solicitada todavía no está habilitada.';
  }
}

$sources = bib_import_file_status($requiredFiles, $root);
$processed = bib_import_file_status($processedFiles, $root);
$tables = bib_import_table_status($pdo, $requiredTables);
$allSourcesReady = !in_array(false, array_column($sources, 'exists'), true);
$allProcessedReady = !in_array(false, array_column($processed, 'exists'), true);
$coreTablesReady = $tables['lvj_bib_versiones']['exists']
  && $tables['lvj_bib_libros']['exists']
  && $tables['lvj_bib_versiculos']['exists']
  && ($selectedVersion === 'scio' || $tables['lvj_bib_notas_versiones']['exists']);

if ($selectedVersion === 'scio') {
  $reportPath = $sourceRoot . '/procesado/reporte-validacion.json';
  $validationReport = is_file($reportPath) ? bib_import_read_json($reportPath) : [];
  $counts = [
    'libros' => isset($validationReport['counts']['books']) ? (int) $validationReport['counts']['books'] : null,
    'versiculos' => isset($validationReport['counts']['verses']) ? (int) $validationReport['counts']['verses'] : null,
    'notas' => 0,
    'secciones' => 0,
  ];
} else {
  $counts = [
    'libros' => bib_import_json_count($sourceRoot . '/procesado/libros.json'),
    'versiculos' => bib_import_json_count($sourceRoot . '/procesado/versiculos.json'),
    'notas' => bib_import_json_count($sourceRoot . '/procesado/notas.json'),
    'secciones' => bib_import_json_count($sourceRoot . '/procesado/secciones.json'),
  ];
}

$pageTitle = 'Importar Biblias';
$pageSubtitle = 'Administración segura de múltiples versiones bíblicas';
require __DIR__ . '/includes/header.php';
?>

<section class="page-heading">
  <div>
    <span class="eyebrow">Biblia</span>
    <h1>Importar versiones de la Biblia</h1>
    <p>Selecciona y valida cada versión de forma independiente. Las credenciales permanecen exclusivamente en PHP.</p>
  </div>
</section>

<?php if ($message): ?><div class="alert success"><?php echo e($message); ?></div><?php endif; ?>
<?php if ($error): ?><div class="alert error"><?php echo e($error); ?></div><?php endif; ?>

<section class="panel-card">
  <div class="panel-header">
    <div><h2>Versión de trabajo</h2><p class="muted">El panel detecta las versiones disponibles dentro de <code>storage/biblia/</code>.</p></div>
  </div>
  <form method="get" class="content-toolbar">
    <label style="min-width:min(100%,360px)"><strong>Seleccionar versión</strong>
      <select name="version" onchange="this.form.submit()">
        <?php foreach ($availableVersions as $slug => $label): ?>
          <option value="<?php echo e($slug); ?>" <?php echo $slug === $selectedVersion ? 'selected' : ''; ?>><?php echo e($label); ?> (<?php echo e($slug); ?>)</option>
        <?php endforeach; ?>
      </select>
    </label>
    <noscript><button class="btn btn-gold" type="submit">Seleccionar</button></noscript>
  </form>
</section>

<div class="bible-import-overlay" data-bblx-import-overlay hidden role="status" aria-live="assertive" aria-label="Importación BBLX en progreso">
  <div class="bible-import-progress">
    <span class="bible-import-spinner" aria-hidden="true"></span>
    <h2>Importando archivo BBLX</h2>
    <p>Estamos validando y registrando la nueva versión bíblica.</p>
    <strong>Este proceso puede tardar varios minutos.</strong>
    <small>No cierres ni recargues esta ventana.</small>
  </div>
</div>

<section class="panel-card">
  <div class="panel-header">
    <div><h2>Importar archivo BBLX / e-Sword</h2><p class="muted">Añade otra versión bíblica con un proceso independiente. SpaPlatense y sus archivos no se modifican.</p></div>
  </div>
  <form method="post" enctype="multipart/form-data" class="form-grid" data-bblx-import-form>
    <?php echo csrf_field(); ?><input type="hidden" name="action" value="importar_bblx">
    <label><span>Archivo BBLX</span><input type="file" name="archivo_bblx" accept=".bblx" required></label>
    <label><span>Nombre oficial</span><input type="text" name="nombre" value="Biblia Torres Amat" required></label>
    <label><span>Código único</span><input type="text" name="codigo" value="TORRESAMAT" pattern="[A-Za-z0-9_]{3,30}" required></label>
    <label><span>Abreviatura</span><input type="text" name="abreviatura" value="Torres Amat" required></label>
    <label><span>Versificación</span><input type="text" name="versificacion" value="Católica" required></label>
    <label><span>Licencia o autorización</span><input type="text" name="licencia" placeholder="Documento o condición de uso verificada" required></label>
    <label style="grid-column:1/-1"><span>Notas de derechos</span><textarea name="copyright_notas" rows="3" placeholder="Procedencia y autorización de distribución"></textarea></label>
    <label><span>Confirmación</span><input type="text" name="confirmacion_bblx" placeholder="IMPORTAR BBLX" autocomplete="off" required></label>
    <div><button class="btn btn-gold" type="submit" data-bblx-import-button <?php echo $coreTablesReady ? '' : 'disabled'; ?>>Validar e importar BBLX</button></div>
  </form>
  <p class="muted" style="margin-top:12px">Se aceptan hasta 64 MB. El archivo debe ser SQLite BBLX, contener las tablas <code>Bible</code> y <code>Details</code>, y los libros numerados del 1 al 73.</p>
</section>

<section class="panel-card">
  <div class="panel-header"><div><h2>Ficha de la versión</h2><p class="muted">Formato común para SpaPlatense, Scío y futuras Biblias.</p></div></div>
  <div class="form-grid">
    <?php foreach ([
      'nombre' => 'Nombre oficial', 'codigo' => 'Código único', 'abreviatura' => 'Abreviatura',
      'idioma' => 'Idioma', 'traductor' => 'Traductor / editor', 'anio' => 'Año',
      'licencia' => 'Licencia', 'versificacion' => 'Versificación', 'canon' => 'Libros del canon',
    ] as $field => $label): ?>
      <label><span><?php echo e($label); ?></span><input type="text" value="<?php echo e((string) $versionMeta[$field]); ?>" readonly></label>
    <?php endforeach; ?>
  </div>
  <div class="content-tabs" style="margin-top:16px">
    <span class="active">Texto limpio</span><span>OSIS / notas</span><span>SWORD original</span><span>Paquete offline</span>
  </div>
</section>

<section class="panel-card">
  <div class="panel-header"><div><h2>Versiones detectadas</h2><p class="muted">Cada versión conserva fuentes, procesados y paquetes offline separados.</p></div></div>
  <div class="table-wrap"><table><thead><tr><th>Versión</th><th>Identificador</th><th>Fuentes</th><th>Procesados</th><th>Acción</th></tr></thead><tbody>
    <?php foreach ($availableVersions as $slug => $label):
      $base = $bibleStorageRoot . '/' . $slug;
      $hasSources = is_dir($base . '/fuente');
      $hasProcessed = is_file($base . '/procesado/libros.json') && is_file($base . '/procesado/versiculos.json');
    ?>
      <tr><td><?php echo e($label); ?></td><td><code><?php echo e($slug); ?></code></td>
        <td><?php echo $hasSources ? 'Disponibles' : 'Pendientes'; ?></td><td><?php echo $hasProcessed ? 'Disponibles' : 'Pendientes'; ?></td>
        <td><a class="action-button" href="biblia-importar.php?version=<?php echo e($slug); ?>">Administrar</a></td></tr>
    <?php endforeach; ?>
  </tbody></table></div>
</section>

<section class="stats-grid admin-stats">
  <article class="stat-card"><span>Libros canónicos</span><strong><?php echo (int) ($counts['libros'] ?? 0); ?></strong><small>Esperados: 73</small></article>
  <article class="stat-card"><span>Versículos</span><strong><?php echo (int) ($counts['versiculos'] ?? 0); ?></strong><small>Texto limpio procesado</small></article>
  <article class="stat-card"><span>Notas de estudio</span><strong><?php echo (int) ($counts['notas'] ?? 0); ?></strong><small>Extraídas de OSIS</small></article>
  <article class="stat-card"><span>Secciones</span><strong><?php echo (int) ($counts['secciones'] ?? 0); ?></strong><small>Conservadas fuera de MySQL</small></article>
</section>

<section class="panel-card">
  <div class="panel-header">
    <div><h2>Estado general</h2><p class="muted">La importación solo podrá habilitarse cuando fuentes, procesados y tablas estén disponibles.</p></div>
    <form method="post"><?php echo csrf_field(); ?><input type="hidden" name="action" value="diagnosticar"><button class="btn btn-gold" type="submit">Actualizar diagnóstico</button></form>
  </div>
  <div class="content-tabs">
    <span class="<?php echo $allSourcesReady ? 'active' : ''; ?>">Fuentes: <?php echo $allSourcesReady ? 'listas' : 'incompletas'; ?></span>
    <span class="<?php echo $allProcessedReady ? 'active' : ''; ?>">Procesados: <?php echo $allProcessedReady ? 'listos' : 'incompletos'; ?></span>
    <span class="<?php echo $coreTablesReady ? 'active' : ''; ?>">MySQL: <?php echo $coreTablesReady ? 'listo' : 'incompleto'; ?></span>
  </div>
</section>

<section class="panel-card">
  <h2>Archivos fuente y procesados</h2>
  <div class="table-wrap"><table><thead><tr><th>Recurso</th><th>Ruta</th><th>Tamaño</th><th>Estado</th></tr></thead><tbody>
  <?php foreach (array_merge($sources, $processed) as $file): ?><tr>
    <td><?php echo e($file['label']); ?></td><td><code><?php echo e($file['path']); ?></code></td>
    <td><?php echo $file['exists'] ? e(format_bytes((int) $file['size'])) : '—'; ?></td>
    <td><?php echo $file['exists'] ? 'Disponible' : 'Faltante'; ?></td>
  </tr><?php endforeach; ?>
  </tbody></table></div>
</section>

<section class="panel-card">
  <h2>Tablas de Biblia</h2>
  <div class="table-wrap"><table><thead><tr><th>Tabla</th><th>Registros actuales</th><th>Columnas detectadas</th><th>Estado</th></tr></thead><tbody>
  <?php foreach ($tables as $table => $status): ?><tr>
    <td><code><?php echo e($table); ?></code></td><td><?php echo (int) $status['count']; ?></td>
    <td>
      <?php if ($status['columns']): ?>
        <small><?php echo e(implode(', ', array_map(static function (array $column): string {
          return (string) $column['Field'];
        }, $status['columns']))); ?></small>
      <?php else: ?>—<?php endif; ?>
    </td>
    <td><?php echo $status['exists'] ? 'Disponible (' . count($status['columns']) . ')' : 'No encontrada'; ?></td>
  </tr><?php endforeach; ?>
  </tbody></table></div>
</section>

<section class="panel-card">
  <h2>Importación</h2>
  <p class="muted">La operación importa una versión nueva dentro de una transacción. Si el código ya existe o una fila falla, no se conserva ningún cambio.</p>
  <?php if ($allSourcesReady && $allProcessedReady && $coreTablesReady): ?>
    <?php if ($selectedVersion === 'scio'): ?>
      <form method="post" data-bible-import-form data-version-label="<?php echo e($versionMeta['abreviatura']); ?>">
        <?php echo csrf_field(); ?><input type="hidden" name="action" value="importar_scio">
        <label><span>Confirmación</span><input type="text" name="confirmacion_scio" required placeholder="IMPORTAR SCIO" autocomplete="off"></label>
        <button class="btn btn-gold" type="submit" data-bible-import-button>Importar Scío a MySQL (en revisión)</button>
      </form>
      <p class="muted" style="margin-top:12px">Se importarán 73 libros y 35.799 versículos. La versión quedará oculta hasta que un administrador finalice la revisión textual y la active.</p>
    <?php else: ?>
      <form method="post" data-bible-import-form data-version-label="<?php echo e($versionMeta['abreviatura']); ?>">
        <?php echo csrf_field(); ?><input type="hidden" name="action" value="importar">
        <label><span>Confirmación</span><input type="text" name="confirmacion" required placeholder="IMPORTAR SPAPLATENSE" autocomplete="off"></label>
        <button class="btn btn-gold" type="submit" data-bible-import-button>Importar SpaPlatense a MySQL</button>
      </form>
    <?php endif; ?>
  <?php else: ?><button class="btn btn-gold" type="button" disabled>Importación no disponible</button><?php endif; ?>
</section>

<div class="bible-import-overlay" data-bible-import-overlay hidden role="status" aria-live="assertive" aria-label="Importación en progreso">
  <div class="bible-import-progress">
    <span class="bible-import-spinner" aria-hidden="true"></span>
    <h2>Importando <?php echo e($versionMeta['abreviatura']); ?></h2>
    <p>Estamos validando y registrando la versión bíblica seleccionada.</p>
    <strong>Este proceso puede tardar varios minutos.</strong>
    <small>No cierres ni recargues esta ventana.</small>
  </div>
</div>

<script>
  (() => {
    const form = document.querySelector('[data-bible-import-form]');
    const overlay = document.querySelector('[data-bible-import-overlay]');
    const button = document.querySelector('[data-bible-import-button]');
    if (!form || !overlay || !button) return;

    form.addEventListener('submit', (event) => {
      const versionLabel = form.dataset.versionLabel || 'la versión seleccionada';
      if (!window.confirm('¿Importar ' + versionLabel + ' a MySQL? La operación puede tardar varios minutos.')) {
        event.preventDefault();
        return;
      }
      button.disabled = true;
      button.textContent = 'Importando…';
      overlay.hidden = false;
      document.body.classList.add('bible-import-busy');
    });
  })();
</script>

<script>
  (() => {
    const form = document.querySelector('[data-bblx-import-form]');
    const overlay = document.querySelector('[data-bblx-import-overlay]');
    const button = document.querySelector('[data-bblx-import-button]');
    if (!form || !overlay || !button) return;
    form.addEventListener('submit', (event) => {
      if (!window.confirm('¿Validar e importar esta versión BBLX a MySQL?')) {
        event.preventDefault();
        return;
      }
      button.disabled = true;
      button.textContent = 'Importando…';
      overlay.hidden = false;
      document.body.classList.add('bible-import-busy');
    });
  })();
</script>

<?php require __DIR__ . '/includes/footer.php'; ?>

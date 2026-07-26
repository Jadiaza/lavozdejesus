<?php

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();

function dashboard_count(PDO $pdo, string $sql): int
{
  try {
    return (int) $pdo->query($sql)->fetchColumn();
  } catch (Throwable $error) {
    return 0;
  }
}

function table_count(PDO $pdo, string $table, string $where = '1=1'): int
{
  if (!preg_match('/^[a-zA-Z0-9_]+$/', $table)) {
    return 0;
  }

  return dashboard_count($pdo, "SELECT COUNT(*) FROM {$table} WHERE {$where}");
}

$totalFiles = dashboard_count($pdo, "SELECT COUNT(*) FROM lvj_files WHERE status = 1");
$totalFolders = dashboard_count($pdo, "SELECT COUNT(*) FROM lvj_file_folders");
$totalSize = dashboard_count($pdo, "SELECT COALESCE(SUM(size_bytes), 0) FROM lvj_files WHERE status = 1");
$adminUsers = dashboard_count($pdo, "SELECT COUNT(*) FROM lvj_file_users WHERE status = 1");
$appUsers = table_count($pdo, 'lvj_com_usuarios');
$totalLogs = dashboard_count($pdo, "SELECT COUNT(*) FROM lvj_file_logs");
$radioPrograms = table_count($pdo, 'lvj_rad_programas');
$radioSchedule = table_count($pdo, 'lvj_rad_programacion');
$radioStreams = table_count($pdo, 'lvj_rad_streams');
$radioHosts = table_count($pdo, 'lvj_rad_locutores');
$lecturaDia = table_count($pdo, 'lvj_lit_lectura_dia');
$liturgiaDays = table_count($pdo, 'lvj_lit_dia');
$lectioItems = table_count($pdo, 'lvj_lit_lectio_divina');
$palabraDia = table_count($pdo, 'lvj_lit_palabra_dia');
$santoral = table_count($pdo, 'lvj_san_santo_dia');
$aiStudies = table_count($pdo, 'lvj_bib_estudios_ia', 'deleted_at IS NULL');
$aiRequests = table_count($pdo, 'lvj_bib_estudios_ia_solicitudes');
$pendingPrayerRequests = table_count($pdo, 'lvj_com_peticiones_oracion', "estado = 'pendiente' AND deleted_at IS NULL");
$pendingAiStudies = table_count($pdo, 'lvj_bib_estudios_ia', "estado = 'revision' AND deleted_at IS NULL");
$processingAiRequests = table_count($pdo, 'lvj_bib_estudios_ia_solicitudes', "estado IN ('pendiente', 'procesando')");
$pendingAiReviews = table_count($pdo, 'lvj_ai_response_reviews', "review_status = 'pending'");
$pendingAiSources = table_count($pdo, 'lvj_ai_knowledge_sources', "verification_status = 'pending' AND deleted_at IS NULL");
$failedAiTests = table_count($pdo, 'lvj_ai_test_results', 'passed = 0');
$bibPlans = table_count($pdo, 'lvj_bib_planes');
$bibBooks = table_count($pdo, 'lvj_bib_libros');
$bibProgress = table_count($pdo, 'lvj_bib_progreso_planes');
$podcasts = table_count($pdo, 'lvj_pod_podcasts');
$podCategories = table_count($pdo, 'lvj_pod_categorias');
$prayerRequests = table_count($pdo, 'lvj_com_peticiones_oracion');
$testimonies = table_count($pdo, 'lvj_com_testimonios');
$spiritualNotes = table_count($pdo, 'lvj_com_notas_espirituales');
$donations = table_count($pdo, 'lvj_eco_donaciones');
$supportOptions = table_count($pdo, 'lvj_eco_apoyos_emisora');
$sponsors = table_count($pdo, 'lvj_eco_padrinos');
$adUnits = table_count($pdo, 'lvj_pub_adsense') + table_count($pdo, 'lvj_pub_patrocinadores') + table_count($pdo, 'lvj_pub_publicidad_comercial');
$configRows = table_count($pdo, 'lvj_cfg_app') + table_count($pdo, 'lvj_cfg_emisora') + table_count($pdo, 'lvj_cfg_redes_sociales');

try {
  $recent = $pdo->query("
    SELECT original_name, created_at
    FROM lvj_files
    WHERE status = 1
    ORDER BY created_at DESC
    LIMIT 5
  ")->fetchAll();
} catch (Throwable $error) {
  $recent = [];
}

$moduleCards = [
  ['emisora', 'Emisora', 'Radio, programas, programacion y podcast.', ["{$radioStreams} streams", "{$radioPrograms} programas", "{$radioSchedule} horarios", "{$podcasts} podcasts"], 'purple', 'content.php?module=radio', $radioStreams + $radioPrograms],
  ['capilla', 'Capilla y Oracion', 'Adoracion, transmisiones e intenciones.', ["{$prayerRequests} intenciones", "{$testimonies} testimonios", 'Capillas y streams', 'Rosarios y oraciones'], 'gold', 'content.php?module=capilla', $prayerRequests],
  ['liturgia-santoral', 'Liturgia y Santoral', 'Contenido liturgico y calendario de santos.', ["{$lecturaDia} lecturas", "{$liturgiaDays} dias liturgicos", "{$lectioItems} Lectio Divina", "{$santoral} santos"], 'green', 'content.php?module=liturgia', $lecturaDia + $santoral],
  ['biblia', 'Biblia', 'Biblias, planes, recursos y estudios.', ["{$bibBooks} libros", "{$bibPlans} planes", "{$aiStudies} estudios biblicos IA", 'Importacion de Biblias'], 'blue', 'content.php?module=biblia', $bibBooks + $bibPlans],
  ['biblioteca', 'Formacion y Biblioteca', 'Archivos y recursos de formacion.', ["{$totalFiles} archivos", "{$totalFolders} carpetas", format_bytes($totalSize) . ' usados', 'Descargas seguras'], 'teal', 'files.php', $totalFiles],
  ['sostenibilidad', 'Sostenibilidad', 'Donaciones, padrinos y publicidad.', ["{$donations} donaciones", "{$sponsors} padrinos", "{$supportOptions} apoyos", "{$adUnits} espacios publicitarios"], 'pink', 'content.php?module=economia', $donations + $sponsors],
  ['administracion', 'Administracion', 'Usuarios, roles, configuracion y auditoria.', ["{$appUsers} usuarios app", "{$adminUsers} administradores", "{$configRows} configuraciones", "{$totalLogs} logs"], 'purple', 'content.php?module=usuarios', $appUsers + $adminUsers],
];

if (is_technical_admin()) {
  $moduleCards[] = ['entrenamiento-ia', 'Formacion y Supervision IA', 'Perfiles, fuentes, pruebas y control editorial.', ["{$pendingAiReviews} revisiones pendientes", "{$pendingAiSources} fuentes por verificar", "{$failedAiTests} pruebas no aprobadas", 'Auditoria y despliegues'], 'purple', 'ia-entrenamiento.php', $pendingAiReviews + $pendingAiSources + $failedAiTests];
}

$pageTitle = 'Dashboard';
$pageSubtitle = 'Bienvenido al panel de administracion';
require __DIR__ . '/includes/header.php';
?>

<section class="dashboard-section-heading">
  <div><span class="eyebrow">Operacion</span><h2>Estado del contenido principal</h2></div>
</section>

<section class="stats-grid admin-stats">
  <article class="stat-card"><div class="stat-icon purple">RA</div><span>Radio</span><strong><?php echo $radioStreams; ?></strong><small><?php echo $radioSchedule; ?> horarios configurados</small></article>
  <article class="stat-card"><div class="stat-icon gold">CA</div><span>Capilla</span><strong><?php echo table_count($pdo, 'lvj_capillas', 'deleted_at IS NULL'); ?></strong><small><?php echo $prayerRequests; ?> intenciones registradas</small></article>
  <article class="stat-card"><div class="stat-icon green">LI</div><span>Liturgia</span><strong><?php echo $lecturaDia; ?></strong><small>Lecturas disponibles</small></article>
  <article class="stat-card"><div class="stat-icon gold">SA</div><span>Santoral</span><strong><?php echo $santoral; ?></strong><small>Santos registrados</small></article>
  <article class="stat-card"><div class="stat-icon blue">BI</div><span>Biblias</span><strong><?php echo $bibBooks; ?></strong><small>Libros disponibles</small></article>
</section>

<section class="dashboard-section-heading">
  <div><span class="eyebrow">Revision</span><h2>Pendientes que requieren atencion</h2></div>
</section>

<section class="stats-grid pending-stats">
  <a class="stat-card stat-card-link" href="intenciones.php?estado=pendiente"><div class="stat-icon pink">I</div><span>Intenciones</span><strong><?php echo $pendingPrayerRequests; ?></strong><small>Pendientes de moderacion</small></a>
  <a class="stat-card stat-card-link" href="biblia-estudios-ia.php?estado=revision"><div class="stat-icon purple">EB</div><span>Estudios biblicos</span><strong><?php echo $pendingAiStudies; ?></strong><small>Pendientes de revision</small></a>
  <article class="stat-card"><div class="stat-icon blue">SO</div><span>Solicitudes IA</span><strong><?php echo $processingAiRequests; ?></strong><small>Pendientes o procesando</small></article>
  <?php if (is_technical_admin()): ?>
    <a class="stat-card stat-card-link" href="ia-entrenamiento.php"><div class="stat-icon gold">IA</div><span>Supervision IA</span><strong><?php echo $pendingAiReviews + $pendingAiSources; ?></strong><small>Respuestas y fuentes pendientes</small></a>
    <a class="stat-card stat-card-link" href="content.php?module=inteligencia-artificial&amp;table=lvj_ai_test_results"><div class="stat-icon pink">PT</div><span>Pruebas IA</span><strong><?php echo $failedAiTests; ?></strong><small>Resultados no aprobados</small></a>
  <?php endif; ?>
</section>

<section class="panel dashboard-quick-panel">
  <div class="panel-header">
    <div><span class="eyebrow">Accesos rapidos</span><h2>Acciones frecuentes</h2></div>
  </div>
  <div class="quick-actions-grid">
    <a href="content.php?module=radio&amp;table=lvj_rad_programacion&amp;action=new"><span>Pr</span><strong>Nueva programacion</strong></a>
    <a href="content.php?module=liturgia&amp;table=lvj_lit_lectura_dia"><span>Li</span><strong>Editar liturgia</strong></a>
    <a href="intenciones.php?estado=pendiente"><span>In</span><strong>Revisar intenciones</strong></a>
    <a href="biblia-estudios-ia.php?estado=revision"><span>IA</span><strong>Revisar estudios</strong></a>
    <a href="biblia-importar.php"><span>Bi</span><strong>Importar / Subir Biblias</strong></a>
    <a href="upload.php"><span>Ar</span><strong>Subir archivo</strong></a>
    <a href="content.php?module=capilla&amp;table=lvj_capilla_config"><span>Ca</span><strong>Configurar Capilla</strong></a>
    <?php if (is_technical_admin()): ?><a href="ia-entrenamiento.php"><span>IA</span><strong>Centro de Formacion IA</strong></a><?php endif; ?>
  </div>
</section>

<section class="dashboard-section-heading">
  <div><span class="eyebrow">Areas</span><h2>Administracion por modulos</h2></div>
</section>

<section class="module-grid">
  <?php foreach ($moduleCards as [$id, $title, $description, $items, $color, $href, $count]): ?>
    <article class="module-card" id="<?php echo e($id); ?>">
      <div class="module-head">
        <div class="module-icon <?php echo e($color); ?>"><?php echo e(substr($title, 0, 2)); ?></div>
        <div>
          <h2><?php echo e($title); ?></h2>
          <p><?php echo e($description); ?></p>
        </div>
        <strong class="module-count"><?php echo (int) $count; ?></strong>
      </div>
      <ul>
        <?php foreach ($items as $item): ?>
          <li><?php echo e($item); ?></li>
        <?php endforeach; ?>
      </ul>
      <a class="module-button <?php echo e($color); ?>" href="<?php echo e($href); ?>">Administrar</a>
    </article>
  <?php endforeach; ?>
</section>

<section class="dashboard-bottom">
  <article class="panel">
    <div class="panel-header">
      <h2>Actividad Reciente</h2>
      <a class="btn btn-gold" href="logs.php">Ver actividad</a>
    </div>
    <div class="activity-list">
      <?php foreach ($recent as $item): ?>
        <div class="activity-row">
          <span>Se subio un nuevo archivo: <?php echo e($item['original_name']); ?></span>
          <small><?php echo e($item['created_at']); ?></small>
        </div>
      <?php endforeach; ?>
      <?php if (!$recent): ?>
        <p class="muted">Aun no hay archivos cargados.</p>
      <?php endif; ?>
    </div>
  </article>

  <article class="panel storage-panel">
    <h2>Almacenamiento</h2>
    <div class="storage-ring">
      <strong><?php echo $totalFiles; ?></strong>
      <span>archivos</span>
    </div>
    <div class="storage-legend">
      <span><i class="dot blue"></i> Imagenes</span>
      <span><i class="dot teal"></i> Audios</span>
      <span><i class="dot purple"></i> Videos</span>
      <span><i class="dot gold"></i> Documentos</span>
    </div>
  </article>

  <article class="panel live-panel">
    <div class="panel-header">
      <h2>Transmision en Vivo</h2>
      <span class="live-pill">En Vivo</span>
    </div>
    <div class="live-card">
      <div class="live-thumb"></div>
      <div>
        <strong>La Voz de Jesus en Vivo</strong>
        <p>Alabando y Anunciando al Senor</p>
        <small><?php echo $radioStreams; ?> streams configurados</small>
      </div>
    </div>
    <div class="wave-row"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
    <a class="btn btn-gold" href="../radio" target="_blank" rel="noopener">Ir al Reproductor</a>
  </article>
</section>

<footer class="admin-footer">La Voz de Jesus - Administrador v1.0.0</footer>

<?php require __DIR__ . '/includes/footer.php'; ?>

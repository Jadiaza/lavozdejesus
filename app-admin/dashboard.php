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
  ['radio', 'Radio en Vivo', 'Gestiona la transmision, fuentes y locutores.', ["{$radioStreams} streams", "{$radioHosts} locutores", 'Historial de transmisiones', 'Reproductor en vivo'], 'purple', 'content.php?module=radio', $radioStreams + $radioHosts],
  ['programacion', 'Programacion', 'Administra la parrilla de radio.', ["{$radioPrograms} programas", "{$radioSchedule} horarios", 'Categorias', 'Conductores'], 'blue', 'content.php?module=radio&table=lvj_rad_programacion', $radioSchedule],
  ['capilla', 'Capilla Virtual', 'Gestiona la adoracion y sus recursos.', ['Transmision en vivo', 'Imagenes de capilla', 'Configuracion', 'Intenciones conectadas'], 'gold', 'content.php?module=capilla', $prayerRequests],
  ['intenciones', 'Intenciones de Oracion', 'Administra comunidad, peticiones y testimonios.', ["{$prayerRequests} peticiones", "{$testimonies} testimonios", "{$spiritualNotes} notas espirituales", 'Grupos de oracion'], 'pink', 'content.php?module=capilla&table=lvj_com_peticiones_oracion', $prayerRequests],
  ['liturgia', 'Liturgia del Dia', 'Publica la lectura diaria centralizada.', ["{$lecturaDia} lecturas del dia", 'Lecturas biblicas', 'Evangelio y reflexion', 'Tiempos y temas'], 'green', 'content.php?module=liturgia&table=lvj_lit_lectura_dia', $lecturaDia],
  ['santoral', 'Santoral', 'Administra santos y celebraciones.', ["{$santoral} santo del dia", 'Biografias', 'Oraciones', 'Imagenes'], 'orange', 'content.php?module=santoral', $santoral],
  ['biblia', 'Biblia / Planes', 'Gestiona Biblia, planes y progreso.', ["{$bibBooks} libros", "{$bibPlans} planes", "{$bibProgress} progresos", 'Versiculos tematicos'], 'blue', 'content.php?module=biblia', $bibPlans],
  ['rosario', 'Rosario', 'Gestiona devociones, misterios y oraciones.', ['Misterios', 'Rosarios', 'Novenas', 'Devociones'], 'gold', 'content.php?module=oracion', table_count($pdo, 'lvj_ora_rosarios')],
  ['archivos', 'Biblioteca / Archivos', 'Administrador de archivos y recursos.', ["{$totalFiles} archivos", "{$totalFolders} carpetas", format_bytes($totalSize) . ' usados', 'Descargas seguras'], 'teal', 'files.php', $totalFiles],
  ['podcast', 'Podcast', 'Gestiona audios, categorias y episodios.', ["{$podcasts} podcasts", "{$podCategories} categorias", 'Publicacion', 'Portadas'], 'orange', 'content.php?module=podcast', $podcasts],
  ['economia', 'Donaciones', 'Gestiona apoyos, padrinos y donaciones.', ["{$supportOptions} apoyos", "{$sponsors} padrinos", "{$donations} donaciones", 'Bonos solidarios'], 'pink', 'content.php?module=economia', $donations + $sponsors],
  ['publicidad', 'Publicidad', 'Gestiona AdSense, patrocinadores y banners.', ["{$adUnits} espacios", 'Clicks', 'Impresiones', 'Patrocinadores'], 'green', 'content.php?module=publicidad', $adUnits],
  ['usuarios', 'Usuarios y Roles', 'Administra usuarios, roles y permisos.', ["{$appUsers} usuarios app", "{$adminUsers} admins", 'Roles', "{$totalLogs} logs"], 'purple', 'content.php?module=usuarios', $appUsers + $adminUsers],
  ['configuracion', 'Configuracion', 'Centraliza emisora, app, redes y apariencia.', ["{$configRows} registros", 'Emisora', 'Apariencia', 'Redes sociales'], 'teal', 'content.php?module=configuracion', $configRows],
];

$pageTitle = 'Dashboard';
$pageSubtitle = 'Bienvenido al panel de administracion';
require __DIR__ . '/includes/header.php';
?>

<section class="stats-grid admin-stats">
  <article class="stat-card"><div class="stat-icon purple">RA</div><span>Radio / Horarios</span><strong><?php echo $radioSchedule; ?></strong><small><?php echo $radioPrograms; ?> programas registrados</small></article>
  <article class="stat-card"><div class="stat-icon blue">AR</div><span>Archivos Totales</span><strong><?php echo $totalFiles; ?></strong><small><?php echo e(format_bytes($totalSize)); ?> almacenados</small></article>
  <article class="stat-card"><div class="stat-icon green">LI</div><span>Lectura del Dia</span><strong><?php echo $lecturaDia; ?></strong><small>Fuente central de la app</small></article>
  <article class="stat-card"><div class="stat-icon pink">CO</div><span>Comunidad</span><strong><?php echo $prayerRequests + $testimonies; ?></strong><small>Peticiones y testimonios</small></article>
  <article class="stat-card"><div class="stat-icon gold">EC</div><span>Economia / Apoyos</span><strong><?php echo $supportOptions + $sponsors; ?></strong><small><?php echo $donations; ?> donaciones registradas</small></article>
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

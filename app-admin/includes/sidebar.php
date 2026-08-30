<?php
$currentAdminPage = basename((string) ($_SERVER['SCRIPT_NAME'] ?? ''));
$currentModule = (string) ($_GET['module'] ?? '');
$currentTable = (string) ($_GET['table'] ?? '');

function side_nav_active(string $page = '', string $module = '', string $table = ''): string
{
  global $currentAdminPage, $currentModule, $currentTable;

  if ($page !== '' && $currentAdminPage === $page) {
    return 'active';
  }

  if ($module !== '' && $currentModule === $module) {
    if ($table === '') {
      $moduleTableExceptions = [
        'radio' => ['lvj_rad_programacion'],
      ];

      if (isset($moduleTableExceptions[$module]) && in_array($currentTable, $moduleTableExceptions[$module], true)) {
        return '';
      }

      return 'active';
    }

    return $currentTable === $table ? 'active' : '';
  }

  return '';
}

function side_files_active(): string
{
  global $currentAdminPage;

  return in_array($currentAdminPage, ['files.php', 'upload.php', 'edit_file.php', 'folders.php', 'download.php'], true) ? 'active' : '';
}

$liturgiaMainActive = in_array($currentAdminPage, ['liturgia-dia.php', 'lectio-divina.php'], true)
  || $currentModule === 'liturgia';
$santoralMainActive = $currentAdminPage === 'santoral-dia.php'
  || $currentModule === 'santoral';

$bibliaMainActive = side_nav_active('', 'biblia') === 'active';
$bibliaImportActive = $currentAdminPage === 'biblia-importar.php';
$bibliaStudiesActive = in_array($currentAdminPage, ['biblia-estudios-ia.php', 'biblia-estudio-ia.php'], true);
$bibliaMapsActive = $currentAdminPage === 'biblia-mapas.php';
$bibliaCharactersActive = $currentAdminPage === 'biblia-personajes.php';
$bibliaMaintenanceActive = in_array($currentAdminPage, [
  'biblia-equivalencias.php',
  'biblia-equivalencias-revisar.php',
  'biblia-equivalencias-auditar.php',
  'biblia-segmentacion.php',
  'biblia-reparacion-importacion.php',
  'biblia-ajuste-ester.php',
  'biblia-scio-revision.php',
], true);
$bibliaGroupActive = $bibliaMainActive || $bibliaImportActive || $bibliaStudiesActive || $bibliaMapsActive || $bibliaCharactersActive || $bibliaMaintenanceActive;
$aiTrainingActive = $currentAdminPage === 'ia-entrenamiento.php' || $currentModule === 'inteligencia-artificial';
?>
<aside class="sidebar" data-sidebar>
  <div class="brand brand-large">
    <div class="brand-emblem">LVJ</div>
    <div>
      <strong>La Voz de Jesus</strong>
      <span>Administrador</span>
    </div>
  </div>

  <nav class="side-nav">
    <span class="side-nav-section-label">Inicio</span>
    <a class="<?php echo side_nav_active('dashboard.php'); ?>" href="dashboard.php"><span class="nav-icon">D</span> Dashboard</a>

    <span class="side-nav-section-label">Emisora</span>
    <a class="<?php echo side_nav_active('', 'radio', ''); ?>" href="content.php?module=radio"><span class="nav-icon">R</span> Radio en Vivo</a>
    <a class="<?php echo side_nav_active('', 'radio', 'lvj_rad_programacion'); ?>" href="content.php?module=radio&amp;table=lvj_rad_programacion"><span class="nav-icon">Pr</span> Programacion</a>
    <a class="<?php echo side_nav_active('', 'podcast'); ?>" href="content.php?module=podcast"><span class="nav-icon">Pc</span> Podcast</a>

    <span class="side-nav-section-label">Capilla y Oracion</span>
    <a class="<?php echo side_nav_active('', 'capilla') === 'active' ? 'active' : ''; ?>" href="content.php?module=capilla"><span class="nav-icon">C</span> Capillas y Transmisiones</a>
    <a class="<?php echo $currentAdminPage === 'intenciones.php' ? 'active' : ''; ?>" href="intenciones.php"><span class="nav-icon">I</span> Intenciones de Oracion</a>
    <a class="<?php echo side_nav_active('', 'oracion'); ?>" href="content.php?module=oracion"><span class="nav-icon">O</span> Rosarios y Oraciones</a>

    <span class="side-nav-section-label">Liturgia y Santoral</span>
    <a class="<?php echo $liturgiaMainActive ? 'active' : ''; ?>" href="liturgia-dia.php"><span class="nav-icon">L</span> Liturgia</a>
    <a class="<?php echo $santoralMainActive ? 'active' : ''; ?>" href="santoral-dia.php"><span class="nav-icon">S</span> Santoral</a>

    <span class="side-nav-section-label">Biblia</span>
    <div class="side-nav-group<?php echo $bibliaGroupActive ? ' is-active' : ''; ?>">
      <a class="side-nav-parent <?php echo $bibliaMainActive ? 'active' : ($bibliaGroupActive ? 'section-active' : ''); ?>" href="content.php?module=biblia">
        <span class="nav-icon">B</span>
        <span>Biblia y Planes</span>
      </a>
      <div class="side-nav-submenu" aria-label="Opciones de Biblia">
        <a class="<?php echo $bibliaImportActive ? 'active' : ''; ?>" href="biblia-importar.php"><span class="nav-icon">Bi</span> Importar / Subir Biblias</a>
        <a class="<?php echo $bibliaStudiesActive ? 'active' : ''; ?>" href="biblia-estudios-ia.php"><span class="nav-icon">IA</span> Estudios Biblicos IA</a>
        <a class="<?php echo $bibliaMapsActive ? 'active' : ''; ?>" href="biblia-mapas.php"><span class="nav-icon">M</span> Mapas</a>
        <a class="<?php echo $bibliaCharactersActive ? 'active' : ''; ?>" href="biblia-personajes.php"><span class="nav-icon">P</span> Personajes</a>
        <a class="<?php echo $bibliaMaintenanceActive ? 'active' : ''; ?>" href="biblia-equivalencias.php"><span class="nav-icon">Mt</span> Mantenimiento Biblico</a>
        <a class="<?php echo $currentAdminPage === 'biblia-scio-revision.php' ? 'active' : ''; ?>" href="biblia-scio-revision.php"><span class="nav-icon">Sc</span> Revisar Biblia Scio</a>
      </div>
    </div>

    <?php if (is_technical_admin()): ?>
      <span class="side-nav-section-label">Inteligencia Artificial</span>
      <a class="<?php echo $aiTrainingActive ? 'active' : ''; ?>" href="ia-entrenamiento.php"><span class="nav-icon">IA</span> Formacion y Supervision IA</a>
    <?php endif; ?>

    <span class="side-nav-section-label">Formacion y Biblioteca</span>
    <a class="<?php echo side_files_active(); ?>" href="files.php"><span class="nav-icon">A</span> Biblioteca / Archivos</a>

    <span class="side-nav-section-label">Sostenibilidad</span>
    <a class="<?php echo side_nav_active('', 'economia'); ?>" href="content.php?module=economia"><span class="nav-icon">$</span> Donaciones</a>
    <a class="<?php echo side_nav_active('', 'publicidad'); ?>" href="content.php?module=publicidad"><span class="nav-icon">Ad</span> Publicidad</a>

    <span class="side-nav-section-label">Administracion</span>
    <a class="<?php echo side_nav_active('', 'usuarios'); ?>" href="content.php?module=usuarios"><span class="nav-icon">U</span> Usuarios y Roles</a>
    <a class="<?php echo side_nav_active('', 'configuracion'); ?>" href="content.php?module=configuracion"><span class="nav-icon">Cf</span> Configuracion</a>
    <a class="<?php echo $currentAdminPage === 'logs.php' ? 'active' : ''; ?>" href="logs.php"><span class="nav-icon">Lg</span> Auditoria / Logs</a>
  </nav>

  <div class="server-card">
    <strong>Sesion administrativa</strong>
    <span><?php echo e(current_user()['name'] ?? 'Administrador'); ?></span>
    <small><?php echo e(current_user()['role'] ?? 'admin'); ?></small>
  </div>
</aside>

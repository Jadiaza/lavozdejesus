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
        'capilla' => ['lvj_capillas', 'lvj_capilla_streams', 'lvj_com_peticiones_oracion', 'lvj_com_grupos_oracion', 'lvj_com_testimonios'],
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

$bibliaMainActive = side_nav_active('', 'biblia') === 'active';
$bibliaImportActive = $currentAdminPage === 'biblia-importar.php';
$bibliaStudiesActive = in_array($currentAdminPage, ['biblia-estudios-ia.php', 'biblia-estudio-ia.php'], true);
$bibliaMapsActive = $currentAdminPage === 'biblia-mapas.php';
$bibliaCharactersActive = $currentAdminPage === 'biblia-personajes.php';
$bibliaGroupActive = $bibliaMainActive || $bibliaImportActive || $bibliaStudiesActive || $bibliaMapsActive || $bibliaCharactersActive;
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
    <a class="<?php echo side_nav_active('dashboard.php'); ?>" href="dashboard.php"><span class="nav-icon">D</span> Dashboard</a>
    <a class="<?php echo side_nav_active('', 'radio', ''); ?>" href="content.php?module=radio"><span class="nav-icon">R</span> Radio en Vivo</a>
    <a class="<?php echo side_nav_active('', 'radio', 'lvj_rad_programacion'); ?>" href="content.php?module=radio&table=lvj_rad_programacion"><span class="nav-icon">P</span> Programacion</a>
    <a class="<?php echo side_nav_active('', 'capilla', ''); ?>" href="content.php?module=capilla"><span class="nav-icon">C</span> Capilla Virtual</a>
    <a class="<?php echo side_nav_active('', 'capilla', 'lvj_capillas'); ?>" href="content.php?module=capilla&table=lvj_capillas"><span class="nav-icon">Ca</span> Capillas</a>
    <a class="<?php echo side_nav_active('', 'capilla', 'lvj_capilla_streams'); ?>" href="content.php?module=capilla&table=lvj_capilla_streams"><span class="nav-icon">St</span> Streams</a>
    <a class="<?php echo $currentAdminPage === 'intenciones.php' ? 'active' : ''; ?>" href="intenciones.php"><span class="nav-icon">I</span> Intenciones de Oración</a>
    <a class="<?php echo side_nav_active('', 'liturgia'); ?>" href="content.php?module=liturgia"><span class="nav-icon">L</span> Liturgia del Dia</a>
    <a class="<?php echo side_nav_active('', 'santoral'); ?>" href="content.php?module=santoral"><span class="nav-icon">S</span> Santoral</a>
      <div class="side-nav-group<?php echo $bibliaGroupActive ? ' is-active' : ''; ?>">
        <a class="side-nav-parent <?php echo $bibliaMainActive ? 'active' : ($bibliaGroupActive ? 'section-active' : ''); ?>" href="content.php?module=biblia">
          <span class="nav-icon">B</span>
          <span>Biblia / Planes</span>
        </a>
        <div class="side-nav-submenu" aria-label="Opciones de Biblia y planes">
          <a class="<?php echo $bibliaImportActive ? 'active' : ''; ?>" href="biblia-importar.php"><span class="nav-icon">Bi</span> Importar Biblias</a>
          <a class="<?php echo $bibliaStudiesActive ? 'active' : ''; ?>" href="biblia-estudios-ia.php"><span class="nav-icon">IA</span> Estudios IA</a>
          <a class="<?php echo $bibliaMapsActive ? 'active' : ''; ?>" href="biblia-mapas.php"><span class="nav-icon">M</span> Mapas</a>
          <a class="<?php echo $bibliaCharactersActive ? 'active' : ''; ?>" href="biblia-personajes.php"><span class="nav-icon">P</span> Personajes</a>
        </div>
      </div>
    <a class="<?php echo side_nav_active('', 'oracion'); ?>" href="content.php?module=oracion"><span class="nav-icon">O</span> Rosario</a>
    <a class="<?php echo side_nav_active('', 'podcast'); ?>" href="content.php?module=podcast"><span class="nav-icon">Pc</span> Podcast</a>
    <a class="<?php echo side_files_active(); ?>" href="files.php"><span class="nav-icon">A</span> Biblioteca / Archivos</a>
    <a class="<?php echo side_nav_active('', 'economia'); ?>" href="content.php?module=economia"><span class="nav-icon">$</span> Donaciones</a>
    <a class="<?php echo side_nav_active('', 'publicidad'); ?>" href="content.php?module=publicidad"><span class="nav-icon">Ad</span> Publicidad</a>
    <a class="<?php echo side_nav_active('', 'usuarios'); ?>" href="content.php?module=usuarios"><span class="nav-icon">U</span> Usuarios y Roles</a>
    <a class="<?php echo side_nav_active('', 'configuracion'); ?>" href="content.php?module=configuracion"><span class="nav-icon">Cf</span> Configuracion</a>
  </nav>

  <div class="server-card">
    <strong>Estado del servidor</strong>
    <span class="online-dot">En linea</span>
    <div class="disk-row">
      <small>Espacio en Disco</small>
      <small>68%</small>
    </div>
    <div class="progress-track"><span style="width:68%"></span></div>
    <small>Version del Sistema v1.0.0</small>
  </div>
</aside>

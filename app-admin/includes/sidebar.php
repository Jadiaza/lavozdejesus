<?php $currentAdminPage = basename((string) ($_SERVER['SCRIPT_NAME'] ?? '')); ?>
<aside class="sidebar" data-sidebar>
  <div class="brand brand-large">
    <div class="brand-emblem">LVJ</div>
    <div>
      <strong>La Voz de Jesus</strong>
      <span>Administrador</span>
    </div>
  </div>

  <nav class="side-nav">
    <a class="<?php echo $currentAdminPage === 'dashboard.php' ? 'active' : ''; ?>" href="dashboard.php"><span class="nav-icon">D</span> Dashboard</a>
    <a href="content.php?module=radio"><span class="nav-icon">R</span> Radio en Vivo</a>
    <a href="content.php?module=radio&table=lvj_rad_programacion"><span class="nav-icon">P</span> Programacion</a>
    <a href="content.php?module=capilla"><span class="nav-icon">C</span> Capilla Virtual</a>
    <a href="content.php?module=capilla&table=lvj_com_peticiones_oracion"><span class="nav-icon">I</span> Intenciones de Oracion</a>
    <a href="content.php?module=liturgia"><span class="nav-icon">L</span> Liturgia del Dia</a>
    <a href="content.php?module=santoral"><span class="nav-icon">S</span> Santoral</a>
    <a href="content.php?module=biblia"><span class="nav-icon">B</span> Biblia / Planes</a>
    <a href="content.php?module=oracion"><span class="nav-icon">O</span> Rosario</a>
    <a href="content.php?module=podcast"><span class="nav-icon">Pc</span> Podcast</a>
    <a href="files.php"><span class="nav-icon">A</span> Biblioteca / Archivos</a>
    <a href="content.php?module=economia"><span class="nav-icon">$</span> Donaciones</a>
    <a href="content.php?module=publicidad"><span class="nav-icon">Ad</span> Publicidad</a>
    <a href="content.php?module=usuarios"><span class="nav-icon">U</span> Usuarios y Roles</a>
    <a href="content.php?module=configuracion"><span class="nav-icon">Cf</span> Configuracion</a>
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

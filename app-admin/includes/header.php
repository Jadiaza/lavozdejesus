<?php
require_once __DIR__ . '/auth.php';
$adminCssVersion = is_file(__DIR__ . '/../assets/css/admin-files.css') ? (string) filemtime(__DIR__ . '/../assets/css/admin-files.css') : '1';
?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?php echo e($pageTitle ?? 'Administrador'); ?> | La Voz de Jesus</title>
  <link rel="stylesheet" href="assets/css/admin-files.css?v=<?php echo e($adminCssVersion); ?>">
</head>
<body>
<div class="admin-shell">
  <?php require __DIR__ . '/sidebar.php'; ?>
  <main class="admin-main">
    <header class="topbar">
      <div class="topbar-title">
        <button class="menu-toggle" type="button" data-sidebar-toggle>Menu</button>
        <div>
          <h1><?php echo e($pageTitle ?? 'Dashboard'); ?></h1>
          <p><?php echo e($pageSubtitle ?? 'Bienvenido al panel de administracion'); ?></p>
        </div>
      </div>
      <div class="topbar-actions">
        <a class="site-link" href="/" target="_blank" rel="noopener">Ver Sitio Web</a>
        <div class="notification">5</div>
        <div class="topbar-user">
          <span><?php echo e(current_user()['name'] ?? 'Administrador'); ?></span>
          <small><?php echo e(current_user()['role'] ?? 'Super Admin'); ?></small>
          <a class="logout-link" href="logout.php">Cerrar sesion</a>
        </div>
      </div>
    </header>
    <?php if (defined('LVJ_FILES_INSTALL_ERROR')): ?>
      <div class="alert alert-error"><?php echo e(LVJ_FILES_INSTALL_ERROR); ?></div>
    <?php endif; ?>

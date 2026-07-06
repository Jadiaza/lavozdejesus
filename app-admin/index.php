<?php

require_once __DIR__ . '/includes/auth.php';

if (current_user()) {
  redirect_to('dashboard.php');
}

$error = '';
$adminCssVersion = is_file(__DIR__ . '/assets/css/admin-files.css') ? (string) filemtime(__DIR__ . '/assets/css/admin-files.css') : '1';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf();
  $email = trim((string) ($_POST['email'] ?? ''));
  $password = (string) ($_POST['password'] ?? '');

  if (attempt_login($email, $password)) {
    redirect_to('dashboard.php');
  }

  $error = 'Credenciales invalidas.';
}
?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login | Admin Archivos</title>
  <link rel="stylesheet" href="assets/css/admin-files.css?v=<?php echo e($adminCssVersion); ?>">
</head>
<body class="login-page">
  <form class="login-card" method="post">
    <?php echo csrf_field(); ?>
    <div class="login-logo">LVJ</div>
    <h1>La Voz de Jesus</h1>
    <p>Administrador de archivos</p>

    <?php if (defined('LVJ_FILES_INSTALL_ERROR')): ?>
      <div class="alert alert-error"><?php echo e(LVJ_FILES_INSTALL_ERROR); ?></div>
    <?php endif; ?>

    <?php if ($error): ?>
      <div class="alert alert-error"><?php echo e($error); ?></div>
    <?php endif; ?>

    <label>Email</label>
    <input type="email" name="email" required autocomplete="email" value="admin@lavozdejesus.co">

    <label>Contrasena</label>
    <input type="password" name="password" required autocomplete="current-password">

    <button type="submit">Ingresar</button>
  </form>
</body>
</html>

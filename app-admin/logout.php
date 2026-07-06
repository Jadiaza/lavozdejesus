<?php

require_once __DIR__ . '/includes/functions.php';

log_activity('logout', 'user', current_user()['id'] ?? null, 'Cierre de sesion');
unset($_SESSION['file_admin_user']);
redirect_to('index.php');

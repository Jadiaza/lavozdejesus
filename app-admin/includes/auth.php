<?php

declare(strict_types=1);

require_once __DIR__ . '/functions.php';

function require_login(): void
{
  if (!current_user()) {
    redirect_to('index.php');
  }
}

function attempt_login(string $email, string $password): bool
{
  $stmt = lvj_files_db()->prepare("
    SELECT id, email, password_hash, name, role
    FROM lvj_file_users
    WHERE email = :email AND status = 1
    LIMIT 1
  ");
  $stmt->execute(['email' => $email]);
  $user = $stmt->fetch();

  if (!$user || !password_verify($password, $user['password_hash'])) {
    return false;
  }

  unset($user['password_hash']);
  $_SESSION['file_admin_user'] = $user;

  $update = lvj_files_db()->prepare("UPDATE lvj_file_users SET last_login = NOW() WHERE id = :id");
  $update->execute(['id' => $user['id']]);

  log_activity('login', 'user', (int) $user['id'], 'Inicio de sesion');
  return true;
}

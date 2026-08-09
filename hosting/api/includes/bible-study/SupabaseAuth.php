<?php
declare(strict_types=1);

final class SupabaseAuth
{
  public static function requireUser(PDO $pdo): array
  {
    $header = self::authorizationHeader();
    if (!preg_match('/^Bearer\s+(.+)$/i', $header, $match)) {
      lvj_json_response(['success' => false, 'message' => 'Inicia sesión para solicitar un estudio bíblico.'], 401);
    }
    $url = rtrim((string) lvj_setting('SUPABASE_URL'), '/');
    $anon = trim((string) lvj_setting('SUPABASE_ANON_KEY'));
    if ($url === '' || $anon === '') lvj_json_response(['success' => false, 'message' => 'El acceso de usuarios no está configurado.'], 503);
    $curl = curl_init($url . '/auth/v1/user');
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => [
      'apikey: ' . $anon, 'Authorization: Bearer ' . $match[1], 'Accept: application/json',
    ], CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 15]);
    $raw = curl_exec($curl); $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE); curl_close($curl);
    $identity = json_decode(is_string($raw) ? $raw : '', true);
    if ($status !== 200 || !is_array($identity) || empty($identity['id'])) {
      lvj_json_response(['success' => false, 'message' => 'Tu sesión no es válida o ha expirado.'], 401);
    }
    $email = mb_strtolower(trim((string) ($identity['email'] ?? '')));
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($identity['email_confirmed_at'])) {
      lvj_json_response(['success' => false, 'message' => 'Debes confirmar un correo electrónico válido.'], 403);
    }
    if (!self::isAllowedEmail($email)) {
      lvj_json_response(['success' => false, 'message' => 'Este proveedor de correo no está habilitado para los estudios bíblicos.'], 403);
    }
    $user = self::resolveLocalUser($pdo, $identity);
    if (!$user) lvj_json_response(['success' => false, 'message' => 'No fue posible vincular tu cuenta con La Voz de Jesús.'], 403);
    if (array_key_exists('estado', $user) && (int) $user['estado'] !== 1) {
      lvj_json_response(['success' => false, 'message' => 'Tu cuenta no está activa.'], 403);
    }
    if (array_key_exists('ia_autorizado', $user) && (int) $user['ia_autorizado'] !== 1) {
      lvj_json_response(['success' => false, 'message' => 'Tu cuenta no tiene autorización para realizar consultas de IA.'], 403);
    }
    return $user;
  }

  public static function hasCredentials(): bool
  {
    return self::authorizationHeader() !== '';
  }

  private static function authorizationHeader(): string
  {
    foreach ([
      'HTTP_AUTHORIZATION',
      'REDIRECT_HTTP_AUTHORIZATION',
      'HTTP_X_LVJ_AUTHORIZATION',
    ] as $key) {
      $value = trim((string) ($_SERVER[$key] ?? ''));
      if ($value !== '') return $value;
    }

    if (function_exists('getallheaders')) {
      $headers = getallheaders();
      if (is_array($headers)) {
        foreach (['Authorization', 'authorization', 'X-LVJ-Authorization', 'x-lvj-authorization'] as $key) {
          $value = trim((string) ($headers[$key] ?? ''));
          if ($value !== '') return $value;
        }
      }
    }

    return '';
  }

  private static function isAllowedEmail(string $email): bool
  {
    $domain = mb_strtolower((string) substr(strrchr($email, '@') ?: '', 1));
    $configured = trim((string) lvj_setting('AUTH_ALLOWED_EMAIL_DOMAINS', ''));
    $defaults = 'gmail.com,googlemail.com,hotmail.com,hotmail.es,outlook.com,outlook.es,live.com,live.com.co,msn.com,yahoo.com,yahoo.es,icloud.com,me.com,proton.me,protonmail.com,aol.com';
    $allowed = array_filter(array_map(static function ($value) {
      return mb_strtolower(trim($value));
    }, explode(',', $configured !== '' ? $configured : $defaults)));
    return $domain !== '' && in_array($domain, $allowed, true);
  }

  private static function resolveLocalUser(PDO $pdo, array $identity): ?array
  {
    $columns = array_column($pdo->query('SHOW COLUMNS FROM lvj_com_usuarios')->fetchAll(), 'Field');
    $subject = (string) $identity['id']; $email = mb_strtolower((string) ($identity['email'] ?? ''));
    $emailColumn = in_array('correo', $columns, true) ? 'correo' : (in_array('email', $columns, true) ? 'email' : '');
    if (in_array('auth_subject', $columns, true)) {
      $row = lvj_first($pdo, 'SELECT * FROM lvj_com_usuarios WHERE auth_subject = :subject AND deleted_at IS NULL LIMIT 1', ['subject' => $subject]);
      if ($row) return self::refreshLocalUser($pdo, $row, $identity, $columns, $emailColumn);
    }
    if ($emailColumn !== '' && $email !== '') {
      $row = lvj_first($pdo, "SELECT * FROM lvj_com_usuarios WHERE {$emailColumn} = :email AND deleted_at IS NULL LIMIT 1", ['email' => $email]);
      if ($row) {
        if (in_array('auth_subject', $columns, true)) {
          $pdo->prepare('UPDATE lvj_com_usuarios SET auth_subject = :subject, auth_provider = :provider WHERE id = :id')
            ->execute(['subject' => $subject, 'provider' => 'supabase', 'id' => $row['id']]);
        }
        return self::refreshLocalUser($pdo, $row, $identity, $columns, $emailColumn);
      }
    }
    $values = [];
    if ($emailColumn !== '') $values[$emailColumn] = $email;
    if (in_array('auth_subject', $columns, true)) $values['auth_subject'] = $subject;
    if (in_array('auth_provider', $columns, true)) $values['auth_provider'] = 'supabase';
    if (in_array('nombre', $columns, true)) $values['nombre'] = (string) ($identity['user_metadata']['full_name'] ?? 'Usuario LVJ');
    if (in_array('estado', $columns, true)) $values['estado'] = 1;
    if (in_array('email_verificado', $columns, true)) $values['email_verificado'] = 1;
    if (in_array('ia_autorizado', $columns, true)) $values['ia_autorizado'] = 1;
    if (in_array('ultimo_acceso_at', $columns, true)) $values['ultimo_acceso_at'] = gmdate('Y-m-d H:i:s');
    if (!$values) return null;
    try {
      $names = array_keys($values); $params = array_map(static function ($name) { return ':' . $name; }, $names);
      $pdo->prepare('INSERT INTO lvj_com_usuarios (`' . implode('`,`', $names) . '`) VALUES (' . implode(',', $params) . ')')->execute($values);
      return lvj_first($pdo, 'SELECT * FROM lvj_com_usuarios WHERE id = :id LIMIT 1', ['id' => (int) $pdo->lastInsertId()]);
    } catch (Throwable $error) {
      error_log('LVJ Supabase user sync: ' . $error->getMessage()); return null;
    }
  }

  private static function refreshLocalUser(PDO $pdo, array $user, array $identity, array $columns, string $emailColumn): array
  {
    $updates = [];
    if ($emailColumn !== '') $updates[$emailColumn] = mb_strtolower((string) ($identity['email'] ?? ''));
    if (in_array('email_verificado', $columns, true)) $updates['email_verificado'] = 1;
    if (in_array('ultimo_acceso_at', $columns, true)) $updates['ultimo_acceso_at'] = gmdate('Y-m-d H:i:s');
    if ($updates) {
      $assignments = array_map(static function ($name) { return '`' . $name . '` = :' . $name; }, array_keys($updates));
      $updates['id'] = (int) $user['id'];
      $pdo->prepare('UPDATE lvj_com_usuarios SET ' . implode(', ', $assignments) . ' WHERE id = :id')->execute($updates);
      $fresh = lvj_first($pdo, 'SELECT * FROM lvj_com_usuarios WHERE id = :id LIMIT 1', ['id' => (int) $user['id']]);
      if ($fresh) return $fresh;
    }
    return $user;
  }
}

<?php
declare(strict_types=1);

final class SupabaseAuth
{
  public static function requireUser(PDO $pdo): array
  {
    $header = (string) ($_SERVER['HTTP_AUTHORIZATION'] ?? '');
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
    $user = self::resolveLocalUser($pdo, $identity);
    if (!$user) lvj_json_response(['success' => false, 'message' => 'No fue posible vincular tu cuenta con La Voz de Jesús.'], 403);
    return $user;
  }

  private static function resolveLocalUser(PDO $pdo, array $identity): ?array
  {
    $columns = array_column($pdo->query('SHOW COLUMNS FROM lvj_com_usuarios')->fetchAll(), 'Field');
    $subject = (string) $identity['id']; $email = mb_strtolower((string) ($identity['email'] ?? ''));
    if (in_array('auth_subject', $columns, true)) {
      $row = lvj_first($pdo, 'SELECT * FROM lvj_com_usuarios WHERE auth_subject = :subject AND deleted_at IS NULL LIMIT 1', ['subject' => $subject]);
      if ($row) return $row;
    }
    $emailColumn = in_array('correo', $columns, true) ? 'correo' : (in_array('email', $columns, true) ? 'email' : '');
    if ($emailColumn !== '' && $email !== '') {
      $row = lvj_first($pdo, "SELECT * FROM lvj_com_usuarios WHERE {$emailColumn} = :email AND deleted_at IS NULL LIMIT 1", ['email' => $email]);
      if ($row) {
        if (in_array('auth_subject', $columns, true)) {
          $pdo->prepare('UPDATE lvj_com_usuarios SET auth_subject = :subject, auth_provider = :provider WHERE id = :id')
            ->execute(['subject' => $subject, 'provider' => 'supabase', 'id' => $row['id']]);
        }
        return $row;
      }
    }
    $values = [];
    if ($emailColumn !== '') $values[$emailColumn] = $email;
    if (in_array('auth_subject', $columns, true)) $values['auth_subject'] = $subject;
    if (in_array('auth_provider', $columns, true)) $values['auth_provider'] = 'supabase';
    if (in_array('nombre', $columns, true)) $values['nombre'] = (string) ($identity['user_metadata']['full_name'] ?? 'Usuario LVJ');
    if (in_array('estado', $columns, true)) $values['estado'] = 1;
    if (!$values) return null;
    try {
      $names = array_keys($values); $params = array_map(static function ($name) { return ':' . $name; }, $names);
      $pdo->prepare('INSERT INTO lvj_com_usuarios (`' . implode('`,`', $names) . '`) VALUES (' . implode(',', $params) . ')')->execute($values);
      return lvj_first($pdo, 'SELECT * FROM lvj_com_usuarios WHERE id = :id LIMIT 1', ['id' => (int) $pdo->lastInsertId()]);
    } catch (Throwable $error) {
      error_log('LVJ Supabase user sync: ' . $error->getMessage()); return null;
    }
  }
}

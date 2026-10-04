<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/includes/bible-study/SupabaseAuth.php';
if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
  header('Access-Control-Allow-Methods: GET, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, Authorization, X-LVJ-Authorization');
  lvj_json_response(['success' => true]);
}
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$pdo = lvj_db();
$user = SupabaseAuth::requireAccount($pdo);

$roleId = array_key_exists('rol_id', $user) ? (int) $user['rol_id'] : null;
$roleCode = '';
$roleName = '';

if ($roleId) {
  try {
    $roleColumns = array_column($pdo->query('SHOW COLUMNS FROM lvj_adm_roles')->fetchAll(), 'Field');
    if ($roleColumns && in_array('id', $roleColumns, true)) {
      $select = ['id'];
      foreach (['codigo', 'slug', 'nombre', 'name'] as $field) { if (in_array($field, $roleColumns, true)) $select[] = $field; }
      $row = lvj_first($pdo, 'SELECT ' . implode(',', array_map(static fn($f) => '`'.$f.'`', $select)) . ' FROM lvj_adm_roles WHERE id = :id LIMIT 1', ['id' => $roleId]);
      if ($row) {
        $roleCode = mb_strtolower(trim((string)($row['codigo'] ?? $row['slug'] ?? '')));
        $roleName = trim((string)($row['nombre'] ?? $row['name'] ?? ''));
      }
    }
  } catch (Throwable $error) { error_log('LVJ access role lookup: ' . $error->getMessage()); }
}

$roleKey = mb_strtolower(trim($roleCode . ' ' . $roleName));
$isSuperAdmin = str_contains($roleKey, 'super_admin') || str_contains($roleKey, 'super admin');
$isAdmin = $isSuperAdmin || str_contains($roleKey, 'admin');
$isPremium = false;
$accessLevel = $isSuperAdmin ? 'super_admin' : ($isAdmin ? 'admin' : ($isPremium ? 'premium' : 'free'));

lvj_json_response([
  'success' => true,
  'authenticated' => true,
  'user' => [
    'id' => (int)($user['id'] ?? 0),
    'email' => (string)($user['correo'] ?? $user['email'] ?? ''),
    'name' => (string)($user['nombre'] ?? ''),
    'email_verified' => (int)($user['email_verificado'] ?? 0) === 1,
    'active' => in_array(mb_strtolower(trim((string)($user['estado'] ?? 'activo'))), ['1','activo','active','habilitado'], true),
    'role_id' => $roleId,
    'role_code' => $roleCode,
  ],
  'access' => [
    'level' => $accessLevel,
    'premium' => $isPremium,
    'admin' => $isAdmin,
    'super_admin' => $isSuperAdmin,
  ],
]);

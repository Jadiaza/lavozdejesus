<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$pdo = lvj_db();

function audience_header(string $name): string
{
  foreach (['HTTP_' . strtoupper(str_replace('-', '_', $name)), 'REDIRECT_HTTP_' . strtoupper(str_replace('-', '_', $name))] as $key) {
    $value = trim((string) ($_SERVER[$key] ?? ''));
    if ($value !== '') return $value;
  }
  if (function_exists('getallheaders')) {
    $headers = getallheaders();
    if (is_array($headers)) {
      foreach ($headers as $key => $value) {
        if (strcasecmp((string) $key, $name) === 0) return trim((string) $value);
      }
    }
  }
  return '';
}

function audience_json(array $data, int $status = 200): never
{
  lvj_json_response($data, $status);
}

function audience_token_hash(string $token): string
{
  return hash('sha256', $token);
}

function audience_client_ip(): string
{
  $ip = trim((string) ($_SERVER['REMOTE_ADDR'] ?? ''));
  if ($ip === '') return '';
  return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '';
}

function audience_ip_hash(string $ip): string
{
  if ($ip === '') return '';
  $salt = trim((string) lvj_setting('RADIO_AUDIENCE_IP_SALT', ''));
  if ($salt === '') {
    $salt = trim((string) getenv('RADIO_AUDIENCE_IP_SALT'));
  }
  if ($salt === '') {
    $salt = 'lvj-radio-audience-change-this-salt';
  }
  return hash('sha256', $salt . '|' . $ip);
}

function audience_user_agent(): string
{
  return substr(trim((string) ($_SERVER['HTTP_USER_AGENT'] ?? '')), 0, 500);
}

function audience_device(string $ua): string
{
  $value = strtolower($ua);
  if (preg_match('/ipad|tablet|android(?!.*mobile)/i', $value)) return 'Tablet';
  if (preg_match('/mobile|iphone|ipod|windows phone/i', $value)) return 'Móvil';
  return 'Escritorio';
}

function audience_os(string $ua): string
{
  $patterns = [
    '/windows nt 10/i' => 'Windows',
    '/windows nt/i' => 'Windows',
    '/android/i' => 'Android',
    '/iphone|ipad|ipod/i' => 'iOS',
    '/mac os x/i' => 'macOS',
    '/linux/i' => 'Linux',
  ];
  foreach ($patterns as $pattern => $name) {
    if (preg_match($pattern, $ua)) return $name;
  }
  return 'Otro';
}

function audience_browser(string $ua): string
{
  $patterns = [
    '/edg\//i' => 'Edge',
    '/opr\//i' => 'Opera',
    '/chrome\//i' => 'Chrome',
    '/firefox\//i' => 'Firefox',
    '/safari\//i' => 'Safari',
  ];
  foreach ($patterns as $pattern => $name) {
    if (preg_match($pattern, $ua)) return $name;
  }
  return 'Otro';
}

function audience_location(): array
{
  return [
    'pais' => substr(trim((string) ($_SERVER['HTTP_CF_IPCOUNTRY'] ?? $_SERVER['GEOIP_COUNTRY_CODE'] ?? '')), 0, 100),
    'region' => substr(trim((string) ($_SERVER['HTTP_CF_REGION'] ?? '')), 0, 120),
    'ciudad' => substr(trim((string) ($_SERVER['HTTP_CF_IPCITY'] ?? '')), 0, 120),
  ];
}

function audience_optional_user(PDO $pdo): ?array
{
  $header = audience_header('Authorization');
  if (!preg_match('/^Bearer\s+(.+)$/i', $header)) return null;

  require_once __DIR__ . '/includes/bible-study/SupabaseAuth.php';
  try {
    return SupabaseAuth::requireAccount($pdo);
  } catch (Throwable $error) {
    return null;
  }
}

function audience_stream(PDO $pdo, int $streamId = 0): ?array
{
  try {
    if ($streamId > 0) {
      $stmt = $pdo->prepare('SELECT * FROM lvj_rad_streams WHERE id = :id LIMIT 1');
      $stmt->execute(['id' => $streamId]);
      $row = $stmt->fetch();
      if ($row) return $row;
    }
    return lvj_first($pdo, 'SELECT * FROM lvj_rad_streams ORDER BY id ASC LIMIT 1');
  } catch (Throwable $error) {
    return null;
  }
}

$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
$action = trim((string) ($_GET['action'] ?? $_POST['action'] ?? ''));
$token = trim((string) ($_POST['session_token'] ?? $_GET['session_token'] ?? ''));
$hash = $token !== '' ? audience_token_hash($token) : '';
$now = gmdate('Y-m-d H:i:s');

try {
  if ($method === 'POST' && $action === 'start') {
    $user = audience_optional_user($pdo);
    $ua = audience_user_agent();
    $location = audience_location();
    $streamId = (int) ($_POST['stream_id'] ?? 0);
    $stream = audience_stream($pdo, $streamId);
    $token = bin2hex(random_bytes(32));
    $hash = audience_token_hash($token);

    $stmt = $pdo->prepare('
      INSERT INTO lvj_rad_sesiones
      (usuario_id, session_token_hash, stream_id, stream_nombre, inicio_at, ultima_actividad_at,
       tipo_oyente, dispositivo, sistema_operativo, navegador, pais, region, ciudad, ip_hash, user_agent, estado)
      VALUES
      (:usuario_id, :token, :stream_id, :stream_nombre, :inicio, :actividad,
       :tipo, :dispositivo, :sistema, :navegador, :pais, :region, :ciudad, :ip_hash, :ua, "activo")
    ');
    $stmt->execute([
      'usuario_id' => $user ? (int) $user['id'] : null,
      'token' => $hash,
      'stream_id' => $stream ? (int) ($stream['id'] ?? 0) : null,
      'stream_nombre' => $stream ? substr((string) ($stream['nombre'] ?? $stream['titulo'] ?? 'La Voz de Jesús'), 0, 180) : 'La Voz de Jesús',
      'inicio' => $now,
      'actividad' => $now,
      'tipo' => $user ? 'registrado' : 'invitado',
      'dispositivo' => audience_device($ua),
      'sistema' => audience_os($ua),
      'navegador' => audience_browser($ua),
      'pais' => $location['pais'],
      'region' => $location['region'],
      'ciudad' => $location['ciudad'],
      'ip_hash' => audience_ip_hash(audience_client_ip()),
      'ua' => $ua,
    ]);
    $sessionId = (int) $pdo->lastInsertId();

    $event = $pdo->prepare('INSERT INTO lvj_rad_eventos_audiencia (sesion_id, evento, fecha_at, metadata_json) VALUES (:sesion, "play", :fecha, :metadata)');
    $event->execute([
      'sesion' => $sessionId,
      'fecha' => $now,
      'metadata' => json_encode(['tipo_oyente' => $user ? 'registrado' : 'invitado'], JSON_UNESCAPED_UNICODE),
    ]);

    audience_json([
      'success' => true,
      'session_id' => $sessionId,
      'session_token' => $token,
      'tipo_oyente' => $user ? 'registrado' : 'invitado',
    ]);
  }

  if ($method === 'POST' && $action === 'heartbeat') {
    if ($hash === '') audience_json(['success' => false, 'message' => 'Sesión no válida.'], 400);

    $stmt = $pdo->prepare('SELECT id FROM lvj_rad_sesiones WHERE session_token_hash = :token LIMIT 1');
    $stmt->execute(['token' => $hash]);
    $sessionId = (int) ($stmt->fetchColumn() ?: 0);
    if ($sessionId <= 0) audience_json(['success' => false, 'message' => 'Sesión no encontrada.'], 404);

    $stmt = $pdo->prepare('UPDATE lvj_rad_sesiones SET ultima_actividad_at = :fecha, estado = "activo" WHERE id = :id LIMIT 1');
    $stmt->execute(['fecha' => $now, 'id' => $sessionId]);

    audience_json(['success' => true, 'session_id' => $sessionId]);
  }

  if ($method === 'POST' && $action === 'pause') {
    if ($hash === '') audience_json(['success' => false, 'message' => 'Sesión no válida.'], 400);

    $stmt = $pdo->prepare('SELECT id, inicio_at FROM lvj_rad_sesiones WHERE session_token_hash = :token LIMIT 1');
    $stmt->execute(['token' => $hash]);
    $row = $stmt->fetch();
    if (!$row) audience_json(['success' => false, 'message' => 'Sesión no encontrada.'], 404);

    $stmt = $pdo->prepare('UPDATE lvj_rad_sesiones SET ultima_actividad_at = :fecha, estado = "pausado", duracion_segundos = TIMESTAMPDIFF(SECOND, inicio_at, :fecha) WHERE id = :id LIMIT 1');
    $stmt->execute(['fecha' => $now, 'id' => (int) $row['id']]);

    $event = $pdo->prepare('INSERT INTO lvj_rad_eventos_audiencia (sesion_id, evento, fecha_at) VALUES (:sesion, "pause", :fecha)');
    $event->execute(['sesion' => (int) $row['id'], 'fecha' => $now]);

    audience_json(['success' => true]);
  }

  if ($method === 'POST' && $action === 'stop') {
    if ($hash === '') audience_json(['success' => false, 'message' => 'Sesión no válida.'], 400);

    $stmt = $pdo->prepare('SELECT id, inicio_at FROM lvj_rad_sesiones WHERE session_token_hash = :token LIMIT 1');
    $stmt->execute(['token' => $hash]);
    $row = $stmt->fetch();
    if (!$row) audience_json(['success' => false, 'message' => 'Sesión no encontrada.'], 404);

    $stmt = $pdo->prepare('UPDATE lvj_rad_sesiones SET ultima_actividad_at = :fecha, fin_at = :fecha, estado = "finalizado", duracion_segundos = TIMESTAMPDIFF(SECOND, inicio_at, :fecha) WHERE id = :id LIMIT 1');
    $stmt->execute(['fecha' => $now, 'id' => (int) $row['id']]);

    $event = $pdo->prepare('INSERT INTO lvj_rad_eventos_audiencia (sesion_id, evento, fecha_at) VALUES (:sesion, "stop", :fecha)');
    $event->execute(['sesion' => (int) $row['id'], 'fecha' => $now]);

    audience_json(['success' => true]);
  }

  if ($method === 'GET' && $action === 'summary') {
    $minutes = max(1, min(10, (int) ($_GET['minutes'] ?? 2)));
    $since = gmdate('Y-m-d H:i:s', time() - ($minutes * 60));
    $fromInput = trim((string) ($_GET['from'] ?? ''));
    $toInput = trim((string) ($_GET['to'] ?? ''));
    $from = preg_match('/^\\d{4}-\\d{2}-\\d{2}$/', $fromInput) ? $fromInput . ' 00:00:00' : gmdate('Y-m-d 00:00:00');
    $to = preg_match('/^\\d{4}-\\d{2}-\\d{2}$/', $toInput) ? $toInput . ' 23:59:59' : gmdate('Y-m-d 23:59:59');

    $connectedStmt = $pdo->prepare("SELECT COUNT(*) FROM lvj_rad_sesiones WHERE estado IN ('activo','pausado') AND ultima_actividad_at >= :since");
    $connectedStmt->execute(['since' => $since]);
    $connected = (int) $connectedStmt->fetchColumn();

    $uniqueStmt = $pdo->prepare("SELECT COUNT(DISTINCT COALESCE(CAST(usuario_id AS CHAR), session_token_hash)) FROM lvj_rad_sesiones WHERE inicio_at BETWEEN :from AND :to");
    $uniqueStmt->execute(['from' => $from, 'to' => $to]);
    $uniqueToday = (int) $uniqueStmt->fetchColumn();

    $sessionsStmt = $pdo->prepare("SELECT COUNT(*) FROM lvj_rad_sesiones WHERE inicio_at BETWEEN :from AND :to");
    $sessionsStmt->execute(['from' => $from, 'to' => $to]);
    $sessionsToday = (int) $sessionsStmt->fetchColumn();

    $registeredStmt = $pdo->prepare("SELECT COUNT(DISTINCT usuario_id) FROM lvj_rad_sesiones WHERE usuario_id IS NOT NULL AND inicio_at BETWEEN :from AND :to");
    $registeredStmt->execute(['from' => $from, 'to' => $to]);
    $registeredUnique = (int) $registeredStmt->fetchColumn();

    $guestStmt = $pdo->prepare("SELECT COUNT(DISTINCT session_token_hash) FROM lvj_rad_sesiones WHERE usuario_id IS NULL AND inicio_at BETWEEN :from AND :to");
    $guestStmt->execute(['from' => $from, 'to' => $to]);
    $guestUnique = (int) $guestStmt->fetchColumn();

    $avgStmt = $pdo->prepare("SELECT COALESCE(AVG(NULLIF(duracion_segundos,0)),0) FROM lvj_rad_sesiones WHERE inicio_at BETWEEN :from AND :to");
    $avgStmt->execute(['from' => $from, 'to' => $to]);
    $avgDuration = (float) ($avgStmt->fetchColumn() ?: 0);

    $countriesStmt = $pdo->prepare("SELECT COUNT(DISTINCT NULLIF(pais,'')) FROM lvj_rad_sesiones WHERE inicio_at BETWEEN :from AND :to");
    $countriesStmt->execute(['from' => $from, 'to' => $to]);
    $countries = (int) $countriesStmt->fetchColumn();

    $countriesStmt = $pdo->prepare("SELECT COALESCE(NULLIF(pais,''),'Desconocido') pais, COUNT(DISTINCT COALESCE(CAST(usuario_id AS CHAR), session_token_hash)) oyentes FROM lvj_rad_sesiones WHERE inicio_at BETWEEN :from AND :to GROUP BY pais ORDER BY oyentes DESC LIMIT 20");
    $countriesStmt->execute(['from' => $from, 'to' => $to]);
    $countriesRows = $countriesStmt->fetchAll();

    $citiesStmt = $pdo->prepare("SELECT COALESCE(NULLIF(ciudad,''),'Desconocida') ciudad, COALESCE(NULLIF(pais,''),'') pais, COUNT(DISTINCT COALESCE(CAST(usuario_id AS CHAR), session_token_hash)) oyentes FROM lvj_rad_sesiones WHERE inicio_at BETWEEN :from AND :to GROUP BY ciudad, pais ORDER BY oyentes DESC LIMIT 20");
    $citiesStmt->execute(['from' => $from, 'to' => $to]);
    $citiesRows = $citiesStmt->fetchAll();

    $hourly = array_fill(0, 24, 0);
    $hourStmt = $pdo->prepare("SELECT HOUR(inicio_at) hora, COUNT(*) sesiones FROM lvj_rad_sesiones WHERE inicio_at BETWEEN :from AND :to GROUP BY HOUR(inicio_at)");
    $hourStmt->execute(['from' => $from, 'to' => $to]);
    foreach ($hourStmt->fetchAll() as $row) $hourly[(int) $row['hora']] = (int) $row['sesiones'];

    audience_json([
      'success' => true,
      'connected' => $connected,
      'unique_today' => $uniqueToday,
      'registered_unique' => $registeredUnique,
      'guest_unique' => $guestUnique,
      'sessions_today' => $sessionsToday,
      'avg_duration_minutes' => round($avgDuration / 60, 1),
      'countries_count' => $countries,
      'countries' => $countriesRows,
      'cities' => $citiesRows,
      'hourly' => $hourly,
    ]);
  }

  if ($method === 'GET' && $action === 'sessions') {
    $limit = max(1, min(200, (int) ($_GET['limit'] ?? 50)));
    $fromInput = trim((string) ($_GET['from'] ?? ''));
    $toInput = trim((string) ($_GET['to'] ?? ''));
    $conditions = [];
    $params = [];
    if (preg_match('/^\\d{4}-\\d{2}-\\d{2}$/', $fromInput)) {
      $conditions[] = 's.inicio_at >= :from';
      $params['from'] = $fromInput . ' 00:00:00';
    }
    if (preg_match('/^\\d{4}-\\d{2}-\\d{2}$/', $toInput)) {
      $conditions[] = 's.inicio_at <= :to';
      $params['to'] = $toInput . ' 23:59:59';
    }
    $where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';
    $stmt = $pdo->prepare('
      SELECT s.*, u.nombre AS usuario_nombre
      FROM lvj_rad_sesiones s
      LEFT JOIN lvj_com_usuarios u ON u.id = s.usuario_id
      ' . $where . '
      ORDER BY s.inicio_at DESC
      LIMIT ' . $limit
    );
    $stmt->execute($params);
    audience_json(['success' => true, 'sessions' => $stmt->fetchAll()]);
  }

  if ($method === 'GET' && $action === 'session') {
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) audience_json(['success' => false, 'message' => 'Sesión no válida.'], 400);

    $stmt = $pdo->prepare('
      SELECT s.*, u.nombre AS usuario_nombre, u.correo AS usuario_correo
      FROM lvj_rad_sesiones s
      LEFT JOIN lvj_com_usuarios u ON u.id = s.usuario_id
      WHERE s.id = :id LIMIT 1
    ');
    $stmt->execute(['id' => $id]);
    $session = $stmt->fetch();
    if (!$session) audience_json(['success' => false, 'message' => 'Sesión no encontrada.'], 404);

    $events = $pdo->prepare('SELECT * FROM lvj_rad_eventos_audiencia WHERE sesion_id = :id ORDER BY fecha_at ASC, id ASC');
    $events->execute(['id' => $id]);

    audience_json(['success' => true, 'session' => $session, 'events' => $events->fetchAll()]);
  }

  audience_json(['success' => false, 'message' => 'Acción no soportada.'], 400);
} catch (Throwable $error) {
  audience_json([
    'success' => false,
    'error' => 'RADIO_AUDIENCE_QUERY_FAILED',
    'detail' => $error->getMessage(),
  ], 500);
}
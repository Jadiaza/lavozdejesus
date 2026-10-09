<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

$pdo = lvj_db();

function audience_cors(): void
{
  $origin = trim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''));
  $allowed = [
    'https://lavozdejesus.co',
    'https://www.lavozdejesus.co',
    'https://lavozdejesus.vercel.app',
    'https://lvjprayer.vercel.app',
    'http://localhost:3000',
    'http://localhost:8080',
  ];

  if ($origin !== '' && in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
  }

  header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, Authorization, X-LVJ-Authorization');
  header('Access-Control-Max-Age: 86400');
}

audience_cors();

if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) === 'OPTIONS') {
  http_response_code(204);
  exit;
}

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

function audience_location_from_headers(): array
{
  $latitude = trim((string) (
    $_SERVER['HTTP_CF_IPLATITUDE']
    ?? $_SERVER['GEOIP_LATITUDE']
    ?? $_SERVER['HTTP_X_GEOIP_LATITUDE']
    ?? ''
  ));
  $longitude = trim((string) (
    $_SERVER['HTTP_CF_IPLONGITUDE']
    ?? $_SERVER['GEOIP_LONGITUDE']
    ?? $_SERVER['HTTP_X_GEOIP_LONGITUDE']
    ?? ''
  ));

  $lat = is_numeric($latitude) ? (float) $latitude : null;
  $lon = is_numeric($longitude) ? (float) $longitude : null;
  if ($lat !== null && ($lat < -90 || $lat > 90)) $lat = null;
  if ($lon !== null && ($lon < -180 || $lon > 180)) $lon = null;

  return [
    'pais' => substr(trim((string) ($_SERVER['HTTP_CF_IPCOUNTRY'] ?? $_SERVER['GEOIP_COUNTRY_CODE'] ?? '')), 0, 100),
    'region' => substr(trim((string) ($_SERVER['HTTP_CF_REGION'] ?? '')), 0, 120),
    'ciudad' => substr(trim((string) ($_SERVER['HTTP_CF_IPCITY'] ?? '')), 0, 120),
    'latitud' => $lat,
    'longitud' => $lon,
  ];
}

function audience_location_complete(array $location): bool
{
  return trim((string) ($location['pais'] ?? '')) !== ''
    && trim((string) ($location['ciudad'] ?? '')) !== ''
    && $location['latitud'] !== null
    && $location['longitud'] !== null;
}

function audience_external_location(string $ip): array
{
  $empty = [
    'pais' => '',
    'region' => '',
    'ciudad' => '',
    'latitud' => null,
    'longitud' => null,
  ];

  if ($ip === '' || !filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
    return $empty;
  }

  if (!function_exists('curl_init')) return $empty;

  $url = 'https://ipapi.co/' . rawurlencode($ip) . '/json/';
  $ch = curl_init($url);
  if ($ch === false) return $empty;

  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_TIMEOUT => 3,
    CURLOPT_CONNECTTIMEOUT => 2,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_USERAGENT => 'LVJ-Radio-Audience/1.0',
  ]);

  $body = curl_exec($ch);
  $errno = curl_errno($ch);
  $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  if ($errno !== 0 || $httpCode !== 200 || !is_string($body) || $body === '') return $empty;

  $data = json_decode($body, true);
  if (!is_array($data) || !empty($data['error'])) return $empty;

  $lat = isset($data['latitude']) && is_numeric($data['latitude']) ? (float) $data['latitude'] : null;
  $lon = isset($data['longitude']) && is_numeric($data['longitude']) ? (float) $data['longitude'] : null;
  if ($lat !== null && ($lat < -90 || $lat > 90)) $lat = null;
  if ($lon !== null && ($lon < -180 || $lon > 180)) $lon = null;

  return [
    'pais' => substr(trim((string) ($data['country_code'] ?? $data['country'] ?? '')), 0, 100),
    'region' => substr(trim((string) ($data['region'] ?? '')), 0, 120),
    'ciudad' => substr(trim((string) ($data['city'] ?? '')), 0, 120),
    'latitud' => $lat,
    'longitud' => $lon,
  ];
}

function audience_location(PDO $pdo, string $ip): array
{
  $location = audience_location_from_headers();
  if (audience_location_complete($location)) return $location;

  $ipHash = audience_ip_hash($ip);
  if ($ipHash !== '') {
    try {
      $stmt = $pdo->prepare('
        SELECT pais, region, ciudad, latitud, longitud
        FROM lvj_rad_sesiones
        WHERE ip_hash = :ip_hash
          AND (ciudad <> "" OR pais <> "")
          AND latitud IS NOT NULL
          AND longitud IS NOT NULL
        ORDER BY inicio_at DESC
        LIMIT 1
      ');
      $stmt->execute(['ip_hash' => $ipHash]);
      $cached = $stmt->fetch();
      if (is_array($cached) && audience_location_complete($cached)) {
        return [
          'pais' => substr((string) ($cached['pais'] ?? ''), 0, 100),
          'region' => substr((string) ($cached['region'] ?? ''), 0, 120),
          'ciudad' => substr((string) ($cached['ciudad'] ?? ''), 0, 120),
          'latitud' => is_numeric($cached['latitud']) ? (float) $cached['latitud'] : null,
          'longitud' => is_numeric($cached['longitud']) ? (float) $cached['longitud'] : null,
        ];
      }
    } catch (Throwable $error) {
      // La geolocalización nunca debe impedir iniciar la audiencia.
    }
  }

  return audience_external_location($ip);
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
    $clientIp = audience_client_ip();
    $location = audience_location($pdo, $clientIp);
    $streamId = (int) ($_POST['stream_id'] ?? 0);
    $stream = audience_stream($pdo, $streamId);
    $token = bin2hex(random_bytes(32));
    $hash = audience_token_hash($token);

    $stmt = $pdo->prepare('
      INSERT INTO lvj_rad_sesiones
      (usuario_id, session_token_hash, stream_id, stream_nombre, inicio_at, ultima_actividad_at,
       tipo_oyente, dispositivo, sistema_operativo, navegador, pais, region, ciudad, latitud, longitud, ip_hash, user_agent, estado)
      VALUES
      (:usuario_id, :token, :stream_id, :stream_nombre, :inicio, :actividad,
       :tipo, :dispositivo, :sistema, :navegador, :pais, :region, :ciudad, :latitud, :longitud, :ip_hash, :ua, "activo")
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
      'latitud' => $location['latitud'],
      'longitud' => $location['longitud'],
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
    $minutes = max(1, min(10, (int) ($_GET['minutes'] ?? 5)));
    $since = gmdate('Y-m-d H:i:s', time() - ($minutes * 60));
    $fromInput = trim((string) ($_GET['from'] ?? ''));
    $toInput = trim((string) ($_GET['to'] ?? ''));
    $tzBogota = new DateTimeZone('America/Bogota');
    $tzUtc = new DateTimeZone('UTC');
    $fromDate = preg_match('/^\\d{4}-\\d{2}-\\d{2}$/', $fromInput) ? $fromInput : (new DateTimeImmutable('now', $tzBogota))->format('Y-m-d');
    $toDate = preg_match('/^\\d{4}-\\d{2}-\\d{2}$/', $toInput) ? $toInput : (new DateTimeImmutable('now', $tzBogota))->format('Y-m-d');
    $from = (new DateTimeImmutable($fromDate . ' 00:00:00', $tzBogota))->setTimezone($tzUtc)->format('Y-m-d H:i:s');
    $to = (new DateTimeImmutable($toDate . ' 23:59:59', $tzBogota))->setTimezone($tzUtc)->format('Y-m-d H:i:s');

    $connectedStmt = $pdo->prepare("SELECT COUNT(*) FROM lvj_rad_sesiones WHERE estado = 'activo' AND ultima_actividad_at >= :since");
    $connectedStmt->execute(['since' => $since]);
    $connected = (int) $connectedStmt->fetchColumn();

    $uniqueStmt = $pdo->prepare("SELECT COUNT(DISTINCT COALESCE(CAST(usuario_id AS CHAR), session_token_hash)) FROM lvj_rad_sesiones WHERE inicio_at BETWEEN :from AND :to");
    $uniqueStmt->execute(['from' => $from, 'to' => $to]);
    $uniqueToday = (int) $uniqueStmt->fetchColumn();

    $sessionsStmt = $pdo->prepare("SELECT COUNT(*) FROM lvj_rad_sesiones WHERE inicio_at BETWEEN :from AND :to");
    $sessionsStmt->execute(['from' => $from, 'to' => $to]);
    $sessionsToday = (int) $sessionsStmt->fetchColumn();

    $completedStmt = $pdo->prepare("SELECT COUNT(*) FROM lvj_rad_sesiones WHERE estado = 'finalizado' AND inicio_at BETWEEN :from AND :to");
    $completedStmt->execute(['from' => $from, 'to' => $to]);
    $completedSessions = (int) $completedStmt->fetchColumn();

    $durationTotalStmt = $pdo->prepare("SELECT COALESCE(SUM(CASE WHEN duracion_segundos > 0 THEN duracion_segundos WHEN estado = 'activo' THEN GREATEST(0, TIMESTAMPDIFF(SECOND, inicio_at, UTC_TIMESTAMP())) ELSE 0 END),0) FROM lvj_rad_sesiones WHERE inicio_at BETWEEN :from AND :to");
    $durationTotalStmt->execute(['from' => $from, 'to' => $to]);
    $totalListeningSeconds = (int) $durationTotalStmt->fetchColumn();

    $periodDays = max(1, (int) ((new DateTimeImmutable($toDate, $tzBogota))->diff(new DateTimeImmutable($fromDate, $tzBogota))->days) + 1);
    $averageSessionsPerHour = $sessionsToday / ($periodDays * 24);

    $registeredStmt = $pdo->prepare("SELECT COUNT(DISTINCT usuario_id) FROM lvj_rad_sesiones WHERE usuario_id IS NOT NULL AND inicio_at BETWEEN :from AND :to");
    $registeredStmt->execute(['from' => $from, 'to' => $to]);
    $registeredUnique = (int) $registeredStmt->fetchColumn();

    $guestStmt = $pdo->prepare("SELECT COUNT(DISTINCT session_token_hash) FROM lvj_rad_sesiones WHERE usuario_id IS NULL AND inicio_at BETWEEN :from AND :to");
    $guestStmt->execute(['from' => $from, 'to' => $to]);
    $guestUnique = (int) $guestStmt->fetchColumn();

    $avgStmt = $pdo->prepare("SELECT COALESCE(AVG(CASE WHEN duracion_segundos > 0 THEN duracion_segundos WHEN estado = 'activo' THEN GREATEST(0, TIMESTAMPDIFF(SECOND, inicio_at, UTC_TIMESTAMP())) ELSE NULL END),0) FROM lvj_rad_sesiones WHERE inicio_at BETWEEN :from AND :to");
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
    $hourStmt = $pdo->prepare("SELECT HOUR(DATE_SUB(inicio_at, INTERVAL 5 HOUR)) hora, COUNT(*) sesiones FROM lvj_rad_sesiones WHERE inicio_at BETWEEN :from AND :to GROUP BY HOUR(DATE_SUB(inicio_at, INTERVAL 5 HOUR))");
    $hourStmt->execute(['from' => $from, 'to' => $to]);
    foreach ($hourStmt->fetchAll() as $row) $hourly[(int) $row['hora']] = (int) $row['sesiones'];

    audience_json([
      'success' => true,
      'connected' => $connected,
      'unique_today' => $uniqueToday,
      'registered_unique' => $registeredUnique,
      'guest_unique' => $guestUnique,
      'sessions_today' => $sessionsToday,
      'completed_sessions' => $completedSessions,
      'average_sessions_per_hour' => round($averageSessionsPerHour, 2),
      'total_listening_hours' => round($totalListeningSeconds / 3600, 2),
      'avg_duration_minutes' => round($avgDuration / 60, 1),
      'countries_count' => $countries,
      'countries' => $countriesRows,
      'cities' => $citiesRows,
      'hourly' => $hourly,
    ]);
  }

  if ($method === 'GET' && $action === 'live') {
    $minutes = max(1, min(10, (int) ($_GET['minutes'] ?? 5)));
    $since = gmdate('Y-m-d H:i:s', time() - ($minutes * 60));
    $stmt = $pdo->prepare("
      SELECT s.*, u.nombre AS usuario_nombre
      FROM lvj_rad_sesiones s
      LEFT JOIN lvj_com_usuarios u ON u.id = s.usuario_id
      WHERE s.estado = 'activo' AND s.ultima_actividad_at >= :since
      ORDER BY s.ultima_actividad_at DESC
      LIMIT 200
    ");
    $stmt->execute(['since' => $since]);
    audience_json(['success' => true, 'sessions' => $stmt->fetchAll(), 'minutes' => $minutes]);
  }

  if ($method === 'GET' && $action === 'sessions') {
    $limit = max(1, min(200, (int) ($_GET['limit'] ?? 50)));
    $fromInput = trim((string) ($_GET['from'] ?? ''));
    $toInput = trim((string) ($_GET['to'] ?? ''));
    $conditions = [];
    $params = [];
    $tzBogota = new DateTimeZone('America/Bogota');
    $tzUtc = new DateTimeZone('UTC');
    if (preg_match('/^\\d{4}-\\d{2}-\\d{2}$/', $fromInput)) {
      $conditions[] = 's.inicio_at >= :from';
      $params['from'] = (new DateTimeImmutable($fromInput . ' 00:00:00', $tzBogota))->setTimezone($tzUtc)->format('Y-m-d H:i:s');
    }
    if (preg_match('/^\\d{4}-\\d{2}-\\d{2}$/', $toInput)) {
      $conditions[] = 's.inicio_at <= :to';
      $params['to'] = (new DateTimeImmutable($toInput . ' 23:59:59', $tzBogota))->setTimezone($tzUtc)->format('Y-m-d H:i:s');
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
      SELECT s.*, u.nombre AS usuario_nombre
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
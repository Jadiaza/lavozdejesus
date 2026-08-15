<?php

declare(strict_types=1);


/**
 * Autocargador limitado del módulo de Estudio Bíblico.
 *
 * Evita que un endpoint o proceso interno falle con:
 * Class "BibleStudyMethod" not found
 *
 * Solo permite cargar clases conocidas del módulo, sin aceptar rutas arbitrarias.
 */
function lvj_register_bible_study_autoloader(): void
{
  static $registered = false;

  if ($registered) {
    return;
  }

  $registered = true;

  spl_autoload_register(static function (string $class): void {
    static $allowedClasses = [
      'BibleStudyAiProviderInterface' => true,
      'BibleStudyMethod' => true,
      'BibleStudySchema' => true,
      'BibleStudyLevel' => true,
      'BibleStudyPrompt' => true,
      'HttpJsonClient' => true,
      'OpenAIProvider' => true,
      'GeminiProvider' => true,
      'BibleStudyProviderFactory' => true,
      'SupabaseAuth' => true,
      'BibleStudyService' => true,
    ];

    if (!isset($allowedClasses[$class])) {
      return;
    }

    $file = __DIR__ . '/includes/bible-study/' . $class . '.php';

    if (!is_file($file)) {
      error_log('LVJ Bible Study autoload: missing file for ' . $class);
      return;
    }

    require_once $file;
  });
}

lvj_register_bible_study_autoloader();


function lvj_json_response(array $payload, int $status = 200): void
{
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  $requestMethod = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
  $hasAuthorization = false;
  foreach (['HTTP_AUTHORIZATION','REDIRECT_HTTP_AUTHORIZATION','HTTP_X_LVJ_AUTHORIZATION'] as $key) {
    if (trim((string)($_SERVER[$key]??'')) !== '') {
      $hasAuthorization = true;
      break;
    }
  }
  if (!$hasAuthorization && function_exists('getallheaders')) {
    $requestHeaders = getallheaders();
    if (is_array($requestHeaders)) {
      foreach (['Authorization','authorization','X-LVJ-Authorization','x-lvj-authorization'] as $key) {
        if (trim((string)($requestHeaders[$key]??'')) !== '') {
          $hasAuthorization = true;
          break;
        }
      }
    }
  }
  header($requestMethod === 'GET' && !$hasAuthorization
    ? 'Cache-Control: public, max-age=300, stale-while-revalidate=3600'
    : 'Cache-Control: no-store');

  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
  $allowedOrigins = [
    'https://lavozdejesus.co',
    'https://www.lavozdejesus.co',
    'https://lavozdejesus.vercel.app',
    'http://localhost:8080',
    'http://localhost:3000',
  ];

  if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
  }

  $body = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

  if ($body === false) {
    error_log('lvj_json_response: json_encode failed: ' . json_last_error_msg());
    $body = json_encode([
      'success' => false,
      'message' => 'Error interno de serialización JSON.',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '{"success":false,"message":"Error interno."}';
    if ($status < 500) {
      $status = 500;
      http_response_code(500);
    }
  }

  echo $body;
  exit;
}

function lvj_require_method(string $method): void
{
  $requestMethod = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
  $allowedMethod = strtoupper($method);

  if ($requestMethod === 'OPTIONS') {
    header('Access-Control-Allow-Methods: ' . $allowedMethod . ', OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-LVJ-Authorization');
    lvj_json_response(['success' => true]);
  }

  if ($requestMethod !== $allowedMethod) {
    header('Allow: ' . $allowedMethod);
    lvj_json_response(['success' => false, 'message' => 'Método no permitido.'], 405);
  }
}

function lvj_json_input(): array
{
  $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
  if ($contentType !== '' && stripos($contentType, 'application/json') === false) {
    lvj_json_response(['success' => false, 'message' => 'El encabezado Content-Type debe ser application/json.'], 415);
  }

  $raw = file_get_contents('php://input');
  $data = json_decode($raw ?: '', true);

  if (!is_array($data)) {
    $error = json_last_error();
    $message = $error === JSON_ERROR_NONE
      ? 'El cuerpo JSON no es válido.'
      : 'JSON inválido: ' . json_last_error_msg();

    lvj_json_response(['success' => false, 'message' => $message], 400);
  }

  return $data;
}

function lvj_clean_text(mixed $value): string
{
  $text = is_scalar($value) ? (string) $value : '';
  $text = strip_tags($text);
  $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $text) ?? '';
  $text = preg_replace('/[ \t]+/u', ' ', $text) ?? '';

  return trim($text);
}

function lvj_config(): array
{
  $localConfig = __DIR__ . '/config.local.php';

  if (is_file($localConfig)) {
    $config = require $localConfig;

    if (is_array($config)) {
      return $config;
    }
  }

  return [
    'db_host' => getenv('MYSQL_HOST') ?: 'localhost',
    'db_name' => getenv('MYSQL_DATABASE') ?: 'lavozdej_Radio',
    'db_user' => getenv('MYSQL_USER') ?: '',
    'db_pass' => getenv('MYSQL_PASSWORD') ?: '',
  ];
}

function lvj_setting(string $name, mixed $fallback = ''): mixed
{
  $environment = getenv($name);
  if ($environment !== false && trim((string) $environment) !== '') {
    return $environment;
  }

  $config = lvj_config();
  return $config[strtolower($name)] ?? $fallback;
}

function lvj_db(): PDO
{
  $config = lvj_config();
  $dsn = sprintf(
    'mysql:host=%s;dbname=%s;charset=utf8mb4',
    $config['db_host'],
    $config['db_name'],
  );

  return new PDO($dsn, $config['db_user'], $config['db_pass'], [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
  ]);
}

function lvj_text(?array $row, string ...$keys): string
{
  if (!$row) {
    return '';
  }

  foreach ($keys as $key) {
    if (isset($row[$key]) && trim((string) $row[$key]) !== '') {
      return trim((string) $row[$key]);
    }
  }

  return '';
}

function lvj_bool(mixed $value, bool $fallback = false): bool
{
  if ($value === null || $value === '') {
    return $fallback;
  }

  if (is_bool($value)) {
    return $value;
  }

  if (is_numeric($value)) {
    return (int) $value === 1;
  }

  return in_array(strtolower(trim((string) $value)), [
    '1',
    'true',
    'si',
    'sí',
    'yes',
    'activo',
  ], true);
}

function lvj_first(PDO $pdo, string $sql, array $params = []): ?array
{
  $statement = $pdo->prepare($sql);
  $statement->execute($params);
  $row = $statement->fetch();

  return $row ?: null;
}

function lvj_optional_first(PDO $pdo, string $sql, array $params = []): ?array
{
  try {
    return lvj_first($pdo, $sql, $params);
  } catch (Throwable $error) {
    return null;
  }
}

function lvj_optional_rows(PDO $pdo, string $sql, array $params = []): array
{
  try {
    $statement = $pdo->prepare($sql);
    $statement->execute($params);

    return $statement->fetchAll();
  } catch (Throwable $error) {
    return [];
  }
}

function lvj_social_url(array $rows, string $name): string
{
  foreach ($rows as $row) {
    if (strtolower(lvj_text($row, 'nombre')) === strtolower($name)) {
      return lvj_text($row, 'url');
    }
  }

  return '';
}

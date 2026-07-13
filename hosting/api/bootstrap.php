<?php

declare(strict_types=1);

function lvj_json_response(array $payload, int $status = 200): void
{
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  $requestMethod = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
  header($requestMethod === 'GET'
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

  echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function lvj_require_method(string $method): void
{
  $requestMethod = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
  $allowedMethod = strtoupper($method);

  if ($requestMethod === 'OPTIONS') {
    header('Access-Control-Allow-Methods: ' . $allowedMethod . ', OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    lvj_json_response(['success' => true]);
  }

  if ($requestMethod !== $allowedMethod) {
    header('Allow: ' . $allowedMethod);
    lvj_json_response(['success' => false, 'message' => 'Método no permitido.'], 405);
  }
}

function lvj_json_input(): array
{
  $raw = file_get_contents('php://input');
  $data = json_decode($raw ?: '', true);

  if (!is_array($data)) {
    lvj_json_response(['success' => false, 'message' => 'El cuerpo JSON no es válido.'], 400);
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

<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
if ($method === 'OPTIONS') {
  header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, Authorization, X-LVJ-Authorization');
  lvj_json_response(['success' => true]);
}
if (!in_array($method, ['GET', 'POST'], true)) {
  header('Allow: GET, POST, OPTIONS');
  lvj_json_response(['success' => false, 'message' => 'Método no permitido.'], 405);
}

function lvj_plan_int(mixed $value, int $min = 1, int $max = PHP_INT_MAX): int
{
  $number = filter_var($value, FILTER_VALIDATE_INT, [
    'options' => ['min_range' => $min, 'max_range' => $max],
  ]);
  return $number === false ? 0 : (int) $number;
}

function lvj_plan_is_active(mixed $value): bool
{
  $normalized = mb_strtolower(trim((string) $value));
  return in_array($normalized, ['1', 'activo', 'publicado', 'active', 'published'], true);
}

function lvj_plan_public(array $row): array
{
  return [
    'id' => (int) $row['id'],
    'titulo' => (string) ($row['titulo'] ?? ''),
    'descripcion' => (string) ($row['descripcion'] ?? ''),
    'duracion_dias' => (int) ($row['duracion_dias'] ?? 0),
    'categoria' => (string) ($row['categoria'] ?? ''),
    'imagen_url' => (string) ($row['imagen_url'] ?? ''),
  ];
}

function lvj_plan_day_public(array $row, bool $full = false): array
{
  $day = [
    'id' => (int) $row['id'],
    'plan_id' => (int) $row['plan_id'],
    'dia' => (int) $row['dia'],
    'titulo' => (string) ($row['titulo'] ?? ''),
    'lectura' => (string) ($row['lectura'] ?? ''),
  ];
  if ($full) {
    $day['descripcion'] = (string) ($row['descripcion'] ?? '');
    $day['motivacion'] = (string) ($row['motivacion'] ?? '');
    $day['oracion_inicial'] = (string) ($row['oracion_inicial'] ?? '');
    $day['oracion_final'] = (string) ($row['oracion_final'] ?? '');
  }
  return $day;
}

function lvj_plan_find(PDO $pdo, int $id): ?array
{
  $statement = $pdo->prepare(
    'SELECT id, titulo, descripcion, duracion_dias, categoria, imagen_url, estado
     FROM lvj_bib_planes
     WHERE id = :id AND deleted_at IS NULL
     LIMIT 1'
  );
  $statement->execute(['id' => $id]);
  $row = $statement->fetch();
  if (!$row || !lvj_plan_is_active($row['estado'] ?? null)) return null;
  return $row;
}

function lvj_plan_progress_public(array $row): array
{
  return [
    'plan_id' => (int) $row['plan_id'],
    'dia_actual' => (int) $row['dia_actual'],
    'completado' => (int) $row['completado'] === 1,
    'updated_at' => (string) ($row['updated_at'] ?? ''),
  ];
}

try {
  $pdo = lvj_db();

  if ($method === 'POST') {
    $input = lvj_json_input();
    if (mb_strtolower(trim((string) ($input['accion'] ?? ''))) !== 'progreso') {
      lvj_json_response(['success' => false, 'message' => 'Acción no válida.'], 400);
    }

    $user = SupabaseAuth::requireAccount($pdo);
    $planId = lvj_plan_int($input['plan_id'] ?? null);
    $day = lvj_plan_int($input['dia_actual'] ?? null);
    if ($planId < 1 || $day < 1) {
      lvj_json_response(['success' => false, 'message' => 'El plan o la jornada no son válidos.'], 400);
    }
    $plan = lvj_plan_find($pdo, $planId);
    if (!$plan) {
      lvj_json_response(['success' => false, 'message' => 'El plan solicitado no está disponible.'], 404);
    }
    $duration = max(1, (int) $plan['duracion_dias']);
    if ($day > $duration) {
      lvj_json_response(['success' => false, 'message' => 'El progreso supera la duración del plan.'], 400);
    }
    $completed = !empty($input['completado']) ? 1 : 0;
    if ($completed === 1 && $day < $duration) {
      lvj_json_response(['success' => false, 'message' => 'El plan solo puede completarse en su última jornada.'], 400);
    }

    $find = $pdo->prepare('SELECT id, dia_actual, completado FROM lvj_bib_progreso_planes WHERE usuario_id = :usuario_id AND plan_id = :plan_id LIMIT 1');
    $find->execute(['usuario_id' => (int) $user['id'], 'plan_id' => $planId]);
    $existing = $find->fetch();

    if ($existing) {
      $storedDay = max((int) $existing['dia_actual'], $day);
      $storedCompleted = (int) $existing['completado'] === 1 || $completed === 1 ? 1 : 0;
      $update = $pdo->prepare('UPDATE lvj_bib_progreso_planes SET dia_actual = :dia_actual, completado = :completado, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
      $update->execute([
        'dia_actual' => $storedDay,
        'completado' => $storedCompleted,
        'id' => (int) $existing['id'],
      ]);
    } else {
      $insert = $pdo->prepare('INSERT INTO lvj_bib_progreso_planes (usuario_id, plan_id, dia_actual, completado) VALUES (:usuario_id, :plan_id, :dia_actual, :completado)');
      $insert->execute([
        'usuario_id' => (int) $user['id'],
        'plan_id' => $planId,
        'dia_actual' => $day,
        'completado' => $completed,
      ]);
    }

    $saved = $pdo->prepare('SELECT plan_id, dia_actual, completado, updated_at FROM lvj_bib_progreso_planes WHERE usuario_id = :usuario_id AND plan_id = :plan_id LIMIT 1');
    $saved->execute(['usuario_id' => (int) $user['id'], 'plan_id' => $planId]);
    $progress = $saved->fetch();
    lvj_json_response(['success' => true, 'data' => $progress ? lvj_plan_progress_public($progress) : null]);
  }

  $action = mb_strtolower(trim((string) ($_GET['accion'] ?? 'catalogo')));

  if ($action === 'catalogo') {
    $rows = $pdo->query(
      'SELECT id, titulo, descripcion, duracion_dias, categoria, imagen_url, estado
       FROM lvj_bib_planes
       WHERE deleted_at IS NULL
       ORDER BY id DESC'
    )->fetchAll();
    $plans = array_values(array_map('lvj_plan_public', array_filter($rows, static fn(array $row): bool => lvj_plan_is_active($row['estado'] ?? null))));
    lvj_json_response(['success' => true, 'data' => ['planes' => $plans]]);
  }

  if ($action === 'detalle') {
    $planId = lvj_plan_int($_GET['id'] ?? null);
    $plan = $planId > 0 ? lvj_plan_find($pdo, $planId) : null;
    if (!$plan) lvj_json_response(['success' => false, 'message' => 'El plan solicitado no está disponible.'], 404);

    $statement = $pdo->prepare(
      'SELECT id, plan_id, dia, titulo, lectura, estado
       FROM lvj_bib_plan_dias
       WHERE plan_id = :plan_id AND deleted_at IS NULL
       ORDER BY dia ASC, id ASC'
    );
    $statement->execute(['plan_id' => $planId]);
    $rows = $statement->fetchAll();
    $days = array_values(array_map(static fn(array $row): array => lvj_plan_day_public($row, false), array_filter($rows, static fn(array $row): bool => lvj_plan_is_active($row['estado'] ?? null))));
    lvj_json_response(['success' => true, 'data' => ['plan' => lvj_plan_public($plan), 'dias' => $days]]);
  }

  if ($action === 'jornada') {
    $planId = lvj_plan_int($_GET['plan_id'] ?? null);
    $dayNumber = lvj_plan_int($_GET['dia'] ?? null);
    $plan = $planId > 0 ? lvj_plan_find($pdo, $planId) : null;
    if (!$plan || $dayNumber < 1) lvj_json_response(['success' => false, 'message' => 'La jornada solicitada no está disponible.'], 404);

    $statement = $pdo->prepare(
      'SELECT id, plan_id, dia, titulo, lectura, descripcion, motivacion, oracion_inicial, oracion_final, estado
       FROM lvj_bib_plan_dias
       WHERE plan_id = :plan_id AND dia = :dia AND deleted_at IS NULL
       ORDER BY id ASC
       LIMIT 1'
    );
    $statement->execute(['plan_id' => $planId, 'dia' => $dayNumber]);
    $day = $statement->fetch();
    if (!$day || !lvj_plan_is_active($day['estado'] ?? null)) {
      lvj_json_response(['success' => false, 'message' => 'La jornada solicitada no está disponible.'], 404);
    }
    lvj_json_response(['success' => true, 'data' => ['plan' => lvj_plan_public($plan), 'jornada' => lvj_plan_day_public($day, true)]]);
  }

  if ($action === 'progreso') {
    $user = SupabaseAuth::requireAccount($pdo);
    $planId = lvj_plan_int($_GET['plan_id'] ?? null);
    if ($planId < 1 || !lvj_plan_find($pdo, $planId)) {
      lvj_json_response(['success' => false, 'message' => 'El plan solicitado no está disponible.'], 404);
    }
    $statement = $pdo->prepare('SELECT plan_id, dia_actual, completado, updated_at FROM lvj_bib_progreso_planes WHERE usuario_id = :usuario_id AND plan_id = :plan_id LIMIT 1');
    $statement->execute(['usuario_id' => (int) $user['id'], 'plan_id' => $planId]);
    $progress = $statement->fetch();
    lvj_json_response(['success' => true, 'data' => $progress ? lvj_plan_progress_public($progress) : null]);
  }

  lvj_json_response(['success' => false, 'message' => 'Acción no válida.'], 400);
} catch (Throwable $error) {
  error_log('LVJ Planes Biblia API: ' . $error->getMessage());
  lvj_json_response(['success' => false, 'message' => 'No fue posible consultar los planes en este momento.'], 500);
}

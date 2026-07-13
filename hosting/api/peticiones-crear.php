<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

lvj_require_method('POST');
$input = lvj_json_input();

$categories = ['peticion', 'accion_gracias', 'enfermos', 'familia', 'difuntos', 'vocaciones', 'sacerdotes', 'trabajo', 'paz', 'otra'];
$nombre = mb_substr(lvj_clean_text($input['nombre'] ?? ''), 0, 100);
$ciudad = mb_substr(lvj_clean_text($input['ciudad'] ?? ''), 0, 100);
$peticion = lvj_clean_text($input['peticion'] ?? '');
$categoria = lvj_clean_text($input['categoria'] ?? '');
$anonimo = lvj_bool($input['anonimo'] ?? false) ? 1 : 0;
$sessionId = mb_substr(lvj_clean_text($input['identificador_sesion'] ?? ''), 0, 128);

if (mb_strlen($peticion) < 10 || mb_strlen($peticion) > 300) {
  lvj_json_response(['success' => false, 'message' => 'La intención debe tener entre 10 y 300 caracteres.'], 422);
}
if (!in_array($categoria, $categories, true)) {
  lvj_json_response(['success' => false, 'message' => 'Selecciona una categoría válida.'], 422);
}
if ($sessionId === '' || mb_strlen($sessionId) < 16) {
  lvj_json_response(['success' => false, 'message' => 'No fue posible identificar esta sesión.'], 422);
}

try {
  $pdo = lvj_db();

  // La sesión identifica el rate limit sin exigir una columna adicional en la tabla.
  session_id(substr(hash('sha256', 'lvj-peticiones-' . $sessionId), 0, 32));
  session_start();
  $now = time();
  $recentAttempts = array_values(array_filter(
    is_array($_SESSION['lvj_petition_attempts'] ?? null) ? $_SESSION['lvj_petition_attempts'] : [],
    static function ($timestamp) use ($now): bool {
      return is_int($timestamp) && $timestamp >= $now - 600;
    },
  ));
  if (count($recentAttempts) >= 3) {
    session_write_close();
    lvj_json_response(['success' => false, 'message' => 'Has enviado varias intenciones. Espera unos minutos antes de intentarlo nuevamente.'], 429);
  }
  $recentAttempts[] = $now;
  $_SESSION['lvj_petition_attempts'] = $recentAttempts;
  session_write_close();

  $statement = $pdo->prepare("
    INSERT INTO lvj_com_peticiones_oracion
      (nombre, ciudad, peticion, categoria, anonimo, estado,
       total_oraciones, es_urgente, destacada, mostrar_overlay, created_at, updated_at)
    VALUES
      (:nombre, :ciudad, :peticion, :categoria, :anonimo, 'pendiente',
       0, 0, 0, 0, NOW(), NOW())
  ");
  $statement->execute([
    'nombre' => $anonimo ? '' : $nombre,
    'ciudad' => $ciudad,
    'peticion' => $peticion,
    'categoria' => $categoria,
    'anonimo' => $anonimo,
  ]);

  $id = (int) $pdo->lastInsertId();
  $created = lvj_first($pdo, "
    SELECT id, nombre, ciudad, peticion, categoria, total_oraciones, created_at
    FROM lvj_com_peticiones_oracion
    WHERE id = :id
    LIMIT 1
  ", ['id' => $id]);

  lvj_json_response([
    'success' => true,
    'message' => 'Tu intención ha sido depositada a los pies de Jesús Sacramentado.',
    'registro' => array_merge($created ?? ['id' => $id], ['estado' => 'pendiente']),
  ], 201);
} catch (Throwable $error) {
  error_log('LVJ peticiones create: ' . $error->getMessage());
  lvj_json_response(['success' => false, 'message' => 'No fue posible depositar tu intención en este momento.'], 500);
}

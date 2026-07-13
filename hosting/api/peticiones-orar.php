<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

lvj_require_method('POST');
$input = lvj_json_input();
$petitionId = filter_var($input['peticion_id'] ?? null, FILTER_VALIDATE_INT);
$sessionId = mb_substr(lvj_clean_text($input['identificador_sesion'] ?? ''), 0, 128);

if (!$petitionId || $petitionId < 1 || $sessionId === '' || mb_strlen($sessionId) < 16) {
  lvj_json_response(['success' => false, 'message' => 'Los datos de la oración no son válidos.'], 422);
}

$pdo = null;
try {
  $pdo = lvj_db();
  $pdo->beginTransaction();

  $petition = lvj_first($pdo, "
    SELECT id, total_oraciones
    FROM lvj_com_peticiones_oracion
    WHERE id = :id AND estado = 'aprobado' AND deleted_at IS NULL
    FOR UPDATE
  ", ['id' => $petitionId]);
  if (!$petition) {
    $pdo->rollBack();
    lvj_json_response(['success' => false, 'message' => 'La intención ya no está disponible.'], 404);
  }

  try {
    $support = $pdo->prepare("
      INSERT INTO lvj_com_peticiones_apoyos (peticion_id, identificador_sesion, created_at)
      VALUES (:peticion_id, :identificador_sesion, NOW())
    ");
    $support->execute(['peticion_id' => $petitionId, 'identificador_sesion' => $sessionId]);
  } catch (PDOException $error) {
    if ((string) $error->getCode() !== '23000') {
      throw $error;
    }
    $pdo->commit();
    lvj_json_response([
      'success' => true,
      'already_prayed' => true,
      'total_oraciones' => (int) $petition['total_oraciones'],
    ]);
  }

  $update = $pdo->prepare("
    UPDATE lvj_com_peticiones_oracion
    SET total_oraciones = total_oraciones + 1, updated_at = NOW()
    WHERE id = :id
  ");
  $update->execute(['id' => $petitionId]);
  $total = (int) $petition['total_oraciones'] + 1;
  $pdo->commit();

  lvj_json_response(['success' => true, 'already_prayed' => false, 'total_oraciones' => $total]);
} catch (Throwable $error) {
  if ($pdo instanceof PDO && $pdo->inTransaction()) {
    $pdo->rollBack();
  }
  error_log('LVJ peticiones pray: ' . $error->getMessage());
  lvj_json_response(['success' => false, 'message' => 'No fue posible registrar tu oración.'], 500);
}

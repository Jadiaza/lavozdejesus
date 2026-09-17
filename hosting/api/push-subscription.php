<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/includes/prayer-push.php';

lvj_require_method('POST');
$input = lvj_json_input();
$deviceToken = lvj_push_valid_device_token($input['device_token'] ?? '');
$subscription = is_array($input['subscription'] ?? null) ? $input['subscription'] : [];
$keys = is_array($subscription['keys'] ?? null) ? $subscription['keys'] : [];
$endpoint = trim((string) ($subscription['endpoint'] ?? ''));
$publicKey = trim((string) ($keys['p256dh'] ?? ''));
$authToken = trim((string) ($keys['auth'] ?? ''));
$contentEncoding = mb_substr(lvj_clean_text($subscription['contentEncoding'] ?? 'aes128gcm'), 0, 30);
$requestedReminders = is_array($input['reminders'] ?? null) ? array_values(array_unique($input['reminders'])) : [];

if (!filter_var($endpoint, FILTER_VALIDATE_URL) || stripos($endpoint, 'https://') !== 0 || strlen($endpoint) > 2048) {
  lvj_json_response(['success' => false, 'message' => 'Suscripción push no válida.'], 422);
}
if (!preg_match('/^[A-Za-z0-9_-]{20,255}$/', $publicKey) || !preg_match('/^[A-Za-z0-9_-]{10,255}$/', $authToken)) {
  lvj_json_response(['success' => false, 'message' => 'Las claves de la suscripción no son válidas.'], 422);
}

$validReminders = [];
foreach ($requestedReminders as $reminderId) {
  $id = lvj_clean_text($reminderId);
  if (!isset(LVJ_PRAYER_REMINDERS[$id])) {
    lvj_json_response(['success' => false, 'message' => 'Se recibió un recordatorio desconocido.'], 422);
  }
  $validReminders[] = $id;
}

try {
  $pdo = lvj_db();
  $pdo->beginTransaction();
  $endpointHash = hash('sha256', $endpoint);
  $deviceTokenHash = hash('sha256', $deviceToken);
  $active = $validReminders ? 1 : 0;

  $existingStatement = $pdo->prepare("
    SELECT id FROM lvj_com_push_subscriptions
    WHERE endpoint_hash = :endpoint_hash OR device_token_hash = :device_token_hash
    LIMIT 1 FOR UPDATE
  ");
  $existingStatement->execute(['endpoint_hash' => $endpointHash, 'device_token_hash' => $deviceTokenHash]);
  $subscriptionId = (int) ($existingStatement->fetchColumn() ?: 0);
  $params = [
    'endpoint_hash' => $endpointHash,
    'endpoint' => $endpoint,
    'public_key' => $publicKey,
    'auth_token' => $authToken,
    'content_encoding' => $contentEncoding ?: 'aes128gcm',
    'device_token_hash' => $deviceTokenHash,
    'activo' => $active,
  ];

  if ($subscriptionId > 0) {
    $statement = $pdo->prepare("
      UPDATE lvj_com_push_subscriptions SET
        endpoint_hash = :endpoint_hash, endpoint = :endpoint, public_key = :public_key,
        auth_token = :auth_token, content_encoding = :content_encoding,
        device_token_hash = :device_token_hash, timezone = 'America/Bogota',
        activo = :activo, last_seen_at = NOW(), updated_at = NOW()
      WHERE id = :id
    ");
    $statement->execute($params + ['id' => $subscriptionId]);
  } else {
    $statement = $pdo->prepare("
      INSERT INTO lvj_com_push_subscriptions
        (endpoint_hash, endpoint, public_key, auth_token, content_encoding,
         device_token_hash, timezone, activo, last_seen_at, created_at, updated_at)
      VALUES
        (:endpoint_hash, :endpoint, :public_key, :auth_token, :content_encoding,
         :device_token_hash, 'America/Bogota', :activo, NOW(), NOW(), NOW())
    ");
    $statement->execute($params);
    $subscriptionId = (int) $pdo->lastInsertId();
  }
  $pdo->prepare('DELETE FROM lvj_com_prayer_reminders WHERE subscription_id = :id')->execute(['id' => $subscriptionId]);

  $insertReminder = $pdo->prepare("
    INSERT INTO lvj_com_prayer_reminders
      (subscription_id, reminder_id, time_local, enabled, created_at, updated_at)
    VALUES (:subscription_id, :reminder_id, :time_local, 1, NOW(), NOW())
  ");
  foreach ($validReminders as $reminderId) {
    $insertReminder->execute([
      'subscription_id' => $subscriptionId,
      'reminder_id' => $reminderId,
      'time_local' => LVJ_PRAYER_REMINDERS[$reminderId]['time'] . ':00',
    ]);
  }

  $pdo->commit();
  lvj_json_response([
    'success' => true,
    'active' => $active === 1,
    'reminders' => $validReminders,
    'timezone' => 'America/Bogota',
  ]);
} catch (Throwable $error) {
  if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
  error_log('LVJ push subscription: ' . $error->getMessage());
  lvj_json_response(['success' => false, 'message' => 'No fue posible guardar los recordatorios.'], 500);
}

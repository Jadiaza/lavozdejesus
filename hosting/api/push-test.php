<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/includes/prayer-push.php';

lvj_require_method('POST');
$input = lvj_json_input();
$deviceToken = lvj_push_valid_device_token($input['device_token'] ?? '');

try {
  $pdo = lvj_db();
  $row = lvj_first($pdo, "
    SELECT * FROM lvj_com_push_subscriptions
    WHERE device_token_hash = :token_hash AND activo = 1
    LIMIT 1
  ", ['token_hash' => hash('sha256', $deviceToken)]);

  if (!$row) lvj_json_response(['success' => false, 'message' => 'No existe una suscripción activa para este dispositivo.'], 404);
  if (!empty($row['last_test_at']) && strtotime((string) $row['last_test_at']) > time() - 60) {
    lvj_json_response(['success' => false, 'message' => 'Espera un minuto antes de repetir la prueba.'], 429);
  }

  $webPush = lvj_push_webpush();
  $payload = lvj_push_payload([
    'id' => 'test',
    'title' => 'Recordatorios activados',
    'body' => 'LVJPRAYER te acompañará en tus momentos de oración. Dios bendiga tu jornada.',
    'url' => '/oraciones/recordatorios',
  ]);
  $report = $webPush->sendOneNotification(lvj_push_subscription($row), $payload);

  if (!$report->isSuccess()) {
    if ($report->isSubscriptionExpired()) {
      $pdo->prepare('UPDATE lvj_com_push_subscriptions SET activo = 0 WHERE id = :id')->execute(['id' => $row['id']]);
    }
    throw new RuntimeException($report->getReason());
  }

  $pdo->prepare('UPDATE lvj_com_push_subscriptions SET last_test_at = NOW() WHERE id = :id')->execute(['id' => $row['id']]);
  lvj_json_response(['success' => true, 'message' => 'Notificación de prueba enviada. Debe aparecer en unos segundos.']);
} catch (Throwable $error) {
  error_log('LVJ push test: ' . $error->getMessage());
  lvj_json_response(['success' => false, 'message' => 'No fue posible enviar la notificación de prueba.'], 500);
}

<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/includes/prayer-push.php';

if (PHP_SAPI !== 'cli') {
  $provided = (string) ($_SERVER['HTTP_X_LVJ_CRON_TOKEN'] ?? $_GET['token'] ?? '');
  $expected = trim((string) lvj_setting('PRAYER_PUSH_CRON_TOKEN'));
  if ($expected === '' || !hash_equals($expected, $provided)) {
    lvj_json_response(['success' => false, 'message' => 'No autorizado.'], 401);
  }
}

date_default_timezone_set('America/Bogota');
$today = date('Y-m-d');
$currentTime = date('H:i:s');

try {
  $pdo = lvj_db();
  $lock = (int) $pdo->query("SELECT GET_LOCK('lvj_prayer_push_cron', 0)")->fetchColumn();
  if ($lock !== 1) {
    if (PHP_SAPI === 'cli') exit(0);
    lvj_json_response(['success' => true, 'message' => 'Ya existe otro envío en curso.']);
  }

  $statement = $pdo->prepare("
    SELECT r.id AS reminder_row_id, r.reminder_id, s.*
    FROM lvj_com_prayer_reminders r
    INNER JOIN lvj_com_push_subscriptions s ON s.id = r.subscription_id
    WHERE r.enabled = 1
      AND s.activo = 1
      AND (r.last_sent_date IS NULL OR r.last_sent_date <> :today)
      AND TIME_TO_SEC(:current_time) - TIME_TO_SEC(r.time_local) BETWEEN 0 AND 600
    ORDER BY r.time_local ASC, r.id ASC
  ");
  $statement->execute(['today' => $today, 'current_time' => $currentTime]);
  $rows = $statement->fetchAll();
  $webPush = lvj_push_webpush();
  $sent = 0;
  $failed = 0;

  foreach ($rows as $row) {
    $reminder = LVJ_PRAYER_REMINDERS[$row['reminder_id']] ?? null;
    if (!$reminder) continue;
    $reminder['id'] = $row['reminder_id'];
    $report = $webPush->sendOneNotification(lvj_push_subscription($row), lvj_push_payload($reminder));
    if ($report->isSuccess()) {
      $pdo->prepare('UPDATE lvj_com_prayer_reminders SET last_sent_date = :today WHERE id = :id')
        ->execute(['today' => $today, 'id' => $row['reminder_row_id']]);
      $sent++;
    } else {
      $failed++;
      if ($report->isSubscriptionExpired()) {
        $pdo->prepare('UPDATE lvj_com_push_subscriptions SET activo = 0 WHERE id = :id')
          ->execute(['id' => $row['id']]);
      }
      error_log('LVJ prayer push failed: ' . $report->getReason());
    }
  }

  $pdo->query("SELECT RELEASE_LOCK('lvj_prayer_push_cron')");
  $result = ['success' => true, 'timezone' => 'America/Bogota', 'time' => $currentTime, 'sent' => $sent, 'failed' => $failed];
  if (PHP_SAPI === 'cli') {
    echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL;
    exit(0);
  }
  lvj_json_response($result);
} catch (Throwable $error) {
  error_log('LVJ prayer push cron: ' . $error->getMessage());
  if (PHP_SAPI === 'cli') {
    fwrite(STDERR, $error->getMessage() . PHP_EOL);
    exit(1);
  }
  lvj_json_response(['success' => false, 'message' => 'Falló el proceso de recordatorios.'], 500);
}

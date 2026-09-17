<?php

declare(strict_types=1);

use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

const LVJ_PRAYER_REMINDERS = [
  'oficio' => ['time' => '04:00', 'title' => 'Oficio de Lectura', 'body' => 'Deja que la Palabra ilumine el comienzo de tu jornada.', 'url' => '/oraciones/liturgia/oficio'],
  'laudes' => ['time' => '06:00', 'title' => 'Laudes', 'body' => 'Ofrece la mañana al Señor con la oración de Laudes.', 'url' => '/oraciones/liturgia/laudes'],
  'tercia' => ['time' => '09:00', 'title' => 'Tercia', 'body' => 'Haz una pausa, invoca al Espíritu Santo y encomienda al Señor el trabajo de esta mañana.', 'url' => '/oraciones/liturgia/tercia'],
  'angelus' => ['time' => '12:00', 'title' => 'Ángelus', 'body' => 'Es mediodía. Contempla con María el misterio de la Encarnación.', 'url' => '/oraciones/categoria/marianas'],
  'sexta' => ['time' => '12:00', 'title' => 'Sexta', 'body' => 'Detén por un momento tus labores y vuelve el corazón a Dios.', 'url' => '/oraciones/liturgia/sexta'],
  'divina_misericordia' => ['time' => '15:00', 'title' => 'Divina Misericordia', 'body' => 'Son las tres de la tarde. Jesús misericordioso, en ti confío.', 'url' => '/oraciones/devociones'],
  'nona' => ['time' => '15:00', 'title' => 'Nona', 'body' => 'Presenta al Señor el fruto y las cargas de esta tarde.', 'url' => '/oraciones/liturgia/nona'],
  'visperas' => ['time' => '18:00', 'title' => 'Vísperas', 'body' => 'Da gracias al Señor al caer la tarde con la oración de la Iglesia.', 'url' => '/oraciones/liturgia/visperas'],
  'completas' => ['time' => '21:00', 'title' => 'Completas', 'body' => 'Entrega al Padre el día vivido y descansa bajo su protección.', 'url' => '/oraciones/liturgia/completas'],
];

function lvj_push_autoload(): void
{
  $candidates = [
    dirname(__DIR__, 3) . '/vendor/autoload.php',
    dirname(__DIR__) . '/vendor/autoload.php',
  ];

  foreach ($candidates as $autoload) {
    if (is_file($autoload)) {
      require_once $autoload;
      return;
    }
  }

  throw new RuntimeException('La dependencia minishlink/web-push no está instalada.');
}

function lvj_push_public_key(): string
{
  return trim((string) lvj_setting('VAPID_PUBLIC_KEY'));
}

function lvj_push_webpush(): WebPush
{
  lvj_push_autoload();
  $publicKey = lvj_push_public_key();
  $privateKey = trim((string) lvj_setting('VAPID_PRIVATE_KEY'));
  $subject = trim((string) lvj_setting('VAPID_SUBJECT', 'mailto:contacto@lavozdejesus.co'));

  if ($publicKey === '' || $privateKey === '') {
    throw new RuntimeException('Las claves VAPID no están configuradas.');
  }

  return new WebPush([
    'VAPID' => [
      'subject' => $subject,
      'publicKey' => $publicKey,
      'privateKey' => $privateKey,
    ],
  ], ['TTL' => 3600, 'urgency' => 'normal']);
}

function lvj_push_subscription(array $row): Subscription
{
  return Subscription::create([
    'endpoint' => (string) $row['endpoint'],
    'publicKey' => (string) $row['public_key'],
    'authToken' => (string) $row['auth_token'],
    'contentEncoding' => (string) ($row['content_encoding'] ?: 'aes128gcm'),
  ]);
}

function lvj_push_payload(array $reminder): string
{
  return json_encode([
    'title' => $reminder['title'],
    'body' => $reminder['body'],
    'url' => $reminder['url'],
    'icon' => '/pwa-192.png',
    'badge' => '/pwa-192.png',
    'tag' => 'lvj-prayer-' . ($reminder['id'] ?? 'reminder'),
  ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '{}';
}

function lvj_push_valid_device_token(mixed $value): string
{
  $token = lvj_clean_text($value);
  if (!preg_match('/^[a-f0-9-]{32,64}$/i', $token)) {
    lvj_json_response(['success' => false, 'message' => 'Identificador de dispositivo no válido.'], 422);
  }
  return $token;
}

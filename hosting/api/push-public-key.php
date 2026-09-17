<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/includes/prayer-push.php';

lvj_require_method('GET');
$publicKey = lvj_push_public_key();

if ($publicKey === '') {
  lvj_json_response(['success' => false, 'message' => 'El servicio de notificaciones todavía no está configurado.'], 503);
}

lvj_json_response(['success' => true, 'public_key' => $publicKey]);

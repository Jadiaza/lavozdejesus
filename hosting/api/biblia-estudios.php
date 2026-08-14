<?php

declare(strict_types=1);

const LVJ_BIBLE_API_BUILD = '2026-08-14-v12';

function lvj_bible_api_fallback_response(array $payload, int $status): void
{
  if (function_exists('lvj_json_response')) {
    lvj_json_response($payload, $status);
  }

  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');

  echo json_encode(
    $payload,
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
  );
  exit;
}

function lvj_bible_api_error_id(): string
{
  try {
    return gmdate('YmdHis') . '-' . bin2hex(random_bytes(4));
  } catch (Throwable $error) {
    return gmdate('YmdHis') . '-' . substr(sha1(uniqid('', true)), 0, 8);
  }
}

function lvj_bible_api_log(Throwable $error, string $errorId): void
{
  $safeContext = [
    'request_method' => strtoupper($_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN'),
    'request_uri' => (string) ($_SERVER['REQUEST_URI'] ?? ''),
  ];

  error_log(
    '[LVJ Bible Study][' . $errorId . '] '
    . get_class($error)
    . ': ' . $error->getMessage()
    . ' | file=' . $error->getFile()
    . ' | line=' . $error->getLine()
    . ' | context=' . json_encode(
      $safeContext,
      JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    )
    . PHP_EOL
    . $error->getTraceAsString()
  );
}

$errorId = lvj_bible_api_error_id();

try {
  require __DIR__ . '/bootstrap.php';

  $base = __DIR__ . '/includes/bible-study/';
  $files = [
    'BibleStudyAiProviderInterface',
    'BibleStudyMethod',
    'BibleStudySchema',
    'BibleStudyLevel',
    'BibleStudyPrompt',
    'HttpJsonClient',
    'OpenAIProvider',
    'GeminiProvider',
    'BibleStudyProviderFactory',
    'SupabaseAuth',
    'BibleStudyService',
  ];

  foreach ($files as $file) {
    $path = $base . $file . '.php';

    if (!is_file($path)) {
      throw new RuntimeException(
        'Falta el archivo del módulo: ' . $file . '.php'
      );
    }

    require_once $path;
  }

  $pdo = lvj_db();
  $service = new BibleStudyService($pdo);
  $requestMethod = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

  if ($requestMethod === 'OPTIONS') {
    lvj_require_method('POST');
  }

  if ($requestMethod === 'GET') {
    $configured = BibleStudyProviderFactory::configured();
    $readiness = $service->generationReadiness();
    $ready = $configured && $readiness['ready'];

    $availabilityMessage = !$configured
      ? 'Servicio de estudio no configurado.'
      : ($ready ? '' : $readiness['message']);

    if (filter_var($_GET['recent'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
      $user = SupabaseAuth::requireUser($pdo);

      lvj_json_response([
        'success' => true,
        'api_build' => LVJ_BIBLE_API_BUILD,
        'studies' => $service->recentForUser((int) $user['id']),
      ]);
    }

    if (filter_var($_GET['generation_status'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
      $user = SupabaseAuth::requireUser($pdo);
      $statusInput = [
        'libro_codigo' => $_GET['libro_codigo'] ?? '',
        'capitulo_inicio' => $_GET['capitulo_inicio'] ?? 0,
        'versiculo_inicio' => $_GET['versiculo_inicio'] ?? 0,
        'capitulo_fin' => $_GET['capitulo_fin'] ?? 0,
        'versiculo_fin' => $_GET['versiculo_fin'] ?? 0,
        'nivel' => $_GET['nivel'] ?? '',
      ];
      lvj_json_response([
        'success' => true,
        'api_build' => LVJ_BIBLE_API_BUILD,
        'generation' => $service->generationStatusForUser($statusInput, (int) $user['id']),
      ]);
    }

    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);

    if (!$id) {
      lvj_json_response([
        'success' => true,
        'api_build' => LVJ_BIBLE_API_BUILD,
        'service_build' => defined('BibleStudyService::BUILD')
          ? BibleStudyService::BUILD
          : 'sin-marcador',
        'configured' => $configured,
        'ready' => $ready,
        'message' => $availabilityMessage,
      ]);
    }

    $user = null;

    if (SupabaseAuth::hasCredentials()) {
      $user = SupabaseAuth::requireUser($pdo);
    }

    $study = $service->find(
      (int) $id,
      $user ? (int) $user['id'] : null
    );

    if (!$study) {
      lvj_json_response([
        'success' => false,
        'message' => 'El estudio no está disponible.',
      ], 404);
    }

    lvj_json_response([
      'success' => true,
      'api_build' => LVJ_BIBLE_API_BUILD,
      'study' => $study,
      'configured' => $configured,
      'ready' => $ready,
      'message' => $availabilityMessage,
    ]);
  }

  if ($requestMethod !== 'POST') {
    lvj_json_response([
      'success' => false,
      'message' => 'Método no permitido.',
    ], 405);
  }

  $input = lvj_json_input();
  $user = SupabaseAuth::requireUser($pdo);
  $published = $service->findPublishedForInput($input, $user);

  if ($published) {
    lvj_json_response([
      'success' => true,
      'api_build' => LVJ_BIBLE_API_BUILD,
      'source' => 'cache',
      'study' => $published,
    ]);
  }

  $providerTimeout = max(180, (int) lvj_setting('BIBLE_AI_TIMEOUT', 180));
  @set_time_limit($providerTimeout + 30);
  ignore_user_abort(true);

  $result = $service->create($input, $user);

  $processing = $result['source'] === 'processing';
  lvj_json_response([
    'success' => true,
    'api_build' => LVJ_BIBLE_API_BUILD,
    'source' => $result['source'],
    'study' => $result['study'],
    'generation' => $processing ? ['state'=>'processing'] : null,
  ], $processing ? 202 : ($result['source'] === 'generated' ? 201 : 200));
} catch (LengthException | InvalidArgumentException $error) {
  lvj_bible_api_log($error, $errorId);

  lvj_bible_api_fallback_response([
    'success' => false,
    'message' => $error->getMessage(),
    'error_id' => $errorId,
  ], 422);
} catch (Throwable $error) {
  lvj_bible_api_log($error, $errorId);

  $processingMessage =
    'El estudio ya se está procesando. Intenta consultarlo nuevamente en unos momentos.';

  $allowedMessages = [
    'Servicio de estudio no configurado.',
    'El almacenamiento de estudios bíblicos todavía no está disponible.',
    'Has utilizado tus estudios nuevos disponibles para este mes.',
    $processingMessage,
  ];

  if (class_exists('BibleStudyService', false)) {
    $allowedMessages[] = BibleStudyService::EQUIVALENCES_PENDING_MESSAGE;
    $allowedMessages[] = BibleStudyService::LEVELS_PENDING_MESSAGE;
  }

  $message = in_array($error->getMessage(), $allowedMessages, true)
    ? $error->getMessage()
    : 'No fue posible generar el estudio en este momento.';

  $status = $message ===
    'Has utilizado tus estudios nuevos disponibles para este mes.'
      ? 429
      : ($message === $processingMessage ? 409 : 500);

  lvj_bible_api_fallback_response([
    'success' => false,
    'message' => $message,
    'error_id' => $errorId,
  ], $status);
}

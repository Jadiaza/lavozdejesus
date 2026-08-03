<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$base = __DIR__ . '/includes/bible-study/';
foreach (['BibleStudyAiProviderInterface','BibleStudyMethod','BibleStudySchema','BibleStudyLevel','BibleStudyPrompt','HttpJsonClient','OpenAIProvider','GeminiProvider','BibleStudyProviderFactory','SupabaseAuth','BibleStudyService'] as $file) {
  require_once $base . $file . '.php';
}

try {
  $pdo = lvj_db(); $service = new BibleStudyService($pdo);
  $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
  if ($method === 'OPTIONS') lvj_require_method('POST');
  if ($method === 'GET') {
    $configured = BibleStudyProviderFactory::configured();
    $readiness = $service->generationReadiness();
    $ready = $configured && $readiness['ready'];
    $availabilityMessage = !$configured ? 'Servicio de estudio no configurado.' : ($ready ? '' : $readiness['message']);
    if (filter_var($_GET['recent'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
      $user = SupabaseAuth::requireUser($pdo);
      lvj_json_response(['success'=>true,'studies'=>$service->recentForUser((int)$user['id'])]);
    }
    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id) lvj_json_response(['success'=>true,'configured'=>$configured,'ready'=>$ready,'message'=>$availabilityMessage]);
    $user = null;
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) $user = SupabaseAuth::requireUser($pdo);
    $study = $service->find((int)$id, $user ? (int)$user['id'] : null);
    if (!$study) lvj_json_response(['success'=>false,'message'=>'El estudio no está disponible.'],404);
    lvj_json_response(['success'=>true,'study'=>$study,'configured'=>$configured,'ready'=>$ready,'message'=>$availabilityMessage]);
  }
  if ($method !== 'POST') lvj_json_response(['success'=>false,'message'=>'Método no permitido.'],405);
  $input = lvj_json_input();
  $user = SupabaseAuth::requireUser($pdo);
  $published = $service->findPublishedForInput($input, $user);
  if ($published) lvj_json_response(['success'=>true,'source'=>'cache','study'=>$published]);
  $result = $service->create($input, $user);
  lvj_json_response(['success'=>true,'source'=>$result['source'],'study'=>$result['study']], $result['source']==='generated'?201:200);
} catch (LengthException|InvalidArgumentException $error) {
  lvj_json_response(['success'=>false,'message'=>$error->getMessage()],422);
} catch (Throwable $error) {
  $processingMessage = 'El estudio ya se está procesando. Intenta consultarlo nuevamente en unos momentos.';
  $allowedMessages = ['Servicio de estudio no configurado.', BibleStudyService::EQUIVALENCES_PENDING_MESSAGE, BibleStudyService::LEVELS_PENDING_MESSAGE, 'El almacenamiento de estudios bíblicos todavía no está disponible.', 'Has utilizado tus estudios nuevos disponibles para este mes.', $processingMessage];
  $message=in_array($error->getMessage(),$allowedMessages,true)?$error->getMessage():'No fue posible generar el estudio en este momento.';
  if($message==='No fue posible generar el estudio en este momento.')error_log('LVJ Bible Study API: '.$error->getMessage());
  $status=$message==='Has utilizado tus estudios nuevos disponibles para este mes.'?429:($message===$processingMessage?409:500);
  lvj_json_response(['success'=>false,'message'=>$message],$status);
}

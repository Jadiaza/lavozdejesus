<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$base = __DIR__ . '/includes/bible-study/';
foreach (['BibleStudyAiProviderInterface','BibleStudySchema','BibleStudyPrompt','HttpJsonClient','OpenAIProvider','GeminiProvider','BibleStudyProviderFactory','SupabaseAuth','BibleStudyService'] as $file) {
  require_once $base . $file . '.php';
}

try {
  $pdo = lvj_db(); $service = new BibleStudyService($pdo);
  $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
  if ($method === 'OPTIONS') lvj_require_method('POST');
  if ($method === 'GET') {
    $configured = BibleStudyProviderFactory::configured();
    $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id) lvj_json_response(['success'=>true,'configured'=>$configured]);
    $user = null;
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) $user = SupabaseAuth::requireUser($pdo);
    $study = $service->find((int)$id, $user ? (int)$user['id'] : null);
    if (!$study) lvj_json_response(['success'=>false,'message'=>'El estudio no está disponible.'],404);
    lvj_json_response(['success'=>true,'study'=>$study,'configured'=>$configured]);
  }
  if ($method !== 'POST') lvj_json_response(['success'=>false,'message'=>'Método no permitido.'],405);
  $input = lvj_json_input();
  $published = $service->findPublishedForInput($input);
  if ($published) lvj_json_response(['success'=>true,'source'=>'cache','study'=>$published]);
  $user = SupabaseAuth::requireUser($pdo); $result = $service->create($input, $user);
  lvj_json_response(['success'=>true,'source'=>$result['source'],'study'=>$result['study']], $result['source']==='generated'?201:200);
} catch (LengthException|InvalidArgumentException $error) {
  lvj_json_response(['success'=>false,'message'=>$error->getMessage()],422);
} catch (Throwable $error) {
  error_log('LVJ Bible Study API: '.$error->getMessage());
  $message=$error->getMessage()==='Servicio de estudio no configurado.'?$error->getMessage():'No fue posible generar el estudio en este momento.';
  lvj_json_response(['success'=>false,'message'=>$message],500);
}

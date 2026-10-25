<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap.php';
lvj_require_method('GET');
try {
  $pdo = lvj_db();
  $config = lvj_optional_first($pdo, "SELECT * FROM lvj_tx_config WHERE id = 1 LIMIT 1");
  if (!$config || (int)($config['activa'] ?? 0) !== 1 || ($config['modo_capa'] ?? 'desactivada') === 'desactivada') {
    lvj_json_response(['success'=>true,'active'=>false,'mode'=>'desactivada','intentions'=>[]]);
  }
  $now = new DateTimeImmutable('now');
  if ((int)($config['programada'] ?? 0) === 1) {
    $start = !empty($config['inicia_en']) ? new DateTimeImmutable((string)$config['inicia_en']) : null;
    $end = !empty($config['termina_en']) ? new DateTimeImmutable((string)$config['termina_en']) : null;
    if (($start && $now < $start) || ($end && $now >= $end)) {
      lvj_json_response(['success'=>true,'active'=>false,'mode'=>'desactivada','intentions'=>[]]);
    }
  }
  $payload = ['success'=>true,'active'=>true,'mode'=>(string)$config['modo_capa'],'provider'=>(string)($config['proveedor'] ?? 'livepush'),'playback_url'=>(string)($config['url_reproduccion'] ?? ''),'position'=>(string)($config['posicion'] ?? 'inferior_derecha'),'seconds'=>max(5,min(30,(int)($config['segundos_tarjeta'] ?? 5))),'intentions'=>[]];
  if ($payload['mode'] === 'intenciones') {
    $date = $pdo->query("SELECT DATE(MAX(fecha_publicacion)) FROM lvj_com_peticiones_oracion WHERE estado='aprobado' AND deleted_at IS NULL AND fecha_publicacion IS NOT NULL AND fecha_publicacion < DATE_ADD(CURDATE(), INTERVAL 1 DAY)")->fetchColumn();
    if ($date) {
      $stmt = $pdo->prepare("SELECT id, peticion, categoria FROM lvj_com_peticiones_oracion WHERE estado='aprobado' AND deleted_at IS NULL AND DATE(fecha_publicacion)=:fecha AND fecha_publicacion < DATE_ADD(CURDATE(), INTERVAL 1 DAY) ORDER BY id DESC LIMIT 40");
      $stmt->execute(['fecha'=>$date]);
      $payload['intentions'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
      $payload['intentions_date'] = (string)$date;
    }
  }
  lvj_json_response($payload);
} catch (Throwable $error) {
  error_log('LVJ transmission overlay: ' . $error->getMessage());
  lvj_json_response(['success'=>false,'active'=>false,'message'=>'No fue posible consultar la capa.'],500);
}

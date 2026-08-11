<?php
declare(strict_types=1);

final class HttpJsonClient
{
  public static function post(string $url, array $headers, array $body, int $timeout): array
  {
    $payload = json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    $lastStatus = 0; $lastRaw = ''; $lastError = '';
    /*
     * Una generación puede seguir ejecutándose en el proveedor aunque cURL
     * pierda la respuesta. No se reenvían POST costosos automáticamente.
     */
    for ($attempt = 1; $attempt <= 1; $attempt++) {
      $curl = curl_init($url);
      curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => $headers, CURLOPT_POSTFIELDS => $payload,
        CURLOPT_CONNECTTIMEOUT => min(10, $timeout), CURLOPT_TIMEOUT => $timeout]);
      $raw = curl_exec($curl); $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
      $error = curl_error($curl); curl_close($curl);
      $lastStatus = $status; $lastRaw = is_string($raw) ? $raw : ''; $lastError = $error;
      $decoded = is_string($raw) ? json_decode($raw, true) : null;
      if ($raw !== false && $error === '' && $status >= 200 && $status < 300 && is_array($decoded)) return $decoded;
      $transient = $raw === false || $error !== '' || $status === 429 || in_array($status, [500,502,503,504], true);
      error_log('LVJ AI HTTP attempt ' . $attempt . ' status ' . $status . ': ' . mb_substr($lastRaw !== '' ? $lastRaw : $error, 0, 1000));
      if (!$transient || $attempt === 1) break;
    }
    if ($lastRaw === '' && $lastError !== '') throw new RuntimeException('No fue posible contactar al proveedor de IA.');
    $decoded = json_decode($lastRaw, true);
    $providerMessage = is_array($decoded) ? trim((string)($decoded['error']['message'] ?? '')) : '';
    $suffix = $providerMessage !== '' ? ' Detalle: ' . mb_substr($providerMessage, 0, 700) : '';
    throw new RuntimeException('El proveedor de IA no pudo completar el estudio (HTTP ' . $lastStatus . ').' . $suffix);
  }
}

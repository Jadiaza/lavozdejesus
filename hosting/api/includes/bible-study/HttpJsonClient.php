<?php
declare(strict_types=1);

final class HttpJsonClient
{
  public static function post(string $url, array $headers, array $body, int $timeout): array
  {
    $curl = curl_init($url);
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true,
      CURLOPT_HTTPHEADER => $headers, CURLOPT_POSTFIELDS => json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
      CURLOPT_CONNECTTIMEOUT => min(10, $timeout), CURLOPT_TIMEOUT => $timeout]);
    $raw = curl_exec($curl); $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    $error = curl_error($curl); curl_close($curl);
    if ($raw === false || $error !== '') throw new RuntimeException('No fue posible contactar al proveedor del estudio.');
    $decoded = json_decode($raw, true);
    if ($status < 200 || $status >= 300 || !is_array($decoded)) {
      error_log('LVJ AI HTTP ' . $status . ': ' . mb_substr($raw, 0, 500));
      throw new RuntimeException('El proveedor no pudo completar el estudio.');
    }
    return $decoded;
  }
}

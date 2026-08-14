<?php
declare(strict_types=1);

final class HttpJsonClient
{
  public static function get(string $url, array $headers, int $timeout): array
  {
    return self::request('GET', $url, $headers, null, $timeout);
  }

  public static function post(string $url, array $headers, array $body, int $timeout): array
  {
    $payload = json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    return self::request('POST', $url, $headers, $payload, $timeout);
  }

  private static function request(string $method, string $url, array $headers, ?string $payload, int $timeout): array
  {
    $curl = curl_init($url);
    $options = [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_HTTPHEADER => $headers,
      CURLOPT_CONNECTTIMEOUT => min(10, $timeout),
      CURLOPT_TIMEOUT => $timeout,
    ];
    if ($method === 'POST') {
      $options[CURLOPT_POST] = true;
      $options[CURLOPT_POSTFIELDS] = $payload;
    }
    curl_setopt_array($curl, $options);
    $raw = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    $error = curl_error($curl);
    curl_close($curl);

    $decoded = is_string($raw) ? json_decode($raw, true) : null;
    if ($raw !== false && $error === '' && $status >= 200 && $status < 300 && is_array($decoded)) {
      return $decoded;
    }

    error_log('LVJ AI HTTP ' . $method . ' status ' . $status . ': ' . mb_substr(is_string($raw) && $raw !== '' ? $raw : $error, 0, 1000));
    if ((!is_string($raw) || $raw === '') && $error !== '') {
      throw new RuntimeException('No fue posible contactar al proveedor de IA.');
    }
    $providerMessage = is_array($decoded) ? trim((string)($decoded['error']['message'] ?? '')) : '';
    $suffix = $providerMessage !== '' ? ' Detalle: ' . mb_substr($providerMessage, 0, 700) : '';
    throw new RuntimeException('El proveedor de IA no pudo completar el estudio (HTTP ' . $status . ').' . $suffix);
  }
}

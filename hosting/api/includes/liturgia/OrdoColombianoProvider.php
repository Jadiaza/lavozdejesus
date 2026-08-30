<?php

declare(strict_types=1);

final class OrdoColombianoProvider
{
  private const DEFAULT_API_URL = 'https://74j2tngwfd.execute-api.us-east-1.amazonaws.com/api-app/ediciones/obtener-contenido-principal';

  private string $apiUrl;
  private string $apiName;
  private string $apiKey;
  private string $apiToken;
  private int $timeout;

  public function __construct()
  {
    $this->apiUrl = trim((string) lvj_setting('ORDO_COLOMBIANO_API_URL', self::DEFAULT_API_URL));
    $this->apiName = trim((string) lvj_setting('ORDO_COLOMBIANO_API_NAME', ''));
    $this->apiKey = trim((string) lvj_setting('ORDO_COLOMBIANO_API_KEY', ''));
    $this->apiToken = trim((string) lvj_setting('ORDO_COLOMBIANO_API_TOKEN', ''));
    $this->timeout = max(3, min(60, (int) lvj_setting('ORDO_COLOMBIANO_TIMEOUT', '20')));
  }

  /**
   * Recupera la Liturgia del Día y expone, de manera desacoplada, los santos
   * estructurados que el propio Ordo asocia a esa fecha. El consumidor decide
   * qué subconjunto persiste; no se importa reflexión ni contenido pastoral.
   *
   * @return array<string,mixed>
   */
  public function fetchDate(string $date): array
  {
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) !== 1) {
      throw new InvalidArgumentException('La fecha debe usar el formato YYYY-MM-DD.');
    }

    $parts = parse_url($this->apiUrl);
    if (!is_array($parts) || strtolower((string) ($parts['scheme'] ?? '')) !== 'https' || trim((string) ($parts['host'] ?? '')) === '') {
      throw new RuntimeException('ORDO_COLOMBIANO_API_URL debe ser una URL HTTPS válida.');
    }

    $headers = [
      'Accept: application/json, text/plain, */*',
      'User-Agent: LVJPRAYER-Liturgia/1.0',
    ];
    if ($this->apiName !== '') {
      $headers[] = 'api-name: ' . $this->apiName;
    }
    if ($this->apiKey !== '') {
      $headers[] = 'api-key: ' . $this->apiKey;
    }
    if ($this->apiToken !== '') {
      $headers[] = 'api-token: ' . $this->apiToken;
    }

    $curl = curl_init($this->apiUrl);
    if ($curl === false) {
      throw new RuntimeException('No fue posible inicializar la conexión con Ordo Colombiano.');
    }

    curl_setopt_array($curl, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_HTTPHEADER => $headers,
      CURLOPT_CONNECTTIMEOUT => min(10, $this->timeout),
      CURLOPT_TIMEOUT => $this->timeout,
      CURLOPT_FOLLOWLOCATION => false,
      CURLOPT_MAXREDIRS => 0,
      CURLOPT_SSL_VERIFYPEER => true,
      CURLOPT_SSL_VERIFYHOST => 2,
    ]);

    $raw = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    $error = curl_error($curl);
    curl_close($curl);

    if ($raw === false || $error !== '') {
      throw new RuntimeException('No fue posible contactar el Ordo Colombiano.');
    }
    if ($status < 200 || $status >= 300) {
      throw new RuntimeException('Ordo Colombiano respondió HTTP ' . $status . '.');
    }

    // La API real puede declarar text/html aunque el cuerpo sea JSON válido.
    // La validación se hace sobre el contenido y nunca mediante scraping HTML.
    $trimmed = ltrim((string) $raw);
    if ($trimmed === '' || str_starts_with($trimmed, '<')) {
      throw new RuntimeException('El Ordo no devolvió el JSON esperado.');
    }

    try {
      $decoded = json_decode((string) $raw, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $error) {
      throw new RuntimeException('La respuesta del Ordo no contiene JSON válido.', 0, $error);
    }

    if (!is_array($decoded) || ($decoded['success'] ?? true) === false) {
      throw new RuntimeException('El Ordo devolvió una respuesta sin éxito.');
    }

    $row = $this->findDateRow($decoded, $date);
    if (!$row) {
      throw new RuntimeException('El Ordo no contiene información para la fecha ' . $date . '.');
    }

    $first = $this->extractReading((string) ($row['primera_lectura'] ?? ''));
    $second = $this->extractReading((string) ($row['segunda_lectura'] ?? ''));
    $psalm = $this->extractReading((string) ($row['salmo'] ?? ''));
    $gospel = $this->extractReading((string) ($row['evangelio'] ?? ''));

    if ($gospel['cita'] === '' || $gospel['texto'] === '') {
      throw new RuntimeException('El Ordo no devolvió el Evangelio completo para ' . $date . '.');
    }

    $prelude = $this->plain((string) ($row['preludio'] ?? ''));

    return [
      'fecha' => $date,
      'tiempo_liturgico' => $this->plain((string) ($row['tiempo_liturgico'] ?? '')),
      'celebracion' => $this->plain((string) ($row['celebracion'] ?? '')),
      'grado_celebracion' => $this->plain((string) ($row['celebracion'] ?? '')),
      'color_liturgico' => $this->plain((string) ($row['colores_dia'] ?? '')),
      'primera_lectura_cita' => $first['cita'],
      'primera_lectura_texto' => $first['texto'],
      'salmo_cita' => $psalm['cita'],
      'salmo_respuesta' => $this->extractPsalmResponse($psalm['texto']),
      'salmo_texto' => $psalm['texto'],
      'segunda_lectura_cita' => $second['cita'],
      'segunda_lectura_texto' => $second['texto'],
      'evangelio_cita' => $gospel['cita'],
      'evangelio_texto' => $gospel['texto'],
      'preludio_ordo' => $prelude,
      'santos_ordo' => $this->extractSaints($row, $prelude),
      'fuente' => 'Ordo Colombiano',
    ];
  }

  /** @return array<string,mixed>|null */
  private function findDateRow(array $decoded, string $date): ?array
  {
    $rows = $decoded['data'] ?? $decoded;
    if (!is_array($rows)) {
      return null;
    }

    if (!array_is_list($rows)) {
      $rows = [$rows];
    }

    foreach ($rows as $row) {
      if (!is_array($row)) {
        continue;
      }
      if (substr(trim((string) ($row['fecha'] ?? '')), 0, 10) === $date) {
        return $row;
      }
    }

    return null;
  }

  /**
   * @param array<string,mixed> $row
   * @return array<int,array<string,mixed>>
   */
  private function extractSaints(array $row, string $prelude): array
  {
    $raw = $row['celebracion_santo'] ?? [];
    if (is_string($raw)) {
      $raw = trim($raw);
      if ($raw === '' || strtolower($raw) === 'null') {
        return [];
      }
      try {
        $raw = json_decode($raw, true, 64, JSON_THROW_ON_ERROR);
      } catch (JsonException $error) {
        return [];
      }
    }

    if (!is_array($raw)) {
      return [];
    }
    if (!array_is_list($raw)) {
      $raw = [$raw];
    }

    $saints = [];
    foreach ($raw as $index => $item) {
      if (!is_array($item)) {
        continue;
      }

      $name = $this->plain((string) ($item['nombresanto'] ?? ''));
      if ($name === '') {
        continue;
      }

      $saints[] = [
        'ordo_santo_id' => trim((string) ($item['idsanto'] ?? '')),
        'nombre' => $name,
        'titulo' => $this->extractSaintTitle($prelude, $name),
        'orden' => (int) $index,
      ];
    }

    return $saints;
  }

  private function extractSaintTitle(string $prelude, string $name): string
  {
    if ($prelude === '' || $name === '') {
      return '';
    }

    foreach (preg_split('/\s*;\s*/u', $prelude) ?: [] as $segment) {
      $segment = trim((string) $segment);
      $position = mb_stripos($segment, $name, 0, 'UTF-8');
      if ($position === false) {
        continue;
      }

      $suffix = mb_substr($segment, $position + mb_strlen($name, 'UTF-8'), null, 'UTF-8');
      $suffix = trim($suffix, " \t\n\r\0\x0B,.;:-–—");
      return $suffix;
    }

    return '';
  }

  /** @return array{cita:string,texto:string} */
  private function extractReading(string $raw): array
  {
    $text = $this->cleanFragment($raw);
    if ($text === '') {
      return ['cita' => '', 'texto' => ''];
    }

    $lines = preg_split('/\n+/u', $text) ?: [];
    $lines = array_values(array_filter(array_map('trim', $lines), fn ($line) => $line !== ''));
    if (!$lines) {
      return ['cita' => '', 'texto' => ''];
    }

    $citation = trim((string) array_shift($lines));
    $body = trim(implode("\n", $lines));

    // Si la primera línea no parece una referencia bíblica, no la separamos.
    if (preg_match('/\d/u', $citation) !== 1) {
      return ['cita' => '', 'texto' => $text];
    }

    return ['cita' => $citation, 'texto' => $body];
  }

  private function extractPsalmResponse(string $text): string
  {
    foreach (preg_split('/\n+/u', $text) ?: [] as $line) {
      $line = trim($line);
      if (preg_match('/^R\.?\s*(.+)$/iu', $line, $matches) === 1) {
        return trim((string) $matches[1]);
      }
    }

    return '';
  }

  private function cleanFragment(string $value): string
  {
    if ($value === '') {
      return '';
    }

    $value = preg_replace('/<br\s*\/?\s*>/iu', "\n", $value) ?? $value;
    $value = preg_replace('/<\/p\s*>/iu', "\n\n", $value) ?? $value;
    $value = preg_replace('/<\/h[1-6]\s*>/iu', "\n", $value) ?? $value;
    $value = html_entity_decode(strip_tags($value), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $value = str_replace("\u{00A0}", ' ', $value);
    $value = preg_replace('/[ \t]+/u', ' ', $value) ?? $value;
    $value = preg_replace('/\n[ \t]+/u', "\n", $value) ?? $value;
    $value = preg_replace('/\n{3,}/u', "\n\n", $value) ?? $value;

    return trim($value);
  }

  private function plain(string $value): string
  {
    $value = html_entity_decode(strip_tags($value), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $value = str_replace("\u{00A0}", ' ', $value);
    $value = preg_replace('/\s+/u', ' ', $value) ?? $value;
    return trim($value);
  }
}

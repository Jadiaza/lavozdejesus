<?php

declare(strict_types=1);

final class OrdoColombianoProvider
{
  private string $apiUrl;
  private string $apiToken;
  private int $timeout;

  public function __construct()
  {
    $this->apiUrl = trim((string) lvj_setting('ORDO_COLOMBIANO_API_URL', ''));
    $this->apiToken = trim((string) lvj_setting('ORDO_COLOMBIANO_API_TOKEN', ''));
    $this->timeout = max(3, min(30, (int) lvj_setting('ORDO_COLOMBIANO_TIMEOUT', '12')));
  }

  public function isConfigured(): bool
  {
    return $this->apiUrl !== '';
  }

  /**
   * Recupera exclusivamente los datos de Lectura del Día.
   * No procesa santoral, reflexiones, imágenes, audios ni otros módulos LVJ.
   *
   * @return array<string,mixed>
   */
  public function fetchDate(string $date): array
  {
    if (!$this->isConfigured()) {
      throw new RuntimeException('Ordo Colombiano no está configurado en el servidor.');
    }

    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) !== 1) {
      throw new InvalidArgumentException('La fecha debe usar el formato YYYY-MM-DD.');
    }

    $url = $this->buildUrl($date);
    $parts = parse_url($url);
    if (!is_array($parts) || strtolower((string) ($parts['scheme'] ?? '')) !== 'https' || trim((string) ($parts['host'] ?? '')) === '') {
      throw new RuntimeException('ORDO_COLOMBIANO_API_URL debe ser una URL HTTPS válida.');
    }

    $headers = [
      'Accept: application/json',
      'User-Agent: LVJPRAYER-Liturgia/1.0',
    ];

    if ($this->apiToken !== '') {
      $headers[] = 'Authorization: Bearer ' . $this->apiToken;
    }

    $curl = curl_init($url);
    if ($curl === false) {
      throw new RuntimeException('No fue posible inicializar la conexión con Ordo Colombiano.');
    }

    curl_setopt_array($curl, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_HTTPHEADER => $headers,
      CURLOPT_CONNECTTIMEOUT => min(8, $this->timeout),
      CURLOPT_TIMEOUT => $this->timeout,
      CURLOPT_FOLLOWLOCATION => false,
      CURLOPT_MAXREDIRS => 0,
      CURLOPT_SSL_VERIFYPEER => true,
      CURLOPT_SSL_VERIFYHOST => 2,
    ]);

    $raw = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    $contentType = strtolower((string) curl_getinfo($curl, CURLINFO_CONTENT_TYPE));
    $error = curl_error($curl);
    curl_close($curl);

    if ($raw === false || $error !== '') {
      throw new RuntimeException('No fue posible contactar la fuente autorizada del Ordo Colombiano.');
    }

    if ($status < 200 || $status >= 300) {
      throw new RuntimeException('Ordo Colombiano respondió HTTP ' . $status . '.');
    }

    // Evita convertir accidentalmente una página web/login del Ordo en una fuente de datos.
    if ($contentType !== '' && !str_contains($contentType, 'json')) {
      throw new RuntimeException('La fuente configurada del Ordo no respondió JSON.');
    }

    try {
      $decoded = json_decode((string) $raw, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $error) {
      throw new RuntimeException('La respuesta del Ordo no contiene JSON válido.', 0, $error);
    }

    if (!is_array($decoded)) {
      throw new RuntimeException('La respuesta del Ordo no tiene una estructura válida.');
    }

    $row = $this->extractRow($decoded);
    $normalized = $this->normalizeRow($row, $date);

    $hasReading = false;
    foreach (['primera_lectura_cita', 'salmo_cita', 'segunda_lectura_cita', 'evangelio_cita'] as $field) {
      if (array_key_exists($field, $normalized) && trim((string) $normalized[$field]) !== '') {
        $hasReading = true;
        break;
      }
    }

    if (!$hasReading) {
      throw new RuntimeException('La respuesta del Ordo no contiene citas de las lecturas del día.');
    }

    return $normalized;
  }

  private function buildUrl(string $date): string
  {
    if (str_contains($this->apiUrl, '{fecha}') || str_contains($this->apiUrl, '{date}')) {
      return strtr($this->apiUrl, [
        '{fecha}' => rawurlencode($date),
        '{date}' => rawurlencode($date),
      ]);
    }

    $separator = str_contains($this->apiUrl, '?') ? '&' : '?';
    return $this->apiUrl . $separator . 'fecha=' . rawurlencode($date);
  }

  /** @return array<string,mixed> */
  private function extractRow(array $decoded): array
  {
    foreach (['data', 'liturgia', 'lectura', 'lecturas', 'result', 'resultado'] as $key) {
      if (!array_key_exists($key, $decoded)) {
        continue;
      }

      $candidate = $decoded[$key];
      if (is_array($candidate) && array_is_list($candidate)) {
        $candidate = $candidate[0] ?? null;
      }

      if (is_array($candidate)) {
        return $candidate;
      }
    }

    if (array_is_list($decoded)) {
      $first = $decoded[0] ?? null;
      return is_array($first) ? $first : [];
    }

    return $decoded;
  }

  /** @return array<string,mixed> */
  private function normalizeRow(array $row, string $requestedDate): array
  {
    $normalized = ['fecha' => $requestedDate];

    $map = [
      'fecha' => ['fecha', 'date', 'fecha_liturgia'],
      'tiempo_liturgico' => ['tiempo_liturgico', 'tiempoLiturgico', 'tiempo', 'liturgical_season', 'season'],
      'celebracion' => ['celebracion', 'celebración', 'nombre_celebracion', 'nombreCelebracion', 'celebration', 'title', 'titulo'],
      'color_liturgico' => ['color_liturgico', 'colorLiturgico', 'color', 'liturgical_color'],
      'grado_celebracion' => ['grado_celebracion', 'gradoCelebracion', 'grado', 'rank', 'grade'],
      'primera_lectura_cita' => ['primera_lectura_cita', 'primeraLecturaCita', 'primera_lectura', 'first_reading_reference', 'firstReadingReference'],
      'primera_lectura_texto' => ['primera_lectura_texto', 'primeraLecturaTexto', 'first_reading_text', 'firstReadingText'],
      'salmo_cita' => ['salmo_cita', 'salmoCita', 'psalm_reference', 'psalmReference'],
      'salmo_respuesta' => ['salmo_respuesta', 'salmoRespuesta', 'psalm_response', 'psalmResponse'],
      'salmo_texto' => ['salmo_texto', 'salmoTexto', 'psalm_text', 'psalmText'],
      'segunda_lectura_cita' => ['segunda_lectura_cita', 'segundaLecturaCita', 'segunda_lectura', 'second_reading_reference', 'secondReadingReference'],
      'segunda_lectura_texto' => ['segunda_lectura_texto', 'segundaLecturaTexto', 'second_reading_text', 'secondReadingText'],
      'evangelio_cita' => ['evangelio_cita', 'evangelioCita', 'evangelio', 'gospel_reference', 'gospelReference'],
      'evangelio_texto' => ['evangelio_texto', 'evangelioTexto', 'gospel_text', 'gospelText'],
    ];

    foreach ($map as $target => $aliases) {
      [$found, $value] = $this->pickPresent($row, $aliases);
      if (!$found) {
        continue;
      }

      if ($target === 'fecha') {
        $candidate = substr(trim((string) $value), 0, 10);
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $candidate) === 1 && $candidate !== $requestedDate) {
          throw new RuntimeException('El Ordo devolvió una fecha distinta a la solicitada.');
        }
        continue;
      }

      $normalized[$target] = $this->stringValue($value);
    }

    $normalized['fuente'] = 'Ordo Colombiano';
    return $normalized;
  }

  /** @return array{0:bool,1:mixed} */
  private function pickPresent(array $row, array $keys): array
  {
    foreach ($keys as $key) {
      if (array_key_exists($key, $row)) {
        return [true, $row[$key]];
      }
    }

    return [false, null];
  }

  private function stringValue(mixed $value): string
  {
    if (is_string($value) || is_numeric($value)) {
      return trim((string) $value);
    }

    if (is_array($value)) {
      foreach (['cita', 'reference', 'texto', 'text', 'nombre', 'name', 'value'] as $key) {
        if (array_key_exists($key, $value) && (is_string($value[$key]) || is_numeric($value[$key]))) {
          return trim((string) $value[$key]);
        }
      }
    }

    return '';
  }
}

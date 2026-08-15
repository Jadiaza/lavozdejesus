<?php
declare(strict_types=1);

final class BibleStudyTelemetry
{
  private static string $requestId = '';
  private static float $requestStartedAt = 0.0;

  public static function begin(string $requestId, ?float $requestStartedAt = null, array $metadata = []): void
  {
    self::$requestId = $requestId;
    self::$requestStartedAt = $requestStartedAt ?? microtime(true);
    self::log('request_start', $metadata);
  }

  public static function elapsedMs(float $startedAt): int
  {
    return (int) round((microtime(true) - $startedAt) * 1000);
  }

  public static function responseIdHash(string $responseId): string
  {
    return $responseId === '' ? '' : substr(hash('sha256', $responseId), 0, 16);
  }

  public static function log(string $stage, array $metadata = []): void
  {
    try {
      if (self::$requestId === '') return;

      $safe = ['stage' => $stage];
      $allowed = [
        'duration_ms','method','level','verse_count','study_id','generation_id',
        'response_id_hash','http_status','response_status','input_tokens',
        'output_tokens','total_tokens','max_output_tokens','context_bytes',
        'schema_bytes','json_bytes','source','result',
        'request_method','action','has_authorization','reason',
      ];
      foreach ($allowed as $key) {
        if (!array_key_exists($key, $metadata) || $metadata[$key] === null) continue;
        $value = $metadata[$key];
        if (!is_bool($value) && !is_int($value) && !is_float($value) && !is_string($value)) continue;
        $safe[$key] = is_string($value) ? mb_substr($value, 0, 100) : $value;
      }
      if (self::$requestStartedAt > 0) {
        $safe['request_elapsed_ms'] = self::elapsedMs(self::$requestStartedAt);
      }
      error_log('[LVJ Bible Study][' . self::$requestId . '] ' . http_build_query($safe, '', ' '));
    } catch (Throwable $error) {
      // La observabilidad nunca debe interrumpir autenticación, generación ni persistencia.
    }
  }
}

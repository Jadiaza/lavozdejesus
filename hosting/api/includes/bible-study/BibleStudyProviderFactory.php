<?php
declare(strict_types=1);

final class BibleStudyProviderFactory
{
  public static function configured(): bool { return trim((string) lvj_setting('BIBLE_AI_PROVIDER')) !== '' && trim((string) lvj_setting('BIBLE_AI_API_KEY')) !== ''; }
  public static function make(): BibleStudyAiProviderInterface
  {
    $provider = strtolower(trim((string) lvj_setting('BIBLE_AI_PROVIDER')));
    $key = trim((string) lvj_setting('BIBLE_AI_API_KEY'));
    $model = trim((string) lvj_setting('BIBLE_AI_MODEL'));
    $timeout = max(10, (int) lvj_setting('BIBLE_AI_TIMEOUT', 90));
    $tokens = max(1000, (int) lvj_setting('BIBLE_AI_MAX_TOKENS', 8000));
    if ($provider === '' || $key === '') throw new RuntimeException('Servicio de estudio no configurado.');
    if ($provider === 'openai') return new OpenAIProvider($key, $model ?: 'gpt-5.4-mini', $timeout, $tokens);
    if ($provider === 'gemini') return new GeminiProvider($key, $model ?: 'gemini-2.5-flash', $timeout, $tokens);
    throw new RuntimeException('Proveedor de estudio no compatible.');
  }
}

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
    $timeout = max(180, (int) lvj_setting('BIBLE_AI_TIMEOUT', 180));
    if ($provider === '' || $key === '') throw new RuntimeException('Servicio de estudio no configurado.');
    $configuredTokens = (int) lvj_setting('BIBLE_AI_MAX_TOKENS', 0);
    // El JSON maestro incluye análisis proposicional por versículo. Un capítulo
    // de 20-30 versículos puede superar con facilidad el límite histórico de
    // 16K antes de que el modelo alcance a cerrar el objeto JSON estricto.
    if ($provider === 'openai') {
      $tokens = max(48000, $configuredTokens);
      return new OpenAIProvider($key, $model ?: 'gpt-5.4-mini', $timeout, $tokens);
    }
    if ($provider === 'gemini') {
      $tokens = max(16000, $configuredTokens);
      return new GeminiProvider($key, $model ?: 'gemini-2.5-flash', $timeout, $tokens);
    }
    throw new RuntimeException('Proveedor de estudio no compatible.');
  }
}

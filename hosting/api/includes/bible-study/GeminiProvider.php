<?php
declare(strict_types=1);

final class GeminiProvider implements BibleStudyAiProviderInterface
{
  private $key; private $model; private $timeout; private $maxTokens;
  public function __construct(string $key, string $model, int $timeout, int $maxTokens) { $this->key=$key; $this->model=$model; $this->timeout=$timeout; $this->maxTokens=$maxTokens; }
  public function generateStudy(array $context): array
  {
    $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($this->model) . ':generateContent?key=' . rawurlencode($this->key);
    $response = HttpJsonClient::post($url, ['Content-Type: application/json'], [
      'systemInstruction' => ['parts' => [['text' => BibleStudyPrompt::system((string)($context['metodo'] ?? BibleStudyMethod::DEFAULT), (string)($context['nivel'] ?? BibleStudyLevel::DEFAULT))]]],
      'contents' => [['role' => 'user', 'parts' => [['text' => json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]]]],
      'generationConfig' => ['responseMimeType' => 'application/json', 'responseJsonSchema' => BibleStudySchema::jsonSchema((string)($context['metodo'] ?? BibleStudyMethod::DEFAULT)), 'maxOutputTokens' => $this->maxTokens],
    ], $this->timeout);
    $text = self::extractGeminiText($response);
    $study = json_decode(self::normalizeJsonText($text), true);
    if (!is_array($study)) throw new RuntimeException('Gemini no devolvió JSON válido.');
    $study = BibleStudySchema::prepareGenerated($study, $context);
    BibleStudySchema::validate($study, $context);
    return ['study' => $study, 'input_tokens' => $response['usageMetadata']['promptTokenCount'] ?? null,
      'output_tokens' => $response['usageMetadata']['candidatesTokenCount'] ?? null, 'model' => $this->model];
  }

  private static function extractGeminiText(array $response): string
  {
    $text = '';
    if (is_array($response['candidates'] ?? null)) {
      foreach ($response['candidates'] as $candidate) {
        $candidateContent = $candidate['content'] ?? null;
        if (is_string($candidateContent)) {
          $text .= $candidateContent;
        } elseif (is_array($candidateContent)) {
          foreach ($candidateContent as $part) {
            if (is_string($part)) {
              $text .= $part;
              continue;
            }
            if (is_array($part) && is_string($part['text'] ?? null)) {
              $text .= $part['text'];
            }
          }
        }
        if ($text === '' && is_string($candidate['output'] ?? null)) {
          $text .= $candidate['output'];
        }
        if ($text === '' && is_array($candidate['output'] ?? null)) {
          foreach ($candidate['output'] as $outputPart) {
            if (is_string($outputPart)) {
              $text .= $outputPart;
              continue;
            }
            if (is_array($outputPart) && is_string($outputPart['text'] ?? null)) {
              $text .= $outputPart['text'];
            }
          }
        }
        if ($text === '' && is_string($candidate['text'] ?? null)) {
          $text .= $candidate['text'];
        }
      }
    }
    if ($text === '' && is_string($response['output'] ?? null)) {
      $text = $response['output'];
    }
    return trim($text);
  }

  private static function normalizeJsonText(string $text): string
  {
    $text = trim($text);
    $text = preg_replace('/^```(?:json)?\s*/i', '', $text) ?? $text;
    $text = preg_replace('/\s*```$/', '', $text) ?? $text;
    if ($text === '') {
      return '';
    }
    if (json_decode($text, true) !== null) {
      return $text;
    }
    $extracted = self::extractFirstJson($text);
    return $extracted ?? $text;
  }

  private static function extractFirstJson(string $text): ?string
  {
    $length = mb_strlen($text, 'UTF-8');
    for ($start = 0; $start < $length; $start++) {
      $char = mb_substr($text, $start, 1, 'UTF-8');
      if ($char !== '{' && $char !== '[') {
        continue;
      }
      $depth = 0;
      $inString = false;
      $escaped = false;
      for ($i = $start; $i < $length; $i++) {
        $current = mb_substr($text, $i, 1, 'UTF-8');
        if ($escaped) {
          $escaped = false;
          continue;
        }
        if ($current === '\\') {
          $escaped = true;
          continue;
        }
        if ($current === '"') {
          $inString = !$inString;
          continue;
        }
        if ($inString) {
          continue;
        }
        if ($current === '{' || $current === '[') {
          $depth++;
          continue;
        }
        if ($current === '}' || $current === ']') {
          $depth--;
          if ($depth === 0) {
            $candidate = mb_substr($text, $start, $i - $start + 1, 'UTF-8');
            if (json_decode($candidate, true) !== null) {
              return $candidate;
            }
            break;
          }
        }
      }
    }
    return null;
  }
}

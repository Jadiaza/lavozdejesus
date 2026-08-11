<?php
declare(strict_types=1);

final class OpenAIProvider implements BibleStudyAiProviderInterface
{
  private $key; private $model; private $timeout; private $maxTokens;
  public function __construct(string $key, string $model, int $timeout, int $maxTokens) { $this->key=$key; $this->model=$model; $this->timeout=$timeout; $this->maxTokens=$maxTokens; }

  public function generateStudy(array $context): array
  {
    $clientRequestId = 'lvj-study-' . substr(hash(
      'sha256',
      json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    ), 0, 32);
    $response = HttpJsonClient::post('https://api.openai.com/v1/responses', [
      'Authorization: Bearer ' . $this->key, 'Content-Type: application/json',
      'X-Client-Request-Id: ' . $clientRequestId,
    ], [
      'model' => $this->model,
      'instructions' => BibleStudyPrompt::system((string)($context['metodo'] ?? BibleStudyMethod::DEFAULT), (string)($context['nivel'] ?? BibleStudyLevel::DEFAULT)),
      'input' => json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
      'max_output_tokens' => $this->maxTokens,
      'text' => ['format' => ['type' => 'json_schema', 'name' => 'bible_study', 'strict' => true, 'schema' => BibleStudySchema::jsonSchema((string)($context['metodo'] ?? BibleStudyMethod::DEFAULT))]],
    ], $this->timeout);
    $text = self::extractOpenAIText($response);
    $study = json_decode(self::normalizeJsonText($text), true);
    if (!is_array($study)) throw new RuntimeException('OpenAI no devolvió JSON válido.');
    $study = BibleStudySchema::prepareGenerated($study, $context);
    BibleStudySchema::validate($study, $context);
    return ['study' => $study, 'input_tokens' => $response['usage']['input_tokens'] ?? null,
      'output_tokens' => $response['usage']['output_tokens'] ?? null, 'model' => $this->model];
  }

  private static function extractOpenAIText(array $response): string
  {
    $text = (string) ($response['output_text'] ?? '');
    if ($text === '' && is_string($response['output'] ?? null)) {
      $text = (string) $response['output'];
    }
    if ($text === '' && is_array($response['output'] ?? null)) {
      foreach ($response['output'] as $item) {
        foreach (($item['content'] ?? []) as $part) {
          if (is_string($part)) {
            $text .= $part;
            continue;
          }
          if (is_array($part) && in_array(($part['type'] ?? ''), ['output_text', 'text'], true)) {
            $text .= (string) ($part['text'] ?? '');
          }
        }
      }
    }
    if ($text === '' && is_array($response['response'] ?? null)) {
      foreach (($response['response']['output'] ?? []) as $item) {
        foreach (($item['content'] ?? []) as $part) {
          if (is_string($part)) {
            $text .= $part;
            continue;
          }
          if (is_array($part) && in_array(($part['type'] ?? ''), ['output_text', 'text'], true)) {
            $text .= (string) ($part['text'] ?? '');
          }
        }
      }
    }
    if ($text === '' && is_array($response['choices'] ?? null)) {
      foreach ($response['choices'] as $choice) {
        if (is_array($choice['message'] ?? null)) {
          $messageContent = $choice['message']['content'] ?? null;
          if (is_string($messageContent)) {
            $text .= $messageContent;
          } elseif (is_array($messageContent)) {
            foreach ($messageContent as $part) {
              if (is_string($part)) {
                $text .= $part;
                continue;
              }
              if (is_array($part) && in_array(($part['type'] ?? ''), ['output_text', 'text'], true)) {
                $text .= (string) ($part['text'] ?? '');
              }
            }
          }
        }
        if ($text === '' && is_string($choice['message'] ?? null)) {
          $text .= $choice['message'];
        }
        if ($text === '' && is_string($choice['text'] ?? null)) {
          $text .= $choice['text'];
        }
      }
    }
    return trim((string) $text);
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

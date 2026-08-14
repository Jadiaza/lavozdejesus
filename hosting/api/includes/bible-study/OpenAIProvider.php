<?php
declare(strict_types=1);

final class OpenAIProvider implements BibleStudyAiProviderInterface
{
  private $key; private $model; private $timeout; private $maxTokens;
  public function __construct(string $key, string $model, int $timeout, int $maxTokens) { $this->key=$key; $this->model=$model; $this->timeout=$timeout; $this->maxTokens=$maxTokens; }

  public function generateStudy(array $context): array
  {
    $response = HttpJsonClient::post(
      'https://api.openai.com/v1/responses',
      $this->headers($context),
      $this->requestBody($context, false),
      $this->timeout
    );
    return $this->complete($response, $context);
  }

  public function startBackgroundStudy(array $context): array
  {
    $response = HttpJsonClient::post(
      'https://api.openai.com/v1/responses',
      $this->headers($context),
      $this->requestBody($context, true),
      min(60, $this->timeout)
    );
    $responseId = trim((string) ($response['id'] ?? ''));
    if (!preg_match('/^resp_[A-Za-z0-9_-]+$/', $responseId)) {
      throw new RuntimeException('OpenAI no devolvió un identificador de generación válido.');
    }
    return [
      'response_id' => $responseId,
      'status' => (string) ($response['status'] ?? 'queued'),
      'model' => (string) ($response['model'] ?? $this->model),
    ];
  }

  public function retrieveBackgroundStudy(string $responseId, array $context): array
  {
    if (!preg_match('/^resp_[A-Za-z0-9_-]+$/', $responseId)) {
      throw new InvalidArgumentException('Identificador de generación no válido.');
    }
    $response = HttpJsonClient::get(
      'https://api.openai.com/v1/responses/' . rawurlencode($responseId),
      ['Authorization: Bearer ' . $this->key, 'Content-Type: application/json'],
      min(60, $this->timeout)
    );
    $status = (string) ($response['status'] ?? '');
    if (in_array($status, ['queued', 'in_progress'], true)) {
      return ['state' => 'processing', 'status' => $status];
    }
    if ($status !== 'completed') {
      $reason = (string) (
        $response['incomplete_details']['reason']
        ?? $response['error']['message']
        ?? $status
        ?: 'desconocido'
      );
      return ['state' => 'failed', 'message' => 'OpenAI no pudo completar el estudio. Motivo: ' . mb_substr($reason, 0, 700) . '.'];
    }
    return ['state' => 'completed', 'result' => $this->complete($response, $context)];
  }

  private function headers(array $context): array
  {
    return [
      'Authorization: Bearer ' . $this->key,
      'Content-Type: application/json',
      'X-Client-Request-Id: lvj-study-' . substr(hash('sha256', json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)), 0, 32),
    ];
  }

  private function requestBody(array $context, bool $background): array
  {
    $method = (string) ($context['metodo'] ?? BibleStudyMethod::DEFAULT);
    $isIntegral = $method === 'integral_lvj';
    $verseCount = count($context['versiones']['platense']['versiculos'] ?? []);
    $outputTokens = $this->maxTokens;
    if ($isIntegral && $verseCount > 0) {
      $outputTokens = min($this->maxTokens, $verseCount <= 3 ? 16000 : ($verseCount <= 10 ? 28000 : 48000));
    }
    $text = [
      'format' => [
        'type' => 'json_schema',
        'name' => 'bible_study',
        'strict' => true,
        'schema' => BibleStudySchema::jsonSchema($method, $context),
      ],
    ];
    if ($isIntegral) $text['verbosity'] = 'low';
    $body = [
      'model' => $this->model,
      'instructions' => BibleStudyPrompt::system($method, (string) ($context['nivel'] ?? BibleStudyLevel::DEFAULT)),
      'input' => json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
      'max_output_tokens' => $outputTokens,
      'text' => $text,
    ];
    if ($isIntegral) $body['reasoning'] = ['effort' => 'none'];
    if ($background) $body['background'] = true;
    return $body;
  }

  private function complete(array $response, array $context): array
  {
    self::assertCompleteResponse($response);
    $text = self::extractOpenAIText($response);
    $study = json_decode(self::normalizeJsonText($text), true);
    if (!is_array($study)) throw new RuntimeException('OpenAI no devolvió JSON válido.');
    $study = BibleStudySchema::prepareGenerated($study, $context);
    BibleStudySchema::validate($study, $context);
    return [
      'study' => $study,
      'input_tokens' => $response['usage']['input_tokens'] ?? null,
      'output_tokens' => $response['usage']['output_tokens'] ?? null,
      'model' => (string) ($response['model'] ?? $this->model),
    ];
  }
  private static function assertCompleteResponse(array $response): void
  {
    if (($response['status'] ?? '') !== 'incomplete') {
      return;
    }
    $reason = (string) ($response['incomplete_details']['reason'] ?? 'desconocida');
    if ($reason === 'max_output_tokens') {
      throw new RuntimeException('OpenAI interrumpio el estudio al alcanzar el limite de tokens de salida.');
    }
    throw new RuntimeException('OpenAI devolvio un estudio incompleto. Motivo: ' . $reason . '.');
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

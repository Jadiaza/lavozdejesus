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
      'systemInstruction' => ['parts' => [['text' => BibleStudyPrompt::system((string)($context['nivel'] ?? BibleStudyLevel::DEFAULT))]]],
      'contents' => [['role' => 'user', 'parts' => [['text' => json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]]]],
      'generationConfig' => ['responseMimeType' => 'application/json', 'responseJsonSchema' => BibleStudySchema::jsonSchema(), 'maxOutputTokens' => $this->maxTokens],
    ], $this->timeout);
    $text = (string) ($response['candidates'][0]['content']['parts'][0]['text'] ?? '');
    $study = json_decode($text, true);
    if (!is_array($study)) throw new RuntimeException('Gemini no devolvió JSON válido.');
    BibleStudySchema::validate($study,$context);
    return ['study' => $study, 'input_tokens' => $response['usageMetadata']['promptTokenCount'] ?? null,
      'output_tokens' => $response['usageMetadata']['candidatesTokenCount'] ?? null, 'model' => $this->model];
  }
}

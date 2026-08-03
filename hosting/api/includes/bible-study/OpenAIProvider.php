<?php
declare(strict_types=1);

final class OpenAIProvider implements BibleStudyAiProviderInterface
{
  private $key; private $model; private $timeout; private $maxTokens;
  public function __construct(string $key, string $model, int $timeout, int $maxTokens) { $this->key=$key; $this->model=$model; $this->timeout=$timeout; $this->maxTokens=$maxTokens; }

  public function generateStudy(array $context): array
  {
    $response = HttpJsonClient::post('https://api.openai.com/v1/responses', [
      'Authorization: Bearer ' . $this->key, 'Content-Type: application/json',
    ], [
      'model' => $this->model,
      'instructions' => BibleStudyPrompt::system((string)($context['metodo'] ?? BibleStudyMethod::DEFAULT), (string)($context['nivel'] ?? BibleStudyLevel::DEFAULT)),
      'input' => json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
      'max_output_tokens' => $this->maxTokens,
      'tools' => [['type' => 'web_search']],
      'text' => ['format' => ['type' => 'json_schema', 'name' => 'bible_study', 'strict' => true, 'schema' => BibleStudySchema::jsonSchema((string)($context['metodo'] ?? BibleStudyMethod::DEFAULT))]],
    ], $this->timeout);
    $text = (string) ($response['output_text'] ?? '');
    if ($text === '' && is_array($response['output'] ?? null)) {
      foreach ($response['output'] as $item) foreach (($item['content'] ?? []) as $part) {
        if (($part['type'] ?? '') === 'output_text') $text .= (string) ($part['text'] ?? '');
      }
    }
    $study = json_decode($text, true);
    if (!is_array($study)) throw new RuntimeException('OpenAI no devolvió JSON válido.');
    BibleStudySchema::validate($study,$context);
    return ['study' => $study, 'input_tokens' => $response['usage']['input_tokens'] ?? null,
      'output_tokens' => $response['usage']['output_tokens'] ?? null, 'model' => $this->model];
  }
}

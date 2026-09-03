<?php

declare(strict_types=1);

require_once __DIR__ . '/../bible-study/HttpJsonClient.php';

final class SantoralAiService
{
  public const PROMPT_VERSION = 'santoral-lvj-1.0';

  private string $apiKey;
  private string $model;
  private int $timeout;
  private int $maxTokens;

  public function __construct()
  {
    $this->apiKey = trim((string) lvj_setting(
      'SANTORAL_AI_API_KEY',
      lvj_setting('BIBLE_AI_API_KEY', ''),
    ));
    $this->model = trim((string) lvj_setting(
      'SANTORAL_AI_MODEL',
      lvj_setting('BIBLE_AI_MODEL', 'gpt-5.4-mini'),
    ));
    $this->timeout = max(60, min(300, (int) lvj_setting('SANTORAL_AI_TIMEOUT', '180')));
    $this->maxTokens = max(2500, min(12000, (int) lvj_setting('SANTORAL_AI_MAX_TOKENS', '6000')));
  }

  public function isConfigured(): bool
  {
    return $this->apiKey !== '' && $this->model !== '';
  }

  public function generate(string $name, string $title, array $context = []): array
  {
    if (!$this->isConfigured()) throw new RuntimeException('El generador IA de Santoral no está configurado.');
    $name = trim($name);
    if ($name === '') throw new InvalidArgumentException('El Santoral requiere el nombre recibido desde Ordo.');

    $schema = [
      'type' => 'object',
      'additionalProperties' => false,
      'required' => ['frase_destacada','quien_fue','lucha_que_enfrento','secreto_de_santidad','ensenanza_para_hoy','como_puedo_imitarlo','paso_concreto','oracion_intercesion'],
      'properties' => [
        'frase_destacada' => ['type' => 'string', 'minLength' => 20],
        'quien_fue' => ['type' => 'string', 'minLength' => 180],
        'lucha_que_enfrento' => ['type' => 'string', 'minLength' => 100],
        'secreto_de_santidad' => ['type' => 'string', 'minLength' => 100],
        'ensenanza_para_hoy' => ['type' => 'string', 'minLength' => 100],
        'como_puedo_imitarlo' => ['type' => 'string', 'minLength' => 80],
        'paso_concreto' => ['type' => 'string', 'minLength' => 25],
        'oracion_intercesion' => ['type' => 'string', 'minLength' => 140],
      ],
    ];

    $input = [
      'santo' => ['nombre_ordo' => $name, 'titulo_ordo' => trim($title)],
      'contexto_ordo' => [
        'fecha' => trim((string) ($context['fecha'] ?? '')),
        'preludio' => trim((string) ($context['preludio'] ?? '')),
        'celebracion' => trim((string) ($context['celebracion'] ?? '')),
        'tiempo_liturgico' => trim((string) ($context['tiempo_liturgico'] ?? '')),
      ],
    ];

    $response = HttpJsonClient::post(
      'https://api.openai.com/v1/responses',
      ['Authorization: Bearer ' . $this->apiKey, 'Content-Type: application/json'],
      [
        'model' => $this->model,
        'instructions' => $this->instructions(),
        'input' => json_encode($input, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),
        'max_output_tokens' => $this->maxTokens,
        'text' => ['format' => ['type' => 'json_schema', 'name' => 'santoral_lvj', 'strict' => true, 'schema' => $schema]],
      ],
      $this->timeout,
    );

    $decoded = json_decode($this->extractText($response), true);
    if (!is_array($decoded)) throw new RuntimeException('La IA no devolvió el Santoral en JSON válido.');

    $content = [];
    foreach (array_keys($schema['properties']) as $field) {
      $content[$field] = trim((string) ($decoded[$field] ?? ''));
      if ($content[$field] === '') throw new RuntimeException('La IA omitió el campo obligatorio ' . $field . '.');
    }

    return [
      'content' => $content,
      'model' => (string) ($response['model'] ?? $this->model),
      'input_tokens' => $response['usage']['input_tokens'] ?? null,
      'output_tokens' => $response['usage']['output_tokens'] ?? null,
    ];
  }

  private function instructions(): string
  {
    return <<<'PROMPT'
Eres el asistente editorial católico de La Voz de Jesús. Preparas un BORRADOR del Santo del Día a partir de la identidad que el Ordo Colombiano ya determinó. Una persona revisará el contenido antes de publicarlo.

La identidad del santo NO la decides tú. Respeta exactamente nombre_ordo y titulo_ordo. No cambies de santo, no añadas otro y no confundas personas homónimas.

Devuelve exactamente estos ocho campos:
1. frase_destacada
2. quien_fue
3. lucha_que_enfrento
4. secreto_de_santidad
5. ensenanza_para_hoy
6. como_puedo_imitarlo
7. paso_concreto
8. oracion_intercesion

REGLAS OBLIGATORIAS:
- Español latino neutro, tono pastoral, cercano, sereno y fiel a la doctrina católica.
- Cristo debe permanecer en el centro; el santo se presenta como testigo y discípulo, nunca como sustituto de Dios.
- Usa únicamente hechos biográficos de alta certeza. Si un dato específico no es seguro, omítelo.
- No inventes fechas, lugares, cargos, papas, reyes, persecuciones, milagros, apariciones, martirios ni circunstancias históricas dudosas.
- No inventes citas textuales atribuidas al santo.
- frase_destacada será una síntesis espiritual EDITORIAL de La Voz de Jesús inspirada en su testimonio; no debe presentarse como cita histórica ni en primera persona.
- quien_fue: uno o dos párrafos claros que expliquen quién fue, su vocación o misión y por qué su testimonio es relevante, sin acumular datos inciertos.
- lucha_que_enfrento: explica una dificultad espiritual, pastoral o histórica vinculada de manera prudente a su vida. Si no hay certeza de un episodio concreto, formula la lucha en términos generales y verificables según su vocación.
- secreto_de_santidad: identifica la virtud, hábito espiritual o fidelidad evangélica que mejor sintetiza su camino.
- ensenanza_para_hoy: conecta su testimonio con la vida cristiana actual.
- como_puedo_imitarlo: orientaciones prácticas y realistas para un creyente de hoy.
- paso_concreto: una sola acción breve, realizable durante el día.
- oracion_intercesion: oración católica dirigida a Dios, pidiendo la intercesión del santo, cristocéntrica y sin atribuirle poder divino propio.
- No incluyas bibliografía, enlaces, encabezados adicionales ni notas técnicas.
- No uses información de una persona distinta con nombre parecido.
- Devuelve únicamente el JSON solicitado.
PROMPT;
  }

  private function extractText(array $response): string
  {
    $text = trim((string) ($response['output_text'] ?? ''));
    if ($text !== '') return $text;

    foreach (($response['output'] ?? []) as $item) {
      if (!is_array($item)) continue;
      foreach (($item['content'] ?? []) as $part) {
        if (is_array($part) && in_array((string) ($part['type'] ?? ''), ['output_text', 'text'], true)) {
          $text .= (string) ($part['text'] ?? '');
        }
      }
    }

    $text = trim($text);
    if ($text === '') throw new RuntimeException('La IA no devolvió contenido para el Santoral.');
    return $text;
  }
}

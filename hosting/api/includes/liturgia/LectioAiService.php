<?php

declare(strict_types=1);

require_once __DIR__ . '/../bible-study/HttpJsonClient.php';

final class LectioAiService
{
  public const PROMPT_VERSION = 'lectio-lvj-1.1';

  private string $apiKey;
  private string $model;
  private int $timeout;
  private int $maxTokens;

  public function __construct()
  {
    $this->apiKey = trim((string) lvj_setting(
      'LECTIO_AI_API_KEY',
      lvj_setting('BIBLE_AI_API_KEY', ''),
    ));
    $this->model = trim((string) lvj_setting(
      'LECTIO_AI_MODEL',
      lvj_setting('BIBLE_AI_MODEL', 'gpt-5.4-mini'),
    ));
    $this->timeout = max(60, min(300, (int) lvj_setting('LECTIO_AI_TIMEOUT', '180')));
    $this->maxTokens = max(2500, min(12000, (int) lvj_setting('LECTIO_AI_MAX_TOKENS', '6000')));
  }

  public function isConfigured(): bool
  {
    return $this->apiKey !== '' && $this->model !== '';
  }

  /**
   * Genera solamente un borrador. La publicación siempre requiere revisión humana.
   *
   * @return array{content:array<string,string>,model:string,input_tokens:mixed,output_tokens:mixed}
   */
  public function generate(string $citation, string $gospelText, array $liturgicalContext = []): array
  {
    if (!$this->isConfigured()) {
      throw new RuntimeException('El generador IA de Lectio no está configurado.');
    }

    $gospelText = trim($gospelText);
    if ($citation === '' || $gospelText === '') {
      throw new InvalidArgumentException('La Lectio requiere cita y texto completo del Evangelio.');
    }

    $schema = [
      'type' => 'object',
      'additionalProperties' => false,
      'required' => [
        'frase_destacada',
        'reflexion',
        'pregunta_meditar',
        'oracion',
        'compromiso',
        'mensaje_final',
      ],
      'properties' => [
        'frase_destacada' => ['type' => 'string', 'minLength' => 10],
        'cita_destacada' => ['type' => 'string', 'minLength' => 4, 'maxLength' => 80],
        'reflexion' => ['type' => 'string', 'minLength' => 300],
        'pregunta_meditar' => ['type' => 'string', 'minLength' => 20],
        'oracion' => ['type' => 'string', 'minLength' => 220],
        'compromiso' => ['type' => 'string', 'minLength' => 20],
        'mensaje_final' => ['type' => 'string', 'minLength' => 20],
      ],
    ];

    $input = [
      'cita' => $citation,
      'evangelio' => $gospelText,
      'contexto_liturgico' => [
        'fecha' => trim((string) ($liturgicalContext['fecha'] ?? '')),
        'tiempo_liturgico' => trim((string) ($liturgicalContext['tiempo_liturgico'] ?? '')),
        'celebracion' => trim((string) ($liturgicalContext['celebracion'] ?? '')),
      ],
    ];

    $response = HttpJsonClient::post(
      'https://api.openai.com/v1/responses',
      [
        'Authorization: Bearer ' . $this->apiKey,
        'Content-Type: application/json',
      ],
      [
        'model' => $this->model,
        'instructions' => $this->instructions(),
        'input' => json_encode($input, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),
        'max_output_tokens' => $this->maxTokens,
        'text' => [
          'format' => [
            'type' => 'json_schema',
            'name' => 'lectio_divina_lvj',
            'strict' => true,
            'schema' => $schema,
          ],
        ],
      ],
      $this->timeout,
    );

    $decoded = json_decode($this->extractText($response), true);
    if (!is_array($decoded)) {
      throw new RuntimeException('La IA no devolvió una Lectio en JSON válido.');
    }

    $content = [];
    foreach (array_keys($schema['properties']) as $field) {
      $content[$field] = trim((string) ($decoded[$field] ?? ''));
      if ($content[$field] === '') {
        throw new RuntimeException('La IA omitió el campo obligatorio ' . $field . '.');
      }
    }

    $this->validateContent($content, $gospelText, $citation);

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
Eres el asistente editorial católico de La Voz de Jesús. Debes preparar una Lectio Divina pastoral a partir EXCLUSIVAMENTE del Evangelio suministrado. La salida será revisada por una persona antes de publicarse.

La Lectio tiene exactamente siete componentes visibles y no debes agregar otros:
1. frase_destacada
2. reflexion
3. pregunta_meditar
4. oracion
5. compromiso
6. mensaje_final

REGLAS OBLIGATORIAS:
- Español latino neutro, tono cercano, sereno, espiritual, pastoral y cristocéntrico.
- Fidelidad a la doctrina católica y al sentido real del texto bíblico.
- No inventes hechos, versículos, citas, personajes, promesas ni enseñanzas que no estén justificadas por el Evangelio.
- La frase destacada DEBE ser una cita textual tomada del Evangelio suministrado. No la parafrasees. Preséntala entre comillas angulares españolas « ».
- cita_destacada debe identificar el versículo exacto de frase_destacada, con abreviatura bíblica católica, por ejemplo Mc 6, 20. No incluyas comillas ni texto adicional.
- Si el texto continuo no permite identificar con certeza el versículo exacto, usa la cita completa recibida. Nunca inventes una numeración.
- La reflexión debe tener exactamente tres párrafos desarrollados. Primer párrafo: ilumina el mensaje del Evangelio. Segundo: confronta la vida concreta del creyente. Tercero: conduce a una respuesta personal a Jesucristo. Busca profundidad sin lenguaje académico.
- La pregunta para meditar será una sola pregunta, personal, concreta y profunda.
- La oración debe tener exactamente tres párrafos, ser una respuesta directa a Jesús, estar relacionada con el Evangelio y terminar de forma natural con Amén.
- El compromiso debe ser una acción concreta, realista y practicable.
- El mensaje final debe ser breve, esperanzador y fácil de recordar.
- Cuando el Evangelio hable del demonio, del mal, de enfermedad o de liberación, conserva el sentido bíblico y una prudencia pastoral equilibrada. No atribuyas automáticamente problemas humanos, emocionales o psicológicos a causas demoníacas.
- No uses la reflexión del Ordo ni fuentes externas. Trabaja con el texto bíblico recibido.
- No incluyas encabezados dentro de los valores. Devuelve únicamente el JSON solicitado.
PROMPT;
  }

  /** @param array<string,string> $content */
  private function validateContent(array $content, string $gospelText, string $gospelCitation): void
  {
    $phrase = trim($content['frase_destacada'], " \t\n\r\0\x0B«»\"“”");
    if (mb_strlen($phrase, 'UTF-8') < 10) {
      throw new RuntimeException('La frase destacada generada es demasiado corta.');
    }

    $haystack = $this->normalizeForMatch($gospelText);
    $needle = $this->normalizeForMatch($phrase);
    if ($needle === '' || !str_contains($haystack, $needle)) {
      throw new RuntimeException('La frase destacada no coincide literalmente con el Evangelio recibido.');
    }

    if (preg_match('/^[1-3]?\\s*[A-Za-zÁÉÍÓÚÑáéíóúñ]+\\s+\\d/u', $content['cita_destacada']) !== 1) {
      throw new RuntimeException('La cita destacada no tiene un formato bíblico válido.');
    }

    $reflectionParagraphs = array_values(array_filter(
      preg_split('/\n\s*\n/u', trim($content['reflexion'])) ?: [],
      fn ($p) => trim((string) $p) !== '',
    ));
    if (count($reflectionParagraphs) !== 3) {
      throw new RuntimeException('La reflexión debe contener exactamente tres párrafos.');
    }

    $prayerParagraphs = array_values(array_filter(
      preg_split('/\n\s*\n/u', trim($content['oracion'])) ?: [],
      fn ($p) => trim((string) $p) !== '',
    ));
    if (count($prayerParagraphs) !== 3) {
      throw new RuntimeException('La oración debe contener exactamente tres párrafos.');
    }

    if (substr_count($content['pregunta_meditar'], '?') + substr_count($content['pregunta_meditar'], '¿') < 1) {
      throw new RuntimeException('La pregunta para meditar debe formularse como pregunta.');
    }
  }

  private function normalizeForMatch(string $value): string
  {
    $value = html_entity_decode(strip_tags($value), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $value = mb_strtolower($value, 'UTF-8');
    $value = preg_replace('/[«»"“”‘’.,;:!?¿¡()\[\]{}]/u', ' ', $value) ?? $value;
    $value = preg_replace('/\s+/u', ' ', $value) ?? $value;
    return trim($value);
  }

  private function extractText(array $response): string
  {
    $text = trim((string) ($response['output_text'] ?? ''));
    if ($text !== '') {
      return $text;
    }

    foreach (($response['output'] ?? []) as $item) {
      if (!is_array($item)) {
        continue;
      }
      foreach (($item['content'] ?? []) as $part) {
        if (is_array($part) && in_array((string) ($part['type'] ?? ''), ['output_text', 'text'], true)) {
          $text .= (string) ($part['text'] ?? '');
        }
      }
    }

    $text = trim($text);
    if ($text === '') {
      throw new RuntimeException('La IA no devolvió contenido para la Lectio.');
    }

    return $text;
  }
}

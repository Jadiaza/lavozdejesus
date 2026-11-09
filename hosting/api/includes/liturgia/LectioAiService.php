<?php

declare(strict_types=1);

require_once __DIR__ . '/../bible-study/HttpJsonClient.php';

final class LectioAiService
{
  public const PROMPT_VERSION = 'lectio-lvj-2.6';

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
        'cita_destacada',
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
      'cita_evangelio' => $citation,
      'primera_lectura' => [
        'cita' => trim((string) ($liturgicalContext['primera_lectura_cita'] ?? '')),
        'texto' => trim((string) ($liturgicalContext['primera_lectura_texto'] ?? '')),
      ],
      'salmo' => [
        'cita' => trim((string) ($liturgicalContext['salmo_cita'] ?? '')),
        'respuesta' => trim((string) ($liturgicalContext['salmo_respuesta'] ?? '')),
        'texto' => trim((string) ($liturgicalContext['salmo_texto'] ?? '')),
      ],
      'segunda_lectura' => [
        'cita' => trim((string) ($liturgicalContext['segunda_lectura_cita'] ?? '')),
        'texto' => trim((string) ($liturgicalContext['segunda_lectura_texto'] ?? '')),
      ],
      'evangelio' => [
        'cita' => $citation,
        'texto' => $gospelText,
      ],
      'contexto_liturgico' => [
        'fecha' => trim((string) ($liturgicalContext['fecha'] ?? '')),
        'tiempo_liturgico' => trim((string) ($liturgicalContext['tiempo_liturgico'] ?? '')),
        'celebracion' => trim((string) ($liturgicalContext['celebracion'] ?? '')),
        'grado_celebracion' => trim((string) ($liturgicalContext['grado_celebracion'] ?? '')),
        'color_liturgico' => trim((string) ($liturgicalContext['color_liturgico'] ?? '')),
        'fuente' => trim((string) ($liturgicalContext['fuente'] ?? 'Ordo de la Conferencia Episcopal de Colombia')),
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
Eres el asistente editorial católico de La Voz de Jesús y responsable de elaborar la Lectio Divina diaria de LVJPRAYER conforme al MÉTODO OFICIAL LVJ 2.6. Tu misión es acompañar al lector desde la Palabra proclamada hasta el encuentro con Jesucristo, la comunión con la Iglesia y una respuesta concreta de fe. La salida será un borrador sujeto a revisión humana antes de publicarse.

FUENTE LITÚRGICA Y FIDELIDAD:
- La fuente litúrgica de referencia es el Ordo de la Conferencia Episcopal de Colombia. Respeta los datos y textos suministrados por el sistema.
- Trabaja exclusivamente con las lecturas recibidas en la entrada. No consultes ni inventes lecturas, citas, versículos, alternativas, celebraciones o datos litúrgicos.
- No sustituyas, agregues, elimines ni intercambies lecturas.
- Si un campo de lectura está vacío, considéralo no suministrado. No lo completes ni afirmes que fue proclamado.
- Respeta las opciones seleccionadas. Una lectura alternativa no seleccionada no debe tratarse como proclamada.
- La Biblia de Jerusalén, quinta edición, es la referencia preferente para la comprensión e interpretación, pero no autoriza modificar los textos litúrgicos recibidos.
- Si solo se suministra el Evangelio, prepara una Lectio centrada en él y no simules una integración de otras lecturas.

DISCERNIMIENTO BÍBLICO:
- Examina cada lectura suministrada en su contexto, género literario, personajes, situación y mensaje propio.
- Identifica qué revela cada texto acerca de Dios, de la historia de la salvación y de la vida de fe.
- Construye relaciones únicamente cuando sean bíblica y teológicamente legítimas: continuidad, complementariedad, contraste, promesa y cumplimiento, profundización o revelación cristológica.
- Conserva la voz propia del salmo como oración; no lo reduzcas a repetición de la primera lectura.
- Integra la segunda lectura cuando exista y haya sido suministrada.
- El Evangelio ocupa el centro de la interpretación cristiana y debe iluminar el conjunto sin borrar el sentido original de los otros textos ni forzar correspondencias.
- No conviertas la reflexión en comentarios separados ni en una enumeración de símbolos. Construye un único hilo bíblico y espiritual.

FIDELIDAD CATÓLICA Y CENTRALIDAD DE CRISTO:
- Mantén fidelidad a la doctrina católica, a la Sagrada Escritura y a la Tradición viva de la Iglesia.
- Conduce al encuentro con Jesucristo, muerto y resucitado, Señor y Salvador; no lo presentes solamente como maestro moral o ejemplo de valores.
- Muestra la acción de la gracia y la respuesta libre del creyente. Evita moralismos, culpabilización y promesas espirituales no fundadas.
- La fe cristiana no es individualista. Cuando las lecturas lo permitan, incorpora la pertenencia a la Iglesia, que es el Cuerpo de Cristo, la comunión, la fraternidad, el servicio y el testimonio.
- Incorpora la dimensión sacramental solo cuando exista fundamento bíblico y teológico. Considera la Eucaristía como memorial del sacrificio pascual y presencia real de Cristo; el Bautismo como incorporación a Cristo; y la Reconciliación como encuentro con la misericordia de Dios. No fuerces estas referencias ni reduzcas los sacramentos a símbolos.
- Cuando corresponda, muestra la dimensión familiar, comunitaria, eclesial o social de la fe.

ACTUALIZACIÓN PASTORAL:
- Lleva la Palabra a una o dos realidades humanas significativas, sin presuponer la situación personal del lector.
- Puedes iluminar la vida familiar, las relaciones, el sufrimiento, el duelo, las heridas interiores, las decisiones, la conversión, la vida comunitaria, la justicia, la solidaridad y la oración, según lo que permitan las lecturas.
- No acumules problemas ni conviertas la reflexión en consejos genéricos o intervención psicológica.
- No atribuyas automáticamente enfermedades, conflictos o dificultades emocionales a causas demoníacas. Mantén prudencia pastoral.

ESTRUCTURA DE LOS SIETE CAMPOS:
La salida debe contener exactamente estos siete campos, en este orden, sin propiedades adicionales:
1. frase_destacada
2. cita_destacada
3. reflexion
4. pregunta_meditar
5. oracion
6. compromiso
7. mensaje_final

1) frase_destacada:
- Debe ser una cita textual del Evangelio suministrado, sin parafrasear.
- Preséntala entre comillas angulares españolas « ».

2) cita_destacada:
- Debe identificar el versículo exacto de la frase destacada, con abreviatura bíblica católica, por ejemplo Jn 2, 19.
- No incluyas comillas ni texto adicional.
- Si el texto no permite identificar con certeza el versículo, utiliza la cita completa del Evangelio recibida. Nunca inventes numeración.

3) reflexion:
- Debe contener exactamente tres párrafos desarrollados, separados por una línea en blanco.
- Primer párrafo: desarrolla la unidad de las lecturas suministradas, el mensaje propio de cada una y su progresión hacia la plenitud en Jesucristo. Si faltan lecturas, no simules su presencia.
- Segundo párrafo: ilumina una o dos realidades humanas concretas y muestra cómo la Palabra interpela, sostiene o invita a la conversión. Incorpora la dimensión comunitaria cuando sea pertinente.
- Tercer párrafo: conduce al encuentro personal con Cristo, muestra la acción de su gracia y la respuesta de fe. Integra la dimensión eclesial y sacramental cuando corresponda al mensaje bíblico.
- Los tres párrafos deben formar una sola reflexión, no comentarios independientes.
- Busca profundidad bíblica y pastoral con lenguaje claro, natural y no académico.

4) pregunta_meditar:
- Debe ser una sola pregunta personal, concreta y profunda.
- Nace directamente de las lecturas e interpela la conciencia delante de Dios.
- Puede abordar la conversión, el seguimiento de Cristo, la comunión eclesial o la vida sacramental si el texto lo permite.
- Evita preguntas genéricas, dobles o que repitan literalmente la reflexión.

5) oracion:
- Debe contener exactamente tres párrafos, separados por una línea en blanco.
- Primer párrafo: adoración y contemplación del misterio de Dios y de Jesucristo revelado en las lecturas.
- Segundo párrafo: reconocimiento de la propia necesidad, entrega, petición e invocación al Espíritu Santo; pedir la gracia de vivir en comunión con la Iglesia y participar de los sacramentos cuando sea pertinente.
- Tercer párrafo: confianza y disponibilidad para seguir a Cristo y llevar su Palabra a la vida.
- Debe ser católica, cristocéntrica, contemplativa, profunda y natural.
- Termina exactamente con «Amén.»

6) compromiso:
- Propón una acción principal, concreta, realizable y verificable durante el día.
- Debe nacer de las lecturas y ser respuesta a la gracia, no una condición para recibir el amor de Dios.
- Puede ser oración, reconciliación, caridad, servicio, conversión o participación consciente en la vida eclesial.
- Evita listas de tareas y formulaciones vagas. Si se propone oración como preparación, deja clara cuál es la acción principal.

7) mensaje_final:
- Una frase breve, esperanzadora y cristocéntrica que acompañe la jornada.
- No repitas literalmente la frase destacada, la pregunta ni el cierre de la reflexión.

ESTILO EDITORIAL LVJ:
- Español latino neutro; tono cercano, sereno, espiritual, contemplativo y pastoral.
- Claridad y profundidad sin grandilocuencia ni lenguaje académico.
- Cada campo debe aportar una dimensión nueva; evita repeticiones, frases prefabricadas, generalidades vacías, enumeraciones innecesarias y transiciones mecánicas.
- La Lectio debe alimentar tanto a quien lleva años en la fe como a quien comienza: rigor sin oscuridad, sencillez sin empobrecimiento.
- El lector debe terminar reconociendo que Dios le ha hablado, que Cristo sale a su encuentro y que puede responder con un paso concreto de fe.

SALIDA Y VALIDACIÓN:
- Devuelve únicamente un objeto JSON válido, sin Markdown, encabezados ni explicaciones externas.
- Exactamente siete propiedades, en el orden indicado; todos los valores deben ser cadenas.
- frase_destacada debe ser literal del Evangelio recibido.
- reflexion y oracion deben tener exactamente tres párrafos cada una, separados por dos saltos de línea.
- pregunta_meditar debe contener una sola pregunta.
- oracion debe terminar exactamente con «Amén.»
- No agregues propiedades, comentarios ni citas externas.
- Revisa coherencia bíblica, fidelidad doctrinal, centralidad de Cristo, pertinencia eclesial y sacramental, profundidad pastoral y ausencia de repeticiones antes de responder.
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

<?php
declare(strict_types=1);

final class BibleStudyLevel
{
  public const DEFAULT = 'formativo';
  public const VALUES = ['pastoral','teologico','doctrinal','formativo'];

  public static function normalize($value): string
  {
    $level = mb_strtolower(trim((string) $value));
    if ($level === '') $level = self::DEFAULT;
    // Compatibilidad de lectura con el nombre usado por los estudios históricos.
    if ($level === 'formador') $level = 'formativo';
    if (!in_array($level, self::VALUES, true)) throw new InvalidArgumentException('El nivel de estudio no es válido.');
    return $level;
  }

  public static function config(string $level, string $method = BibleStudyMethod::DEFAULT): array
  {
    $level = self::normalize($level);
    $shared = ['referencia','titulo','resumen','textos','comprension_global','contexto_biblico','mensaje_teologico','mensaje_cristologico','referencias_cruzadas','aplicacion_espiritual','preguntas_para_meditar','advertencias'];
    $configs = [
      'pastoral' => [
        'label'=>'Pastoral','depth'=>'basic','style'=>'simple',
        'focus'=>array_merge($shared,['actualizacion_pastoral','lectio_divina']),
        'instruction'=>'Explica con lenguaje sencillo el mensaje central, lo que revela de Dios y de la persona, la relación prudente con Cristo y su aplicación cotidiana. Evita debates técnicos innecesarios.',
      ],
      'teologico' => [
        'label'=>'Teológico','depth'=>'advanced','style'=>'accessible-theological',
        'focus'=>array_merge($shared,['comparacion_traducciones','delimitacion','lectura_comprension','reescritura_comparacion','verificacion_unidad','genero_literario','estructura','proposiciones','analisis_proposiciones','articulacion','palabras_clave','semantica_texto','contexto_historico']),
        'instruction'=>'Profundiza en el contexto, género, unidad, estructura, semántica, traducciones y teología con lenguaje accesible. No incluyas idiomas originales ni crítica textual no verificada.',
      ],
      'doctrinal' => [
        'label'=>'Doctrinal','depth'=>'advanced','style'=>'doctrinal',
        'focus'=>array_merge($shared,['contexto_historico','actualizacion_pastoral','lectio_divina']),
        'instruction'=>'Relaciona el pasaje con la doctrina católica. Prioriza Escritura, concilios, Catecismo, Magisterio y después Padres y comentarios. No presentes opiniones académicas como enseñanza oficial ni inventes numerales.',
      ],
      'formativo' => [
        'label'=>'Formativo','depth'=>'complete','style'=>'academic-pastoral',
        'focus'=>array_keys(BibleStudySchema::jsonSchema($method)['properties']),
        'instruction'=>'Desarrolla el formato maestro completo con profundidad académica y aplicación pastoral, de modo que sirva para preparar catequesis, clases, predicaciones y encuentros.',
      ],
    ];
    return ['level'=>$level] + $configs[$level];
  }

  public static function prompt(string $level, string $method = BibleStudyMethod::DEFAULT): string
  {
    $config = self::config($level, $method);
    return "\n\nNIVEL DE ESTUDIO\nNivel: {$config['label']}. Profundidad: {$config['depth']}. Estilo: {$config['style']}.\n{$config['instruction']}\nEl JSON conserva siempre todas las claves del formato maestro de Salmo 8 para mantener compatibilidad. Desarrolla ampliamente las claves prioritarias de este nivel. En las demás usa una síntesis breve o una colección vacía cuando no corresponda; nunca inventes contenido para completarlas.\nClaves prioritarias: ".implode(', ', $config['focus']).'.';
  }
}

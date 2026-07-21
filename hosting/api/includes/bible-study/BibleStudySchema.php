<?php
declare(strict_types=1);

final class BibleStudySchema
{
  public static function jsonSchema(): array
  {
    $textVersion = ['anyOf' => [
      ['type'=>'object','additionalProperties'=>false,'required'=>['disponible','texto'],'properties'=>[
        'disponible'=>['type'=>'boolean','enum'=>[true]],'texto'=>['type'=>'string'],
      ]],
      ['type'=>'object','additionalProperties'=>false,'required'=>['disponible','texto','observacion'],'properties'=>[
        'disponible'=>['type'=>'boolean','enum'=>[false]],'texto'=>['type'=>'string'],'observacion'=>['type'=>'string'],
      ]],
    ]];
    $comparison = ['type' => 'object', 'additionalProperties' => false, 'required' => ['epoca','estilo','matices'], 'properties' => [
      'epoca' => ['type' => 'string'], 'estilo' => ['type' => 'string'],
      'matices' => ['type' => 'array', 'items' => ['type' => 'string']],
    ]];
    return ['type' => 'object', 'additionalProperties' => false, 'required' => [
      'referencia','titulo','resumen','textos','comprension_global','comparacion_traducciones',
      'delimitacion','genero_literario','estructura','proposiciones','palabras_clave','contexto_historico',
      'lectura_comprension','reescritura_comparacion','verificacion_unidad','analisis_proposiciones','articulacion','semantica_texto',
      'contexto_biblico','mensaje_teologico','mensaje_cristologico','referencias_cruzadas',
      'aplicacion_espiritual','actualizacion_pastoral','preguntas_para_meditar','lectio_divina','advertencias',
    ], 'properties' => [
      'referencia' => ['type' => 'string'], 'titulo' => ['type' => 'string'], 'resumen' => ['type' => 'string'],
      'textos' => ['type' => 'object', 'additionalProperties' => false, 'required' => ['platense','torres_amat'], 'properties' => [
        'platense' => $textVersion, 'torres_amat' => $textVersion,
      ]],
      'comprension_global' => ['type' => 'string'],
      'comparacion_traducciones' => ['type' => 'object', 'additionalProperties' => false, 'required' => ['platense','torres_amat','coincidencias','diferencias_relevantes','conclusion'], 'properties' => [
        'platense' => $comparison, 'torres_amat' => $comparison,
        'coincidencias' => ['type' => 'array', 'items' => ['type' => 'string']],
        'diferencias_relevantes' => ['type' => 'array', 'items' => ['type' => 'string']],
        'conclusion' => ['type' => 'string'],
      ]],
      'delimitacion' => self::stringObject(['unidad','justificacion']),
      'lectura_comprension' => ['type'=>'object','additionalProperties'=>false,'required'=>['lectura_inicial','conexiones','oposiciones','movimiento_general'],'properties'=>[
        'lectura_inicial'=>['type'=>'string'],'conexiones'=>['type'=>'array','items'=>['type'=>'string']],
        'oposiciones'=>['type'=>'array','items'=>['type'=>'string']],'movimiento_general'=>['type'=>'string'],
      ]],
      'reescritura_comparacion' => self::objectArray(['referencia','platense','torres_amat','observacion']),
      'verificacion_unidad' => ['type'=>'object','additionalProperties'=>false,'required'=>['inicio','fin','criterios','conclusion'],'properties'=>[
        'inicio'=>['type'=>'string'],'fin'=>['type'=>'string'],'criterios'=>['type'=>'array','items'=>['type'=>'string']],'conclusion'=>['type'=>'string'],
      ]],
      'genero_literario' => self::stringObject(['tipo','explicacion']),
      'estructura' => self::objectArray(['versiculos','titulo','explicacion']),
      'proposiciones' => self::objectArray(['texto','tipo','explicacion']),
      'analisis_proposiciones' => self::objectArray(['versiculos','clasificacion','texto','depende_de','funcion','tema_etapa']),
      'articulacion' => self::objectArray(['orden','versiculos','etapa','pregunta_guia','sujeto','verbo_central','desarrollo']),
      'palabras_clave' => self::objectArray(['termino','significado','funcion_en_el_texto']),
      'semantica_texto' => self::objectArray(['termino','versiculos','sentido_contextual','funcion_en_unidad']),
      'contexto_historico' => ['type' => 'string'], 'contexto_biblico' => ['type' => 'string'],
      'mensaje_teologico' => ['type' => 'string'], 'mensaje_cristologico' => ['type' => 'string'],
      'referencias_cruzadas' => self::objectArray(['referencia','relacion']),
      'aplicacion_espiritual' => ['type' => 'string'], 'actualizacion_pastoral' => ['type' => 'string'],
      'preguntas_para_meditar' => ['type' => 'array', 'items' => ['type' => 'string']],
      'lectio_divina' => self::stringObject(['lectura','meditacion','oracion','contemplacion','compromiso']),
      'advertencias' => ['type' => 'array', 'items' => ['type' => 'string']],
    ]];
  }

  public static function validate(array $study): void
  {
    foreach (self::jsonSchema()['required'] as $key) {
      if (!array_key_exists($key, $study)) throw new RuntimeException("El estudio no contiene {$key}.");
    }
    if (!is_array($study['textos']) || !is_array($study['lectio_divina'])) {
      throw new RuntimeException('El estudio generado no respeta el esquema requerido.');
    }
    if (array_keys($study['textos']) !== ['platense','torres_amat'] || array_key_exists('scio', $study['comparacion_traducciones'])) {
      throw new RuntimeException('El estudio generado contiene versiones bíblicas no autorizadas.');
    }
  }

  private static function stringObject(array $keys): array
  {
    return ['type' => 'object', 'additionalProperties' => false, 'required' => $keys, 'properties' => array_fill_keys($keys, ['type' => 'string'])];
  }

  private static function objectArray(array $keys): array
  {
    return ['type' => 'array', 'items' => self::stringObject($keys)];
  }
}

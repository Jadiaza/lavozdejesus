<?php
declare(strict_types=1);

final class BibleStudySchema
{
  public static function jsonSchema(string $method = BibleStudyMethod::DEFAULT)
  {
    $method = BibleStudyMethod::normalize($method);
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
    $schema = ['type' => 'object', 'additionalProperties' => false, 'required' => [
      'metodo','modelo_referencia','tecnicas',
      'referencia','titulo','resumen','textos','comprension_global','comparacion_traducciones',
      'delimitacion','genero_literario','estructura','proposiciones','palabras_clave','contexto_historico',
      'lectura_comprension','reescritura_comparacion','verificacion_unidad','analisis_proposiciones','articulacion','semantica_texto',
      'contexto_biblico','mensaje_teologico','mensaje_cristologico','referencias_cruzadas',
      'aplicacion_espiritual','actualizacion_pastoral','preguntas_para_meditar','lectio_divina','advertencias',
    ], 'properties' => [
      'metodo' => ['type'=>'string','enum'=>[$method]],
      'modelo_referencia' => ['type'=>['string','null']],
      'tecnicas' => ['type'=>'array','items'=>['type'=>'string']],
      'referencia' => ['type' => 'string'], 'titulo' => ['type' => 'string'], 'resumen' => ['type' => 'string'],
      'textos' => ['type' => 'object', 'additionalProperties' => false, 'required' => ['platense','torres_amat','scio'], 'properties' => [
        'platense' => $textVersion, 'torres_amat' => $textVersion, 'scio' => $textVersion,
      ]],
      'comprension_global' => ['type' => 'string'],
      'comparacion_traducciones' => ['type' => 'object', 'additionalProperties' => false, 'required' => ['platense','torres_amat','scio','coincidencias','diferencias_relevantes','conclusion'], 'properties' => [
        'platense' => $comparison, 'torres_amat' => $comparison, 'scio' => $comparison,
        'coincidencias' => ['type' => 'array', 'items' => ['type' => 'string']],
        'diferencias_relevantes' => ['type' => 'array', 'items' => ['type' => 'string']],
        'conclusion' => ['type' => 'string'],
      ]],
      'delimitacion' => self::stringObject(['unidad','justificacion']),
      'lectura_comprension' => ['type'=>'object','additionalProperties'=>false,'required'=>['lectura_inicial','conexiones','oposiciones','movimiento_general'],'properties'=>[
        'lectura_inicial'=>['type'=>'string'],'conexiones'=>['type'=>'array','items'=>['type'=>'string']],
        'oposiciones'=>['type'=>'array','items'=>['type'=>'string']],'movimiento_general'=>['type'=>'string'],
      ]],
      'reescritura_comparacion' => self::objectArray(['referencia','platense','torres_amat','scio','observacion']),
      'verificacion_unidad' => ['type'=>'object','additionalProperties'=>false,'required'=>['inicio','fin','criterios','conclusion'],'properties'=>[
        'inicio'=>['type'=>'string'],'fin'=>['type'=>'string'],'criterios'=>['type'=>'array','items'=>['type'=>'string']],'conclusion'=>['type'=>'string'],
      ]],
      'genero_literario' => self::stringObject(['tipo','explicacion']),
      'estructura' => self::objectArray(['versiculos','titulo','explicacion']),
      'proposiciones' => self::objectArray(['texto','tipo','explicacion']),
      'analisis_proposiciones' => self::propositionAnalysis(),
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
    if ($method === 'integral_lvj') {
      $schema['required'][] = 'tecnica_estructural';
      $schema['required'][] = 'arcing';
      $schema['properties']['tecnica_estructural'] = ['type'=>'string','enum'=>['arcing']];
      $schema['properties']['arcing'] = self::arcingSchema();
    }
    return $schema;
  }

  public static function validate(array $study, array $context = [])
  {
    $method = BibleStudyMethod::normalize($context['metodo'] ?? $study['metodo'] ?? null);
    foreach (self::jsonSchema($method)['required'] as $key) {
      if (!array_key_exists($key, $study)) throw new RuntimeException("El estudio no contiene {$key}.");
    }
    if (($study['metodo'] ?? '') !== $method) throw new RuntimeException('El método devuelto no coincide con el método solicitado.');
    if ($method === 'metodo_salmo' && ($study['modelo_referencia'] ?? null) !== 'salmo8-1.0') throw new RuntimeException('El Método Salmo no conserva su modelo de referencia.');
    if ($method === 'integral_lvj') self::validateArcing($study['arcing'] ?? null, $study['analisis_proposiciones'] ?? null);
    self::validatePropositions($study['analisis_proposiciones'] ?? null, $context);
    if (!is_array($study['textos']) || !is_array($study['lectio_divina'])) {
      throw new RuntimeException('El estudio generado no respeta el esquema requerido.');
    }
    if (array_keys($study['textos']) !== ['platense','torres_amat','scio'] || !array_key_exists('scio', $study['comparacion_traducciones'])) {
      throw new RuntimeException('El estudio generado contiene versiones bíblicas no autorizadas.');
    }
  }

  private static function stringObject(array $keys)
  {
    return ['type' => 'object', 'additionalProperties' => false, 'required' => $keys, 'properties' => array_fill_keys($keys, ['type' => 'string'])];
  }

  private static function objectArray(array $keys)
  {
    return ['type' => 'array', 'items' => self::stringObject($keys)];
  }

  private static function propositionAnalysis()
  {
    $s = ['type'=>'string'];
    $sn = ['type'=>['string','null']];
    $topic = ['type'=>'object','additionalProperties'=>false,'required'=>['etapa','tema','color_key'],'properties'=>[
      'etapa'=>$s,'tema'=>$s,'color_key'=>$s,
    ]];
    $prop = ['type'=>'object','additionalProperties'=>false,'required'=>['id','orden','tipo','texto','nucleo_verbal','lema_verbal','sujeto','tipo_sujeto','depende_de','relacion','funcion_discursiva','estructura_eliptica','texto_sobreentendido','nivel_confianza','requiere_revision'],'properties'=>[
      'id'=>$s,'orden'=>['type'=>'integer','minimum'=>1],'tipo'=>['type'=>'string','enum'=>['PP','PS']],
      'texto'=>$s,'nucleo_verbal'=>$s,'lema_verbal'=>$s,'sujeto'=>$s,'tipo_sujeto'=>$s,
      'depende_de'=>$sn,'relacion'=>$s,'funcion_discursiva'=>$s,'estructura_eliptica'=>['type'=>'boolean'],
      'texto_sobreentendido'=>$sn,'nivel_confianza'=>['type'=>'string','enum'=>['alta','media','baja']],
      'requiere_revision'=>['type'=>'boolean'],
    ]];
    $coverage = ['type'=>'object','additionalProperties'=>false,'required'=>['completa','fragmentos_no_clasificados','fragmentos_duplicados'],'properties'=>[
      'completa'=>['type'=>'boolean'],'fragmentos_no_clasificados'=>['type'=>'array','items'=>$s],
      'fragmentos_duplicados'=>['type'=>'array','items'=>$s],
    ]];
    $verse = ['type'=>'object','additionalProperties'=>false,'required'=>['id','numero','referencia','texto_fuente','etapa_id','tema_etapa','proposiciones','cobertura_textual','estado_validacion'],'properties'=>[
      'id'=>$s,'numero'=>['type'=>'integer','minimum'=>1],'referencia'=>$s,'texto_fuente'=>$s,'etapa_id'=>$s,
      'tema_etapa'=>$topic,'proposiciones'=>['type'=>'array','minItems'=>1,'items'=>$prop],
      'cobertura_textual'=>$coverage,'estado_validacion'=>['type'=>'string','enum'=>['completo','parcial','pendiente_revision','texto_no_encontrado','referencia_inconsistente','segmentacion_incierta','cobertura_incompleta','proposicion_no_verificable']],
    ]];
    $stage = ['type'=>'object','additionalProperties'=>false,'required'=>['id','orden','nombre','color_key','desde_versiculo','hasta_versiculo','versiculos','tema','funcion_estructural','descripcion'],'properties'=>[
      'id'=>$s,'orden'=>['type'=>'integer','minimum'=>1],'nombre'=>$s,'color_key'=>$s,
      'desde_versiculo'=>['type'=>'integer','minimum'=>1],'hasta_versiculo'=>['type'=>'integer','minimum'=>1],
      'versiculos'=>['type'=>'array','items'=>$s],'tema'=>$s,'funcion_estructural'=>$s,'descripcion'=>$s,
    ]];
    $summary = ['type'=>'object','additionalProperties'=>false,'required'=>['total_versiculos','total_pp','total_ps','total_etapas','requiere_revision'],'properties'=>[
      'total_versiculos'=>['type'=>'integer','minimum'=>1],'total_pp'=>['type'=>'integer','minimum'=>0],
      'total_ps'=>['type'=>'integer','minimum'=>0],'total_etapas'=>['type'=>'integer','minimum'=>1],
      'requiere_revision'=>['type'=>'boolean'],
    ]];
    return ['type'=>'object','additionalProperties'=>false,'required'=>['schema_version','referencia','version_biblica','titulo','subtitulo','metodo','resumen','etapas','versiculos'],'properties'=>[
      'schema_version'=>['type'=>'string','enum'=>['proposiciones-2.1']],'referencia'=>$s,'version_biblica'=>$s,
      'titulo'=>$s,'subtitulo'=>$s,'metodo'=>['type'=>'string','enum'=>['PP_PS']],'resumen'=>$summary,
      'etapas'=>['type'=>'array','minItems'=>1,'items'=>$stage],'versiculos'=>['type'=>'array','minItems'=>1,'items'=>$verse],
    ]];
  }

  private static function arcingSchema()
  {
    $s=['type'=>'string'];
    $unit=['type'=>'object','additionalProperties'=>false,'required'=>['id','escala','referencia','texto','proposiciones'],'properties'=>['id'=>$s,'escala'=>['type'=>'string','enum'=>['micro','meso','macro']],'referencia'=>$s,'texto'=>$s,'proposiciones'=>['type'=>'array','items'=>$s]]];
    $relation=['type'=>'object','additionalProperties'=>false,'required'=>['id','escala','desde','hasta','tipo','etiqueta','explicacion','nivel_confianza','requiere_revision'],'properties'=>['id'=>$s,'escala'=>['type'=>'string','enum'=>['micro','meso','macro']],'desde'=>$s,'hasta'=>$s,'tipo'=>['type'=>'string','enum'=>['serie','continuacion','progresion','contraste','alternativa','comparacion','paralelismo','afirmacion_fundamento','afirmacion_explicacion','general_particular','declaracion_evidencia','promesa_fundamento','causa_resultado','accion_consecuencia','condicion_resultado','problema_solucion','pecado_juicio','fe_respuesta','accion_proposito','medio_fin','mandato_finalidad','peticion_motivo','pregunta_respuesta','objecion_respuesta','mandato_razon','exhortacion_fundamento','anuncio_cumplimiento','situacion_conflicto','accion_reaccion','peticion_respuesta','crisis_intervencion','punto_giro_desenlace','encuentro_transformacion']],'etiqueta'=>$s,'explicacion'=>$s,'nivel_confianza'=>['type'=>'string','enum'=>['alta','media','baja']],'requiere_revision'=>['type'=>'boolean']]];
    return ['type'=>'object','additionalProperties'=>false,'required'=>['unidades','relaciones','proposicion_dominante','centro'],'properties'=>['unidades'=>['type'=>'array','minItems'=>1,'items'=>$unit],'relaciones'=>['type'=>'array','items'=>$relation],'proposicion_dominante'=>$s,'centro'=>$s]];
  }

  private static function validateArcing($arcing,$analysis)
  {
    if(!is_array($arcing))throw new RuntimeException('El Método Integral no contiene Arcing válido.');$propositions=[];foreach(($analysis['versiculos']??[]) as $verse)foreach(($verse['proposiciones']??[]) as $proposition)$propositions[(string)($proposition['id']??'')]=true;$units=[];foreach(($arcing['unidades']??[]) as $unit){$id=trim((string)($unit['id']??''));if($id===''||isset($units[$id]))throw new RuntimeException('El Arcing contiene unidades inválidas o duplicadas.');foreach(($unit['proposiciones']??[]) as $propositionId)if(!isset($propositions[(string)$propositionId]))throw new RuntimeException('Una unidad Arcing referencia una proposición inexistente.');$units[$id]=true;}$relations=[];foreach(($arcing['relaciones']??[]) as $relation){$id=trim((string)($relation['id']??''));if($id===''||isset($relations[$id])||!isset($units[(string)($relation['desde']??'')])||!isset($units[(string)($relation['hasta']??'')]))throw new RuntimeException('El Arcing contiene una relación inválida.');if(trim((string)($relation['explicacion']??''))==='')throw new RuntimeException('Una relación Arcing no contiene justificación textual.');$relations[$id]=true;}
  }

  private static function validatePropositions($analysis,array $context)
  {
    if(!is_array($analysis)||($analysis['schema_version']??'')!=='proposiciones-2.1')throw new RuntimeException('El análisis de proposiciones no utiliza proposiciones-2.1.');
    $stages=[];foreach(($analysis['etapas']??[]) as $stage){$id=trim((string)($stage['id']??''));if($id===''||isset($stages[$id]))throw new RuntimeException('Identificador de etapa inválido.');$stages[$id]=true;}
    $source=[];foreach(($context['versiones']['platense']['versiculos']??[]) as $v)$source[(int)$v['versiculo']]=(string)$v['texto'];
    $verses=[];$ids=[];$pp=0;$ps=0;foreach(($analysis['versiculos']??[]) as $verse){$n=(int)($verse['numero']??0);if($n<1||isset($verses[$n])||!isset($stages[(string)($verse['etapa_id']??'')]))throw new RuntimeException('Versículo o etapa proposicional inválidos.');$verses[$n]=true;$local=[];$last=0;foreach(($verse['proposiciones']??[]) as $p){$id=(string)($p['id']??'');$order=(int)($p['orden']??0);$type=(string)($p['tipo']??'');if($id===''||isset($ids[$id])||$order<=$last||!in_array($type,['PP','PS'],true))throw new RuntimeException('Orden, identificador o tipo proposicional inválido.');$ids[$id]=true;$local[$id]=$type;$last=$order;$type==='PP'?$pp++:$ps++;$fragment=self::normalizeText((string)($p['texto']??''));$whole=self::normalizeText($source[$n]??(string)($verse['texto_fuente']??''));if($fragment===''||$whole===''||!str_contains($whole,$fragment))throw new RuntimeException("La proposición {$id} no existe en el texto fuente.");if($type==='PS'&&($local[(string)($p['depende_de']??'')]??null)!=='PP')throw new RuntimeException("La PS {$id} no depende de una PP anterior válida.");}}
    if($source&&array_diff(array_keys($source),array_keys($verses)))throw new RuntimeException('El análisis no cubre todos los versículos.');$r=$analysis['resumen']??[];if((int)($r['total_versiculos']??-1)!==count($verses)||(int)($r['total_pp']??-1)!==$pp||(int)($r['total_ps']??-1)!==$ps||(int)($r['total_etapas']??-1)!==count($stages))throw new RuntimeException('Los totales proposicionales no coinciden.');
  }

  private static function normalizeText(string $text)
  {
    $text=mb_strtolower($text);$text=preg_replace('/[^\p{L}\p{N}]+/u',' ',$text)??'';return trim(preg_replace('/\s+/u',' ',$text)??'');
  }
}

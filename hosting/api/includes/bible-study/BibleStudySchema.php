<?php
declare(strict_types=1);

final class BibleStudySchema
{
  public static function jsonSchema(
    string $method = BibleStudyMethod::DEFAULT,
    array $context = []
  )
  {
    $method = BibleStudyMethod::normalize($method);
    $requiredVerseCount = count(
      $context['versiones']['platense']['versiculos'] ?? []
    );
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
      'analisis_proposiciones' => self::propositionAnalysis(
        $method === 'integral_lvj' && $requiredVerseCount > 0
          ? $requiredVerseCount
          : null
      ),
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

  public static function prepareGenerated(array $study, array $context): array
  {
    $method = BibleStudyMethod::normalize(
      $context['metodo'] ?? BibleStudyMethod::DEFAULT
    );
    $config = BibleStudyMethod::config($method);

    // Estos campos pertenecen al servidor, no al contenido creativo de la IA.
    // La referencia procede del rango canónico validado y nunca debe depender
    // de que el proveedor la repita literalmente en su respuesta.
    $study['referencia'] = (string) (
      $context['referencia'] ?? $study['referencia'] ?? ''
    );
    $study['metodo'] = $method;
    $study['modelo_referencia'] = $config['model_reference'];
    $study['tecnicas'] = $config['techniques'];
    if ($method === 'integral_lvj') {
      $study['tecnica_estructural'] = 'arcing';
    } else {
      unset($study['tecnica_estructural'], $study['arcing']);
    }

    $analysis = $study['analisis_proposiciones'] ?? null;
    if (!is_array($analysis)) return $study;
    if (!isset($analysis['versiculos']) || !is_array($analysis['versiculos'])) {
      return $study;
    }

    $source = [];
    foreach (($context['versiones']['platense']['versiculos'] ?? []) as $verse) {
      $source[(int) ($verse['versiculo'] ?? 0)] =
        self::normalizeText((string) ($verse['texto'] ?? ''));
    }

    $idMap = [];
    $positionMap = [];
    $seenPps = [];
    $lastPp = '';
    foreach ($analysis['versiculos'] as $verseIndex => &$verse) {
      $number = (int) ($verse['numero'] ?? 0);
      if (!isset($verse['proposiciones']) || !is_array($verse['proposiciones'])) {
        continue;
      }
      foreach ($verse['proposiciones'] as $propIndex => &$proposition) {
        $order = $propIndex + 1;
        $oldId = self::normalizeIdValue($proposition['id'] ?? '');
        $canonicalId = 'v'.$number.'_p'.$order;
        if ($oldId !== '') $idMap[$oldId] = $canonicalId;
        $positionMap[$number.':'.$order] = $canonicalId;
        $proposition['id'] = $canonicalId;
        $proposition['orden'] = $order;
        $fragment = self::normalizeText((string) ($proposition['texto'] ?? ''));
        if (
          isset($source[$number])
          && $fragment !== ''
          && !str_contains($source[$number], $fragment)
        ) {
          $proposition['requiere_revision'] = true;
          $proposition['nivel_confianza'] = 'baja';
          $verse['estado_validacion'] = 'proposicion_no_verificable';
          $verse['cobertura_textual']['completa'] = false;
          $verse['cobertura_textual']['fragmentos_no_clasificados'][] =
            (string) ($proposition['texto'] ?? '');
        }
      }
      unset($proposition);

      foreach ($verse['proposiciones'] as &$proposition) {
        $canonicalId = self::normalizeIdValue($proposition['id'] ?? '');
        if (($proposition['tipo'] ?? '') !== 'PS') {
          $proposition['depende_de'] = null;
          if ($canonicalId !== '') {
            $seenPps[$canonicalId] = true;
            $lastPp = $canonicalId;
          }
          continue;
        }
        $dependency = self::normalizeIdValue($proposition['depende_de'] ?? '');
        $resolvedDependency = $idMap[$dependency] ?? $dependency;
        if ($resolvedDependency === '' || !isset($seenPps[$resolvedDependency])) {
          $resolvedDependency = $lastPp;
          $proposition['requiere_revision'] = true;
          $proposition['nivel_confianza'] = 'baja';
        }
        $proposition['depende_de'] = $resolvedDependency ?: null;
      }
      unset($proposition);
    }
    unset($verse);

    // Los totales son datos derivados del contenido normalizado. Recalcularlos
    // evita rechazar un estudio correcto cuando el proveedor se equivoca al
    // contar proposiciones en su resumen.
    $totalPp = 0;
    $totalPs = 0;
    foreach ($analysis['versiculos'] as $verse) {
      foreach (($verse['proposiciones'] ?? []) as $proposition) {
        if (($proposition['tipo'] ?? '') === 'PP') {
          $totalPp++;
        } elseif (($proposition['tipo'] ?? '') === 'PS') {
          $totalPs++;
        }
      }
    }
    if (!isset($analysis['resumen']) || !is_array($analysis['resumen'])) {
      $analysis['resumen'] = [];
    }
    $analysis['resumen']['total_versiculos'] = count($analysis['versiculos']);
    $analysis['resumen']['total_pp'] = $totalPp;
    $analysis['resumen']['total_ps'] = $totalPs;
    $analysis['resumen']['total_etapas'] = count($analysis['etapas'] ?? []);
    $study['analisis_proposiciones'] = $analysis;

    if ($method !== 'integral_lvj' || !is_array($study['arcing'] ?? null)) {
      return $study;
    }
    if (!isset($study['arcing']['unidades']) || !is_array($study['arcing']['unidades'])) {
      return $study;
    }
    if (!isset($study['arcing']['relaciones']) || !is_array($study['arcing']['relaciones'])) {
      $study['arcing']['relaciones'] = [];
    }

    $resolveProposition = static function ($raw) use (
      $idMap,
      $positionMap
    ): string {
      $raw = self::normalizeIdValue($raw);
      if (isset($idMap[$raw])) return $idMap[$raw];
      if (in_array($raw, $positionMap, true)) return $raw;
      preg_match_all('/\d+/', $raw, $matches);
      $numbers = $matches[0] ?? [];
      if (count($numbers) >= 2) {
        $key = ((int) $numbers[0]).':'.((int) end($numbers));
        if (isset($positionMap[$key])) return $positionMap[$key];
      }
      return $raw;
    };

    $unitMap = [];
    foreach ($study['arcing']['unidades'] as $index => &$unit) {
      $oldId = self::normalizeIdValue($unit['id'] ?? '');
      $canonicalUnitId = 'a'.($index + 1);
      $unit['id'] = $canonicalUnitId;
      $unitMap[$canonicalUnitId] = $canonicalUnitId;
      if ($oldId !== '') $unitMap[$oldId] = $canonicalUnitId;
      $resolved = [];
      foreach (($unit['proposiciones'] ?? []) as $rawId) {
        $resolvedId = $resolveProposition($rawId);
        if ($resolvedId !== '') $resolved[$resolvedId] = true;
      }
      $unit['proposiciones'] = array_keys($resolved);
    }
    unset($unit);

    $resolveUnit = static function ($raw) use ($unitMap): string {
      $raw = self::normalizeIdValue($raw);
      if ($raw !== '' && isset($unitMap[$raw])) return $unitMap[$raw];
      return $raw;
    };

    foreach ($study['arcing']['relaciones'] as $index => &$relation) {
      $relation['id'] = 'r'.($index + 1);
      $fromRaw = self::normalizeIdValue($relation['desde'] ?? '');
      $toRaw = self::normalizeIdValue($relation['hasta'] ?? '');
      $relation['desde'] = $resolveUnit($fromRaw);
      $relation['hasta'] = $resolveUnit($toRaw);
    }
    unset($relation);

    return $study;
  }

  public static function validate(array $study, array $context = [])
  {
    $method = BibleStudyMethod::normalize($context['metodo'] ?? $study['metodo'] ?? null);
    foreach (self::jsonSchema($method)['required'] as $key) {
      if (!array_key_exists($key, $study)) throw new RuntimeException("El estudio no contiene {$key}.");
    }
    if (($study['metodo'] ?? '') !== $method) throw new RuntimeException('El método devuelto no coincide con el método solicitado.');
    if ($method === 'metodo_salmo' && ($study['modelo_referencia'] ?? null) !== 'salmo8-1.0') throw new RuntimeException('El Método Salmo no conserva su modelo de referencia.');
    self::validatePropositions($study['analisis_proposiciones'] ?? null, $context);
    if ($method === 'integral_lvj') self::validateArcing($study['arcing'] ?? null, $study['analisis_proposiciones'] ?? null);
    if (!is_array($study['textos']) || !is_array($study['lectio_divina'])) {
      throw new RuntimeException('El estudio generado no respeta el esquema requerido.');
    }
    $textKeys = array_keys($study['textos']);
    if (count(array_diff(['platense','torres_amat','scio'], $textKeys)) !== 0) {
      throw new RuntimeException('El estudio generado contiene versiones bíblicas no autorizadas.');
    }
    $comparisonKeys = is_array($study['comparacion_traducciones']) ? array_keys($study['comparacion_traducciones']) : [];
    if (count(array_diff(['platense','torres_amat','scio'], $comparisonKeys)) !== 0) {
      throw new RuntimeException('La comparación de traducciones no contiene todas las versiones requeridas.');
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

  private static function propositionAnalysis(?int $requiredVerseCount = null)
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
    $verses = ['type'=>'array','minItems'=>1,'items'=>$verse];
    if ($requiredVerseCount !== null && $requiredVerseCount > 0) {
      // La instrucción escrita no basta: el contrato estructurado debe impedir
      // que el proveedor cierre un JSON válido después de analizar solo una
      // parte del pasaje solicitado.
      $verses['minItems'] = $requiredVerseCount;
      $verses['maxItems'] = $requiredVerseCount;
    }
    return ['type'=>'object','additionalProperties'=>false,'required'=>['schema_version','referencia','version_biblica','titulo','subtitulo','metodo','resumen','etapas','versiculos'],'properties'=>[
      'schema_version'=>['type'=>'string','enum'=>['proposiciones-2.1']],'referencia'=>$s,'version_biblica'=>$s,
      'titulo'=>$s,'subtitulo'=>$s,'metodo'=>['type'=>'string','enum'=>['PP_PS']],'resumen'=>$summary,
      'etapas'=>['type'=>'array','minItems'=>1,'items'=>$stage],'versiculos'=>$verses,
    ]];
  }

  private static function arcingSchema()
  {
    $s=['type'=>'string'];
    $unit=['type'=>'object','additionalProperties'=>false,'required'=>['id','escala','referencia','texto','proposiciones'],'properties'=>['id'=>$s,'escala'=>['type'=>'string','enum'=>['micro','meso','macro']],'referencia'=>$s,'texto'=>$s,'proposiciones'=>['type'=>'array','items'=>$s]]];
    $relation=['type'=>'object','additionalProperties'=>false,'required'=>['id','escala','desde','hasta','tipo','etiqueta','explicacion','nivel_confianza','requiere_revision'],'properties'=>['id'=>$s,'escala'=>['type'=>'string','enum'=>['micro','meso','macro']],'desde'=>$s,'hasta'=>$s,'tipo'=>['type'=>'string','enum'=>['serie','continuacion','progresion','contraste','alternativa','comparacion','paralelismo','afirmacion_fundamento','afirmacion_explicacion','general_particular','declaracion_evidencia','promesa_fundamento','causa_resultado','accion_consecuencia','condicion_resultado','problema_solucion','pecado_juicio','fe_respuesta','accion_proposito','medio_fin','mandato_finalidad','peticion_motivo','pregunta_respuesta','objecion_respuesta','mandato_razon','exhortacion_fundamento','anuncio_cumplimiento','situacion_conflicto','accion_reaccion','peticion_respuesta','crisis_intervencion','punto_giro_desenlace','encuentro_transformacion']],'etiqueta'=>$s,'explicacion'=>$s,'nivel_confianza'=>['type'=>'string','enum'=>['alta','media','baja']],'requiere_revision'=>['type'=>'boolean']]];
    return ['type'=>'object','additionalProperties'=>false,'required'=>['unidades','relaciones','proposicion_dominante','centro'],'properties'=>['unidades'=>['type'=>'array','minItems'=>1,'items'=>$unit],'relaciones'=>['type'=>'array','items'=>$relation],'proposicion_dominante'=>$s,'centro'=>$s]];
  }

  private static function validateArcing($arcing, $analysis)
  {
    if (!is_array($arcing)) {
      throw new RuntimeException('El Método Integral no contiene Arcing válido.');
    }

    $propositionVerseMap = [];
    foreach (($analysis['versiculos'] ?? []) as $verse) {
      $verseNumber = (int) ($verse['numero'] ?? 0);
      foreach (($verse['proposiciones'] ?? []) as $proposition) {
        $id = self::normalizeIdValue($proposition['id'] ?? '');
        if ($id !== '') $propositionVerseMap[$id] = $verseNumber;
      }
    }

    $units = [];
    foreach (($arcing['unidades'] ?? []) as $unit) {
      $id = self::normalizeIdValue($unit['id'] ?? '');
      $scale = (string) ($unit['escala'] ?? '');
      $reference = trim((string) ($unit['referencia'] ?? ''));
      if ($id === '' || isset($units[$id])) {
        throw new RuntimeException('El Arcing contiene unidades inválidas o duplicadas.');
      }
      if (!in_array($scale, ['micro', 'meso', 'macro'], true)) {
        throw new RuntimeException("La unidad Arcing \"{$id}\" utiliza una escala inválida.");
      }
      $range = self::referenceVerseRange($reference);
      if ($range === null) {
        throw new RuntimeException("La unidad Arcing \"{$id}\" no declara un rango bíblico válido.");
      }
      $propositionIds = $unit['proposiciones'] ?? null;
      if (!is_array($propositionIds) || count($propositionIds) < 1) {
        throw new RuntimeException("La unidad Arcing \"{$id}\" no contiene proposiciones.");
      }
      foreach ($propositionIds as $propositionId) {
        $propId = self::normalizeIdValue($propositionId);
        if ($propId === '' || !isset($propositionVerseMap[$propId])) {
          throw new RuntimeException("La unidad Arcing \"{$id}\" referencia la proposición inexistente \"{$propId}\".");
        }
        $verseNumber = $propositionVerseMap[$propId];
        if ($verseNumber < $range[0] || $verseNumber > $range[1]) {
          throw new RuntimeException(
            "La unidad Arcing \"{$id}\" declara {$reference}, pero utiliza \"{$propId}\", que pertenece al versículo {$verseNumber}."
          );
        }
      }
      $units[$id] = ['escala' => $scale];
    }

    $relations = [];
    foreach (($arcing['relaciones'] ?? []) as $relation) {
      $id = self::normalizeIdValue($relation['id'] ?? '');
      $from = self::normalizeIdValue($relation['desde'] ?? '');
      $to = self::normalizeIdValue($relation['hasta'] ?? '');
      $scale = (string) ($relation['escala'] ?? '');
      if ($id === '' || isset($relations[$id]) || !isset($units[$from]) || !isset($units[$to])) {
        throw new RuntimeException('El Arcing contiene una relación inválida.');
      }
      if ($from === $to) {
        throw new RuntimeException("La relación Arcing \"{$id}\" conecta una unidad consigo misma.");
      }
      if ($units[$from]['escala'] !== $scale || $units[$to]['escala'] !== $scale) {
        throw new RuntimeException("La relación Arcing \"{$id}\" no coincide con la escala de sus unidades.");
      }
      if (trim((string) ($relation['explicacion'] ?? '')) === '') {
        throw new RuntimeException('Una relación Arcing no contiene justificación textual.');
      }
      $relations[$id] = true;
    }
  }

  private static function validatePropositions($analysis,array $context)
  {
    if (!is_array($analysis) || ($analysis['schema_version'] ?? '') !== 'proposiciones-2.1') {
      throw new RuntimeException('El análisis de proposiciones no utiliza proposiciones-2.1.');
    }
    $stages = [];
    foreach (($analysis['etapas'] ?? []) as $stage) {
      $id = trim((string) ($stage['id'] ?? ''));
      if ($id === '' || isset($stages[$id])) {
        throw new RuntimeException('Identificador de etapa inválido.');
      }
      $stages[$id] = true;
    }
    $source = [];
    foreach (($context['versiones']['platense']['versiculos'] ?? []) as $v) {
      $source[(int) $v['versiculo']] = (string) $v['texto'];
    }
    $verses = [];
    $ids = [];
    $pp = 0;
    $ps = 0;
    $knownProps = [];
    foreach (($analysis['versiculos'] ?? []) as $verse) {
      $n = (int) ($verse['numero'] ?? 0);
      if ($n < 1 || isset($verses[$n]) || !isset($stages[(string) ($verse['etapa_id'] ?? '')])) {
        throw new RuntimeException('Versículo o etapa proposicional inválidos.');
      }
      if ($source && !isset($source[$n])) {
        throw new RuntimeException('El análisis contiene un versículo fuera del rango solicitado.');
      }
      $verses[$n] = true;
      $local = [];
      $last = 0;
      // La proposición ya está normalizada antes de compararse. El texto
      // fuente debe pasar por la misma normalización; de lo contrario una
      // mayúscula, una coma o una tilde tipográfica produce un falso negativo
      // y rechaza proposiciones literales válidas como v1_p1.
      $verseSource = self::normalizeText((string) (
        $source[$n] ?? ($verse['texto_fuente'] ?? '')
      ));
      foreach (($verse['proposiciones'] ?? []) as $p) {
        $id = trim((string) ($p['id'] ?? ''));
        $order = (int) ($p['orden'] ?? 0);
        $type = (string) ($p['tipo'] ?? '');
        if ($id === '' || isset($ids[$id]) || $order <= $last || !in_array($type, ['PP', 'PS'], true)) {
          throw new RuntimeException('Orden, identificador o tipo proposicional inválido.');
        }
        $ids[$id] = true;
        $knownProps[$id] = $type;
        $local[$id] = $type;
        $last = $order;
        if ($type === 'PP') {
          $pp++;
        } else {
          $ps++;
        }
        $fragment = self::normalizeText((string) ($p['texto'] ?? ''));
        if ($fragment === '') {
          throw new RuntimeException("La proposición {$id} no contiene texto válido.");
        }
        if (
          $verseSource !== ''
          && !str_contains($verseSource, $fragment)
          && !($p['requiere_revision'] ?? false)
        ) {
          throw new RuntimeException("La proposición {$id} no existe en el texto fuente.");
        }
        if ($type === 'PS') {
          $dependency = self::normalizeIdValue($p['depende_de'] ?? '');
          if ($dependency === '' || ($knownProps[$dependency] ?? null) !== 'PP') {
            throw new RuntimeException("La PS {$id} no depende de una PP válida.");
          }
        }
      }
      if (!is_array($verse['proposiciones'] ?? null) || count($verse['proposiciones']) < 1) {
        throw new RuntimeException('Cada versículo debe contener al menos una proposición.');
      }
    }
    if (count($verses) < 1) {
      throw new RuntimeException('El análisis proposicional no contiene versículos válidos.');
    }
    if ($source) {
      $missing = array_values(array_diff(array_keys($source), array_keys($verses)));
      $unexpected = array_values(array_diff(array_keys($verses), array_keys($source)));
      sort($missing);
      sort($unexpected);
      if ($missing) {
        throw new RuntimeException('El análisis proposicional no cubre los versículos: '.implode(', ', $missing).'.');
      }
      if ($unexpected) {
        throw new RuntimeException('El análisis proposicional contiene versículos fuera del rango: '.implode(', ', $unexpected).'.');
      }
    }
    $r = $analysis['resumen'] ?? [];
    if (isset($r['total_versiculos']) && (int) ($r['total_versiculos'] ?? 0) !== count($verses)) {
      throw new RuntimeException('El resumen de proposiciones no coincide con los versículos analizados.');
    }
    if (isset($r['total_pp']) && (int) ($r['total_pp'] ?? 0) !== $pp) {
      throw new RuntimeException('El resumen de proposiciones no coincide con las PP analizadas.');
    }
    if (isset($r['total_ps']) && (int) ($r['total_ps'] ?? 0) !== $ps) {
      throw new RuntimeException('El resumen de proposiciones no coincide con las PS analizadas.');
    }
    if (isset($r['total_etapas']) && (int) ($r['total_etapas'] ?? 0) !== count($stages)) {
      throw new RuntimeException('El resumen de proposiciones no coincide con las etapas analizadas.');
    }
  }

  private static function referenceVerseRange(string $reference): ?array
  {
    if (!preg_match('/[,:]\s*(\d+)(?:\s*[-–—]\s*(\d+))?\s*$/u', $reference, $matches)) {
      return null;
    }
    $start = (int) $matches[1];
    $end = isset($matches[2]) && $matches[2] !== '' ? (int) $matches[2] : $start;
    return $start > 0 && $end >= $start ? [$start, $end] : null;
  }

  private static function normalizeText(string $text)
  {
    $text=mb_strtolower($text);$text=preg_replace('/[^\p{L}\p{N}]+/u',' ',$text)??'';return trim(preg_replace('/\s+/u',' ',$text)??'');
  }

  private static function normalizeId(string $id)
  {
    $id = trim($id);
    $id = preg_replace('/\s+/u', ' ', $id) ?? $id;
    return $id;
  }

  private static function normalizeIdValue($value): string
  {
    if (is_string($value) || is_int($value) || is_float($value)) {
      return self::normalizeId((string) $value);
    }
    if (is_array($value)) {
      if (isset($value['id'])) {
        return self::normalizeId((string) $value['id']);
      }
      if (count($value) === 1) {
        return self::normalizeId((string) reset($value));
      }
      return '';
    }
    return '';
  }
}

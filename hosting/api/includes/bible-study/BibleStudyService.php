<?php
declare(strict_types=1);

final class BibleStudyService
{
  public const BUILD = '2026-08-15-v10';
  public const EQUIVALENCES_PENDING_MESSAGE = 'El estudio con inteligencia artificial estará disponible cuando finalice la revisión de equivalencias bíblicas.';
  public const LEVELS_PENDING_MESSAGE = 'La estructura por niveles de estudio todavía no está disponible en la base de datos.';
  private const LANGUAGE = 'es';
  private const VERSION_KEYS = ['platense' => 'SPAPLATENSE', 'torres_amat' => 'TORRESAMAT', 'scio' => 'SCIO'];
  private const SCIO_REVIEW_MESSAGE = 'Texto de Scío en revisión: este libro, capítulo o versículo todavía no está habilitado.';
  private $pdo;
  public function __construct(PDO $pdo) { $this->pdo=$pdo; }

  public function findPublishedForInput(array $input, ?array $user = null): ?array
  {
    return $this->findPublishedForPrepared($this->prepareInput($input), $user);
  }

  public function prepareInput(array $input): array
  {
    $startedAt = microtime(true);
    $range = $this->normalize($input);
    $this->telemetry('normalization_completed', [
      'duration_ms'=>$this->elapsedMs($startedAt),
      'method'=>$range['metodo'],
      'level'=>$range['nivel'],
    ]);

    $startedAt = microtime(true);
    $context = $this->context($range);
    $contextJson = json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $this->telemetry('context_completed', [
      'duration_ms'=>$this->elapsedMs($startedAt),
      'method'=>$range['metodo'],
      'level'=>$range['nivel'],
      'verse_count'=>count($context['versiones']['platense']['versiculos']??[]),
      'context_bytes'=>is_string($contextJson)?strlen($contextJson):0,
    ]);

    $methodConfig = BibleStudyMethod::config($range['metodo']);
    $hash = hash('sha256', json_encode([$context, BibleStudyPrompt::METHOD], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    return ['range'=>$range,'context'=>$context,'method_config'=>$methodConfig,'hash'=>$hash];
  }

  public function findPublishedForPrepared(array $prepared, ?array $user = null): ?array
  {
    $range=$prepared['range']; $context=$prepared['context']; $methodConfig=$prepared['method_config']; $hash=$prepared['hash'];
    $startedAt = microtime(true);
    if (!$this->columnExists('lvj_bib_estudios_ia','nivel') || !$this->columnExists('lvj_bib_estudios_ia','metodo')) return null;
    $row = lvj_first($this->pdo, "SELECT * FROM lvj_bib_estudios_ia WHERE metodo=:study_method AND ((hash_contexto=:hash AND metodo_version=:method) OR (libro_id=:book AND capitulo_inicio=:ci AND capitulo_fin=:cf AND versiculo_inicio<=:vi AND versiculo_fin>=:vf AND nivel=:level AND idioma=:language AND esquema_version=:schema AND texto_version=:text_version AND notas_version=:notes_version)) AND estado='publicado' AND revisado=1 AND es_publico=1 AND deleted_at IS NULL ORDER BY (versiculo_inicio=:exact_vi AND versiculo_fin=:exact_vf) DESC,(versiculo_fin-versiculo_inicio) ASC,updated_at DESC,id DESC LIMIT 1", ['study_method'=>$range['metodo'],'hash'=>$hash,'method'=>BibleStudyPrompt::METHOD,'book'=>$context['libro_id'],'ci'=>$range['capitulo_inicio'],'vi'=>$range['versiculo_inicio'],'cf'=>$range['capitulo_fin'],'vf'=>$range['versiculo_fin'],'level'=>$range['nivel'],'language'=>self::LANGUAGE,'schema'=>$methodConfig['schema'],'text_version'=>$context['metadata']['texto_version'],'notes_version'=>$context['metadata']['notas_version'],'exact_vi'=>$range['versiculo_inicio'],'exact_vf'=>$range['versiculo_fin']]);
    $this->telemetry('published_cache_lookup_completed', [
      'duration_ms'=>$this->elapsedMs($startedAt),
      'method'=>$range['metodo'],
      'level'=>$range['nivel'],
      'result'=>$row?'hit':'miss',
    ]);
    if (!$row) return null;
    if ($user) $this->logRequest((int)$user['id'], (int)$row['id'], $context['referencia'], 'completada', false);
    return $this->present($row);
  }

  public function create(array $input, array $user): array
  {
    return $this->createPrepared($this->prepareInput($input), $user);
  }

  public function createPrepared(array $prepared, array $user): array
  {
    $range=$prepared['range']; $context=$prepared['context']; $methodConfig=$prepared['method_config']; $hash=$prepared['hash'];

    /*
     * Debe validarse el esquema antes de ejecutar consultas que utilicen las
     * columnas metodo, modelo_referencia o tecnica_estructural.
     */
    $readiness = $this->generationReadiness();
    if (!$readiness['ready']) {
      throw new RuntimeException($readiness['message']);
    }

    $cached = lvj_first($this->pdo, "SELECT * FROM lvj_bib_estudios_ia WHERE metodo=:study_method AND ((hash_contexto=:hash AND metodo_version=:method) OR (libro_id=:book AND capitulo_inicio=:ci AND capitulo_fin=:cf AND versiculo_inicio<=:vi AND versiculo_fin>=:vf AND nivel=:level AND idioma=:language AND esquema_version=:schema AND texto_version=:text_version AND notas_version=:notes_version)) AND estado IN ('revision','publicado') AND deleted_at IS NULL ORDER BY (versiculo_inicio=:exact_vi AND versiculo_fin=:exact_vf) DESC,(versiculo_fin-versiculo_inicio) ASC,updated_at DESC,id DESC LIMIT 1", ['study_method'=>$range['metodo'],'hash'=>$hash,'method'=>BibleStudyPrompt::METHOD,'book'=>$context['libro_id'],'ci'=>$range['capitulo_inicio'],'vi'=>$range['versiculo_inicio'],'cf'=>$range['capitulo_fin'],'vf'=>$range['versiculo_fin'],'level'=>$range['nivel'],'language'=>self::LANGUAGE,'schema'=>$methodConfig['schema'],'text_version'=>$context['metadata']['texto_version'],'notes_version'=>$context['metadata']['notas_version'],'exact_vi'=>$range['versiculo_inicio'],'exact_vf'=>$range['versiculo_fin']]);
    if ($cached) {
      $this->logRequest((int) $user['id'], (int) $cached['id'], $context['referencia'], 'completada', false);
      return ['source' => 'cache', 'study' => $this->present($cached)];
    }
    $staleBefore = $this->generationStaleBefore();
    $failed = lvj_first($this->pdo, "SELECT id FROM lvj_bib_estudios_ia WHERE hash_contexto=:hash AND metodo_version=:method AND deleted_at IS NULL AND (estado='error' OR (estado='generando' AND updated_at < :stale_before)) LIMIT 1", ['hash' => $hash, 'method' => BibleStudyPrompt::METHOD, 'stale_before' => $staleBefore]);
    if ($failed) {
      $this->pdo->prepare("UPDATE lvj_bib_estudios_ia SET hash_contexto=SHA2(CONCAT(hash_contexto,'|retry|',id,'|',UTC_TIMESTAMP(6)),256),estado='archivado',es_publico=0,deleted_at=NOW(),updated_at=NOW() WHERE id=:id AND (estado='error' OR (estado='generando' AND updated_at < :stale_before)) AND deleted_at IS NULL")
        ->execute(['id' => (int) $failed['id'], 'stale_before' => $staleBefore]);
    }
    $this->enforceQuota($user);
    $requestId = $this->logRequest((int) $user['id'], null, $context['referencia'], 'procesando', true);
    $insert = $this->pdo->prepare("INSERT INTO lvj_bib_estudios_ia (libro_id,capitulo_inicio,versiculo_inicio,capitulo_fin,versiculo_fin,referencia,metodo,nivel,idioma,metodo_version,esquema_version,modelo_referencia,tecnica_estructural,texto_version,notas_version,contenido_json,hash_contexto,estado) VALUES (:libro,:ci,:vi,:cf,:vf,:ref,:study_method,:level,:language,:method,:schema,:model_reference,:structural_technique,:text_version,:notes_version,'{}',:hash,'generando')");
    try {
      $insert->execute(['libro'=>$context['libro_id'],'ci'=>$range['capitulo_inicio'],'vi'=>$range['versiculo_inicio'],'cf'=>$range['capitulo_fin'],'vf'=>$range['versiculo_fin'],'ref'=>$context['referencia'],'study_method'=>$range['metodo'],'level'=>$range['nivel'],'language'=>self::LANGUAGE,'method'=>BibleStudyPrompt::METHOD,'schema'=>$methodConfig['schema'],'model_reference'=>$methodConfig['model_reference'],'structural_technique'=>$range['metodo']==='integral_lvj'?'arcing':null,'text_version'=>$context['metadata']['texto_version'],'notes_version'=>$context['metadata']['notas_version'],'hash'=>$hash]);
      $studyId = (int) $this->pdo->lastInsertId();
      $this->pdo->prepare('UPDATE lvj_bib_estudios_ia_solicitudes SET estudio_id=:study WHERE id=:id')
        ->execute(['study'=>$studyId, 'id'=>$requestId]);
      $this->telemetry('generation_record_created', ['study_id'=>$studyId,'generation_id'=>$requestId,'method'=>$range['metodo'],'level'=>$range['nivel']]);
    } catch (PDOException $error) {
      if ((string) $error->getCode() !== '23000') throw $error;
      $existing = lvj_first($this->pdo, "SELECT * FROM lvj_bib_estudios_ia WHERE hash_contexto=:hash AND metodo_version=:method AND deleted_at IS NULL LIMIT 1", ['hash'=>$hash,'method'=>BibleStudyPrompt::METHOD]);
      if (!$existing) throw $error;
      if (in_array((string)$existing['estado'], ['revision','publicado'], true)) {
        $this->completeRequest($requestId, (int) $existing['id']);
        $this->pdo->prepare('UPDATE lvj_bib_estudios_ia_solicitudes SET consume_cupo=0 WHERE id=:id')->execute(['id'=>$requestId]);
        return ['source'=>'cache','study'=>$this->present($existing)];
      }
      $this->pdo->prepare("UPDATE lvj_bib_estudios_ia_solicitudes SET estudio_id=:study,estado='error',consume_cupo=0,error_mensaje=:error,completed_at=NOW() WHERE id=:id")
        ->execute(['study'=>(int)$existing['id'],'error'=>'El estudio ya se está procesando.','id'=>$requestId]);
      throw new RuntimeException('El estudio ya se está procesando. Intenta consultarlo nuevamente en unos momentos.');
    }
    try {
      $provider = BibleStudyProviderFactory::make();
      if ($provider instanceof OpenAIProvider) {
        $started = $provider->startBackgroundStudy($context);
        $this->telemetry('openai_background_started', ['study_id'=>$studyId,'generation_id'=>$requestId,'response_id_hash'=>$this->responseIdHash($started['response_id']),'response_status'=>$started['status']]);
        $pendingJson = json_encode(['_generation'=>['provider'=>'openai','response_id'=>$started['response_id'],'status'=>$started['status'],'started_at'=>gmdate('c')]], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        $this->refreshConnection();
        $this->pdo->prepare("UPDATE lvj_bib_estudios_ia SET proveedor_ia='openai',modelo_ia=:model,contenido_json=:json,error_mensaje=NULL,updated_at=NOW() WHERE id=:id AND estado='generando'")
          ->execute(['model'=>$started['model'], 'json'=>$pendingJson, 'id'=>$studyId]);
        return ['source'=>'processing', 'study'=>null];
      }
      $generated = $provider->generateStudy($context);
      $this->refreshConnection();
      $json = json_encode($generated['study'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
      $this->pdo->prepare("UPDATE lvj_bib_estudios_ia SET titulo=:titulo,proveedor_ia=:provider,modelo_ia=:model,contenido_json=:json,estado='revision',tokens_entrada=:tin,tokens_salida=:tout,error_mensaje=NULL WHERE id=:id")
        ->execute(['titulo'=>$generated['study']['titulo'],'provider'=>strtolower((string)lvj_setting('BIBLE_AI_PROVIDER')),'model'=>$generated['model'],'json'=>$json,'tin'=>$generated['input_tokens'],'tout'=>$generated['output_tokens'],'id'=>$studyId]);
      $this->completeRequest($requestId, $studyId);
      $row = lvj_first($this->pdo, 'SELECT * FROM lvj_bib_estudios_ia WHERE id=:id', ['id'=>$studyId]);
      return ['source'=>'generated','study'=>$this->present($row ?: [])];
    } catch (Throwable $error) {
      $message = mb_substr($error->getMessage(), 0, 1000);
      try {
        $this->refreshConnection();
        $this->pdo->prepare("UPDATE lvj_bib_estudios_ia SET estado='error',error_mensaje=:error WHERE id=:id")->execute(['error'=>$message,'id'=>$studyId]);
        $this->pdo->prepare("UPDATE lvj_bib_estudios_ia_solicitudes SET estado='error',consume_cupo=0,error_mensaje=:error,completed_at=NOW(),estudio_id=:study WHERE id=:id")->execute(['error'=>$message,'study'=>$studyId,'id'=>$requestId]);
      } catch (Throwable $logError) {
        error_log('LVJ Bible Study recovery: '.$logError->getMessage());
      }
      throw $error;
    }
  }

  public function generationReadiness(): array
  {
    if (!$this->tableExists('lvj_bib_estudios_ia') || !$this->tableExists('lvj_bib_estudios_ia_solicitudes')) {
      return ['ready'=>false, 'message'=>'El almacenamiento de estudios bíblicos todavía no está disponible.'];
    }
    foreach (['metodo','modelo_referencia','tecnica_estructural','nivel','idioma','esquema_version','texto_version','notas_version'] as $column) {
      if (!$this->columnExists('lvj_bib_estudios_ia',$column)) return ['ready'=>false,'message'=>self::LEVELS_PENDING_MESSAGE];
    }
    if (!$this->tableExists('lvj_bib_unidades_canonicas') || !$this->tableExists('lvj_bib_unidades_versiculos')) {
      return ['ready'=>false, 'message'=>self::EQUIVALENCES_PENDING_MESSAGE];
    }
    $units = $this->equivalenceCount('lvj_bib_unidades_canonicas');
    $relations = $this->equivalenceCount('lvj_bib_unidades_versiculos');
    $ready = $units['approved'] > 0 && $relations['approved'] > 0;
    return ['ready'=>$ready, 'message'=>$ready ? '' : self::EQUIVALENCES_PENDING_MESSAGE];
  }

  public function find(int $id, ?int $userId = null, bool $admin = false): ?array
  {
    $row = lvj_first($this->pdo, 'SELECT * FROM lvj_bib_estudios_ia WHERE id=:id AND deleted_at IS NULL LIMIT 1', ['id'=>$id]);
    if (!$row) return null;
    $isPublic = $row['estado'] === 'publicado' && (int) $row['revisado'] === 1 && (int) $row['es_publico'] === 1;
    if (!$admin && !$isPublic) {
      $allowed = $userId && lvj_first($this->pdo, 'SELECT id FROM lvj_bib_estudios_ia_solicitudes WHERE estudio_id=:study AND usuario_id=:user LIMIT 1', ['study'=>$id,'user'=>$userId]);
      if (!$allowed) return null;
    }
    return $this->present($row);
  }

  public function recentForUser(int $userId, int $limit = 12): array
  {
    if (!$this->tableExists('lvj_bib_estudios_ia') || !$this->tableExists('lvj_bib_estudios_ia_solicitudes')) return [];
    $limit = max(1, min(50, $limit));
    $sql = "SELECT estudio.*, recientes.viewed_at
      FROM lvj_bib_estudios_ia estudio
      INNER JOIN (
        SELECT estudio_id, MAX(COALESCE(completed_at, created_at)) AS viewed_at
        FROM lvj_bib_estudios_ia_solicitudes
        WHERE usuario_id=:user AND estado='completada' AND estudio_id IS NOT NULL
        GROUP BY estudio_id
      ) recientes ON recientes.estudio_id=estudio.id
      WHERE estudio.deleted_at IS NULL
      ORDER BY recientes.viewed_at DESC, estudio.id DESC
      LIMIT {$limit}";
    $statement = $this->pdo->prepare($sql);
    $statement->execute(['user'=>$userId]);
    return array_map(function(array $row): array {
      $study = $this->present($row);
      $study['viewed_at'] = $row['viewed_at'] ?? null;
      return $study;
    }, $statement->fetchAll());
  }

  public function generationStatusForUser(array $input, int $userId): array
  {
    $normalizationStartedAt = microtime(true);
    $range = $this->normalize($input);
    $this->telemetry('normalization_completed', [
      'duration_ms'=>$this->elapsedMs($normalizationStartedAt),
      'method'=>$range['metodo'],
      'level'=>$range['nivel'],
    ]);
    $row = lvj_first($this->pdo, "SELECT estudio.*,
        (estudio.updated_at < :stale_before) AS generation_expired
      FROM lvj_bib_estudios_ia estudio
      INNER JOIN lvj_bib_libros libro ON libro.id=estudio.libro_id
      INNER JOIN lvj_bib_estudios_ia_solicitudes solicitud
        ON solicitud.estudio_id=estudio.id AND solicitud.usuario_id=:user
      WHERE UPPER(libro.codigo)=:book
        AND estudio.capitulo_inicio=:ci AND estudio.versiculo_inicio=:vi
        AND estudio.capitulo_fin=:cf AND estudio.versiculo_fin=:vf
        AND estudio.nivel=:level AND estudio.metodo=:study_method
        AND estudio.deleted_at IS NULL
      ORDER BY solicitud.id DESC, estudio.id DESC
      LIMIT 1", [
        'user'=>$userId,
        'book'=>$range['libro_codigo'],
        'ci'=>$range['capitulo_inicio'],
        'vi'=>$range['versiculo_inicio'],
        'cf'=>$range['capitulo_fin'],
        'vf'=>$range['versiculo_fin'],
        'level'=>$range['nivel'],
        'study_method'=>$range['metodo'],
        'stale_before'=>$this->generationStaleBefore(),
      ]);

    if (!$row) return ['state'=>'not_found'];
    $state = (string) ($row['estado'] ?? '');
    if (in_array($state, ['revision', 'publicado'], true)) {
      return ['state'=>'completed', 'study'=>$this->present($row)];
    }
    if ($state === 'error') {
      return ['state'=>'failed', 'message'=>'La generación no pudo completarse. Puedes intentarlo nuevamente.'];
    }
    if ($state === 'generando') {
      $refreshed = $this->refreshBackgroundGeneration($row, $range);
      if ($refreshed !== null) return $refreshed;
    }
    if ($state === 'generando' && (int) ($row['generation_expired'] ?? 0) === 1) {
      $this->failExpiredGeneration((int) $row['id']);
      return ['state'=>'failed', 'message'=>'La generación superó el tiempo disponible. Ya puedes intentarlo nuevamente.'];
    }
    return ['state'=>'processing'];
  }
  private function normalize(array $input): array
  {
    $book = strtoupper(trim((string)($input['libro_codigo'] ?? '')));
    if (!preg_match('/^[0-9A-Z]{3}$/', $book)) throw new InvalidArgumentException('El libro no es válido.');
    $ci=(int)($input['capitulo_inicio']??0); $cf=(int)($input['capitulo_fin']??$ci); $vi=(int)($input['versiculo_inicio']??0); $vf=(int)($input['versiculo_fin']??$vi); $method=BibleStudyMethod::forBook($book); $level=BibleStudyLevel::normalize($input['nivel']??null);
    if ($ci < 1 || $cf !== $ci || $vi < 1 || $vf < $vi) throw new InvalidArgumentException('Selecciona un rango válido del mismo capítulo.');
    return ['libro_codigo'=>$book,'capitulo_inicio'=>$ci,'versiculo_inicio'=>$vi,'capitulo_fin'=>$cf,'versiculo_fin'=>$vf,'metodo'=>$method,'nivel'=>$level];
  }

  private function context(array $range): array
  {
    /*
     * Compatibilidad con estudios antiguos y llamadas internas previas a la
     * incorporación de los métodos. La hidratación conserva el método guardado
     * y, cuando no puede inferirse, utiliza el método oficial por defecto.
     */
    $range['metodo'] = BibleStudyMethod::normalize(
      $range['metodo'] ?? BibleStudyMethod::DEFAULT
    );

    $versions=[]; $mainBook=null; $mainVersionId=0; $sourceVerseIds=[]; $targetChapters=[]; $codes=self::VERSION_KEYS;
    $equivalenceTablesReady=$this->tableExists('lvj_bib_unidades_canonicas') && $this->tableExists('lvj_bib_unidades_versiculos');
    foreach ($codes as $key=>$fallback) {
      $mapping=[];
      $env='BIBLE_VERSION_' . strtoupper($key); $code=strtoupper(trim((string) lvj_setting($env, $fallback)));
      $version=lvj_first($this->pdo,"SELECT * FROM lvj_bib_versiones WHERE UPPER(codigo)=:code AND deleted_at IS NULL AND (estado=1 OR UPPER(codigo)='SCIO') LIMIT 1",['code'=>$code]);
      if (!$version) { $versions[$key]=['disponible'=>false,'version'=>$code,'versiculos'=>[],'notas'=>[]]; continue; }
      $book=lvj_first($this->pdo,'SELECT * FROM lvj_bib_libros WHERE version_id=:version AND codigo=:book AND estado=1 AND deleted_at IS NULL LIMIT 1',['version'=>$version['id'],'book'=>$range['libro_codigo']]);
      if (!$book) { $versions[$key]=['disponible'=>false,'version'=>$version['nombre'],'versiculos'=>[],'notas'=>[]]; continue; }
      if ($key==='platense') { $mainBook=$book; $mainVersionId=(int)$version['id']; }
      if ($key!=='platense' && $sourceVerseIds && $equivalenceTablesReady) {
        $placeholders=implode(',',array_fill(0,count($sourceVerseIds),'?'));
        $sql="SELECT origen.id origen_id,origen.versiculo origen_versiculo,destino.id,destino.capitulo,destino.versiculo,destino.texto,destino.titulo_seccion FROM lvj_bib_unidades_versiculos origen_rel INNER JOIN lvj_bib_versiculos origen ON origen.id=origen_rel.versiculo_id INNER JOIN lvj_bib_unidades_canonicas unidad ON unidad.id=origen_rel.unidad_canonica_id INNER JOIN lvj_bib_unidades_versiculos destino_rel ON destino_rel.unidad_canonica_id=unidad.id INNER JOIN lvj_bib_versiculos destino ON destino.id=destino_rel.versiculo_id WHERE origen_rel.versiculo_id IN ({$placeholders}) AND origen_rel.estado_revision='aprobado' AND origen_rel.deleted_at IS NULL AND unidad.estado_revision='aprobado' AND unidad.deleted_at IS NULL AND destino_rel.estado_revision='aprobado' AND destino_rel.deleted_at IS NULL AND destino.version_id=? AND destino.libro_id=? AND destino.estado=1 AND destino.deleted_at IS NULL ORDER BY origen.versiculo,destino.capitulo,destino.versiculo,destino.id";
        $stmt=$this->pdo->prepare($sql); $stmt->execute(array_merge($sourceVerseIds,[(int)$version['id'],(int)$book['id']])); $mapping=$stmt->fetchAll();
        $coveredSourceIds=array_values(array_unique(array_map(static function(array $verse): int { return (int)$verse['origen_id']; },$mapping)));
        /* Scío puede estar habilitada parcialmente. Conservamos cada equivalencia
           aprobada y marcamos como ausentes únicamente los versículos faltantes. */
        $uniqueVerses=[]; foreach($mapping as $mappedVerse)$uniqueVerses[(int)$mappedVerse['id']]=$mappedVerse; $verses=array_values($uniqueVerses);
        if (!$verses && $key==='torres_amat') $verses=$this->loadSafeEquivalentRange((int)$version['id'],(int)$book['id'],$range);
        if ($key==='torres_amat') $targetChapters=array_values(array_unique(array_map(static function(array $verse): int {
          return (int)$verse['capitulo'];
        },$verses)));
      } elseif ($key!=='platense') {
        $verses=$key==='torres_amat'
          ? $this->loadSafeEquivalentRange((int)$version['id'],(int)$book['id'],$range)
          : [];
        if ($key==='torres_amat') $targetChapters=array_values(array_unique(array_map(static function(array $verse): int {
          return (int)$verse['capitulo'];
        },$verses)));
      } else {
        $stmt=$this->pdo->prepare('SELECT id,capitulo,versiculo,texto,titulo_seccion FROM lvj_bib_versiculos WHERE version_id=:version AND libro_id=:book AND capitulo=:chapter AND versiculo BETWEEN :start AND :end AND estado=1 AND deleted_at IS NULL ORDER BY versiculo');
        $stmt->execute(['version'=>$version['id'],'book'=>$book['id'],'chapter'=>$range['capitulo_inicio'],'start'=>$range['versiculo_inicio'],'end'=>$range['versiculo_fin']]); $verses=$stmt->fetchAll();
        if ($key==='platense') {
          $sourceVerseIds=array_map(static function(array $verse): int {
            return (int)$verse['id'];
          },$verses);
        }
      }
      $notes=[]; if ($key==='platense') { $n=$this->pdo->prepare('SELECT id,versiculo,contenido,titulo,referencia,fuente FROM lvj_bib_notas_versiones WHERE version_id=:version AND libro_id=:book AND capitulo=:chapter AND versiculo BETWEEN :start AND :end AND estado=1 AND deleted_at IS NULL ORDER BY versiculo,orden'); $n->execute(['version'=>$version['id'],'book'=>$book['id'],'chapter'=>$range['capitulo_inicio'],'start'=>$range['versiculo_inicio'],'end'=>$range['versiculo_fin']]); $notes=$n->fetchAll(); }
      $versions[$key]=['disponible'=>count($verses)>0,'version'=>array_intersect_key($version,array_flip(['codigo','nombre','abreviatura','idioma','licencia','canon','versificacion'])),'libro'=>array_intersect_key($book,array_flip(['codigo','nombre','testamento','grupo'])),'versiculos'=>$verses,'mapeo'=>$mapping,'notas'=>$notes];
    }
    if (!$mainBook || empty($versions['platense']['versiculos'])) throw new InvalidArgumentException('El pasaje no existe en la Biblia Platense.');
    if (count($versions['platense']['versiculos']) !== ($range['versiculo_fin']-$range['versiculo_inicio']+1)) throw new InvalidArgumentException('El rango contiene versículos inexistentes.');
    $equivalentChapter=count($targetChapters)===1 && $targetChapters[0]!==$range['capitulo_inicio'] ? ' ('.$targetChapters[0].')' : '';
    $ref=$mainBook['nombre'].' '.$range['capitulo_inicio'].$equivalentChapter.','.$range['versiculo_inicio'].($range['versiculo_fin']!==$range['versiculo_inicio']?'-'.$range['versiculo_fin']:'');
    $themeRows=lvj_optional_rows($this->pdo,'SELECT vt.* FROM lvj_bib_versiculos_tematicos vt INNER JOIN lvj_bib_versiculos v ON v.id=vt.versiculo_id WHERE v.version_id=:version AND v.libro_id=:book AND v.capitulo=:chapter AND v.versiculo BETWEEN :start AND :end LIMIT 100',['version'=>$mainVersionId,'book'=>$mainBook['id'],'chapter'=>$range['capitulo_inicio'],'start'=>$range['versiculo_inicio'],'end'=>$range['versiculo_fin']]);
    $textCodes=implode('+',array_values(array_filter(array_map(static function(array $item): string {
      return (string)($item['version']['codigo']??'');
    },$versions))));
    $textFingerprint=substr(hash('sha256',json_encode(array_map(static function(array $item): array {
      return [
        'codigo'=>(string)($item['version']['codigo']??$item['version']??''),
        'disponible'=>(bool)($item['disponible']??false),
        'versiculos'=>array_map(static function(array $verse): array {
          return [(int)($verse['id']??0),(int)($verse['capitulo']??0),(int)($verse['versiculo']??0),(string)($verse['texto']??'')];
        },$item['versiculos']??[]),
      ];
    },$versions),JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)?:''),0,16);
    $textVersion=$textCodes.'@'.$textFingerprint.'m'.BibleStudyPrompt::METHOD;
    $notesVersion=trim((string)lvj_setting('BIBLE_STRAUBINGER_NOTES_VERSION','1')) ?: '1';
    $methodConfig=BibleStudyMethod::config($range['metodo']);
    return ['referencia'=>$ref,'libro_id'=>(int)$mainBook['id'],'rango'=>$range,'metodo'=>$range['metodo'],'configuracion_metodo'=>$methodConfig,'nivel'=>$range['nivel'],'configuracion_nivel'=>BibleStudyLevel::config($range['nivel'], $range['metodo']),'versiones'=>$versions,'contenido_tematico'=>$themeRows,'metadata'=>['idioma'=>self::LANGUAGE,'esquema_version'=>$methodConfig['schema'],'modelo_referencia'=>$methodConfig['model_reference'],'tecnicas'=>$methodConfig['techniques'],'texto_version'=>$textVersion,'notas_version'=>$notesVersion],'metodo_version'=>BibleStudyPrompt::METHOD];
  }

  private function refreshBackgroundGeneration(array $row, array $range): ?array
  {
    $pending = json_decode((string) ($row['contenido_json'] ?? '{}'), true);
    $generation = is_array($pending) && is_array($pending['_generation'] ?? null) ? $pending['_generation'] : null;
    $responseId = trim((string) ($generation['response_id'] ?? ''));
    if (($generation['provider'] ?? '') !== 'openai' || $responseId === '') return null;
    $provider = BibleStudyProviderFactory::make();
    if (!$provider instanceof OpenAIProvider) return null;
    $result = $provider->retrieveBackgroundStudy($responseId);
    if (($result['state'] ?? '') === 'processing') return ['state'=>'processing'];
    if (($result['state'] ?? '') === 'failed') {
      $this->failGeneration((int) $row['id'], mb_substr((string) ($result['message'] ?? 'La generación no pudo completarse.'), 0, 1000));
      return ['state'=>'failed', 'message'=>'La generación no pudo completarse. Puedes intentarlo nuevamente.'];
    }
    $contextStartedAt = microtime(true);
    $context = $this->context($range);
    $contextJson = json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $this->telemetry('context_completed', [
      'duration_ms'=>$this->elapsedMs($contextStartedAt),
      'study_id'=>(int)$row['id'],
      'method'=>$range['metodo'],
      'level'=>$range['nivel'],
      'verse_count'=>count($context['versiones']['platense']['versiculos']??[]),
      'context_bytes'=>is_string($contextJson)?strlen($contextJson):0,
    ]);
    $generated = $provider->completeBackgroundStudy($result['response'] ?? [], $context);
    if (!is_array($generated) || !is_array($generated['study'] ?? null)) throw new RuntimeException('OpenAI devolvió una generación completada sin contenido válido.');
    $json = json_encode($generated['study'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    $persistenceStartedAt = microtime(true);
    $this->pdo->beginTransaction();
    try {
      $update = $this->pdo->prepare("UPDATE lvj_bib_estudios_ia SET titulo=:titulo,proveedor_ia='openai',modelo_ia=:model,contenido_json=:json,estado='revision',tokens_entrada=:tin,tokens_salida=:tout,error_mensaje=NULL,updated_at=NOW() WHERE id=:id AND estado='generando'");
      $update->execute(['titulo'=>$generated['study']['titulo'],'model'=>$generated['model'],'json'=>$json,'tin'=>$generated['input_tokens'],'tout'=>$generated['output_tokens'],'id'=>(int) $row['id']]);
      if ($update->rowCount() > 0) {
        $this->pdo->prepare("UPDATE lvj_bib_estudios_ia_solicitudes SET estado='completada',error_mensaje=NULL,completed_at=NOW() WHERE estudio_id=:study AND estado='procesando'")->execute(['study'=>(int) $row['id']]);
      }
      $this->pdo->commit();
      $this->telemetry('persistence_completed', [
        'duration_ms'=>$this->elapsedMs($persistenceStartedAt),
        'study_id'=>(int)$row['id'],
        'input_tokens'=>$generated['input_tokens']??null,
        'output_tokens'=>$generated['output_tokens']??null,
        'total_tokens'=>$generated['total_tokens']??null,
        'json_bytes'=>strlen($json),
      ]);
    } catch (Throwable $error) {
      if ($this->pdo->inTransaction()) $this->pdo->rollBack();
      throw $error;
    }
    $completed = lvj_first($this->pdo, 'SELECT * FROM lvj_bib_estudios_ia WHERE id=:id AND deleted_at IS NULL', ['id'=>(int) $row['id']]);
    return $completed && in_array((string) $completed['estado'], ['revision','publicado'], true) ? ['state'=>'completed', 'study'=>$this->present($completed)] : ['state'=>'processing'];
  }

  private function failGeneration(int $studyId, string $message): void
  {
    $this->pdo->beginTransaction();
    try {
      $study = $this->pdo->prepare("UPDATE lvj_bib_estudios_ia SET estado='error',error_mensaje=:error,updated_at=NOW() WHERE id=:id AND estado='generando'");
      $study->execute(['error'=>$message, 'id'=>$studyId]);
      if ($study->rowCount() > 0) {
        $this->pdo->prepare("UPDATE lvj_bib_estudios_ia_solicitudes SET estado='error',consume_cupo=0,error_mensaje=:error,completed_at=NOW() WHERE estudio_id=:study AND estado='procesando'")->execute(['error'=>$message, 'study'=>$studyId]);
      }
      $this->pdo->commit();
    } catch (Throwable $error) {
      if ($this->pdo->inTransaction()) $this->pdo->rollBack();
      throw $error;
    }
  }
  private function generationStaleBefore(): string
  {
    $providerTimeout = max(180, (int) lvj_setting('BIBLE_AI_TIMEOUT', 180));
    $staleAfterSeconds = max(600, $providerTimeout + 120);
    return gmdate('Y-m-d H:i:s', time() - $staleAfterSeconds);
  }

  private function failExpiredGeneration(int $studyId): void
  {
    $message = 'La generación superó el tiempo disponible.';
    $this->pdo->beginTransaction();
    try {
      $study = $this->pdo->prepare("UPDATE lvj_bib_estudios_ia SET estado='error',error_mensaje=:error,updated_at=NOW() WHERE id=:id AND estado='generando'");
      $study->execute(['error'=>$message, 'id'=>$studyId]);
      if ($study->rowCount() > 0) {
        $request = $this->pdo->prepare("UPDATE lvj_bib_estudios_ia_solicitudes SET estado='error',consume_cupo=0,error_mensaje=:error,completed_at=NOW() WHERE estudio_id=:study AND estado='procesando'");
        $request->execute(['error'=>$message, 'study'=>$studyId]);
      }
      $this->pdo->commit();
    } catch (Throwable $error) {
      if ($this->pdo->inTransaction()) $this->pdo->rollBack();
      throw $error;
    }
  }
  private function enforceQuota(array $user): void { $email=mb_strtolower(trim((string)($user['correo']??$user['email']??''))); $unlimited=array_filter(array_map(static function($value) {
    return mb_strtolower(trim($value));
  },explode(',',(string)lvj_setting('BIBLE_AI_UNLIMITED_EMAILS','lavozdejesusco@gmail.com,lavozdejesus.co@gmail.com,lenis4842@gmail.com')))); if($email!==''&&in_array($email,$unlimited,true))return; $limit=max(1,(int) lvj_setting('BIBLE_AI_FREE_REQUESTS_PER_MONTH',3)); $s=$this->pdo->prepare("SELECT COUNT(*) FROM lvj_bib_estudios_ia_solicitudes WHERE usuario_id=:user AND consume_cupo=1 AND estado='completada' AND created_at>=DATE_FORMAT(UTC_TIMESTAMP(),'%Y-%m-01')"); $s->execute(['user'=>(int)$user['id']]); if((int)$s->fetchColumn()>=$limit) throw new RuntimeException('Has utilizado tus estudios nuevos disponibles para este mes.'); }
  private function loadSafeEquivalentRange(int $versionId,int $bookId,array $range): array { $chapter=$this->safeEquivalentChapter($range['libro_codigo'],(int)$range['capitulo_inicio']); if($chapter===null)return []; $s=$this->pdo->prepare('SELECT id,capitulo,versiculo,texto,titulo_seccion FROM lvj_bib_versiculos WHERE version_id=:version AND libro_id=:book AND capitulo=:chapter AND versiculo BETWEEN :start AND :end AND estado=1 AND deleted_at IS NULL ORDER BY versiculo,id'); $s->execute(['version'=>$versionId,'book'=>$bookId,'chapter'=>$chapter,'start'=>$range['versiculo_inicio'],'end'=>$range['versiculo_fin']]); return $s->fetchAll(); }
  private function safeEquivalentChapter(string $bookCode,int $chapter): ?int { $bookCode=strtoupper($bookCode); if(in_array($bookCode,['BAR','DAN','EST'],true))return null; if($bookCode!=='PSA')return $chapter; if(in_array($chapter,[9,113,114,115,146,147],true))return null; if(($chapter>=10&&$chapter<=112)||($chapter>=116&&$chapter<=145))return $chapter+1; return $chapter; }
  private function refreshConnection(): void { try { $this->pdo->query('SELECT 1'); } catch (PDOException $error) { $mysqlCode=(int)($error->errorInfo[1]??0); if(!in_array($mysqlCode,[2006,2013],true)&&!str_contains(mb_strtolower($error->getMessage()),'server has gone away'))throw $error; $this->pdo=lvj_db(); } }
  private function elapsedMs(float $startedAt): int { return (int)round((microtime(true)-$startedAt)*1000); }
  private function responseIdHash(string $responseId): string { return $responseId===''?'':substr(hash('sha256',$responseId),0,16); }
  private function telemetry(string $stage,array $metadata=[]): void { if(class_exists('BibleStudyTelemetry',false)) BibleStudyTelemetry::log($stage,$metadata); }
  private function tableExists(string $table): bool
  {
    if (!preg_match('/^[A-Za-z0-9_]+$/', $table)) {
      return false;
    }

    /*
     * Hosting compartido: no consultar information_schema, porque algunos
     * usuarios de cPanel no tienen acceso directo a esa base del sistema.
     */
    $pattern = addcslashes($table, '\\_%');
    $statement = $this->pdo->query(
      'SHOW TABLES LIKE ' . $this->pdo->quote($pattern)
    );

    return (bool) $statement->fetchColumn();
  }

  private function columnExists(string $table, string $column): bool
  {
    if (
      !preg_match('/^[A-Za-z0-9_]+$/', $table)
      || !preg_match('/^[A-Za-z0-9_]+$/', $column)
    ) {
      return false;
    }

    $pattern = addcslashes($column, '\\_%');
    $statement = $this->pdo->query(
      'SHOW COLUMNS FROM `' . $table . '` LIKE '
      . $this->pdo->quote($pattern)
    );

    return (bool) $statement->fetch();
  }
  private function equivalenceCount(string $table): array { $sql="SELECT SUM(CASE WHEN estado_revision='aprobado' THEN 1 ELSE 0 END) approved,SUM(CASE WHEN estado_revision IN ('pendiente','revisado') THEN 1 ELSE 0 END) pending FROM {$table} WHERE deleted_at IS NULL"; $row=$this->pdo->query($sql)->fetch() ?: []; return ['approved'=>(int)($row['approved']??0),'pending'=>(int)($row['pending']??0)]; }
  private function logRequest(int $userId,?int $studyId,string $ref,string $state,bool $consume): int { $s=$this->pdo->prepare('INSERT INTO lvj_bib_estudios_ia_solicitudes(estudio_id,usuario_id,referencia,estado,origen,consume_cupo,completed_at) VALUES(:study,:user,:ref,:state,\'lector\',:consume,IF(:state2=\'completada\',NOW(),NULL))'); $s->execute(['study'=>$studyId,'user'=>$userId,'ref'=>$ref,'state'=>$state,'consume'=>$consume?1:0,'state2'=>$state]); return (int)$this->pdo->lastInsertId(); }
  private function completeRequest(int $id,int $study): void { $this->pdo->prepare("UPDATE lvj_bib_estudios_ia_solicitudes SET estudio_id=:study,estado='completada',completed_at=NOW() WHERE id=:id")->execute(['study'=>$study,'id'=>$id]); }
  private function present(array $row): array { $content=json_decode((string)($row['contenido_json']??'{}'),true); if(!is_array($content))$content=[]; $content=$this->hydrateBibleTexts($content,$row); $bookCode=''; if(!empty($row['libro_id'])){$book=lvj_first($this->pdo,'SELECT codigo FROM lvj_bib_libros WHERE id=:id AND deleted_at IS NULL LIMIT 1',['id'=>(int)$row['libro_id']]);$bookCode=(string)($book['codigo']??'');}$method=BibleStudyMethod::infer($row['metodo']??null,$row['esquema_version']??null);return ['id'=>(int)($row['id']??0),'referencia'=>(string)($row['referencia']??''),'titulo'=>(string)($row['titulo']??''),'metodo'=>$method,'modelo_referencia'=>$row['modelo_referencia']??($method==='metodo_salmo'?'salmo8-1.0':null),'tecnica_estructural'=>$row['tecnica_estructural']??($method==='integral_lvj'?'arcing':null),'nivel'=>(string)($row['nivel']??BibleStudyLevel::DEFAULT),'idioma'=>(string)($row['idioma']??self::LANGUAGE),'esquema_version'=>(string)($row['esquema_version']??'legacy'),'estado'=>(string)($row['estado']??''),'revisado'=>(bool)($row['revisado']??false),'es_publico'=>(bool)($row['es_publico']??false),'libro_codigo'=>$bookCode,'capitulo_inicio'=>(int)($row['capitulo_inicio']??0),'versiculo_inicio'=>(int)($row['versiculo_inicio']??0),'capitulo_fin'=>(int)($row['capitulo_fin']??0),'versiculo_fin'=>(int)($row['versiculo_fin']??0),'contenido'=>$content,'created_at'=>$row['created_at']??null,'updated_at'=>$row['updated_at']??null]; }
  private function hydrateBibleTexts(array $content,array $row): array
  {
    if(empty($row['libro_id'])||empty($row['capitulo_inicio'])||empty($row['versiculo_inicio']))return $content;
    $book=lvj_first($this->pdo,'SELECT codigo FROM lvj_bib_libros WHERE id=:id AND deleted_at IS NULL LIMIT 1',['id'=>(int)$row['libro_id']]);
    if(!$book)return $content;
    try {
      $storedMethod = BibleStudyMethod::infer(
        isset($row['metodo']) ? (string) $row['metodo'] : null,
        isset($row['esquema_version']) ? (string) $row['esquema_version'] : null
      );

      $hydrationMethod = in_array(
        $storedMethod,
        BibleStudyMethod::VALUES,
        true
      )
        ? $storedMethod
        : BibleStudyMethod::DEFAULT;

      $context=$this->context([
        'libro_codigo'=>(string)$book['codigo'],
        'capitulo_inicio'=>(int)$row['capitulo_inicio'],
        'versiculo_inicio'=>(int)$row['versiculo_inicio'],
        'capitulo_fin'=>(int)$row['capitulo_fin'],
        'versiculo_fin'=>(int)$row['versiculo_fin'],
        'metodo'=>$hydrationMethod,
        'nivel'=>(string)($row['nivel']??BibleStudyLevel::DEFAULT),
      ]);
      foreach(['platense','torres_amat','scio'] as $key){$version=$context['versiones'][$key]??[];$verses=$version['versiculos']??[];$original=is_array($content['textos'][$key]??null)?$content['textos'][$key]:[];$unavailableMessage=$key==='scio'?self::SCIO_REVIEW_MESSAGE:'No existe una equivalencia aprobada y segura para este pasaje.';$content['textos'][$key]=array_merge($original,$verses?['disponible'=>true,'texto'=>implode(' ',array_map(static function(array $verse): string {
        return (string)$verse['texto'];
      },$verses)),'version_texto'=>$context['metadata']['texto_version']??null]:['disponible'=>false,'texto'=>'','observacion'=>$unavailableMessage]);}
      $torresVerses=$context['versiones']['torres_amat']['versiculos']??[];
      if($torresVerses){
        $torresByNumber=[]; foreach($torresVerses as $verse)$torresByNumber[(int)$verse['versiculo']]=(string)$verse['texto'];
        foreach(($content['reescritura_comparacion']??[]) as $index=>$comparison){if(preg_match('/(\d+)\s*$/',(string)($comparison['referencia']??''),$match)){$number=(int)$match[1];if(isset($torresByNumber[$number])){$content['reescritura_comparacion'][$index]['torres_amat']=$torresByNumber[$number];if(trim((string)($comparison['observacion']??''))==='Texto recuperado de Torres Amat. La correspondencia editorial debe leerse junto con la tabla de equivalencias.')$content['reescritura_comparacion'][$index]['observacion']='';}}}
        $serialized=mb_strtolower(json_encode($content['comparacion_traducciones']??[],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)?:'');
        foreach(['no disponible','no se aport','falta de texto','no verificable','no queda disponible'] as $phrase){if(str_contains($serialized,$phrase)){$content['comparacion_desactualizada']=true;break;}}
      }
      $scioMapping=$context['versiones']['scio']['mapeo']??[];
      if($scioMapping){
        $scioBySource=[];
        foreach($scioMapping as $verse){$sourceNumber=(int)$verse['origen_versiculo'];if(!isset($scioBySource[$sourceNumber]))$scioBySource[$sourceNumber]=[];$scioBySource[$sourceNumber][]=(string)$verse['texto'];}
        foreach(($content['reescritura_comparacion']??[]) as $index=>$comparison){if(preg_match('/(\d+)\s*$/',(string)($comparison['referencia']??''),$match)){$number=(int)$match[1];if(isset($scioBySource[$number]))$content['reescritura_comparacion'][$index]['scio']=implode(' ',array_values(array_unique($scioBySource[$number])));}}
      }
      $normalized=[];
      $mappedBySource=[];
      foreach(['torres_amat','scio'] as $versionKey){
        foreach(($context['versiones'][$versionKey]['mapeo']??[]) as $verse){
          $source=(int)($verse['origen_versiculo']??0);
          if($source<1)continue;
          $mappedBySource[$versionKey][$source][]=trim((string)($verse['texto']??''));
        }
      }
      foreach(($context['versiones']['platense']['versiculos']??[]) as $sourceVerse){
        $number=(int)$sourceVerse['versiculo'];
        $row=['referencia'=>(string)$context['versiones']['platense']['libro']['nombre'].' '.(int)$sourceVerse['capitulo'].','.$number,'capitulo'=>(int)$sourceVerse['capitulo'],'versiculo'=>$number,'platense'=>(string)$sourceVerse['texto']];
        foreach(['torres_amat','scio'] as $versionKey){
          $texts=array_values(array_filter(array_unique($mappedBySource[$versionKey][$number]??[])));
          if(!$texts){foreach(($context['versiones'][$versionKey]['versiculos']??[]) as $candidate){if((int)($candidate['versiculo']??0)===$number)$texts[]=trim((string)$candidate['texto']);}}
          $row[$versionKey]=$texts?implode(' ',array_values(array_unique($texts))):'';
        }
        $row['coincidencias']=[];$row['diferencias_relevantes']=[];$row['reescritura_fiel']='';$row['observacion']='';
        $row['estado_validacion']=$row['torres_amat']===''&&$row['scio']===''?'falta_traduccion':(($row['torres_amat']===''||$row['scio']==='')?'incompleto':'completo');
        $normalized[]=$row;
      }
      $content['comparacion_versiculos']=$normalized;
      $content['reescritura_comparacion']=array_map(static function(array $row): array{return ['referencia'=>$row['referencia'],'platense'=>$row['platense'],'torres_amat'=>$row['torres_amat'],'scio'=>$row['scio'],'observacion'=>$row['observacion']];},$normalized);
    } catch(Throwable $error){error_log('LVJ Bible Study text hydration: '.$error->getMessage());}
    foreach(['platense','torres_amat','scio'] as $key){if(trim((string)($content['textos'][$key]['texto']??''))==='RECUPERAR_DESDE_BD'){$content['textos'][$key]['disponible']=false;$content['textos'][$key]['texto']='';$content['textos'][$key]['observacion']=$key==='scio'?self::SCIO_REVIEW_MESSAGE:'No fue posible recuperar el texto bíblico desde la base de datos.';}}
    return $content;
  }
}

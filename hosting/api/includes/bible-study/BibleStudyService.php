<?php
declare(strict_types=1);

final class BibleStudyService
{
  public const EQUIVALENCES_PENDING_MESSAGE = 'El estudio con inteligencia artificial estará disponible cuando finalice la revisión de equivalencias bíblicas.';
  private const VERSION_KEYS = ['platense' => 'SPAPLATENSE', 'torres_amat' => 'TORRESAMAT'];
  private $pdo;
  public function __construct(PDO $pdo) { $this->pdo=$pdo; }

  public function findPublishedForInput(array $input): ?array
  {
    $range = $this->normalize($input); $context = $this->context($range);
    $hash = hash('sha256', json_encode([$context, BibleStudyPrompt::METHOD], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    $row = lvj_first($this->pdo, "SELECT * FROM lvj_bib_estudios_ia WHERE ((hash_contexto=:hash AND metodo_version=:method) OR (libro_id=:book AND capitulo_inicio=:ci AND versiculo_inicio=:vi AND capitulo_fin=:cf AND versiculo_fin=:vf)) AND estado='publicado' AND revisado=1 AND es_publico=1 AND deleted_at IS NULL ORDER BY updated_at DESC,id DESC LIMIT 1", ['hash'=>$hash,'method'=>BibleStudyPrompt::METHOD,'book'=>$context['libro_id'],'ci'=>$range['capitulo_inicio'],'vi'=>$range['versiculo_inicio'],'cf'=>$range['capitulo_fin'],'vf'=>$range['versiculo_fin']]);
    return $row ? $this->present($row) : null;
  }

  public function create(array $input, array $user): array
  {
    $range = $this->normalize($input); $context = $this->context($range);
    $hash = hash('sha256', json_encode([$context, BibleStudyPrompt::METHOD], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    $cached = lvj_first($this->pdo, "SELECT * FROM lvj_bib_estudios_ia WHERE ((hash_contexto=:hash AND metodo_version=:method) OR (libro_id=:book AND capitulo_inicio=:ci AND versiculo_inicio=:vi AND capitulo_fin=:cf AND versiculo_fin=:vf)) AND estado IN ('revision','publicado') AND deleted_at IS NULL ORDER BY updated_at DESC,id DESC LIMIT 1", ['hash'=>$hash,'method'=>BibleStudyPrompt::METHOD,'book'=>$context['libro_id'],'ci'=>$range['capitulo_inicio'],'vi'=>$range['versiculo_inicio'],'cf'=>$range['capitulo_fin'],'vf'=>$range['versiculo_fin']]);
    if ($cached) {
      $this->logRequest((int) $user['id'], (int) $cached['id'], $context['referencia'], 'completada', false);
      return ['source' => 'cache', 'study' => $this->present($cached)];
    }
    $readiness = $this->generationReadiness();
    if (!$readiness['ready']) throw new RuntimeException($readiness['message']);
    $failed = lvj_first($this->pdo, "SELECT id FROM lvj_bib_estudios_ia WHERE hash_contexto=:hash AND metodo_version=:method AND estado='error' AND deleted_at IS NULL LIMIT 1", ['hash' => $hash, 'method' => BibleStudyPrompt::METHOD]);
    if ($failed) {
      $this->pdo->prepare("UPDATE lvj_bib_estudios_ia SET hash_contexto=SHA2(CONCAT(hash_contexto,'|error|',id,'|',UTC_TIMESTAMP(6)),256),estado='archivado',es_publico=0,deleted_at=NOW(),updated_at=NOW() WHERE id=:id AND estado='error' AND deleted_at IS NULL")
        ->execute(['id' => (int) $failed['id']]);
    }
    $this->enforceQuota((int) $user['id']);
    $requestId = $this->logRequest((int) $user['id'], null, $context['referencia'], 'procesando', true);
    $insert = $this->pdo->prepare("INSERT INTO lvj_bib_estudios_ia (libro_id,capitulo_inicio,versiculo_inicio,capitulo_fin,versiculo_fin,referencia,metodo_version,contenido_json,hash_contexto,estado) VALUES (:libro,:ci,:vi,:cf,:vf,:ref,:method,'{}',:hash,'generando')");
    try {
      $insert->execute(['libro'=>$context['libro_id'],'ci'=>$range['capitulo_inicio'],'vi'=>$range['versiculo_inicio'],'cf'=>$range['capitulo_fin'],'vf'=>$range['versiculo_fin'],'ref'=>$context['referencia'],'method'=>BibleStudyPrompt::METHOD,'hash'=>$hash]);
      $studyId = (int) $this->pdo->lastInsertId();
    } catch (PDOException $error) {
      if ((string) $error->getCode() !== '23000') throw $error;
      $cached = lvj_first($this->pdo, "SELECT * FROM lvj_bib_estudios_ia WHERE hash_contexto=:hash AND metodo_version=:method AND estado IN ('revision','publicado') AND deleted_at IS NULL LIMIT 1", ['hash'=>$hash,'method'=>BibleStudyPrompt::METHOD]);
      if (!$cached) throw $error;
      $this->completeRequest($requestId, (int) $cached['id']); return ['source'=>'cache','study'=>$this->present($cached)];
    }
    try {
      $provider = BibleStudyProviderFactory::make(); $generated = null; $last = null;
      for ($attempt = 0; $attempt < 2; $attempt++) {
        try { $generated = $provider->generateStudy($context); break; } catch (Throwable $error) { $last = $error; }
      }
      if (!$generated) throw ($last ?? new RuntimeException('No se generó el estudio.'));
      $json = json_encode($generated['study'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
      $this->pdo->prepare("UPDATE lvj_bib_estudios_ia SET titulo=:titulo,proveedor_ia=:provider,modelo_ia=:model,contenido_json=:json,estado='revision',tokens_entrada=:tin,tokens_salida=:tout,error_mensaje=NULL WHERE id=:id")
        ->execute(['titulo'=>$generated['study']['titulo'],'provider'=>strtolower((string)lvj_setting('BIBLE_AI_PROVIDER')),'model'=>$generated['model'],'json'=>$json,'tin'=>$generated['input_tokens'],'tout'=>$generated['output_tokens'],'id'=>$studyId]);
      $this->completeRequest($requestId, $studyId);
      $row = lvj_first($this->pdo, 'SELECT * FROM lvj_bib_estudios_ia WHERE id=:id', ['id'=>$studyId]);
      return ['source'=>'generated','study'=>$this->present($row ?: [])];
    } catch (Throwable $error) {
      $message = mb_substr($error->getMessage(), 0, 1000);
      $this->pdo->prepare("UPDATE lvj_bib_estudios_ia SET estado='error',error_mensaje=:error WHERE id=:id")->execute(['error'=>$message,'id'=>$studyId]);
      $this->pdo->prepare("UPDATE lvj_bib_estudios_ia_solicitudes SET estado='error',consume_cupo=0,error_mensaje=:error,completed_at=NOW(),estudio_id=:study WHERE id=:id")->execute(['error'=>$message,'study'=>$studyId,'id'=>$requestId]);
      throw $error;
    }
  }

  public function generationReadiness(): array
  {
    if (!$this->tableExists('lvj_bib_estudios_ia') || !$this->tableExists('lvj_bib_estudios_ia_solicitudes')) {
      return ['ready'=>false, 'message'=>'El almacenamiento de estudios bíblicos todavía no está disponible.'];
    }
    if (!$this->tableExists('lvj_bib_unidades_canonicas') || !$this->tableExists('lvj_bib_unidades_versiculos')) {
      return ['ready'=>false, 'message'=>self::EQUIVALENCES_PENDING_MESSAGE];
    }
    $units = $this->equivalenceCount('lvj_bib_unidades_canonicas');
    $relations = $this->equivalenceCount('lvj_bib_unidades_versiculos');
    $ready = $units['approved'] > 0 && $relations['approved'] > 0
      && $units['pending'] === 0 && $relations['pending'] === 0;
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

  private function normalize(array $input): array
  {
    $book = strtoupper(trim((string)($input['libro_codigo'] ?? '')));
    if (!preg_match('/^[0-9A-Z]{3}$/', $book)) throw new InvalidArgumentException('El libro no es válido.');
    $ci=(int)($input['capitulo_inicio']??0); $cf=(int)($input['capitulo_fin']??$ci); $vi=(int)($input['versiculo_inicio']??0); $vf=(int)($input['versiculo_fin']??$vi);
    if ($ci < 1 || $cf !== $ci || $vi < 1 || $vf < $vi) throw new InvalidArgumentException('Selecciona un rango válido del mismo capítulo.');
    return ['libro_codigo'=>$book,'capitulo_inicio'=>$ci,'versiculo_inicio'=>$vi,'capitulo_fin'=>$cf,'versiculo_fin'=>$vf];
  }

  private function context(array $range): array
  {
    $versions=[]; $mainBook=null; $mainVersionId=0; $sourceVerseIds=[]; $targetChapters=[]; $codes=self::VERSION_KEYS;
    $equivalenceTablesReady=$this->tableExists('lvj_bib_unidades_canonicas') && $this->tableExists('lvj_bib_unidades_versiculos');
    foreach ($codes as $key=>$fallback) {
      $env='BIBLE_VERSION_' . strtoupper($key); $code=strtoupper(trim((string) lvj_setting($env, $fallback)));
      $version=lvj_first($this->pdo,'SELECT * FROM lvj_bib_versiones WHERE UPPER(codigo)=:code AND estado=1 AND deleted_at IS NULL LIMIT 1',['code'=>$code]);
      if (!$version) { $versions[$key]=['disponible'=>false,'version'=>$code,'versiculos'=>[],'notas'=>[]]; continue; }
      $book=lvj_first($this->pdo,'SELECT * FROM lvj_bib_libros WHERE version_id=:version AND codigo=:book AND estado=1 AND deleted_at IS NULL LIMIT 1',['version'=>$version['id'],'book'=>$range['libro_codigo']]);
      if (!$book) { $versions[$key]=['disponible'=>false,'version'=>$version['nombre'],'versiculos'=>[],'notas'=>[]]; continue; }
      if ($key==='platense') { $mainBook=$book; $mainVersionId=(int)$version['id']; }
      if ($key==='torres_amat' && $sourceVerseIds && $equivalenceTablesReady) {
        $placeholders=implode(',',array_fill(0,count($sourceVerseIds),'?'));
        $sql="SELECT DISTINCT destino.id,destino.capitulo,destino.versiculo,destino.texto,destino.titulo_seccion FROM lvj_bib_unidades_versiculos origen_rel INNER JOIN lvj_bib_unidades_canonicas unidad ON unidad.id=origen_rel.unidad_canonica_id INNER JOIN lvj_bib_unidades_versiculos destino_rel ON destino_rel.unidad_canonica_id=unidad.id INNER JOIN lvj_bib_versiculos destino ON destino.id=destino_rel.versiculo_id WHERE origen_rel.versiculo_id IN ({$placeholders}) AND origen_rel.estado_revision='aprobado' AND origen_rel.deleted_at IS NULL AND unidad.estado_revision='aprobado' AND unidad.deleted_at IS NULL AND destino_rel.estado_revision='aprobado' AND destino_rel.deleted_at IS NULL AND destino.version_id=? AND destino.libro_id=? AND destino.estado=1 AND destino.deleted_at IS NULL ORDER BY destino.capitulo,destino.versiculo,destino.id";
        $stmt=$this->pdo->prepare($sql); $stmt->execute(array_merge($sourceVerseIds,[(int)$version['id'],(int)$book['id']])); $verses=$stmt->fetchAll();
        $targetChapters=array_values(array_unique(array_map(static fn(array $verse): int=>(int)$verse['capitulo'],$verses)));
      } elseif ($key==='torres_amat') {
        $verses=[];
      } else {
        $stmt=$this->pdo->prepare('SELECT id,capitulo,versiculo,texto,titulo_seccion FROM lvj_bib_versiculos WHERE version_id=:version AND libro_id=:book AND capitulo=:chapter AND versiculo BETWEEN :start AND :end AND estado=1 AND deleted_at IS NULL ORDER BY versiculo');
        $stmt->execute(['version'=>$version['id'],'book'=>$book['id'],'chapter'=>$range['capitulo_inicio'],'start'=>$range['versiculo_inicio'],'end'=>$range['versiculo_fin']]); $verses=$stmt->fetchAll();
        if ($key==='platense') $sourceVerseIds=array_map(static fn(array $verse): int=>(int)$verse['id'],$verses);
      }
      $notes=[]; if ($key==='platense') { $n=$this->pdo->prepare('SELECT versiculo,contenido,titulo,referencia,fuente FROM lvj_bib_notas_versiones WHERE version_id=:version AND libro_id=:book AND capitulo=:chapter AND versiculo BETWEEN :start AND :end AND estado=1 AND deleted_at IS NULL ORDER BY versiculo,orden'); $n->execute(['version'=>$version['id'],'book'=>$book['id'],'chapter'=>$range['capitulo_inicio'],'start'=>$range['versiculo_inicio'],'end'=>$range['versiculo_fin']]); $notes=$n->fetchAll(); }
      $versions[$key]=['disponible'=>count($verses)>0,'version'=>array_intersect_key($version,array_flip(['codigo','nombre','abreviatura','idioma','licencia','canon','versificacion'])),'libro'=>array_intersect_key($book,array_flip(['codigo','nombre','testamento','grupo'])),'versiculos'=>$verses,'notas'=>$notes];
    }
    if (!$mainBook || empty($versions['platense']['versiculos'])) throw new InvalidArgumentException('El pasaje no existe en la Biblia Platense.');
    if (count($versions['platense']['versiculos']) !== ($range['versiculo_fin']-$range['versiculo_inicio']+1)) throw new InvalidArgumentException('El rango contiene versículos inexistentes.');
    $equivalentChapter=count($targetChapters)===1 && $targetChapters[0]!==$range['capitulo_inicio'] ? ' ('.$targetChapters[0].')' : '';
    $ref=$mainBook['nombre'].' '.$range['capitulo_inicio'].$equivalentChapter.','.$range['versiculo_inicio'].($range['versiculo_fin']!==$range['versiculo_inicio']?'-'.$range['versiculo_fin']:'');
    $themeRows=lvj_optional_rows($this->pdo,'SELECT vt.* FROM lvj_bib_versiculos_tematicos vt INNER JOIN lvj_bib_versiculos v ON v.id=vt.versiculo_id WHERE v.version_id=:version AND v.libro_id=:book AND v.capitulo=:chapter AND v.versiculo BETWEEN :start AND :end LIMIT 100',['version'=>$mainVersionId,'book'=>$mainBook['id'],'chapter'=>$range['capitulo_inicio'],'start'=>$range['versiculo_inicio'],'end'=>$range['versiculo_fin']]);
    return ['referencia'=>$ref,'libro_id'=>(int)$mainBook['id'],'rango'=>$range,'versiones'=>$versions,'contenido_tematico'=>$themeRows,'metodo_version'=>BibleStudyPrompt::METHOD];
  }

  private function enforceQuota(int $userId): void { $limit=max(1,(int) lvj_setting('BIBLE_AI_FREE_REQUESTS_PER_MONTH',3)); $s=$this->pdo->prepare("SELECT COUNT(*) FROM lvj_bib_estudios_ia_solicitudes WHERE usuario_id=:user AND consume_cupo=1 AND estado='completada' AND created_at>=DATE_FORMAT(UTC_TIMESTAMP(),'%Y-%m-01')"); $s->execute(['user'=>$userId]); if((int)$s->fetchColumn()>=$limit) throw new RuntimeException('Has utilizado tus estudios nuevos disponibles para este mes.'); }
  private function tableExists(string $table): bool { $s=$this->pdo->prepare('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name=:table'); $s->execute(['table'=>$table]); return (int)$s->fetchColumn()===1; }
  private function equivalenceCount(string $table): array { $sql="SELECT SUM(CASE WHEN estado_revision='aprobado' THEN 1 ELSE 0 END) approved,SUM(CASE WHEN estado_revision IN ('pendiente','revisado') THEN 1 ELSE 0 END) pending FROM {$table} WHERE deleted_at IS NULL"; $row=$this->pdo->query($sql)->fetch() ?: []; return ['approved'=>(int)($row['approved']??0),'pending'=>(int)($row['pending']??0)]; }
  private function logRequest(int $userId,?int $studyId,string $ref,string $state,bool $consume): int { $s=$this->pdo->prepare('INSERT INTO lvj_bib_estudios_ia_solicitudes(estudio_id,usuario_id,referencia,estado,origen,consume_cupo,completed_at) VALUES(:study,:user,:ref,:state,\'lector\',:consume,IF(:state2=\'completada\',NOW(),NULL))'); $s->execute(['study'=>$studyId,'user'=>$userId,'ref'=>$ref,'state'=>$state,'consume'=>$consume?1:0,'state2'=>$state]); return (int)$this->pdo->lastInsertId(); }
  private function completeRequest(int $id,int $study): void { $this->pdo->prepare("UPDATE lvj_bib_estudios_ia_solicitudes SET estudio_id=:study,estado='completada',completed_at=NOW() WHERE id=:id")->execute(['study'=>$study,'id'=>$id]); }
  private function present(array $row): array { $content=json_decode((string)($row['contenido_json']??'{}'),true); return ['id'=>(int)($row['id']??0),'referencia'=>(string)($row['referencia']??''),'titulo'=>(string)($row['titulo']??''),'estado'=>(string)($row['estado']??''),'revisado'=>(bool)($row['revisado']??false),'es_publico'=>(bool)($row['es_publico']??false),'contenido'=>is_array($content)?$content:[],'created_at'=>$row['created_at']??null,'updated_at'=>$row['updated_at']??null]; }
}

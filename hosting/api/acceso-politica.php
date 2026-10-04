<?php
declare(strict_types=1);
define('LVJ_FORCE_NO_STORE', true);
require __DIR__ . '/bootstrap.php';
try {
  $pdo=lvj_db();
  $base=lvj_first($pdo,"SELECT id AS emisora_id FROM lvj_cfg_emisora WHERE estado=1 ORDER BY id ASC LIMIT 1");
  if(!$base) lvj_json_response(['error'=>'CONFIG_NOT_FOUND'],404);
  $emisoraId=(int)$base['emisora_id'];
  $module=isset($_GET['modulo'])?trim((string)$_GET['modulo']):'';
  $submodule=isset($_GET['submodulo'])?trim((string)$_GET['submodulo']):'';
  if($submodule!==''&&$module==='') lvj_json_response(['error'=>'MODULE_REQUIRED'],400);
  if($module!==''){
    $row=lvj_optional_first($pdo,"SELECT modulo,nivel_acceso FROM lvj_cfg_modulos WHERE emisora_id=:emisora_id AND modulo=:modulo LIMIT 1",['emisora_id'=>$emisoraId,'modulo'=>$module]);
    if(!$row) lvj_json_response(['error'=>'MODULE_NOT_FOUND'],404);
    $level=lvj_text($row,'nivel_acceso')?:'publico';
    if($submodule!==''){
      $sub=lvj_optional_first($pdo,"SELECT submodulo,nivel_acceso FROM lvj_cfg_submodulos WHERE emisora_id=:emisora_id AND modulo=:modulo AND submodulo=:submodulo LIMIT 1",['emisora_id'=>$emisoraId,'modulo'=>$module,'submodulo'=>$submodule]);
      if($sub) $level=lvj_text($sub,'nivel_acceso')?:$level;
      lvj_json_response(['ok'=>true,'modulo'=>lvj_text($row,'modulo'),'submodulo'=>$submodule,'nivel_acceso'=>$level]);
    }
    $subs=lvj_optional_rows($pdo,"SELECT submodulo,nivel_acceso FROM lvj_cfg_submodulos WHERE emisora_id=:emisora_id AND modulo=:modulo ORDER BY submodulo",['emisora_id'=>$emisoraId,'modulo'=>$module]);
    $map=[];foreach($subs as $s)$map[lvj_text($s,'submodulo')]=lvj_text($s,'nivel_acceso')?:$level;
    lvj_json_response(['ok'=>true,'modulo'=>lvj_text($row,'modulo'),'nivel_acceso'=>$level,'submodulos'=>$map]);
  }
  $rows=lvj_optional_rows($pdo,"SELECT modulo,nivel_acceso FROM lvj_cfg_modulos WHERE emisora_id=:emisora_id ORDER BY modulo",['emisora_id'=>$emisoraId]);
  $subs=lvj_optional_rows($pdo,"SELECT modulo,submodulo,nivel_acceso FROM lvj_cfg_submodulos WHERE emisora_id=:emisora_id ORDER BY modulo,submodulo",['emisora_id'=>$emisoraId]);
  $modules=[];foreach($rows as $r)$modules[lvj_text($r,'modulo')]=['nivel_acceso'=>lvj_text($r,'nivel_acceso')?:'publico','submodulos'=>[]];
  foreach($subs as $s){$m=lvj_text($s,'modulo');if(!isset($modules[$m]))$modules[$m]=['nivel_acceso'=>'publico','submodulos'=>[]];$modules[$m]['submodulos'][lvj_text($s,'submodulo')]=lvj_text($s,'nivel_acceso')?:$modules[$m]['nivel_acceso'];}
  lvj_json_response(['ok'=>true,'emisora_id'=>(string)$emisoraId,'modulos'=>$modules]);
}catch(Throwable $error){lvj_json_response(['error'=>'ACCESS_POLICY_QUERY_FAILED','detail'=>$error->getMessage()],500);}

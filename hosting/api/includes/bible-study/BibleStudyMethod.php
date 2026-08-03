<?php
declare(strict_types=1);

final class BibleStudyMethod
{
  public const DEFAULT = 'integral_lvj';
  public const VALUES = ['metodo_salmo', 'integral_lvj'];
  public static function normalize($value): string { $method=mb_strtolower(trim((string)$value));if($method==='')$method=self::DEFAULT;if(!in_array($method,self::VALUES,true))throw new InvalidArgumentException('El método de estudio no es válido.');return $method; }
  public static function config(string $method): array { $method=self::normalize($method);return $method==='metodo_salmo'?['method'=>$method,'label'=>'Método Salmo','schema'=>'salmo8-1.0','model_reference'=>'salmo8-1.0','techniques'=>[]]:['method'=>$method,'label'=>'Método Integral LVJ','schema'=>'integral-lvj-1.0','model_reference'=>null,'techniques'=>['arcing']]; }
  public static function infer(?string $storedMethod,?string $schemaVersion): string { $storedMethod=mb_strtolower(trim((string)$storedMethod));if(in_array($storedMethod,self::VALUES,true))return $storedMethod;$schemaVersion=mb_strtolower(trim((string)$schemaVersion));if($schemaVersion==='salmo8-1.0'||str_starts_with($schemaVersion,'salmo'))return 'metodo_salmo';if(str_starts_with($schemaVersion,'integral-lvj-'))return 'integral_lvj';return 'metodo_no_determinado'; }
  public static function prompt(string $method): string { return self::normalize($method)==='metodo_salmo'?"\n\nMÉTODO SALMO\nConserva el orden y la profundidad del modelo histórico salmo8-1.0, sin copiar temas, etapas ni conclusiones del estudio maestro. Adapta cada sección al pasaje solicitado. No generes Arcing ni transformes este método al esquema Integral.":"\n\nMÉTODO INTEGRAL LVJ\nAplica el núcleo estructural común adaptado al género. Integra Arcing como técnica interna en tres escalas: micro, meso y macro. Cada relación debe conectar unidades existentes, usar un tipo permitido, explicar su fundamento textual y declarar confianza y revisión. Arcing no es un método independiente."; }
}

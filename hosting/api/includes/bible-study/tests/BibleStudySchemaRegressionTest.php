<?php
declare(strict_types=1);

require_once dirname(__DIR__).'/BibleStudyMethod.php';
require_once dirname(__DIR__).'/BibleStudySchema.php';

function invokePrivate(string $method, array $arguments): void
{
  $reflection = new ReflectionMethod(BibleStudySchema::class, $method);
  $reflection->invoke(null, ...$arguments);
}

function expectSuccess(string $name, callable $test): void
{
  try {
    $test();
    echo "OK {$name}\n";
  } catch (Throwable $error) {
    fwrite(STDERR, "FAIL {$name}: {$error->getMessage()}\n");
    exit(1);
  }
}

function expectFailure(string $name, string $messagePart, callable $test): void
{
  try {
    $test();
  } catch (RuntimeException $error) {
    if (str_contains($error->getMessage(), $messagePart)) {
      echo "OK {$name}\n";
      return;
    }
    fwrite(STDERR, "FAIL {$name}: {$error->getMessage()}\n");
    exit(1);
  }
  fwrite(STDERR, "FAIL {$name}: no se produjo el error esperado.\n");
  exit(1);
}

function propositionAnalysis(array $verseNumbers): array
{
  $verses = [];
  foreach ($verseNumbers as $number) {
    $verses[] = [
      'numero' => $number,
      'texto_fuente' => "Texto {$number}",
      'etapa_id' => 'e1',
      'proposiciones' => [[
        'id' => "v{$number}_p1",
        'orden' => 1,
        'tipo' => 'PP',
        'texto' => "Texto {$number}",
        'requiere_revision' => false,
        'depende_de' => null,
      ]],
    ];
  }
  return [
    'schema_version' => 'proposiciones-2.1',
    'etapas' => [['id' => 'e1']],
    'versiculos' => $verses,
    'resumen' => [
      'total_versiculos' => count($verses),
      'total_pp' => count($verses),
      'total_ps' => 0,
      'total_etapas' => 1,
    ],
  ];
}

$context = ['versiones' => ['platense' => ['versiculos' => [
  ['versiculo' => 18, 'texto' => 'Texto 18'],
  ['versiculo' => 19, 'texto' => 'Texto 19'],
  ['versiculo' => 20, 'texto' => 'Texto 20'],
]]]];

expectSuccess('esquema exige todos los versículos', static function () use ($context): void {
  $schema = BibleStudySchema::jsonSchema(BibleStudyMethod::DEFAULT, $context);
  $verses = $schema['properties']['analisis_proposiciones']['properties']['versiculos'];
  if (($verses['minItems'] ?? null) !== 3 || ($verses['maxItems'] ?? null) !== 3) {
    throw new RuntimeException('El esquema no exige exactamente los tres versículos fuente.');
  }
});

expectSuccess('Método Salmo conserva su esquema funcional', static function () use ($context): void {
  $schema = BibleStudySchema::jsonSchema('metodo_salmo', $context);
  $verses = $schema['properties']['analisis_proposiciones']['properties']['versiculos'];
  if (isset($verses['maxItems']) || ($verses['minItems'] ?? null) !== 1) {
    throw new RuntimeException('El esquema del Método Salmo fue alterado.');
  }
});

expectSuccess('cobertura exacta', static function () use ($context): void {
  invokePrivate('validatePropositions', [propositionAnalysis([18, 19, 20]), $context]);
});

expectFailure('versículo omitido', 'no cubre los versículos: 20', static function () use ($context): void {
  invokePrivate('validatePropositions', [propositionAnalysis([18, 19]), $context]);
});

expectFailure('totales inconsistentes', 'no coincide con las PP', static function () use ($context): void {
  $analysis = propositionAnalysis([18, 19, 20]);
  $analysis['resumen']['total_pp'] = 2;
  invokePrivate('validatePropositions', [$analysis, $context]);
});

$analysis = propositionAnalysis([18, 19, 20]);

expectSuccess('Arcing mínimo adaptativo', static function () use ($analysis): void {
  invokePrivate('validateArcing', [[
    'unidades' => [[
      'id' => 'a1',
      'escala' => 'micro',
      'referencia' => 'Mateo 1,18-20',
      'proposiciones' => ['v18_p1', 'v19_p1', 'v20_p1'],
    ]],
    'relaciones' => [],
  ], $analysis]);
});

expectFailure('proposición fuera del rango Arcing', 'pertenece al versículo 18', static function () use ($analysis): void {
  invokePrivate('validateArcing', [[
    'unidades' => [[
      'id' => 'a1',
      'escala' => 'micro',
      'referencia' => 'Mateo 1,19-20',
      'proposiciones' => ['v18_p1'],
    ]],
    'relaciones' => [],
  ], $analysis]);
});

expectFailure('relación entre escalas incompatibles', 'no coincide con la escala', static function () use ($analysis): void {
  invokePrivate('validateArcing', [[
    'unidades' => [
      ['id' => 'a1', 'escala' => 'micro', 'referencia' => 'Mateo 1,18', 'proposiciones' => ['v18_p1']],
      ['id' => 'a2', 'escala' => 'meso', 'referencia' => 'Mateo 1,19', 'proposiciones' => ['v19_p1']],
    ],
    'relaciones' => [[
      'id' => 'r1',
      'escala' => 'micro',
      'desde' => 'a1',
      'hasta' => 'a2',
      'explicacion' => 'Relación de prueba',
    ]],
  ], $analysis]);
});

echo "Pruebas de regresión completadas.\n";

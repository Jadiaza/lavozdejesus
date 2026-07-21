<?php

declare(strict_types=1);

const LVJ_SCIO_EXPECTED_TXT_VOLUMES = 15;
const LVJ_SCIO_EXPECTED_ABBYY_VOLUMES = 15;
const LVJ_SCIO_EXPECTED_EPUB_FILES = 1;

function bib_import_relative_path(string $path, string $projectRoot): string
{
  $normalizedPath = str_replace('\\', '/', $path);
  $normalizedRoot = rtrim(str_replace('\\', '/', $projectRoot), '/');

  return ltrim(str_starts_with($normalizedPath, $normalizedRoot)
    ? substr($normalizedPath, strlen($normalizedRoot))
    : $normalizedPath, '/');
}

function bib_import_find_scio_source(string $projectRoot): array
{
  $candidates = [
    $projectRoot . '/storage/biblia/scio/fuente',
    $projectRoot . '/storage/biblias/scio/fuente',
  ];

  foreach ($candidates as $candidate) {
    if (is_dir($candidate)) {
      return ['path' => $candidate, 'exists' => true, 'candidates' => $candidates];
    }
  }

  return ['path' => $candidates[0], 'exists' => false, 'candidates' => $candidates];
}

function bib_import_file_record(SplFileInfo $file, string $projectRoot): array
{
  $path = $file->getPathname();
  $size = $file->getSize();

  return [
    'name' => $file->getFilename(),
    'path' => bib_import_relative_path($path, $projectRoot),
    'size' => $size,
    'modified_at' => date('Y-m-d H:i:s', $file->getMTime()),
    'valid' => $size > 0 && $file->isReadable(),
  ];
}

function bib_import_detect_scio_files(string $sourceRoot, string $projectRoot): array
{
  $detected = ['txt' => [], 'epub' => [], 'abbyy_files' => []];
  if (!is_dir($sourceRoot) || !is_readable($sourceRoot)) return $detected;

  $iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($sourceRoot, FilesystemIterator::SKIP_DOTS),
    RecursiveIteratorIterator::LEAVES_ONLY
  );

  foreach ($iterator as $file) {
    if (!$file instanceof SplFileInfo || !$file->isFile() || $file->isLink()) continue;
    if ($file->getFilename() === '.DS_Store' || str_starts_with($file->getFilename(), '._')) continue;
    $extension = strtolower($file->getExtension());
    $normalizedPath = strtolower(str_replace('\\', '/', $file->getPathname()));
    $record = bib_import_file_record($file, $projectRoot);

    $isAbbyy = $extension === 'abbyy' || (bool) preg_match('~/abbyy(?:/|$)~', $normalizedPath);
    if ($extension === 'txt' && !$isAbbyy) $detected['txt'][] = $record;
    if ($extension === 'epub') $detected['epub'][] = $record;
    if ($isAbbyy) $detected['abbyy_files'][] = $record;
  }

  foreach ($detected as &$files) {
    usort($files, static fn(array $a, array $b): int => strnatcasecmp($a['path'], $b['path']));
  }
  unset($files);

  return $detected;
}

function bib_import_abbyy_volumes(array $files, string $sourceRoot, string $projectRoot): array
{
  $volumes = [];
  $abbyyRoot = rtrim(str_replace('\\', '/', $sourceRoot), '/') . '/abbyy';
  foreach ($files as $file) {
    $absolute = rtrim(str_replace('\\', '/', $projectRoot), '/') . '/' . ltrim($file['path'], '/');
    $relative = str_starts_with(strtolower($absolute), strtolower($abbyyRoot . '/'))
      ? substr($absolute, strlen($abbyyRoot) + 1)
      : basename($absolute);
    $parts = array_values(array_filter(explode('/', str_replace('\\', '/', $relative)), 'strlen'));
    $volume = count($parts) > 1 ? $parts[0] : pathinfo($parts[0] ?? basename($absolute), PATHINFO_FILENAME);
    if ($volume === '') $volume = 'sin-identificar';
    if (!isset($volumes[$volume])) {
      $volumes[$volume] = ['name' => $volume, 'files' => 0, 'size' => 0, 'valid' => true];
    }
    $volumes[$volume]['files']++;
    $volumes[$volume]['size'] += (int) $file['size'];
    $volumes[$volume]['valid'] = $volumes[$volume]['valid'] && (bool) $file['valid'];
  }

  uksort($volumes, 'strnatcasecmp');
  return array_values($volumes);
}

function bib_import_group_status(array $items, int $expected, string $unit, bool $required = true): array
{
  $valid = count(array_filter($items, static fn(array $item): bool => (bool) ($item['valid'] ?? false)));
  $count = count($items);

  return [
    'items' => $items,
    'count' => $count,
    'valid_count' => $valid,
    'expected' => $expected,
    'unit' => $unit,
    'required' => $required,
    'complete' => $required
      ? $count === $expected && $valid === $expected
      : ($count === 0 || ($count === $expected && $valid === $expected)),
  ];
}

function bib_import_scio_diagnostic(string $projectRoot): array
{
  $source = bib_import_find_scio_source($projectRoot);
  $files = bib_import_detect_scio_files($source['path'], $projectRoot);
  $abbyyVolumes = bib_import_abbyy_volumes($files['abbyy_files'], $source['path'], $projectRoot);
  $groups = [
    'txt' => bib_import_group_status($files['txt'], LVJ_SCIO_EXPECTED_TXT_VOLUMES, 'archivos'),
    'abbyy' => bib_import_group_status($abbyyVolumes, LVJ_SCIO_EXPECTED_ABBYY_VOLUMES, 'tomos'),
    'epub' => bib_import_group_status($files['epub'], LVJ_SCIO_EXPECTED_EPUB_FILES, 'archivo', false),
  ];
  $targets = [
    $projectRoot . '/storage/biblia/scio/procesado/txt',
    $projectRoot . '/storage/biblia/scio/procesado/abbyy',
    $projectRoot . '/storage/biblia/scio/procesado/epub',
    $projectRoot . '/storage/biblia/scio/procesado/reportes',
  ];

  return [
    'source' => $source,
    'groups' => $groups,
    'complete' => $source['exists'] && !in_array(false, array_map(
      static fn(array $group): bool => !$group['required'] || $group['complete'],
      $groups
    ), true),
    'targets' => array_map(static fn(string $path): array => [
      'path' => $path,
      'exists' => is_dir($path),
      'relative' => bib_import_relative_path($path, $projectRoot),
    ], $targets),
  ];
}

function bib_import_prepare_scio_structure(array $targets): void
{
  foreach ($targets as $target) {
    $path = (string) ($target['path'] ?? '');
    if ($path === '') throw new RuntimeException('La ruta de procesamiento no es válida.');
    if (!is_dir($path) && !mkdir($path, 0755, true) && !is_dir($path)) {
      throw new RuntimeException('No se pudo crear la carpeta ' . basename($path) . '.');
    }
  }
}

function bib_import_scio_report_path(string $projectRoot): string
{
  return $projectRoot . '/storage/biblia/scio/procesado/reportes/diagnostico-fuentes.json';
}

function bib_import_write_scio_report(array $diagnostic, string $projectRoot): string
{
  if (empty($diagnostic['source']['exists'])) {
    throw new RuntimeException('Las fuentes locales de Scío no están disponibles para generar el informe.');
  }

  $report = [
    'schema' => 'lvj.scio.source-diagnostic.v1',
    'generated_at' => gmdate('c'),
    'source_path' => bib_import_relative_path((string) $diagnostic['source']['path'], $projectRoot),
    'complete' => (bool) $diagnostic['complete'],
    'groups' => $diagnostic['groups'],
  ];
  return bib_import_store_scio_report(
    $report,
    $projectRoot,
    bib_import_relative_path((string) $diagnostic['source']['path'], $projectRoot)
  );
}

function bib_import_store_scio_report(array $report, string $projectRoot, string $sourceLabel = 'Carpeta local seleccionada en el navegador'): string
{
  if (($report['schema'] ?? '') !== 'lvj.scio.source-diagnostic.v1' || !is_array($report['groups'] ?? null)) {
    throw new RuntimeException('El informe de diagnóstico no es válido.');
  }
  $definitions = [
    'txt' => [LVJ_SCIO_EXPECTED_TXT_VOLUMES, 'archivos', true],
    'abbyy' => [LVJ_SCIO_EXPECTED_ABBYY_VOLUMES, 'tomos', true],
    'epub' => [LVJ_SCIO_EXPECTED_EPUB_FILES, 'archivo', false],
  ];
  foreach ($definitions as $key => [$expected, $unit, $required]) {
    if (!is_array($report['groups'][$key] ?? null) || !is_array($report['groups'][$key]['items'] ?? null)) {
      throw new RuntimeException('El informe no contiene el grupo ' . strtoupper($key) . '.');
    }
    if (count($report['groups'][$key]['items']) > 100) {
      throw new RuntimeException('El informe contiene demasiados elementos.');
    }
    foreach ($report['groups'][$key]['items'] as $item) {
      if (!is_array($item)) throw new RuntimeException('El informe contiene elementos no válidos.');
    }
    $report['groups'][$key] = bib_import_group_status($report['groups'][$key]['items'], $expected, $unit, $required);
  }

  $report['generated_at'] = gmdate('c');
  $report['source_path'] = $sourceLabel;
  $report['complete'] = $report['groups']['txt']['complete'] && $report['groups']['abbyy']['complete'];

  $path = bib_import_scio_report_path($projectRoot);
  $directory = dirname($path);
  if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
    throw new RuntimeException('No se pudo crear la carpeta de reportes.');
  }
  $json = json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
  if (file_put_contents($path, $json . PHP_EOL, LOCK_EX) === false) {
    throw new RuntimeException('No se pudo escribir el informe de diagnóstico.');
  }

  return $path;
}

function bib_import_load_scio_report(string $projectRoot): ?array
{
  $path = bib_import_scio_report_path($projectRoot);
  if (!is_file($path) || !is_readable($path)) return null;
  $raw = (string) file_get_contents($path);
  $raw = preg_replace('/^\xEF\xBB\xBF/', '', $raw) ?? $raw;
  $report = json_decode($raw, true);
  if (!is_array($report) || ($report['schema'] ?? '') !== 'lvj.scio.source-diagnostic.v1' || !is_array($report['groups'] ?? null)) {
    return null;
  }

  $targets = bib_import_scio_diagnostic($projectRoot)['targets'];
  return [
    'source' => ['path' => (string) ($report['source_path'] ?? 'storage/biblia/scio/fuente'), 'exists' => false, 'candidates' => []],
    'groups' => $report['groups'],
    'complete' => (bool) ($report['complete'] ?? false),
    'targets' => $targets,
    'generated_at' => (string) ($report['generated_at'] ?? ''),
    'from_report' => true,
  ];
}

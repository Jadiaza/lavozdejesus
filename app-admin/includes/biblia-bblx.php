<?php

declare(strict_types=1);

const LVJ_BBLX_MAX_BYTES = 67108864;

function bib_bblx_books(): array
{
  $names = [
    ['Génesis','Gn','GEN','AT','Pentateuco'],['Éxodo','Ex','EXO','AT','Pentateuco'],['Levítico','Lv','LEV','AT','Pentateuco'],['Números','Nm','NUM','AT','Pentateuco'],['Deuteronomio','Dt','DEU','AT','Pentateuco'],
    ['Josué','Jos','JOS','AT','Históricos'],['Jueces','Jue','JDG','AT','Históricos'],['Rut','Rt','RUT','AT','Históricos'],['1 Samuel','1 Sam','1SA','AT','Históricos'],['2 Samuel','2 Sam','2SA','AT','Históricos'],
    ['1 Reyes','1 Re','1KI','AT','Históricos'],['2 Reyes','2 Re','2KI','AT','Históricos'],['1 Crónicas','1 Cr','1CH','AT','Históricos'],['2 Crónicas','2 Cr','2CH','AT','Históricos'],['Esdras','Esd','EZR','AT','Históricos'],
    ['Nehemías','Neh','NEH','AT','Históricos'],['Ester','Est','EST','AT','Históricos'],['Job','Job','JOB','AT','Sapienciales'],['Salmos','Sal','PSA','AT','Sapienciales'],['Proverbios','Prov','PRO','AT','Sapienciales'],
    ['Eclesiastés','Ecl','ECC','AT','Sapienciales'],['Cantar de los Cantares','Cant','SNG','AT','Sapienciales'],['Isaías','Is','ISA','AT','Profetas'],['Jeremías','Jer','JER','AT','Profetas'],['Lamentaciones','Lam','LAM','AT','Profetas'],
    ['Ezequiel','Ez','EZK','AT','Profetas'],['Daniel','Dan','DAN','AT','Profetas'],['Oseas','Os','HOS','AT','Profetas'],['Joel','Jl','JOL','AT','Profetas'],['Amós','Am','AMO','AT','Profetas'],
    ['Abdías','Abd','OBA','AT','Profetas'],['Jonás','Jon','JON','AT','Profetas'],['Miqueas','Miq','MIC','AT','Profetas'],['Nahúm','Nah','NAM','AT','Profetas'],['Habacuc','Hab','HAB','AT','Profetas'],
    ['Sofonías','Sof','ZEP','AT','Profetas'],['Ageo','Ag','HAG','AT','Profetas'],['Zacarías','Zac','ZEC','AT','Profetas'],['Malaquías','Mal','MAL','AT','Profetas'],['Mateo','Mt','MAT','NT','Evangelios'],
    ['Marcos','Mc','MRK','NT','Evangelios'],['Lucas','Lc','LUK','NT','Evangelios'],['Juan','Jn','JHN','NT','Evangelios'],['Hechos de los Apóstoles','Hch','ACT','NT','Históricos NT'],['Romanos','Rom','ROM','NT','Cartas Paulinas'],
    ['1 Corintios','1 Cor','1CO','NT','Cartas Paulinas'],['2 Corintios','2 Cor','2CO','NT','Cartas Paulinas'],['Gálatas','Gal','GAL','NT','Cartas Paulinas'],['Efesios','Ef','EPH','NT','Cartas Paulinas'],['Filipenses','Flp','PHP','NT','Cartas Paulinas'],
    ['Colosenses','Col','COL','NT','Cartas Paulinas'],['1 Tesalonicenses','1 Tes','1TH','NT','Cartas Paulinas'],['2 Tesalonicenses','2 Tes','2TH','NT','Cartas Paulinas'],['1 Timoteo','1 Tim','1TI','NT','Cartas Pastorales'],['2 Timoteo','2 Tim','2TI','NT','Cartas Pastorales'],
    ['Tito','Tit','TIT','NT','Cartas Pastorales'],['Filemón','Flm','PHM','NT','Cartas Paulinas'],['Hebreos','Heb','HEB','NT','Cartas Católicas'],['Santiago','Sant','JAS','NT','Cartas Católicas'],['1 Pedro','1 Pe','1PE','NT','Cartas Católicas'],
    ['2 Pedro','2 Pe','2PE','NT','Cartas Católicas'],['1 Juan','1 Jn','1JN','NT','Cartas Católicas'],['2 Juan','2 Jn','2JN','NT','Cartas Católicas'],['3 Juan','3 Jn','3JN','NT','Cartas Católicas'],['Judas','Jud','JUD','NT','Cartas Católicas'],
    ['Apocalipsis','Ap','REV','NT','Apocalíptico'],['Tobías','Tob','TOB','AT','Deuterocanónicos'],['Judit','Jdt','JDT','AT','Deuterocanónicos'],['Sabiduría','Sab','WIS','AT','Deuterocanónicos'],['Eclesiástico','Eclo','SIR','AT','Deuterocanónicos'],
    ['Baruc','Bar','BAR','AT','Deuterocanónicos'],['1 Macabeos','1 Mac','1MA','AT','Deuterocanónicos'],['2 Macabeos','2 Mac','2MA','AT','Deuterocanónicos'],
  ];
  return array_combine(range(1, 73), $names);
}

function bib_bblx_canonical_order(int $book): int
{
  if ($book <= 16) return $book;
  if ($book === 17) return 19;
  if ($book >= 18 && $book <= 22) return $book + 2;
  if ($book >= 23 && $book <= 25) return $book + 4;
  if ($book >= 26 && $book <= 39) return $book + 5;
  if ($book >= 40 && $book <= 66) return $book + 7;
  $deuterocanonical = [67 => 17, 68 => 18, 69 => 25, 70 => 26, 71 => 30, 72 => 45, 73 => 46];
  return $deuterocanonical[$book] ?? $book;
}

function bib_bblx_plain_text(string $rtf): string
{
  $rtf = preg_replace_callback("/\\\\'([0-9a-fA-F]{2})/", static function (array $m): string {
    return (string) iconv('Windows-1252', 'UTF-8//IGNORE', chr(hexdec($m[1])));
  }, $rtf) ?? $rtf;
  $rtf = preg_replace_callback('/\\\\u(-?\d+)\??/', static function (array $m): string {
    $code = (int) $m[1];
    if ($code < 0) $code += 65536;
    return mb_convert_encoding('&#' . $code . ';', 'UTF-8', 'HTML-ENTITIES');
  }, $rtf) ?? $rtf;
  $rtf = str_replace(['\\par', '\\line'], "\n", $rtf);
  $rtf = str_replace('\\tab', "\t", $rtf);
  $rtf = str_replace(['\\{', '\\}', '\\\\'], ['{', '}', '\\'], $rtf);
  $rtf = preg_replace('/\\\\[a-zA-Z]+-?\d* ?/', '', $rtf) ?? $rtf;
  $rtf = str_replace(['{', '}'], '', $rtf);
  if (!mb_check_encoding($rtf, 'UTF-8')) {
    $rtf = (string) iconv('Windows-1252', 'UTF-8//IGNORE', $rtf);
  }
  return trim((string) preg_replace('/\s+/u', ' ', html_entity_decode($rtf, ENT_QUOTES | ENT_HTML5, 'UTF-8')));
}

function bib_bblx_open(string $path): PDO
{
  $handle = fopen($path, 'rb');
  $header = $handle ? fread($handle, 16) : false;
  if ($handle) fclose($handle);
  if ($header !== "SQLite format 3\0") throw new RuntimeException('El archivo BBLX no es una base SQLite válida.');
  $sqlite = new PDO('sqlite:' . $path, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
  $tables = $sqlite->query("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('Bible','Details')")->fetchAll(PDO::FETCH_COLUMN);
  if (count($tables) !== 2) throw new RuntimeException('El BBLX no contiene las tablas Bible y Details requeridas.');
  return $sqlite;
}

function bib_bblx_import(PDO $mysql, array $upload, array $input, string $storageRoot): array
{
  @set_time_limit(0);
  @ini_set('memory_limit', '512M');
  if (($upload['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || empty($upload['tmp_name']) || !is_uploaded_file($upload['tmp_name'])) {
    throw new RuntimeException('Selecciona un archivo BBLX válido.');
  }
  if ((int) ($upload['size'] ?? 0) > LVJ_BBLX_MAX_BYTES) throw new RuntimeException('El archivo BBLX supera el límite de 64 MB.');
  if (strtolower(pathinfo((string) ($upload['name'] ?? ''), PATHINFO_EXTENSION)) !== 'bblx') throw new RuntimeException('Solo se permiten archivos con extensión .bblx.');

  $name = trim((string) ($input['nombre'] ?? ''));
  $code = strtoupper(trim((string) ($input['codigo'] ?? '')));
  $abbreviation = trim((string) ($input['abreviatura'] ?? ''));
  $license = trim((string) ($input['licencia'] ?? ''));
  if ($name === '' || $abbreviation === '' || !preg_match('/^[A-Z0-9_]{3,30}$/', $code)) throw new RuntimeException('Completa nombre, abreviatura y un código válido.');
  if ($license === '') throw new RuntimeException('Debes documentar la licencia o autorización de uso antes de importar.');

  $sqlite = bib_bblx_open((string) $upload['tmp_name']);
  $stats = $sqlite->query('SELECT COUNT(*) total, COUNT(DISTINCT Book) books, MIN(Book) min_book, MAX(Book) max_book FROM Bible')->fetch(PDO::FETCH_ASSOC);
  if ((int) $stats['books'] !== 73 || (int) $stats['min_book'] !== 1 || (int) $stats['max_book'] !== 73) {
    throw new RuntimeException('El archivo debe contener exactamente los libros BBLX 1 a 73.');
  }
  $duplicate = (int) $sqlite->query('SELECT COUNT(*) FROM (SELECT Book,Chapter,Verse FROM Bible GROUP BY Book,Chapter,Verse HAVING COUNT(*) > 1)')->fetchColumn();
  if ($duplicate > 0) throw new RuntimeException('El BBLX contiene referencias duplicadas.');

  $existing = $mysql->prepare('SELECT id FROM lvj_bib_versiones WHERE codigo = :codigo AND deleted_at IS NULL LIMIT 1');
  $existing->execute(['codigo' => $code]);
  if ($existing->fetchColumn()) throw new RuntimeException('Ya existe una versión con el código ' . $code . '.');

  $books = bib_bblx_books();
  $chapterCounts = [];
  foreach ($sqlite->query('SELECT Book, MAX(Chapter) chapters FROM Bible GROUP BY Book') as $row) $chapterCounts[(int) $row['Book']] = (int) $row['chapters'];
  $mysql->beginTransaction();
  try {
    $version = $mysql->prepare("INSERT INTO lvj_bib_versiones
      (nombre, abreviatura, codigo, idioma, fuente, licencia, fuente_url, copyright_notas, canon, versificacion, estado, created_at, updated_at)
      VALUES (:nombre,:abreviatura,:codigo,'es','Archivo BBLX / e-Sword',:licencia,NULL,:copyright,73,:versificacion,1,NOW(),NOW())");
    $version->execute(['nombre' => $name, 'abreviatura' => $abbreviation, 'codigo' => $code, 'licencia' => $license,
      'copyright' => trim((string) ($input['copyright_notas'] ?? '')), 'versificacion' => trim((string) ($input['versificacion'] ?? 'Católica')) ?: 'Católica']);
    $versionId = (int) $mysql->lastInsertId();
    $insertBook = $mysql->prepare("INSERT INTO lvj_bib_libros
      (version_id,testamento,grupo,orden,nombre,abreviatura,codigo,capitulos,estado,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,1,NOW(),NOW())");
    $bookIds = [];
    foreach ($books as $number => $book) {
      [$bookName,$abbr,$bookCode,$testament,$group] = $book;
      $insertBook->execute([$versionId,$testament,$group,bib_bblx_canonical_order($number),$bookName,$abbr,$bookCode,$chapterCounts[$number] ?? 0]);
      $bookIds[$number] = (int) $mysql->lastInsertId();
    }
    $insertVerse = $mysql->prepare('INSERT INTO lvj_bib_versiculos (version_id,libro_id,capitulo,versiculo,texto,titulo_seccion,tiene_nota,estado) VALUES (?,?,?,?,?,NULL,0,1)');
    $total = 0;
    $rows = $sqlite->query('SELECT Book,Chapter,Verse,Scripture FROM Bible ORDER BY Book,Chapter,Verse');
    while ($row = $rows->fetch(PDO::FETCH_ASSOC)) {
      $text = bib_bblx_plain_text((string) $row['Scripture']);
      if ($text === '') throw new RuntimeException('Texto vacío en ' . $row['Book'] . '.' . $row['Chapter'] . '.' . $row['Verse'] . '.');
      $insertVerse->execute([$versionId,$bookIds[(int) $row['Book']],(int) $row['Chapter'],(int) $row['Verse'],$text]);
      $total++;
    }
    $slug = strtolower(str_replace('_', '-', $code));
    $targetDir = $storageRoot . '/' . $slug . '/fuente/bblx';
    if (!is_dir($targetDir) && !mkdir($targetDir, 0755, true) && !is_dir($targetDir)) throw new RuntimeException('No se pudo crear la carpeta de fuentes BBLX.');
    $target = $targetDir . '/' . date('YmdHis') . '-' . bin2hex(random_bytes(4)) . '.bblx';
    if (!move_uploaded_file((string) $upload['tmp_name'], $target)) throw new RuntimeException('No se pudo conservar el archivo fuente BBLX.');
    $mysql->commit();
    return ['version_id' => $versionId, 'libros' => 73, 'versiculos' => $total, 'archivo' => basename($target)];
  } catch (Throwable $error) {
    if ($mysql->inTransaction()) $mysql->rollBack();
    throw $error;
  }
}

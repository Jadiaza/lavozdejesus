<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

lvj_require_method('GET');

$limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT);
$offset = filter_input(INPUT_GET, 'offset', FILTER_VALIDATE_INT);
$categoria = lvj_clean_text($_GET['categoria'] ?? '');
$categories = ['peticion', 'accion_gracias', 'enfermos', 'familia', 'difuntos', 'vocaciones', 'sacerdotes', 'trabajo', 'paz', 'otra'];
$limit = $limit === false || $limit === null ? 10 : max(1, min(50, $limit));
$offset = $offset === false || $offset === null ? 0 : max(0, $offset);

if ($categoria !== '' && !in_array($categoria, $categories, true)) {
  lvj_json_response(['success' => false, 'message' => 'La categoría seleccionada no es válida.'], 422);
}

try {
  $pdo = lvj_db();
  $categoryFilter = $categoria !== '' ? ' AND categoria = :categoria' : '';
  $statement = $pdo->prepare("
    SELECT id, nombre, ciudad, peticion, categoria, total_oraciones, created_at, fecha_publicacion
    FROM lvj_com_peticiones_oracion
    WHERE estado = 'aprobado' AND deleted_at IS NULL{$categoryFilter}
    ORDER BY fecha_publicacion DESC, id DESC
    LIMIT :limit OFFSET :offset
  ");
  if ($categoria !== '') {
    $statement->bindValue(':categoria', $categoria, PDO::PARAM_STR);
  }
  $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
  $statement->bindValue(':offset', $offset, PDO::PARAM_INT);
  $statement->execute();

  lvj_json_response(['success' => true, 'data' => $statement->fetchAll()]);
} catch (Throwable $error) {
  error_log('LVJ peticiones list: ' . $error->getMessage());
  lvj_json_response(['success' => false, 'message' => 'No fue posible cargar las intenciones.'], 500);
}

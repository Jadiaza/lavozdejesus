<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();
$pageTitle = 'Importar oraciones';
$pageSubtitle = 'Colección del Devocionario Católico';
$sourceFile = __DIR__ . '/data/oraciones-devocionario-catolico.json';
$message = '';
$error = '';
$collection = [];
$prayers = [];

function prayer_app_category(string $sourceCategory): string
{
  return match (trim($sourceCategory)) {
    'Oraciones del cristiano', 'Devociones', 'Sanación y protección', 'Liberación' => trim($sourceCategory),
    'Vida diaria', 'Intercesión' => 'Oraciones del cristiano',
    'Sanación y protección' => 'Sanación y protección',
    'Liberación' => 'Liberación',
    default => 'Devociones',
  };
}

try {
  if (!is_file($sourceFile)) {
    throw new RuntimeException('No se encontró el archivo editorial de la colección.');
  }

  $collection = json_decode((string) file_get_contents($sourceFile), true, 512, JSON_THROW_ON_ERROR);
  $prayers = is_array($collection['oraciones'] ?? null) ? $collection['oraciones'] : [];
  if (!$prayers) {
    throw new RuntimeException('La colección no contiene oraciones para importar.');
  }

  $columnsStatement = $pdo->query('SHOW COLUMNS FROM lvj_ora_oraciones');
  $columnRows = $columnsStatement->fetchAll(PDO::FETCH_ASSOC);
  $columns = [];
  foreach ($columnRows as $column) {
    $columns[(string) $column['Field']] = $column;
  }

  foreach (['titulo', 'descripcion'] as $requiredColumn) {
    if (!isset($columns[$requiredColumn])) {
      throw new RuntimeException('Falta la columna requerida ' . $requiredColumn . '. Ejecuta primero la migración de la biblioteca de oraciones.');
    }
  }

  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    if ((string) ($_POST['action'] ?? '') !== 'importar') {
      throw new RuntimeException('Acción no permitida.');
    }

    $created = 0;
    $updated = 0;
    $pdo->beginTransaction();

    foreach ($prayers as $index => $prayer) {
      $title = trim((string) ($prayer['titulo'] ?? ''));
      if ($title === '') {
        throw new RuntimeException('Hay una oración sin título en la posición ' . ($index + 1) . '.');
      }

      $text = trim((string) ($prayer['texto_completo'] ?? ''));
      $theme = trim((string) ($prayer['tema_visual'] ?? 'oracion')) ?: 'oracion';
      $sourceCategory = trim((string) ($prayer['categoria'] ?? 'Vida diaria'));
      $appCategory = prayer_app_category($sourceCategory);
      $devotionSlug = trim((string) ($prayer['devocion_slug'] ?? ''));
      $devotionId = null;
      if ($devotionSlug !== '' && isset($columns['devocion_id'])) {
        $devotionQuery = $pdo->prepare('SELECT id FROM lvj_ora_devociones WHERE slug = :slug LIMIT 1');
        $devotionQuery->execute(['slug' => $devotionSlug]);
        $devotionId = $devotionQuery->fetchColumn() ?: null;
      }
      if ($devotionId) {
        $appCategory = 'Devociones';
      }
      $payload = [
        'devocion_id' => $devotionId,
        'tipo' => $devotionId ? 'devocion' : 'independiente',
        'titulo' => $title,
        'subtitulo' => trim((string) ($prayer['subtitulo'] ?? '')),
        'categoria' => $appCategory,
        'subcategoria' => trim((string) ($prayer['subcategoria'] ?? $prayer['subcategoria_app'] ?? '')),
        'descripcion' => trim((string) ($prayer['descripcion'] ?? '')),
        'texto_completo' => $text,
        'contenido_json' => json_encode([
          'version' => 1,
          'subcategoria' => trim((string) ($prayer['subcategoria'] ?? $prayer['subcategoria_app'] ?? '')),
          'devocion_slug' => $devotionSlug,
          'secciones' => [['tipo' => 'oracion', 'texto' => $text]],
          'apariencia' => ['tema' => $theme],
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),
        'tema_visual' => $theme,
        'imagen' => null,
        'audio_url' => null,
        'fuente' => trim((string) ($prayer['fuente'] ?? 'Devocionario Católico')),
        'pagina_fuente' => trim((string) ($prayer['pagina_fuente'] ?? '')),
        'derechos_revisados' => 0,
        'destacada' => 0,
        'disponible_offline' => 1,
        'orden' => $index + 1,
        'estado_revision' => 'revision',
      ];

      if (isset($columns['estado'])) {
        $type = strtolower((string) ($columns['estado']['Type'] ?? ''));
        if (str_contains($type, 'int') || str_contains($type, 'bit')) {
          $payload['estado'] = 0;
        } elseif (str_starts_with($type, 'enum(')) {
          preg_match_all("/'([^']+)'/", $type, $enumMatches);
          $allowedStates = $enumMatches[1] ?? [];
          $payload['estado'] = in_array('borrador', $allowedStates, true)
            ? 'borrador'
            : (in_array('inactivo', $allowedStates, true) ? 'inactivo' : ($allowedStates[0] ?? ''));
        } else {
          $payload['estado'] = 'borrador';
        }
      }

      $payload = array_intersect_key($payload, $columns);
      $findSql = 'SELECT id FROM lvj_ora_oraciones WHERE titulo = :titulo';
      $findParams = ['titulo' => $title];
      if (isset($columns['fuente'])) {
        $findSql .= ' AND fuente = :fuente';
        $findParams['fuente'] = (string) ($payload['fuente'] ?? 'Devocionario Católico');
      }
      $findSql .= ' LIMIT 1';
      $find = $pdo->prepare($findSql);
      $find->execute($findParams);
      $existingId = $find->fetchColumn();

      if ($existingId) {
        $assignments = [];
        foreach (array_keys($payload) as $column) {
          $assignments[] = '`' . $column . '` = :' . $column;
        }
        $payload['record_id'] = (int) $existingId;
        $update = $pdo->prepare('UPDATE lvj_ora_oraciones SET ' . implode(', ', $assignments) . ' WHERE id = :record_id');
        $update->execute($payload);
        $updated++;
      } else {
        $fieldNames = array_keys($payload);
        $quotedFields = array_map(static fn(string $field): string => '`' . $field . '`', $fieldNames);
        $placeholders = array_map(static fn(string $field): string => ':' . $field, $fieldNames);
        $insert = $pdo->prepare('INSERT INTO lvj_ora_oraciones (' . implode(', ', $quotedFields) . ') VALUES (' . implode(', ', $placeholders) . ')');
        $insert->execute($payload);
        $created++;
      }
    }

    $pdo->commit();
    log_activity('importar_coleccion_oraciones', 'lvj_ora_oraciones', null, "Devocionario Católico: {$created} creadas y {$updated} actualizadas.");
    $message = "Importación terminada: {$created} oraciones creadas y {$updated} actualizadas. Todas quedaron pendientes de revisión editorial.";
  }
} catch (Throwable $exception) {
  if ($pdo->inTransaction()) {
    $pdo->rollBack();
  }
  $error = $exception->getMessage();
}

require __DIR__ . '/includes/header.php';
?>

<section class="panel content-overview-panel">
  <div class="content-overview">
    <div>
      <h2><?php echo e((string) ($collection['coleccion'] ?? 'Devocionario Católico')); ?></h2>
      <p class="muted">Vista previa de <?php echo count($prayers); ?> oraciones preparadas para la biblioteca de LVJPRAYER.</p>
    </div>
    <div class="content-actions-bar">
      <a class="btn btn-soft" href="content.php?module=oracion&amp;table=lvj_ora_oraciones">Volver a Oraciones</a>
    </div>
  </div>
  <?php if ($message): ?><div class="alert alert-success"><?php echo e($message); ?></div><?php endif; ?>
  <?php if ($error): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>
</section>

<?php if (!$error && $prayers): ?>
  <section class="panel">
    <div class="content-overview">
      <div>
        <h2>Confirmar colección</h2>
        <p class="muted">La operación es segura para repetir: identifica cada registro por título y fuente. No publica automáticamente.</p>
      </div>
      <form method="post" onsubmit="return confirm('Se crearán o actualizarán <?php echo count($prayers); ?> oraciones y quedarán En revisión. ¿Continuar?');">
        <?php echo csrf_field(); ?>
        <input type="hidden" name="action" value="importar">
        <button class="btn btn-gold" type="submit">Importar <?php echo count($prayers); ?> oraciones</button>
      </form>
    </div>

    <div class="table-wrap">
      <table>
        <thead><tr><th>#</th><th>Título</th><th>Categoría</th><th>Fuente</th><th>Estado inicial</th></tr></thead>
        <tbody>
          <?php foreach ($prayers as $index => $prayer): ?>
            <tr>
              <td><?php echo $index + 1; ?></td>
              <td><strong><?php echo e((string) ($prayer['titulo'] ?? '')); ?></strong><br><small><?php echo e((string) ($prayer['subtitulo'] ?? '')); ?></small></td>
              <td><?php echo e(prayer_app_category((string) ($prayer['categoria'] ?? ''))); ?><br><small><?php echo e((string) ($prayer['categoria'] ?? '')); ?></small></td>
              <td><?php echo e((string) ($prayer['fuente'] ?? 'Devocionario Católico')); ?>, p. <?php echo e((string) ($prayer['pagina_fuente'] ?? '—')); ?></td>
              <td><span class="status-pill status-inactive">En revisión</span></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </section>
<?php endif; ?>

<?php require __DIR__ . '/includes/footer.php'; ?>

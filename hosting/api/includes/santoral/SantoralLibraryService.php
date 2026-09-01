<?php

declare(strict_types=1);

require_once __DIR__ . '/SantoralAiService.php';

final class SantoralLibraryService
{
  private PDO $pdo;

  public function __construct(PDO $pdo)
  {
    $this->pdo = $pdo;
  }

  /**
   * @param array<int,array<string,mixed>> $saints
   * @param array<string,mixed> $context
   * @return array<string,mixed>
   */
  public function ensureForOrdo(array $saints, array $context): array
  {
    if (!$this->schemaReady()) {
      return [
        'status' => 'migration_required',
        'message' => 'La migración del Santoral automático todavía no está aplicada.',
      ];
    }

    $date = substr(trim((string) ($context['fecha'] ?? '')), 0, 10);
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) !== 1) {
      return ['status' => 'skipped', 'message' => 'Fecha inválida para Santoral.'];
    }

    if (!$saints) {
      return ['status' => 'no_saints', 'items' => []];
    }

    $month = (int) substr($date, 5, 2);
    $day = (int) substr($date, 8, 2);
    $ai = new SantoralAiService();
    $items = [];

    foreach ($saints as $index => $saint) {
      $ordoId = trim((string) ($saint['ordo_santo_id'] ?? ''));
      $name = trim((string) ($saint['nombre'] ?? ''));
      $title = trim((string) ($saint['titulo'] ?? ''));
      if ($name === '') {
        continue;
      }

      $existing = $ordoId !== '' ? $this->findByOrdoId($ordoId) : null;
      if (!$existing) {
        $existing = $this->findLegacyByDateName($month, $day, $name);
      }

      if ($existing) {
        $this->linkPublishedFeaturedToLiturgia($existing, $date);
        $items[] = [
          'status' => 'reused',
          'id' => (string) ($existing['id'] ?? ''),
          'nombre' => $name,
          'estado' => (string) ($existing['estado'] ?? ''),
          'destacado' => (int) ($existing['destacado'] ?? 0),
        ];
        continue;
      }

      if (!$ai->isConfigured()) {
        $items[] = [
          'status' => 'pending_ai_config',
          'nombre' => $name,
          'ordo_santo_id' => $ordoId,
        ];
        continue;
      }

      $generated = $ai->generate($name, $title, [
        'fecha' => $date,
        'preludio' => (string) ($context['preludio'] ?? ''),
        'celebracion' => (string) ($context['celebracion'] ?? ''),
        'tiempo_liturgico' => (string) ($context['tiempo_liturgico'] ?? ''),
      ]);
      $content = $generated['content'];

      $statement = $this->pdo->prepare(
        "INSERT INTO lvj_san_santo_dia
          (ordo_santo_id, fecha, mes, dia, nombre, titulo, frase_destacada, quien_fue, imagen_url,
           lucha_que_enfrento, secreto_de_santidad, ensenanza_para_hoy, como_puedo_imitarlo,
           paso_concreto, oracion_intercesion, destacado, orden, generada_ia, modelo_ia,
           prompt_version, estado)
         VALUES
          (:ordo_santo_id, :fecha, :mes, :dia, :nombre, :titulo, :frase_destacada, :quien_fue, NULL,
           :lucha_que_enfrento, :secreto_de_santidad, :ensenanza_para_hoy, :como_puedo_imitarlo,
           :paso_concreto, :oracion_intercesion, 0, :orden, 1, :modelo_ia, :prompt_version, 'borrador')"
      );

      try {
        $statement->execute([
          'ordo_santo_id' => $ordoId !== '' ? $ordoId : null,
          'fecha' => $date,
          'mes' => $month,
          'dia' => $day,
          'nombre' => $name,
          'titulo' => $title !== '' ? $title : null,
          'frase_destacada' => $content['frase_destacada'],
          'quien_fue' => $content['quien_fue'],
          'lucha_que_enfrento' => $content['lucha_que_enfrento'],
          'secreto_de_santidad' => $content['secreto_de_santidad'],
          'ensenanza_para_hoy' => $content['ensenanza_para_hoy'],
          'como_puedo_imitarlo' => $content['como_puedo_imitarlo'],
          'paso_concreto' => $content['paso_concreto'],
          'oracion_intercesion' => $content['oracion_intercesion'],
          'orden' => max(0, (int) ($saint['orden'] ?? $index)),
          'modelo_ia' => $generated['model'],
          'prompt_version' => SantoralAiService::PROMPT_VERSION,
        ]);
      } catch (PDOException $error) {
        if ((string) $error->getCode() === '23000' && $ordoId !== '') {
          $existing = $this->findByOrdoId($ordoId);
          if ($existing) {
            $items[] = [
              'status' => 'reused',
              'id' => (string) ($existing['id'] ?? ''),
              'nombre' => $name,
              'estado' => (string) ($existing['estado'] ?? ''),
            ];
            continue;
          }
        }
        throw $error;
      }

      $items[] = [
        'status' => 'generated_for_review',
        'id' => (string) $this->pdo->lastInsertId(),
        'nombre' => $name,
        'estado' => 'borrador',
        'ordo_santo_id' => $ordoId,
        'prompt_version' => SantoralAiService::PROMPT_VERSION,
      ];
    }

    return [
      'status' => $items ? 'processed' : 'no_saints',
      'items' => $items,
    ];
  }

  private function findByOrdoId(string $ordoId): ?array
  {
    $statement = $this->pdo->prepare(
      'SELECT * FROM lvj_san_santo_dia WHERE ordo_santo_id = ? AND deleted_at IS NULL ORDER BY id DESC LIMIT 1'
    );
    $statement->execute([$ordoId]);
    $row = $statement->fetch();
    return $row ?: null;
  }

  private function findLegacyByDateName(int $month, int $day, string $name): ?array
  {
    $statement = $this->pdo->prepare(
      'SELECT * FROM lvj_san_santo_dia
       WHERE mes = :mes AND dia = :dia
         AND LOWER(TRIM(nombre)) = LOWER(TRIM(:nombre))
         AND deleted_at IS NULL
       ORDER BY destacado DESC, orden ASC, id ASC
       LIMIT 1'
    );
    $statement->execute([
      'mes' => $month,
      'dia' => $day,
      'nombre' => $name,
    ]);
    $row = $statement->fetch();
    return $row ?: null;
  }

  private function linkPublishedFeaturedToLiturgia(array $row, string $date): void
  {
    $state = strtolower(trim((string) ($row['estado'] ?? '')));
    if ($state !== 'publicado' || (int) ($row['destacado'] ?? 0) !== 1) {
      return;
    }

    $column = $this->pdo->query("SHOW COLUMNS FROM lvj_lit_lectura_dia LIKE 'santo_id'")->fetch();
    if (!$column) {
      return;
    }

    $statement = $this->pdo->prepare(
      'UPDATE lvj_lit_lectura_dia SET santo_id = :santo_id WHERE fecha = :fecha LIMIT 1'
    );
    $statement->execute([
      'santo_id' => (int) ($row['id'] ?? 0),
      'fecha' => $date,
    ]);
  }

  private function schemaReady(): bool
  {
    foreach (['ordo_santo_id', 'generada_ia', 'modelo_ia', 'prompt_version', 'revisado_at'] as $column) {
      $statement = $this->pdo->prepare(
        'SELECT COUNT(*) FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?'
      );
      $statement->execute(['lvj_san_santo_dia', $column]);
      if ((int) $statement->fetchColumn() === 0) {
        return false;
      }
    }

    return true;
  }
}

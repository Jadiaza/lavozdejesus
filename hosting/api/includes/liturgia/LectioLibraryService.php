<?php

declare(strict_types=1);

require_once __DIR__ . '/LectioCitation.php';
require_once __DIR__ . '/LectioAiService.php';

final class LectioLibraryService
{
  private PDO $pdo;

  public function __construct(PDO $pdo)
  {
    $this->pdo = $pdo;
  }

  /**
   * Genera una sola vez por cita exacta. Si ya existe una Lectio para la misma
   * fecha o la misma cita, no vuelve a consumir IA ni sobrescribe contenido.
   * La IA siempre crea estado=borrador; solo una revisión humana publica.
   *
   * @param array<string,mixed> $liturgia
   * @return array<string,mixed>
   */
  public function ensureForLiturgia(array $liturgia): array
  {
    if (!$this->schemaReady()) {
      return [
        'status' => 'migration_required',
        'message' => 'La migración de Lectio reutilizable todavía no está aplicada.',
      ];
    }

    $citation = LectioCitation::clean((string) ($liturgia['evangelio_cita'] ?? ''));
    $key = LectioCitation::key($citation);
    $gospelText = trim((string) ($liturgia['evangelio_texto'] ?? ''));
    $date = substr(trim((string) ($liturgia['fecha'] ?? '')), 0, 10);

    if ($citation === '' || $key === '' || $gospelText === '' || preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) !== 1) {
      return [
        'status' => 'skipped',
        'message' => 'La Lectio requiere fecha, cita y texto completo del Evangelio.',
      ];
    }

    // Protege el contenido ya elaborado manualmente para esa fecha.
    $existingDate = lvj_optional_first(
      $this->pdo,
      'SELECT * FROM lvj_lit_lectio_divina WHERE fecha = ? AND deleted_at IS NULL ORDER BY id DESC LIMIT 1',
      [$date],
    );
    if ($existingDate) {
      // Si el registro es antiguo y todavía no tiene clave canónica, se enlaza
      // a la cita solo cuando esa clave no está ocupada por otra Lectio.
      if (trim((string) ($existingDate['cita_clave'] ?? '')) === '' && !$this->findByKey($key)) {
        try {
          $statement = $this->pdo->prepare(
            'UPDATE lvj_lit_lectio_divina SET cita = :cita, cita_clave = :key WHERE id = :id AND (cita_clave IS NULL OR cita_clave = \'\')'
          );
          $statement->execute([
            'cita' => $citation,
            'key' => $key,
            'id' => (int) $existingDate['id'],
          ]);
          $existingDate['cita'] = $citation;
          $existingDate['cita_clave'] = $key;
        } catch (Throwable $error) {
          error_log('LVJ Lectio backfill citation: ' . $error->getMessage());
        }
      }

      return [
        'status' => 'reused_existing_date',
        'id' => (string) ($existingDate['id'] ?? ''),
        'estado' => (string) ($existingDate['estado'] ?? ''),
        'cita' => $citation,
        'cita_clave' => $key,
      ];
    }

    $existing = $this->findByKey($key);
    if ($existing) {
      return [
        'status' => 'reused',
        'id' => (string) ($existing['id'] ?? ''),
        'estado' => (string) ($existing['estado'] ?? ''),
        'cita' => $citation,
        'cita_clave' => $key,
      ];
    }

    $ai = new LectioAiService();
    if (!$ai->isConfigured()) {
      return [
        'status' => 'pending_ai_config',
        'cita' => $citation,
        'cita_clave' => $key,
        'message' => 'La Liturgia fue sincronizada, pero la IA de Lectio no está configurada.',
      ];
    }

    $generated = $ai->generate($citation, $gospelText, $liturgia);
    $content = $generated['content'];

    $statement = $this->pdo->prepare(
      "INSERT INTO lvj_lit_lectio_divina
        (liturgia_id, fecha, cita, cita_clave, frase_destacada, reflexion, pregunta_meditar, oracion, compromiso, mensaje_final, audio_url, generada_ia, modelo_ia, prompt_version, estado)
       VALUES
        (NULL, :fecha, :cita, :cita_clave, :frase_destacada, :reflexion, :pregunta_meditar, :oracion, :compromiso, :mensaje_final, NULL, 1, :modelo_ia, :prompt_version, 'borrador')"
    );

    try {
      $statement->execute([
        'fecha' => $date,
        'cita' => $citation,
        'cita_clave' => $key,
        'frase_destacada' => $content['frase_destacada'],
        'reflexion' => $content['reflexion'],
        'pregunta_meditar' => $content['pregunta_meditar'],
        'oracion' => $content['oracion'],
        'compromiso' => $content['compromiso'],
        'mensaje_final' => $content['mensaje_final'],
        'modelo_ia' => $generated['model'],
        'prompt_version' => LectioAiService::PROMPT_VERSION,
      ]);
    } catch (PDOException $error) {
      // Una ejecución concurrente puede haber creado la misma fecha o cita.
      if ((string) $error->getCode() === '23000') {
        $existing = $this->findByKey($key) ?: lvj_optional_first(
          $this->pdo,
          'SELECT * FROM lvj_lit_lectio_divina WHERE fecha = ? AND deleted_at IS NULL ORDER BY id DESC LIMIT 1',
          [$date],
        );
        if ($existing) {
          return [
            'status' => 'reused',
            'id' => (string) ($existing['id'] ?? ''),
            'estado' => (string) ($existing['estado'] ?? ''),
            'cita' => $citation,
            'cita_clave' => $key,
          ];
        }
      }
      throw $error;
    }

    return [
      'status' => 'generated_for_review',
      'id' => (string) $this->pdo->lastInsertId(),
      'estado' => 'borrador',
      'cita' => $citation,
      'cita_clave' => $key,
      'prompt_version' => LectioAiService::PROMPT_VERSION,
    ];
  }

  public function findPublishedByCitation(string $citation): ?array
  {
    if (!$this->schemaReady()) {
      return null;
    }

    $key = LectioCitation::key($citation);
    if ($key === '') {
      return null;
    }

    $statement = $this->pdo->prepare(
      "SELECT * FROM lvj_lit_lectio_divina
       WHERE cita_clave = :key
         AND estado = 'publicado'
         AND deleted_at IS NULL
       ORDER BY updated_at DESC, id DESC
       LIMIT 1"
    );
    $statement->execute(['key' => $key]);
    $row = $statement->fetch();

    return $row ?: null;
  }

  public function findPublishedForDate(string $date): ?array
  {
    $exact = lvj_optional_first(
      $this->pdo,
      "SELECT * FROM lvj_lit_lectio_divina
       WHERE fecha = ? AND estado = 'publicado' AND deleted_at IS NULL
       ORDER BY id DESC LIMIT 1",
      [$date],
    );

    if ($exact) {
      return $exact;
    }

    if (!$this->schemaReady()) {
      return null;
    }

    $liturgia = lvj_optional_first(
      $this->pdo,
      'SELECT evangelio_cita FROM lvj_lit_lectura_dia WHERE fecha = ? ORDER BY id ASC LIMIT 1',
      [$date],
    );

    $citation = trim((string) ($liturgia['evangelio_cita'] ?? ''));
    return $citation !== '' ? $this->findPublishedByCitation($citation) : null;
  }

  private function findByKey(string $key): ?array
  {
    $statement = $this->pdo->prepare(
      "SELECT * FROM lvj_lit_lectio_divina
       WHERE cita_clave = :key
         AND estado IN ('borrador','publicado')
         AND deleted_at IS NULL
       ORDER BY CASE WHEN estado='publicado' THEN 0 ELSE 1 END, updated_at DESC, id DESC
       LIMIT 1"
    );
    $statement->execute(['key' => $key]);
    $row = $statement->fetch();

    return $row ?: null;
  }

  private function schemaReady(): bool
  {
    foreach (['cita', 'cita_clave', 'frase_destacada', 'generada_ia', 'modelo_ia', 'prompt_version'] as $column) {
      $statement = $this->pdo->prepare(
        'SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?'
      );
      $statement->execute(['lvj_lit_lectio_divina', $column]);
      if ((int) $statement->fetchColumn() === 0) {
        return false;
      }
    }

    return true;
  }
}

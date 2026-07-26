<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_technical_admin();

$pdo = lvj_files_db();

function ai_training_count(PDO $pdo, string $table, string $where = '1=1'): int
{
  if (!preg_match('/^lvj_ai_[a-z0-9_]+$/', $table)) {
    return 0;
  }

  try {
    return (int) $pdo->query("SELECT COUNT(*) FROM {$table} WHERE {$where}")->fetchColumn();
  } catch (Throwable $error) {
    return 0;
  }
}

$activeProfiles = ai_training_count($pdo, 'lvj_ai_profiles', 'is_active = 1 AND deleted_at IS NULL');
$draftPrompts = ai_training_count($pdo, 'lvj_ai_prompt_versions', "status = 'draft'");
$activeRules = ai_training_count($pdo, 'lvj_ai_rules', 'is_active = 1 AND deleted_at IS NULL');
$pendingSources = ai_training_count($pdo, 'lvj_ai_knowledge_sources', "verification_status = 'pending' AND deleted_at IS NULL");
$draftExamples = ai_training_count($pdo, 'lvj_ai_examples', "status = 'draft' AND deleted_at IS NULL");
$activeTests = ai_training_count($pdo, 'lvj_ai_test_cases', 'is_active = 1');
$failedTests = ai_training_count($pdo, 'lvj_ai_test_results', 'passed = 0');
$pendingReviews = ai_training_count($pdo, 'lvj_ai_response_reviews', "review_status = 'pending'");
$responseErrors = ai_training_count($pdo, 'lvj_ai_response_logs', "status = 'error'");
$deployments = ai_training_count($pdo, 'lvj_ai_deployments');
$settings = ai_training_count($pdo, 'lvj_ai_settings');
$auditEvents = ai_training_count($pdo, 'lvj_ai_audit_logs');

$sections = [
  [
    'title' => 'Diseño de la IA',
    'description' => 'Define perfiles, versiones de instrucciones y reglas de comportamiento.',
    'color' => 'purple',
    'count' => $activeProfiles + $draftPrompts + $activeRules,
    'links' => [
      ['Perfiles', 'content.php?module=inteligencia-artificial&table=lvj_ai_profiles', $activeProfiles . ' activos'],
      ['Versiones de instrucciones', 'content.php?module=inteligencia-artificial&table=lvj_ai_prompt_versions', $draftPrompts . ' borradores'],
      ['Reglas', 'content.php?module=inteligencia-artificial&table=lvj_ai_rules', $activeRules . ' activas'],
      ['Reglas por perfil', 'content.php?module=inteligencia-artificial&table=lvj_ai_profile_rules', 'Asignación y orden'],
    ],
  ],
  [
    'title' => 'Conocimiento y ejemplos',
    'description' => 'Organiza fuentes verificables, archivos asociados y ejemplos editoriales.',
    'color' => 'gold',
    'count' => $pendingSources + $draftExamples,
    'links' => [
      ['Fuentes de conocimiento', 'content.php?module=inteligencia-artificial&table=lvj_ai_knowledge_sources', $pendingSources . ' pendientes'],
      ['Archivos de fuentes', 'content.php?module=inteligencia-artificial&table=lvj_ai_source_files', 'Solo consulta'],
      ['Ejemplos', 'content.php?module=inteligencia-artificial&table=lvj_ai_examples', $draftExamples . ' borradores'],
    ],
  ],
  [
    'title' => 'Pruebas y evaluación',
    'description' => 'Prepara casos de prueba y consulta resultados antes de publicar cambios.',
    'color' => 'blue',
    'count' => $activeTests + $failedTests,
    'links' => [
      ['Casos de prueba', 'content.php?module=inteligencia-artificial&table=lvj_ai_test_cases', $activeTests . ' activos'],
      ['Ejecuciones', 'content.php?module=inteligencia-artificial&table=lvj_ai_test_runs', 'Solo consulta'],
      ['Resultados', 'content.php?module=inteligencia-artificial&table=lvj_ai_test_results', $failedTests . ' no aprobados'],
    ],
  ],
  [
    'title' => 'Supervisión',
    'description' => 'Revisa respuestas generadas y conserva la trazabilidad editorial.',
    'color' => 'green',
    'count' => $pendingReviews + $responseErrors,
    'links' => [
      ['Respuestas registradas', 'content.php?module=inteligencia-artificial&table=lvj_ai_response_logs', $responseErrors . ' con error'],
      ['Revisiones', 'content.php?module=inteligencia-artificial&table=lvj_ai_response_reviews', $pendingReviews . ' pendientes'],
    ],
  ],
  [
    'title' => 'Operación técnica',
    'description' => 'Consulta despliegues, configuración y auditoría del Centro.',
    'color' => 'teal',
    'count' => $deployments + $settings,
    'links' => [
      ['Despliegues', 'content.php?module=inteligencia-artificial&table=lvj_ai_deployments', $deployments . ' registros'],
      ['Configuración', 'content.php?module=inteligencia-artificial&table=lvj_ai_settings', $settings . ' parámetros'],
      ['Auditoría', 'content.php?module=inteligencia-artificial&table=lvj_ai_audit_logs', $auditEvents . ' eventos'],
    ],
  ],
];

$pageTitle = 'Centro de Formación y Supervisión IA';
$pageSubtitle = 'Entrenamiento, evaluación y control editorial de la inteligencia artificial';
require __DIR__ . '/includes/header.php';
?>

<section class="page-heading">
  <div>
    <span class="eyebrow">Inteligencia Artificial</span>
    <h1>Centro de Formación y Supervisión IA</h1>
    <p>Administra el conocimiento, las instrucciones y las pruebas sin mezclar este módulo con los Estudios Bíblicos IA.</p>
  </div>
</section>

<section class="stats-grid admin-stats">
  <article class="stat-card"><div class="stat-icon purple">P</div><span>Perfiles activos</span><strong><?php echo $activeProfiles; ?></strong><small>Configuraciones de comportamiento</small></article>
  <article class="stat-card"><div class="stat-icon gold">F</div><span>Fuentes pendientes</span><strong><?php echo $pendingSources; ?></strong><small>Requieren verificación</small></article>
  <article class="stat-card"><div class="stat-icon blue">T</div><span>Pruebas fallidas</span><strong><?php echo $failedTests; ?></strong><small>Requieren revisión técnica</small></article>
  <article class="stat-card"><div class="stat-icon green">R</div><span>Revisiones pendientes</span><strong><?php echo $pendingReviews; ?></strong><small>Respuestas por evaluar</small></article>
  <article class="stat-card"><div class="stat-icon pink">E</div><span>Errores de respuesta</span><strong><?php echo $responseErrors; ?></strong><small>Registros técnicos</small></article>
</section>

<section class="module-grid ai-training-grid">
  <?php foreach ($sections as $section): ?>
    <article class="module-card">
      <div class="module-head">
        <div class="module-icon <?php echo e($section['color']); ?>"><?php echo e(substr($section['title'], 0, 2)); ?></div>
        <div>
          <h2><?php echo e($section['title']); ?></h2>
          <p><?php echo e($section['description']); ?></p>
        </div>
        <strong class="module-count"><?php echo (int) $section['count']; ?></strong>
      </div>
      <div class="ai-training-links">
        <?php foreach ($section['links'] as $link): ?>
          <a href="<?php echo e($link[1]); ?>">
            <strong><?php echo e($link[0]); ?></strong>
            <span><?php echo e($link[2]); ?></span>
          </a>
        <?php endforeach; ?>
      </div>
    </article>
  <?php endforeach; ?>
</section>

<section class="panel ai-training-notice">
  <h2>Publicación controlada</h2>
  <p>El Centro organiza y supervisa los datos existentes. Ninguna versión de instrucciones se publica automáticamente y las credenciales de proveedores no se almacenan aquí.</p>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>

<?php
require_once __DIR__ . '/includes/auth.php';
require_login();

$pageTitle = 'Estudio de Streaming';
$pageSubtitle = 'Configuración y preparación de transmisiones en vivo';
require __DIR__ . '/includes/header.php';
?>

<section class="dashboard-section-heading">
  <div>
    <span class="eyebrow">Emisora · Producción audiovisual</span>
    <h2>Estudio de Streaming</h2>
    <p>Administra los destinos de publicación y prepara la identidad visual de las transmisiones de La Voz de Jesús.</p>
  </div>
</section>

<section class="stats-grid admin-stats">
  <article class="stat-card"><div class="stat-icon gold">ST</div><span>Estado del estudio</span><strong id="studio-state">Preparación</strong><small>La emisión no se ha iniciado desde este panel</small></article>
  <article class="stat-card"><div class="stat-icon blue">DS</div><span>Destino seleccionado</span><strong id="destination-state">Livepush</strong><small>Proveedor de publicación</small></article>
  <article class="stat-card"><div class="stat-icon green">IN</div><span>Capa de intenciones</span><strong>5 segundos</strong><small>Duración prevista de cada tarjeta</small></article>
</section>

<section class="content-panel" style="margin-top:1.25rem">
  <div class="content-panel-header">
    <div><span class="eyebrow">Paso 1</span><h2>Destino de transmisión</h2><p>Selecciona el proveedor que se utilizará para la siguiente emisión.</p></div>
  </div>
  <div class="form-grid">
    <label class="form-field"><span>Proveedor</span>
      <select id="stream-provider">
        <option value="livepush">Livepush</option>
        <option value="xtreamcast">XtreamCast</option>
        <option value="custom">Otro servidor compatible</option>
      </select>
    </label>
    <label class="form-field"><span>Tipo de salida</span>
      <select id="stream-output">
        <option value="multistream">Multistream a plataformas externas</option>
        <option value="website">Reproductor de la web LVJ</option>
        <option value="audio">Audio de radio</option>
      </select>
    </label>
  </div>
  <div id="provider-note" class="notice notice-info" role="status">Livepush se selecciona como destino. La publicación desde el navegador requiere confirmar el protocolo de entrada y los datos RTMP/RTMPS o el método compatible que proporcione la cuenta.</div>
  <p class="form-help">Por seguridad, las claves de emisión no se guardan en el navegador. La conexión real se habilitará después de configurar el backend y verificar el método de publicación del proveedor.</p>
</section>

<section class="content-panel" style="margin-top:1.25rem">
  <div class="content-panel-header">
    <div><span class="eyebrow">Paso 2</span><h2>Composición del programa</h2><p>Controles iniciales para preparar las capas visuales del en vivo.</p></div>
  </div>
  <div class="form-grid">
    <label class="form-field"><span>Nombre del programa</span><input id="program-name" type="text" maxlength="120" placeholder="Ej. Adoración al Santísimo"></label>
    <label class="form-field"><span>Formato de video</span>
      <select id="video-format"><option value="16:9">Horizontal · 16:9</option><option value="9:16">Vertical · 9:16</option><option value="1:1">Cuadrado · 1:1</option></select>
    </label>
    <label class="form-field"><span>Mostrar logotipo de LVJ</span><select id="show-logo"><option value="yes">Sí, mostrar</option><option value="no">No mostrar</option></select></label>
    <label class="form-field"><span>Capa de intenciones de oración</span><select id="prayer-layer"><option value="enabled">Activada durante el en vivo</option><option value="disabled">Oculta</option></select></label>
  </div>
  <div class="notice notice-info">Las intenciones deben obtenerse de la fuente de datos existente de LVJPRAYER. La rotación de cinco segundos y su activación ligada al estado real de emisión se conectarán en la siguiente fase; este formulario todavía no publica video ni modifica las intenciones.</div>
</section>

<section class="content-panel" style="margin-top:1.25rem">
  <div class="content-panel-header">
    <div><span class="eyebrow">Paso 3</span><h2>Control de emisión</h2><p>Vista de preparación del estudio. La señal no se enviará hasta completar la integración del codificador y del servidor.</p></div>
  </div>
  <div class="quick-actions">
    <button class="btn btn-gold" type="button" id="prepare-studio">Preparar estudio</button>
    <button class="btn btn-secondary" type="button" id="reset-studio">Restablecer formulario</button>
  </div>
  <p id="studio-feedback" class="form-help" role="status">Estado: configuración local de la interfaz; no hay una transmisión activa.</p>
</section>

<script>
(function () {
  const provider = document.getElementById('stream-provider');
  const output = document.getElementById('stream-output');
  const note = document.getElementById('provider-note');
  const destination = document.getElementById('destination-state');
  const feedback = document.getElementById('studio-feedback');
  const names = { livepush: 'Livepush', xtreamcast: 'XtreamCast', custom: 'Servidor personalizado' };
  const notes = {
    livepush: 'Livepush se selecciona como destino. La publicación desde el navegador requiere confirmar el protocolo de entrada y los datos RTMP/RTMPS o el método compatible que proporcione la cuenta.',
    xtreamcast: 'XtreamCast se selecciona como destino. El reproductor existente puede mantenerse como salida secundaria; para publicar desde este estudio hay que confirmar los datos de ingestión del canal.',
    custom: 'Servidor personalizado seleccionado. Antes de publicar, configura en el backend la URL de ingestión, el protocolo, las credenciales y la política de seguridad.'
  };
  function updateProvider() {
    destination.textContent = names[provider.value];
    note.textContent = notes[provider.value];
  }
  provider.addEventListener('change', updateProvider);
  document.getElementById('prepare-studio').addEventListener('click', function () {
    const program = document.getElementById('program-name').value.trim();
    document.getElementById('studio-state').textContent = 'Preparado';
    feedback.textContent = 'Estudio preparado para ' + (program || 'una nueva transmisión') + '. Destino: ' + names[provider.value] + '. Aún no se está enviando video.';
  });
  document.getElementById('reset-studio').addEventListener('click', function () {
    document.getElementById('program-name').value = '';
    document.getElementById('video-format').value = '16:9';
    document.getElementById('show-logo').value = 'yes';
    document.getElementById('prayer-layer').value = 'enabled';
    provider.value = 'livepush';
    output.value = 'multistream';
    document.getElementById('studio-state').textContent = 'Preparación';
    feedback.textContent = 'Formulario restablecido. No hay una transmisión activa.';
    updateProvider();
  });
  updateProvider();
})();
</script>

<?php require __DIR__ . '/includes/footer.php'; ?>

<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();
$pageTitle = 'Configuración';
$pageSubtitle = 'Datos base de la emisora, app, apariencia, redes y documentos legales';

$message = '';
$error = '';
$row = [];

function legal_sanitize_html(string $html): string
{
  $html = trim($html);
  if ($html === '') return '';

  // Los textos son administrados por usuarios autenticados, pero se limpian
  // antes de publicarlos porque privacy_policy.php y term_of_use.php los imprimen como HTML.
  if (class_exists('DOMDocument')) {
    $dom = new DOMDocument('1.0', 'UTF-8');
    $wrapped = '<!DOCTYPE html><html><body><div id="lvj-legal-root">' . $html . '</div></body></html>';
    libxml_use_internal_errors(true);
    $dom->loadHTML('<?xml encoding="UTF-8">' . $wrapped, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    libxml_clear_errors();

    $allowedTags = ['div','p','br','strong','b','em','i','u','ul','ol','li','h1','h2','h3','h4','blockquote','a','span'];
    $nodes = $dom->getElementsByTagName('*');
    for ($i = $nodes->length - 1; $i >= 0; $i--) {
      $node = $nodes->item($i);
      if (!$node instanceof DOMElement) continue;
      if ($node->getAttribute('id') === 'lvj-legal-root') continue;

      if (!in_array(strtolower($node->tagName), $allowedTags, true)) {
        $fragment = $dom->createDocumentFragment();
        while ($node->firstChild) $fragment->appendChild($node->firstChild);
        $node->parentNode?->replaceChild($fragment, $node);
        continue;
      }

      $allowedAttrs = strtolower($node->tagName) === 'a' ? ['href','target','rel'] : [];
      for ($j = $node->attributes->length - 1; $j >= 0; $j--) {
        $attr = $node->attributes->item($j);
        if (!$attr) continue;
        $name = strtolower($attr->name);
        if (!in_array($name, $allowedAttrs, true)) {
          $node->removeAttribute($name);
          continue;
        }
        if ($name === 'href' && preg_match('/^\s*javascript:/i', $attr->value)) {
          $node->removeAttribute('href');
        }
      }

      if (strtolower($node->tagName) === 'a' && $node->hasAttribute('target')) {
        $node->setAttribute('rel', 'noopener noreferrer');
      }
    }

    $root = $dom->getElementById('lvj-legal-root');
    if ($root) {
      $output = '';
      foreach ($root->childNodes as $child) $output .= $dom->saveHTML($child);
      return trim($output);
    }
  }

  $clean = strip_tags($html, '<p><br><strong><b><em><i><u><ul><ol><li><h1><h2><h3><h4><blockquote><a><span><div>');
  $clean = preg_replace('/\son\w+\s*=\s*(["\']).*?\1/i', '', $clean) ?? $clean;
  $clean = preg_replace('/href\s*=\s*(["\'])\s*javascript:.*?\1/i', 'href="#"', $clean) ?? $clean;
  return trim($clean);
}

try {
  $row = $pdo->query("SELECT * FROM settings WHERE id = 1 LIMIT 1")->fetch() ?: [];
  if (!$row) {
    $error = 'No existe el registro settings.id = 1 que utilizan las páginas públicas actuales.';
  }
} catch (Throwable $loadError) {
  $error = 'No se pudo cargar la configuración legal existente.';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf();

  if (!$row) {
    $error = 'No se puede guardar porque falta settings.id = 1.';
  } else {
    $privacy = legal_sanitize_html((string) ($_POST['app_privacy_policy'] ?? ''));
    $terms = legal_sanitize_html((string) ($_POST['app_term_of_use'] ?? ''));

    if ($privacy === '' || $terms === '') {
      $error = 'La Política de privacidad y los Términos y condiciones no pueden quedar vacíos.';
    } else {
      try {
        $stmt = $pdo->prepare("
          UPDATE settings
          SET app_privacy_policy = :privacy,
              app_term_of_use = :terms
          WHERE id = 1
          LIMIT 1
        ");
        $stmt->execute([
          'privacy' => $privacy,
          'terms' => $terms,
        ]);
        log_activity('update_legal', 'settings', 1, 'Política de privacidad y términos actualizados desde el administrador LVJ');
        $row['app_privacy_policy'] = $privacy;
        $row['app_term_of_use'] = $terms;
        $message = 'Documentos legales actualizados. Las páginas públicas existentes mostrarán estos textos.';
      } catch (Throwable $saveError) {
        $error = 'No se pudieron guardar los documentos legales.';
      }
    }
  }
}

require __DIR__ . '/includes/header.php';
?>

<nav class="content-toolbar" aria-label="Secciones de Configuración">
  <div class="content-tabs">
    <a href="content.php?module=configuracion&amp;table=lvj_cfg_emisora">Emisora</a>
    <a href="content.php?module=configuracion&amp;table=lvj_cfg_app">App</a>
    <a href="content.php?module=configuracion&amp;table=lvj_cfg_apariencia">Apariencia</a>
    <a href="content.php?module=configuracion&amp;table=lvj_cfg_redes_sociales">Redes sociales</a>
    <a class="active" href="legal.php" aria-current="page">Legal</a>
  </div>
</nav>

<section class="panel content-overview-panel">
  <div class="content-overview">
    <div>
      <h2>Legal y privacidad</h2>
      <p class="muted">Edita directamente los textos que ya utiliza la tabla <strong>settings</strong>. No se crea una tabla nueva ni se altera la configuración Aa de las pantallas de lectura.</p>
    </div>
  </div>

  <?php if ($message): ?><div class="alert alert-success"><?php echo e($message); ?></div><?php endif; ?>
  <?php if ($error): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>
</section>

<?php if ($row): ?>
<form method="post" class="legal-admin-form">
  <?php echo csrf_field(); ?>

  <section class="panel legal-document-card">
    <div class="panel-header">
      <div>
        <span class="eyebrow">Documento público</span>
        <h2>Política de privacidad</h2>
        <p class="muted">Contenido mostrado por la página pública actual de privacidad.</p>
      </div>
      <a class="btn btn-soft" href="https://panelapp.lavozdejesus.co/privacy_policy.php" target="_blank" rel="noopener">Ver publicación</a>
    </div>

    <div class="legal-editor-field" data-legal-editor>
      <div class="legal-editor-heading">
        <div>
          <strong>Contenido</strong>
          <span class="field-help">Edita en vista normal o revisa directamente el HTML.</span>
        </div>
        <div class="legal-view-tabs" role="tablist" aria-label="Vista del editor de política de privacidad">
          <button type="button" class="active" data-editor-mode="visual" aria-selected="true">Vista normal</button>
          <button type="button" data-editor-mode="html" aria-selected="false">HTML</button>
        </div>
      </div>

      <div class="legal-rich-toolbar" data-editor-toolbar aria-label="Herramientas de formato">
        <button type="button" data-command="bold" title="Negrita"><strong>B</strong></button>
        <button type="button" data-command="italic" title="Cursiva"><em>I</em></button>
        <button type="button" data-command="underline" title="Subrayado"><u>U</u></button>
        <span class="legal-toolbar-separator"></span>
        <button type="button" data-block="h2" title="Título">H2</button>
        <button type="button" data-block="h3" title="Subtítulo">H3</button>
        <button type="button" data-block="p" title="Párrafo">P</button>
        <span class="legal-toolbar-separator"></span>
        <button type="button" data-command="insertUnorderedList" title="Lista con viñetas">• Lista</button>
        <button type="button" data-command="insertOrderedList" title="Lista numerada">1. Lista</button>
        <button type="button" data-command="createLink" title="Insertar enlace">Enlace</button>
        <button type="button" data-command="removeFormat" title="Limpiar formato">Limpiar</button>
      </div>

      <div class="legal-visual-editor" data-visual-editor contenteditable="true" spellcheck="true" aria-label="Editor visual de política de privacidad"><?php echo (string) ($row['app_privacy_policy'] ?? ''); ?></div>
      <textarea class="legal-html-editor" data-html-editor name="app_privacy_policy" rows="24" spellcheck="false" hidden><?php echo e((string) ($row['app_privacy_policy'] ?? '')); ?></textarea>
    </div>
  </section>

  <section class="panel legal-document-card">
    <div class="panel-header">
      <div>
        <span class="eyebrow">Documento público</span>
        <h2>Términos y condiciones</h2>
        <p class="muted">Contenido mostrado por la página pública actual de términos.</p>
      </div>
      <a class="btn btn-soft" href="https://panelapp.lavozdejesus.co/term_of_use.php" target="_blank" rel="noopener">Ver publicación</a>
    </div>

    <div class="legal-editor-field" data-legal-editor>
      <div class="legal-editor-heading">
        <div>
          <strong>Contenido</strong>
          <span class="field-help">Edita en vista normal o revisa directamente el HTML.</span>
        </div>
        <div class="legal-view-tabs" role="tablist" aria-label="Vista del editor de términos y condiciones">
          <button type="button" class="active" data-editor-mode="visual" aria-selected="true">Vista normal</button>
          <button type="button" data-editor-mode="html" aria-selected="false">HTML</button>
        </div>
      </div>

      <div class="legal-rich-toolbar" data-editor-toolbar aria-label="Herramientas de formato">
        <button type="button" data-command="bold" title="Negrita"><strong>B</strong></button>
        <button type="button" data-command="italic" title="Cursiva"><em>I</em></button>
        <button type="button" data-command="underline" title="Subrayado"><u>U</u></button>
        <span class="legal-toolbar-separator"></span>
        <button type="button" data-block="h2" title="Título">H2</button>
        <button type="button" data-block="h3" title="Subtítulo">H3</button>
        <button type="button" data-block="p" title="Párrafo">P</button>
        <span class="legal-toolbar-separator"></span>
        <button type="button" data-command="insertUnorderedList" title="Lista con viñetas">• Lista</button>
        <button type="button" data-command="insertOrderedList" title="Lista numerada">1. Lista</button>
        <button type="button" data-command="createLink" title="Insertar enlace">Enlace</button>
        <button type="button" data-command="removeFormat" title="Limpiar formato">Limpiar</button>
      </div>

      <div class="legal-visual-editor" data-visual-editor contenteditable="true" spellcheck="true" aria-label="Editor visual de términos y condiciones"><?php echo (string) ($row['app_term_of_use'] ?? ''); ?></div>
      <textarea class="legal-html-editor" data-html-editor name="app_term_of_use" rows="24" spellcheck="false" hidden><?php echo e((string) ($row['app_term_of_use'] ?? '')); ?></textarea>
    </div>
  </section>

  <div class="legal-sticky-actions">
    <span>Fuente actual: <strong>settings.id = 1</strong></span>
    <button class="btn btn-gold" type="submit">Guardar documentos legales</button>
  </div>
</form>
<?php endif; ?>

<script>
document.addEventListener('DOMContentLoaded', function () {
  var form = document.querySelector('.legal-admin-form');
  var editors = Array.from(document.querySelectorAll('[data-legal-editor]'));

  editors.forEach(function (editor) {
    var visual = editor.querySelector('[data-visual-editor]');
    var html = editor.querySelector('[data-html-editor]');
    var toolbar = editor.querySelector('[data-editor-toolbar]');
    var modeButtons = Array.from(editor.querySelectorAll('[data-editor-mode]'));

    if (!visual || !html) return;

    function syncVisualToHtml() {
      html.value = visual.innerHTML.trim();
    }

    function syncHtmlToVisual() {
      visual.innerHTML = html.value;
    }

    function setMode(mode) {
      var visualMode = mode === 'visual';
      if (visualMode) syncHtmlToVisual();
      else syncVisualToHtml();

      visual.hidden = !visualMode;
      html.hidden = visualMode;
      if (toolbar) toolbar.hidden = !visualMode;

      modeButtons.forEach(function (button) {
        var active = button.getAttribute('data-editor-mode') === mode;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    modeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        setMode(button.getAttribute('data-editor-mode') || 'visual');
      });
    });

    if (toolbar) {
      toolbar.addEventListener('mousedown', function (event) {
        if (event.target.closest('button')) event.preventDefault();
      });

      toolbar.addEventListener('click', function (event) {
        var button = event.target.closest('button');
        if (!button) return;

        visual.focus();

        var block = button.getAttribute('data-block');
        if (block) {
          document.execCommand('formatBlock', false, block);
          syncVisualToHtml();
          return;
        }

        var command = button.getAttribute('data-command');
        if (!command) return;

        if (command === 'createLink') {
          var url = window.prompt('Escribe la URL del enlace:');
          if (!url) return;
          var safeUrl = /^https?:\/\//i.test(url) || /^mailto:/i.test(url) ? url : 'https://' + url;
          document.execCommand('createLink', false, safeUrl);
        } else {
          document.execCommand(command, false);
        }

        syncVisualToHtml();
      });
    }

    visual.addEventListener('input', syncVisualToHtml);
    html.addEventListener('input', syncHtmlToVisual);
    setMode('visual');
  });

  if (form) {
    form.addEventListener('submit', function () {
      editors.forEach(function (editor) {
        var visual = editor.querySelector('[data-visual-editor]');
        var html = editor.querySelector('[data-html-editor]');
        if (visual && html && !visual.hidden) html.value = visual.innerHTML.trim();
      });
    });
  }
});
</script>

<?php require __DIR__ . '/includes/footer.php'; ?>

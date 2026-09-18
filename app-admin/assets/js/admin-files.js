document.querySelectorAll("[data-sidebar-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-open");
  });
});

const cleanLiturgicalName = (name) => {
  return String(name || "")
    .replace(/^tiempo\s+/i, "")
    .trim();
};

document.querySelectorAll("[data-liturgical-time-select]").forEach((select) => {
  const syncLiturgicalTime = () => {
    const option = select.selectedOptions[0];
    const form = select.closest("form");

    if (!option || !form) {
      return;
    }

    const nameInput = form.querySelector('[name="tiempo_liturgico"]');
    const colorInput = form.querySelector('[name="color_liturgico"]');
    const namePreview = form.querySelector("[data-liturgical-name-preview]");
    const colorPreview = form.querySelector("[data-liturgical-color-preview]");

    if (nameInput && option.dataset.nombre) {
      nameInput.value = cleanLiturgicalName(option.dataset.nombre);
    }

    if (colorInput && option.dataset.colorLiturgico) {
      colorInput.value = option.dataset.colorLiturgico;
    }

    if (namePreview) {
      namePreview.textContent = option.dataset.nombre ? cleanLiturgicalName(option.dataset.nombre) : "Sin seleccionar";
    }

    if (colorPreview) {
      colorPreview.textContent = option.dataset.colorLiturgico || "Sin seleccionar";
    }
  };

  select.addEventListener("change", syncLiturgicalTime);
  syncLiturgicalTime();
});

document.querySelectorAll("[data-capilla-active-select]").forEach((capillaSelect) => {
  const form = capillaSelect.closest("form");
  const streamSelect = form?.querySelector("[data-stream-active-select]");

  if (!streamSelect) {
    return;
  }

  const syncCapillaStreams = () => {
    const capillaId = String(capillaSelect.value || "");
    let selectedIsAvailable = false;

    Array.from(streamSelect.options).forEach((option) => {
      if (!option.value) {
        return;
      }

      const belongsToCapilla = String(option.dataset.capillaId || "") === capillaId;
      option.hidden = !belongsToCapilla;
      option.disabled = !belongsToCapilla;
      if (belongsToCapilla && option.selected) {
        selectedIsAvailable = true;
      }
    });

    if (!selectedIsAvailable) {
      streamSelect.value = "";
    }
  };

  capillaSelect.addEventListener("change", syncCapillaStreams);
  syncCapillaStreams();
});

document.querySelectorAll("[data-content-section-tabs]").forEach((tabList) => {
  const form = tabList.closest("form");
  const tabs = Array.from(tabList.querySelectorAll("[data-content-section-tab]"));

  if (!form || tabs.length === 0) {
    return;
  }

  const showSection = (section) => {
    tabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.contentSectionTab === section);
    });

    form.querySelectorAll("[data-content-section]").forEach((field) => {
      field.hidden = field.dataset.contentSection !== section;
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      showSection(tab.dataset.contentSectionTab);
    });
  });

  showSection(tabs[0].dataset.contentSectionTab);
});

document.querySelectorAll("[data-prayer-type]").forEach((typeSelect) => {
  const form = typeSelect.closest("form");
  const devotionSelect = form?.querySelector('[name="devocion_id"]');
  if (!devotionSelect) return;
  const devotionField = devotionSelect.closest("label");
  const syncPrayerType = () => {
    const linked = typeSelect.value === "devocion";
    devotionField.hidden = !linked;
    devotionSelect.required = linked;
    if (!linked) devotionSelect.value = "";
  };
  typeSelect.addEventListener("change", syncPrayerType);
  syncPrayerType();
});

document.querySelectorAll("[data-prayer-json]").forEach((textarea) => {
  const status = textarea.parentElement?.querySelector("[data-json-validation]");
  const form = textarea.closest("form");
  const originalJson = textarea.value;
  const setFieldValue = (name, value) => {
    if (!form || value === undefined) return;
    const field = form.elements.namedItem(name);
    if (!field) return;
    if (field instanceof RadioNodeList) {
      field.value = value == null ? "" : String(value);
      return;
    }
    if (field.type === "checkbox") {
      field.checked = value === true || value === 1 || value === "1" || value === "true";
      return;
    }
    field.value = value == null ? "" : String(value);
    field.dispatchEvent(new Event("change", { bubbles: true }));
  };
  const syncPrayerFields = (parsed) => {
    const fields = [
      "devocion_id", "tipo", "titulo", "subtitulo", "categoria", "descripcion",
      "texto_completo", "tema_visual", "imagen", "imagen_url", "audio_url",
      "fuente", "pagina_fuente", "derechos_revisados", "destacada",
      "disponible_offline", "orden", "estado_revision",
    ];
    fields.forEach((name) => {
      if (Object.prototype.hasOwnProperty.call(parsed, name)) setFieldValue(name, parsed[name]);
    });

    const nested = parsed.contenido_json && typeof parsed.contenido_json === "object"
      ? parsed.contenido_json
      : parsed;
    if (!Object.prototype.hasOwnProperty.call(parsed, "texto_completo")) {
      const sectionText = nested?.secciones?.find((section) => section && typeof section.texto === "string")?.texto;
      if (sectionText) setFieldValue("texto_completo", sectionText);
    }
    if (!Object.prototype.hasOwnProperty.call(parsed, "tema_visual") && nested?.apariencia?.tema) {
      setFieldValue("tema_visual", nested.apariencia.tema);
    }
  };
  const validateJson = () => {
    try {
      const parsed = JSON.parse(textarea.value || "{}");
      if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error("Debe ser un objeto");
      const nested = parsed.contenido_json && typeof parsed.contenido_json === "object" ? parsed.contenido_json : parsed;
      if (nested.secciones !== undefined && !Array.isArray(nested.secciones)) throw new Error("secciones debe ser una lista");
      syncPrayerFields(parsed);
      textarea.setCustomValidity("");
      if (status) {
        status.textContent = "JSON válido · todos los campos fueron actualizados";
        status.classList.remove("invalid");
        status.classList.add("valid");
      }
    } catch (error) {
      textarea.setCustomValidity(`JSON no válido: ${error.message}`);
      if (status) {
        status.textContent = `JSON no válido: ${error.message}`;
        status.classList.remove("valid");
        status.classList.add("invalid");
      }
    }
  };
  const updateCount = () => {
    const count = form?.querySelector("[data-prayer-json-count]");
    if (!count) return;
    const lines = textarea.value ? textarea.value.split(/\r?\n/).length : 0;
    count.textContent = `${lines} líneas · ${textarea.value.length} caracteres`;
  };
  const readFieldValue = (name) => {
    if (!form) return undefined;
    const field = form.elements.namedItem(name);
    if (!field) return undefined;
    if (field instanceof RadioNodeList) return field.value;
    if (field.type === "checkbox") return field.checked;
    return field.value;
  };
  const syncJsonFromForm = () => {
    let parsed = {};
    try { parsed = JSON.parse(textarea.value || "{}"); } catch (_) { parsed = {}; }
    const fields = [
      "devocion_id", "tipo", "titulo", "subtitulo", "categoria", "descripcion",
      "texto_completo", "tema_visual", "imagen", "imagen_url", "audio_url",
      "fuente", "pagina_fuente", "derechos_revisados", "destacada",
      "disponible_offline", "orden", "estado_revision",
    ];
    fields.forEach((name) => {
      const value = readFieldValue(name);
      if (value !== undefined) parsed[name] = value;
    });
    const nested = parsed.contenido_json && typeof parsed.contenido_json === "object"
      ? parsed.contenido_json
      : (parsed.contenido_json = { version: 1, secciones: [] });
    nested.version ||= 1;
    nested.secciones = [{ tipo: "oracion", texto: String(readFieldValue("texto_completo") || "") }];
    nested.apariencia = { ...(nested.apariencia || {}), tema: String(readFieldValue("tema_visual") || "oracion") };
    textarea.value = JSON.stringify(parsed, null, 2);
    validateJson();
    updateCount();
  };

  form?.querySelectorAll("[data-prayer-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      const jsonMode = button.dataset.prayerMode === "json";
      if (jsonMode) syncJsonFromForm();
      form.querySelectorAll("[data-prayer-mode]").forEach((item) => item.classList.toggle("active", item === button));
      form.querySelectorAll("[data-prayer-form-view]").forEach((item) => { item.hidden = jsonMode; });
      const jsonView = form.querySelector("[data-prayer-json-view]");
      if (jsonView) jsonView.hidden = !jsonMode;
    });
  });
  form?.querySelector("[data-prayer-json-format]")?.addEventListener("click", () => {
    try { textarea.value = JSON.stringify(JSON.parse(textarea.value || "{}"), null, 2); } catch (_) { /* validateJson muestra el error */ }
    validateJson(); updateCount();
  });
  form?.querySelector("[data-prayer-json-copy]")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(textarea.value);
      if (status) status.textContent = "JSON copiado al portapapeles";
    } catch (_) {
      textarea.select(); document.execCommand("copy");
    }
  });
  form?.querySelector("[data-prayer-json-restore]")?.addEventListener("click", () => {
    textarea.value = originalJson; validateJson(); updateCount();
  });
  textarea.addEventListener("input", validateJson);
  textarea.addEventListener("input", updateCount);
  textarea.addEventListener("blur", () => {
    validateJson();
    if (!textarea.validationMessage) {
      textarea.value = JSON.stringify(JSON.parse(textarea.value || "{}"), null, 2);
    }
  });
  validateJson();
  updateCount();
});

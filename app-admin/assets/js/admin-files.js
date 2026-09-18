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
  const validateJson = () => {
    try {
      const parsed = JSON.parse(textarea.value || "{}");
      if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error("Debe ser un objeto");
      if (parsed.secciones !== undefined && !Array.isArray(parsed.secciones)) throw new Error("secciones debe ser una lista");
      textarea.setCustomValidity("");
      if (status) {
        status.textContent = "JSON válido";
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
  textarea.addEventListener("input", validateJson);
  textarea.addEventListener("blur", () => {
    validateJson();
    if (!textarea.validationMessage) {
      textarea.value = JSON.stringify(JSON.parse(textarea.value || "{}"), null, 2);
    }
  });
  validateJson();
});

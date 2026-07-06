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

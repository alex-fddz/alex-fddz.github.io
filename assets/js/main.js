function getNestedYamlValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc && acc[key], obj);
}

async function loadYAML(lang) {
  try {
    const response = await fetch(`content/${lang}.yaml`);
    const yamlText = await response.text();
    const content = jsyaml.load(yamlText);

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const value = getNestedYamlValue(content, key);
      if (value) {
        el.innerText = value;
      }
    });
  } catch (error) {
    console.error("Error loading YAML:", error);
  }
}

function setContentLang(lang) {
  loadYAML(lang);
  // Update "Get my CV" button so default is in selected language
  document.getElementById("getCVBtn").href = "downloads/FERNANDEZ_Javier_CV_" + lang.toUpperCase() + ".pdf";
  localStorage.setItem("selectedLang", lang); // Save preference
  document.getElementById("lang-switcher").innerText = `[${lang}]`; // Set lang text
  // Update active class on dropdown items
  document.querySelectorAll(".dropdown-item").forEach(item => {
    item.classList.remove("active"); // Remove "active" from all items
    if (item.getAttribute("data-lang") === lang) {
      item.classList.add("active"); // Add "active" to the selected item
    }
  });
}

// main:

document.addEventListener("DOMContentLoaded", function () {
  // Load content in chosen language
  const savedLang = localStorage.getItem("selectedLang") || "en";
  setContentLang(savedLang);

  // Add event listener for language selection
  document.querySelectorAll(".dropdown-lang").forEach(item => {
    item.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent jumping to top
      const selectedLang = this.getAttribute("data-lang");
      setContentLang(selectedLang);
    });
  });

  // Add event listener for collapsing skills accordions
  document.querySelectorAll('.skills-accordion-collapse').forEach((el) => {
    el.addEventListener('show.bs.collapse', function () {
      document.querySelectorAll('.skills-accordion-collapse.show').forEach((openEl) => {
        if (openEl !== el) {
          new bootstrap.Collapse(openEl, {
            toggle: false
          }).hide();
        }
      });
    });
  });
});


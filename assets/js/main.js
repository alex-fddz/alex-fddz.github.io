typedObj = null;

function makeTyped() {
  if (typedObj) {
    console.log(typedObj);
    typedObj.destroy(); // Clean up previous instance
  }
  typedObj = new Typed('#typed', {
    stringsElement: '#typed-strings',
    typeSpeed: 50,
    backDelay: 1250,
    backSpeed: 25,
    loop: true
  });
}

function getNestedYamlValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc && acc[key], obj);
}

async function loadYAML(lang) {
  try {
    const response = await fetch(`content/${lang}.yaml`);
    const yamlText = await response.text();
    // const content = jsyaml.load(yamlText);
    window.content = jsyaml.load(yamlText); // Expose content obj so it's accessible later (projects).

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const value = getNestedYamlValue(content, key);
      if (value) {
        el.innerText = value;
      }
    });

    makeTyped();

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

  // Add event listener for updating project modal content
  const projectModal = document.getElementById('projectModal');
  projectModal.addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget;
    const projectId = button.getAttribute('data-project-id');
    const project = window.content['projects'][projectId];
    document.getElementById('projectModalLabel').textContent = project['title'];
    document.getElementById('projectModalImage').src = 'assets/images/' + projectId + '.jpg';
    document.getElementById('projectModalDescription').innerHTML = project['desc'];
  });
});


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

function genProjectCard(id, project) {
  const keywords = project.keywords.split(",");
  const card = document.createElement("div");
  card.className = "project-item col-12 col-md-4 mb-3";
  card.dataset.tags = project.filters;
  card.innerHTML = `
    <div class="card h-100">
      <img src="/assets/images/${id}.jpg" class="card-img-top" alt="${project.title}">
      <div class="card-body d-flex flex-column">
        <div class="flex-grow-1">
          <p class="card-text fs-4" data-i18n="projects.list.${id}.title"></p>
          <h6 class="mb-3">
            ${keywords
              .map(k => `<span class="badge text-bg-light">${k}</span>`)
              .join(" ")}
          </h6>
        </div>
        <div>
          <button type="button" 
            class="btn btn-primary" 
            data-bs-toggle="modal" 
            data-bs-target="#projectModal" 
            data-project-id="${id}" 
            data-i18n="projects.read_more"></button>
        </div>
      </div>
    </div>
  `;
  return card;
}

function autoGenerateContent() {
  // Generate projects gallery content
  const gallery = document.getElementById("projects-gallery");
  if (gallery) {
    gallery.innerHTML = ""; // Make sure we start blank
    const projectsList = window.content['projects']['list'];
    Object.entries(projectsList).forEach(([id, project]) => {
      const card = genProjectCard(id, project);
      gallery.appendChild(card);
    });
  }
}

async function loadYAML(lang) {
  try {
    const response = await fetch(`/content/${lang}.yaml`);
    const yamlText = await response.text();
    // const content = jsyaml.load(yamlText);
    window.content = jsyaml.load(yamlText); // Expose content obj so it's accessible later (projects).

    autoGenerateContent(); // If any.

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const value = getNestedYamlValue(content, key);
      if (value) {
        el.innerText = value;
      }
    });

    if (document.querySelector('#typed')) {
      makeTyped();
    }

  } catch (error) {
    console.error("Error loading YAML:", error);
  }
}

function setContentLang(lang) {
  loadYAML(lang);
  localStorage.setItem("selectedLang", lang); // Save preference
  document.getElementById("lang-switcher").innerText = `[${lang}]`; // Set lang text
  // Update active class on dropdown items
  document.querySelectorAll(".dropdown-item").forEach(item => {
    item.classList.remove("active"); // Remove "active" from all items
    if (item.getAttribute("data-lang") === lang) {
      item.classList.add("active"); // Add "active" to the selected item
    }
  });
  // Update "Get my CV" button so default is in selected language
  const getCVBtn = document.getElementById('theme-toggle');
  if (getCVBtn) {
    getCVBtn.href = "/downloads/FERNANDEZ_Javier_CV_" + lang.toUpperCase() + ".pdf";
  }
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
    const project = window.content['projects']['list'][projectId];
    document.getElementById('projectModalLabel').textContent = project['title'];
    document.getElementById('projectModalImage').src = '/assets/images/' + projectId + '.jpg';
    document.getElementById('projectModalDescription').innerHTML = project['desc'];
  });

  // Theme functionality
  const root = document.documentElement; // <html> element
  const toggleBtn = document.getElementById("themeToggle");
  function setTheme(theme, save=0) {
    root.setAttribute("data-bs-theme", theme);
    toggleBtn.textContent = theme === "dark" ? "[*]" : "[(]";
    if (save) localStorage.setItem("savedTheme", theme); // Save preference
  }

  // Load preferred theme
  setTheme(localStorage.getItem("savedTheme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ?
      "dark" : "light")
  );

  // Add event listener for theme toggle
  toggleBtn.addEventListener("click", function () {
    const current = root.getAttribute("data-bs-theme");
    setTheme(current === "dark" ? "light" : "dark", save=1);
  });

  // Add event listener for projects page filters
  const filterButtons = document.querySelectorAll('#filterButtons .nav-link');
  if (filterButtons) {
    filterButtons.forEach(tab => {
      tab.addEventListener('shown.bs.tab', (event) => {
        const filter = event.target.getAttribute('data-filter');
        const projects = document.querySelectorAll('.project-item'); // projects load later
        projects.forEach(card => {
          const tags = card.getAttribute('data-tags'); // e.g. "iot,automation,python"
          if (filter === "all" || tags.includes(filter)) {
            card.classList.remove('d-none');
          } else {
            card.classList.add('d-none');
          }
        });
      });
    });
  }
});


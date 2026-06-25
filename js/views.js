/* ============================================================
   VIEWS - Page Views for Control Animal Selwo
   ============================================================ */
window.App = window.App || {};

App.Views = (() => {
  'use strict';

  const H = App.Helpers;
  const UI = App.UI;
  const DB = App.DB;

  // ── Chart instance reference ──────────────────────────────
  let weightChart = null;

  // ── Splash Screen ─────────────────────────────────────────
  function renderSplash() {
    const app = document.getElementById('app');

    // Generate particles
    let particles = '';
    for (let i = 0; i < 30; i++) {
      const left = Math.random() * 100;
      const delay = Math.random() * 8;
      const size = 2 + Math.random() * 4;
      const duration = 6 + Math.random() * 6;
      particles += `<div class="splash-particle" style="left:${left}%;bottom:-10px;width:${size}px;height:${size}px;animation-delay:${delay}s;animation-duration:${duration}s;"></div>`;
    }

    app.innerHTML = `
      <div class="splash-screen" id="splash-screen" onclick="App.Router.navigate('/menu')">
        <div class="splash-particles">${particles}</div>
        <div class="splash-content">
          <img src="assets/logo.png" alt="Selwo Marina" class="splash-logo">
          <h1 class="splash-title">Control Animal</h1>
          <p class="splash-subtitle">Sistema de Gestión Zoológica</p>
          <p class="splash-cta">Pulsa para acceder</p>
        </div>
        <div class="splash-waves">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 200" preserveAspectRatio="none">
            <path class="splash-wave-1" fill="rgba(0,180,216,0.08)" d="M0,120 C360,180 720,60 1080,120 C1260,150 1380,140 1440,130 L1440,200 L0,200 Z"/>
            <path class="splash-wave-2" fill="rgba(0,150,199,0.12)" d="M0,140 C240,100 480,180 720,140 C960,100 1200,160 1440,140 L1440,200 L0,200 Z"/>
            <path class="splash-wave-3" fill="rgba(0,119,182,0.15)" d="M0,160 C180,140 360,180 540,160 C720,140 900,170 1080,155 C1260,140 1380,160 1440,155 L1440,200 L0,200 Z"/>
          </svg>
        </div>
      </div>
    `;
  }

  // ── Main Menu ─────────────────────────────────────────────
  async function renderMenu() {
    const app = document.getElementById('app');

    // Get animal counts per department
    const counts = {};
    for (const dept of H.DEPARTMENTS) {
      try {
        counts[dept.id] = await DB.count('animals', 'department', dept.id);
      } catch {
        counts[dept.id] = 0;
      }
    }

    app.innerHTML = `
      <div class="menu-page">
        <div class="menu-header">
          <img src="assets/logo.png" alt="Selwo Marina" class="menu-logo">
          <h1 class="menu-title">Control Animal Selwo</h1>
          <p class="menu-subtitle">Selecciona un departamento</p>
        </div>
        <div class="menu-grid">
          ${H.DEPARTMENTS.map(dept => `
            <div class="dept-card dept-card--${dept.cssClass}" onclick="App.Router.navigate('/dept/${dept.id}')" role="button" tabindex="0" aria-label="${dept.name}">
              <span class="dept-card-icon">${dept.icon}</span>
              <span class="dept-card-name">${dept.name}</span>
              <span class="dept-card-count">${counts[dept.id] || 0} animales</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Add keyboard support
    document.querySelectorAll('.dept-card').forEach(card => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  // ── Department View ───────────────────────────────────────
  function renderDepartment(params) {
    const { deptId } = params;
    const dept = H.getDeptMeta(deptId);
    const app = document.getElementById('app');

    app.innerHTML = `
      ${UI.renderHeader(dept.name, '/menu')}
      ${UI.renderBreadcrumbs([
        { label: 'Inicio', path: '/menu' },
        { label: dept.name },
      ])}
      <main class="main-content">
        <div class="page-header">
          <h2>${dept.icon} ${dept.name}</h2>
        </div>
        <div class="dept-sections-grid">
          ${H.SECTIONS.map(section => `
            <div class="section-card" onclick="App.Router.navigate('/dept/${deptId}/${section.id}')" role="button" tabindex="0">
              <span class="section-card-icon">${section.icon}</span>
              <span class="section-card-name">${section.name}</span>
            </div>
          `).join('')}
        </div>
      </main>
    `;
  }

  // ── Animal List ───────────────────────────────────────────
  async function renderAnimalList(params) {
    const { deptId } = params;
    const dept = H.getDeptMeta(deptId);
    const app = document.getElementById('app');

    // Get animals and species
    const animals = await DB.AnimalService.getByDepartment(deptId);
    const species = [...new Set(animals.map(a => a.species))].sort();

    app.innerHTML = `
      ${UI.renderHeader(`${dept.name} — Animales`, `/dept/${deptId}`)}
      ${UI.renderBreadcrumbs([
        { label: 'Inicio', path: '/menu' },
        { label: dept.name, path: `/dept/${deptId}` },
        { label: 'Animales' },
      ])}
      <main class="main-content">
        <div class="page-header">
          <h2>🐾 Animales</h2>
          <button class="btn btn-primary" onclick="App.Views.openAnimalForm('${deptId}')">+ Nuevo Animal</button>
        </div>
        ${UI.renderSearchBar({
          placeholder: 'Buscar por nombre, especie o ZIMS ID...',
          filterOptions: species,
        })}
        <div class="animal-grid" id="animal-grid">
          ${renderAnimalCards(animals)}
        </div>
      </main>
    `;

    // Wire up search and filter
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('filter-select');

    const filterAnimals = H.debounce(async () => {
      const query = searchInput.value.trim().toLowerCase();
      const speciesFilter = filterSelect.value;

      let filtered = animals;
      if (query) {
        filtered = filtered.filter(a =>
          a.name.toLowerCase().includes(query) ||
          a.species.toLowerCase().includes(query) ||
          a.zims_id.toLowerCase().includes(query)
        );
      }
      if (speciesFilter) {
        filtered = filtered.filter(a => a.species === speciesFilter);
      }

      document.getElementById('animal-grid').innerHTML = renderAnimalCards(filtered);
    }, 200);

    searchInput.addEventListener('input', filterAnimals);
    filterSelect.addEventListener('change', filterAnimals);
  }

  function renderAnimalCards(animals) {
    if (animals.length === 0) {
      return `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-state-icon">🔍</div>
          <p class="empty-state-text">No se encontraron animales.</p>
        </div>
      `;
    }

    return animals.map(animal => `
      <div class="animal-card" onclick="App.Router.navigate('/animal/${animal.id}/general')" role="button" tabindex="0">
        <div class="animal-avatar">${H.getSpeciesEmoji(animal.species)}</div>
        <div class="animal-info">
          <div class="animal-name">${H.escapeHtml(animal.name)}</div>
          <div class="animal-species">${H.escapeHtml(animal.species)}</div>
          <div class="animal-meta">
            ${H.getSexBadge(animal.sex)}
            ${H.getStatusBadge(animal.status)}
            <span class="animal-zims">${H.escapeHtml(animal.zims_id)}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ── Department Section View (Diets/Trainings/etc for all dept animals) ──
  async function renderDeptSection(params) {
    const { deptId, sectionId } = params;
    const dept = H.getDeptMeta(deptId);
    const section = H.getSectionMeta(sectionId);

    if (sectionId === 'animals') {
      return renderAnimalList(params);
    }

    if (sectionId === 'reports') {
      return renderReports(params);
    }

    const app = document.getElementById('app');

    // Get all animals in dept for name mapping
    const animals = await DB.AnimalService.getByDepartment(deptId);
    const animalMap = {};
    animals.forEach(a => { animalMap[a.id] = a.name; });

    // Get records for this section
    const service = DB.getService(sectionId);
    const records = service ? await service.getByDepartment(deptId) : [];

    const columns = H.TABLE_COLUMNS[sectionId] || [];

    app.innerHTML = `
      ${UI.renderHeader(`${dept.name} — ${section.name}`, `/dept/${deptId}`)}
      ${UI.renderBreadcrumbs([
        { label: 'Inicio', path: '/menu' },
        { label: dept.name, path: `/dept/${deptId}` },
        { label: section.name },
      ])}
      <main class="main-content">
        <div class="page-header">
          <h2>${section.icon} ${section.name}</h2>
          <button class="btn btn-primary" onclick="App.Views.openDeptRecordForm('${sectionId}', '${deptId}')">+ Nuevo Registro</button>
        </div>
        <div class="card">
          <div class="card-body">
            ${UI.renderTable(records, columns, { type: sectionId, showAnimalName: true, animalMap })}
          </div>
        </div>
      </main>
    `;
  }

  // ── Reports View ──────────────────────────────────────────
  async function renderReports(params) {
    const { deptId } = params;
    const dept = H.getDeptMeta(deptId);
    const app = document.getElementById('app');

    const animals = await DB.AnimalService.getByDepartment(deptId);
    const diets = await DB.DietService.getByDepartment(deptId);
    const trainings = await DB.TrainingService.getByDepartment(deptId);
    const weights = await DB.WeightService.getByDepartment(deptId);
    const enrichments = await DB.EnrichmentService.getByDepartment(deptId);
    const vet = await DB.VeterinaryService.getByDepartment(deptId);

    app.innerHTML = `
      ${UI.renderHeader(`${dept.name} — Reports`, `/dept/${deptId}`)}
      ${UI.renderBreadcrumbs([
        { label: 'Inicio', path: '/menu' },
        { label: dept.name, path: `/dept/${deptId}` },
        { label: 'Reports' },
      ])}
      <main class="main-content">
        <div class="page-header">
          <h2>📊 Reports — ${dept.name}</h2>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Total Animales</div>
            <div class="info-value" style="font-size:var(--fs-2xl);color:var(--accent-500);">${animals.length}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Registros de Dieta</div>
            <div class="info-value" style="font-size:var(--fs-2xl);color:var(--accent-500);">${diets.length}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Sesiones de Entreno</div>
            <div class="info-value" style="font-size:var(--fs-2xl);color:var(--accent-500);">${trainings.length}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Registros de Peso</div>
            <div class="info-value" style="font-size:var(--fs-2xl);color:var(--accent-500);">${weights.length}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Enriquecimientos</div>
            <div class="info-value" style="font-size:var(--fs-2xl);color:var(--accent-500);">${enrichments.length}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Registros Veterinarios</div>
            <div class="info-value" style="font-size:var(--fs-2xl);color:var(--accent-500);">${vet.length}</div>
          </div>
        </div>

        <div class="card" style="margin-top:var(--sp-6);">
          <div class="card-header"><h3>Resumen por Animal</h3></div>
          <div class="card-body">
            <div class="table-container">
              <table class="table">
                <thead><tr>
                  <th>Animal</th><th>Especie</th><th>Dietas</th><th>Entrenos</th><th>Pesos</th><th>Enriq.</th><th>Vet.</th>
                </tr></thead>
                <tbody>
                  ${await Promise.all(animals.map(async a => {
                    const ad = (await DB.DietService.getByAnimal(a.id)).length;
                    const at = (await DB.TrainingService.getByAnimal(a.id)).length;
                    const aw = (await DB.WeightService.getByAnimal(a.id)).length;
                    const ae = (await DB.EnrichmentService.getByAnimal(a.id)).length;
                    const av = (await DB.VeterinaryService.getByAnimal(a.id)).length;
                    return `<tr>
                      <td><strong>${H.escapeHtml(a.name)}</strong></td>
                      <td style="font-style:italic">${H.escapeHtml(a.species)}</td>
                      <td>${ad}</td><td>${at}</td><td>${aw}</td><td>${ae}</td><td>${av}</td>
                    </tr>`;
                  })).then(rows => rows.join(''))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style="margin-top:var(--sp-6);text-align:center;">
          <button class="btn btn-outline" onclick="App.Views.exportDeptData('${deptId}')">📥 Exportar Datos (JSON)</button>
        </div>
      </main>
    `;
  }

  // ── Export Department Data ────────────────────────────────
  async function exportDeptData(deptId) {
    try {
      const dept = H.getDeptMeta(deptId);
      const data = {
        department: dept.name,
        exported_at: new Date().toISOString(),
        animals: await DB.AnimalService.getByDepartment(deptId),
        diets: await DB.DietService.getByDepartment(deptId),
        trainings: await DB.TrainingService.getByDepartment(deptId),
        weights: await DB.WeightService.getByDepartment(deptId),
        enrichments: await DB.EnrichmentService.getByDepartment(deptId),
        veterinary: await DB.VeterinaryService.getByDepartment(deptId),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deptId}_export_${H.today()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      UI.showToast('Datos exportados correctamente', 'success');
    } catch (err) {
      UI.showToast('Error al exportar: ' + err.message, 'error');
    }
  }

  // ── Animal Card (Individual Animal) ───────────────────────
  async function renderAnimalCard(params) {
    const { animalId, tab = 'general' } = params;
    const animal = await DB.AnimalService.getById(animalId);

    if (!animal) {
      const app = document.getElementById('app');
      app.innerHTML = `
        ${UI.renderHeader('Animal no encontrado', '/menu')}
        <main class="main-content">
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <p class="empty-state-text">No se encontró el animal solicitado.</p>
            <button class="btn btn-primary" onclick="App.Router.navigate('/menu')">Volver al menú</button>
          </div>
        </main>
      `;
      return;
    }

    const dept = H.getDeptMeta(animal.department);
    const app = document.getElementById('app');

    app.innerHTML = `
      ${UI.renderHeader(animal.name, `/dept/${animal.department}/animals`)}
      ${UI.renderBreadcrumbs([
        { label: 'Inicio', path: '/menu' },
        { label: dept.name, path: `/dept/${animal.department}` },
        { label: 'Animales', path: `/dept/${animal.department}/animals` },
        { label: animal.name },
      ])}
      <main class="main-content">
        <div class="animal-profile">
          <div class="animal-profile-avatar">${H.getSpeciesEmoji(animal.species)}</div>
          <div class="animal-profile-info">
            <div class="animal-profile-name">${H.escapeHtml(animal.name)}</div>
            <div class="animal-profile-species">${H.escapeHtml(animal.species)}</div>
            <div class="animal-profile-badges">
              ${H.getSexBadge(animal.sex)}
              ${H.getStatusBadge(animal.status)}
              <span class="badge" style="background:var(--gray-100);color:var(--gray-700);">${H.escapeHtml(animal.zims_id)}</span>
            </div>
          </div>
        </div>
        <div class="tabs" role="tablist">
          ${H.TABS.map(t => `
            <button class="tab-item ${t.id === tab ? 'active' : ''}" role="tab"
              onclick="App.Router.navigate('/animal/${animalId}/${t.id}')"
              aria-selected="${t.id === tab}">
              ${t.icon} ${t.name}
            </button>
          `).join('')}
        </div>
        <div class="tab-content" id="tab-content">
          <div class="loading"><div class="loading-spinner"></div></div>
        </div>
      </main>
    `;

    // Render tab content
    await renderTabContent(animal, tab);
  }

  // ── Tab Content Renderer ──────────────────────────────────
  async function renderTabContent(animal, tab) {
    const container = document.getElementById('tab-content');
    if (!container) return;

    switch (tab) {
      case 'general':
        container.innerHTML = renderGeneralTab(animal);
        break;
      case 'diets':
        await renderRecordTab(container, animal, 'diets');
        break;
      case 'trainings':
        await renderRecordTab(container, animal, 'trainings');
        break;
      case 'weights':
        await renderWeightTab(container, animal);
        break;
      case 'enrichments':
        await renderRecordTab(container, animal, 'enrichments');
        break;
      case 'veterinary':
        await renderRecordTab(container, animal, 'veterinary');
        break;
      default:
        container.innerHTML = renderGeneralTab(animal);
    }
  }

  // ── General Tab ───────────────────────────────────────────
  function renderGeneralTab(animal) {
    return `
      <div class="card">
        <div class="card-header">
          <h3>📋 Datos Generales</h3>
          <div class="btn-group">
            <button class="btn btn-outline btn-sm" onclick="App.Views.openAnimalForm('${animal.department}', '${animal.id}')">✏️ Editar</button>
            <button class="btn btn-danger btn-sm" onclick="App.Views.deleteAnimal('${animal.id}')">🗑️ Eliminar Animal</button>
          </div>
        </div>
        <div class="card-body">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Nombre</div>
              <div class="info-value">${H.escapeHtml(animal.name)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Especie</div>
              <div class="info-value">${H.escapeHtml(animal.species)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Sexo</div>
              <div class="info-value">${H.getSexBadge(animal.sex)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Fecha de Nacimiento</div>
              <div class="info-value">${H.formatDate(animal.birth_date)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">ZIMS ID</div>
              <div class="info-value" style="font-family:monospace;">${H.escapeHtml(animal.zims_id)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Microchip</div>
              <div class="info-value" style="font-family:monospace;">${H.escapeHtml(animal.microchip || '—')}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Estado</div>
              <div class="info-value">${H.getStatusBadge(animal.status)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Ubicación</div>
              <div class="info-value">${H.escapeHtml(animal.location || '—')}</div>
            </div>
          </div>
          ${animal.observations ? `
          <div style="margin-top:var(--sp-5);">
            <div class="info-label" style="margin-bottom:var(--sp-2);">Observaciones</div>
            <p style="color:var(--gray-700);line-height:1.6;">${H.escapeHtml(animal.observations)}</p>
          </div>` : ''}
        </div>
      </div>
    `;
  }

  // ── Record Tab (Generic for diets, trainings, enrichments, veterinary) ──
  async function renderRecordTab(container, animal, type) {
    const service = DB.getService(type);
    const records = await service.getByAnimal(animal.id);
    const columns = H.TABLE_COLUMNS[type];
    const section = H.getSectionMeta(type);

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>${section.icon} ${section.name}</h3>
          <button class="btn btn-primary btn-sm" onclick="App.Views.openRecordForm('${type}', '${animal.id}')">+ Nuevo Registro</button>
        </div>
        <div class="card-body">
          ${UI.renderTable(records, columns, { type, animalId: animal.id })}
        </div>
      </div>
    `;
  }

  // ── Weight Tab (with Chart) ───────────────────────────────
  async function renderWeightTab(container, animal) {
    const weights = await DB.WeightService.getByAnimal(animal.id);
    const columns = H.TABLE_COLUMNS.weights;

    // Sort weights chronologically for chart
    const sortedWeights = [...weights].sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = `
      <div class="card" style="margin-bottom:var(--sp-6);">
        <div class="card-header">
          <h3>📈 Evolución de Peso</h3>
          <button class="btn btn-primary btn-sm" onclick="App.Views.openRecordForm('weights', '${animal.id}')">+ Nuevo Peso</button>
        </div>
        <div class="card-body">
          ${sortedWeights.length > 1 ?
            '<div class="chart-container"><canvas id="weight-chart"></canvas></div>' :
            '<p class="text-muted text-center" style="padding:var(--sp-8);">Se necesitan al menos 2 registros para mostrar el gráfico.</p>'
          }
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>⚖️ Historial de Pesos</h3>
        </div>
        <div class="card-body">
          ${UI.renderTable(weights, columns, { type: 'weights', animalId: animal.id })}
        </div>
      </div>
    `;

    // Render chart if enough data
    if (sortedWeights.length > 1) {
      renderWeightChart(sortedWeights, animal.name);
    }
  }

  // ── Weight Chart (Chart.js) ───────────────────────────────
  function renderWeightChart(weights, animalName) {
    const ctx = document.getElementById('weight-chart');
    if (!ctx) return;

    // Destroy previous chart
    if (weightChart) {
      weightChart.destroy();
      weightChart = null;
    }

    const labels = weights.map(w => H.formatDate(w.date));
    const data = weights.map(w => w.weight_kg);

    weightChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `Peso de ${animalName} (kg)`,
          data,
          borderColor: '#00b4d8',
          backgroundColor: 'rgba(0, 180, 216, 0.1)',
          borderWidth: 2.5,
          pointBackgroundColor: '#00b4d8',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.3,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { family: 'Inter', size: 13 },
              usePointStyle: true,
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: '#0a2647',
            titleFont: { family: 'Inter' },
            bodyFont: { family: 'Inter' },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y} kg`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 11 } },
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              font: { family: 'Inter', size: 11 },
              callback: (v) => v + ' kg',
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      },
    });
  }

  // ── Open Record Form (CRUD) ───────────────────────────────
  async function openRecordForm(type, animalId, recordId = null) {
    const fields = H.FORM_FIELDS[type];
    if (!fields) return;

    const isEdit = !!recordId;
    const section = H.getSectionMeta(type);
    let existingData = {};

    if (isEdit) {
      const service = DB.getService(type);
      existingData = await service.getById(recordId) || {};
    } else {
      // Set default date to today
      existingData = { date: H.today() };
    }

    const title = isEdit ? `Editar ${section.name}` : `Nuevo Registro — ${section.name}`;
    const formHtml = UI.buildFormHtml(fields, existingData);

    UI.showModal({
      title,
      contentHtml: formHtml,
      saveLabel: isEdit ? 'Actualizar' : 'Guardar',
      onSave: async () => {
        const data = UI.getFormData(fields);
        if (!data) return; // Validation failed

        try {
          const service = DB.getService(type);
          if (isEdit) {
            await service.update({ ...existingData, ...data });
            UI.showToast('Registro actualizado correctamente', 'success');
          } else {
            data.animal_id = animalId;
            await service.create(data);
            UI.showToast('Registro creado correctamente', 'success');
          }
          UI.closeModal();

          // Refresh current view
          App.Router.resolve();
        } catch (err) {
          UI.showToast('Error: ' + err.message, 'error');
        }
      },
    });
  }

  // ── Delete Record ─────────────────────────────────────────
  async function deleteRecord(type, recordId) {
    const section = H.getSectionMeta(type);
    UI.showConfirm(
      `¿Estás seguro de eliminar este registro de ${section.name}? Esta acción no se puede deshacer.`,
      async () => {
        try {
          const service = DB.getService(type);
          await service.remove(recordId);
          UI.showToast('Registro eliminado', 'success');
          App.Router.resolve(); // Refresh
        } catch (err) {
          UI.showToast('Error al eliminar: ' + err.message, 'error');
        }
      },
      `Eliminar ${section.name}`
    );
  }

  // ── Open Animal Form (Create/Edit) ────────────────────────
  async function openAnimalForm(deptId, animalId = null) {
    const fields = H.FORM_FIELDS.animals;
    const isEdit = !!animalId;
    let existingData = {};

    if (isEdit) {
      existingData = await DB.AnimalService.getById(animalId) || {};
    } else {
      existingData = { status: 'Activo', department: deptId };
    }

    const title = isEdit ? `Editar Animal — ${existingData.name || ''}` : 'Nuevo Animal';
    const formHtml = UI.buildFormHtml(fields, existingData);

    UI.showModal({
      title,
      contentHtml: formHtml,
      saveLabel: isEdit ? 'Actualizar' : 'Crear Animal',
      onSave: async () => {
        const data = UI.getFormData(fields);
        if (!data) return;

        try {
          if (isEdit) {
            await DB.AnimalService.update({ ...existingData, ...data });
            UI.showToast('Animal actualizado correctamente', 'success');
          } else {
            data.department = deptId;
            if (!data.status) data.status = 'Activo';
            await DB.AnimalService.create(data);
            UI.showToast('Animal creado correctamente', 'success');
          }
          UI.closeModal();
          App.Router.resolve();
        } catch (err) {
          UI.showToast('Error: ' + err.message, 'error');
        }
      },
    });
  }

  // ── Delete Animal ─────────────────────────────────────────
  async function deleteAnimal(animalId) {
    const animal = await DB.AnimalService.getById(animalId);
    if (!animal) return;

    UI.showConfirm(
      `¿Eliminar a "${animal.name}" y todos sus registros asociados? Esta acción no se puede deshacer.`,
      async () => {
        try {
          // Delete all associated records
          const types = ['diets', 'trainings', 'weights', 'enrichments', 'veterinary'];
          for (const type of types) {
            const service = DB.getService(type);
            const records = await service.getByAnimal(animalId);
            for (const record of records) {
              await service.remove(record.id);
            }
          }
          // Delete animal
          await DB.AnimalService.remove(animalId);
          UI.showToast(`"${animal.name}" eliminado correctamente`, 'success');
          App.Router.navigate(`/dept/${animal.department}/animals`);
        } catch (err) {
          UI.showToast('Error: ' + err.message, 'error');
        }
      },
      'Eliminar Animal'
    );
  }

  // ── Open Record Form from Department Section (with animal selector) ──
  async function openDeptRecordForm(type, deptId) {
    const animals = await DB.AnimalService.getByDepartment(deptId);
    if (animals.length === 0) {
      UI.showToast('No hay animales en este departamento. Crea un animal primero.', 'info');
      return;
    }

    const fields = H.FORM_FIELDS[type];
    if (!fields) return;

    const section = H.getSectionMeta(type);
    const defaultData = { date: H.today() };

    // Build animal selector HTML
    const animalSelectHtml = `
      <div class="form-group">
        <label class="form-label" for="field-animal_id">Animal *</label>
        <select class="form-select" id="field-animal_id" name="animal_id" required>
          <option value="">Seleccionar animal...</option>
          ${animals.map(a => `<option value="${a.id}">${H.escapeHtml(a.name)} — ${H.escapeHtml(a.species)}</option>`).join('')}
        </select>
        <div class="form-error" id="error-animal_id"></div>
      </div>
    `;

    // Get the standard form and inject animal selector at the beginning
    const formHtml = UI.buildFormHtml(fields, defaultData);
    const modifiedFormHtml = formHtml.replace(
      '<form id="record-form" novalidate>',
      '<form id="record-form" novalidate>' + animalSelectHtml
    );

    UI.showModal({
      title: `Nuevo Registro — ${section.name}`,
      contentHtml: modifiedFormHtml,
      saveLabel: 'Guardar',
      onSave: async () => {
        // Validate animal selection
        const animalSelect = document.getElementById('field-animal_id');
        const animalId = animalSelect ? animalSelect.value : '';
        const errorEl = document.getElementById('error-animal_id');

        if (!animalId) {
          if (errorEl) errorEl.textContent = 'Selecciona un animal.';
          if (animalSelect) animalSelect.style.borderColor = 'var(--danger-500)';
          return;
        }
        if (errorEl) errorEl.textContent = '';
        if (animalSelect) animalSelect.style.borderColor = '';

        // Get rest of form data
        const data = UI.getFormData(fields);
        if (!data) return;

        try {
          data.animal_id = animalId;
          const service = DB.getService(type);
          await service.create(data);
          UI.showToast('Registro creado correctamente', 'success');
          UI.closeModal();
          App.Router.resolve(); // Refresh the table
        } catch (err) {
          UI.showToast('Error: ' + err.message, 'error');
        }
      },
    });
  }

  return {
    renderSplash,
    renderMenu,
    renderDepartment,
    renderAnimalList,
    renderDeptSection,
    renderReports,
    renderAnimalCard,
    renderTabContent,
    renderWeightChart,
    openRecordForm,
    deleteRecord,
    openAnimalForm,
    deleteAnimal,
    exportDeptData,
    openDeptRecordForm,
  };
})();

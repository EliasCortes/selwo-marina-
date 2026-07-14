import imgAves from '../assets/Fondoaves.jpg';
import imgLeones from '../assets/FondoleonesM.jpg';
import imgAmazonia from '../assets/Fondoamazonia.jpg';
import imgPingo from '../assets/Fondopingu.jpg';
import imgLogo from '../assets/Logo_Selwo_Marina_Header_PNG.jpg';

/* ============================================================
   VIEWS - Page Views for Control Animal Selwo v2
   ============================================================ */
window.App = window.App || {};

App.Views = (() => {
  'use strict';

  const H = App.Helpers;
  const UI = App.UI;
  const DB = App.DB;

  // ── Chart instance references ──────────────────────────────
  let weightChart = null;
  let dietChart = null;
  let leonesDietChart = null;

  // ── Departamentos con módulo de dieta personalizado ────────
  const DEPTS_WITH_CUSTOM_DIET = ['leones'];

  // ── Fish types for detailed diet breakdown ─────────────────
  const FISH_TYPES = [
    { key: 'arenque_peq', label: 'Arenque pequeño', color: '#00b4d8', emoji: '🐟' },
    { key: 'arenque_gde', label: 'Arenque grande', color: '#0077b6', emoji: '🐟' },
    { key: 'sprat', label: 'Sprat', color: '#90e0ef', emoji: '🐠' },
    { key: 'capelin', label: 'Capelin', color: '#f59e0b', emoji: '🐠' },
    { key: 'caballa', label: 'Caballa', color: '#ef4444', emoji: '🐡' },
    { key: 'bacaladilla', label: 'Bacaladilla', color: '#8b5cf6', emoji: '🐟' },
  ];

  // Modern SVG Icons for Department Sections (Lucide-based)
  const SECTION_SVGS = {
    animals: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-card-svg">
      <path d="M16 16c0-1.5-1-3-2.5-3s-2.5 1.5-2.5 3c0 2 1.5 3 2.5 3s2.5-1 2.5-3Z" />
      <path d="M8 12c0-1.5-1-3-2.5-3S3 10.5 3 12c0 2 1.5 3 2.5 3s8 14 8 12Z" />
      <path d="M12 7c0-1.1-.9-2-2-2s-2 .9-2 2c0 1.5 1.5 2.5 2 2.5s2-1 2-2.5Z" />
      <path d="M16 7c0-1.1-.9-2-2-2s-2 .9-2 2c0 1.5 1.5 2.5 2 2.5s2-1 2-2.5Z" />
      <path d="M21 12c0-1.5-1-3-2.5-3S16 10.5 16 12c0 2 1.5 3 2.5 3s2.5-1 2.5-3Z" />
    </svg>`,
    diets: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-card-svg">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
    </svg>`,
    trainings: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-card-svg">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>`,
    weights: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-card-svg">
      <path d="m16 16 3-8 3 8c-.1.3-.3.5-.6.5h-4.8c-.3 0-.5-.2-.6-.5Z"/>
      <path d="m2 16 3-8 3 8c-.1.3-.3.5-.6.5H2.6c-.3 0-.5-.2-.6-.5Z"/>
      <path d="M7 21h10"/>
      <path d="M12 3v18"/>
      <path d="M3 7h18"/>
    </svg>`,
    enrichments: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-card-svg">
      <path d="M12 22h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3a2 2 0 0 1-4 0H7a2 2 0 0 0-2 2v3a2 2 0 0 1 0 4v6a2 2 0 0 0 2 2h3" />
      <path d="M12 10a2 2 0 0 0-2 2v3a2 2 0 0 0 4 0v-3a2 2 0 0 0-2-2Z" />
    </svg>`,
    veterinary: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-card-svg">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.3.3 0 1 0 .2.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>`,
    reports: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-card-svg">
      <path d="M3 3v18h18"/>
      <path d="M18 17V9"/>
      <path d="M13 17V5"/>
      <path d="M8 17v-3"/>
    </svg>`
  };

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
          <img src="${imgLogo}" alt="Selwo Marina" class="splash-logo">
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

    // Cargar dinámicamente el servicio de animales de Supabase
    const { getAnimalsCount } = await import('../src/services/animalService.js?v=8');

    // Get animal counts per department from Supabase
    const counts = {};
    for (const dept of H.DEPARTMENTS) {
      try {
        counts[dept.id] = await getAnimalsCount(dept.id);
      } catch (err) {
        console.error(`Error al contar animales del departamento ${dept.id}:`, err);
        counts[dept.id] = 0;
      }
    }

    // Generate alerts
    await App.Alerts.generateAlerts();
    const alertsSummary = await App.Alerts.renderAlertsSummary();

    // Favorites count
    let favCount = 0;
    try { const favs = await DB.FavoriteService.getAll(); favCount = favs.length; } catch { /* ignore */ }

    // Map department IDs to backgrounds
    const deptImages = {
      aves: imgAves,
      leones: imgLeones,
      amazonia: imgAmazonia,
      pinguinario: imgPingo
    };

    app.innerHTML = `
      <div class="menu-page">
        <div class="menu-header">
          <img src="${imgLogo}" alt="Selwo Marina" class="menu-logo">
          <h1 class="menu-title">Control Animal Selwo</h1>
          <p class="menu-subtitle">Selecciona un departamento</p>
        </div>

        <div class="menu-grid">
          ${H.DEPARTMENTS.map(dept => {
      const imgUrl = deptImages[dept.id] || imgAves;
      return `
              <div class="dept-card dept-card--${dept.cssClass}" onclick="App.Router.navigate('/dept/${dept.id}')" role="button" tabindex="0" aria-label="${dept.name}">
                <div class="dept-card-bg" style="background-image: url('${imgUrl}');"></div>
                <div class="dept-card-overlay"></div>
                <div class="dept-card-content">
                  <span class="dept-card-name">${dept.name}</span>
                  <span class="dept-card-count">${counts[dept.id] || 0} animales</span>
                </div>
              </div>
            `;
    }).join('')}
        </div>

        <div class="menu-extras">
          <button class="menu-extra-btn menu-fav-btn" onclick="App.Router.navigate('/favorites')">
            <span class="menu-extra-icon">⭐</span>
            <span class="menu-extra-label">Favoritos</span>
            ${favCount > 0 ? `<span class="menu-extra-count">${favCount}</span>` : ''}
          </button>
        </div>

        ${alertsSummary}
      </div>
    `;

    // Add keyboard support
    document.querySelectorAll('.dept-card').forEach(card => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
      });
    });
  }

  // ── Favorites View ────────────────────────────────────────
  async function renderFavorites() {
    const app = document.getElementById('app');

    const favs = await DB.FavoriteService.getAll();
    const animals = [];
    for (const fav of favs) {
      const animal = await DB.AnimalService.getById(fav.animal_id);
      if (animal) animals.push(animal);
    }

    app.innerHTML = `
      ${UI.renderHeader('⭐ Favoritos', '/menu')}
      ${UI.renderBreadcrumbs([
      { label: 'Inicio', path: '/menu' },
      { label: 'Favoritos' },
    ])}
      <main class="main-content">
        <div class="page-header">
          <h2>⭐ Animales Favoritos</h2>
        </div>
        <div class="animal-grid" id="animal-grid">
          ${animals.length > 0 ? await renderAnimalCards(animals) : `
            <div class="empty-state" style="grid-column: 1/-1;">
              <div class="empty-state-icon">⭐</div>
              <p class="empty-state-text">No tienes animales favoritos aún.<br>Marca un animal como favorito desde su ficha.</p>
              <button class="btn btn-primary" onclick="App.Router.navigate('/menu')">Volver al menú</button>
            </div>
          `}
        </div>
      </main>
    `;

    UI.initHeaderInteractions();
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
          ${H.SECTIONS.map(section => {
      const iconHtml = SECTION_SVGS[section.id] || section.icon;
      return `
              <div class="section-card" onclick="App.Router.navigate('/dept/${deptId}/${section.id}')" role="button" tabindex="0">
                <span class="section-card-icon">${iconHtml}</span>
                <span class="section-card-name">${section.name}</span>
              </div>
            `;
    }).join('')}
        </div>
      </main>
    `;

    UI.initHeaderInteractions();
  }

  // ── Animal List ───────────────────────────────────────────
  async function renderAnimalList(params) {
    const { deptId } = params;
    const dept = H.getDeptMeta(deptId);
    const app = document.getElementById('app');

    // Cargar dinámicamente el servicio de animales de Supabase
    const { getAnimals } = await import('../src/services/animalService.js?v=8');

    // Obtener los animales reales de Supabase
    let dbAnimals = [];
    try {
      const result = await getAnimals({ departamentoId: deptId });
      dbAnimals = result.data || [];
    } catch (err) {
      console.error('Error al obtener animales de Supabase:', err);
      UI.showToast('Error al conectar con Supabase: ' + err.message, 'error');
    }

    // Mapear de Supabase al modelo que espera la interfaz actual
    const mapAnimal = (a) => ({
      id: a.id,
      name: a.nombre,
      species: a.especie,
      sex: a.sexo || 'Desconocido',
      status: a.estado || 'Activo',
      zims_id: a.zims_id || '',
      foto_url: a.foto_url
    });

    const animals = dbAnimals.map(mapAnimal);
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
      placeholder: 'Buscar por nombre o especie...',
      filterOptions: species,
    })}
        <div class="animal-grid" id="animal-grid">
          ${await renderAnimalCards(animals)}
        </div>
      </main>
    `;

    UI.initHeaderInteractions();

    // Wire up search and filter
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('filter-select');

    const filterAnimals = H.debounce(async () => {
      const query = searchInput.value.trim();
      const speciesFilter = filterSelect.value;

      try {
        const { data } = await getAnimals({ departamentoId: deptId, especie: speciesFilter, search: query });
        const mapped = (data || []).map(mapAnimal);
        document.getElementById('animal-grid').innerHTML = await renderAnimalCards(mapped);
      } catch (err) {
        UI.showToast('Error al filtrar: ' + err.message, 'error');
      }
    }, 200);

    searchInput.addEventListener('input', filterAnimals);
    filterSelect.addEventListener('change', filterAnimals);
  }

  async function renderAnimalCards(animals) {
    if (animals.length === 0) {
      return `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-state-icon">🔍</div>
          <p class="empty-state-text">No se encontraron animales.</p>
        </div>
      `;
    }

    const cards = [];
    for (const animal of animals) {
      const photoUrl = animal.foto_url || await App.Photos.getPhotoUrl(animal.id, animal.species);
      const isFav = await DB.FavoriteService.isFavorite(animal.id);

      cards.push(`
        <div class="animal-card" onclick="App.Router.navigate('/animal/${animal.id}/general')" role="button" tabindex="0">
          <div class="animal-avatar">
            <img src="${photoUrl}" alt="${H.escapeHtml(animal.name)}" loading="lazy" style="object-fit: cover; object-position: center 20%;">
          </div>
          <div class="animal-info">
            <div class="animal-name">${H.escapeHtml(animal.name)} ${isFav ? '<span class="fav-star active">★</span>' : ''}</div>
            <div class="animal-species">${H.escapeHtml(animal.species)}</div>
            <div class="animal-meta">
              ${H.getSexBadge(animal.sex)}
              ${H.getStatusBadge(animal.status)}
              <span class="animal-zims">${H.escapeHtml(animal.zims_id)}</span>
            </div>
          </div>
        </div>
      `);
    }
    return cards.join('');
  }

  // ── Department Section View ───────────────────────────────
  async function renderDeptSection(params) {
    const { deptId, sectionId } = params;
    const dept = H.getDeptMeta(deptId);
    const section = H.getSectionMeta(sectionId);

    if (sectionId === 'animals') { return renderAnimalList(params); }
    if (sectionId === 'reports') { return renderReports(params); }

    const app = document.getElementById('app');
    let records;
    let animalMap = {};
    const columns = H.TABLE_COLUMNS[sectionId] || [];

    // ── Dietas: leer directamente de Supabase ─────────────
    if (sectionId === 'diets') {
      const { getAllDietRecords, getAnimals } = await import('../src/services/animalService.js?v=8');
      try {
        records = await getAllDietRecords(deptId);
        const { data: supaAnimals } = await getAnimals({ departamentoId: deptId });
        (supaAnimals || []).forEach(a => { animalMap[a.id] = a.nombre; });
      } catch (err) {
        console.error('Error cargando dietas de Supabase:', err);
        records = [];
      }
    } else {
      // ── Otros módulos: siguen usando IndexedDB hasta su migración ──
      const animals = await DB.AnimalService.getByDepartment(deptId);
      animals.forEach(a => { animalMap[a.id] = a.name; });

      const service = DB.getService(sectionId);
      records = service ? await service.getByDepartment(deptId) : [];
    }

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
            ${UI.renderTable(records, columns, { type: sectionId, showAnimalName: true, animalMap, deptId })}
          </div>
        </div>
      </main>
    `;

    UI.initHeaderInteractions();
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
          <div class="info-item"><div class="info-label">Total Animales</div><div class="info-value" style="font-size:var(--fs-2xl);color:var(--accent-500);">${animals.length}</div></div>
          <div class="info-item"><div class="info-label">Registros de Dieta</div><div class="info-value" style="font-size:var(--fs-2xl);color:var(--accent-500);">${diets.length}</div></div>
          <div class="info-item"><div class="info-label">Sesiones de Entreno</div><div class="info-value" style="font-size:var(--fs-2xl);color:var(--accent-500);">${trainings.length}</div></div>
          <div class="info-item"><div class="info-label">Registros de Peso</div><div class="info-value" style="font-size:var(--fs-2xl);color:var(--accent-500);">${weights.length}</div></div>
          <div class="info-item"><div class="info-label">Enriquecimientos</div><div class="info-value" style="font-size:var(--fs-2xl);color:var(--accent-500);">${enrichments.length}</div></div>
          <div class="info-item"><div class="info-label">Registros Veterinarios</div><div class="info-value" style="font-size:var(--fs-2xl);color:var(--accent-500);">${vet.length}</div></div>
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

    UI.initHeaderInteractions();
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

  // ── Animal Card ───────────────────────────────────────────
  async function renderAnimalCard(params) {
    const { animalId, tab = 'general' } = params;

    // Cargar dinámicamente el servicio de animales de Supabase
    const { getAnimalById } = await import('../src/services/animalService.js?v=8');

    let dbAnimal = null;
    let errorMsg = '';
    try {
      dbAnimal = await getAnimalById(animalId);
    } catch (err) {
      console.error('Error al obtener animal de Supabase:', err);
      errorMsg = err.message || JSON.stringify(err);
    }

    if (!dbAnimal) {
      const app = document.getElementById('app');
      app.innerHTML = `
        ${UI.renderHeader('Animal no encontrado', '/menu')}
        <main class="main-content">
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <p class="empty-state-text">No se encontró el animal solicitado.</p>
            ${errorMsg ? `<p class="error-msg" style="color:var(--danger-500);margin-top:1rem;font-family:monospace;">Error: ${H.escapeHtml(errorMsg)}</p>` : ''}
            <button class="btn btn-primary" onclick="App.Router.navigate('/menu')">Volver al menú</button>
          </div>
        </main>
      `;
      return;
    }

    // Mapear de Supabase al formato que espera la interfaz actual
    const animal = {
      id: dbAnimal.id,
      name: dbAnimal.nombre,
      species: dbAnimal.especie,
      sex: dbAnimal.sexo || 'Desconocido',
      status: dbAnimal.estado || 'Activo',
      zims_id: dbAnimal.zims_id || '',
      birth_date: dbAnimal.fecha_nacimiento,
      microchip: dbAnimal.microchip || '—',
      location: dbAnimal.ubicacion || 'Selwo Marina',
      observations: dbAnimal.observaciones || '',
      department: dbAnimal.departamento_id || 'aves',
      foto_url: dbAnimal.foto_url
    };

    const dept = H.getDeptMeta(animal.department);
    const app = document.getElementById('app');
    const photoUrl = animal.foto_url || await App.Photos.getPhotoUrl(animalId, animal.species);
    const isFav = await DB.FavoriteService.isFavorite(animalId);

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
          <div class="animal-profile-avatar" onclick="App.Views.previewPhoto('${photoUrl}')" title="Ver foto">
            <img src="${photoUrl}" alt="${H.escapeHtml(animal.name)}" style="object-fit: cover; object-position: center 20%;">
            <div class="photo-overlay">🔍</div>
          </div>
          <div class="animal-profile-info">
            <div class="animal-profile-name">
              ${H.escapeHtml(animal.name)}
              <button class="fav-btn ${isFav ? 'active' : ''}" onclick="App.Views.toggleFavorite('${animalId}')" title="${isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
                ${isFav ? '★' : '☆'}
              </button>
            </div>
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

    UI.initHeaderInteractions();
    await renderTabContent(animal, tab);
  }

  // ── Toggle Favorite ───────────────────────────────────────
  async function toggleFavorite(animalId) {
    try {
      const isFav = await DB.FavoriteService.toggle(animalId);
      UI.showToast(isFav ? 'Añadido a favoritos ⭐' : 'Eliminado de favoritos', 'success');
      App.Router.resolve();
    } catch (err) {
      UI.showToast('Error: ' + err.message, 'error');
    }
  }

  // ── Tab Content Renderer ──────────────────────────────────
  async function renderTabContent(animal, tab) {
    const container = document.getElementById('tab-content');
    if (!container) return;

    switch (tab) {
      case 'general': container.innerHTML = renderGeneralTab(animal); break;
      case 'diets':
        if (animal.department === 'leones') {
          await renderLeonesDietTab(container, animal);
        } else {
          await renderDietTab(container, animal);
        }
        break;
      case 'trainings': await renderRecordTab(container, animal, 'trainings'); break;
      case 'weights': await renderWeightTab(container, animal); break;
      case 'enrichments': await renderRecordTab(container, animal, 'enrichments'); break;
      case 'veterinary': await renderVetTab(container, animal); break;
      default: container.innerHTML = renderGeneralTab(animal);
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
            <div class="info-item"><div class="info-label">Nombre</div><div class="info-value">${H.escapeHtml(animal.name)}</div></div>
            <div class="info-item"><div class="info-label">Especie</div><div class="info-value">${H.escapeHtml(animal.species)}</div></div>
            <div class="info-item"><div class="info-label">Sexo</div><div class="info-value">${H.getSexBadge(animal.sex)}</div></div>
            <div class="info-item"><div class="info-label">Fecha de Nacimiento</div><div class="info-value">${animal.birth_date ? H.escapeHtml(animal.birth_date) : '—'}</div></div>
            <div class="info-item"><div class="info-label">ZIMS ID</div><div class="info-value" style="font-family:monospace;">${H.escapeHtml(animal.zims_id)}</div></div>
            <div class="info-item"><div class="info-label">Microchip</div><div class="info-value" style="font-family:monospace;">${H.escapeHtml(animal.microchip || '—')}</div></div>
            <div class="info-item"><div class="info-label">Estado</div><div class="info-value">${H.getStatusBadge(animal.status)}</div></div>
            <div class="info-item"><div class="info-label">Ubicación</div><div class="info-value">${H.escapeHtml(animal.location || '—')}</div></div>
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

  // ── Record Tab (Generic) ──────────────────────────────────
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

  // ═══════════════════════════════════════════════════════════════
  //  LEONES MARINOS — Módulo de Dietas Estilo Excel
  // ═══════════════════════════════════════════════════════════════

  const LEONES_DIET_COLS = [
    { key: 'arenque_grande', label: 'A.Grande', title: 'Arenque Grande' },
    { key: 'capelin', label: 'Capelín', title: 'Capelín' },
    { key: 'arenque_pequeno', label: 'A.pequeño', title: 'Arenque Pequeño' },
    { key: 'sprat', label: 'Sprat', title: 'Sprat' },
    { key: 'caballa', label: 'Caballa', title: 'Caballa' },
    { key: 'bacaladilla', label: 'Bacaladilla', title: 'Bacaladilla' },
  ];

  async function renderLeonesDietTab(container, animal) {
    const {
      getDietRecords, getLatestDietRecord, getDietRecordsByDateRange, createDietRecord
    } = await import('../src/services/animalService.js?v=8');

    const records = await getDietRecords(animal.id, 100);
    const latest = records.length > 0 ? records[0] : null;

    let calculatedTotal = 0;
    if (latest) {
      LEONES_DIET_COLS.forEach(c => {
        calculatedTotal += parseFloat(latest[c.key]) || 0;
      });
      if (latest.alimento) {
        try {
          const extras = JSON.parse(latest.alimento);
          extras.forEach(e => {
            calculatedTotal += parseFloat(e.kg) || 0;
          });
        } catch (e) {
          calculatedTotal += parseFloat(latest.cantidad_gramos || 0);
        }
      }
    }

    // ── Tarjeta Resumen ───────────────────────────────────
    const summaryHtml = latest ? `
      <div class="card leo-diet-summary">
        <div class="leo-diet-summary-header">
          <h3>🐟 Dieta Actual</h3>
          <span class="leo-diet-summary-date">Última actualización: ${H.formatDate(latest.fecha)}</span>
        </div>
        <div class="leo-diet-summary-grid">
          <div class="leo-diet-summary-total">
            <span class="leo-diet-summary-total-value">${parseFloat(calculatedTotal.toFixed(2))} kg</span>
            <span class="leo-diet-summary-total-label">Dieta Total</span>
          </div>
          ${LEONES_DIET_COLS.map(c => `
            <div class="leo-diet-summary-item">
              <span class="leo-diet-summary-item-value">${parseFloat(parseFloat(latest[c.key] || 0).toFixed(2))}kg</span>
              <span class="leo-diet-summary-item-label" title="${c.title}">${c.label}</span>
            </div>
          `).join('')}
          <div class="leo-diet-summary-item">
            <span class="leo-diet-summary-item-value">${latest.vitaminas || '—'}</span>
            <span class="leo-diet-summary-item-label">Vits</span>
          </div>
        </div>
      </div>
    ` : `
      <div class="card leo-diet-summary leo-diet-summary--empty">
        <div class="empty-state" style="padding:var(--sp-8);">
          <div class="empty-state-icon">🐟</div>
          <p class="empty-state-text">No hay dietas registradas para este animal.</p>
        </div>
      </div>
    `;

    // ── Botones de Acción ────────────────────────────────
    const actionsHtml = `
      <div class="leo-diet-actions">
        <button class="btn btn-primary" onclick="App.Views.openLeonesDietForm('${animal.id}', '${animal.department}')">
          + Registrar Dieta del Día
        </button>
        ${latest ? `
          <button class="btn btn-outline" onclick="App.Views.openLeonesDietForm('${animal.id}', '${animal.department}', null, true)">
            📋 Copiar Dieta Anterior
          </button>
        ` : ''}
      </div>
    `;

    // ── Tabla Estilo Excel ───────────────────────────────
    let tableHtml = '';
    if (records.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      tableHtml = `
        <div class="card" style="margin-top:var(--sp-4);">
          <div class="card-header">
            <h3>📋 Historial de Dietas</h3>
          </div>
          <div class="card-body" style="padding:0;">
            <div class="leo-diet-table-wrap">
              <table class="leo-diet-table">
                <thead>
                  <tr>
                    <th class="leo-dt-fecha">Fecha</th>
                    <th class="leo-dt-total">Total</th>
                    ${LEONES_DIET_COLS.map(c => `<th title="${c.title}">${c.label}</th>`).join('')}
                    <th>Vits</th>
                    <th class="leo-dt-obs">Observaciones</th>
                    <th class="leo-dt-actions">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${records.map((r, i) => {
        const prevR = records[i + 1];
        const isToday = r.fecha === todayStr;
        
        const getFishVal = (rec, key) => {
          if (!rec) return 0;
          let val = rec[key];
          if (val === undefined && rec.base) {
            try {
              const baseParsed = typeof rec.base === 'string' ? JSON.parse(rec.base) : rec.base;
              val = baseParsed[key];
            } catch(e) {}
          }
          return parseFloat(val) || 0;
        };

        let extrasHtml = '';
        if (r.alimento) {
          try {
            const extras = JSON.parse(r.alimento);
            extrasHtml = extras.map(e => {
              let arrow = '';
              if (prevR && prevR.alimento) {
                try {
                  const prevExtras = JSON.parse(prevR.alimento);
                  const prevE = prevExtras.find(pe => pe.name === e.name);
                  const currKg = parseFloat(e.kg) || 0;
                  const prevKg = prevE ? (parseFloat(prevE.kg) || 0) : 0;
                  if (currKg > prevKg) arrow = ' <span class="text-green-500" style="color: var(--success-500, #22c55e); font-size: 0.85em;">▲</span>';
                  else if (currKg < prevKg) arrow = ' <span class="text-red-500" style="color: var(--danger-500, #ef4444); font-size: 0.85em;">▼</span>';
                } catch(err){}
              } else if (prevR && !prevR.alimento) {
                arrow = ' <span class="text-green-500" style="color: var(--success-500, #22c55e); font-size: 0.85em;">▲</span>';
              }
              return `<b>${H.escapeHtml(e.name)}</b> (${parseFloat(parseFloat(e.kg).toFixed(2))}kg${arrow})`;
            }).join('<br>');
          } catch (e) {
            extrasHtml = `<b>${H.escapeHtml(r.alimento)}</b> (${parseFloat(parseFloat(r.cantidad_gramos || 0).toFixed(2))}kg)`;
          }
          if (extrasHtml) extrasHtml += '<br>';
        }

        return `
                      <tr class="${isToday ? 'leo-dt-today' : ''}">
                        <td class="leo-dt-fecha">
                          <button class="session-toggle-btn" onclick="this.classList.toggle('expanded'); this.closest('tr').nextElementSibling.style.display = this.classList.contains('expanded') ? 'table-row' : 'none';" title="Ver desglose">▶</button>
                          ${H.formatDate(r.fecha)}
                        </td>
                        <td class="leo-dt-total"><strong>${parseFloat(parseFloat(r.dieta_total || 0).toFixed(2))}</strong></td>
                        ${LEONES_DIET_COLS.map(c => {
                          const currVal = getFishVal(r, c.key);
                          const prevVal = prevR ? getFishVal(prevR, c.key) : currVal;
                          let arrow = '';
                          if (prevR) {
                            if (currVal > prevVal) arrow = ' <span class="text-green-500" style="color: var(--success-500, #22c55e); font-size: 0.85em;">▲</span>';
                            else if (currVal < prevVal) arrow = ' <span class="text-red-500" style="color: var(--danger-500, #ef4444); font-size: 0.85em;">▼</span>';
                          }
                          return `<td>${parseFloat(currVal.toFixed(2))}${arrow}</td>`;
                        }).join('')}
                        <td>${r.vitaminas || '—'}</td>
                        <td class="leo-dt-obs">${extrasHtml}${H.escapeHtml(r.observaciones || '')}</td>
                        <td class="actions-cell">
                          <button class="btn btn-ghost btn-icon" onclick="App.Views.openLeonesDietForm('${animal.id}', '${animal.department}', '${r.id}')" title="Editar">✏️</button>
                          <button class="btn btn-ghost btn-icon" onclick="App.Views.deleteRecord('diets', '${r.id}')" title="Eliminar">🗑️</button>
                        </td>
                      </tr>
                      <tr class="leo-dt-session-breakdown" style="display:none;">
                        <td colspan="10">
                          <div class="leo-dt-session-breakdown-inner">
                            ${r.sesiones && r.sesiones.length > 0 ? `
                              <table class="leo-dt-session-table">
                                <thead>
                                  <tr>
                                    <th>Sesión</th>
                                    ${LEONES_DIET_COLS.map(c => `<th>${c.label}</th>`).join('')}
                                  </tr>
                                </thead>
                                <tbody>
                                  ${ (() => {
                                    let sArr = [];
                                    if (r.sesiones) {
                                      sArr = typeof r.sesiones === 'string' ? JSON.parse(r.sesiones) : r.sesiones;
                                    }
                                    return (Array.isArray(sArr) ? sArr : []).map(s => `
                                      <tr>
                                        <td style="font-weight: 500;">${H.escapeHtml(s.nombre || '')}</td>
                                        ${LEONES_DIET_COLS.map(c => `<td>${s[c.key] ? parseFloat(s[c.key]).toFixed(2) : '-'}</td>`).join('')}
                                      </tr>
                                    `).join('');
                                  })() }
                                </tbody>
                              </table>
                            ` : '<p class="text-muted" style="margin:0; font-size: 0.85rem;">Sin desglose de sesiones guardado.</p>'}
                          </div>
                        </td>
                      </tr>
                    `;
      }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // ── Gráfico de Evolución ─────────────────────────────
    const chartHtml = `
      <div class="card" style="margin-top:var(--sp-4);">
        <div class="card-header">
          <h3>📈 Evolución de Dieta</h3>
          <div class="leo-diet-chart-filters" id="leo-diet-chart-filters">
            <button class="leo-dcf-btn active" data-range="7">7d</button>
            <button class="leo-dcf-btn" data-range="30">30d</button>
            <button class="leo-dcf-btn" data-range="90">3m</button>
            <button class="leo-dcf-btn" data-range="365">1a</button>
            <button class="leo-dcf-btn" data-range="0">Todo</button>
          </div>
        </div>
        <div class="card-body">
          <div class="leo-diet-chart-container">
            <canvas id="leones-diet-chart"></canvas>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = summaryHtml + actionsHtml + tableHtml + chartHtml;

    // ── Inicializar Gráfico ──────────────────────────────
    await renderLeonesDietChart(animal.id, 7);

    // ── Wiring de los filtros ────────────────────────────
    const filtersEl = document.getElementById('leo-diet-chart-filters');
    if (filtersEl) {
      filtersEl.addEventListener('click', async (e) => {
        const btn = e.target.closest('.leo-dcf-btn');
        if (!btn) return;
        filtersEl.querySelectorAll('.leo-dcf-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const range = parseInt(btn.dataset.range) || 0;
        await renderLeonesDietChart(animal.id, range);
      });
    }
  }

  async function renderLeonesDietChart(animalId, rangeDays) {
    const ctx = document.getElementById('leones-diet-chart');
    if (!ctx) return;

    if (leonesDietChart) { leonesDietChart.destroy(); leonesDietChart = null; }

    const { getDietRecordsByDateRange, getDietRecords } = await import('../src/services/animalService.js?v=8');

    let records;
    if (rangeDays === 0) {
      records = await getDietRecords(animalId, 500);
      records = [...records].reverse();
    } else {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - rangeDays);
      records = await getDietRecordsByDateRange(
        animalId,
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0]
      );
    }

    if (records.length < 2) {
      ctx.parentElement.innerHTML = '<p class="text-muted text-center" style="padding:var(--sp-8);">Se necesitan al menos 2 registros para mostrar el gráfico.</p>';
      return;
    }

    let labels = [];
    let data = [];

    if (rangeDays === 0) {
      // "Todo" mode: just use existing data points
      labels = records.map(r => H.formatDate(r.fecha));
      data = records.map(r => parseFloat(r.dieta_total) || 0);
    } else {
      // Range modes: explicitly create a label for every day in the range
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - rangeDays);
      
      const dateMap = {};
      records.forEach(r => { dateMap[r.fecha] = parseFloat(r.dieta_total) || 0; });

      const curr = new Date(start);
      while (curr <= end) {
        const dStr = curr.toISOString().split('T')[0];
        labels.push(H.formatDate(dStr));
        // Use null for days without data to show an accurate timeline
        data.push(dateMap[dStr] !== undefined ? dateMap[dStr] : null);
        curr.setDate(curr.getDate() + 1);
      }
    }

    leonesDietChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Dieta Total (kg)',
          data,
          borderColor: '#00b4d8',
          backgroundColor: 'rgba(0, 180, 216, 0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: '#00b4d8',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3,
          fill: true,
          spanGaps: true, // Conecta los puntos aunque haya días sin registro
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0a2647',
            titleFont: { family: 'Inter' },
            bodyFont: { family: 'Inter' },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (c) => ` ${c.parsed.y.toFixed(2)} kg`,
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 }, maxRotation: 45 } },
          y: {
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { font: { family: 'Inter', size: 11 }, callback: (v) => v + ' kg' },
          },
        },
        interaction: { intersect: false, mode: 'index' },
      },
    });
  }

  async function openLeonesDietForm(animalId, deptId, recordId = null, copyPrevious = false) {
    const { getLatestDietRecord, createDietRecord, updateDietRecord, getRecordById } = await import('../src/services/animalService.js?v=8');

    App.Views.currentDietExtras = [];
    App.Views.currentDietSessions = [];
    let defaults = {};
    let isEdit = false;

    if (copyPrevious) {
      const prev = await getLatestDietRecord(animalId);
      if (prev) {
        defaults = {
          vitaminas: prev.vitaminas || '',
          observaciones: '',
        };
        if (prev.sesiones && prev.sesiones.length > 0) {
          App.Views.currentDietSessions = typeof prev.sesiones === 'string' ? JSON.parse(prev.sesiones) : prev.sesiones;
        } else {
          let s = { nombre: 'Sesión 1' };
          LEONES_DIET_COLS.forEach(c => s[c.key] = prev[c.key] || 0);
          App.Views.currentDietSessions.push(s);
        }
        if (prev.alimento) {
          try {
            App.Views.currentDietExtras = JSON.parse(prev.alimento);
          } catch(e) {
            App.Views.currentDietExtras = [{ name: prev.alimento, kg: parseFloat(prev.cantidad_gramos || 0) }];
          }
        }
      }
    } else if (recordId) {
      isEdit = true;
      const prev = await getRecordById('diets', recordId);
      if (prev) {
        defaults = {
          fecha: prev.fecha,
          vitaminas: prev.vitaminas || '',
          observaciones: prev.observaciones || '',
        };
        if (prev.sesiones && prev.sesiones.length > 0) {
          App.Views.currentDietSessions = typeof prev.sesiones === 'string' ? JSON.parse(prev.sesiones) : prev.sesiones;
        } else {
          let s = { nombre: 'Sesión 1' };
          LEONES_DIET_COLS.forEach(c => s[c.key] = prev[c.key] || 0);
          App.Views.currentDietSessions.push(s);
        }
        if (prev.alimento) {
          try {
            App.Views.currentDietExtras = JSON.parse(prev.alimento);
          } catch(e) {
            App.Views.currentDietExtras = [{ name: prev.alimento, kg: parseFloat(prev.cantidad_gramos || 0) }];
          }
        }
      }
    }

    if (App.Views.currentDietSessions.length === 0) {
        App.Views.currentDietSessions = [{ nombre: 'Sesión 1' }, { nombre: 'Sesión 2' }, { nombre: 'Sesión 3' }];
    }

    const todayStr = defaults.fecha || H.today();

    const formHtml = `
      <form id="record-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="leo-diet-fecha">Fecha *</label>
          <input class="form-input" type="date" id="leo-diet-fecha" value="${todayStr}" required>
        </div>
        
        <div style="margin-bottom: var(--sp-4);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-2);">
            <label class="form-label" style="margin: 0;">Desglose por Sesiones (kg)</label>
            <button type="button" class="btn btn-outline btn-sm" onclick="App.Views.addLeoDietSession()">+ Añadir Sesión</button>
          </div>
          <div style="overflow-x: auto;">
            <table class="leo-diet-sessions-form">
              <thead>
                <tr>
                  <th>Sesión</th>
                  ${LEONES_DIET_COLS.map(c => `<th title="${c.title}">${c.label}</th>`).join('')}
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="leo-diet-sessions-tbody">
                <!-- Renderizado por renderLeoDietSessions -->
              </tbody>
              <tfoot>
                <tr>
                  <td style="font-weight: bold; text-align: right;">TOTAL:</td>
                  ${LEONES_DIET_COLS.map(c => `<td id="leo-diet-total-${c.key}" class="row-total" style="background:transparent; border-bottom:none;">0</td>`).join('')}
                  <td id="leo-diet-form-total" style="font-weight: bold; background: var(--primary-50); border-radius: var(--radius-md);">0 kg</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div style="margin: var(--sp-4) 0; padding: var(--sp-4); border: 1px dashed var(--gray-300); border-radius: var(--radius-md);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-3);">
            <h4 style="margin: 0; color: var(--gray-600); font-size: 0.9rem;">Alimentos Personalizados</h4>
            <button type="button" class="btn btn-outline btn-sm" onclick="App.Views.addLeoDietExtra()">+ Añadir Alimento</button>
          </div>
          <div id="leo-diet-extras-container">
            <!-- Renderizado dinámicamente por JS -->
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="leo-diet-vitaminas">Vitaminas</label>
          <select class="form-select" id="leo-diet-vitaminas">
            <option value="">—</option>
            <option value="Sí" ${defaults.vitaminas === 'Sí' ? 'selected' : ''}>Sí</option>
            <option value="No" ${defaults.vitaminas === 'No' ? 'selected' : ''}>No</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="leo-diet-obs">Observaciones</label>
          <textarea class="form-textarea" id="leo-diet-obs" placeholder="Notas sobre la dieta del día...">${H.escapeHtml(defaults.observaciones || '')}</textarea>
        </div>
      </form>
    `;

    UI.showModal({
      title: isEdit ? '✏️ Editar Dieta' : (copyPrevious ? '📋 Copiar Dieta Anterior' : '+ Registrar Dieta del Día'),
      contentHtml: formHtml,
      saveLabel: isEdit ? 'Actualizar Registro' : 'Guardar Registro',
      modalClass: 'modal-xl',
      onSave: async () => {
        const fecha = document.getElementById('leo-diet-fecha')?.value;
        if (!fecha) { UI.showToast('La fecha es obligatoria', 'error'); return; }

        const record = {
          animal_id: animalId,
          departamento_id: deptId,
          fecha,
          vitaminas: document.getElementById('leo-diet-vitaminas')?.value || '',
          observaciones: document.getElementById('leo-diet-obs')?.value || '',
          extra_foods: App.Views.currentDietExtras,
          sesiones: App.Views.currentDietSessions,
        };

        LEONES_DIET_COLS.forEach(c => {
          record[c.key] = Array.isArray(App.Views.currentDietSessions) 
            ? App.Views.currentDietSessions.reduce((sum, s) => sum + (parseFloat(s[c.key]) || 0), 0)
            : 0;
        });

        try {
          if (isEdit) {
            await updateDietRecord(recordId, record);
            UI.showToast('Dieta actualizada correctamente', 'success');
          } else {
            await createDietRecord(record);
            UI.showToast('Dieta registrada correctamente', 'success');
          }
          UI.closeModal();
          App.Router.resolve();
        } catch (err) {
          if (err.message?.includes('duplicate') || err.code === '23505') {
            UI.showToast('Ya existe una dieta registrada para este animal en la fecha seleccionada. Por favor, edita la dieta existente o elige otra fecha.', 'error');
          } else {
            UI.showToast('Error: ' + err.message, 'error');
          }
        }
      },
    });

    App.Views.renderLeoDietSessions();
    App.Views.renderLeoDietExtras();
    App.Views.updateLeonesDietTotal();
  }

  function updateLeonesDietTotal() {
    let grandTotal = 0;
    
    LEONES_DIET_COLS.forEach(c => {
      let colTotal = 0;
      if (Array.isArray(App.Views.currentDietSessions)) {
        colTotal = App.Views.currentDietSessions.reduce((sum, s) => sum + (parseFloat(s[c.key]) || 0), 0);
      }
      grandTotal += colTotal;
      const colEl = document.getElementById(`leo-diet-total-${c.key}`);
      if (colEl) colEl.textContent = parseFloat(colTotal.toFixed(2));
    });
    
    if (Array.isArray(App.Views.currentDietExtras)) {
      grandTotal += App.Views.currentDietExtras.reduce((sum, extra) => sum + (parseFloat(extra.kg) || 0), 0);
    }
    
    const el = document.getElementById('leo-diet-form-total');
    if (el) {
      el.textContent = `${parseFloat(grandTotal.toFixed(2))} kg`;
    }
  }

  function renderLeoDietSessions() {
    const tbody = document.getElementById('leo-diet-sessions-tbody');
    if (!tbody) return;

    if (!App.Views.currentDietSessions || App.Views.currentDietSessions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted">No hay sesiones</td></tr>';
      return;
    }

    tbody.innerHTML = (Array.isArray(App.Views.currentDietSessions) ? App.Views.currentDietSessions : []).map((session, index) => {
      let subtotal = 0;
      LEONES_DIET_COLS.forEach(c => subtotal += (parseFloat(session[c.key]) || 0));
      
      return `
        <tr>
          <td>
            <input class="form-input" style="min-width: 90px;" type="text" value="${H.escapeHtml(session.nombre || '')}" 
              onchange="App.Views.updateLeoDietSession(${index}, 'nombre', this.value)">
          </td>
          ${LEONES_DIET_COLS.map(c => `
            <td>
              <input class="form-input" type="number" value="${session[c.key] != null ? session[c.key] : ''}" min="0" step="0.01"
                onchange="App.Views.updateLeoDietSession(${index}, '${c.key}', this.value)">
            </td>
          `).join('')}
          <td class="row-total">${parseFloat(subtotal.toFixed(2))}</td>
          <td>
            <button type="button" class="btn btn-ghost btn-icon" style="color:var(--danger-500); width:28px; height:28px;" onclick="App.Views.removeLeoDietSession(${index})" title="Eliminar sesión">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
    
    App.Views.updateLeonesDietTotal();
  }

  function addLeoDietSession() {
    const num = (App.Views.currentDietSessions || []).length + 1;
    App.Views.currentDietSessions.push({ nombre: `Sesión ${num}` });
    App.Views.renderLeoDietSessions();
  }

  function updateLeoDietSession(index, key, value) {
    if (App.Views.currentDietSessions && App.Views.currentDietSessions[index]) {
      App.Views.currentDietSessions[index][key] = key === 'nombre' ? value : (parseFloat(value) || 0);
      App.Views.renderLeoDietSessions();
    }
  }

  function removeLeoDietSession(index) {
    if (App.Views.currentDietSessions) {
      App.Views.currentDietSessions.splice(index, 1);
      App.Views.renderLeoDietSessions();
    }
  }

  // ── Funciones Auxiliares para Extras Dinámicos ─────────────
  function renderLeoDietExtras() {
    const container = document.getElementById('leo-diet-extras-container');
    if (!container) return;

    if (!App.Views.currentDietExtras || App.Views.currentDietExtras.length === 0) {
      container.innerHTML = '<p style="color: var(--gray-500); font-size: 0.85rem; margin:0; text-align: center;">No hay alimentos extra. Pulsa el botón para añadir.</p>';
      return;
    }

    container.innerHTML = App.Views.currentDietExtras.map((extra, index) => `
      <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: var(--sp-3); align-items: end; margin-bottom: var(--sp-3);">
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label" style="font-size: 0.8rem;">Nombre</label>
          <input class="form-input" type="text" placeholder="Ej: Calamar" value="${H.escapeHtml(extra.name || '')}" 
            oninput="App.Views.updateLeoDietExtra(${index}, 'name', this.value)">
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label" style="font-size: 0.8rem;">Cantidad (kg)</label>
          <input class="form-input" type="number" value="${extra.kg || 0}" min="0" step="0.01"
            oninput="App.Views.updateLeoDietExtra(${index}, 'kg', this.value)">
        </div>
        <button type="button" class="btn btn-ghost btn-icon" onclick="App.Views.removeLeoDietExtra(${index})" title="Eliminar" style="color: var(--danger-500);">🗑️</button>
      </div>
    `).join('');
  }

  function addLeoDietExtra() {
    if (!App.Views.currentDietExtras) App.Views.currentDietExtras = [];
    App.Views.currentDietExtras.push({ name: '', kg: 0 });
    App.Views.renderLeoDietExtras();
    App.Views.updateLeonesDietTotal();
  }

  function updateLeoDietExtra(index, key, value) {
    if (App.Views.currentDietExtras && App.Views.currentDietExtras[index]) {
      App.Views.currentDietExtras[index][key] = key === 'kg' ? parseFloat(value) || 0 : value;
      if (key === 'kg') App.Views.updateLeonesDietTotal();
    }
  }

  function removeLeoDietExtra(index) {
    if (App.Views.currentDietExtras) {
      App.Views.currentDietExtras.splice(index, 1);
      App.Views.renderLeoDietExtras();
      App.Views.updateLeonesDietTotal();
    }
  }

  // ── Diet Tab (Detailed Fish Breakdown + Chart) ─────────────
  async function renderDietTab(container, animal) {
    // Leer dietas desde Supabase en lugar de IndexedDB
    const { getRecordsByAnimal } = await import('../src/services/animalService.js?v=8');
    let records = [];
    try {
      records = await getRecordsByAnimal('diets', animal.id);
    } catch (err) {
      console.error('Error cargando dietas de Supabase:', err);
    }
    const columns = H.TABLE_COLUMNS.diets;
    const section = H.getSectionMeta('diets');

    // Load existing diet breakdown from localStorage
    const storageKey = `diet_breakdown_${animal.id}`;
    let breakdown = {};
    try {
      breakdown = JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch { breakdown = {}; }

    // Ensure all fish types have a value
    FISH_TYPES.forEach(f => { if (!breakdown[f.key]) breakdown[f.key] = 0; });

    const totalGrams = FISH_TYPES.reduce((sum, f) => sum + (breakdown[f.key] || 0), 0);

    container.innerHTML = `
      <div class="card diet-breakdown-card">
        <div class="card-header">
          <h3>🐟 Desglose de Dieta por Pescado</h3>
        </div>
        <div class="card-body">
          <div class="diet-fish-grid">
            ${FISH_TYPES.map(fish => {
      const val = breakdown[fish.key] || 0;
      return `
                <div class="diet-fish-item">
                  <div class="diet-fish-header">
                    <span class="diet-fish-emoji">${fish.emoji}</span>
                    <span class="diet-fish-name">${fish.label}</span>
                  </div>
                  <div class="diet-fish-controls">
                    <button class="diet-qty-btn diet-qty-minus" onclick="App.Views.adjustDietQty('${animal.id}', '${fish.key}', -50)" title="-50g">−</button>
                    <input type="number" class="diet-qty-input" id="diet-qty-${fish.key}" value="${val}" min="0" step="10"
                      onchange="App.Views.setDietQty('${animal.id}', '${fish.key}', this.value)">
                    <span class="diet-qty-unit">g</span>
                    <button class="diet-qty-btn diet-qty-plus" onclick="App.Views.adjustDietQty('${animal.id}', '${fish.key}', 50)" title="+50g">+</button>
                  </div>
                </div>
              `;
    }).join('')}
          </div>
          <div class="diet-total-bar">
            <span class="diet-total-label">Total diario:</span>
            <span class="diet-total-value" id="diet-total-value">${totalGrams} g (${(totalGrams / 1000).toFixed(2)} kg)</span>
          </div>
          <div class="diet-chart-container">
            <canvas id="diet-chart"></canvas>
          </div>
          <div style="text-align: right; margin-top: var(--sp-4);">
            <button class="btn btn-primary" onclick="App.Views.saveDailyDiet('${animal.id}')">💾 Guardar Registro Diario</button>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:var(--sp-4);">
        <div class="card-header">
          <h3>${section.icon} Historial de ${section.name}</h3>
          <button class="btn btn-primary btn-sm" onclick="App.Views.openRecordForm('diets', '${animal.id}')">+ Nuevo Registro</button>
        </div>
        <div class="card-body">
          ${UI.renderTable(records, columns, { type: 'diets', animalId: animal.id })}
        </div>
      </div>
    `;

    // Render the doughnut chart
    renderDietChart(breakdown);
  }

  function renderDietChart(breakdown) {
    const ctx = document.getElementById('diet-chart');
    if (!ctx) return;

    if (dietChart) { dietChart.destroy(); dietChart = null; }

    const labels = FISH_TYPES.map(f => f.label);
    const data = FISH_TYPES.map(f => breakdown[f.key] || 0);
    const colors = FISH_TYPES.map(f => f.color);
    const totalGrams = data.reduce((a, b) => a + b, 0);

    if (totalGrams === 0) {
      ctx.parentElement.innerHTML = '<p class="text-muted text-center" style="padding:var(--sp-8);">Introduce cantidades para ver el gráfico de distribución.</p>';
      return;
    }

    dietChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '55%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: 'Inter', size: 12 },
              usePointStyle: true,
              padding: 16,
              generateLabels: (chart) => {
                const dataset = chart.data.datasets[0];
                return chart.data.labels.map((label, i) => {
                  const value = dataset.data[i];
                  const pct = totalGrams > 0 ? ((value / totalGrams) * 100).toFixed(1) : 0;
                  return {
                    text: `${label}: ${value}g (${pct}%)`,
                    fillStyle: dataset.backgroundColor[i],
                    strokeStyle: dataset.borderColor,
                    lineWidth: dataset.borderWidth,
                    pointStyle: 'circle',
                    hidden: false,
                    index: i,
                  };
                });
              },
            },
          },
          tooltip: {
            backgroundColor: '#0a2647',
            titleFont: { family: 'Inter' },
            bodyFont: { family: 'Inter' },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                const pct = totalGrams > 0 ? ((value / totalGrams) * 100).toFixed(1) : 0;
                return ` ${value} g (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }

  function adjustDietQty(animalId, fishKey, delta) {
    const storageKey = `diet_breakdown_${animalId}`;
    let breakdown = {};
    try { breakdown = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { breakdown = {}; }
    FISH_TYPES.forEach(f => { if (!breakdown[f.key]) breakdown[f.key] = 0; });

    breakdown[fishKey] = Math.max(0, (breakdown[fishKey] || 0) + delta);
    localStorage.setItem(storageKey, JSON.stringify(breakdown));

    // Update UI without full re-render
    const input = document.getElementById(`diet-qty-${fishKey}`);
    if (input) input.value = breakdown[fishKey];

    const totalGrams = FISH_TYPES.reduce((sum, f) => sum + (breakdown[f.key] || 0), 0);
    const totalEl = document.getElementById('diet-total-value');
    if (totalEl) totalEl.textContent = `${totalGrams} g (${(totalGrams / 1000).toFixed(2)} kg)`;

    renderDietChart(breakdown);
  }

  function setDietQty(animalId, fishKey, value) {
    const storageKey = `diet_breakdown_${animalId}`;
    let breakdown = {};
    try { breakdown = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { breakdown = {}; }
    FISH_TYPES.forEach(f => { if (!breakdown[f.key]) breakdown[f.key] = 0; });

    breakdown[fishKey] = Math.max(0, parseInt(value) || 0);
    localStorage.setItem(storageKey, JSON.stringify(breakdown));

    const totalGrams = FISH_TYPES.reduce((sum, f) => sum + (breakdown[f.key] || 0), 0);
    const totalEl = document.getElementById('diet-total-value');
    if (totalEl) totalEl.textContent = `${totalGrams} g (${(totalGrams / 1000).toFixed(2)} kg)`;

    renderDietChart(breakdown);
  }

  async function saveDailyDiet(animalId) {
    const storageKey = `diet_breakdown_${animalId}`;
    let breakdown = {};
    try { breakdown = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { breakdown = {}; }

    // Cargar dinámicamente el servicio de animales de Supabase
    const { createDietRecord } = await import('../src/services/animalService.js?v=8');

    const dietData = {
      animal_id: animalId,
      fecha: new Date().toISOString(),
      arenque_pequeno: breakdown.arenque_peq || 0,
      arenque_grande: breakdown.arenque_gde || 0,
      sprat: breakdown.sprat || 0,
      capelin: breakdown.capelin || 0,
      caballa: breakdown.caballa || 0,
      bacaladilla: breakdown.bacaladilla || 0
    };

    try {
      await createDietRecord(dietData);
      UI.showToast('Historial diario guardado en Supabase', 'success');
      App.Router.resolve();
    } catch (err) {
      UI.showToast('Error al guardar en Supabase: ' + err.message, 'error');
    }
  }

  // ── Veterinary Tab (with attachments) ─────────────────────
  async function renderVetTab(container, animal) {
    const records = await DB.VeterinaryService.getByAnimal(animal.id);
    const columns = H.TABLE_COLUMNS.veterinary;
    const section = H.getSectionMeta('veterinary');

    // Get attachments for all vet records
    const allAttachments = await DB.AttachmentService.getByAnimal(animal.id);

    let attachSection = '';
    if (allAttachments.length > 0) {
      attachSection = `
        <div class="card" style="margin-top:var(--sp-4);">
          <div class="card-header">
            <h3>📎 Documentos Adjuntos</h3>
            <button class="btn btn-outline btn-sm" onclick="App.Views.openAttachmentUploader('${animal.id}')">+ Adjuntar Archivo</button>
          </div>
          <div class="card-body">
            <div class="attachments-list">
              ${allAttachments.map(att => `
                <div class="attachment-item">
                  <span class="attachment-icon">${att.mime_type && att.mime_type.includes('pdf') ? '📄' : '🖼️'}</span>
                  <div class="attachment-info">
                    <div class="attachment-name">${H.escapeHtml(att.filename)}</div>
                    <div class="attachment-meta">${H.formatDate(att.created_at)} · ${Math.round((att.size || 0) / 1024)} KB</div>
                  </div>
                  <div class="attachment-actions">
                    <button class="btn btn-ghost btn-icon" onclick="App.Views.downloadAttachment('${att.id}')" title="Descargar">⬇️</button>
                    <button class="btn btn-ghost btn-icon" onclick="App.Views.deleteAttachment('${att.id}', '${animal.id}')" title="Eliminar">🗑️</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>${section.icon} ${section.name}</h3>
          <div class="btn-group">
            <button class="btn btn-outline btn-sm" onclick="App.Views.openAttachmentUploader('${animal.id}')">📎 Adjuntar</button>
            <button class="btn btn-primary btn-sm" onclick="App.Views.openRecordForm('veterinary', '${animal.id}')">+ Nuevo Registro</button>
          </div>
        </div>
        <div class="card-body">
          ${UI.renderTable(records, columns, { type: 'veterinary', animalId: animal.id })}
        </div>
      </div>
      ${attachSection}
    `;
  }

  // ── Attachment Upload ─────────────────────────────────────
  async function openAttachmentUploader(animalId) {
    const html = `
      <div class="attachment-uploader">
        <label class="attachment-drop-zone" for="attachment-file-input" id="attachment-drop-zone">
          <div class="attachment-drop-icon">📎</div>
          <p>Arrastra un archivo o haz clic para seleccionar</p>
          <small>PDF, JPG, PNG, WEBP — Máx. 10MB</small>
        </label>
        <input type="file" id="attachment-file-input" accept=".pdf,.jpg,.jpeg,.png,.webp" style="display:none">
        <div id="attachment-preview" class="attachment-upload-preview"></div>
        <div id="attachment-error" class="form-error"></div>
      </div>
    `;

    UI.showModal({
      title: '📎 Adjuntar Archivo',
      contentHtml: html,
      saveLabel: 'Subir',
      onSave: async () => {
        const fileInput = document.getElementById('attachment-file-input');
        const file = fileInput && fileInput.files[0];
        if (!file) {
          document.getElementById('attachment-error').textContent = 'Selecciona un archivo.';
          return;
        }

        try {
          const reader = new FileReader();
          reader.onload = async (e) => {
            await DB.AttachmentService.create({
              animal_id: animalId,
              record_id: '',
              filename: file.name,
              mime_type: file.type,
              size: file.size,
              data: e.target.result,
            });
            UI.showToast('Archivo adjuntado correctamente', 'success');
            UI.closeModal();
            App.Router.resolve();
          };
          reader.readAsDataURL(file);
        } catch (err) {
          UI.showToast('Error: ' + err.message, 'error');
        }
      },
    });

    // Wire file input
    const fileInput = document.getElementById('attachment-file-input');
    const preview = document.getElementById('attachment-preview');
    if (fileInput) {
      fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file && preview) {
          preview.innerHTML = `
            <div class="attachment-file-preview">
              <span>${file.type.includes('pdf') ? '📄' : '🖼️'}</span>
              <span>${H.escapeHtml(file.name)}</span>
              <small>${Math.round(file.size / 1024)} KB</small>
            </div>
          `;
        }
      });
    }
  }

  async function downloadAttachment(attachId) {
    try {
      const att = await DB.AttachmentService.getByRecord(attachId);
      // If not found by record, try direct
      let attachment = att[0];
      if (!attachment) {
        const all = await DB.AttachmentService.getAll();
        attachment = all.find(a => a.id === attachId);
      }
      if (!attachment) { UI.showToast('Archivo no encontrado', 'error'); return; }

      const a = document.createElement('a');
      a.href = attachment.data;
      a.download = attachment.filename;
      a.click();
      UI.showToast('Descargando archivo...', 'info');
    } catch (err) {
      UI.showToast('Error: ' + err.message, 'error');
    }
  }

  async function deleteAttachment(attachId, animalId) {
    UI.showConfirm('¿Eliminar este archivo adjunto?', async () => {
      try {
        await DB.AttachmentService.remove(attachId);
        UI.showToast('Archivo eliminado', 'success');
        App.Router.resolve();
      } catch (err) {
        UI.showToast('Error: ' + err.message, 'error');
      }
    }, 'Eliminar Adjunto');
  }

  // ── Weight Tab (with Chart + Stats + Unit Toggle) ─────────
  async function renderWeightTab(container, animal) {
    let weights = [];
    try {
      const { getRecordsByAnimal } = await import('../src/services/animalService.js?v=8');
      weights = await getRecordsByAnimal('weights', animal.id);
    } catch (err) {
      UI.showToast('Error al sincronizar pesos desde la base de datos: ' + err.message, 'error');
      console.error(err);
    }
    const columns = H.TABLE_COLUMNS.weights;
    const unit = H.getWeightUnit(animal.id);

    // Sort chronologically
    const sortedWeights = [...weights].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Stats
    const allKg = weights.map(w => w.weight_kg).filter(w => w != null);
    const maxW = allKg.length > 0 ? Math.max(...allKg) : null;
    const minW = allKg.length > 0 ? Math.min(...allKg) : null;
    const avgW = allKg.length > 0 ? (allKg.reduce((a, b) => a + b, 0) / allKg.length) : null;
    const lastW = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].weight_kg : null;

    container.innerHTML = `
      <div class="weight-unit-toggle">
        <span class="weight-unit-label">Unidad:</span>
        <button class="weight-unit-btn ${unit === 'kg' ? 'active' : ''}" onclick="App.Views.setWeightUnit('${animal.id}', 'kg')">kg</button>
        <button class="weight-unit-btn ${unit === 'g' ? 'active' : ''}" onclick="App.Views.setWeightUnit('${animal.id}', 'g')">g</button>
      </div>

      ${allKg.length > 0 ? `
      <div class="weight-stats-grid">
        <div class="weight-stat-card weight-stat--last">
          <div class="weight-stat-icon">📊</div>
          <div class="weight-stat-value">${H.formatWeight(lastW, unit)}</div>
          <div class="weight-stat-label">Último Peso</div>
        </div>
        <div class="weight-stat-card weight-stat--max">
          <div class="weight-stat-icon">📈</div>
          <div class="weight-stat-value">${H.formatWeight(maxW, unit)}</div>
          <div class="weight-stat-label">Peso Máximo</div>
        </div>
        <div class="weight-stat-card weight-stat--min">
          <div class="weight-stat-icon">📉</div>
          <div class="weight-stat-value">${H.formatWeight(minW, unit)}</div>
          <div class="weight-stat-label">Peso Mínimo</div>
        </div>
        <div class="weight-stat-card weight-stat--avg">
          <div class="weight-stat-icon">⚖️</div>
          <div class="weight-stat-value">${H.formatWeight(avgW ? Math.round(avgW * 1000) / 1000 : null, unit)}</div>
          <div class="weight-stat-label">Peso Medio</div>
        </div>
      </div>` : ''}

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

    if (sortedWeights.length > 1) {
      renderWeightChart(sortedWeights, animal.name, unit);
    }
  }

  function setWeightUnit(animalId, unit) {
    H.setWeightUnit(animalId, unit);
    App.Router.resolve();
  }

  // ── Weight Chart ──────────────────────────────────────────
  function renderWeightChart(weights, animalName, unit = 'kg') {
    const ctx = document.getElementById('weight-chart');
    if (!ctx) return;

    if (weightChart) { weightChart.destroy(); weightChart = null; }

    const labels = weights.map(w => H.formatDate(w.date));
    const data = weights.map(w => unit === 'g' ? w.weight_kg * 1000 : w.weight_kg);
    const unitLabel = unit === 'g' ? 'g' : 'kg';

    weightChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `Peso de ${animalName} (${unitLabel})`,
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
          legend: { display: true, position: 'top', labels: { font: { family: 'Inter', size: 13 }, usePointStyle: true, padding: 20 } },
          tooltip: {
            backgroundColor: '#0a2647', titleFont: { family: 'Inter' }, bodyFont: { family: 'Inter' },
            padding: 12, cornerRadius: 8,
            callbacks: { label: (c) => ` ${c.parsed.y} ${unitLabel}` },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } },
          y: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { font: { family: 'Inter', size: 11 }, callback: (v) => v + ' ' + unitLabel },
          },
        },
        interaction: { intersect: false, mode: 'index' },
      },
    });
  }

  // ── CRUD Operations ───────────────────────────────────────

  async function openRecordForm(type, animalId, recordId = null) {
    const fields = H.FORM_FIELDS[type];
    if (!fields) return;

    const isEdit = !!recordId;
    const section = H.getSectionMeta(type);
    let existingData = {};

    const { getRecordById, updateSupabaseRecord, createSupabaseRecord } = await import('../src/services/animalService.js?v=8');

    if (isEdit) {
      existingData = await getRecordById(type, recordId) || {};
    } else {
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
        if (!data) return;

        try {
          data.animal_id = animalId;
          if (isEdit) {
            await updateSupabaseRecord(type, recordId, data);
            UI.showToast('Registro actualizado en Supabase', 'success');
          } else {
            await createSupabaseRecord(type, data);
            UI.showToast('Registro creado en Supabase', 'success');
          }
          UI.closeModal();
          App.Router.resolve();
        } catch (err) {
          UI.showToast('Error: ' + err.message, 'error');
        }
      },
    });
  }

  async function deleteRecord(type, recordId) {
    const section = H.getSectionMeta(type);

    // Validar UUID antes de intentar borrar en Supabase
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isLocalMock = !UUID_RE.test(recordId);

    if (isLocalMock) {
      UI.showConfirm(
        `Este es un registro local/prueba de ${section.name}. ¿Deseas eliminarlo de tu dispositivo?`,
        async () => {
          try {
            await DB.remove(type, recordId);
            UI.showToast('Registro local eliminado correctamente', 'success');
            App.Router.resolve();
          } catch (err) {
            UI.showToast('Error al eliminar localmente: ' + err.message, 'error');
          }
        },
        `Eliminar ${section.name} (Local)`
      );
      return;
    }

    const { deleteSupabaseRecord } = await import('../src/services/animalService.js?v=8');
    UI.showConfirm(
      `¿Estás seguro de eliminar este registro de ${section.name} en Supabase?`,
      async () => {
        try {
          await deleteSupabaseRecord(type, recordId);
          // También limpiamos localmente por si estuviera cacheado
          try { await DB.remove(type, recordId); } catch(e) {}
          
          UI.showToast('Registro eliminado de Supabase', 'success');
          App.Router.resolve();
        } catch (err) {
          UI.showToast('Error al eliminar: ' + err.message, 'error');
        }
      },
      `Eliminar ${section.name}`
    );
  }

  async function openAnimalForm(deptId, animalId = null) {
    const fields = H.FORM_FIELDS.animals;
    const isEdit = !!animalId;
    let existingData = {};

    const { getAnimalById, createAnimal, updateAnimal, uploadAnimalPhoto } = await import('../src/services/animalService.js?v=8');

    if (isEdit) {
      try {
        const dbAnimal = await getAnimalById(animalId);
        if (dbAnimal) {
          existingData = {
            id: dbAnimal.id,
            name: dbAnimal.nombre,
            species: dbAnimal.especie,
            birth_date: dbAnimal.fecha_nacimiento,
            observations: dbAnimal.observaciones,
            sex: dbAnimal.sexo || 'Desconocido',
            status: dbAnimal.estado || 'Activo',
            zims_id: dbAnimal.zims_id || '',
            microchip: dbAnimal.microchip || '',
            location: dbAnimal.ubicacion || '',
            foto_url: dbAnimal.foto_url || null,
            departamento_id: dbAnimal.departamento_id || deptId,
          };
        }
      } catch (err) {
        console.error('Error al obtener animal:', err);
      }
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

        const fileInput = document.getElementById('field-foto_upload');
        const file = fileInput && fileInput.files.length > 0 ? fileInput.files[0] : null;

        const mappedData = {
          nombre: data.name,
          especie: data.species,
          observaciones: data.observations || '',
          fecha_nacimiento: data.birth_date || null,
          departamento_id: deptId,
          sexo: data.sex || 'Desconocido',
          zims_id: data.zims_id || null,
          microchip: data.microchip || null,
          ubicacion: data.location || null,
          estado: data.status || 'Activo',
          foto_url: existingData.foto_url || null,
        };

        try {
          UI.showToast('Guardando...', 'info');

          if (isEdit) {
            if (file) {
              const newUrl = await uploadAnimalPhoto(animalId, file);
              if (newUrl) mappedData.foto_url = newUrl;
            }
            await updateAnimal(animalId, mappedData);
            UI.showToast('Animal actualizado correctamente', 'success');
          } else {
            const newAnimal = await createAnimal(mappedData);
            if (file) {
              const newUrl = await uploadAnimalPhoto(newAnimal.id, file);
              if (newUrl) {
                await updateAnimal(newAnimal.id, { foto_url: newUrl });
              }
            }
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

  async function deleteAnimal(animalId) {
    const { getAnimalById, deleteAnimal: deleteSupabaseAnimal } = await import('../src/services/animalService.js?v=8');

    let animal;
    try {
      animal = await getAnimalById(animalId);
    } catch (err) {
      UI.showToast('Animal no encontrado.', 'error');
      return;
    }

    const animalName = animal.nombre;
    const dept = animal.departamento_id;

    UI.showConfirm(
      `¿Eliminar a "${animalName}" y todos sus registros asociados? Esta acción no se puede deshacer.`,
      async () => {
        try {
          // Un único .delete() — ON DELETE CASCADE elimina todo lo demás
          await deleteSupabaseAnimal(animalId);

          // Limpiar datos locales (IndexedDB, fotos, favoritos)
          try { await DB.AnimalService.remove(animalId); } catch { /* ignore */ }
          try { await DB.FavoriteService.remove(animalId); } catch { /* ignore */ }
          App.Photos.invalidateCache(animalId);

          UI.showToast(`"${animalName}" eliminado correctamente`, 'success');
          App.Router.navigate(`/dept/${dept}/animals`);
        } catch (err) {
          UI.showToast('Error: ' + err.message, 'error');
        }
      },
      'Eliminar Animal'
    );
  }

  // ── Dept Record Form (with animal selector) ───────────────
  async function openDeptRecordForm(type, deptId) {
    const { getAnimals, createSupabaseRecord } = await import('../src/services/animalService.js?v=8');

    let animalsResult;
    try {
      animalsResult = await getAnimals({ departamentoId: deptId });
    } catch (err) {
      UI.showToast('Error al cargar animales: ' + err.message, 'error');
      return;
    }

    const animals = (animalsResult.data || []).map(a => ({
      id: a.id,
      name: a.nombre,
      species: a.especie,
    }));

    if (animals.length === 0) {
      UI.showToast('No hay animales en este departamento. Crea un animal primero.', 'info');
      return;
    }

    const fields = H.FORM_FIELDS[type];
    if (!fields) return;

    const section = H.getSectionMeta(type);
    const defaultData = { date: H.today() };

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

        const data = UI.getFormData(fields);
        if (!data) return;

        try {
          data.animal_id = animalId;
          await createSupabaseRecord(type, data);
          UI.showToast('Registro creado en Supabase', 'success');
          UI.closeModal();
          App.Router.resolve();
        } catch (err) {
          UI.showToast('Error: ' + err.message, 'error');
        }
      },
    });
  }

  function previewPhoto(url) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999';
    overlay.style.cursor = 'pointer';

    const img = document.createElement('img');
    img.src = url;
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '8px';
    img.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';

    overlay.appendChild(img);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
  }

  return {
    renderSplash,
    renderMenu,
    renderFavorites,
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
    toggleFavorite,
    setWeightUnit,
    openAttachmentUploader,
    downloadAttachment,
    deleteAttachment,
    adjustDietQty,
    setDietQty,
    saveDailyDiet,
    openLeonesDietForm,
    updateLeonesDietTotal,
    renderLeoDietSessions,
    addLeoDietSession,
    updateLeoDietSession,
    removeLeoDietSession,
    renderLeoDietExtras,
    addLeoDietExtra,
    updateLeoDietExtra,
    removeLeoDietExtra,
    previewPhoto,
    currentDietExtras: [],
    currentDietSessions: [],
  };
})();

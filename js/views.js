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
    'fish-management': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-card-svg">
      <path d="M6.5 12c.94-2.07 3.08-3.5 5.5-3.5s4.56 1.43 5.5 3.5c-.94 2.07-3.08 3.5-5.5 3.5s-4.56-1.43-5.5-3.5z"/>
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
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
    const { getAnimalsCount } = await import('../src/services/animalService.js?v=16');

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
          <button class="menu-extra-btn" onclick="App.Router.navigate('/fish-management')">
            <span class="menu-extra-icon">🐟</span>
            <span class="menu-extra-label">Pescado & Descongelación</span>
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
          ${H.SECTIONS.filter(section => {
        if (section.id === 'fish-management') {
          return H.isFishDept(deptId);
        }
        return true;
      }).map(section => {
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
    const { getAnimals } = await import('../src/services/animalService.js?v=16');

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
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <h2>🐾 Animales</h2>
          <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
            ${App.ExportHeader.renderExportActions({
              exportHandlerGlobal: `App.Views.exportSectionData('animals', '${deptId}', '%FORMAT%')`,
              printHandlerGlobal: `App.Views.printSectionData('animals', '${deptId}')`
            })}
            <button class="btn btn-primary" onclick="App.Views.openAnimalForm('${deptId}')">+ Nuevo Animal</button>
          </div>
        </div>
        ${App.UI.renderAdvancedFilterBar({
          animals: dbAnimals.map(a => ({ id: a.id, nombre: a.nombre })),
          selectedAnimalId: activeSectionFilters.animalId,
          selectedPeriod: activeSectionFilters.period,
          startDate: activeSectionFilters.startDate,
          endDate: activeSectionFilters.endDate,
          onApplyGlobal: `App.Views.applySectionFilters('animals', '${deptId}')`,
          onResetGlobal: `App.Views.resetSectionFilters('animals', '${deptId}')`
        })}
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
            <div class="text-sm text-slate-500 mb-1">ZIMS ID: ${H.escapeHtml(animal.zims_id || '—')}</div>
            <div class="animal-species">${H.escapeHtml(animal.species)}</div>
            <div class="animal-meta">
              ${H.getSexBadge(animal.sex)}
              ${H.getStatusBadge(animal.status)}
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
    if (sectionId === 'trainings') { return renderGlobalTrainingView(params); }
    if (sectionId === 'weights') { return renderGlobalWeightsDashboard(params); }
    if (sectionId === 'diets') { return renderGlobalDietsDashboard(params); }
    if (sectionId === 'fish-management' || sectionId === 'fish') {
      if (!H.isFishDept(deptId)) {
        App.Router.navigate(`/dept/${deptId}`);
        return;
      }
      return (App.FishManagement || App.Views.FishManagement).render(params);
    }
    if (sectionId === 'enrichments') { return renderGlobalEnrichmentsDashboard(params); }

    const app = document.getElementById('app');
    let records;
    let animalMap = {};
    const columns = H.TABLE_COLUMNS[sectionId] || [];

    // ── Dietas y Pesos: leer directamente de Supabase ─────────────
    if (sectionId === 'diets' || sectionId === 'weights') {
      const { getAllDietRecords, getAllWeightRecords, getAnimals } = await import('../src/services/animalService.js?v=16');
      try {
        if (sectionId === 'diets') {
          records = await getAllDietRecords(deptId);
        } else if (sectionId === 'weights') {
          records = await getAllWeightRecords(deptId);
        }
        const { data: supaAnimals } = await getAnimals({ departamentoId: deptId });
        (supaAnimals || []).forEach(a => { animalMap[a.id] = a.nombre; });
      } catch (err) {
        console.error(`Error cargando ${sectionId} de Supabase:`, err);
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
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <h2>${section.icon} ${section.name}</h2>
          <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
            ${App.ExportHeader.renderExportActions({
              exportHandlerGlobal: `App.Views.exportSectionData('${sectionId}', '${deptId}', '%FORMAT%')`,
              printHandlerGlobal: `App.Views.printSectionData('${sectionId}', '${deptId}')`
            })}
            <button class="btn btn-primary" onclick="${sectionId === 'diets' ? `App.Views.openDietAnimalSelector('${deptId}')` : `App.Views.openDeptRecordForm('${sectionId}', '${deptId}')`} ">+ Nuevo Registro</button>
          </div>
        </div>
        ${App.UI.renderAdvancedFilterBar({
          animals: Object.entries(animalMap).map(([id, nombre]) => ({ id, nombre })),
          selectedAnimalId: activeSectionFilters.animalId,
          selectedPeriod: activeSectionFilters.period,
          startDate: activeSectionFilters.startDate,
          endDate: activeSectionFilters.endDate,
          onApplyGlobal: `App.Views.applySectionFilters('${sectionId}', '${deptId}')`,
          onResetGlobal: `App.Views.resetSectionFilters('${sectionId}', '${deptId}')`
        })}
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
    const { getAnimalById } = await import('../src/services/animalService.js?v=16');

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
            <div class="text-sm text-slate-500 mb-1">ZIMS ID: ${H.escapeHtml(animal.zims_id || '—')}</div>
            <div class="animal-profile-species">${H.escapeHtml(animal.species)}</div>
            <div class="animal-profile-badges">
              ${H.getSexBadge(animal.sex)}
              ${H.getStatusBadge(animal.status)}
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
        if (animal.department === 'leones' || animal.species?.toLowerCase().includes('delf')) {
          await renderLeonesDietTab(container, animal);
        } else {
          await renderDietTab(container, animal);
        }
        break;
      case 'trainings': await renderTrainingTab(container, animal); break;
      case 'weights': await renderWeightTab(container, animal); break;
      case 'enrichments': await renderEnrichmentsTab(container, animal); break;
      case 'veterinary': await renderVetTab(container, animal); break;
      case 'health': await renderHealthTab(container, animal); break;
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
            <div class="info-item"><div class="info-label">Fecha de Nacimiento</div><div class="info-value">${H.formatBirthDateWithAge(animal.birth_date)}</div></div>
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
  //  Módulo de Dietas Estilo Excel
  // ═══════════════════════════════════════════════════════════════

  const DIET_COLS_LEONES = [
    { key: 'arenque_grande', label: 'A.Grande', title: 'Arenque Grande' },
    { key: 'capelin', label: 'Capelín', title: 'Capelín' },
    { key: 'arenque_pequeno', label: 'A.pequeño', title: 'Arenque Pequeño' },
    { key: 'sprat', label: 'Sprat', title: 'Sprat' },
    { key: 'caballa', label: 'Caballa', title: 'Caballa' },
    { key: 'bacaladilla', label: 'Bacaladilla', title: 'Bacaladilla' },
  ];

  const DIET_COLS_DELFINES = [
    { key: 'caballa', label: 'Caballa', title: 'Caballa' },
    { key: 'sprat', label: 'Sprat', title: 'Sprat' },
    { key: 'bacaladilla', label: 'Bacaladilla', title: 'Bacaladilla' },
    { key: 'sardina', label: 'Sardina', title: 'Sardina' },
    { key: 'merlan', label: 'Merlán', title: 'Merlán' },
    { key: 'merluza', label: 'Merluza', title: 'Merluza' },
  ];

  function getDietCols(especie) {
    if (especie && especie.toLowerCase().includes('delf')) {
      return DIET_COLS_DELFINES;
    }
    return DIET_COLS_LEONES;
  }

  async function renderLeonesDietTab(container, animal) {
    const {
      getDietRecords, getLatestDietRecord, getDietRecordsByDateRange, createDietRecord
    } = await import('../src/services/animalService.js?v=16');

    const records = await getDietRecords(animal.id, 100);
    const latest = records.length > 0 ? records[0] : null;

    let calculatedTotal = 0;
    const dietCols = getDietCols(animal.species);
    App.Views.currentDietCols = dietCols;

    if (latest) {
      dietCols.forEach(c => {
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
          ${dietCols.map(c => `
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
            <div class="leo-diet-table-wrap overflow-x-auto w-full">
              <table class="leo-diet-table table-fixed w-full">
                <thead>
                  <tr>
                    <th class="leo-dt-fecha py-3 px-3">Fecha</th>
                    <th class="leo-dt-total w-28 min-w-[110px] py-3 px-3">Total</th>
                    ${dietCols.map(c => `<th class="w-28 min-w-[110px] py-3 px-3" title="${c.title}">${c.label}</th>`).join('')}
                    <th class="py-3 px-3">Vits</th>
                    <th class="leo-dt-obs py-3 px-3">Observaciones</th>
                    <th class="leo-dt-actions py-3 px-3">Acciones</th>
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
                  const diff = currKg - prevKg;
                  if (diff > 0.001) arrow = ' <span class="text-[8.5px] font-medium ml-1" style="color: #047857; transform: translateY(-1px);">▲' + parseFloat(diff.toFixed(2)) + '</span>';
                  else if (diff < -0.001) arrow = ' <span class="text-[8.5px] font-medium ml-1" style="color: #be123c; transform: translateY(-1px);">▼' + parseFloat(Math.abs(diff).toFixed(2)) + '</span>';
                } catch(err){}
              } else if (prevR && !prevR.alimento) {
                const currKg = parseFloat(e.kg) || 0;
                if (currKg > 0.001) arrow = ' <span class="text-[8.5px] font-medium ml-1" style="color: #047857; transform: translateY(-1px);">▲' + parseFloat(currKg.toFixed(2)) + '</span>';
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
                        <td class="leo-dt-fecha py-3 px-3">
                          <button class="session-toggle-btn" onclick="this.classList.toggle('expanded'); this.closest('tr').nextElementSibling.style.display = this.classList.contains('expanded') ? 'table-row' : 'none';" title="Ver desglose">▶</button>
                          ${H.formatDate(r.fecha)}
                        </td>
                        <td class="leo-dt-total px-3 py-3 w-28 min-w-[110px]">
                          <div class="flex items-center w-full whitespace-nowrap">
                            <div class="w-1/2 text-right pr-0.5">
                              <span class="font-semibold text-gray-900 text-sm">
                                ${(() => {
                                  const currT = parseFloat(r.dieta_total) || 0;
                                  return parseFloat(currT.toFixed(2));
                                })()}
                              </span>
                            </div>
                            <div class="w-1/2 text-left pl-0.5">
                              ${(() => {
                                const currT = parseFloat(r.dieta_total) || 0;
                                const prevT = prevR ? (parseFloat(prevR.dieta_total) || 0) : null;
                                const diff = prevT !== null ? currT - prevT : 0;
                                if (diff > 0.001) return '<span class="text-[8.5px] font-medium" style="color: #047857;">▲' + parseFloat(diff.toFixed(2)) + '</span>';
                                if (diff < -0.001) return '<span class="text-[8.5px] font-medium" style="color: #be123c;">▼' + parseFloat(Math.abs(diff).toFixed(2)) + '</span>';
                                return '';
                              })()}
                            </div>
                          </div>
                        </td>
                        ${dietCols.map(c => {
                          const currVal = getFishVal(r, c.key);
                          const prevVal = prevR ? getFishVal(prevR, c.key) : null;
                          const diff = prevVal !== null ? currVal - prevVal : 0;
                          let badge = '';
                          if (diff > 0.001) badge = '<span class="text-[8.5px] font-medium" style="color: #047857;">▲' + parseFloat(diff.toFixed(2)) + '</span>';
                          else if (diff < -0.001) badge = '<span class="text-[8.5px] font-medium" style="color: #be123c;">▼' + parseFloat(Math.abs(diff).toFixed(2)) + '</span>';
                          return '<td class="px-3 py-3 w-28 min-w-[110px]"><div class="flex items-center w-full whitespace-nowrap"><div class="w-1/2 text-right pr-0.5"><span class="font-semibold text-gray-900 text-sm">' + parseFloat(currVal.toFixed(2)) + '</span></div><div class="w-1/2 text-left pl-0.5">' + badge + '</div></div></td>';
                        }).join('')}
                        <td class="py-3 px-3">${r.vitaminas || '—'}</td>
                        <td class="leo-dt-obs py-3 px-3">
                          ${extrasHtml}
                          ${(() => {
                            const txt = r.observaciones || '';
                            if (txt.length > 30) {
                              const safeTxt = H.escapeHtml(txt).replace(/"/g, '&quot;');
                              const truncatedTxt = H.escapeHtml(H.truncate(txt, 30));
                              return `<span title="${safeTxt}" class="truncate-clickable" style="cursor: pointer; text-decoration: underline; text-decoration-style: dotted; text-underline-offset: 4px; color: var(--primary-700);" data-full-text="${safeTxt}" data-record-date="${H.formatDate(r.fecha)}" onclick="event.stopPropagation(); App.UI.showObservationModal(this.getAttribute('data-full-text'), this.getAttribute('data-record-date'))">${truncatedTxt}</span>`;
                            }
                            return H.escapeHtml(txt);
                          })()}
                        </td>
                        <td class="actions-cell py-3 px-3">
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
                                    ${dietCols.map(c => `<th>${c.label}</th>`).join('')}
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
                                        ${dietCols.map(c => `<td>${s[c.key] ? parseFloat(s[c.key]).toFixed(2) : '-'}</td>`).join('')}
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

    const { getDietRecordsByDateRange, getDietRecords } = await import('../src/services/animalService.js?v=16');

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

    const maxVal = data.length > 0 ? Math.max(0, ...data.filter(d => d !== null)) : 0;
    const yMax = Math.ceil((maxVal || 10) * 1.15);

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
            min: 0,
            max: yMax,
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { font: { family: 'Inter', size: 11 }, callback: (v) => v + ' kg' },
          },
        },
        interaction: { intersect: false, mode: 'index' },
      },
    });
  }

  async function openLeonesDietForm(animalId, deptId, recordId = null, copyPrevious = false) {
    const { getLatestDietRecord, createDietRecord, updateDietRecord, getRecordById } = await import('../src/services/animalService.js?v=16');

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
          App.Views.currentDietCols.forEach(c => s[c.key] = prev[c.key] || 0);
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
          App.Views.currentDietCols.forEach(c => s[c.key] = prev[c.key] || 0);
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
                  ${App.Views.currentDietCols.map(c => `<th title="${c.title}">${c.label}</th>`).join('')}
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
                  ${App.Views.currentDietCols.map(c => `<td id="leo-diet-total-${c.key}" class="row-total" style="background:transparent; border-bottom:none;">0</td>`).join('')}
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

        App.Views.currentDietCols.forEach(c => {
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
          window.dispatchEvent(new CustomEvent('selwo:diet-updated'));
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
    
    App.Views.currentDietCols.forEach(c => {
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
      App.Views.currentDietCols.forEach(c => subtotal += (parseFloat(session[c.key]) || 0));
      
      return `
        <tr>
          <td>
            <input class="form-input" style="min-width: 90px;" type="text" value="${H.escapeHtml(session.nombre || '')}" 
              onchange="App.Views.updateLeoDietSession(${index}, 'nombre', this.value)">
          </td>
          ${App.Views.currentDietCols.map(c => `
            <td>
              <input class="form-input" type="number" value="${session[c.key] != null ? session[c.key] : ''}" min="0" step="0.1"
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
          <input class="form-input" type="number" value="${extra.kg || 0}" min="0" step="0.1"
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
    const { getRecordsByAnimal } = await import('../src/services/animalService.js?v=16');
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
    const { createDietRecord } = await import('../src/services/animalService.js?v=16');

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
      const { getRecordsByAnimal } = await import('../src/services/animalService.js?v=16');
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
    const maxVal = data.length > 0 ? Math.max(0, ...data.filter(d => d !== null)) : 0;
    const yMax = Math.ceil((maxVal || 10) * 1.15);

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
            min: 0,
            max: yMax,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { font: { family: 'Inter', size: 11 }, callback: (v) => v + ' ' + unitLabel },
          },
        },
        interaction: { intersect: false, mode: 'index' },
      },
    });
  }

  // ── CRUD Operations ───────────────────────────────────────

  // ──────────────────────────────────────────────────────────
  // ENTRENAMIENTOS GENERALES
  // ──────────────────────────────────────────────────────────
  async function renderGlobalTrainingView(params) {
    const { deptId } = params;
    const dept = H.getDeptMeta(deptId);
    const app = document.getElementById('app');

    const { getAnimals } = await import('../src/services/animalService.js?v=16');
    
    let animals = [];
    try {
      const { data } = await getAnimals({ departamentoId: deptId });
      animals = data || [];
    } catch (err) {
      console.error('Error cargando animales:', err);
      UI.showToast('Error cargando animales', 'error');
    }

    const cards = [];
    for (const animal of animals) {
      const photoUrl = animal.foto_url || await App.Photos.getPhotoUrl(animal.id, animal.especie);
      const targetUrl = `/animal/${animal.id}/trainings`;

      cards.push(`
        <div class="animal-card" data-animal-id="${animal.id}" data-animal-name="${H.escapeHtml(animal.nombre)}" data-animal-species="${H.escapeHtml(animal.especie)}" onclick="App.Router.navigate('${targetUrl}')" role="button" tabindex="0">
          <div class="animal-avatar">
            <img src="${photoUrl}" alt="${H.escapeHtml(animal.nombre)}" loading="lazy" style="object-fit: cover; object-position: center 20%;">
          </div>
          <div class="animal-info" style="display:flex; flex-direction:column; justify-content:space-between; flex:1;">
            <div>
              <div class="animal-name">${H.escapeHtml(animal.nombre)}</div>
              <div class="animal-species">${H.escapeHtml(animal.especie)}</div>
            </div>
            <div style="margin-top: 12px;">
              <button class="btn btn-primary btn-sm" style="width:100%;">📖 Ver Libro de Entrenamientos</button>
            </div>
          </div>
        </div>
      `);
    }

    const cardsHtml = cards.length > 0 ? cards.join('') : '<p class="text-muted" style="grid-column:1/-1;">No hay animales en este departamento.</p>';
    const speciesList = [...new Set(animals.map(a => a.especie).filter(Boolean))].sort();

    app.innerHTML = `
      ${UI.renderHeader(`${dept.name} · Entrenamientos`, `/dept/${deptId}`)}
      ${UI.renderBreadcrumbs([
      { label: 'Inicio', path: '/menu' },
      { label: dept.name, path: `/dept/${deptId}` },
      { label: 'Entrenamientos' },
    ])}
      <main class="main-content">
        <div class="modern-training-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <h2 class="modern-training-title">🎯 Selecciona un Animal</h2>
          <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
            ${App.ExportHeader.renderExportActions({
              exportHandlerGlobal: `App.Views.exportSectionData('trainings', '${deptId}', '%FORMAT%')`,
              printHandlerGlobal: `App.Views.printSectionData('trainings', '${deptId}')`
            })}
          </div>
        </div>

        ${App.UI.renderAdvancedFilterBar({
          animals: (animals || []).map(a => ({ id: a.id, nombre: a.nombre })),
          selectedAnimalId: activeSectionFilters.animalId,
          selectedPeriod: activeSectionFilters.period,
          startDate: activeSectionFilters.startDate,
          endDate: activeSectionFilters.endDate,
          onApplyGlobal: `App.Views.applySectionFilters('trainings', '${deptId}')`,
          onResetGlobal: `App.Views.resetSectionFilters('trainings', '${deptId}')`
        })}

        ${UI.renderSearchBar({
          searchId: 'training-search-input',
          filterId: 'training-species-select',
          placeholder: 'Buscar por nombre o especie...',
          filterOptions: speciesList,
          filterLabel: 'Todas las especies'
        })}

        <div class="animal-grid" id="training-animal-grid" style="margin-top:1.5rem;">
          ${cardsHtml}
        </div>
      </main>
    `;

    UI.initHeaderInteractions();

    const normalizeText = str => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const searchInput = document.getElementById('training-search-input');
    const speciesSelect = document.getElementById('training-species-select');

    const performFilter = () => {
      const query = searchInput ? searchInput.value.trim() : '';
      const term = normalizeText(query);
      const selectedSpecies = speciesSelect ? speciesSelect.value : '';

      const grid = document.getElementById('training-animal-grid');
      if (!grid) return;

      const cardsList = grid.querySelectorAll('.animal-card');
      let visibleCount = 0;

      cardsList.forEach(card => {
        const animalName = normalizeText(card.getAttribute('data-animal-name') || '');
        const animalSpeciesRaw = card.getAttribute('data-animal-species') || '';
        const animalSpeciesNorm = normalizeText(animalSpeciesRaw);

        const matchesQuery = !term || animalName.includes(term) || animalSpeciesNorm.includes(term);
        const matchesSpecies = !selectedSpecies || animalSpeciesRaw === selectedSpecies;

        if (matchesQuery && matchesSpecies) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      let noResultsEl = grid.querySelector('.no-training-results');
      if (visibleCount === 0) {
        if (!noResultsEl) {
          noResultsEl = document.createElement('div');
          noResultsEl.className = 'empty-state no-training-results';
          noResultsEl.style.gridColumn = '1/-1';
          noResultsEl.innerHTML = `
            <div class="empty-state-icon">🔍</div>
            <p class="empty-state-text">No se encontraron animales para la búsqueda realizada.</p>
          `;
          grid.appendChild(noResultsEl);
        } else {
          noResultsEl.style.display = '';
        }
      } else if (noResultsEl) {
        noResultsEl.style.display = 'none';
      }
    };

    if (searchInput) searchInput.addEventListener('input', performFilter);
    if (speciesSelect) speciesSelect.addEventListener('change', performFilter);
  }

  // ──────────────────────────────────────────────────────────
  // PESTAÑA DE ENTRENAMIENTOS — Libro Diario de Sesiones
  // ──────────────────────────────────────────────────────────

  const ATTITUDE_MAP = {
    'Excelente': { bg: '#dcfce7', color: '#16a34a', emoji: '✨' },
    'Bueno':     { bg: '#fef9c3', color: '#ca8a04', emoji: '🟢' },
    'Regular':   { bg: '#ffedd5', color: '#ea580c', emoji: '🟡' },
    'Mal':       { bg: '#fee2e2', color: '#dc2626', emoji: '🔴' },
  };

  function getAttitudeBadgeHtml(attitude) {
    const m = ATTITUDE_MAP[attitude] || { bg: '#f1f5f9', color: '#64748b', emoji: '📝' };
    return `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;font-size:0.8rem;font-weight:600;background:${m.bg};color:${m.color};">${m.emoji} ${attitude}</span>`;
  }

  async function renderTrainingTab(container, animal) {
    const { getTrainingSessions, deleteTrainingDay } = await import('../src/services/animalService.js?v=16');

    let sessions = [];
    try {
      sessions = await getTrainingSessions(animal.id, 200);
    } catch (err) {
      console.error('Error cargando sesiones de entrenamiento:', err);
    }

    // Agrupar por session_date
    const grouped = {};
    sessions.forEach(s => {
      const dateKey = s.session_date;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(s);
    });

    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    // Build attitude summary for today
    const todayStr = H.today();
    const todaySessions = grouped[todayStr] || [];
    const totalToday = todaySessions.length;
    const attCounts = { 'Excelente': 0, 'Bueno': 0, 'Regular': 0, 'Mal': 0 };
    todaySessions.forEach(s => { if (attCounts[s.attitude] !== undefined) attCounts[s.attitude]++; });

    const summaryHtml = `
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap:12px; margin-bottom:var(--sp-5);">
        <div style="background:var(--primary-50);padding:16px;border-radius:12px;text-align:center;">
          <div style="font-size:1.8rem;font-weight:800;color:var(--primary-600);">${totalToday}</div>
          <div style="font-size:0.75rem;color:var(--gray-500);margin-top:4px;">📋 Sesiones Hoy</div>
        </div>
        <div style="background:#dcfce7;padding:16px;border-radius:12px;text-align:center;">
          <div style="font-size:1.8rem;font-weight:800;color:#16a34a;">${attCounts['Excelente']}</div>
          <div style="font-size:0.75rem;color:var(--gray-500);margin-top:4px;">✨ Excelente</div>
        </div>
        <div style="background:#fef9c3;padding:16px;border-radius:12px;text-align:center;">
          <div style="font-size:1.8rem;font-weight:800;color:#ca8a04;">${attCounts['Bueno']}</div>
          <div style="font-size:0.75rem;color:var(--gray-500);margin-top:4px;">🟢 Bueno</div>
        </div>
        <div style="background:#ffedd5;padding:16px;border-radius:12px;text-align:center;">
          <div style="font-size:1.8rem;font-weight:800;color:#ea580c;">${attCounts['Regular']}</div>
          <div style="font-size:0.75rem;color:var(--gray-500);margin-top:4px;">🟡 Regular</div>
        </div>
        <div style="background:#fee2e2;padding:16px;border-radius:12px;text-align:center;">
          <div style="font-size:1.8rem;font-weight:800;color:#dc2626;">${attCounts['Mal']}</div>
          <div style="font-size:0.75rem;color:var(--gray-500);margin-top:4px;">🔴 Mal</div>
        </div>
      </div>
    `;

    // Build day blocks
    let historyHtml = '';
    if (sortedDates.length === 0) {
      historyHtml = `
        <div style="text-align:center; padding:3rem; color:var(--gray-500);">
          <div style="font-size:3rem; margin-bottom:1rem;">🎯</div>
          <p>No hay sesiones de entrenamiento registradas.</p>
          <p style="font-size:0.85rem; margin-top:0.5rem;">Pulsa "+ Nuevo Día" para empezar.</p>
        </div>`;
    } else {
      sortedDates.forEach(dateStr => {
        const daySessions = grouped[dateStr];
        const isToday = dateStr === todayStr;
        const dateLabel = isToday ? `Hoy — ${H.formatDate(dateStr)}` : H.formatDate(dateStr);

        const sessionsCardsHtml = daySessions.map(s => `
          <div style="display:flex; align-items:flex-start; gap:12px; padding:12px; background:var(--gray-50); border-radius:10px; border-left:4px solid ${(ATTITUDE_MAP[s.attitude] || {color:'#94a3b8'}).color};">
            <div style="min-width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--primary-100);color:var(--primary-700);font-weight:800;font-size:0.85rem;">
              ${s.session_number}
            </div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:4px;">
                ${getAttitudeBadgeHtml(s.attitude)}
                ${s.trainer ? `<span style="font-size:0.8rem;color:var(--gray-600);">👤 ${H.escapeHtml(s.trainer)}</span>` : ''}
                ${s.enrichment ? `<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:12px;font-size:0.75rem;font-weight:600;background:#e0e7ff;color:#4338ca;">🧩 ${H.escapeHtml(s.enrichment)}</span>` : ''}
              </div>
              ${s.notes ? `<p style="font-size:0.85rem;color:var(--gray-700);margin:4px 0 0;line-height:1.4;">${H.escapeHtml(s.notes)}</p>` : ''}
            </div>
          </div>
        `).join('');

        historyHtml += `
          <div class="card" style="margin-bottom:var(--sp-4);">
            <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
              <div>
                <h3 style="margin:0;font-size:1rem;">📅 ${dateLabel}</h3>
                <span style="font-size:0.8rem;color:var(--gray-500);">${daySessions.length} sesión${daySessions.length > 1 ? 'es' : ''}</span>
              </div>
              <div style="display:flex;gap:6px;">
                <button class="btn btn-outline btn-sm" onclick="App.Views.openTrainingDayForm('${animal.id}', '${dateStr}')" title="Editar día">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="App.Views.deleteTrainingDayConfirm('${animal.id}', '${dateStr}')" title="Eliminar día">🗑️</button>
              </div>
            </div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:8px;">
              ${sessionsCardsHtml}
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = `
      <div class="card" style="margin-bottom:var(--sp-4);">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
          <h3>🎯 Libro de Entrenamientos</h3>
          <button class="btn btn-primary btn-sm" onclick="App.Views.openTrainingDayForm('${animal.id}')">+ Nuevo Día</button>
        </div>
        <div class="card-body">
          ${summaryHtml}
        </div>
      </div>
      ${historyHtml}
    `;
  }

  // ── Delete Training Day Confirm ──────────────────────────
  async function deleteTrainingDayConfirm(animalId, sessionDate) {
    UI.showConfirm(
      `¿Eliminar TODAS las sesiones del día ${H.formatDate(sessionDate)}? Esta acción no se puede deshacer.`,
      async () => {
        try {
          const { deleteTrainingDay } = await import('../src/services/animalService.js?v=16');
          await deleteTrainingDay(animalId, sessionDate);
          UI.showToast('Día de entrenamiento eliminado', 'success');
          App.Router.resolve();
        } catch (err) {
          UI.showToast('Error: ' + err.message, 'error');
        }
      },
      'Eliminar Día'
    );
  }

  // ── Training Day Form (Multi-session) ────────────────────
  async function openTrainingDayForm(animalId, editDate = null) {
    const { getTrainingSessions, createTrainingSessions, deleteTrainingDay } = await import('../src/services/animalService.js?v=16');

    const isEdit = !!editDate;
    let existingSessions = [];

    if (isEdit) {
      try {
        const all = await getTrainingSessions(animalId, 200);
        existingSessions = all.filter(s => s.session_date === editDate);
      } catch (err) {
        console.error('Error cargando sesiones para editar:', err);
      }
    }

    const defaultCount = isEdit ? Math.max(existingSessions.length, 4) : 4;
    const dateValue = editDate || H.today();

    const ATTITUDES = [
      { value: 'Excelente', emoji: '✨', label: 'Excelente' },
      { value: 'Bueno', emoji: '🟢', label: 'Bueno' },
      { value: 'Regular', emoji: '🟡', label: 'Regular' },
      { value: 'Mal', emoji: '🔴', label: 'Mal' },
    ];

    function buildSessionBlock(index, data = {}) {
      const attOptions = `<option value="">- Seleccionar -</option>` + ATTITUDES.map(a =>
        `<option value="${a.value}" ${(data.attitude === a.value) ? 'selected' : ''}>${a.emoji} ${a.label}</option>`
      ).join('');

      return `
        <div class="training-session-block" data-session-index="${index}" style="background:var(--gray-50);border-radius:12px;padding:16px;border-left:4px solid var(--primary-400);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-weight:700;color:var(--primary-700);font-size:0.9rem;">Sesión ${index + 1}</span>
            <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('.training-session-block').remove()" style="padding:2px 8px;font-size:0.75rem;">✕</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:12px;">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" style="font-size:0.8rem;">Actitud</label>
              <select class="form-select ts-attitude" style="font-size:0.85rem;">${attOptions}</select>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" style="font-size:0.8rem;">Entrenador</label>
              <input class="form-input ts-trainer" type="text" value="${H.escapeHtml(data.trainer || '')}" placeholder="Ej: Manu" style="font-size:0.85rem;">
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" style="font-size:0.8rem;">Enriquecimiento</label>
              <input class="form-input ts-enrichment" type="text" value="${H.escapeHtml(data.enrichment || '')}" placeholder="Ej: Sí — bola de hielo" style="font-size:0.85rem;">
            </div>
            <div class="form-group" style="margin-bottom:0; grid-column: 1 / -1;">
              <label class="form-label" style="font-size:0.8rem;">Observaciones</label>
              <textarea class="form-textarea ts-notes" rows="1" placeholder="Qué se trabajó en esta sesión..." style="font-size:0.85rem;">${H.escapeHtml(data.notes || '')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    let initialBlocks = '';
    for (let i = 0; i < defaultCount; i++) {
      const data = existingSessions[i] || {};
      initialBlocks += buildSessionBlock(i, data);
    }

    const formHtml = `
      <form id="training-day-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="ts-date">Fecha *</label>
          <input class="form-input" type="date" id="ts-date" value="${dateValue}" required ${isEdit ? 'readonly' : ''}>
        </div>
        <div id="ts-sessions-container" style="display:flex;flex-direction:column;gap:12px;margin-top:var(--sp-3);">
          ${initialBlocks}
        </div>
        <button type="button" id="ts-add-session-btn" style="margin-top:12px;width:100%;padding:10px;border:2px dashed var(--primary-300);border-radius:10px;background:transparent;color:var(--primary-600);font-weight:600;cursor:pointer;font-size:0.9rem;transition:background 0.2s;" 
          onmouseover="this.style.background='var(--primary-50)'" 
          onmouseout="this.style.background='transparent'">
          + Añadir Sesión
        </button>
      </form>
    `;

    UI.showModal({
      title: isEdit ? `📝 Editar Día — ${H.formatDate(editDate)}` : '+ Nuevo Día de Entrenamiento',
      contentHtml: formHtml,
      saveLabel: isEdit ? 'Actualizar' : 'Guardar',
      modalClass: 'modal-xl',
      onSave: async () => {
        const fecha = document.getElementById('ts-date')?.value;
        if (!fecha) { UI.showToast('La fecha es obligatoria', 'error'); return; }

        const blocks = document.querySelectorAll('.training-session-block');
        const sessionsData = [];

        blocks.forEach(block => {
          const attitude = block.querySelector('.ts-attitude')?.value || '';
          const trainer = block.querySelector('.ts-trainer')?.value?.trim() || '';
          const enrichment = block.querySelector('.ts-enrichment')?.value?.trim() || '';
          const notes = block.querySelector('.ts-notes')?.value?.trim() || '';

          // Only include sessions that have at least some data filled
          if (attitude || trainer || enrichment || notes) {
            sessionsData.push({ attitude, trainer, enrichment, notes });
          }
        });

        if (sessionsData.length === 0) {
          UI.showToast('Debes rellenar al menos una sesión', 'error');
          return;
        }

        try {
          // If editing, delete old sessions first then re-insert
          if (isEdit) {
            await deleteTrainingDay(animalId, editDate);
          }
          await createTrainingSessions(animalId, fecha, sessionsData);
          UI.showToast(isEdit ? 'Día actualizado correctamente' : `${sessionsData.length} sesiones guardadas`, 'success');
          UI.closeModal();
          App.Router.resolve();
        } catch (err) {
          UI.showToast('Error: ' + err.message, 'error');
        }
      },
    });

    // Attach add session button
    setTimeout(() => {
      const addBtn = document.getElementById('ts-add-session-btn');
      const containerEl = document.getElementById('ts-sessions-container');
      if (addBtn && containerEl) {
        addBtn.addEventListener('click', () => {
          const currentCount = containerEl.querySelectorAll('.training-session-block').length;
          const div = document.createElement('div');
          div.innerHTML = buildSessionBlock(currentCount, {});
          containerEl.appendChild(div.firstElementChild);
        });
      }
    }, 100);
  }

  async function openTrainingForm(animalId, deptId, recordId = null) {
    const { getRecordById, createSupabaseRecord, updateSupabaseRecord, getTrainingRecords, getAnimals } = await import('../src/services/animalService.js?v=16');

    const isEdit = !!recordId;
    let defaults = { date: H.today(), result: 'Excelente', behavior: '', observations: '', numero_sesion: 1, animal_id: animalId || '' };

    let animalsList = [];
    if (!animalId) {
      try {
        const { data } = await getAnimals({ departamentoId: deptId });
        animalsList = data || [];
      } catch (err) {
        console.error('Error cargando animales:', err);
      }
    }

    if (isEdit) {
      try {
        const existing = await getRecordById('trainings', recordId);
        if (existing) {
          defaults = {
            date: existing.date || H.today(),
            result: existing.result || 'Excelente',
            behavior: existing.behavior || '',
            observations: existing.observations || '',
            numero_sesion: existing.numero_sesion || 1,
            animal_id: existing.animal_id || defaults.animal_id,
          };
        }
      } catch (err) {
        console.error('Error al cargar entrenamiento:', err);
      }
    } else if (animalId) {
      try {
        const records = await getTrainingRecords(animalId, 50);
        const todayStr = H.today();
        const todayRecords = records.filter(r => r.fecha === todayStr);
        if (todayRecords.length > 0) {
          const maxSession = Math.max(...todayRecords.map(r => r.numero_sesion || 1));
          defaults.numero_sesion = maxSession + 1;
        }
      } catch(err) {
        console.error('Error calculando sesión:', err);
      }
    }

    const ATTITUDE_OPTIONS = [
      { value: 'Excelente', emoji: '✨', label: 'Excelente' },
      { value: 'Bueno', emoji: '🟢', label: 'Bueno' },
      { value: 'Regular', emoji: '🟡', label: 'Regular' },
      { value: 'Mal', emoji: '🟠', label: 'Mal' },
      { value: 'Muy Mal', emoji: '🔴', label: 'Muy Mal' },
    ];

    const animalSelectHtml = !animalId && !isEdit ? `
      <div class="form-group">
        <label class="form-label" for="leo-training-animal">Animal *</label>
        <select class="form-select" id="leo-training-animal" required>
          <option value="">Selecciona un animal...</option>
          ${animalsList.map(a => `<option value="${a.id}">${H.escapeHtml(a.nombre)}</option>`).join('')}
        </select>
      </div>
    ` : '';

    const formHtml = `
      <form id="record-form" novalidate>
        ${animalSelectHtml}
        <div class="form-row" style="display:flex;gap:var(--sp-4);">
          <div class="form-group" style="flex:2;">
            <label class="form-label" for="leo-training-fecha">Fecha *</label>
            <input class="form-input" type="date" id="leo-training-fecha" value="${defaults.date}" required>
          </div>
          <div class="form-group" style="flex:1;">
            <label class="form-label" for="leo-training-session">Nº Sesión</label>
            <input class="form-input" type="number" id="leo-training-session" value="${defaults.numero_sesion}" min="1" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="leo-training-actitud">Actitud *</label>
          <select class="form-select" id="leo-training-actitud" required>
            ${ATTITUDE_OPTIONS.map(opt => `
              <option value="${opt.value}" ${defaults.result === opt.value ? 'selected' : ''}>
                ${opt.emoji} ${opt.label}
              </option>
            `).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="leo-training-entrenador">Entrenador(es)</label>
          <input class="form-input" type="text" id="leo-training-entrenador" 
            value="${H.escapeHtml(defaults.behavior)}" 
            placeholder="Ej: Carlos M., Ana R.">
        </div>
        <div class="form-group">
          <label class="form-label" for="leo-training-obs">Sesión / Observaciones</label>
          <textarea class="form-textarea" id="leo-training-obs" rows="4"
            placeholder="Descripción de la sesión de entrenamiento...">${H.escapeHtml(defaults.observations)}</textarea>
        </div>
      </form>
    `;

    UI.showModal({
      title: isEdit ? '📝 Editar Entrenamiento' : '+ Registrar Entrenamiento',
      contentHtml: formHtml,
      saveLabel: isEdit ? 'Actualizar' : 'Guardar',
      onSave: async () => {
        const fecha = document.getElementById('leo-training-fecha')?.value;
        if (!fecha) { UI.showToast('La fecha es obligatoria', 'error'); return; }
        
        let finalAnimalId = animalId || defaults.animal_id;
        if (!animalId && !isEdit) {
          const selectEl = document.getElementById('leo-training-animal');
          finalAnimalId = selectEl ? selectEl.value : '';
          if (!finalAnimalId) {
            UI.showToast('Debes seleccionar un animal', 'error');
            return;
          }
        }

        const data = {
          date: fecha,
          numero_sesion: parseInt(document.getElementById('leo-training-session')?.value || '1', 10),
          result: document.getElementById('leo-training-actitud')?.value || 'Excelente',
          behavior: document.getElementById('leo-training-entrenador')?.value || '',
          observations: document.getElementById('leo-training-obs')?.value || '',
          animal_id: finalAnimalId,
        };

        try {
          if (isEdit) {
            await updateSupabaseRecord('trainings', recordId, data);
            UI.showToast('Entrenamiento actualizado', 'success');
          } else {
            await createSupabaseRecord('trainings', data);
            UI.showToast('Entrenamiento registrado', 'success');
          }
          UI.closeModal();
          App.Router.resolve();
        } catch (err) {
          UI.showToast('Error: ' + err.message, 'error');
        }
      },
    });
  }

  async function openRecordForm(type, animalId, recordId = null) {
    const fields = H.FORM_FIELDS[type];
    if (!fields) return;

    const isEdit = !!recordId;
    const section = H.getSectionMeta(type);
    let existingData = {};

    const { getRecordById, updateSupabaseRecord, createSupabaseRecord } = await import('../src/services/animalService.js?v=16');

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

    const { deleteSupabaseRecord } = await import('../src/services/animalService.js?v=16');
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

    const { getAnimalById, createAnimal, updateAnimal, uploadAnimalPhoto } = await import('../src/services/animalService.js?v=16');

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
    const { getAnimalById, deleteAnimal: deleteSupabaseAnimal } = await import('../src/services/animalService.js?v=16');

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

  // ──────────────────────────────────────────────────────────
  // PESOS GENERALES (DASHBOARD)
  // ──────────────────────────────────────────────────────────
  async function renderGlobalWeightsDashboard(params) {
    const { deptId } = params;
    const dept = H.getDeptMeta(deptId);
    const app = document.getElementById('app');

    const { getAllWeightRecords, getAnimals } = await import('../src/services/animalService.js?v=16');
    
    let animalMap = {};
    let animalAvatars = {};
    let animalSpecies = {};
    let weightsData = [];

    try {
      const records = await getAllWeightRecords(deptId);
      const { data: animals } = await getAnimals({ departamentoId: deptId });
      
      for (const a of (animals || [])) {
        animalMap[a.id] = a.nombre;
        animalSpecies[a.id] = a.especie;
        animalAvatars[a.id] = a.foto_url || await App.Photos.getPhotoUrl(a.id, a.especie);
        
        // Find weights for this animal
        const animalWeights = records.filter(r => r.animal_id === a.id);
        
        if (animalWeights.length > 0) {
          const latest = animalWeights[0];
          const previous = animalWeights.length > 1 ? animalWeights[1] : null;
          
          let trend = 'same'; // same, up, down
          let trendDiff = 0;
          if (previous && latest.weight_kg !== undefined && previous.weight_kg !== undefined) {
            trendDiff = (latest.weight_kg - previous.weight_kg);
            if (trendDiff > 0) trend = 'up';
            else if (trendDiff < 0) trend = 'down';
          }

          weightsData.push({
            animalId: a.id,
            name: a.nombre,
            species: a.especie,
            avatar: animalAvatars[a.id],
            latestWeight: latest.weight_kg,
            date: latest.date,
            trend: trend,
            trendDiff: trendDiff,
            observations: latest.observations,
            totalRecords: animalWeights.length
          });
        }
      }
    } catch (err) {
      console.error('Error cargando pesos globales:', err);
    }

    // Ordenar por nombre de animal y obtener lista de especies únicas
    weightsData.sort((a, b) => a.name.localeCompare(b.name));
    const speciesList = [...new Set(weightsData.map(d => d.species).filter(Boolean))].sort();

    const getTrendBadge = (trend, diff) => {
      if (trend === 'up') return `<span class="badge" style="background:#ecfdf5;color:#059669;gap:4px;">↗ ${Math.abs(diff).toFixed(2)}kg</span>`;
      if (trend === 'down') return `<span class="badge" style="background:#fef2f2;color:#dc2626;gap:4px;">↘ ${Math.abs(diff).toFixed(2)}kg</span>`;
      if (trend === 'same' && diff !== null) return `<span class="badge" style="background:#f1f5f9;color:#64748b;gap:4px;">— 0kg</span>`;
      return '<span style="color:var(--gray-400);font-size:0.8rem;">—</span>';
    };

    let tableHtml = '';
    if (weightsData.length === 0) {
      tableHtml = `
        <div style="text-align:center; padding: 3rem; color:var(--gray-500);">
          <div style="font-size:3rem; margin-bottom:1rem;">⚖️</div>
          <p>No hay registros de peso todavía para este departamento.</p>
        </div>`;
    } else {
      const rows = weightsData.map(data => {
        return `
          <tr class="weight-row" data-animal-name="${H.escapeHtml(data.name)}" data-animal-species="${H.escapeHtml(data.species)}">
            <td style="padding:12px 16px;">
              <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:40px; height:40px; border-radius:10px; overflow:hidden; background:var(--gray-100); flex-shrink:0;">
                  <img src="${data.avatar}" alt="${data.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='${H.getDefaultPhotoSvg(data.species)}'">
                </div>
                <div>
                  <div style="font-weight:600; color:var(--gray-900); font-size:0.95rem;">${data.name}</div>
                  <div style="font-size:0.75rem; color:var(--gray-500);">${data.species}</div>
                </div>
              </div>
            </td>
            <td style="padding:12px 16px; font-weight:700; color:var(--gray-800); font-size:1.05rem;">
              ${data.latestWeight ? parseFloat(Number(data.latestWeight).toFixed(2)) + ' kg' : '—'}
            </td>
            <td style="padding:12px 16px; font-size:0.85rem; color:var(--gray-600);">
              ${H.formatDate(data.date)}
            </td>
            <td style="padding:12px 16px;">
              ${getTrendBadge(data.trend, data.trendDiff)}
            </td>
            <td style="padding:12px 16px; font-size:0.85rem; color:var(--gray-600); max-width:250px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${H.escapeHtml(data.observations || '—')}
            </td>
            <td style="padding:12px 16px; text-align:right;">
              <button class="btn btn-ghost" onclick="App.Router.navigate('/animal/${data.animalId}/weights')" style="font-size:0.85rem; padding:6px 12px; height:auto; color:var(--primary-600); font-weight:600; background:var(--primary-50);">
                Historial ➔
              </button>
            </td>
          </tr>
        `;
      }).join('');

      tableHtml = `
        <div class="table-container">
          <table class="table" style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="border-bottom: 2px solid var(--gray-200); background:var(--gray-50);">
                <th style="padding:12px 16px; text-align:left; font-size:0.75rem; text-transform:uppercase; color:var(--gray-500); width:250px;">Animal</th>
                <th style="padding:12px 16px; text-align:left; font-size:0.75rem; text-transform:uppercase; color:var(--gray-500);">Último Peso</th>
                <th style="padding:12px 16px; text-align:left; font-size:0.75rem; text-transform:uppercase; color:var(--gray-500);">Fecha</th>
                <th style="padding:12px 16px; text-align:left; font-size:0.75rem; text-transform:uppercase; color:var(--gray-500);">Tendencia</th>
                <th style="padding:12px 16px; text-align:left; font-size:0.75rem; text-transform:uppercase; color:var(--gray-500);">Observaciones</th>
                <th style="padding:12px 16px; text-align:right; font-size:0.75rem; text-transform:uppercase; color:var(--gray-500); width:150px;">Acción</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      `;
    }

    app.innerHTML = `
      ${UI.renderHeader(`${dept.name} — Pesos (Dashboard)`, `/dept/${deptId}`)}
      ${UI.renderBreadcrumbs([
        { label: 'Inicio', path: '/menu' },
        { label: dept.name, path: `/dept/${deptId}` },
        { label: 'Pesos (Dashboard)' },
      ])}
      <main class="main-content">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <h2>⚖️ Dashboard de Pesos — ${dept.name}</h2>
          <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
            ${App.ExportHeader.renderExportActions({
              exportHandlerGlobal: `App.Views.exportSectionData('weights', '${deptId}', '%FORMAT%')`,
              printHandlerGlobal: `App.Views.printSectionData('weights', '${deptId}')`
            })}
            <button class="btn btn-primary" onclick="App.Views.openDeptRecordForm('weights', '${deptId}')">+ Nuevo Registro</button>
          </div>
        </div>

        ${App.UI.renderAdvancedFilterBar({
          animals: (weightsData || []).map(a => ({ id: a.animalId, nombre: a.name })),
          selectedAnimalId: activeSectionFilters.animalId,
          selectedPeriod: activeSectionFilters.period,
          startDate: activeSectionFilters.startDate,
          endDate: activeSectionFilters.endDate,
          onApplyGlobal: `App.Views.applySectionFilters('weights', '${deptId}')`,
          onResetGlobal: `App.Views.resetSectionFilters('weights', '${deptId}')`
        })}
        
        ${UI.renderSearchBar({
          searchId: 'weight-search-input',
          filterId: 'weight-species-select',
          placeholder: 'Buscar por nombre o especie...',
          filterOptions: speciesList,
          filterLabel: 'Todas las especies'
        })}

        <div class="card" style="margin-top:var(--sp-4);">
          <div class="card-body" style="padding:0;">
            ${tableHtml}
          </div>
        </div>
      </main>
    `;

    UI.initHeaderInteractions();

    const normalizeText = str => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const searchInput = document.getElementById('weight-search-input');
    const speciesSelect = document.getElementById('weight-species-select');

    const performFilter = () => {
      const query = searchInput ? searchInput.value.trim() : '';
      const term = normalizeText(query);
      const selectedSpecies = speciesSelect ? speciesSelect.value : '';

      const tbody = document.querySelector('.table tbody');
      if (!tbody) return;

      const trs = tbody.querySelectorAll('tr.weight-row');
      let visibleCount = 0;

      trs.forEach(tr => {
        const animalName = normalizeText(tr.getAttribute('data-animal-name') || '');
        const animalSpeciesRaw = tr.getAttribute('data-animal-species') || '';
        const animalSpeciesNorm = normalizeText(animalSpeciesRaw);

        const matchesQuery = !term || animalName.includes(term) || animalSpeciesNorm.includes(term);
        const matchesSpecies = !selectedSpecies || animalSpeciesRaw === selectedSpecies;

        if (matchesQuery && matchesSpecies) {
          tr.style.display = '';
          visibleCount++;
        } else {
          tr.style.display = 'none';
        }
      });

      let noResultsTr = tbody.querySelector('.no-weight-results-row');
      if (visibleCount === 0) {
        if (!noResultsTr) {
          noResultsTr = document.createElement('tr');
          noResultsTr.className = 'no-weight-results-row';
          noResultsTr.innerHTML = `
            <td colspan="6" style="padding: 2.5rem; text-align: center; color: var(--gray-500);">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
              <p style="font-weight: 500;">No se encontraron resultados.</p>
            </td>
          `;
          tbody.appendChild(noResultsTr);
        } else {
          noResultsTr.style.display = '';
        }
      } else if (noResultsTr) {
        noResultsTr.style.display = 'none';
      }
    };

    if (searchInput) searchInput.addEventListener('input', performFilter);
    if (speciesSelect) speciesSelect.addEventListener('change', performFilter);
  }

  // ──────────────────────────────────────────────────────────
  // DIETAS GENERALES (DASHBOARD)
  // ──────────────────────────────────────────────────────────
  async function renderGlobalDietsDashboard(params) {
    const { deptId } = params;
    const dept = H.getDeptMeta(deptId);
    const app = document.getElementById('app');

    const { getAllDietRecords, getAnimals } = await import('../src/services/animalService.js?v=16');
    
    let animalMap = {};
    let animalAvatars = {};
    let animalSpecies = {};
    let dietsData = [];
    let animals = [];

    try {
      const records = await getAllDietRecords(deptId);
      const res = await getAnimals({ departamentoId: deptId });
      animals = res.data || [];
      
      for (const a of (animals || [])) {
        animalMap[a.id] = a.nombre;
        animalSpecies[a.id] = a.especie;
        animalAvatars[a.id] = a.foto_url || await App.Photos.getPhotoUrl(a.id, a.especie);
        
        // Find diets for this animal
        const animalDiets = records.filter(r => r.animal_id === a.id);
        
        if (animalDiets.length > 0) {
          const latest = animalDiets[0];
          const previous = animalDiets.length > 1 ? animalDiets[1] : null;
          
          let trend = 'same'; // same, up, down
          let trendDiff = 0;
          let latestQty = parseFloat(latest.dieta_total || latest.quantity);
          let previousQty = previous ? parseFloat(previous.dieta_total || previous.quantity) : null;

          if (!isNaN(latestQty) && previousQty !== null && !isNaN(previousQty)) {
            trendDiff = (latestQty - previousQty);
            if (trendDiff > 0) trend = 'up';
            else if (trendDiff < 0) trend = 'down';
          } else {
            trendDiff = null;
          }

          const fmtVal = val => val ? Math.round((parseFloat(val) + Number.EPSILON) * 100) / 100 : val;
          let displayFood = deptId === 'leones' ? (latest.dieta_total ? `${fmtVal(latest.dieta_total)} kg (Total)` : '—') : (latest.quantity ? `${fmtVal(latest.quantity)} (${latest.food_type})` : (latest.food_type || '—'));

          dietsData.push({
            animalId: a.id,
            name: a.nombre,
            species: a.especie,
            avatar: animalAvatars[a.id],
            latestFood: displayFood,
            date: latest.date,
            trend: trend,
            trendDiff: trendDiff,
            observations: latest.observations,
            totalRecords: animalDiets.length
          });
        }
      }
    } catch (err) {
      console.error('Error cargando dietas globales:', err);
    }

    // Ordenar por nombre de animal y obtener especies únicas para el selector
    dietsData.sort((a, b) => a.name.localeCompare(b.name));
    const speciesList = [...new Set(dietsData.map(d => d.species).filter(Boolean))].sort();

    const getTrendBadge = (trend, diff) => {
      if (diff === null) return '<span style="color:var(--gray-400);font-size:0.8rem;">—</span>';
      if (trend === 'up') return `<span class="badge" style="background:#ecfdf5;color:#059669;gap:4px;">↗ ${Math.abs(diff).toFixed(2)}</span>`;
      if (trend === 'down') return `<span class="badge" style="background:#fef2f2;color:#dc2626;gap:4px;">↘ ${Math.abs(diff).toFixed(2)}</span>`;
      if (trend === 'same') return `<span class="badge" style="background:#f1f5f9;color:#64748b;gap:4px;">— 0</span>`;
      return '<span style="color:var(--gray-400);font-size:0.8rem;">—</span>';
    };

    let tableHtml = '';
    if (dietsData.length === 0) {
      tableHtml = `
        <div style="text-align:center; padding: 3rem; color:var(--gray-500);">
          <div style="font-size:3rem; margin-bottom:1rem;">🐟</div>
          <p>No hay registros de dieta todavía para este departamento.</p>
        </div>`;
    } else {
      const rows = dietsData.map(data => {
        return `
          <tr class="diet-row" data-animal-name="${H.escapeHtml(data.name)}" data-animal-species="${H.escapeHtml(data.species)}">
            <td style="padding:12px 16px;">
              <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:40px; height:40px; border-radius:10px; overflow:hidden; background:var(--gray-100); flex-shrink:0;">
                  <img src="${data.avatar}" alt="${data.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='${H.getDefaultPhotoSvg(data.species)}'">
                </div>
                <div>
                  <div style="font-weight:600; color:var(--gray-900); font-size:0.95rem;">${data.name}</div>
                  <div style="font-size:0.75rem; color:var(--gray-500);">${data.species}</div>
                </div>
              </div>
            </td>
            <td style="padding:12px 16px; font-weight:700; color:var(--gray-800); font-size:1.05rem;">
              ${data.latestFood || '—'}
            </td>
            <td style="padding:12px 16px; font-size:0.85rem; color:var(--gray-600);">
              ${H.formatDate(data.date)}
            </td>
            <td style="padding:12px 16px;">
              ${getTrendBadge(data.trend, data.trendDiff)}
            </td>
            <td style="padding:12px 16px; font-size:0.85rem; color:var(--gray-600); max-width:250px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${H.escapeHtml(data.observations || '—')}
            </td>
            <td style="padding:12px 16px; text-align:right;">
              <button class="btn btn-ghost" onclick="App.Router.navigate('/animal/${data.animalId}/diets')" style="font-size:0.85rem; padding:6px 12px; height:auto; color:var(--primary-600); font-weight:600; background:var(--primary-50);">
                Historial ➔
              </button>
            </td>
          </tr>
        `;
      }).join('');

      tableHtml = `
        <div class="table-container">
          <table class="table" style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="border-bottom: 2px solid var(--gray-200); background:var(--gray-50);">
                <th style="padding:12px 16px; text-align:left; font-size:0.75rem; text-transform:uppercase; color:var(--gray-500); width:250px;">Animal</th>
                <th style="padding:12px 16px; text-align:left; font-size:0.75rem; text-transform:uppercase; color:var(--gray-500);">Última Dieta</th>
                <th style="padding:12px 16px; text-align:left; font-size:0.75rem; text-transform:uppercase; color:var(--gray-500);">Fecha</th>
                <th style="padding:12px 16px; text-align:left; font-size:0.75rem; text-transform:uppercase; color:var(--gray-500);">Tendencia</th>
                <th style="padding:12px 16px; text-align:left; font-size:0.75rem; text-transform:uppercase; color:var(--gray-500);">Observaciones</th>
                <th style="padding:12px 16px; text-align:right; font-size:0.75rem; text-transform:uppercase; color:var(--gray-500); width:150px;">Acción</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      `;
    }

    // Leones Marinos uses openDietAnimalSelector, other depts might just use openDeptRecordForm('diets')
    let createBtnAction = deptId === 'leones' 
      ? `App.Views.openDietAnimalSelector('${deptId}')`
      : `App.Views.openDeptRecordForm('diets', '${deptId}')`;

    app.innerHTML = `
      ${UI.renderHeader(`${dept.name} — Dietas (Dashboard)`, `/dept/${deptId}`)}
      ${UI.renderBreadcrumbs([
        { label: 'Inicio', path: '/menu' },
        { label: dept.name, path: `/dept/${deptId}` },
        { label: 'Dietas (Dashboard)' },
      ])}
      <main class="main-content">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <h2>🐟 Dashboard de Dietas — ${dept.name}</h2>
          <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
            ${App.ExportHeader.renderExportActions({
              exportHandlerGlobal: `App.Views.exportSectionData('diets', '${deptId}', '%FORMAT%')`,
              printHandlerGlobal: `App.Views.printSectionData('diets', '${deptId}')`
            })}
            <button class="btn btn-primary" onclick="${createBtnAction}">+ Nuevo Registro</button>
          </div>
        </div>

        ${App.UI.renderAdvancedFilterBar({
          animals: (animals || []).map(a => ({ id: a.id, nombre: a.nombre })),
          selectedAnimalId: activeSectionFilters.animalId,
          selectedPeriod: activeSectionFilters.period,
          startDate: activeSectionFilters.startDate,
          endDate: activeSectionFilters.endDate,
          onApplyGlobal: `App.Views.applySectionFilters('diets', '${deptId}')`,
          onResetGlobal: `App.Views.resetSectionFilters('diets', '${deptId}')`
        })}
        
        ${UI.renderSearchBar({
          searchId: 'diet-search-input',
          filterId: 'diet-species-select',
          placeholder: 'Buscar por nombre o especie...',
          filterOptions: speciesList,
          filterLabel: 'Todas las especies'
        })}

        <div class="card" style="margin-top:var(--sp-4);">
          <div class="card-body" style="padding:0;">
            ${tableHtml}
          </div>
        </div>
      </main>
    `;

    UI.initHeaderInteractions();

    const normalizeText = str => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const searchInput = document.getElementById('diet-search-input');
    const speciesSelect = document.getElementById('diet-species-select');

    const performFilter = () => {
      const query = searchInput ? searchInput.value.trim() : '';
      const term = normalizeText(query);
      const selectedSpecies = speciesSelect ? speciesSelect.value : '';

      const tbody = document.querySelector('.table tbody');
      if (!tbody) return;

      const trs = tbody.querySelectorAll('tr.diet-row');
      let visibleCount = 0;

      trs.forEach(tr => {
        const animalName = normalizeText(tr.getAttribute('data-animal-name') || '');
        const animalSpeciesRaw = tr.getAttribute('data-animal-species') || '';
        const animalSpeciesNorm = normalizeText(animalSpeciesRaw);

        const matchesQuery = !term || animalName.includes(term) || animalSpeciesNorm.includes(term);
        const matchesSpecies = !selectedSpecies || animalSpeciesRaw === selectedSpecies;

        if (matchesQuery && matchesSpecies) {
          tr.style.display = '';
          visibleCount++;
        } else {
          tr.style.display = 'none';
        }
      });

      let noResultsTr = tbody.querySelector('.no-diet-results-row');
      if (visibleCount === 0) {
        if (!noResultsTr) {
          noResultsTr = document.createElement('tr');
          noResultsTr.className = 'no-diet-results-row';
          noResultsTr.innerHTML = `
            <td colspan="6" style="padding: 2.5rem; text-align: center; color: var(--gray-500);">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
              <p style="font-weight: 500;">No se encontraron resultados.</p>
            </td>
          `;
          tbody.appendChild(noResultsTr);
        } else {
          noResultsTr.style.display = '';
        }
      } else if (noResultsTr) {
        noResultsTr.style.display = 'none';
      }
    };

    if (searchInput) searchInput.addEventListener('input', performFilter);
    if (speciesSelect) speciesSelect.addEventListener('change', performFilter);
  }

  // ── Dept Record Form (with animal selector) ───────────────
  
  async function openDietAnimalSelector(deptId) {
    // 1. Mostrar estado de carga (Defensa y UX)
    UI.showModal({
      title: 'Registrar Dieta — Elegir Animal',
      contentHtml: `
        <div style="padding: 2rem; text-align: center;">
          <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
          <p>Cargando animales del departamento...</p>
        </div>
      `,
      saveLabel: 'Cargando...',
    });

    // 2. Deshabilitar botón de guardar mientras carga
    const modalSaveBtn = document.querySelector('.modal-footer .btn-primary');
    if (modalSaveBtn) modalSaveBtn.disabled = true;

    try {
      const { getAnimals } = await import('../src/services/animalService.js?v=16');
      const animalsResult = await getAnimals({ departamentoId: deptId });
      const animals = animalsResult?.data || [];

      // Si no hay animales en este departamento
      if (animals.length === 0) {
        UI.showModal({
          title: 'Registrar Dieta — Elegir Animal',
          contentHtml: '<p style="padding:1rem;">No hay animales registrados en este departamento.</p>',
          saveLabel: 'Cerrar',
          onSave: () => UI.closeModal()
        });
        return;
      }

      // 3. Renderizar el selector real
      const animalSelectHtml = `
        <div class="form-group" style="margin-top: 1rem;">
          <label class="form-label" for="diet-animal-selector">Selecciona un Animal para su Dieta</label>
          <select class="form-select" id="diet-animal-selector" style="font-size: 1.1rem; padding: 0.5rem;">
            <option value="">Seleccionar animal...</option>
            ${animals.map(a => `<option value="${a.id}">${H.escapeHtml(a.nombre || '')} — ${H.escapeHtml(a.especie || '')}</option>`).join('')}
          </select>
        </div>
      `;

      UI.showModal({
        title: 'Registrar Dieta — Elegir Animal',
        contentHtml: animalSelectHtml,
        saveLabel: 'Continuar',
        onSave: () => {
          const sel = document.getElementById('diet-animal-selector');
          if (!sel || !sel.value) {
            if (sel) sel.style.borderColor = 'var(--danger-500)';
            return;
          }
          UI.closeModal();
          // Encadenamiento opcional defensivo al enrutador
          App.Router?.navigate?.(`/animal/${sel.value}/diets`);
        }
      });
    } catch (err) {
      console.error('Error en openDietAnimalSelector:', err);
      UI.showModal({
        title: 'Error',
        contentHtml: `<p style="padding:1rem; color:var(--danger-500);">Error al cargar animales: ${err.message}</p>`,
        saveLabel: 'Cerrar',
        onSave: () => UI.closeModal()
      });
    }
  }

  async function openDeptRecordForm(type, deptId) {
    const { getAnimals, createSupabaseRecord } = await import('../src/services/animalService.js?v=16');

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

  // ══════════════════════════════════════════════════════════════
  //  HEALTH EVENTS TAB — Registro de eventos de salud
  // ══════════════════════════════════════════════════════════════

  const HEALTH_EVENT_TYPES = ['Tos', 'Vómito', 'Diarrea', 'Letargia', 'Herida', 'Otro'];

  const EVENT_TYPE_STYLES = {
    'Tos':      { bg: '#fef3c7', color: '#92400e', icon: '🤧' },
    'Vómito':   { bg: '#fee2e2', color: '#991b1b', icon: '🤮' },
    'Diarrea':  { bg: '#ffe4e6', color: '#9f1239', icon: '💊' },
    'Letargia': { bg: '#e0e7ff', color: '#3730a3', icon: '😴' },
    'Herida':   { bg: '#fce7f3', color: '#9d174d', icon: '🩹' },
    'Otro':     { bg: '#f3f4f6', color: '#374151', icon: '📋' },
  };

  function getEventTypeBadge(type) {
    const s = EVENT_TYPE_STYLES[type] || EVENT_TYPE_STYLES['Otro'];
    return `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:9999px;font-size:0.75rem;font-weight:600;background:${s.bg};color:${s.color};">${s.icon} ${H.escapeHtml(type)}</span>`;
  }

  function formatEventTime(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }

  async function renderHealthTab(container, animal) {
    const { getHealthEvents } = await import('../src/services/animalService.js?v=16');

    let events = [];
    try {
      events = await getHealthEvents(animal.id);
    } catch (err) {
      console.error('Error cargando eventos de salud:', err);
    }

    // Calcular total del día actual
    const todayStr = new Date().toISOString().split('T')[0];
    const todayEvents = events.filter(e => e.event_time && e.event_time.startsWith(todayStr));
    const todayTotal = todayEvents.reduce((sum, e) => sum + (parseInt(e.frequency) || 0), 0);

    // Agrupar eventos por día
    const groupedEvents = {};
    events.forEach(e => {
      const d = e.event_time ? new Date(e.event_time) : new Date();
      
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      
      const dateKey = `${yyyy}-${mm}-${dd}`;
      let dateDisplay = `${dd}/${mm}/${yyyy}`;
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const isToday = (d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear());
      const isYesterday = (d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear());
      
      if (isToday) dateDisplay = `Hoy - ${dateDisplay}`;
      else if (isYesterday) dateDisplay = `Ayer - ${dateDisplay}`;
      
      if (!groupedEvents[dateKey]) {
        groupedEvents[dateKey] = {
          display: dateDisplay,
          total: 0,
          events: []
        };
      }
      
      groupedEvents[dateKey].events.push(e);
      groupedEvents[dateKey].total += (parseInt(e.frequency) || 0);
    });

    // Ordenar días de forma descendente (más recientes primero)
    const sortedDays = Object.keys(groupedEvents).sort((a, b) => b.localeCompare(a));

    let htmlGroups = '';
    
    if (sortedDays.length === 0) {
      htmlGroups = `
        <div class="card" style="margin-top:var(--sp-4);">
          <div class="card-body" style="text-align:center;padding:2rem;color:var(--gray-400);font-size:0.9rem;">
            No hay eventos registrados. Pulsa el botón superior para añadir el primero.
          </div>
        </div>
      `;
    } else {
      sortedDays.forEach(day => {
        const group = groupedEvents[day];
        
        // Ordenar eventos dentro del día por hora descendente
        group.events.sort((a, b) => {
          const ta = a.event_time ? new Date(a.event_time).getTime() : 0;
          const tb = b.event_time ? new Date(b.event_time).getTime() : 0;
          return tb - ta;
        });

        const rows = group.events.map(e => {
          const d = e.event_time ? new Date(e.event_time) : new Date();
          const hh = String(d.getHours()).padStart(2, '0');
          const min = String(d.getMinutes()).padStart(2, '0');
          const timeStr = `${hh}:${min}`;

          return `
            <tr>
              <td style="white-space:nowrap;padding:12px 16px;font-size:0.85rem;color:var(--gray-700);font-weight:500;">${timeStr}</td>
              <td style="padding:12px 16px;">${getEventTypeBadge(e.event_type)}</td>
              <td style="padding:12px 16px;text-align:center;">
                <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:var(--primary-50);color:var(--primary-700);font-weight:700;font-size:0.9rem;">${e.frequency || 0}</span>
              </td>
              <td style="padding:12px 16px;font-size:0.85rem;color:var(--gray-600);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${H.escapeHtml(e.notes || '—')}</td>
              <td style="padding:12px 16px;white-space:nowrap;text-align:right;">
                <button class="btn btn-ghost btn-icon" onclick="App.Views.openHealthEventForm('${animal.id}', '${e.id}')" title="Editar">✏️</button>
                <button class="btn btn-ghost btn-icon" onclick="App.Views.deleteHealthEvent('${e.id}', '${animal.id}')" title="Eliminar">🗑️</button>
              </td>
            </tr>
          `;
        }).join('');

        htmlGroups += `
          <div class="card" style="margin-bottom:var(--sp-4); overflow:hidden;">
            <div style="background:var(--gray-50); padding:12px 16px; border-bottom:1px solid var(--gray-200); display:flex; justify-content:space-between; align-items:center;">
              <h4 style="margin:0; font-size:0.95rem; color:var(--gray-800); display:flex; align-items:center; gap:8px;">
                📅 <span>${group.display}</span>
              </h4>
              <span style="font-size:0.85rem; font-weight:600; color:var(--primary-700); background:var(--primary-50); padding:4px 10px; border-radius:9999px;">
                Total del día: ${group.total} episodios
              </span>
            </div>
            <div style="overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr style="border-bottom:1px solid var(--gray-200);">
                    <th style="padding:10px 16px;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600;width:80px;">Hora</th>
                    <th style="padding:10px 16px;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600;width:120px;">Tipo</th>
                    <th style="padding:10px 16px;text-align:center;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600;width:100px;">Frecuencia</th>
                    <th style="padding:10px 16px;text-align:left;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600;">Observaciones</th>
                    <th style="padding:10px 16px;text-align:right;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray-500);font-weight:600;width:100px;">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = `
      <!-- Contador destacado del día -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4);margin-bottom:var(--sp-4);">
        <div class="card" style="background:linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);border:none;">
          <div class="card-body" style="display:flex;align-items:center;gap:var(--sp-4);padding:var(--sp-4);">
            <div style="width:56px;height:56px;border-radius:16px;background:rgba(239,68,68,0.15);display:flex;align-items:center;justify-content:center;font-size:1.8rem;">🔴</div>
            <div>
              <div style="font-size:2rem;font-weight:800;color:#991b1b;line-height:1;">${todayTotal}</div>
              <div style="font-size:0.8rem;color:#b91c1c;font-weight:500;margin-top:2px;">Episodios hoy</div>
            </div>
          </div>
        </div>
        <div class="card" style="background:linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);border:none;">
          <div class="card-body" style="display:flex;align-items:center;gap:var(--sp-4);padding:var(--sp-4);">
            <div style="width:56px;height:56px;border-radius:16px;background:rgba(59,130,246,0.15);display:flex;align-items:center;justify-content:center;font-size:1.8rem;">📊</div>
            <div>
              <div style="font-size:2rem;font-weight:800;color:#1e40af;line-height:1;">${events.length}</div>
              <div style="font-size:0.8rem;color:#1d4ed8;font-weight:500;margin-top:2px;">Registros totales</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Historial de eventos agrupados -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--sp-4);">
        <h3 style="margin:0; font-size:1.25rem; color:var(--gray-800);">🩺 Historial de Eventos de Salud</h3>
        <button class="btn btn-primary btn-sm" onclick="App.Views.openHealthEventForm('${animal.id}')">+ Registrar Evento</button>
      </div>

      ${htmlGroups}
    `;
  }

  async function openHealthEventForm(animalId, eventId = null) {
    const { getHealthEvents, createHealthEvent, updateHealthEvent } = await import('../src/services/animalService.js?v=16');

    let defaults = {
      event_type: 'Tos',
      event_time: '',
      frequency: 1,
      notes: '',
    };
    let isEdit = false;

    if (eventId) {
      isEdit = true;
      try {
        const events = await getHealthEvents(animalId);
        const existing = events.find(e => e.id === eventId);
        if (existing) {
          defaults = {
            event_type: existing.event_type || 'Tos',
            event_time: existing.event_time ? existing.event_time.slice(0, 16) : '',
            frequency: existing.frequency || 1,
            notes: existing.notes || '',
          };
        }
      } catch (err) {
        console.error('Error cargando evento:', err);
      }
    }

    // Default: fecha/hora actual en formato datetime-local
    if (!defaults.event_time) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      defaults.event_time = now.toISOString().slice(0, 16);
    }

    const typeOptions = HEALTH_EVENT_TYPES.map(t =>
      `<option value="${t}" ${defaults.event_type === t ? 'selected' : ''}>${t}</option>`
    ).join('');

    const formHtml = `
      <form id="health-event-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="he-event-time">Fecha y Hora *</label>
          <input class="form-input" type="datetime-local" id="he-event-time" value="${defaults.event_time}" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="he-event-type">Tipo de Evento *</label>
          <select class="form-select" id="he-event-type" required>
            ${typeOptions}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="he-frequency">Frecuencia / Repeticiones *</label>
          <input class="form-input" type="number" id="he-frequency" value="${defaults.frequency}" min="1" step="1" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="he-notes">Observaciones</label>
          <textarea class="form-textarea" id="he-notes" placeholder="Notas sobre el episodio...">${H.escapeHtml(defaults.notes)}</textarea>
        </div>
      </form>
    `;

    UI.showModal({
      title: isEdit ? '✏️ Editar Evento de Salud' : '+ Registrar Evento de Salud',
      contentHtml: formHtml,
      saveLabel: isEdit ? 'Actualizar Evento' : 'Guardar Evento',
      onSave: async () => {
        const eventTime = document.getElementById('he-event-time')?.value;
        const eventType = document.getElementById('he-event-type')?.value;
        const frequency = document.getElementById('he-frequency')?.value;
        const notes = document.getElementById('he-notes')?.value;

        if (!eventTime) { UI.showToast('La fecha y hora son obligatorias', 'error'); return; }
        if (!frequency || parseInt(frequency) < 1) { UI.showToast('La frecuencia debe ser al menos 1', 'error'); return; }

        const record = {
          animal_id: animalId,
          event_type: eventType,
          event_time: new Date(eventTime).toISOString(),
          frequency: parseInt(frequency),
          notes: notes || '',
        };

        try {
          if (isEdit) {
            await updateHealthEvent(eventId, record);
            UI.showToast('Evento actualizado correctamente', 'success');
          } else {
            await createHealthEvent(record);
            UI.showToast('Evento registrado correctamente', 'success');
          }
          UI.closeModal();
          App.Router.resolve();
        } catch (err) {
          UI.showToast('Error: ' + err.message, 'error');
        }
      },
    });
  }

  async function deleteHealthEvent(eventId, animalId) {
    if (!confirm('¿Eliminar este evento de salud?')) return;

    const { deleteHealthEvent: delFn } = await import('../src/services/animalService.js?v=16');
    try {
      await delFn(eventId);
      UI.showToast('Evento eliminado', 'success');
      App.Router.resolve();
    } catch (err) {
      UI.showToast('Error: ' + err.message, 'error');
    }
  }

  // ── Enrichments Tab ───────────────────────────────────────
  async function renderEnrichmentsTab(container, animal) {
    const { getEnrichmentsByAnimal } = await import('../src/services/animalService.js?v=16');
    
    let records = [];
    try {
      records = await getEnrichmentsByAnimal(animal.id);
    } catch (e) {
      console.error('Error loading enrichments', e);
    }

    const html = `
      <div class="card">
        <div class="card-header">
          <h3>🧩 Enriquecimientos</h3>
          <p class="text-sm text-muted">Se registran automáticamente al añadir una Sesión de Entreno con enriquecimiento.</p>
        </div>
        <div class="card-body">
          ${records.length === 0 ? '<p class="text-muted">No hay enriquecimientos registrados para este animal.</p>' : `
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo de Enriquecimiento</th>
                    <th>Sesión</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${records.map(r => {
                    const match = r.observaciones?.match(/^Sesión (\d+)(?::\s*(.*))?$/);
                    const sesion = match ? match[1] : '—';
                    const obs = match ? (match[2] || '—') : (r.observaciones || '—');
                    return `
                    <tr>
                      <td>${H.formatDate(r.fecha)}</td>
                      <td>${H.escapeHtml(r.tipo_enriquecimiento || '—')}</td>
                      <td>${sesion}</td>
                      <td>${H.escapeHtml(obs)}</td>
                    </tr>
                    `
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
    container.innerHTML = html;
  }

  // ── Global Enrichments Dashboard ──────────────────────────────
  async function renderGlobalEnrichmentsDashboard(params) {
    const { deptId } = params;
    const dept = H.getDeptMeta(deptId);
    const app = document.getElementById('app');

    let records = [];
    let animals = [];
    let animalMap = {};

    try {
      const { getEnrichmentsByDept, getAnimals } = await import('../src/services/animalService.js?v=16');
      records = await getEnrichmentsByDept(deptId);
      const res = await getAnimals({ departamentoId: deptId });
      animals = res.data || [];
      (animals || []).forEach(a => animalMap[a.id] = a.nombre);
    } catch(e) {
      console.error('Error fetching global enrichments:', e);
    }

    app.innerHTML = `
      ${UI.renderHeader(`${dept.name} — Enriquecimientos`, `/dept/${deptId}`)}
      ${UI.renderBreadcrumbs([
        { label: 'Inicio', path: '/menu' },
        { label: dept.name, path: `/dept/${deptId}` },
        { label: 'Enriquecimientos' },
      ])}
      <main class="main-content">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div>
            <h2 class="modern-training-title">🧩 Enriquecimientos - Vista General</h2>
            <p class="text-sm text-muted" style="margin-top: 4px;">Mostrando registros procedentes de las sesiones de entreno.</p>
          </div>
          <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
            ${App.ExportHeader.renderExportActions({
              exportHandlerGlobal: `App.Views.exportSectionData('enrichments', '${deptId}', '%FORMAT%')`,
              printHandlerGlobal: `App.Views.printSectionData('enrichments', '${deptId}')`
            })}
          </div>
        </div>

        ${App.UI.renderAdvancedFilterBar({
          animals: (animals || []).map(a => ({ id: a.id, nombre: a.nombre })),
          selectedAnimalId: activeSectionFilters.animalId,
          selectedPeriod: activeSectionFilters.period,
          startDate: activeSectionFilters.startDate,
          endDate: activeSectionFilters.endDate,
          onApplyGlobal: `App.Views.applySectionFilters('enrichments', '${deptId}')`,
          onResetGlobal: `App.Views.resetSectionFilters('enrichments', '${deptId}')`
        })}
        <div id="global-enrichments-container">
          <div style="padding:40px;text-align:center;">Cargando registros...</div>
        </div>
      </main>
    `;

    try {
      const container = document.getElementById('global-enrichments-container');
      if (records.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay enriquecimientos registrados en este departamento.</p>';
        return;
      }

      container.innerHTML = `
        <div class="card">
          <div class="card-body">
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Animal</th>
                    <th>Tipo de Enriquecimiento</th>
                    <th>Sesión</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${records.map(r => {
                    const match = r.observaciones?.match(/^Sesión (\d+)(?::\s*(.*))?$/);
                    const sesion = match ? match[1] : '—';
                    const obs = match ? (match[2] || '—') : (r.observaciones || '—');
                    return `
                    <tr>
                      <td>${H.formatDate(r.fecha)}</td>
                      <td><strong>${H.escapeHtml(animalMap[r.animal_id] || 'Desconocido')}</strong></td>
                      <td>${H.escapeHtml(r.tipo_enriquecimiento || '—')}</td>
                      <td>${sesion}</td>
                      <td>${H.escapeHtml(obs)}</td>
                    </tr>
                    `
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      console.error('Error loading global enrichments:', err);
      document.getElementById('global-enrichments-container').innerHTML = '<p class="text-danger">Error cargando enriquecimientos.</p>';
    }
  }

  function formatFishDietDetails(r) {
    if (!r) return '';
    const parts = [];
    const fishFields = [
      { key: 'arenque_grande', label: 'Arenque G.' },
      { key: 'capelin', label: 'Capelín' },
      { key: 'arenque_pequeno', label: 'Arenque P.' },
      { key: 'sprat', label: 'Sprat' },
      { key: 'caballa', label: 'Caballa' },
      { key: 'bacaladilla', label: 'Bacaladilla' },
      { key: 'sardina', label: 'Sardina' },
      { key: 'merlan', label: 'Merlán' },
      { key: 'merluza', label: 'Merluza' },
    ];

    fishFields.forEach(f => {
      const val = parseFloat(r[f.key]);
      if (!isNaN(val) && val > 0) {
        const cleanVal = Math.round((val + Number.EPSILON) * 100) / 100;
        parts.push(`${f.label}: ${cleanVal} kg`);
      }
    });

    if (r.alimento) {
      if (typeof r.alimento === 'string' && r.alimento.trim().startsWith('[')) {
        try {
          const extras = JSON.parse(r.alimento);
          if (Array.isArray(extras)) {
            extras.forEach(ex => {
              if (ex.tipo || ex.food || ex.nombre) {
                const name = ex.tipo || ex.food || ex.nombre;
                const kg = parseFloat(ex.kg || ex.cantidad || 0);
                const cleanKg = !isNaN(kg) ? Math.round((kg + Number.EPSILON) * 100) / 100 : 0;
                parts.push(`${name}: ${cleanKg} kg`);
              }
            });
          }
        } catch(e) {}
      } else if (typeof r.alimento === 'string' && !r.alimento.startsWith('[') && !r.alimento.includes('(Total)')) {
        parts.push(r.alimento);
      }
    }

    if (r.food_type && !parts.some(p => p.toLowerCase().includes(String(r.food_type).toLowerCase()))) {
      const qty = parseFloat(r.quantity);
      const qtyStr = !isNaN(qty) && qty > 0 ? ` (${Math.round((qty + Number.EPSILON) * 100) / 100} kg)` : '';
      parts.push(`${r.food_type}${qtyStr}`);
    }

    if (r.vitaminas) {
      parts.push(`Vitaminas: ${r.vitaminas}`);
    }

    return parts.join(', ');
  }

  // ──────────────────────────────────────────────────────────
  // CONFIGURACIÓN Y FUNCIONALIDAD REUTILIZABLE DE EXPORTACIÓN
  // ──────────────────────────────────────────────────────────

  let activeSectionFilters = {
    animalId: 'all',
    period: 'all',
    startDate: '',
    endDate: '',
  };

  function getActiveFiltersFromDOM() {
    const animalEl = document.getElementById('filter-animal');
    const periodEl = document.getElementById('filter-period');
    const startEl = document.getElementById('filter-date-start');
    const endEl = document.getElementById('filter-date-end');

    if (animalEl) activeSectionFilters.animalId = animalEl.value || 'all';
    if (periodEl) activeSectionFilters.period = periodEl.value || 'all';
    if (startEl) activeSectionFilters.startDate = startEl.value || '';
    if (endEl) activeSectionFilters.endDate = endEl.value || '';

    return { ...activeSectionFilters };
  }

  function resetActiveSectionFilters() {
    activeSectionFilters = {
      animalId: 'all',
      period: 'all',
      startDate: '',
      endDate: '',
    };
  }

  function formatFilterSummarySubtitle(filters, animalName = '', deptName = '') {
    const parts = [];
    if (deptName) parts.push(`Departamento: ${deptName}`);
    
    if (filters.animalId && filters.animalId !== 'all') {
      parts.push(`Animal: ${animalName || filters.animalId}`);
    } else {
      parts.push(`Animales: Todos`);
    }

    const periodLabels = {
      all: 'Todos los registros',
      today: 'Día actual (Hoy)',
      '7days': 'Últimos 7 días',
      '30days': 'Últimos 30 días',
      this_month: 'Este mes',
      this_year: 'Este año',
      custom: `Rango: ${filters.startDate || 'Inicio'} al ${filters.endDate || 'Fin'}`
    };

    const pLabel = periodLabels[filters.period] || 'Todos los registros';
    parts.push(`Período: ${pLabel}`);

    return parts.join(' | ');
  }

  const EXPORT_COLUMNS = {
    animals: [
      { key: 'nombre', label: 'Nombre' },
      { key: 'especie', label: 'Especie' },
      { key: 'sexo', label: 'Sexo' },
      { key: 'fecha_nacimiento', label: 'Fecha Nacimiento', formatFn: val => H.formatDate(val) },
      { key: 'zims_id', label: 'ZIMS ID' },
      { key: 'microchip', label: 'Microchip' },
      { key: 'estado', label: 'Estado' },
      { key: 'ubicacion', label: 'Ubicación' },
      { key: 'observaciones', label: 'Observaciones' },
    ],
    diets: [
      { key: 'animal_nombre', label: 'Animal' },
      { key: 'fecha', label: 'Fecha', formatFn: val => H.formatDate(val) },
      { key: 'alimento', label: 'Alimento / Pescado' },
      { key: 'cantidad_gramos', label: 'Cantidad (kg/día)' },
      { key: 'observaciones', label: 'Observaciones' },
    ],
    trainings: [
      { key: 'animal_nombre', label: 'Animal' },
      { key: 'fecha', label: 'Fecha', formatFn: val => H.formatDate(val) },
      { key: 'numero_sesion', label: 'Nº Sesión' },
      { key: 'conducta_entrenada', label: 'Conducta / Entrenador' },
      { key: 'resultado', label: 'Actitud / Nivel' },
      { key: 'enriquecimiento', label: 'Enriquecimiento' },
      { key: 'comentarios', label: 'Observaciones' },
    ],
    weights: [
      { key: 'animal_nombre', label: 'Animal' },
      { key: 'fecha', label: 'Fecha Pesaje', formatFn: val => H.formatDate(val) },
      { key: 'peso_kg', label: 'Peso (kg)', formatFn: val => (val !== null && val !== undefined && val !== '') ? val + ' kg' : '—' },
      { key: 'trendDiff', label: 'Tendencia', formatFn: val => (val !== null && val !== undefined) ? (val > 0 ? `+${val.toFixed(2)} kg` : `${val.toFixed(2)} kg`) : '—' },
      { key: 'observaciones', label: 'Observaciones' },
    ],
    enrichments: [
      { key: 'animal_nombre', label: 'Animal' },
      { key: 'fecha', label: 'Fecha', formatFn: val => H.formatDate(val) },
      { key: 'tipo_enriquecimiento', label: 'Tipo Enriquecimiento' },
      { key: 'sesion', label: 'Sesión' },
      { key: 'observaciones', label: 'Observaciones' },
    ],
    veterinary: [
      { key: 'animal_nombre', label: 'Animal' },
      { key: 'fecha', label: 'Fecha', formatFn: val => H.formatDate(val) },
      { key: 'tipo_evento', label: 'Tipo de Evento / Tratamiento' },
      { key: 'dosis_diagnostico', label: 'Dosis / Indicaciones' },
      { key: 'veterinario_obs', label: 'Veterinario / Observaciones' },
    ],
  };

  async function getExportDataForSection(sectionId, deptId, customFilters = null) {
    const { getAnimals, getAllDietRecords, getAllWeightRecords, getEnrichmentsByDept } = await import('../src/services/animalService.js?v=16');
    const deptMeta = H.getDeptMeta(deptId);
    const filters = customFilters || getActiveFiltersFromDOM();
    
    let animalMap = {};
    let animalObjMap = {};
    let selectedAnimalName = '';
    try {
      const { data: animals } = await getAnimals({ departamentoId: deptId });
      (animals || []).forEach(a => {
        animalMap[a.id] = a.nombre;
        animalObjMap[a.id] = a;
        if (String(a.id) === String(filters.animalId)) {
          selectedAnimalName = a.nombre;
        }
      });
    } catch(e) {
      console.warn('Error fetching animals for export:', e);
    }

    let records = [];

    if (sectionId === 'animals') {
      const { data } = await getAnimals({ departamentoId: deptId });
      records = (data || []).map(a => ({
        id: a.id,
        animal_id: a.id,
        nombre: a.nombre,
        especie: a.especie,
        sexo: a.sexo || 'Desconocido',
        fecha_nacimiento: a.fecha_nacimiento,
        fecha: a.fecha_nacimiento || a.created_at,
        zims_id: a.zims_id || '—',
        microchip: a.microchip || '—',
        estado: a.estado || 'Activo',
        ubicacion: a.ubicacion || '—',
        observaciones: a.observaciones || '—'
      }));
    } else if (sectionId === 'diets') {
      const dietRecords = await getAllDietRecords(deptId);
      records = dietRecords.map(r => {
        const animalName = animalMap[r.animal_id] || 'Desconocido';
        const fishDetails = formatFishDietDetails(r);
        
        const totalKg = parseFloat(r.dieta_total || r.quantity || r.cantidad_gramos);
        const cleanTotalKg = !isNaN(totalKg) && totalKg > 0 
          ? `${Math.round((totalKg + Number.EPSILON) * 100) / 100} kg/día` 
          : (r.quantity || r.cantidad_gramos ? String(r.quantity || r.cantidad_gramos) : '—');

        const foodType = fishDetails || (r.food_type || r.alimento || '—');

        return {
          animal_id: r.animal_id,
          animal_nombre: animalName,
          fecha: r.fecha || r.date,
          alimento: foodType,
          cantidad_gramos: cleanTotalKg,
          observaciones: r.observaciones || '—'
        };
      });
    } else if (sectionId === 'weights') {
      const weightRecords = await getAllWeightRecords(deptId);
      records = weightRecords.map(r => ({
        animal_id: r.animal_id,
        animal_nombre: animalMap[r.animal_id] || 'Desconocido',
        fecha: r.fecha || r.date,
        peso_kg: r.peso_kg || r.weight_kg,
        trendDiff: r.trendDiff ?? null,
        observaciones: r.observaciones || '—'
      }));
    } else if (sectionId === 'trainings') {
      const service = DB.getService('trainings');
      const raw = service ? await service.getByDepartment(deptId) : [];
      records = raw.map(r => ({
        animal_id: r.animal_id,
        animal_nombre: animalMap[r.animal_id] || 'Desconocido',
        fecha: r.fecha || r.date || r.session_date,
        numero_sesion: r.numero_sesion || 1,
        conducta_entrenada: r.conducta_entrenada || r.behavior || r.trainer || '—',
        resultado: r.resultado || r.result || r.attitude || '—',
        enriquecimiento: r.enrichment || r.enriquecimiento || '—',
        comentarios: r.comentarios || r.observations || r.notes || '—'
      }));
    } else if (sectionId === 'enrichments') {
      const raw = await getEnrichmentsByDept(deptId);
      records = raw.map(r => {
        const match = r.observaciones?.match(/^Sesión (\d+)(?::\s*(.*))?$/);
        const sesion = match ? match[1] : '—';
        const obs = match ? (match[2] || '—') : (r.observaciones || '—');
        return {
          animal_id: r.animal_id,
          animal_nombre: animalMap[r.animal_id] || 'Desconocido',
          fecha: r.fecha || r.date,
          tipo_enriquecimiento: r.tipo_enriquecimiento || '—',
          sesion: sesion,
          observaciones: obs
        };
      });
    } else if (sectionId === 'veterinary' || sectionId === 'health') {
      const service = DB.getService('veterinary');
      const raw = service ? await service.getByDepartment(deptId) : [];
      records = raw.map(r => ({
        animal_id: r.animal_id,
        animal_nombre: animalMap[r.animal_id] || 'Desconocido',
        fecha: r.fecha || r.date,
        tipo_evento: r.tipo_evento || r.treatment || r.event_type || '—',
        dosis_diagnostico: r.dosis || r.diagnosis || r.frequency || '—',
        veterinario_obs: r.veterinario || r.observaciones || r.notes || '—'
      }));
    }

    // Aplicar filtrado centralizado
    const filteredRecords = H.filterReportData(records, filters);
    const subtitle = formatFilterSummarySubtitle(filters, selectedAnimalName, deptMeta.name);
    const title = `Reporte de ${H.getSectionMeta(sectionId)?.name || sectionId} — ${deptMeta.name}`;

    return { records: filteredRecords, columns: EXPORT_COLUMNS[sectionId] || [], title, subtitle };
  }

  async function applySectionFilters(sectionId, deptId) {
    const filters = getActiveFiltersFromDOM();
    const { records } = await getExportDataForSection(sectionId, deptId, filters);

    const badgeEl = document.getElementById('filter-active-count-badge');
    if (badgeEl) {
      badgeEl.textContent = `Registros filtrados: ${records.length}`;
    }

    const tbody = document.querySelector('.table tbody');
    if (tbody) {
      const trs = tbody.querySelectorAll('tr');
      trs.forEach(tr => {
        const trAnimId = tr.getAttribute('data-animal-id') || '';
        const trAnimName = (tr.getAttribute('data-animal-name') || tr.cells[0]?.textContent || '').trim().toLowerCase();
        const trAnimSpecies = (tr.getAttribute('data-animal-species') || '').trim().toLowerCase();

        const isMatch = (filters.animalId === 'all' || trAnimId === filters.animalId) && (records.length === 0 || records.some(r => {
          const rName = (r.animal_nombre || r.nombre || '').trim().toLowerCase();
          const rSpec = (r.especie || '').trim().toLowerCase();
          return (rName && trAnimName.includes(rName)) || (rSpec && trAnimSpecies.includes(rSpec));
        }));

        tr.style.display = isMatch ? '' : 'none';
      });
    }

    // Para la vista de tarjetas de animales (Entrenos, Animales)
    const gridEl = document.getElementById('animal-grid') || document.getElementById('training-animal-grid') || document.querySelector('.animal-grid');
    if (gridEl) {
      const cards = gridEl.querySelectorAll('.animal-card');
      cards.forEach(card => {
        const cardAnimId = card.getAttribute('data-animal-id') || '';
        const cName = (card.getAttribute('data-animal-name') || card.querySelector('.animal-name')?.textContent || '').trim().toLowerCase();
        
        const isMatch = (filters.animalId === 'all' || cardAnimId === filters.animalId);
        card.style.display = isMatch ? '' : 'none';
      });
    }
  }

  async function resetSectionFilters(sectionId, deptId) {
    resetActiveSectionFilters();
    const animalEl = document.getElementById('filter-animal');
    const periodEl = document.getElementById('filter-period');
    const startEl = document.getElementById('filter-date-start');
    const endEl = document.getElementById('filter-date-end');
    if (animalEl) animalEl.value = 'all';
    if (periodEl) periodEl.value = 'all';
    if (startEl) startEl.value = '';
    if (endEl) endEl.value = '';
    if (window.App.UI && window.App.UI.toggleCustomDateInputs) {
      window.App.UI.toggleCustomDateInputs('all');
    }
    await applySectionFilters(sectionId, deptId);
  }

  async function exportSectionData(sectionId, deptId, format) {
    try {
      const filters = getActiveFiltersFromDOM();
      const { records, columns, title, subtitle } = await getExportDataForSection(sectionId, deptId, filters);
      App.ExportUtils.exportData({
        data: records,
        columns: columns,
        fileName: `${sectionId}_${deptId}`,
        format: format,
        title: title,
        subtitle: subtitle
      });
    } catch(err) {
      console.error('Error al exportar:', err);
      UI.showToast('Error al exportar datos: ' + err.message, 'error');
    }
  }

  async function printSectionData(sectionId, deptId) {
    try {
      const filters = getActiveFiltersFromDOM();
      const { records, columns, title, subtitle } = await getExportDataForSection(sectionId, deptId, filters);
      App.ExportUtils.printReport({
        title: title,
        subtitle: subtitle,
        columns: columns,
        data: records
      });
    } catch(err) {
      console.error('Error al imprimir:', err);
      UI.showToast('Error al preparar impresión: ' + err.message, 'error');
    }
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
    openTrainingForm,
    openTrainingDayForm,
    deleteTrainingDayConfirm,
    deleteRecord,
    openAnimalForm,
    deleteAnimal,
    exportDeptData,
    exportSectionData,
    printSectionData,
    applySectionFilters,
    resetSectionFilters,
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
    openDeptRecordForm,
    openDietAnimalSelector,
    openHealthEventForm,
    deleteHealthEvent,
    renderFishManagement: (params) => (App.FishManagement || App.Views.FishManagement).render(params),
    FishManagement: App.FishManagement,
    currentDietExtras: [],
    currentDietSessions: [],
  };
})();

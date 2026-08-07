/* ============================================================
   FISH MANAGEMENT VIEW - Pedidos y Descongelación Diaria
   ============================================================ */
window.App = window.App || {};

App.FishManagement = (() => {
  'use strict';

  const H = App.Helpers;
  const UI = App.UI;

  let currentDeptFilter = 'all';
  let fishData = null;
  let customBoxWeights = {}; // Guarda ajustes de peso por caja del usuario { 'arenque_grande': 20 }
  let dietUpdateListenerRegistered = false;
  let boxWeightDebounceTimers = {};

  const STORAGE_KEY_BOX_WEIGHTS = 'selwo_fish_box_weights';

  /**
   * Carga los pesos por caja guardados en localStorage.
   * @returns {Object} Mapa { fishKey: weight }
   */
  function loadStoredBoxWeights() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BOX_WEIGHTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[FishManagement] Error al leer pesos de caja de localStorage:', err);
    }
    return {};
  }

  /**
   * Obtiene el peso por caja guardado para un tipo de pescado (o fallback por defecto seguro).
   * @param {string} fishKey
   * @param {number|string} defaultWeight
   * @returns {number}
   */
  function getBoxWeight(fishKey, defaultWeight = 10) {
    const fallback = parseFloat(defaultWeight) > 0 ? parseFloat(defaultWeight) : 10;
    if (!fishKey) return fallback;

    if (Object.keys(customBoxWeights).length === 0) {
      customBoxWeights = loadStoredBoxWeights();
    }

    if (customBoxWeights[fishKey] !== undefined && customBoxWeights[fishKey] !== null) {
      const val = parseFloat(customBoxWeights[fishKey]);
      if (!isNaN(val) && val > 0) {
        return val;
      }
    }

    return fallback;
  }

  /**
   * Guarda de forma persistente el peso por caja de un tipo de pescado en localStorage.
   * @param {string} fishKey
   * @param {number|string} weight
   * @returns {boolean} Sucesso de la operación
   */
  function saveBoxWeight(fishKey, weight) {
    if (!fishKey) return false;
    const val = parseFloat(weight);
    if (isNaN(val) || val <= 0) return false;

    try {
      if (Object.keys(customBoxWeights).length === 0) {
        customBoxWeights = loadStoredBoxWeights();
      }
      customBoxWeights[fishKey] = val;
      localStorage.setItem(STORAGE_KEY_BOX_WEIGHTS, JSON.stringify(customBoxWeights));
      return true;
    } catch (err) {
      console.error('[FishManagement] Error al guardar peso por caja en localStorage:', err);
      UI.showToast('No se pudo guardar la preferencia de peso por caja.', 'warning');
      return false;
    }
  }

  /**
   * Renderiza la vista principal de Gestión de Pescado.
   * @param {Object} [params]
   * @param {string} [params.deptId]
   */
  async function render(params = {}) {
    if (params.deptId) {
      const d = String(params.deptId).toLowerCase();
      if (['delfines', 'mamiferos', 'mamiferos-marinos'].includes(d)) {
        currentDeptFilter = 'leones';
      } else {
        currentDeptFilter = params.deptId;
      }
    }

    // Inicializar pesos de caja guardados
    customBoxWeights = loadStoredBoxWeights();

    const app = document.getElementById('app');

    // Estructura HTML base con spinner de carga
    app.innerHTML = `
      ${UI.renderHeader('🐟 Gestión de Pescado', '/menu')}
      ${UI.renderBreadcrumbs([
        { label: 'Inicio', path: '/menu' },
        { label: 'Gestión de Pescado' },
      ])}
      <main class="main-content fish-management-page">
        <!-- Encabezado de control y filtros -->
        <div class="fish-header-card">
          <div class="fish-header-top">
            <div>
              <h2 class="fish-title">🐟 Proyección de Pedidos y Descongelación</h2>
              <p class="fish-subtitle">Cálculo dinámico en tiempo real basado únicamente en dietas activas del parque.</p>
            </div>
            <div class="fish-actions" style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
              <div class="dropdown-export" style="position:relative; display:inline-block;">
                <button class="btn btn-outline" onclick="App.Views.FishManagement.toggleExportMenu(event)">
                  <span>📊 Exportar ▾</span>
                </button>
                <div id="fish-export-menu" class="card shadow-md" style="display:none; position:absolute; right:0; top:110%; z-index:100; min-width:210px; padding:0.5rem; background:var(--surface-card); border:1px solid var(--gray-200); border-radius:var(--radius-md);">
                  <button class="btn btn-sm btn-ghost" style="width:100%; text-align:left; justify-content:flex-start; margin-bottom:4px;" onclick="App.Views.FishManagement.exportExcel()">
                    📊 Exportar Excel (.xlsx)
                  </button>
                  <button class="btn btn-sm btn-ghost" style="width:100%; text-align:left; justify-content:flex-start; margin-bottom:4px;" onclick="App.Views.FishManagement.exportText()">
                    📄 Exportar Texto / Word (.txt)
                  </button>
                  <button class="btn btn-sm btn-ghost" style="width:100%; text-align:left; justify-content:flex-start;" onclick="App.Views.FishManagement.exportCSV()">
                    📋 Exportar CSV (.csv)
                  </button>
                </div>
              </div>
              <button class="btn btn-primary" onclick="window.print()">
                <span>🖨️ Imprimir Order List</span>
              </button>
            </div>
          </div>

          <div class="fish-filter-bar">
            <div class="fish-dept-selector">
              <label for="fish-dept-filter" class="fish-filter-label">Departamento:</label>
              <select id="fish-dept-filter" class="form-select" onchange="App.Views.FishManagement.onDeptChange(this.value)">
                <option value="all" ${currentDeptFilter === 'all' ? 'selected' : ''}>🌐 Todo el Parque (Global)</option>
                <option value="leones" ${currentDeptFilter === 'leones' ? 'selected' : ''}>🦭 Mamíferos Marinos</option>
                <option value="pinguinario" ${currentDeptFilter === 'pinguinario' ? 'selected' : ''}>🐧 Pingüinario</option>
              </select>
            </div>

            <div class="fish-metrics-summary" id="fish-metrics-summary">
              <span class="fish-metric-badge">Cargando métricas...</span>
            </div>
          </div>
        </div>

        <!-- Contenedor principal para paneles dinámicos -->
        <div id="fish-content-body">
          <div style="text-align:center; padding: 4rem 1rem;">
            <div class="loading-spinner" style="width:40px;height:40px;margin:0 auto 1rem;border:3px solid rgba(0,0,0,0.1);border-top-color:var(--primary-600);border-radius:50%;animation:spin .8s linear infinite;"></div>
            <p style="color:var(--gray-600);">Calculando requerimientos de pescado...</p>
          </div>
        </div>
      </main>
    `;

    UI.initHeaderInteractions();
    setupReactivityListener();
    await loadDataAndRenderPanels();
  }

  /**
   * Carga los datos de Supabase/Servicio y renderiza los 2 paneles requeridos.
   */
  async function loadDataAndRenderPanels() {
    try {
      const { getFishConsumptionSummary } = await import('../../src/services/animalService.js?v=16');
      fishData = await getFishConsumptionSummary({ departamentoId: currentDeptFilter });

      // Aplicar pesos personalizados de caja guardados (prioridad sobre valor por defecto)
      if (fishData && fishData.fishSummary) {
        fishData.fishSummary.forEach(item => {
          item.defaultBoxKg = getBoxWeight(item.key, item.defaultBoxKg);
          item.boxesCount = Math.ceil(item.dailyKg / item.defaultBoxKg);
        });

        // Recalcular total de cajas
        fishData.grandTotals.totalBoxes = fishData.fishSummary.reduce((sum, i) => sum + i.boxesCount, 0);
      }

      renderSummaryBadges();
      renderPanels();
    } catch (err) {
      console.error('Error al cargar datos de pescado:', err);
      const container = document.getElementById('fish-content-body');
      if (container) {
        container.innerHTML = `
          <div class="card" style="padding:2rem; text-align:center; border-left:4px solid var(--danger-500);">
            <h3>⚠️ Error al calcular consumo</h3>
            <p style="color:var(--gray-600); margin-top:0.5rem;">${H.escapeHtml(err.message)}</p>
            <button class="btn btn-primary" onclick="App.Views.FishManagement.refreshData()" style="margin-top:1rem;">Reintentar</button>
          </div>
        `;
      }
    }
  }

  /**
   * Renderiza los badges de resumen en la barra de filtros.
   */
  function renderSummaryBadges() {
    const el = document.getElementById('fish-metrics-summary');
    if (!el || !fishData) return;

    el.innerHTML = `
      <span class="fish-metric-badge" title="Animales con estado activo considerados">
        🐾 <strong>${fishData.activeAnimalsCount}</strong> animales activos
      </span>
      <span class="fish-metric-badge" title="Dietas registradas vigentes">
        📋 <strong>${fishData.dietsCount}</strong> dietas vigentes
      </span>
      <span class="fish-metric-badge highlight" title="Consumo diario total">
        ⚖️ <strong>${fishData.grandTotals.dailyKg} kg/día</strong> total
      </span>
    `;
  }

  /**
   * Renderiza los dos paneles de negocio principales:
   * Panel 1: Descongelación Diaria (Día Siguiente) + Trazabilidad
   * Panel 2: Proyección de Consumo y Pedidos (Tabla Interactiva)
   */
  function renderPanels() {
    const container = document.getElementById('fish-content-body');
    if (!container || !fishData) return;

    if (!fishData.fishSummary || fishData.fishSummary.length === 0) {
      container.innerHTML = `
        <div class="card" style="padding: 3rem; text-align: center; color: var(--gray-500);">
          <div style="font-size: 3.5rem; margin-bottom: 1rem;">🧊</div>
          <h3>No hay consumo de pescado registrado</h3>
          <p style="max-width: 500px; margin: 0.5rem auto 1.5rem;">
            No se han encontrado dietas vigentes con asignación de pescado para los animales activos del filtro seleccionado.
          </p>
          <button class="btn btn-outline" onclick="App.Router.navigate('/menu')">Volver al Menú Principal</button>
        </div>
      `;
      return;
    }

    // Preservar elemento con foco activo para no perder cursor al tipeo
    const activeElId = document.activeElement ? document.activeElement.id : null;
    const selectionStart = document.activeElement && typeof document.activeElement.selectionStart === 'number' ? document.activeElement.selectionStart : null;
    const selectionEnd = document.activeElement && typeof document.activeElement.selectionEnd === 'number' ? document.activeElement.selectionEnd : null;

    const todayKey = getTodayKey();
    const defrostState = getDefrostStatus(todayKey, currentDeptFilter);

    const panelHtml = `
      <!-- PANEL 1: DESCONGELACIÓN DIARIA (DÍA SIGUIENTE) -->
      <section class="fish-panel card">
        <div class="fish-panel-header">
          <div>
            <span class="panel-tag">OPERATIVA DIARIA</span>
            <h3 class="fish-panel-title">🧊 Panel 1: Pescado a Bajar / Descongelar para Mañana</h3>
            <p class="fish-panel-sub">Calculadora diaria exacta en kg y bolsas/cajas estimadas para sacar hoy del congelador.</p>
          </div>
          <div class="defrost-traceability-box">
            ${renderDefrostButtonHtml(defrostState)}
          </div>
        </div>

        <div class="defrost-cards-grid">
          ${fishData.fishSummary.map(item => `
            <div class="defrost-card">
              <div class="defrost-card-top">
                <span class="defrost-fish-icon">${item.emoji}</span>
                <div class="defrost-fish-title">
                  <h4>${H.escapeHtml(item.label)}</h4>
                  <span class="defrost-animal-count" title="${item.animalList.join(', ')}">
                    👥 ${item.animalCount} ${item.animalCount === 1 ? 'animal' : 'animales'}
                  </span>
                </div>
              </div>

              <div class="defrost-card-qty">
                <span class="defrost-kg">${item.dailyKg} <small>kg hoy</small></span>
              </div>

              <div class="defrost-card-boxes">
                <span class="boxes-count-badge">📦 <strong>${item.boxesCount}</strong> ${item.boxesCount === 1 ? 'caja' : 'cajas'}</span>
                <div class="box-weight-input-group">
                  <label for="box-w-${item.key}">kg/caja:</label>
                  <input type="number" 
                         id="box-w-${item.key}"
                         class="box-weight-input" 
                         value="${item.defaultBoxKg}" 
                         min="0.1" 
                         step="0.5" 
                         oninput="App.Views.FishManagement.onBoxWeightInput('${item.key}', this.value)"
                         onchange="App.Views.FishManagement.onBoxWeightChange('${item.key}', this.value)">
                </div>
              </div>

              ${item.animalList.length > 0 ? `
                <div class="defrost-card-footer">
                  <span class="defrost-animals-preview" title="${H.escapeHtml(item.animalList.join(', '))}">
                    <strong>Asignado a:</strong> ${H.escapeHtml(item.animalList.join(', '))}
                  </span>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </section>

      <!-- PANEL 2: PROYECCIÓN DE CONSUMO Y PEDIDOS -->
      <section class="fish-panel card">
        <div class="fish-panel-header">
          <div>
            <span class="panel-tag">GESTIÓN DE PROVEEDORES</span>
            <h3 class="fish-panel-title">📋 Panel 2: Proyección de Consumo y Pedidos</h3>
            <p class="fish-panel-sub">Tabla interactiva de estimación de necesidades diarias, mensuales y anuales de materia prima.</p>
          </div>
          <div class="fish-export-buttons" style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button class="btn btn-sm btn-outline" onclick="App.Views.FishManagement.exportExcel()" title="Descargar como hoja de cálculo de Excel">
              📊 Excel (.xlsx)
            </button>
            <button class="btn btn-sm btn-outline" onclick="App.Views.FishManagement.exportText()" title="Descargar como documento de texto o Word">
              📄 Texto (.txt)
            </button>
            <button class="btn btn-sm btn-outline" onclick="App.Views.FishManagement.exportCSV()" title="Descargar como valores separados por comas">
              📋 CSV (.csv)
            </button>
          </div>
        </div>

        <div class="table-container">
          <table class="table fish-projections-table">
            <thead>
              <tr>
                <th>Tipo de Pescado</th>
                <th class="text-right">Consumo Diario (kg)</th>
                <th class="text-right">Est. Mensual (30d)</th>
                <th class="text-right">Est. Anual (365d)</th>
                <th class="text-center">Cajas/Día Est.</th>
                <th>Animales Destino</th>
              </tr>
            </thead>
            <tbody>
              ${fishData.fishSummary.map(item => `
                <tr>
                  <td style="font-weight: 600;">
                    <span style="margin-right: 8px;">${item.emoji}</span>${H.escapeHtml(item.label)}
                  </td>
                  <td class="text-right font-mono highlight-qty">${item.dailyKg.toFixed(2)} kg</td>
                  <td class="text-right font-mono">${item.monthlyKg.toFixed(2)} kg</td>
                  <td class="text-right font-mono">${item.annualKg.toFixed(2)} kg</td>
                  <td class="text-center">
                    <span class="badge badge-subtle">📦 ${item.boxesCount} (${item.defaultBoxKg}kg)</span>
                  </td>
                  <td>
                    <span style="font-size:0.85rem; color:var(--gray-600);" title="${H.escapeHtml(item.animalList.join(', '))}">
                      ${item.animalCount} (${H.escapeHtml(item.animalList.slice(0, 3).join(', '))}${item.animalList.length > 3 ? '...' : ''})
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="grand-total-row">
                <td><strong>TOTAL GLOBAL</strong></td>
                <td class="text-right font-mono"><strong>${fishData.grandTotals.dailyKg.toFixed(2)} kg</strong></td>
                <td class="text-right font-mono"><strong>${fishData.grandTotals.monthlyKg.toFixed(2)} kg</strong></td>
                <td class="text-right font-mono"><strong>${fishData.grandTotals.annualKg.toFixed(2)} kg</strong></td>
                <td class="text-center"><strong>📦 ${fishData.grandTotals.totalBoxes} cajas</strong></td>
                <td>—</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    `;

    container.innerHTML = panelHtml;

    // Restaurar foco tras render
    if (activeElId) {
      const restoredInput = document.getElementById(activeElId);
      if (restoredInput) {
        restoredInput.focus();
        if (selectionStart !== null && selectionEnd !== null && restoredInput.setSelectionRange) {
          try { restoredInput.setSelectionRange(selectionStart, selectionEnd); } catch (e) {}
        }
      }
    }
  }

  /**
   * Genera el HTML del botón e insignia de trazabilidad de descongelación.
   */
  function renderDefrostButtonHtml(state) {
    if (state && state.done) {
      return `
        <div class="defrost-status-done">
          <span class="defrost-badge-done">✅ Pescado Bajado / En Descongelación</span>
          <span class="defrost-timestamp">Marcado a las ${state.time} (${state.date})</span>
          <button class="btn btn-xs btn-link" onclick="App.Views.FishManagement.toggleDefrostStatus()" style="margin-top:4px; color:var(--gray-500);">
            Deshacer marca
          </button>
        </div>
      `;
    }

    return `
      <button class="btn btn-success defrost-btn-action" onclick="App.Views.FishManagement.toggleDefrostStatus()">
        🧊 Marcar como "Pescado Bajado / En Descongelación"
      </button>
    `;
  }

  /**
   * Manejador del cambio de departamento.
   */
  async function onDeptChange(newDept) {
    currentDeptFilter = newDept;
    App.Router.navigate(newDept === 'all' ? '/fish-management' : `/dept/${newDept}/fish-management`);
    await loadDataAndRenderPanels();
  }

  /**
   * Listener de input con debounce (500ms) para auto-guardar mientras el usuario escribe.
   */
  function onBoxWeightInput(fishKey, newWeightStr) {
    if (boxWeightDebounceTimers[fishKey]) {
      clearTimeout(boxWeightDebounceTimers[fishKey]);
    }
    boxWeightDebounceTimers[fishKey] = setTimeout(() => {
      onBoxWeightChange(fishKey, newWeightStr);
    }, 500);
  }

  /**
   * Manejador del cambio de peso por caja de un tipo de pescado.
   */
  function onBoxWeightChange(fishKey, newWeightStr) {
    if (boxWeightDebounceTimers[fishKey]) {
      clearTimeout(boxWeightDebounceTimers[fishKey]);
      delete boxWeightDebounceTimers[fishKey];
    }

    const val = parseFloat(newWeightStr);
    if (isNaN(val) || val <= 0) {
      UI.showToast('Por favor, introduce un peso por caja mayor a 0.', 'warning');
      const currentItem = fishData?.fishSummary?.find(i => i.key === fishKey);
      const safeWeight = currentItem ? currentItem.defaultBoxKg : getBoxWeight(fishKey, 10);
      const inputEl = document.getElementById(`box-w-${fishKey}`);
      if (inputEl) inputEl.value = safeWeight;
      return;
    }

    const saved = saveBoxWeight(fishKey, val);
    if (saved && fishData && fishData.fishSummary) {
      const item = fishData.fishSummary.find(i => i.key === fishKey);
      if (item) {
        item.defaultBoxKg = val;
        item.boxesCount = Math.ceil(item.dailyKg / val);
        fishData.grandTotals.totalBoxes = fishData.fishSummary.reduce((sum, i) => sum + i.boxesCount, 0);
        renderPanels();
      }
    }
  }

  /**
   * Alterna el estado de trazabilidad de descongelación del día.
   */
  function toggleDefrostStatus() {
    const todayKey = getTodayKey();
    const key = `selwo_defrost_${todayKey}_${currentDeptFilter}`;
    const existing = localStorage.getItem(key);

    if (existing) {
      localStorage.removeItem(key);
      UI.showToast('Marca de descongelación eliminada.', 'info');
    } else {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString();
      const statusObj = { done: true, time: timeStr, date: dateStr, timestamp: Date.now() };
      localStorage.setItem(key, JSON.stringify(statusObj));
      UI.showToast('✅ Pescado registrado como bajado para descongelar.', 'success');
    }

    renderPanels();
  }

  /**
   * Obtiene el estado de trazabilidad desde localStorage.
   */
  function getDefrostStatus(dateKey, deptId) {
    try {
      const key = `selwo_defrost_${dateKey}_${deptId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  function getTodayKey() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Alterna la visibilidad del menú desplegable de exportación.
   */
  function toggleExportMenu(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('fish-export-menu');
    if (!menu) return;
    const isVisible = menu.style.display === 'block';
    menu.style.display = isVisible ? 'none' : 'block';
  }

  // Listener para cerrar el menú desplegable al hacer clic fuera
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('fish-export-menu');
    if (menu && menu.style.display === 'block' && !e.target.closest('.dropdown-export')) {
      menu.style.display = 'none';
    }
  });

  /**
   * Helper genérico para descargar archivos Blob en el navegador.
   */
  function downloadBlob(content, mimeType, filename) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function getDeptExportName() {
    const deptNameMap = {
      all: 'Parque Global',
      leones: 'Mamíferos Marinos',
      pinguinario: 'Pingüinario'
    };
    return deptNameMap[currentDeptFilter] || currentDeptFilter.toUpperCase();
  }

  /**
   * Exporta la tabla de proyecciones a un archivo Excel (.xlsx / HTML Table Excel).
   */
  function exportExcel() {
    if (!fishData || !fishData.fishSummary || fishData.fishSummary.length === 0) {
      UI.showToast('No hay datos para exportar', 'warning');
      return;
    }

    const todayStr = getTodayKey();
    const deptName = getDeptExportName();

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
        <x:Name>Pescado ${H.escapeHtml(deptName)}</x:Name>
        <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
        </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          body { font-family: sans-serif; }
          th { background-color: #0a2647; color: #ffffff; font-weight: bold; border: 1px solid #041c2c; }
          td, th { padding: 8px; border: 1px solid #ced4da; text-align: left; }
          .num { text-align: right; mso-number-format: "0\.00"; }
          .center { text-align: center; }
          .title { font-size: 16px; font-weight: bold; background-color: #eaf2f8; color: #041c2c; }
          .total { font-weight: bold; background-color: #f1f3f5; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="7" class="title">CONTROL ANIMAL SELWO MARINA - ORDEN DE DESCONGELACIÓN Y PEDIDO DE PESCADO</td></tr>
          <tr><td colspan="7"><b>Departamento:</b> ${H.escapeHtml(deptName)} | <b>Fecha del Reporte:</b> ${new Date().toLocaleString()}</td></tr>
          <tr><td colspan="7"></td></tr>
          <tr>
            <th>Tipo de Pescado</th>
            <th>Consumo Diario (kg)</th>
            <th>Est. Mensual (30d kg)</th>
            <th>Est. Anual (365d kg)</th>
            <th>Peso Caja (kg)</th>
            <th>Cajas Estimadas / Día</th>
            <th>Animales Destino</th>
          </tr>
          ${fishData.fishSummary.map(i => `
            <tr>
              <td>${H.escapeHtml(i.label)}</td>
              <td class="num">${i.dailyKg.toFixed(2)}</td>
              <td class="num">${i.monthlyKg.toFixed(2)}</td>
              <td class="num">${i.annualKg.toFixed(2)}</td>
              <td class="center">${i.defaultBoxKg}</td>
              <td class="center">${i.boxesCount}</td>
              <td>${H.escapeHtml(i.animalList.join(', '))}</td>
            </tr>
          `).join('')}
          <tr class="total">
            <td>TOTAL GLOBAL</td>
            <td class="num">${fishData.grandTotals.dailyKg.toFixed(2)} kg</td>
            <td class="num">${fishData.grandTotals.monthlyKg.toFixed(2)} kg</td>
            <td class="num">${fishData.grandTotals.annualKg.toFixed(2)} kg</td>
            <td class="center">-</td>
            <td class="center">${fishData.grandTotals.totalBoxes} cajas</td>
            <td>-</td>
          </tr>
        </table>
      </body>
      </html>
    `;

    downloadBlob('\uFEFF' + excelHtml, 'application/vnd.ms-excel;charset=utf-8;', `Orden_Descongelacion_Selwo_${currentDeptFilter}_${todayStr}.xlsx`);
    UI.showToast('📊 Archivo Excel (.xlsx) exportado correctamente', 'success');
  }

  /**
   * Exporta la orden de descongelación a un archivo de Texto / Word (.txt).
   */
  function exportText() {
    if (!fishData || !fishData.fishSummary || fishData.fishSummary.length === 0) {
      UI.showToast('No hay datos para exportar', 'warning');
      return;
    }

    const todayStr = getTodayKey();
    const deptName = getDeptExportName();

    let text = `================================================================================\n`;
    text += `CONTROL ANIMAL SELWO MARINA - ORDEN DE DESCONGELACIÓN Y PEDIDOS DE PESCADO\n`;
    text += `================================================================================\n\n`;
    text += `Departamento:      ${deptName}\n`;
    text += `Fecha del Reporte: ${new Date().toLocaleString()}\n`;
    text += `Animales Activos:  ${fishData.activeAnimalsCount}\n`;
    text += `Dietas Vigentes:   ${fishData.dietsCount}\n\n`;
    text += `--------------------------------------------------------------------------------\n`;
    text += `RESUMEN DE CONSUMO DIARIO Y PROYECCIÓN\n`;
    text += `--------------------------------------------------------------------------------\n\n`;

    fishData.fishSummary.forEach(i => {
      text += `• ${i.label.toUpperCase()}\n`;
      text += `  - Consumo diario:     ${i.dailyKg.toFixed(2)} kg (${i.boxesCount} cajas de ${i.defaultBoxKg} kg)\n`;
      text += `  - Estimación mensual: ${i.monthlyKg.toFixed(2)} kg (30 días)\n`;
      text += `  - Estimación anual:   ${i.annualKg.toFixed(2)} kg (365 días)\n`;
      text += `  - Animales asignados: ${i.animalList.join(', ')}\n\n`;
    });

    text += `================================================================================\n`;
    text += `TOTALES GLOBALES DE DESCONGELACIÓN / PEDIDO\n`;
    text += `================================================================================\n`;
    text += `  - Total consumo diario:  ${fishData.grandTotals.dailyKg.toFixed(2)} kg / día\n`;
    text += `  - Total cajas estimadas: ${fishData.grandTotals.totalBoxes} cajas / día\n`;
    text += `  - Total mensual (30d):   ${fishData.grandTotals.monthlyKg.toFixed(2)} kg\n`;
    text += `  - Total anual (365d):    ${fishData.grandTotals.annualKg.toFixed(2)} kg\n`;
    text += `================================================================================\n`;

    downloadBlob('\uFEFF' + text, 'text/plain;charset=utf-8;', `Orden_Descongelacion_Selwo_${currentDeptFilter}_${todayStr}.txt`);
    UI.showToast('📄 Documento de texto (.txt) exportado correctamente', 'success');
  }

  /**
   * Exporta la tabla de proyecciones a un archivo CSV descargable con BOM UTF-8.
   */
  function exportCSV() {
    if (!fishData || !fishData.fishSummary || fishData.fishSummary.length === 0) {
      UI.showToast('No hay datos para exportar', 'warning');
      return;
    }

    const todayStr = getTodayKey();
    const deptName = getDeptExportName();

    let csvContent = `Control Animal Selwo - Proyección de Pedido de Pescado (${deptName})\n`;
    csvContent += `Fecha del Reporte: ${new Date().toLocaleString()}\n\n`;
    csvContent += `Tipo de Pescado,Consumo Diario (kg),Estimacion Mensual (kg),Estimacion Anual (kg),Peso Caja (kg),Cajas Estimadas/Dia,Animales Destino\n`;

    fishData.fishSummary.forEach(i => {
      const animals = `"${i.animalList.join('; ')}"`;
      csvContent += `"${i.label}",${i.dailyKg},${i.monthlyKg},${i.annualKg},${i.defaultBoxKg},${i.boxesCount},${animals}\n`;
    });

    csvContent += `TOTAL GLOBAL,${fishData.grandTotals.dailyKg},${fishData.grandTotals.monthlyKg},${fishData.grandTotals.annualKg},-,${fishData.grandTotals.totalBoxes},-\n`;

    downloadBlob('\uFEFF' + csvContent, 'text/csv;charset=utf-8;', `Orden_Descongelacion_Selwo_${currentDeptFilter}_${todayStr}.csv`);
    UI.showToast('📋 CSV (.csv) exportado correctamente', 'success');
  }

  /**
   * Suscribe la vista a eventos de actualización de dieta en el sistema.
   */
  function setupReactivityListener() {
    if (dietUpdateListenerRegistered) return;
    window.addEventListener('selwo:diet-updated', () => {
      console.log('[FishManagement] Evento selwo:diet-updated recibido. Actualizando datos...');
      loadDataAndRenderPanels();
    });
    dietUpdateListenerRegistered = true;
  }

  return {
    render,
    onDeptChange,
    onBoxWeightChange,
    onBoxWeightInput,
    saveBoxWeight,
    getBoxWeight,
    toggleDefrostStatus,
    toggleExportMenu,
    exportExcel,
    exportText,
    exportCSV,
    refreshData: loadDataAndRenderPanels
  };
})();

window.App.Views = window.App.Views || {};
window.App.Views.FishManagement = App.FishManagement;

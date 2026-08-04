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

  /**
   * Renderiza la vista principal de Gestión de Pescado.
   * @param {Object} [params]
   * @param {string} [params.deptId]
   */
  async function render(params = {}) {
    if (params.deptId) {
      currentDeptFilter = params.deptId;
    }

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
            <div class="fish-actions">
              <button class="btn btn-outline" onclick="App.Views.FishManagement.exportCSV()">
                <span>📊 Exportar CSV</span>
              </button>
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
                <option value="leones" ${currentDeptFilter === 'leones' ? 'selected' : ''}>🦭 Mamíferos Marinos (Leones)</option>
                <option value="delfines" ${currentDeptFilter === 'delfines' ? 'selected' : ''}>🐬 Delfines</option>
                <option value="pinguinario" ${currentDeptFilter === 'pinguinario' ? 'selected' : ''}>🐧 Pingüinario</option>
                <option value="aves" ${currentDeptFilter === 'aves' ? 'selected' : ''}>🦜 Aves / Amazónicos</option>
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

      // Aplicar pesos personalizados de caja si existen
      if (fishData && fishData.fishSummary) {
        fishData.fishSummary.forEach(item => {
          if (customBoxWeights[item.key]) {
            item.defaultBoxKg = customBoxWeights[item.key];
            item.boxesCount = Math.ceil(item.dailyKg / item.defaultBoxKg);
          }
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
                         min="1" 
                         step="0.5" 
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
          <button class="btn btn-sm btn-outline" onclick="App.Views.FishManagement.exportCSV()">
            📥 Descargar CSV
          </button>
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
   * Manejador del cambio de peso por caja de un tipo de pescado.
   */
  function onBoxWeightChange(fishKey, newWeightStr) {
    const val = parseFloat(newWeightStr);
    if (!isNaN(val) && val > 0) {
      customBoxWeights[fishKey] = val;
      if (fishData && fishData.fishSummary) {
        const item = fishData.fishSummary.find(i => i.key === fishKey);
        if (item) {
          item.defaultBoxKg = val;
          item.boxesCount = Math.ceil(item.dailyKg / val);
          fishData.grandTotals.totalBoxes = fishData.fishSummary.reduce((sum, i) => sum + i.boxesCount, 0);
          renderPanels();
        }
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
   * Exporta la tabla de proyecciones a un archivo CSV descargable.
   */
  function exportCSV() {
    if (!fishData || !fishData.fishSummary || fishData.fishSummary.length === 0) {
      UI.showToast('No hay datos para exportar', 'warning');
      return;
    }

    const todayStr = getTodayKey();
    const deptName = currentDeptFilter === 'all' ? 'Parque Global' : currentDeptFilter.toUpperCase();

    let csvContent = `Control Animal Selwo - Proyección de Pedido de Pescado (${deptName})\n`;
    csvContent += `Fecha del Reporte: ${new Date().toLocaleString()}\n\n`;
    csvContent += `Tipo de Pescado,Consumo Diario (kg),Estimacion Mensual (kg),Estimacion Anual (kg),Peso Caja (kg),Cajas Estimadas/Dia,Animales Destino\n`;

    fishData.fishSummary.forEach(i => {
      const animals = `"${i.animalList.join('; ')}"`;
      csvContent += `"${i.label}",${i.dailyKg},${i.monthlyKg},${i.annualKg},${i.defaultBoxKg},${i.boxesCount},${animals}\n`;
    });

    csvContent += `TOTAL GLOBAL,${fishData.grandTotals.dailyKg},${fishData.grandTotals.monthlyKg},${fishData.grandTotals.annualKg},-,${fishData.grandTotals.totalBoxes},-\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Pedido_Pescado_Selwo_${currentDeptFilter}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    UI.showToast('📥 CSV exportado correctamente', 'success');
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
    toggleDefrostStatus,
    exportCSV,
    refreshData: loadDataAndRenderPanels
  };
})();

window.App.Views = window.App.Views || {};
window.App.Views.FishManagement = App.FishManagement;

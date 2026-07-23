/* ============================================================
   UI - Shared UI Components for Control Animal Selwo v2
   ============================================================ */
window.App = window.App || {};

App.UI = (() => {
  'use strict';

  const H = App.Helpers;

  // ── Toast Container ───────────────────────────────────────
  function ensureToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Show a toast notification.
   * @param {string} message - Toast message
   * @param {'success'|'error'|'info'} type - Toast type
   * @param {number} duration - Duration in ms (default 3000)
   */
  function showToast(message, type = 'success', duration = 3000) {
    const container = ensureToastContainer();
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ'}</span>
      <span class="toast-message">${H.escapeHtml(message)}</span>
      <div class="toast-progress"><div class="toast-progress-bar" style="animation-duration:${duration}ms"></div></div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ── Modal ─────────────────────────────────────────────────
  let activeModal = null;

  /**
   * Show a modal dialog.
   * @param {Object} options - { title, contentHtml, onSave, saveLabel, showFooter, modalClass }
   */
  function showModal(options) {
    closeModal(); // Close any existing modal

    const { title, contentHtml, onSave, saveLabel = 'Guardar', showFooter = true, modalClass = '' } = options;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal ${modalClass}" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3>${H.escapeHtml(title)}</h3>
          <button class="modal-close" id="modal-close-btn" aria-label="Cerrar">&times;</button>
        </div>
        <div class="modal-body" id="modal-body">
          ${contentHtml}
        </div>
        ${showFooter ? `
        <div class="modal-footer">
          <button class="btn btn-outline" id="modal-cancel-btn">Cancelar</button>
          <button class="btn btn-primary" id="modal-save-btn">${H.escapeHtml(saveLabel)}</button>
        </div>
        ` : ''}
      </div>
    `;

    document.body.appendChild(overlay);
    activeModal = overlay;

    // Focus first input
    setTimeout(() => {
      const firstInput = overlay.querySelector('input, select, textarea');
      if (firstInput) firstInput.focus();
    }, 100);

    // Event listeners
    overlay.querySelector('#modal-close-btn').addEventListener('click', closeModal);
    if (showFooter) {
      overlay.querySelector('#modal-cancel-btn').addEventListener('click', closeModal);
      overlay.querySelector('#modal-save-btn').addEventListener('click', () => {
        if (onSave) onSave();
      });
    }
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  function closeModal() {
    if (activeModal) {
      activeModal.remove();
      activeModal = null;
    }
  }

  /**
   * Show a confirmation dialog.
   */
  function showConfirm(message, onConfirm, title = 'Confirmar') {
    showModal({
      title,
      contentHtml: `
        <div class="confirm-body">
          <div class="confirm-icon">⚠️</div>
          <p>${H.escapeHtml(message)}</p>
        </div>
      `,
      saveLabel: 'Confirmar',
      onSave: () => {
        closeModal();
        if (onConfirm) onConfirm();
      },
    });

    // Style confirm button as danger
    const saveBtn = document.getElementById('modal-save-btn');
    if (saveBtn) {
      saveBtn.className = 'btn btn-danger';
    }
  }

  // ── Dynamic Form Builder ──────────────────────────────────
  /**
   * Generate form HTML from field definitions.
   * @param {Array} fields - Array of field config objects from Helpers.FORM_FIELDS
   * @param {Object} data - Existing data for edit mode (optional)
   * @returns {string} HTML string
   */
  function buildFormHtml(fields, data = {}) {
    let html = '<form id="record-form" novalidate>';

    fields.forEach((field, idx) => {
      const value = data[field.name] || '';
      const displayValue = field.type === 'date' ? H.formatDateForInput(value) : value;
      const required = field.required ? 'required' : '';
      const isRow = idx < fields.length - 1 &&
        fields[idx + 1] &&
        !['textarea'].includes(field.type) &&
        !['textarea'].includes(fields[idx + 1]?.type) &&
        idx % 2 === 0;

      if (isRow && !['textarea'].includes(fields[idx + 1]?.type)) {
        // Will be part of a row, but we handle it simply
      }

      html += `<div class="form-group">`;
      html += `<label class="form-label" for="field-${field.name}">${H.escapeHtml(field.label)}${field.required ? ' *' : ''}</label>`;

      switch (field.type) {
        case 'textarea':
          html += `<textarea class="form-textarea" id="field-${field.name}" name="${field.name}" placeholder="${field.placeholder || ''}" ${required}>${H.escapeHtml(displayValue)}</textarea>`;
          break;
        case 'select':
          html += `<select class="form-select" id="field-${field.name}" name="${field.name}" ${required}>`;
          html += `<option value="">Seleccionar...</option>`;
          (field.options || []).forEach(opt => {
            const selected = displayValue === opt ? 'selected' : '';
            html += `<option value="${H.escapeHtml(opt)}" ${selected}>${H.escapeHtml(opt)}</option>`;
          });
          html += `</select>`;
          break;
        case 'number':
          html += `<input class="form-input" type="number" id="field-${field.name}" name="${field.name}" value="${H.escapeHtml(String(displayValue))}" placeholder="${field.placeholder || ''}" step="${field.step || '1'}" ${required}>`;
          break;
        case 'date':
          html += `<input class="form-input" type="date" id="field-${field.name}" name="${field.name}" value="${displayValue}" ${required}>`;
          break;
        case 'file':
          html += `<input class="form-input" type="file" id="field-${field.name}" name="${field.name}" accept="image/*" ${required}>`;
          break;
        default:
          html += `<input class="form-input" type="text" id="field-${field.name}" name="${field.name}" value="${H.escapeHtml(String(displayValue))}" placeholder="${field.placeholder || ''}" ${required}>`;
      }

      html += `<div class="form-error" id="error-${field.name}"></div>`;
      html += `</div>`;
    });

    html += '</form>';
    return html;
  }

  /**
   * Extract form data from the modal form.
   * @param {Array} fields - Field definitions
   * @returns {Object|null} - Form data or null if validation fails
   */
  function getFormData(fields) {
    const form = document.getElementById('record-form');
    if (!form) return null;

    const data = {};
    let isValid = true;

    fields.forEach(field => {
      const input = document.getElementById(`field-${field.name}`);
      const errorEl = document.getElementById(`error-${field.name}`);
      if (!input) return;

      let value = input.value.trim();

      // Type conversion
      if (field.type === 'number' && value) {
        value = parseFloat(value);
        if (isNaN(value)) {
          if (errorEl) errorEl.textContent = 'Introduce un número válido.';
          input.style.borderColor = 'var(--danger-500)';
          isValid = false;
          return;
        }
      }

      // Required validation
      if (field.required && !value && value !== 0) {
        if (errorEl) errorEl.textContent = 'Este campo es obligatorio.';
        input.style.borderColor = 'var(--danger-500)';
        isValid = false;
        return;
      }

      // Clear error
      if (errorEl) errorEl.textContent = '';
      input.style.borderColor = '';

      data[field.name] = value;
    });

    return isValid ? data : null;
  }

  // ── Breadcrumbs Renderer ──────────────────────────────────
  /**
   * Render breadcrumb navigation.
   * @param {Array} items - [{ label, path }] where last item has no path (current)
   */
  function renderBreadcrumbs(items) {
    return `
      <nav class="breadcrumbs" aria-label="Navegación">
        ${items.map((item, i) => {
          const isLast = i === items.length - 1;
          const sep = i > 0 ? '<span class="breadcrumb-sep">›</span>' : '';
          if (isLast) {
            return `${sep}<span class="breadcrumb-item active">${H.escapeHtml(item.label)}</span>`;
          }
          return `${sep}<span class="breadcrumb-item" onclick="App.Router.navigate('${item.path}')">${H.escapeHtml(item.label)}</span>`;
        }).join('')}
      </nav>
    `;
  }

  // ── Search Bar Renderer ───────────────────────────────────
  /**
   * Render search bar with optional filter dropdown.
   * @param {Object} options - { searchId, filterId, placeholder, filterOptions }
   */
  function renderSearchBar(options = {}) {
    const { searchId = 'search-input', filterId = 'filter-select', placeholder = 'Buscar...', filterOptions = [], filterLabel = 'Todas las especies' } = options;

    let html = '<div class="search-bar">';
    html += `
      <div class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input type="text" class="search-input" id="${searchId}" placeholder="${placeholder}" autocomplete="off">
      </div>
    `;

    if (filterOptions.length > 0) {
      html += `<select class="filter-select" id="${filterId}">`;
      html += `<option value="">${H.escapeHtml(filterLabel)}</option>`;
      filterOptions.forEach(opt => {
        html += `<option value="${H.escapeHtml(opt)}">${H.escapeHtml(opt)}</option>`;
      });
      html += `</select>`;
    }

    html += '</div>';
    return html;
  }

  // ── App Header with Global Search and Alerts ──────────────
  /**
   * Render the app header with back button, title, global search, and alerts.
   */
  function renderHeader(title, backPath = null) {
    return `
      <header class="app-header">
        ${backPath ? `<button class="header-back" onclick="App.Router.navigate('${backPath}')" aria-label="Volver">← <span class="header-back-text">Volver</span></button>` : ''}
        <span class="header-title">${H.escapeHtml(title)}</span>
        <div class="header-actions">
          <div class="global-search-container" id="global-search-container">
            <button class="header-btn" id="global-search-toggle" aria-label="Buscar" title="Buscar animal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <div class="global-search-panel" id="global-search-panel">
              <input type="text" class="global-search-input" id="global-search-input" placeholder="Buscar por nombre o especie..." autocomplete="off">
              <div class="global-search-results" id="global-search-results"></div>
            </div>
          </div>
          <div class="alerts-container" id="alerts-container">
            <button class="header-btn" id="alerts-toggle" aria-label="Alertas" title="Ver alertas">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span class="alerts-badge" id="alerts-badge-header" style="display:none">0</span>
            </button>
            <div class="alerts-dropdown" id="alerts-dropdown"></div>
          </div>
          <img src="assets/Logo_Selwo_Marina_Header_PNG.jpg" alt="Selwo Marina" class="header-logo" onclick="App.Router.navigate('/menu')" style="cursor:pointer" title="Ir al menú principal">
        </div>
      </header>
    `;
  }

  /**
   * Initialize header interactions (search + alerts).
   * Call this after inserting header into DOM.
   */
  async function initHeaderInteractions() {
    // Global Search
    const searchToggle = document.getElementById('global-search-toggle');
    const searchPanel = document.getElementById('global-search-panel');
    const searchInput = document.getElementById('global-search-input');
    const searchResults = document.getElementById('global-search-results');

    if (searchToggle && searchPanel) {
      searchToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        searchPanel.classList.toggle('open');
        if (searchPanel.classList.contains('open') && searchInput) {
          setTimeout(() => searchInput.focus(), 100);
        }
      });
    }

    if (searchInput && searchResults) {
      const doSearch = H.debounce(async () => {
        const query = searchInput.value.trim();
        if (query.length < 2) {
          searchResults.innerHTML = '';
          searchResults.style.display = 'none';
          return;
        }
        try {
          const results = await App.DB.AnimalService.search(query);
          if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">No se encontraron resultados</div>';
          } else {
            searchResults.innerHTML = results.slice(0, 8).map(animal => {
              const dept = H.getDeptMeta(animal.department);
              return `
                <div class="search-result-item" onclick="App.Router.navigate('/animal/${animal.id}/general'); document.getElementById('global-search-panel').classList.remove('open');">
                  <div class="search-result-emoji">${H.getSpeciesEmoji(animal.species)}</div>
                  <div class="search-result-info">
                    <div class="search-result-name">${H.escapeHtml(animal.name)}</div>
                    <div class="search-result-meta">${H.escapeHtml(animal.species)} · ${dept.name}</div>
                  </div>
                </div>
              `;
            }).join('');
          }
          searchResults.style.display = 'block';
        } catch {
          searchResults.innerHTML = '';
          searchResults.style.display = 'none';
        }
      }, 200);

      searchInput.addEventListener('input', doSearch);
    }

    // Close search on click outside
    document.addEventListener('click', (e) => {
      if (searchPanel && !searchPanel.contains(e.target) && e.target !== searchToggle) {
        searchPanel.classList.remove('open');
      }
    });

    // Alerts
    const alertsToggle = document.getElementById('alerts-toggle');
    const alertsDropdown = document.getElementById('alerts-dropdown');
    const alertsBadge = document.getElementById('alerts-badge-header');

    if (alertsToggle && alertsDropdown) {
      // Load alerts count
      try {
        const count = await App.Alerts.getActiveCount();
        if (alertsBadge) {
          alertsBadge.textContent = count > 99 ? '99+' : count;
          alertsBadge.style.display = count > 0 ? 'flex' : 'none';
        }
      } catch { /* ignore */ }

      alertsToggle.addEventListener('click', async (e) => {
        e.stopPropagation();
        const isOpen = alertsDropdown.classList.contains('open');
        if (!isOpen) {
          alertsDropdown.innerHTML = await App.Alerts.renderAlertsDropdown();
          // Extract the inner content (we returned a wrapper, just use innerHTML)
          const temp = document.createElement('div');
          temp.innerHTML = await App.Alerts.renderAlertsDropdown();
          alertsDropdown.innerHTML = temp.firstElementChild ? temp.firstElementChild.innerHTML : temp.innerHTML;
        }
        alertsDropdown.classList.toggle('open');
      });

      document.addEventListener('click', (e) => {
        if (alertsDropdown && !alertsDropdown.contains(e.target) && e.target !== alertsToggle) {
          alertsDropdown.classList.remove('open');
        }
      });
    }
  }

  // ── Data Table Renderer ───────────────────────────────────

  const ABBREVIATIONS = {
    arenque_grande: 'AG',
    arenque_pequeno: 'AP',
    sprat: 'Sp',
    capelin: 'Cp',
    caballa: 'Cab',
    bacaladilla: 'Bac',
    sardina: 'Srd',
    merlan: 'Mrl',
    merluza: 'Mlz'
  };

  /**
   * Format a food_type value for display.
   * Handles JSON strings like '{"arenque_grande":0.5,"sprat":0.2}'
   * and returns friendly abbreviations like "AG, Sp".
   */
  function formatFoodType(value) {
    if (!value || value === '—') return '<span class="text-empty">Sin alimento</span>';

    try {
      let parsed = JSON.parse(value);
      
      // If it's an array of objects (like the extra_foods array)
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) return '<span class="text-empty">Sin alimento</span>';
        return parsed.map(item => {
          const name = (item.name || item.nombre || '').toLowerCase().replace(/ /g, '_');
          return ABBREVIATIONS[name] || H.capitalize(H.escapeHtml(item.name || item.nombre || 'Desconocido'));
        }).join(', ');
      }

      // If it's an object {"arenque_grande": 0.5, "sprat": 0.2}
      if (parsed && typeof parsed === 'object') {
        const types = [];
        for (const [key, amount] of Object.entries(parsed)) {
          if (amount && parseFloat(amount) > 0) {
            types.push(ABBREVIATIONS[key] || H.capitalize(key.replace(/_/g, ' ')));
          }
        }
        if (types.length > 0) return types.join(', ');
      }
    } catch (e) {
      // Not JSON — return as-is text
    }

    // Plain text value
    const trimmed = value.trim();
    if (!trimmed) return '<span class="text-empty">Sin alimento</span>';
    return H.escapeHtml(trimmed);
  }

  function calculateFoodTotal(value) {
    if (!value || value === '—') return 0;
    try {
      let parsed = JSON.parse(value);
      let total = 0;
      if (Array.isArray(parsed)) {
        parsed.forEach(item => { total += parseFloat(item.kg || item.cantidad || 0); });
      } else if (parsed && typeof parsed === 'object') {
        for (const amount of Object.values(parsed)) {
          total += parseFloat(amount || 0);
        }
      }
      return total;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Format a cell value, handling empty/dash values gracefully.
   */
  function formatCellValue(value, col, record) {
    if (col.format) return col.format(value);

    // Special handling for food_type column
    if (col.key === 'food_type' || col.key === 'alimento') {
      return formatFoodType(value);
    }

    // Special handling for quantity column - compute from JSON
    if (col.key === 'quantity' || col.key === 'cantidad_gramos') {
      const foodValue = record.food_type || record.alimento;
      const total = calculateFoodTotal(foodValue);
      if (total > 0) {
        return `${total.toFixed(2).replace(/\.00$/, '')} kg`;
      }
    }

    if (col.truncate) {
      const text = H.escapeHtml(value || '');
      if (!text || text === '—') return '<span class="text-empty">Sin observaciones</span>';
      return H.truncate(text, col.truncate);
    }

    const text = value || '';
    if (!text || text === '—') {
      // Contextual empty text
      if (col.key === 'observations') return '<span class="text-empty">Sin observaciones</span>';
      if (col.key === 'quantity' || col.key === 'cantidad_gramos') return '<span class="text-empty">—</span>';
      return '<span class="text-empty">—</span>';
    }

    return H.escapeHtml(text);
  }

  /**
   * Render a data table with action buttons.
   * @param {Array} records - Data records
   * @param {Array} columns - Column definitions from Helpers.TABLE_COLUMNS
   * @param {Object} options - { onEdit, onDelete, type, animalId, showAnimalName, animalMap, deptId }
   */
  function renderTable(records, columns, options = {}) {
    const { type, animalId, showAnimalName = false, animalMap = {}, deptId = '' } = options;

    if (!records || records.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <p class="empty-state-text">No hay registros todavía.</p>
          ${type && animalId ? `<button class="btn btn-primary" onclick="App.Views.openRecordForm('${type}', '${animalId}')">Añadir registro</button>` : ''}
        </div>
      `;
    }

    // Sort by date descending
    const sorted = [...records].sort((a, b) => {
      if (a.date && b.date) return new Date(b.date) - new Date(a.date);
      return 0;
    });

    let html = '<div class="table-container"><table class="table table-enhanced">';

    // Header
    html += '<thead><tr>';
    if (showAnimalName) html += '<th class="col-animal">Animal</th>';
    columns.forEach(col => {
      html += `<th class="col-${col.key}">${H.escapeHtml(col.label)}</th>`;
    });
    html += '<th style="text-align:right">Acciones</th>';
    html += '</tr></thead>';

    // Body
    html += '<tbody>';
    sorted.forEach(record => {
      html += '<tr>';
      if (showAnimalName) {
        const aName = animalMap[record.animal_id] || '—';
        if (aName !== '—' && record.animal_id) {
          // Clickable animal name → navigate to that animal's diet tab
          html += `<td class="col-animal"><a href="#/animal/${record.animal_id}/diets" class="animal-link" title="Ver dietas de ${H.escapeHtml(aName)}">${H.escapeHtml(aName)}</a></td>`;
        } else {
          html += `<td class="col-animal"><span class="text-empty">—</span></td>`;
        }
      }
      columns.forEach(col => {
        html += `<td class="col-${col.key}">${formatCellValue(record[col.key], col, record)}</td>`;
      });
      html += `<td class="actions-cell">`;
      html += `<button class="btn-action btn-action-edit" onclick="App.Views.openRecordForm('${type}', '${record.animal_id}', '${record.id}')" title="Editar registro">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>`;
      html += `<button class="btn-action btn-action-delete" onclick="App.Views.deleteRecord('${type}', '${record.id}')" title="Eliminar registro">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      </button>`;
      html += `</td>`;
      html += '</tr>';
    });
    html += '</tbody></table></div>';

    return html;
  }

  return {
    showToast,
    showModal,
    closeModal,
    showConfirm,
    buildFormHtml,
    getFormData,
    renderBreadcrumbs,
    renderSearchBar,
    renderHeader,
    initHeaderInteractions,
    renderTable,
  };
})();

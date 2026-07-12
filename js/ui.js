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
   * @param {Object} options - { title, contentHtml, onSave, saveLabel, showFooter }
   */
  function showModal(options) {
    closeModal(); // Close any existing modal

    const { title, contentHtml, onSave, saveLabel = 'Guardar', showFooter = true } = options;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
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
  /**
   * Render a data table with action buttons.
   * @param {Array} records - Data records
   * @param {Array} columns - Column definitions from Helpers.TABLE_COLUMNS
   * @param {Object} options - { onEdit, onDelete, type, animalId }
   */
  function renderTable(records, columns, options = {}) {
    const { type, animalId, showAnimalName = false, animalMap = {} } = options;

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

    let html = '<div class="table-container"><table class="table">';

    // Header
    html += '<thead><tr>';
    if (showAnimalName) html += '<th>Animal</th>';
    columns.forEach(col => {
      html += `<th>${H.escapeHtml(col.label)}</th>`;
    });
    html += '<th style="text-align:right">Acciones</th>';
    html += '</tr></thead>';

    // Body
    html += '<tbody>';
    sorted.forEach(record => {
      html += '<tr>';
      if (showAnimalName) {
        const aName = animalMap[record.animal_id] || '—';
        html += `<td><strong>${H.escapeHtml(aName)}</strong></td>`;
      }
      columns.forEach(col => {
        let value = record[col.key];
        if (col.format) value = col.format(value);
        else if (col.truncate) value = H.truncate(H.escapeHtml(value || ''), col.truncate);
        else value = H.escapeHtml(value || '—');
        html += `<td>${value}</td>`;
      });
      html += `<td class="actions-cell">`;
      html += `<button class="btn btn-ghost btn-icon" onclick="App.Views.openRecordForm('${type}', '${record.animal_id}', '${record.id}')" title="Editar">✏️</button>`;
      html += `<button class="btn btn-ghost btn-icon" onclick="App.Views.deleteRecord('${type}', '${record.id}')" title="Eliminar">🗑️</button>`;
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

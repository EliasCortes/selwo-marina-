/* ============================================================
   EXPORT HEADER UI COMPONENT - Botonera reutilizable de Exportación e Impresión
   ============================================================ */
window.App = window.App || {};

App.ExportHeader = (() => {
  'use strict';

  /**
   * Genera el HTML de la botonera de acciones (Imprimir + Dropdown Exportar).
   * @param {Object} options
   * @param {string} options.exportHandlerGlobal - Expresión JS global para llamar al exportar (ej: "App.Views.exportSectionData('animals', 'leones', '%FORMAT%')")
   * @param {string} options.printHandlerGlobal - Expresión JS global para llamar al imprimir (ej: "App.Views.printSectionData('animals', 'leones')")
   * @param {string} [options.menuId] - ID único para el menú desplegable
   * @returns {string} HTML de la botonera
   */
  function renderExportActions(options = {}) {
    const menuId = options.menuId || `export-menu-${Math.random().toString(36).substring(2, 9)}`;
    const exportHandler = options.exportHandlerGlobal || '';
    const printHandler = options.printHandlerGlobal || '';

    return `
      <div class="export-actions-group" style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
        <div class="dropdown-export" style="position:relative; display:inline-block;">
          <button class="btn btn-outline" onclick="App.ExportHeader.toggleMenu('${menuId}', event)" type="button">
            <span>📊 Exportar ▾</span>
          </button>
          <div id="${menuId}" class="card shadow-md export-dropdown-menu" style="display:none; position:absolute; right:0; top:110%; z-index:100; min-width:210px; padding:0.5rem; background:var(--surface-card); border:1px solid var(--gray-200); border-radius:var(--radius-md);">
            <button class="btn btn-sm btn-ghost" style="width:100%; text-align:left; justify-content:flex-start; margin-bottom:4px;" onclick="${exportHandler.replace('%FORMAT%', 'xlsx')}" type="button">
              📊 Exportar Excel (.xlsx)
            </button>
            <button class="btn btn-sm btn-ghost" style="width:100%; text-align:left; justify-content:flex-start; margin-bottom:4px;" onclick="${exportHandler.replace('%FORMAT%', 'txt')}" type="button">
              📄 Exportar Texto / Word (.txt)
            </button>
            <button class="btn btn-sm btn-ghost" style="width:100%; text-align:left; justify-content:flex-start;" onclick="${exportHandler.replace('%FORMAT%', 'csv')}" type="button">
              📋 Exportar CSV (.csv)
            </button>
          </div>
        </div>
        <button class="btn btn-primary print-btn" onclick="${printHandler}" type="button">
          <span>🖨️ Imprimir / Generar Ficha</span>
        </button>
      </div>
    `;
  }

  function toggleMenu(menuId, event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById(menuId);
    if (!menu) return;
    const isVisible = menu.style.display === 'block';
    // Cerrar otros menús desplegables abiertos
    document.querySelectorAll('.export-dropdown-menu').forEach(m => m.style.display = 'none');
    menu.style.display = isVisible ? 'none' : 'block';
  }

  // Listener global para cerrar dropdowns al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-export')) {
      document.querySelectorAll('.export-dropdown-menu').forEach(m => m.style.display = 'none');
    }
  });

  return {
    renderExportActions,
    toggleMenu
  };
})();

if (window.App.UI) {
  window.App.UI.renderExportActions = App.ExportHeader.renderExportActions;
}

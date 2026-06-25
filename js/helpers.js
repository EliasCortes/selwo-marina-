/* ============================================================
   HELPERS - Utility functions for Control Animal Selwo
   ============================================================ */
window.App = window.App || {};

App.Helpers = (() => {
  'use strict';

  // ── ID Generation ─────────────────────────────────────────
  function generateId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }

  // ── Date Formatting ───────────────────────────────────────
  function formatDate(isoString) {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function formatDateForInput(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toISOString().split('T')[0];
  }

  function formatDateTime(isoString) {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function today() {
    return new Date().toISOString().split('T')[0];
  }

  // ── String Utilities ──────────────────────────────────────
  function truncate(str, len = 50) {
    if (!str || str.length <= len) return str || '';
    return str.slice(0, len) + '…';
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Debounce ──────────────────────────────────────────────
  function debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ── Department Metadata ───────────────────────────────────
  const DEPARTMENTS = [
    { id: 'aves', name: 'Aves', icon: '🦅', cssClass: 'aves', gradient: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(14,165,233,0.15))' },
    { id: 'pinguinario', name: 'Pingüinario', icon: '🐧', cssClass: 'pinguinario', gradient: 'linear-gradient(135deg, rgba(147,197,253,0.2), rgba(96,165,250,0.15))' },
    { id: 'amazonia', name: 'Amazonia', icon: '🌿', cssClass: 'amazonia', gradient: 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(16,185,129,0.15))' },
    { id: 'leones', name: 'Leones Marinos', icon: '🦭', cssClass: 'leones', gradient: 'linear-gradient(135deg, rgba(0,180,216,0.2), rgba(0,119,182,0.15))' },
  ];

  function getDeptMeta(deptId) {
    return DEPARTMENTS.find(d => d.id === deptId) || DEPARTMENTS[0];
  }

  // ── Section Metadata ──────────────────────────────────────
  const SECTIONS = [
    { id: 'animals', name: 'Animales', icon: '🐾' },
    { id: 'diets', name: 'Dietas', icon: '🍽️' },
    { id: 'trainings', name: 'Entrenos', icon: '🎯' },
    { id: 'weights', name: 'Pesos', icon: '⚖️' },
    { id: 'enrichments', name: 'Enriquecimientos', icon: '🧩' },
    { id: 'veterinary', name: 'Veterinaria', icon: '🏥' },
    { id: 'reports', name: 'Reports', icon: '📊' },
  ];

  function getSectionMeta(sectionId) {
    return SECTIONS.find(s => s.id === sectionId) || SECTIONS[0];
  }

  // ── Tab Metadata (Animal Card Tabs) ───────────────────────
  const TABS = [
    { id: 'general', name: 'Datos Generales', icon: '📋' },
    { id: 'diets', name: 'Dieta', icon: '🍽️' },
    { id: 'trainings', name: 'Entrenos', icon: '🎯' },
    { id: 'weights', name: 'Pesos', icon: '⚖️' },
    { id: 'enrichments', name: 'Enriquecimientos', icon: '🧩' },
    { id: 'veterinary', name: 'Veterinaria', icon: '🏥' },
  ];

  // ── Species Emoji Map ─────────────────────────────────────
  const SPECIES_EMOJI = {
    'Águila de Harris': '🦅',
    'Búho Real': '🦉',
    'Guacamayo Azul': '🦜',
    'Buitre Leonado': '🦅',
    'Pingüino de Humboldt': '🐧',
    'Pingüino de Magallanes': '🐧',
    'Tucán Toco': '🐦',
    'Boa Esmeralda': '🐍',
    'Tití Pigmeo': '🐒',
    'Guacamayo Jacinto': '🦜',
    'León Marino de California': '🦭',
    'León Marino de la Patagonia': '🦭',
  };

  function getSpeciesEmoji(species) {
    return SPECIES_EMOJI[species] || '🐾';
  }

  // ── Sex Badge ─────────────────────────────────────────────
  function getSexBadge(sex) {
    if (sex === 'Macho') return '<span class="badge badge-male">♂ Macho</span>';
    if (sex === 'Hembra') return '<span class="badge badge-female">♀ Hembra</span>';
    return '<span class="badge">—</span>';
  }

  function getStatusBadge(status) {
    const map = {
      'Activo': 'active',
      'Transferido': 'transferred',
      'Fallecido': 'deceased',
    };
    const cls = map[status] || 'active';
    return `<span class="badge badge-${cls}">${escapeHtml(status)}</span>`;
  }

  function getPriorityBadge(priority) {
    const map = {
      'Alta': 'high',
      'Media': 'medium',
      'Baja': 'low',
      'Rutina': 'routine',
    };
    const cls = map[priority] || 'routine';
    return `<span class="badge badge-${cls}">${escapeHtml(priority)}</span>`;
  }

  // ── Form Field Definitions ────────────────────────────────
  const FORM_FIELDS = {
    diets: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'food_type', label: 'Tipo de Alimento', type: 'text', required: true, placeholder: 'Ej: Pescado, fruta, pienso...' },
      { name: 'quantity', label: 'Cantidad', type: 'text', required: true, placeholder: 'Ej: 500g, 2 piezas...' },
      { name: 'observations', label: 'Observaciones', type: 'textarea', placeholder: 'Notas adicionales...' },
    ],
    trainings: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'behavior', label: 'Comportamiento Trabajado', type: 'text', required: true, placeholder: 'Ej: Target, Estación...' },
      { name: 'result', label: 'Resultado', type: 'select', required: true, options: ['Excelente', 'Bueno', 'Regular', 'Necesita mejora'] },
      { name: 'observations', label: 'Observaciones', type: 'textarea', placeholder: 'Notas sobre la sesión...' },
    ],
    weights: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'weight_kg', label: 'Peso (kg)', type: 'number', required: true, step: '0.01', placeholder: 'Ej: 4.5' },
      { name: 'observations', label: 'Observaciones', type: 'textarea', placeholder: 'Condición corporal, notas...' },
    ],
    enrichments: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'enrichment_type', label: 'Tipo de Enriquecimiento', type: 'text', required: true, placeholder: 'Ej: Alimenticio, Sensorial...' },
      { name: 'result', label: 'Resultado', type: 'select', required: true, options: ['Positivo', 'Neutro', 'Negativo'] },
      { name: 'observations', label: 'Observaciones', type: 'textarea', placeholder: 'Respuesta del animal...' },
    ],
    veterinary: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'diagnosis', label: 'Diagnóstico', type: 'text', required: true, placeholder: 'Diagnóstico...' },
      { name: 'treatment', label: 'Tratamiento', type: 'textarea', placeholder: 'Tratamiento aplicado...' },
      { name: 'medication', label: 'Medicación', type: 'text', placeholder: 'Medicación prescrita...' },
      { name: 'priority', label: 'Prioridad', type: 'select', required: true, options: ['Rutina', 'Baja', 'Media', 'Alta'] },
      { name: 'observations', label: 'Observaciones', type: 'textarea', placeholder: 'Observaciones clínicas...' },
    ],
    animals: [
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'species', label: 'Especie', type: 'text', required: true },
      { name: 'sex', label: 'Sexo', type: 'select', required: true, options: ['Macho', 'Hembra'] },
      { name: 'birth_date', label: 'Fecha de Nacimiento', type: 'date' },
      { name: 'zims_id', label: 'ZIMS ID', type: 'text', required: true, placeholder: 'Ej: AV-2020-001' },
      { name: 'microchip', label: 'Microchip', type: 'text', placeholder: 'Código de microchip' },
      { name: 'location', label: 'Ubicación', type: 'text', placeholder: 'Ubicación en el recinto' },
      { name: 'status', label: 'Estado', type: 'select', options: ['Activo', 'Transferido', 'Fallecido'] },
      { name: 'observations', label: 'Observaciones', type: 'textarea', placeholder: 'Observaciones generales...' },
    ],
  };

  // ── Table Column Definitions ──────────────────────────────
  const TABLE_COLUMNS = {
    diets: [
      { key: 'date', label: 'Fecha', format: formatDate },
      { key: 'food_type', label: 'Alimento' },
      { key: 'quantity', label: 'Cantidad' },
      { key: 'observations', label: 'Observaciones', truncate: 40 },
    ],
    trainings: [
      { key: 'date', label: 'Fecha', format: formatDate },
      { key: 'behavior', label: 'Comportamiento' },
      { key: 'result', label: 'Resultado' },
      { key: 'observations', label: 'Observaciones', truncate: 40 },
    ],
    weights: [
      { key: 'date', label: 'Fecha', format: formatDate },
      { key: 'weight_kg', label: 'Peso (kg)', format: v => v ? `${v} kg` : '—' },
      { key: 'observations', label: 'Observaciones', truncate: 40 },
    ],
    enrichments: [
      { key: 'date', label: 'Fecha', format: formatDate },
      { key: 'enrichment_type', label: 'Tipo' },
      { key: 'result', label: 'Resultado' },
      { key: 'observations', label: 'Observaciones', truncate: 40 },
    ],
    veterinary: [
      { key: 'date', label: 'Fecha', format: formatDate },
      { key: 'diagnosis', label: 'Diagnóstico' },
      { key: 'treatment', label: 'Tratamiento', truncate: 30 },
      { key: 'medication', label: 'Medicación' },
      { key: 'priority', label: 'Prioridad', format: getPriorityBadge },
      { key: 'observations', label: 'Observaciones', truncate: 30 },
    ],
  };

  // ── Public API ────────────────────────────────────────────
  return {
    generateId,
    formatDate,
    formatDateForInput,
    formatDateTime,
    today,
    truncate,
    capitalize,
    escapeHtml,
    debounce,
    DEPARTMENTS,
    getDeptMeta,
    SECTIONS,
    getSectionMeta,
    TABS,
    SPECIES_EMOJI,
    getSpeciesEmoji,
    getSexBadge,
    getStatusBadge,
    getPriorityBadge,
    FORM_FIELDS,
    TABLE_COLUMNS,
  };
})();

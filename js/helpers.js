/* ============================================================
   HELPERS - Utility functions for Control Animal Selwo v2
   ============================================================ */
window.App = window.App || {};

App.Helpers = (() => {
  'use strict';

  // ── ID Generation (UUID) ────────────────────────────────────
  function generateId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    // Fallback para navegadores sin crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
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

  function daysAgo(dateStr) {
    if (!dateStr) return Infinity;
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
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

  // ── SVG Department Icons ──────────────────────────────────
  const DEPT_ICONS = {
    aves: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Cuerpo del Guacamayo -->
      <path d="M48 14c-5-4-12-3-15 2-3 5-2 11 1 15l-1 5c-3 1-6-1-8-3l-2 2c2 3 5 5 9 4l2-4c3-1 5 1 6 3l1 7c2 5 6 8 11 7 4-1 7-4 7-9v-6c2-4 1-9-1-12c-2-3-5-6-10-8z" fill="url(#aves_g)" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
      <!-- Ala de color azul tropical -->
      <path d="M34 32c-3 4-4 10-3 15 2 7 6 12 11 15l1-6c2-4 1-8-1-11l-8-13z" fill="url(#aves_wing)" stroke="rgba(255,255,255,0.3)" stroke-width="0.8"/>
      <!-- Pico característico de loro -->
      <path d="M33 18c-3 1-5 4-5 8 0 1 .5 2 1.5 2h1c1.5-2 2-5 2.5-10z" fill="#f59e0b" stroke="rgba(255,255,255,0.3)" stroke-width="0.8"/>
      <!-- Ojo -->
      <circle cx="42" cy="22" r="2.5" fill="white" opacity="0.9"/>
      <circle cx="42" cy="22" r="1.2" fill="#1a1a2e"/>
      <defs>
        <linearGradient id="aves_g" x1="30" y1="14" x2="60" y2="55" gradientUnits="userSpaceOnUse">
          <stop stop-color="#ef4444"/><stop offset="0.6" stop-color="#f97316"/><stop offset="1" stop-color="#f59e0b"/>
        </linearGradient>
        <linearGradient id="aves_wing" x1="30" y1="32" x2="45" y2="60" gradientUnits="userSpaceOnUse">
          <stop stop-color="#3b82f6"/><stop offset="1" stop-color="#06b6d4"/>
        </linearGradient>
      </defs>
    </svg>`,

    pinguinario: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Cuerpo del Pingüino (Silueta Geométrica) -->
      <path d="M40 16c-8.5 0-14 6-14 16v18c0 10.5 6 15 14 15s14-4.5 14-15V32c0-10-5.5-16-14-16z" fill="url(#ping_g)" stroke="rgba(255,255,255,0.4)" stroke-width="1.2"/>
      <!-- Pecho Blanco Curvo -->
      <path d="M40 26c-5 0-8 4-8 10v14c0 7 3.5 10 8 10s8-3 8-10V36c0-6-3-10-8-10z" fill="#ffffff" opacity="0.95"/>
      <!-- Alas Laterales -->
      <path d="M22 36c-2 6-1.5 14 2 19 1 .5 2 0 2-1V38c0-3-1.5-5-4-2z" fill="url(#ping_g_dark)" />
      <path d="M58 36c2 6 1.5 14-2 19-1 .5-2 0-2-1V38c0-3 1.5-5 4-2z" fill="url(#ping_g_dark)" />
      <!-- Pico Dorado -->
      <path d="M37 29.5h6l-3 4.5-3-4.5z" fill="#f59e0b" stroke="none"/>
      <!-- Ojos -->
      <circle cx="36" cy="26" r="1.5" fill="#0f172a"/>
      <circle cx="44" cy="26" r="1.5" fill="#0f172a"/>
      <defs>
        <linearGradient id="ping_g" x1="40" y1="16" x2="40" y2="65" gradientUnits="userSpaceOnUse">
          <stop stop-color="#1e293b"/><stop offset="1" stop-color="#0f172a"/>
        </linearGradient>
        <linearGradient id="ping_g_dark" x1="20" y1="36" x2="30" y2="55" gradientUnits="userSpaceOnUse">
          <stop stop-color="#0f172a"/><stop offset="1" stop-color="#020617"/>
        </linearGradient>
      </defs>
    </svg>`,

    amazonia: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Cuerpo Enroscado (Curvas S-geométricas) -->
      <path d="M26 50c-4.5-4.5-5-12 0-17s12-5 17 0s5 12 0 17s-12 5-17 0z" stroke="url(#snake_g1)" stroke-width="6.5" stroke-linecap="round" fill="none" opacity="0.95"/>
      <path d="M43 33c4.5-4.5 12-4.5 16.5 0s4.5 12 0 16.5s-12 4.5-16.5 0" stroke="url(#snake_g2)" stroke-width="6.5" stroke-linecap="round" fill="none"/>
      <!-- Cabeza -->
      <path d="M57.5 32c1.5-1.5 4-1.5 5.5 0s1.5 4 0 5.5l-3.5 3.5" stroke="url(#snake_head_g)" stroke-width="6.5" stroke-linecap="round" fill="none"/>
      <!-- Lengua Roja -->
      <path d="M63.5 31.5l3.5-2.5m-3.5 2.5l1.5-4.5" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Ojo -->
      <circle cx="61.5" cy="33.5" r="1" fill="#ffffff"/>
      <defs>
        <linearGradient id="snake_g1" x1="20" y1="30" x2="45" y2="55" gradientUnits="userSpaceOnUse">
          <stop stop-color="#059669"/><stop offset="1" stop-color="#10b981"/>
        </linearGradient>
        <linearGradient id="snake_g2" x1="40" y1="30" x2="60" y2="50" gradientUnits="userSpaceOnUse">
          <stop stop-color="#10b981"/><stop offset="1" stop-color="#34d399"/>
        </linearGradient>
        <linearGradient id="snake_head_g" x1="55" y1="30" x2="65" y2="40" gradientUnits="userSpaceOnUse">
          <stop stop-color="#10b981"/><stop offset="1" stop-color="#059669"/>
        </linearGradient>
      </defs>
    </svg>`,

    leones: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Cuerpo del León Marino -->
      <path d="M22 55c5-16 12-25 24-27 10-1.5 16 3 14 11s-9 14-16 16c-8 2-15 1.5-22 0z" fill="url(#leon_g)" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
      <!-- Cuello y Cabeza -->
      <path d="M42 29c4-9 11-13 17-10s8 9 5 16c-3 7-10 11-16 10s-8-3-6-16z" fill="url(#leon_g)" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
      <!-- Aleta Lateral -->
      <path d="M38 48c4 3 6 8 5 13-3 1-6-1-8-5-2-4-1-6 3-8z" fill="url(#leon_fin_g)" />
      <!-- Bigotes -->
      <path d="M60 21c3 .5 5 1.5 6 3m-7-2c3 0 5 1 6 2.5" stroke="rgba(255,255,255,0.6)" stroke-width="0.8" stroke-linecap="round"/>
      <!-- Ojo -->
      <circle cx="56" cy="18" r="1.5" fill="white" opacity="0.9"/>
      <circle cx="56" cy="18" r="0.8" fill="#0f172a"/>
      <defs>
        <linearGradient id="leon_g" x1="20" y1="20" x2="60" y2="55" gradientUnits="userSpaceOnUse">
          <stop stop-color="#00b4d8"/><stop offset="0.6" stop-color="#0077b6"/><stop offset="1" stop-color="#03001e"/>
        </linearGradient>
        <linearGradient id="leon_fin_g" x1="30" y1="48" x2="45" y2="60" gradientUnits="userSpaceOnUse">
          <stop stop-color="#0077b6"/><stop offset="1" stop-color="#005682"/>
        </linearGradient>
      </defs>
    </svg>`
  };

  function getDeptIcon(deptId) {
    return DEPT_ICONS[deptId] || DEPT_ICONS.aves;
  }

  // ── Department Metadata ───────────────────────────────────
  const DEPARTMENTS = [
    { id: 'aves', name: 'Aves', icon: '🦜', cssClass: 'aves', gradient: 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(245,158,11,0.18))' },
    { id: 'pinguinario', name: 'Pingüinario', icon: '🐧', cssClass: 'pinguinario', gradient: 'linear-gradient(135deg, rgba(147,197,253,0.2), rgba(96,165,250,0.15))' },
    { id: 'amazonia', name: 'Amazonia', icon: '🐍', cssClass: 'amazonia', gradient: 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(16,185,129,0.15))' },
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

  // ── Default Photo Placeholder SVG ─────────────────────────
  function getDefaultPhotoSvg(species) {
    const emoji = getSpeciesEmoji(species);
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="%23e8f4f8" width="200" height="200" rx="100"/><text x="100" y="115" text-anchor="middle" font-size="70">${emoji}</text></svg>`)}`;
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

  // ── Weight Unit Helpers ───────────────────────────────────
  function getWeightUnit(animalId) {
    try {
      const units = JSON.parse(localStorage.getItem('weight_units') || '{}');
      return units[animalId] || 'kg';
    } catch { return 'kg'; }
  }

  function setWeightUnit(animalId, unit) {
    try {
      const units = JSON.parse(localStorage.getItem('weight_units') || '{}');
      units[animalId] = unit;
      localStorage.setItem('weight_units', JSON.stringify(units));
    } catch { /* ignore */ }
  }

  function formatWeight(kg, unit) {
    if (kg === null || kg === undefined) return '—';
    if (unit === 'g') return `${(kg * 1000).toFixed(0)} g`;
    return `${kg} kg`;
  }

  // ── Alert Type Metadata ───────────────────────────────────
  const ALERT_TYPES = {
    diet_pending: { label: 'Dieta pendiente', icon: '🍽️', color: 'var(--warning-500)' },
    training_pending: { label: 'Entreno pendiente', icon: '🎯', color: 'var(--accent-500)' },
    vet_review: { label: 'Revisión veterinaria', icon: '🏥', color: 'var(--danger-500)' },
    medication: { label: 'Medicación pendiente', icon: '💊', color: 'var(--danger-600)' },
    weight_control: { label: 'Control de peso', icon: '⚖️', color: 'var(--accent-600)' },
  };

  // ── User Roles (Preparatory) ──────────────────────────────
  const USER_ROLES = {
    admin: { label: 'Administrador', permissions: ['all'] },
    trainer: { label: 'Entrenador', permissions: ['read', 'trainings', 'enrichments', 'weights'] },
    vet: { label: 'Veterinario', permissions: ['read', 'veterinary', 'weights', 'diets'] },
    caretaker: { label: 'Cuidador', permissions: ['read', 'diets', 'weights', 'enrichments'] },
  };

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
      { name: 'weight_kg', label: 'Peso (kg)', type: 'number', required: true, step: '0.001', placeholder: 'Ej: 4.5' },
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
      { name: 'foto_upload', label: 'Foto del Animal', type: 'file' },
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
    daysAgo,
    truncate,
    capitalize,
    escapeHtml,
    debounce,
    DEPARTMENTS,
    getDeptMeta,
    getDeptIcon,
    DEPT_ICONS,
    SECTIONS,
    getSectionMeta,
    TABS,
    SPECIES_EMOJI,
    getSpeciesEmoji,
    getDefaultPhotoSvg,
    getSexBadge,
    getStatusBadge,
    getPriorityBadge,
    getWeightUnit,
    setWeightUnit,
    formatWeight,
    ALERT_TYPES,
    USER_ROLES,
    FORM_FIELDS,
    TABLE_COLUMNS,
  };
})();

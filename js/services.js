/* ============================================================
   SERVICES - Service Layer for Control Animal Selwo v2
   ============================================================ */
window.App = window.App || {};
window.App.Services = window.App.Services || {};

App.Services.Fish = (() => {
  'use strict';

  /**
   * Wrapper global para llamar al servicio de consumo de pescado.
   * Carga dinámicamente el módulo ES6 de Supabase.
   */
  async function getFishConsumptionSummary(options = {}) {
    const { getFishConsumptionSummary: fetchSummary } = await import('../src/services/animalService.js?v=16');
    return await fetchSummary(options);
  }

  return {
    getFishConsumptionSummary,
  };
})();

/* ============================================================
   APP - Main Application Entry Point for Control Animal Selwo v2
   ============================================================ */
window.App = window.App || {};

(async () => {
  'use strict';

  const Router = App.Router;
  const Views = App.Views;
  const DB = App.DB;

  /**
   * Navigate convenience function.
   */
  App.navigate = (path) => Router.navigate(path);

  /**
   * Initialize the application.
   */
  async function init() {
    console.log('[App] Initializing Control Animal Selwo v2...');

    try {
      // 1. Initialize database
      await DB.init();
      console.log('[App] Database initialized.');

      // 2. Seed test data if first run
      const wasSeeded = await App.Seed.seedAll();
      if (wasSeeded) {
        console.log('[App] Test data seeded successfully.');
      }

      // 3. Generate initial alerts
      try {
        await App.Alerts.generateAlerts();
        console.log('[App] Alerts generated.');
      } catch (err) {
        console.warn('[App] Alert generation skipped:', err.message);
      }

      // 4. Setup routes
      setupRoutes();

      // 5. Start router
      Router.init();

      console.log('[App] Application ready!');
    } catch (err) {
      console.error('[App] Initialization error:', err);
      document.getElementById('app').innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem;text-align:center;background:var(--primary-800);color:white;">
          <div>
            <h2 style="margin-bottom:1rem;">Error al inicializar</h2>
            <p style="color:rgba(255,255,255,0.7);">${err.message}</p>
            <button onclick="location.reload()" style="margin-top:1.5rem;padding:0.75rem 2rem;background:var(--accent-400);color:white;border:none;border-radius:8px;cursor:pointer;font-size:1rem;">
              Reintentar
            </button>
          </div>
        </div>
      `;
    }
  }

  /**
   * Setup all application routes.
   */
  function setupRoutes() {
    // Splash screen
    Router.add('/', () => Views.renderSplash());

    // Main menu
    Router.add('/menu', () => Views.renderMenu());

    // Favorites
    Router.add('/favorites', () => Views.renderFavorites());

    // Department view
    Router.add('/dept/:deptId', (params) => Views.renderDepartment(params));

    // Department section (animals, diets, etc.)
    Router.add('/dept/:deptId/:sectionId', (params) => Views.renderDeptSection(params));

    // Animal card with tab
    Router.add('/animal/:animalId/:tab', (params) => Views.renderAnimalCard(params));

    // Animal card (default to general tab)
    Router.add('/animal/:animalId', (params) => {
      Router.navigate(`/animal/${params.animalId}/general`);
    });
  }

  // ── Launch ────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ============================================================
   ROUTER - Hash-based SPA Router for Control Animal Selwo
   ============================================================ */
window.App = window.App || {};

App.Router = (() => {
  'use strict';

  const routes = [];
  let currentParams = {};
  let beforeEachHook = null;

  /**
   * Register a route pattern with a handler.
   * Pattern supports :param syntax for dynamic segments.
   * Example: '/dept/:deptId/animals'
   */
  function add(pattern, handler) {
    routes.push({ pattern, handler });
    return { add, navigate, resolve };
  }

  /**
   * Set a before-each navigation guard.
   * Hook receives (params, path) and can return false to cancel navigation.
   */
  function beforeEach(hook) {
    beforeEachHook = hook;
  }

  /**
   * Try to match a pattern against a path.
   * Returns params object on match, null otherwise.
   */
  function match(pattern, path) {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    return params;
  }

  /**
   * Resolve the current hash and invoke the matching handler.
   */
  function resolve() {
    const hash = window.location.hash.slice(1) || '/';

    for (const route of routes) {
      const params = match(route.pattern, hash);
      if (params !== null) {
        // Run navigation guard
        if (beforeEachHook && beforeEachHook(params, hash) === false) {
          return;
        }
        currentParams = params;
        route.handler(params);
        return;
      }
    }

    // No match found, redirect to splash
    navigate('/');
  }

  /**
   * Navigate to a path by updating the hash.
   */
  function navigate(path) {
    window.location.hash = path;
  }

  /**
   * Get the current route params.
   */
  function getCurrentParams() {
    return { ...currentParams };
  }

  /**
   * Get current path (hash without #).
   */
  function getCurrentPath() {
    return window.location.hash.slice(1) || '/';
  }

  /**
   * Initialize the router by listening for hash changes.
   */
  function init() {
    window.addEventListener('hashchange', resolve);
    // Resolve initial route
    resolve();
  }

  return {
    add,
    navigate,
    resolve,
    init,
    beforeEach,
    getCurrentParams,
    getCurrentPath,
    match,
  };
})();

/* ============================================================
   SUPABASE CLIENT - Conexión con Supabase para Control Animal Selwo
   ============================================================ */
window.App = window.App || {};

App.SupabaseClient = (() => {
  'use strict';

  // ── Credenciales de Supabase ──────────────────────────────
  // NOTA: La anon key es pública y segura gracias a Row Level Security (RLS).
  const SUPABASE_URL = 'https://hwopgimjxytstlvsipjl.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_yBBke94HQhPX0NEEcKi76Q_YCgplC3_';

  // Verificar que el SDK de Supabase está disponible (cargado via CDN)
  if (typeof supabase === 'undefined' || !supabase.createClient) {
    throw new Error(
      'El SDK de Supabase no está cargado. Asegúrate de incluir el CDN antes de este script.'
    );
  }

  // Crear y devolver el cliente
  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log('[Supabase] Cliente inicializado correctamente.');

  return client;
})();

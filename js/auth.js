/* ============================================================
   AUTH - Autenticación de Supabase para Control Animal Selwo
   ============================================================ */
window.App = window.App || {};

App.Auth = (() => {
  'use strict';

  const supabase = App.SupabaseClient;
  let currentUser = null;
  let currentProfile = null;
  let userDepartments = [];

  /**
   * Inicializar el módulo de autenticación comprobando la sesión activa.
   */
  async function init() {
    try {
      // 1. Obtener sesión actual
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      currentUser = session?.user || null;

      if (currentUser) {
        await loadUserProfile(currentUser.id);
      }

      // 2. Escuchar cambios
      supabase.auth.onAuthStateChange(async (event, session) => {
        const user = session?.user || null;
        
        // Si hay un cambio real de usuario
        if (user?.id !== currentUser?.id) {
            currentUser = user;
            if (user) {
              await loadUserProfile(user.id);
            } else {
              currentProfile = null;
              userDepartments = [];
            }
            
            // Si el usuario acaba de cerrar sesión o su token expira, redirigir
            if (!user && App.Router && App.Router.getCurrentPath() !== '/login') {
                App.navigate('/login');
            }
        }
      });
      
      console.log('[Auth] Inicializado. Usuario actual:', currentUser?.email || 'Ninguno');
    } catch (err) {
      console.error('[Auth] Error de inicialización:', err);
    }
  }

  async function loadUserProfile(userId) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error) {
        currentProfile = profile;
      }
      
      // Obtener departamentos según rol (simplificado)
      if (currentProfile?.role === 'admin') {
         const { data: depts } = await supabase.from('departments').select('*');
         userDepartments = depts || [];
      } else {
         const { data: userDepts } = await supabase
           .from('user_departments')
           .select(`department_id, departments(id, name, slug)`)
           .eq('user_id', userId);
         
         if (userDepts) {
           userDepartments = userDepts.map(ud => ud.departments);
         }
      }
    } catch (e) {
      console.warn('[Auth] Error al cargar el perfil', e);
    }
  }

  async function signIn(email, password) {
    return await supabase.auth.signInWithPassword({ email, password });
  }

  async function signUp(email, password, fullName) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    currentUser = null;
    currentProfile = null;
    userDepartments = [];
    if(App.Router) App.Router.navigate('/login');
  }

  function getUser() {
    return currentUser;
  }
  
  function getProfile() {
    return currentProfile;
  }
  
  function getDepartments() {
    return userDepartments;
  }

  return {
    init,
    signIn,
    signUp,
    signOut,
    getUser,
    getProfile,
    getDepartments
  };
})();

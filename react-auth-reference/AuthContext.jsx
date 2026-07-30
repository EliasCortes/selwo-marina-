import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient'; // Asume que tienes inicializado el cliente

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [activeDepartment, setActiveDepartment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Comprobar la sesión actual inmediatamente al cargar la app
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          await loadUserProfile(currentUser.id);
        }
      } catch (err) {
        console.error('Error verificando sesión inicial:', err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();

    // 2. Suscribirse a cambios de sesión de Supabase (login, logout, refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      
      // Solo actualizamos si realmente hay un cambio para evitar re-renders innecesarios
      setUser(currentUser);

      if (currentUser) {
        await loadUserProfile(currentUser.id);
      } else {
        setProfile(null);
        setDepartments([]);
        setActiveDepartment(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      // Obtener el perfil (rol y nombre)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) throw profileError;
      setProfile(profileData);

      // Obtener departamentos asignados
      let depts = [];
      if (profileData.role === 'admin') {
        // El admin tiene acceso a todos los departamentos
        const { data: allDepts } = await supabase.from('departments').select('*');
        depts = allDepts;
      } else {
        // Obtener solo los departamentos asignados mediante tabla intermedia
        const { data: userDepts, error: deptsError } = await supabase
          .from('user_departments')
          .select(`
            department_id,
            departments ( id, name, slug )
          `)
          .eq('user_id', userId);

        if (deptsError) throw deptsError;
        depts = userDepts.map(ud => ud.departments);
      }

      setDepartments(depts);
      // Seleccionar el primer departamento por defecto si existe
      if (depts.length > 0) {
        setActiveDepartment(depts[0]);
      }

    } catch (error) {
      console.error('Error cargando el perfil:', error.message);
    }
  };

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email, password, fullName) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  const value = {
    user,
    profile,
    departments,
    activeDepartment,
    setActiveDepartment,
    signIn,
    signUp,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#041c2c] to-[#0a2647]">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-300">Autenticando...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { Login } from './Login';
// ... Importa aquí tus demás vistas (ej: Dashboard, AnimalsList, etc.)


// Componente de ejemplo para la vista principal (AnimalsList, Dashboard, etc.)
const DashboardPlaceholder = () => {
  const { user } = useAuth();
  
  // Garantizamos que el fetch solo se hace si el usuario existe
  React.useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      // Ejemplo: const { data } = await supabase.from('animales').select('*');
      console.log('Fetching data for user:', user.email);
    };
    
    fetchData();
  }, [user]);

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold">Panel Principal (Protegido)</h1>
      <p>Solo puedes ver esto si tu sesión de Supabase es válida.</p>
    </div>
  );
};

export const App = () => {
  return (
    // 1. TODA la aplicación debe estar envuelta en AuthProvider
    <AuthProvider>
      
      {/* 2. Router para manejar la navegación */}
      <Router>
        <Routes>
          
          {/* Ruta pública: Login (Registro incluido) */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas Privadas: Envuélvelas con <ProtectedRoute> */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                {/* 
                  Aquí iría tu Layout principal (Header con el selector de departamentos) 
                  y las vistas internas
                */}
                <DashboardPlaceholder />
              </ProtectedRoute>
            } 
          />
          
          {/* Ruta protegida que exige un rol específico (ejemplo: Administrador) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="p-8 text-white">Panel de Configuración de Administradores</div>
              </ProtectedRoute>
            } 
          />

          {/* Fallback 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Routes>
      </Router>

    </AuthProvider>
  );
};

export default App;

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, profile } = useAuth();
  const location = useLocation();

  if (!user) {
    // Si no está autenticado, redirigir al login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si la ruta requiere un rol específico y el usuario no lo tiene
  if (allowedRoles.length > 0 && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center p-8 bg-gray-800 rounded-xl border border-red-500/30">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Acceso Denegado</h2>
          <p className="text-gray-400">No tienes permisos para ver esta sección.</p>
        </div>
      </div>
    );
  }

  return children;
};

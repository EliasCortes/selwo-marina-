import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (isRegistering) {
      // Lógica de Registro
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setIsLoading(false);
        return;
      }

      const { data, error: signUpError } = await signUp(email, password, fullName);
      
      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('already registered')) {
          setError('Este correo electrónico ya está registrado.');
        } else {
          setError(signUpError.message || 'Error al crear la cuenta. Intenta nuevamente.');
        }
      } else {
        // En algunas configuraciones de Supabase, la sesión se inicia inmediatamente
        if (data?.session) {
          navigate('/');
        } else {
          // Si Supabase requiere confirmación por email o no devuelve sesión
          setSuccessMessage('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
          setIsRegistering(false);
          setPassword('');
          setConfirmPassword('');
        }
      }
    } else {
      // Lógica de Inicio de Sesión
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        setError('Credenciales inválidas. Por favor, intenta de nuevo.');
      } else {
        navigate('/');
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#041c2c] via-[#0a2647] to-[#0f3460] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 transition-all duration-300">
        
        <div className="text-center mb-6">
          <span className="text-6xl mb-4 block animate-bounce-slow">🦭</span>
          <h1 className="text-3xl font-bold text-white">Selwo Control</h1>
          <p className="text-gray-300 mt-2">Gestión zoológica profesional</p>
        </div>

        {/* Pestañas / Alternador */}
        <div className="flex bg-gray-900/50 p-1 rounded-lg mb-8">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(false);
              setError('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              !isRegistering 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(true);
              setError('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              isRegistering 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Mensajes de Alerta */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center animate-fade-in">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm text-center animate-fade-in">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo adicional para el registro */}
          {isRegistering && (
            <div className="animate-fade-in-up">
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ej. Juan Pérez"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              minLength={isRegistering ? 6 : undefined}
            />
            {isRegistering && (
              <p className="mt-1 text-xs text-gray-400">Mínimo 6 caracteres.</p>
            )}
          </div>

          {isRegistering && (
            <div className="animate-fade-in-up">
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 mt-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center group"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              isRegistering ? 'Crear Cuenta' : 'Ingresar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

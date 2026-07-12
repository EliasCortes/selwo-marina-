import { createClient } from "@supabase/supabase-js";

// Detectar si estamos en un entorno con bundler (Vite) o en un servidor estático clásico
const getEnvVar = (key, fallback) => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      return import.meta.env[key] || fallback;
    }
  } catch (e) {}
  return fallback;
};

const supabaseUrl = getEnvVar("VITE_SUPABASE_URL", "https://hwopgimjxytstlvsipjl.supabase.co");
const supabaseAnonKey = getEnvVar("VITE_SUPABASE_ANON_KEY", "sb_publishable_yBBke94HQhPX0NEEcKi76Q_YCgplC3_");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan las variables de entorno de Supabase. Añade tu configuración de conexión."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/*
 * EJEMPLO DE SERVICIOS API ACTUALIZADOS (api_services_update.js)
 * 
 * Con la implementación de los triggers en Supabase (set_created_by), 
 * el Frontend ya NO NECESITA enviar manualmente el ID del usuario al crear un registro.
 * Supabase inyecta el `created_by` basado en el JWT de la sesión activa de forma segura.
 */

import { supabase } from './supabaseClient'; // Tu cliente configurado de Supabase

export const AnimalServices = {
  
  /**
   * Crear un nuevo registro de peso.
   * Supabase en la BD asignará automáticamente el auth.uid() al campo `created_by`.
   */
  async addWeightRecord(animalId, pesoKg, observaciones) {
    const { data, error } = await supabase
      .from('pesos')
      .insert([
        {
          animal_id: animalId,
          peso_kg: pesoKg,
          observaciones: observaciones
          // No enviamos created_by aquí.
        }
      ])
      .select(`
        *,
        profiles (full_name) -- Para obtener el nombre del autor inmediatamente
      `)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Obtener pesos con el autor incluido (Trazabilidad UI)
   */
  async getWeightRecords(animalId) {
    const { data, error } = await supabase
      .from('pesos')
      .select(`
        *,
        profiles:created_by (full_name)
      `)
      .eq('animal_id', animalId)
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data;
  }
};

/*
 * ============================================================
 * EJEMPLO DE UI EN REACT PARA MOSTRAR LA TRAZABILIDAD
 * ============================================================
 * 
 * Cuando renderices una tarjeta de peso, dieta o entrenamiento:
 *
 * <div className="p-4 bg-white rounded shadow">
 *    <h3 className="text-lg font-bold">Registro de Peso</h3>
 *    <p className="text-2xl">{record.peso_kg} kg</p>
 *    
 *    {/* FOOTER DE TRAZABILIDAD *\/}
 *    <div className="mt-4 pt-3 border-t border-gray-200">
 *      <p className="text-xs text-gray-500">
 *        Registrado por <span className="font-medium text-gray-700">{record.profiles?.full_name || 'Desconocido'}</span> 
 *        el {new Date(record.created_at).toLocaleDateString()} a las {new Date(record.created_at).toLocaleTimeString()}
 *      </p>
 *    </div>
 * </div>
 */

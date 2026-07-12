/* ============================================================
   ANIMAL SERVICE - CRUD de Supabase para la tabla 'animales'
   ============================================================ */
window.App = window.App || {};

App.AnimalService = (() => {
  'use strict';

  const supabase = App.SupabaseClient;
  const TABLE = 'animales';

  /**
   * Obtiene todos los animales, ordenados por fecha de ingreso (más reciente primero).
   * @param {Object}  [options]
   * @param {string}  [options.especie]        - Filtrar por especie.
   * @param {string}  [options.search]         - Búsqueda por nombre (ilike).
   * @param {number}  [options.limit]          - Máximo de resultados.
   * @param {number}  [options.offset]         - Desplazamiento para paginación.
   * @param {string}  [options.departamentoId] - Filtrar por departamento.
   * @returns {Promise<{ data: Array, count: number }>}
   */
  async function getAnimals({ especie, search, limit, offset, departamentoId } = {}) {
    let query = supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .order('fecha_ingreso', { ascending: false });

    if (departamentoId) {
      query = query.eq('departamento_id', departamentoId);
    }

    if (especie) {
      query = query.eq('especie', especie);
    }

    if (search) {
      query = query.ilike('nombre', `%${search}%`);
    }

    if (typeof limit === 'number') {
      query = query.limit(limit);
    }

    if (typeof offset === 'number') {
      query = query.range(offset, offset + (limit ?? 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { data, count };
  }

  /**
   * Obtiene el conteo exacto de animales de un departamento.
   * @param {string} departamentoId - ID del departamento.
   * @returns {Promise<number>} Conteo de animales.
   */
  async function getAnimalsCount(departamentoId) {
    const { count, error } = await supabase
      .from(TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('departamento_id', departamentoId);

    if (error) throw error;
    return count ?? 0;
  }

  /**
   * Obtiene un animal por su ID.
   * @param {string} id - UUID del animal.
   * @returns {Promise<Object>}
   */
  async function getAnimalById(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Crea un nuevo animal.
   * @param {Object} animal
   * @param {string} animal.nombre
   * @param {string} animal.especie
   * @param {number} animal.edad
   * @param {string} [animal.foto_url]
   * @param {string} [animal.historial_medico]
   * @param {string} [animal.fecha_ingreso] - Formato YYYY-MM-DD. Por defecto hoy.
   * @param {string} [animal.departamento_id] - ID del departamento.
   * @returns {Promise<Object>} El animal creado.
   */
  async function createAnimal(animal) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        nombre: animal.nombre,
        especie: animal.especie,
        edad: animal.edad,
        foto_url: animal.foto_url ?? null,
        historial_medico: animal.historial_medico ?? null,
        fecha_ingreso: animal.fecha_ingreso ?? new Date().toISOString().split('T')[0],
        departamento_id: animal.departamento_id ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Actualiza un animal existente.
   * @param {string} id      - UUID del animal.
   * @param {Object} updates - Campos a actualizar (parcial).
   * @returns {Promise<Object>} El animal actualizado.
   */
  async function updateAnimal(id, updates) {
    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Elimina un animal por su ID.
   * @param {string} id - UUID del animal.
   * @returns {Promise<Object>} El animal eliminado.
   */
  async function deleteAnimal(id) {
    const { data, error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  return {
    getAnimals,
    getAnimalsCount,
    getAnimalById,
    createAnimal,
    updateAnimal,
    deleteAnimal,
  };
})();

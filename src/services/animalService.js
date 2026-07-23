import { supabase } from "./supabaseClient.js?v=3";

// ═══════════════════════════════════════════════════════════════
//  CONTROL ANIMAL SELWO — Servicio Supabase (desde cero)
//  Todas las operaciones CRUD contra las tablas reales.
//  No se genera ID en el frontend: Supabase usa gen_random_uuid().
//  No se borran tablas hijas manualmente: ON DELETE CASCADE lo hace.
//  Las fechas se envían siempre en YYYY-MM-DD (nativo del input date).
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
//  VALIDACIÓN UUID — Previene enviar IDs mock a Supabase
// ─────────────────────────────────────────────────────────────
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Valida que un ID tenga formato UUID válido.
 * Lanza un Error descriptivo si no lo es.
 * @param {string} id      — El ID a validar.
 * @param {string} context — Nombre de la operación (para el mensaje de error).
 */
function assertUUID(id, context = '') {
  if (!id || !UUID_REGEX.test(id)) {
    throw new Error(
      `ID inválido${context ? ' en ' + context : ''}: "${id}" no es un UUID válido. ` +
      `Los registros locales/mock no se pueden gestionar en Supabase.`
    );
  }
}

const TABLE = "animales";

// ─────────────────────────────────────────────────────────────
//  ANIMALES — CRUD principal
// ─────────────────────────────────────────────────────────────

/**
 * Obtiene animales con filtros opcionales.
 * @param {Object}  [options]
 * @param {string}  [options.departamentoId] - Filtrar por departamento.
 * @param {string}  [options.especie]        - Filtrar por especie.
 * @param {string}  [options.search]         - Búsqueda por nombre (ilike).
 * @returns {Promise<{ data: Array, count: number }>}
 */
export async function getAnimals({ especie, search, departamentoId } = {}) {
  let query = supabase
    .from(TABLE)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (departamentoId) query = query.eq("departamento_id", departamentoId);
  if (especie)        query = query.eq("especie", especie);
  if (search)         query = query.ilike("nombre", `%${search}%`);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data || [], count: count ?? 0 };
}

/**
 * Cuenta animales de un departamento.
 */
export async function getAnimalsCount(departamentoId) {
  const { count, error } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("departamento_id", departamentoId);

  if (error) throw error;
  return count ?? 0;
}

/**
 * Obtiene un animal por su UUID.
 */
export async function getAnimalById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Crea un nuevo animal.
 * NO se genera ID en el frontend — Supabase lo crea con gen_random_uuid().
 * La fecha_nacimiento se recibe en YYYY-MM-DD directamente del input date.
 */
export async function createAnimal(animal) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      nombre:           animal.nombre,
      especie:          animal.especie,
      sexo:             animal.sexo ?? "Desconocido",
      fecha_nacimiento: animal.fecha_nacimiento ?? null,
      zims_id:          animal.zims_id ?? null,
      microchip:        animal.microchip ?? null,
      estado:           animal.estado ?? "Activo",
      ubicacion:        animal.ubicacion ?? null,
      departamento_id:  animal.departamento_id ?? null,
      observaciones:    animal.observaciones ?? null,
      foto_url:         animal.foto_url ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualiza un animal existente.
 * Solo envía los campos proporcionados en `updates`.
 */
export async function updateAnimal(id, updates) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Elimina un animal por su UUID.
 * Un único .delete() — ON DELETE CASCADE borra automáticamente
 * todos los registros hijos en diet_records, entrenamientos,
 * pesos, enriquecimientos y veterinaria.
 */
export async function deleteAnimal(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ─────────────────────────────────────────────────────────────
//  REGISTROS POR PESTAÑA — CRUD genérico con mapeo de campos
// ─────────────────────────────────────────────────────────────

/**
 * Mapeo de cada tipo de registro:
 *   tableName     — nombre real de la tabla en Supabase
 *   toSupabase    — campo del formulario (inglés) → columna Supabase (español)
 *   fromSupabase  — columna Supabase → campo del formulario
 */
const RECORD_CONFIG = {
  diets: {
    tableName: "diet_records",
    toSupabase: {
      date:         "fecha",
      food_type:    "alimento",
      quantity:     "cantidad_gramos",
      observations: "observaciones",
    },
    fromSupabase: {
      fecha:            "date",
      alimento:         "food_type",
      cantidad_gramos:  "quantity",
      observaciones:    "observations",
    },
  },
  trainings: {
    tableName: "entrenamientos",
    toSupabase: {
      date:         "fecha",
      behavior:     "conducta_entrenada",
      result:       "resultado",
      observations: "comentarios",
      numero_sesion: "numero_sesion",
    },
    fromSupabase: {
      fecha:              "date",
      conducta_entrenada: "behavior",
      resultado:          "result",
      comentarios:        "observations",
      numero_sesion:      "numero_sesion",
    },
  },
  weights: {
    tableName: "pesos",
    toSupabase: {
      date:         "fecha",
      weight_kg:    "peso_kg",
      observations: "observaciones",
    },
    fromSupabase: {
      fecha:         "date",
      peso_kg:       "weight_kg",
      observaciones: "observations",
    },
  },
  enrichments: {
    tableName: "enriquecimientos",
    toSupabase: {
      date:             "fecha",
      enrichment_type:  "tipo_enriquecimiento",
      result:           "respuesta_animal",
      observations:     "observaciones",
    },
    fromSupabase: {
      fecha:                "date",
      tipo_enriquecimiento: "enrichment_type",
      respuesta_animal:     "result",
      observaciones:        "observations",
    },
  },
  veterinary: {
    tableName: "veterinaria",
    toSupabase: {
      date:         "fecha",
      diagnosis:    "diagnostico",
      treatment:    "tratamiento",
      medication:   "medicacion",
      priority:     "estado_salud",
      observations: "observaciones",
    },
    fromSupabase: {
      fecha:         "date",
      diagnostico:   "diagnosis",
      tratamiento:   "treatment",
      medicacion:    "medication",
      estado_salud:  "priority",
      observaciones: "observations",
    },
  },
};

/** Traduce campos del formulario a columnas de Supabase. */
function mapToSupabase(type, formData) {
  const config = RECORD_CONFIG[type];
  if (!config) return formData;

  const mapped = {};
  for (const [key, value] of Object.entries(formData)) {
    const supaKey = config.toSupabase[key];
    mapped[supaKey || key] = value;       // si no hay mapeo, pasa tal cual (ej. animal_id)
  }
  return mapped;
}

/** Traduce columnas de Supabase a campos del formulario. */
function mapFromSupabase(type, record) {
  const config = RECORD_CONFIG[type];
  if (!config || !record) return record;

  const mapped = { id: record.id, animal_id: record.animal_id };
  for (const [key, value] of Object.entries(record)) {
    const formKey = config.fromSupabase[key];
    if (formKey) {
      mapped[formKey] = value;
    } else if (!(key in mapped)) {
      mapped[key] = value;                // conservar campos extra (created_at, etc.)
    }
  }
  return mapped;
}

/**
 * Lee todos los registros de un animal en una pestaña.
 * Ordenados por fecha descendente.
 */
export async function getRecordsByAnimal(type, animalId) {
  const config = RECORD_CONFIG[type];
  if (!config) throw new Error(`Tipo desconocido: ${type}`);

  const { data, error } = await supabase
    .from(config.tableName)
    .select("*")
    .eq("animal_id", animalId)
    .order("fecha", { ascending: false });

  if (error) throw error;
  return (data || []).map((r) => mapFromSupabase(type, r));
}

/**
 * Lee un registro individual por su UUID.
 */
export async function getRecordById(type, recordId) {
  const config = RECORD_CONFIG[type];
  if (!config) throw new Error(`Tipo desconocido: ${type}`);

  const { data, error } = await supabase
    .from(config.tableName)
    .select("*")
    .eq("id", recordId)
    .single();

  if (error) throw error;
  return mapFromSupabase(type, data);
}

/**
 * Inserta un registro nuevo.
 * No genera ID — Supabase usa gen_random_uuid().
 */
export async function createSupabaseRecord(type, formData) {
  const config = RECORD_CONFIG[type];
  if (!config) throw new Error(`Tipo desconocido: ${type}`);

  const mapped = mapToSupabase(type, formData);

  const { data, error } = await supabase
    .from(config.tableName)
    .insert(mapped)
    .select()
    .single();

  if (error) throw error;
  return mapFromSupabase(type, data);
}

/**
 * Actualiza un registro existente.
 */
export async function updateSupabaseRecord(type, recordId, formData) {
  const config = RECORD_CONFIG[type];
  if (!config) throw new Error(`Tipo desconocido: ${type}`);

  const mapped = mapToSupabase(type, formData);
  delete mapped.animal_id;                // animal_id nunca se actualiza

  const { data, error } = await supabase
    .from(config.tableName)
    .update(mapped)
    .eq("id", recordId)
    .select()
    .single();

  if (error) throw error;
  return mapFromSupabase(type, data);
}

/**
 * Elimina un registro por su UUID.
 */
export async function deleteSupabaseRecord(type, recordId) {
  const config = RECORD_CONFIG[type];
  if (!config) throw new Error(`Tipo desconocido: ${type}`);

  // Validar UUID antes de enviar a Supabase
  assertUUID(recordId, `deleteSupabaseRecord(${type})`);

  const { error } = await supabase
    .from(config.tableName)
    .delete()
    .eq("id", recordId);

  if (error) throw error;
}

// ─────────────────────────────────────────────────────────────
//  DIET RECORDS — Tabla diet_records (global + Leones Marinos)
// ─────────────────────────────────────────────────────────────

/**
 * Obtiene TODOS los registros de dieta, opcionalmente filtrados por departamento.
 * Usada por la Vista Global de Dietas.
 * Devuelve los datos ya mapeados a los campos del frontend.
 */
export async function getAllDietRecords(departamentoId = null) {
  let query = supabase
    .from("diet_records")
    .select("*")
    .order("fecha", { ascending: false });

  if (departamentoId) {
    query = query.eq("departamento_id", departamentoId);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Mapear a campos del frontend
  return (data || []).map((r) => ({
    id: r.id,
    animal_id: r.animal_id,
    date: r.fecha,
    food_type: r.alimento || '—',
    quantity: r.cantidad_gramos || '—',
    observations: r.observaciones || '',
    // Conservar campos extra para Leones Marinos
    dieta_total: r.dieta_total,
    arenque_grande: r.arenque_grande,
    capelin: r.capelin,
    arenque_pequeno: r.arenque_pequeno,
    sprat: r.sprat,
    caballa: r.caballa,
    bacaladilla: r.bacaladilla,
    sardina: r.sardina,
    merlan: r.merlan,
    merluza: r.merluza,
    vitaminas: r.vitaminas,
    sesiones: r.sesiones,
    departamento_id: r.departamento_id,
    created_at: r.created_at,
  }));
}

/**
 * Obtiene registros de dieta detallada (Leones Marinos).
 */
export async function getDietRecords(animalId, limit = 50) {
  const { data, error } = await supabase
    .from("diet_records")
    .select("*")
    .eq("animal_id", animalId)
    .order("fecha", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Obtiene registros de dieta en un rango de fechas.
 */
export async function getDietRecordsByDateRange(animalId, startDate, endDate) {
  const end = endDate || new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("diet_records")
    .select("*")
    .eq("animal_id", animalId)
    .gte("fecha", startDate)
    .lte("fecha", end)
    .order("fecha", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Obtiene el último registro de dieta de un animal.
 */
export async function getLatestDietRecord(animalId) {
  const { data, error } = await supabase
    .from("diet_records")
    .select("*")
    .eq("animal_id", animalId)
    .order("fecha", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Crea un registro de dieta detallada (Leones Marinos).
 */
export async function createDietRecord(record) {
  // Suma de extras dinámicos
  const extrasTotal = (record.extra_foods || []).reduce((sum, extra) => sum + (parseFloat(extra.kg) || 0), 0);

  const total = (parseFloat(record.arenque_grande) || 0)
    + (parseFloat(record.capelin) || 0)
    + (parseFloat(record.arenque_pequeno) || 0)
    + (parseFloat(record.sprat) || 0)
    + (parseFloat(record.caballa) || 0)
    + (parseFloat(record.bacaladilla) || 0)
    + (parseFloat(record.sardina) || 0)
    + (parseFloat(record.merlan) || 0)
    + (parseFloat(record.merluza) || 0)
    + extrasTotal;

  // Serializar a JSON para no alterar el esquema
  const alimentoJson = record.extra_foods && record.extra_foods.length > 0 
    ? JSON.stringify(record.extra_foods) 
    : "";

  const { data, error } = await supabase
    .from("diet_records")
    .insert({
      animal_id:       record.animal_id,
      departamento_id: record.departamento_id || "leones",
      fecha:           record.fecha || new Date().toISOString().split("T")[0],
      dieta_total:     total,
      arenque_grande:  parseFloat(record.arenque_grande) || 0,
      capelin:         parseFloat(record.capelin) || 0,
      arenque_pequeno: parseFloat(record.arenque_pequeno) || 0,
      sprat:           parseFloat(record.sprat) || 0,
      caballa:         parseFloat(record.caballa) || 0,
      bacaladilla:     parseFloat(record.bacaladilla) || 0,
      sardina:         parseFloat(record.sardina) || 0,
      merlan:          parseFloat(record.merlan) || 0,
      merluza:         parseFloat(record.merluza) || 0,
      vitaminas:       record.vitaminas || "",
      observaciones:   record.observaciones || "",
      alimento:        alimentoJson,
      cantidad_gramos: "", // Dejamos vacío, los kg van en el JSON
      sesiones:        record.sesiones || [],
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualiza un registro de dieta existente.
 */
export async function updateDietRecord(recordId, record) {
  assertUUID(recordId, 'updateDietRecord');

  const extrasTotal = (record.extra_foods || []).reduce((sum, extra) => sum + (parseFloat(extra.kg) || 0), 0);

  const total = (parseFloat(record.arenque_grande) || 0)
    + (parseFloat(record.capelin) || 0)
    + (parseFloat(record.arenque_pequeno) || 0)
    + (parseFloat(record.sprat) || 0)
    + (parseFloat(record.caballa) || 0)
    + (parseFloat(record.bacaladilla) || 0)
    + (parseFloat(record.sardina) || 0)
    + (parseFloat(record.merlan) || 0)
    + (parseFloat(record.merluza) || 0)
    + extrasTotal;

  const alimentoJson = record.extra_foods && record.extra_foods.length > 0 
    ? JSON.stringify(record.extra_foods) 
    : "";

  const { data, error } = await supabase
    .from("diet_records")
    .update({
      fecha:           record.fecha,
      dieta_total:     total,
      arenque_grande:  parseFloat(record.arenque_grande) || 0,
      capelin:         parseFloat(record.capelin) || 0,
      arenque_pequeno: parseFloat(record.arenque_pequeno) || 0,
      sprat:           parseFloat(record.sprat) || 0,
      caballa:         parseFloat(record.caballa) || 0,
      bacaladilla:     parseFloat(record.bacaladilla) || 0,
      sardina:         parseFloat(record.sardina) || 0,
      merlan:          parseFloat(record.merlan) || 0,
      merluza:         parseFloat(record.merluza) || 0,
      vitaminas:       record.vitaminas || "",
      observaciones:   record.observaciones || "",
      alimento:        alimentoJson,
      cantidad_gramos: "",
      sesiones:        record.sesiones || [],
    })
    .eq("id", recordId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────────────────────────
//  STORAGE — Subida de archivos (Bucket "animales")
// ─────────────────────────────────────────────────────────────

/**
 * Sube una foto de un animal al bucket "animales".
 * Usa el animalId como nombre de archivo para auto-sobrescribir.
 * Retorna la URL pública generada.
 */
export async function uploadAnimalPhoto(animalId, file) {
  if (!file) return null;

  // Usa solo el ID como ruta para no acumular fotos huérfanas al actualizar
  const filePath = `${animalId}`;

  const { error: uploadError } = await supabase.storage
    .from('animales')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('animales')
    .getPublicUrl(filePath);

  // Añade un timestamp query param para forzar la recarga de la imagen (cache busting)
  return `${data.publicUrl}?t=${Date.now()}`;
}

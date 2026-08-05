import { supabase } from "./supabaseClient.js?v=3";

/**
 * Mapeo de columnas de pescado estándar con sus etiquetas y pesos medios de caja (kg).
 */
export const FISH_DEFINITIONS = [
  { key: 'arenque_grande', label: 'Arenque grande', defaultBoxKg: 20, emoji: '🐟' },
  { key: 'arenque_pequeno', label: 'Arenque pequeño', defaultBoxKg: 15, emoji: '🐟' },
  { key: 'capelin', label: 'Capelín', defaultBoxKg: 10, emoji: '🐠' },
  { key: 'sprat', label: 'Sprat', defaultBoxKg: 10, emoji: '🐠' },
  { key: 'caballa', label: 'Caballa', defaultBoxKg: 15, emoji: '🐡' },
  { key: 'bacaladilla', label: 'Bacaladilla', defaultBoxKg: 12, emoji: '🐟' },
  { key: 'sardina', label: 'Sardina', defaultBoxKg: 15, emoji: '🐟' },
  { key: 'merlan', label: 'Merlán', defaultBoxKg: 10, emoji: '🐟' },
  { key: 'merluza', label: 'Merluza', defaultBoxKg: 15, emoji: '🐟' },
];

/**
 * Obtiene un resumen consolidado de consumo de pescado basado ÚNICAMENTE en las dietas activas
 * (la última dieta registrada de cada animal en estado 'Activo').
 * 
 * @param {Object} [options]
 * @param {string} [options.departamentoId] - ID del departamento para filtrar o 'all' / null para global.
 * @returns {Promise<Object>} Resumen con desglose por tipo de pescado y totales globales.
 */
export async function getFishConsumptionSummary({ departamentoId } = {}) {
  // 1. Obtener animales activos
  let animalsQuery = supabase
    .from("animales")
    .select("id, nombre, especie, departamento_id")
    .eq("estado", "Activo");

  if (departamentoId && departamentoId !== 'all') {
    const d = String(departamentoId).toLowerCase();
    if (['leones', 'delfines', 'mamiferos', 'mamiferos-marinos'].includes(d)) {
      animalsQuery = animalsQuery.in("departamento_id", ['leones', 'delfines', 'mamiferos-marinos', 'mamiferos']);
    } else {
      animalsQuery = animalsQuery.eq("departamento_id", departamentoId);
    }
  }

  const { data: activeAnimals, error: animErr } = await animalsQuery;
  if (animErr) throw animErr;

  if (!activeAnimals || activeAnimals.length === 0) {
    return {
      fishSummary: [],
      grandTotals: { dailyKg: 0, monthlyKg: 0, annualKg: 0, totalBoxes: 0 },
      activeAnimalsCount: 0,
      dietsCount: 0
    };
  }

  const animalIds = activeAnimals.map(a => a.id);
  const animalMap = new Map(activeAnimals.map(a => [a.id, a]));

  // 2. Obtener todas las dietas de los animales activos ordenadas por fecha reciente
  const { data: dietRecords, error: dietErr } = await supabase
    .from("diet_records")
    .select("*")
    .in("animal_id", animalIds)
    .order("fecha", { ascending: false });

  if (dietErr) throw dietErr;

  // Quedarnos con la ÚLTIMA dieta por animal
  const latestDietMap = new Map();
  (dietRecords || []).forEach(record => {
    if (!latestDietMap.has(record.animal_id)) {
      latestDietMap.set(record.animal_id, record);
    }
  });

  // 3. Agrupar consumos por tipo de pescado
  const fishTotalsMap = new Map();

  // Inicializar tipos de pescado estándar
  FISH_DEFINITIONS.forEach(def => {
    fishTotalsMap.set(def.label, {
      key: def.key,
      label: def.label,
      emoji: def.emoji,
      defaultBoxKg: def.defaultBoxKg,
      dailyKg: 0,
      animalsContributing: new Set()
    });
  });

  // Procesar cada dieta activa
  latestDietMap.forEach((record, animalId) => {
    const animal = animalMap.get(animalId);
    let recordHasFish = false;

    // A) Columnas de pescado estándar
    FISH_DEFINITIONS.forEach(def => {
      const qty = parseFloat(record[def.key]) || 0;
      if (qty > 0) {
        const item = fishTotalsMap.get(def.label);
        item.dailyKg += qty;
        if (animal) item.animalsContributing.add(animal.nombre);
        recordHasFish = true;
      }
    });

    // B) Alimentos extra o JSON en campo 'alimento'
    if (record.alimento) {
      try {
        const parsed = JSON.parse(record.alimento);
        if (Array.isArray(parsed)) {
          parsed.forEach(extra => {
            const rawName = (extra.name || extra.nombre || '').trim();
            const kg = parseFloat(extra.kg) || 0;
            if (rawName && kg > 0) {
              const label = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
              if (!fishTotalsMap.has(label)) {
                fishTotalsMap.set(label, {
                  key: label.toLowerCase().replace(/\s+/g, '_'),
                  label: label,
                  emoji: '📦',
                  defaultBoxKg: 10,
                  dailyKg: 0,
                  animalsContributing: new Set()
                });
              }
              const item = fishTotalsMap.get(label);
              item.dailyKg += kg;
              if (animal) item.animalsContributing.add(animal.nombre);
            }
          });
        }
      } catch (e) {
        // No es JSON, intentar parsear texto simple si las columnas estándar dieron 0
        if (!recordHasFish && record.cantidad_gramos) {
          const rawQty = record.cantidad_gramos.toLowerCase();
          let kg = 0;
          if (rawQty.includes('g')) {
            kg = parseFloat(rawQty) / 1000;
          } else if (rawQty.includes('kg')) {
            kg = parseFloat(rawQty);
          }
          if (kg > 0) {
            const label = record.alimento.charAt(0).toUpperCase() + record.alimento.slice(1).toLowerCase();
            if (!fishTotalsMap.has(label)) {
              fishTotalsMap.set(label, {
                key: label.toLowerCase().replace(/\s+/g, '_'),
                label: label,
                emoji: '🐟',
                defaultBoxKg: 10,
                dailyKg: 0,
                animalsContributing: new Set()
              });
            }
            const item = fishTotalsMap.get(label);
            item.dailyKg += kg;
            if (animal) item.animalsContributing.add(animal.nombre);
          }
        }
      }
    }
  });

  // 4. Construir resultado filtrando pescados con consumo > 0
  const fishSummary = [];
  let totalDailyKg = 0;
  let totalMonthlyKg = 0;
  let totalAnnualKg = 0;
  let totalBoxesCount = 0;

  fishTotalsMap.forEach((data) => {
    if (data.dailyKg > 0) {
      const dailyKg = parseFloat(data.dailyKg.toFixed(2));
      const monthlyKg = parseFloat((dailyKg * 30).toFixed(2));
      const annualKg = parseFloat((dailyKg * 365).toFixed(2));
      const boxesCount = Math.ceil(dailyKg / data.defaultBoxKg);

      totalDailyKg += dailyKg;
      totalMonthlyKg += monthlyKg;
      totalAnnualKg += annualKg;
      totalBoxesCount += boxesCount;

      fishSummary.push({
        key: data.key,
        label: data.label,
        emoji: data.emoji,
        dailyKg,
        monthlyKg,
        annualKg,
        defaultBoxKg: data.defaultBoxKg,
        boxesCount,
        animalCount: data.animalsContributing.size,
        animalList: Array.from(data.animalsContributing)
      });
    }
  });

  // Ordenar por volumen diario descendente
  fishSummary.sort((a, b) => b.dailyKg - a.dailyKg);

  return {
    fishSummary,
    grandTotals: {
      dailyKg: parseFloat(totalDailyKg.toFixed(2)),
      monthlyKg: parseFloat(totalMonthlyKg.toFixed(2)),
      annualKg: parseFloat(totalAnnualKg.toFixed(2)),
      totalBoxes: totalBoxesCount
    },
    activeAnimalsCount: activeAnimals.length,
    dietsCount: latestDietMap.size
  };
}

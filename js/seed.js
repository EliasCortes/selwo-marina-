/* ============================================================
   SEED DATA - Test data for Control Animal Selwo
   ============================================================ */
window.App = window.App || {};

App.Seed = (() => {
  'use strict';

  const H = App.Helpers;

  // ── Animals ───────────────────────────────────────────────
  const animals = [
    // AVES
    { id: 'av-001', zims_id: 'AV-2019-001', name: 'Kira', species: 'Águila de Harris', sex: 'Hembra', birth_date: '2019-03-15', department: 'aves', status: 'Activo', microchip: 'ES-985-1200045678', location: 'Aviario principal', observations: 'Excelente en vuelos en espectáculo. Muy sociable con cuidadores.' },
    { id: 'av-002', zims_id: 'AV-2020-003', name: 'Thor', species: 'Búho Real', sex: 'Macho', birth_date: '2020-01-22', department: 'aves', status: 'Activo', microchip: 'ES-985-1200045679', location: 'Noctuario', observations: 'Activo especialmente al atardecer. Buen comportamiento en sesiones de entreno.' },
    { id: 'av-003', zims_id: 'AV-2018-007', name: 'Luna', species: 'Guacamayo Azul', sex: 'Hembra', birth_date: '2018-07-10', department: 'aves', status: 'Activo', microchip: 'ES-985-1200045680', location: 'Aviario tropical', observations: 'Muy vocal y sociable. Participa en interacciones con visitantes.' },
    { id: 'av-004', zims_id: 'AV-2021-002', name: 'Simba', species: 'Buitre Leonado', sex: 'Macho', birth_date: '2021-05-03', department: 'aves', status: 'Activo', microchip: 'ES-985-1200045681', location: 'Aviario rapaces', observations: 'Joven, en proceso de entrenamiento para exhibiciones.' },
    // PINGÜINARIO
    { id: 'pg-001', zims_id: 'PG-2017-001', name: 'Nemo', species: 'Pingüino de Humboldt', sex: 'Macho', birth_date: '2017-09-12', department: 'pinguinario', status: 'Activo', microchip: 'ES-985-1200045700', location: 'Piscina norte', observations: 'Líder del grupo. Muy activo durante las sesiones de alimentación.' },
    { id: 'pg-002', zims_id: 'PG-2018-004', name: 'Elsa', species: 'Pingüino de Humboldt', sex: 'Hembra', birth_date: '2018-06-28', department: 'pinguinario', status: 'Activo', microchip: 'ES-985-1200045701', location: 'Piscina norte', observations: 'Pareja de Nemo. Buena madre en temporada de cría.' },
    { id: 'pg-003', zims_id: 'PG-2019-002', name: 'Rocky', species: 'Pingüino de Magallanes', sex: 'Macho', birth_date: '2019-11-05', department: 'pinguinario', status: 'Activo', microchip: 'ES-985-1200045702', location: 'Piscina sur', observations: 'Algo tímido al principio, buena evolución en entrenos.' },
    { id: 'pg-004', zims_id: 'PG-2020-005', name: 'Pepita', species: 'Pingüino de Humboldt', sex: 'Hembra', birth_date: '2020-02-14', department: 'pinguinario', status: 'Activo', microchip: 'ES-985-1200045703', location: 'Piscina norte', observations: 'La más joven del grupo. Curiosa y juguetona.' },
    // AMAZONIA
    { id: 'am-001', zims_id: 'AM-2016-001', name: 'Mango', species: 'Tucán Toco', sex: 'Macho', birth_date: '2016-04-20', department: 'amazonia', status: 'Activo', microchip: 'ES-985-1200045720', location: 'Selva tropical', observations: 'Uno de los animales más veteranos. Excelente estado de salud.' },
    { id: 'am-002', zims_id: 'AM-2019-003', name: 'Jade', species: 'Boa Esmeralda', sex: 'Hembra', birth_date: '2019-08-15', department: 'amazonia', status: 'Activo', microchip: 'ES-985-1200045721', location: 'Terrario principal', observations: 'Se alimenta correctamente cada 15 días. Muda reciente sin incidencias.' },
    { id: 'am-003', zims_id: 'AM-2020-002', name: 'Coco', species: 'Tití Pigmeo', sex: 'Macho', birth_date: '2020-12-01', department: 'amazonia', status: 'Activo', microchip: 'ES-985-1200045722', location: 'Isla de primates', observations: 'Activo y sociable con el grupo familiar. Buen apetito.' },
    { id: 'am-004', zims_id: 'AM-2018-006', name: 'Azul', species: 'Guacamayo Jacinto', sex: 'Macho', birth_date: '2018-03-25', department: 'amazonia', status: 'Activo', microchip: 'ES-985-1200045723', location: 'Aviario Amazonia', observations: 'Muy inteligente, responde bien a estímulos de enriquecimiento.' },
    // LEONES MARINOS
    { id: 'lm-001', zims_id: 'LM-2015-001', name: 'Capitán', species: 'León Marino de California', sex: 'Macho', birth_date: '2015-02-10', department: 'leones', status: 'Activo', microchip: 'ES-985-1200045740', location: 'Piscina principal', observations: 'Macho alfa. Estrella del espectáculo. Más de 50 comportamientos aprendidos.' },
    { id: 'lm-002', zims_id: 'LM-2017-003', name: 'Marina', species: 'León Marino de California', sex: 'Hembra', birth_date: '2017-07-19', department: 'leones', status: 'Activo', microchip: 'ES-985-1200045741', location: 'Piscina principal', observations: 'Muy cooperativa en sesiones veterinarias. Participa en espectáculos.' },
    { id: 'lm-003', zims_id: 'LM-2019-002', name: 'Zeus', species: 'León Marino de la Patagonia', sex: 'Macho', birth_date: '2019-10-30', department: 'leones', status: 'Activo', microchip: 'ES-985-1200045742', location: 'Piscina secundaria', observations: 'En fase avanzada de entrenamiento. Excelente progresión.' },
    { id: 'lm-004', zims_id: 'LM-2018-004', name: 'Perla', species: 'León Marino de California', sex: 'Hembra', birth_date: '2018-12-05', department: 'leones', status: 'Activo', microchip: 'ES-985-1200045743', location: 'Piscina principal', observations: 'Buena relación con entrenadores. Destacada en comportamientos acuáticos.' },
  ];

  // ── Helper to generate date offsets ───────────────────────
  function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  }

  // ── Diets ─────────────────────────────────────────────────
  function generateDiets() {
    return [
      // Kira - Águila
      { id: 'd-001', animal_id: 'av-001', date: daysAgo(1), food_type: 'Codorniz entera', quantity: '2 piezas', observations: 'Comió con apetito normal.' },
      { id: 'd-002', animal_id: 'av-001', date: daysAgo(3), food_type: 'Ratón descongelado', quantity: '3 piezas', observations: 'Aceptó bien.' },
      { id: 'd-003', animal_id: 'av-001', date: daysAgo(5), food_type: 'Codorniz entera', quantity: '2 piezas', observations: '' },
      // Thor - Búho
      { id: 'd-004', animal_id: 'av-002', date: daysAgo(1), food_type: 'Ratón descongelado', quantity: '4 piezas', observations: 'Alimentación nocturna.' },
      { id: 'd-005', animal_id: 'av-002', date: daysAgo(2), food_type: 'Pollito de un día', quantity: '3 piezas', observations: '' },
      // Luna - Guacamayo
      { id: 'd-006', animal_id: 'av-003', date: daysAgo(0), food_type: 'Frutas variadas + semillas', quantity: '200g frutas + 50g semillas', observations: 'Le encanta el mango.' },
      { id: 'd-007', animal_id: 'av-003', date: daysAgo(1), food_type: 'Pienso específico + fruta', quantity: '150g pienso + 180g fruta', observations: '' },
      // Nemo - Pingüino
      { id: 'd-010', animal_id: 'pg-001', date: daysAgo(0), food_type: 'Arenque', quantity: '800g', observations: 'Buen apetito.' },
      { id: 'd-011', animal_id: 'pg-001', date: daysAgo(1), food_type: 'Capelán + arenque', quantity: '600g + 300g', observations: 'Tomó vitaminas en el pescado.' },
      { id: 'd-012', animal_id: 'pg-001', date: daysAgo(3), food_type: 'Arenque', quantity: '750g', observations: '' },
      // Elsa - Pingüino
      { id: 'd-013', animal_id: 'pg-002', date: daysAgo(0), food_type: 'Capelán', quantity: '650g', observations: '' },
      { id: 'd-014', animal_id: 'pg-002', date: daysAgo(2), food_type: 'Arenque + vitaminas', quantity: '700g', observations: 'Suplemento vitamínico incluido.' },
      // Mango - Tucán
      { id: 'd-020', animal_id: 'am-001', date: daysAgo(0), food_type: 'Frutas tropicales', quantity: '300g', observations: 'Papaya, plátano, uvas.' },
      { id: 'd-021', animal_id: 'am-001', date: daysAgo(1), food_type: 'Pienso baja en hierro + fruta', quantity: '100g + 250g', observations: '' },
      // Coco - Tití
      { id: 'd-022', animal_id: 'am-003', date: daysAgo(0), food_type: 'Insectos + fruta', quantity: '30g grillos + 50g fruta', observations: 'Muy activo buscando grillos.' },
      { id: 'd-023', animal_id: 'am-003', date: daysAgo(1), food_type: 'Goma arábiga + insectos', quantity: '20g + 25g grillos', observations: '' },
      // Capitán - León Marino
      { id: 'd-030', animal_id: 'lm-001', date: daysAgo(0), food_type: 'Arenque + caballa', quantity: '4kg arenque + 2kg caballa', observations: 'Distribución en 3 tomas.' },
      { id: 'd-031', animal_id: 'lm-001', date: daysAgo(1), food_type: 'Arenque + capelán', quantity: '3.5kg + 2kg', observations: 'Comió todo durante el espectáculo.' },
      { id: 'd-032', animal_id: 'lm-001', date: daysAgo(2), food_type: 'Caballa + vitaminas', quantity: '5kg', observations: 'Suplemento de vitamina B.' },
      // Marina - León Marino
      { id: 'd-033', animal_id: 'lm-002', date: daysAgo(0), food_type: 'Arenque', quantity: '3kg', observations: '' },
      { id: 'd-034', animal_id: 'lm-002', date: daysAgo(1), food_type: 'Capelán + arenque', quantity: '2kg + 1.5kg', observations: 'Buen apetito en sesión de entreno.' },
    ];
  }

  // ── Trainings ─────────────────────────────────────────────
  function generateTrainings() {
    return [
      // Kira
      { id: 't-001', animal_id: 'av-001', date: daysAgo(1), behavior: 'Vuelo al guante', result: 'Excelente', observations: 'Respuesta inmediata, 5/5 repeticiones.' },
      { id: 't-002', animal_id: 'av-001', date: daysAgo(4), behavior: 'Vuelo largo (50m)', result: 'Bueno', observations: '3 de 4 repeticiones exitosas.' },
      { id: 't-003', animal_id: 'av-001', date: daysAgo(7), behavior: 'Estación en báscula', result: 'Excelente', observations: 'Se pesó sin problemas.' },
      // Thor
      { id: 't-004', animal_id: 'av-002', date: daysAgo(2), behavior: 'Target', result: 'Bueno', observations: 'Sigue el target con consistencia.' },
      { id: 't-005', animal_id: 'av-002', date: daysAgo(5), behavior: 'Vuelo silencioso', result: 'Excelente', observations: 'Impresionante para el público.' },
      // Nemo
      { id: 't-010', animal_id: 'pg-001', date: daysAgo(0), behavior: 'Estación', result: 'Excelente', observations: 'Responde al primer comando.' },
      { id: 't-011', animal_id: 'pg-001', date: daysAgo(3), behavior: 'Báscula voluntaria', result: 'Bueno', observations: 'Se sube a la báscula, algo inquieto.' },
      { id: 't-012', animal_id: 'pg-001', date: daysAgo(6), behavior: 'Seguir target', result: 'Excelente', observations: '' },
      // Rocky
      { id: 't-013', animal_id: 'pg-003', date: daysAgo(1), behavior: 'Target básico', result: 'Regular', observations: 'Todavía se distrae fácilmente.' },
      { id: 't-014', animal_id: 'pg-003', date: daysAgo(4), behavior: 'Estación', result: 'Bueno', observations: 'Mejorando progresivamente.' },
      // Capitán
      { id: 't-020', animal_id: 'lm-001', date: daysAgo(0), behavior: 'Salto de aro', result: 'Excelente', observations: 'Perfecto en el espectáculo.' },
      { id: 't-021', animal_id: 'lm-001', date: daysAgo(1), behavior: 'Equilibrio con pelota', result: 'Excelente', observations: 'Nuevo comportamiento dominado.' },
      { id: 't-022', animal_id: 'lm-001', date: daysAgo(3), behavior: 'Presentación voluntaria aletas', result: 'Excelente', observations: 'Cooperación veterinaria perfecta.' },
      { id: 't-023', animal_id: 'lm-001', date: daysAgo(5), behavior: 'Saludo al público', result: 'Excelente', observations: '' },
      // Marina
      { id: 't-024', animal_id: 'lm-002', date: daysAgo(1), behavior: 'Apertura voluntaria de boca', result: 'Excelente', observations: 'Para revisión dental.' },
      { id: 't-025', animal_id: 'lm-002', date: daysAgo(3), behavior: 'Estación en báscula', result: 'Bueno', observations: '' },
      // Zeus
      { id: 't-026', animal_id: 'lm-003', date: daysAgo(0), behavior: 'Target con nariz', result: 'Bueno', observations: 'Fase 2 del entrenamiento.' },
      { id: 't-027', animal_id: 'lm-003', date: daysAgo(2), behavior: 'Estación', result: 'Excelente', observations: 'Gran progreso esta semana.' },
    ];
  }

  // ── Weights ───────────────────────────────────────────────
  function generateWeights() {
    return [
      // Kira - ~900g águila de Harris
      { id: 'w-001', animal_id: 'av-001', date: daysAgo(0), weight_kg: 0.92, observations: 'Peso estable.' },
      { id: 'w-002', animal_id: 'av-001', date: daysAgo(7), weight_kg: 0.90, observations: '' },
      { id: 'w-003', animal_id: 'av-001', date: daysAgo(14), weight_kg: 0.91, observations: '' },
      { id: 'w-004', animal_id: 'av-001', date: daysAgo(21), weight_kg: 0.89, observations: '' },
      { id: 'w-005', animal_id: 'av-001', date: daysAgo(28), weight_kg: 0.93, observations: 'Ligero aumento, ajustar dieta.' },
      { id: 'w-006', animal_id: 'av-001', date: daysAgo(35), weight_kg: 0.88, observations: '' },
      // Thor - ~2.5kg búho
      { id: 'w-010', animal_id: 'av-002', date: daysAgo(0), weight_kg: 2.52, observations: '' },
      { id: 'w-011', animal_id: 'av-002', date: daysAgo(10), weight_kg: 2.48, observations: '' },
      { id: 'w-012', animal_id: 'av-002', date: daysAgo(20), weight_kg: 2.55, observations: '' },
      { id: 'w-013', animal_id: 'av-002', date: daysAgo(30), weight_kg: 2.50, observations: '' },
      // Nemo - ~4.5kg pingüino
      { id: 'w-020', animal_id: 'pg-001', date: daysAgo(0), weight_kg: 4.60, observations: 'Buen peso para la estación.' },
      { id: 'w-021', animal_id: 'pg-001', date: daysAgo(7), weight_kg: 4.55, observations: '' },
      { id: 'w-022', animal_id: 'pg-001', date: daysAgo(14), weight_kg: 4.50, observations: '' },
      { id: 'w-023', animal_id: 'pg-001', date: daysAgo(21), weight_kg: 4.65, observations: 'Aumento esperado pre-muda.' },
      { id: 'w-024', animal_id: 'pg-001', date: daysAgo(28), weight_kg: 4.70, observations: '' },
      { id: 'w-025', animal_id: 'pg-001', date: daysAgo(35), weight_kg: 4.45, observations: '' },
      { id: 'w-026', animal_id: 'pg-001', date: daysAgo(42), weight_kg: 4.40, observations: '' },
      // Elsa
      { id: 'w-027', animal_id: 'pg-002', date: daysAgo(0), weight_kg: 3.90, observations: '' },
      { id: 'w-028', animal_id: 'pg-002', date: daysAgo(14), weight_kg: 3.85, observations: '' },
      { id: 'w-029', animal_id: 'pg-002', date: daysAgo(28), weight_kg: 3.95, observations: '' },
      // Capitán - ~300kg león marino macho
      { id: 'w-030', animal_id: 'lm-001', date: daysAgo(0), weight_kg: 310, observations: 'Peso ideal para macho adulto.' },
      { id: 'w-031', animal_id: 'lm-001', date: daysAgo(7), weight_kg: 308, observations: '' },
      { id: 'w-032', animal_id: 'lm-001', date: daysAgo(14), weight_kg: 312, observations: '' },
      { id: 'w-033', animal_id: 'lm-001', date: daysAgo(21), weight_kg: 305, observations: 'Bajada por actividad en espectáculos.' },
      { id: 'w-034', animal_id: 'lm-001', date: daysAgo(28), weight_kg: 315, observations: '' },
      { id: 'w-035', animal_id: 'lm-001', date: daysAgo(35), weight_kg: 307, observations: '' },
      // Marina - ~90kg hembra
      { id: 'w-036', animal_id: 'lm-002', date: daysAgo(0), weight_kg: 92, observations: '' },
      { id: 'w-037', animal_id: 'lm-002', date: daysAgo(14), weight_kg: 90, observations: '' },
      { id: 'w-038', animal_id: 'lm-002', date: daysAgo(28), weight_kg: 93, observations: '' },
      // Coco - ~130g tití
      { id: 'w-040', animal_id: 'am-003', date: daysAgo(0), weight_kg: 0.132, observations: '' },
      { id: 'w-041', animal_id: 'am-003', date: daysAgo(14), weight_kg: 0.128, observations: 'Ligera bajada, vigilar.' },
      { id: 'w-042', animal_id: 'am-003', date: daysAgo(28), weight_kg: 0.135, observations: '' },
    ];
  }

  // ── Enrichments ───────────────────────────────────────────
  function generateEnrichments() {
    return [
      // Kira
      { id: 'e-001', animal_id: 'av-001', date: daysAgo(2), enrichment_type: 'Alimenticio - presa escondida', result: 'Positivo', observations: 'Encontró la presa en 3 minutos.' },
      { id: 'e-002', animal_id: 'av-001', date: daysAgo(10), enrichment_type: 'Sensorial - nuevos objetos', result: 'Positivo', observations: 'Exploró la caja con interés.' },
      // Luna
      { id: 'e-003', animal_id: 'av-003', date: daysAgo(1), enrichment_type: 'Cognitivo - puzzle feeder', result: 'Positivo', observations: 'Resolvió el puzzle rápidamente.' },
      { id: 'e-004', animal_id: 'av-003', date: daysAgo(8), enrichment_type: 'Social - espejo', result: 'Neutro', observations: 'Mostró poco interés.' },
      // Nemo
      { id: 'e-010', animal_id: 'pg-001', date: daysAgo(1), enrichment_type: 'Alimenticio - hielo con pescado', result: 'Positivo', observations: 'Muy motivado, jugó 20 minutos.' },
      { id: 'e-011', animal_id: 'pg-001', date: daysAgo(7), enrichment_type: 'Ambiental - chorro de agua', result: 'Positivo', observations: 'Todos los pingüinos participaron.' },
      // Capitán
      { id: 'e-020', animal_id: 'lm-001', date: daysAgo(0), enrichment_type: 'Cognitivo - pelota nueva', result: 'Positivo', observations: 'Jugó durante 15 minutos.' },
      { id: 'e-021', animal_id: 'lm-001', date: daysAgo(5), enrichment_type: 'Alimenticio - dispensador', result: 'Positivo', observations: 'Resolvió el mecanismo.' },
      { id: 'e-022', animal_id: 'lm-001', date: daysAgo(12), enrichment_type: 'Sensorial - hierbas aromáticas', result: 'Neutro', observations: 'Mostró interés moderado.' },
      // Azul
      { id: 'e-023', animal_id: 'am-004', date: daysAgo(3), enrichment_type: 'Cognitivo - puzzle madera', result: 'Positivo', observations: 'Lo resolvió en menos de 5 min.' },
      { id: 'e-024', animal_id: 'am-004', date: daysAgo(10), enrichment_type: 'Alimenticio - frutos escondidos', result: 'Positivo', observations: '' },
    ];
  }

  // ── Veterinary ────────────────────────────────────────────
  function generateVeterinary() {
    return [
      // Kira
      { id: 'v-001', animal_id: 'av-001', date: daysAgo(15), diagnosis: 'Revisión anual', treatment: 'Exploración completa, analítica sanguínea', medication: '', priority: 'Rutina', observations: 'Todo dentro de parámetros normales.' },
      { id: 'v-002', animal_id: 'av-001', date: daysAgo(60), diagnosis: 'Abrasión en tarso derecho', treatment: 'Limpieza y desinfección', medication: 'Betadine tópico', priority: 'Baja', observations: 'Revisar en 1 semana. Curó correctamente.' },
      // Thor
      { id: 'v-003', animal_id: 'av-002', date: daysAgo(30), diagnosis: 'Revisión rutinaria', treatment: 'Exploración general', medication: '', priority: 'Rutina', observations: 'Sin hallazgos.' },
      // Nemo
      { id: 'v-010', animal_id: 'pg-001', date: daysAgo(5), diagnosis: 'Control pre-muda', treatment: 'Analítica completa', medication: 'Suplemento vitamínico B', priority: 'Rutina', observations: 'Valores correctos. Preparado para periodo de muda.' },
      { id: 'v-011', animal_id: 'pg-001', date: daysAgo(45), diagnosis: 'Lesión menor en aleta', treatment: 'Desinfección y vendaje', medication: 'Antibiótico tópico', priority: 'Media', observations: 'Herida superficial, resolución en 5 días.' },
      // Rocky
      { id: 'v-012', animal_id: 'pg-003', date: daysAgo(20), diagnosis: 'Conjuntivitis leve', treatment: 'Colirio antibiótico', medication: 'Tobramicina oftálmica', priority: 'Media', observations: 'Aplicar 3 veces al día durante 7 días. Mejoró al 3er día.' },
      // Capitán
      { id: 'v-020', animal_id: 'lm-001', date: daysAgo(3), diagnosis: 'Revisión dental', treatment: 'Limpieza dental bajo sedación', medication: 'Sedación con midazolam', priority: 'Rutina', observations: 'Dentadura en buen estado general. Pequeño sarro retirado.' },
      { id: 'v-021', animal_id: 'lm-001', date: daysAgo(30), diagnosis: 'Revisión trimestral', treatment: 'Exploración completa + analítica', medication: '', priority: 'Rutina', observations: 'Excelente estado de salud.' },
      // Marina
      { id: 'v-022', animal_id: 'lm-002', date: daysAgo(10), diagnosis: 'Dermatitis leve zona ventral', treatment: 'Pomada antimicótica', medication: 'Ketoconazol tópico', priority: 'Baja', observations: 'Aplicar diariamente. Evolución favorable.' },
      // Coco
      { id: 'v-023', animal_id: 'am-003', date: daysAgo(7), diagnosis: 'Control de peso', treatment: 'Pesaje y observación', medication: '', priority: 'Rutina', observations: 'Peso ligeramente por debajo, aumentar ración.' },
      // Jade
      { id: 'v-024', animal_id: 'am-002', date: daysAgo(14), diagnosis: 'Post-muda', treatment: 'Inspección visual completa', medication: '', priority: 'Rutina', observations: 'Muda completada sin incidencias. Piel en buen estado.' },
    ];
  }

  // ── Seed Function ─────────────────────────────────────────
  async function seedAll() {
    const DB = App.DB;

    // Check if already seeded
    if (await DB.isSeeded()) {
      console.log('[Seed] Database already seeded. Skipping.');
      return false;
    }

    console.log('[Seed] Seeding database...');

    // Seed animals
    for (const animal of animals) {
      await DB.add('animals', animal);
    }

    // Seed diets
    for (const diet of generateDiets()) {
      await DB.add('diets', diet);
    }

    // Seed trainings
    for (const training of generateTrainings()) {
      await DB.add('trainings', training);
    }

    // Seed weights
    for (const weight of generateWeights()) {
      await DB.add('weights', weight);
    }

    // Seed enrichments
    for (const enrichment of generateEnrichments()) {
      await DB.add('enrichments', enrichment);
    }

    // Seed veterinary
    for (const vet of generateVeterinary()) {
      await DB.add('veterinary', vet);
    }

    console.log('[Seed] Database seeded successfully!');
    return true;
  }

  return { seedAll, animals };
})();

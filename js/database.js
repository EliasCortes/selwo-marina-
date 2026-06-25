/* ============================================================
   DATABASE - IndexedDB Layer for Control Animal Selwo
   ============================================================ */
window.App = window.App || {};

App.DB = (() => {
  'use strict';

  const DB_NAME = 'ControlAnimalSelwo';
  const DB_VERSION = 1;
  let db = null;

  const STORES = ['animals', 'diets', 'trainings', 'weights', 'enrichments', 'veterinary'];

  /**
   * Initialize the database: open connection and create stores/indexes.
   */
  function init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const database = event.target.result;

        // Animals store
        if (!database.objectStoreNames.contains('animals')) {
          const store = database.createObjectStore('animals', { keyPath: 'id' });
          store.createIndex('department', 'department', { unique: false });
          store.createIndex('species', 'species', { unique: false });
          store.createIndex('zims_id', 'zims_id', { unique: true });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }

        // Record stores (diets, trainings, weights, enrichments, veterinary)
        const recordStores = ['diets', 'trainings', 'weights', 'enrichments', 'veterinary'];
        recordStores.forEach(storeName => {
          if (!database.objectStoreNames.contains(storeName)) {
            const store = database.createObjectStore(storeName, { keyPath: 'id' });
            store.createIndex('animal_id', 'animal_id', { unique: false });
            store.createIndex('date', 'date', { unique: false });
          }
        });
      };

      request.onsuccess = (event) => {
        db = event.target.result;
        resolve(db);
      };

      request.onerror = (event) => {
        console.error('Database error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  /**
   * Get the database connection, initializing if needed.
   */
  function getDB() {
    if (db) return Promise.resolve(db);
    return init();
  }

  // ── Generic CRUD Operations ─────────────────────────────

  /**
   * Add a record to a store.
   */
  async function add(storeName, data) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      // Add audit fields
      const now = new Date().toISOString();
      const record = {
        ...data,
        id: data.id || App.Helpers.generateId(),
        created_at: data.created_at || now,
        updated_at: now,
        created_by: data.created_by || 'system',
      };

      const request = store.add(record);
      request.onsuccess = () => resolve(record);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a single record by ID.
   */
  async function get(storeName, id) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all records from a store.
   */
  async function getAll(storeName) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get records by an indexed field value.
   */
  async function getByIndex(storeName, indexName, value) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update a record (put).
   */
  async function update(storeName, data) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      const record = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const request = store.put(record);
      request.onsuccess = () => resolve(record);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a record by ID.
   */
  async function remove(storeName, id) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Count records in a store, optionally by index.
   */
  async function count(storeName, indexName, value) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);

      let request;
      if (indexName && value !== undefined) {
        const index = store.index(indexName);
        request = index.count(value);
      } else {
        request = store.count();
      }

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all records in a store.
   */
  async function clear(storeName) {
    const database = await getDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Check if the database has been seeded.
   */
  async function isSeeded() {
    try {
      const animalCount = await count('animals');
      return animalCount > 0;
    } catch {
      return false;
    }
  }

  /**
   * Export all data as JSON (for backup).
   */
  async function exportAll() {
    const data = {};
    for (const storeName of STORES) {
      data[storeName] = await getAll(storeName);
    }
    return data;
  }

  /**
   * Import data from JSON (for restore).
   */
  async function importAll(data) {
    for (const storeName of STORES) {
      if (data[storeName]) {
        await clear(storeName);
        for (const record of data[storeName]) {
          await add(storeName, record);
        }
      }
    }
  }

  // ── Service Layer (Higher-Level Operations) ───────────────

  const AnimalService = {
    getByDepartment: (deptId) => getByIndex('animals', 'department', deptId),
    getById: (id) => get('animals', id),
    create: (data) => add('animals', data),
    update: (data) => update('animals', data),
    remove: (id) => remove('animals', id),
    getAll: () => getAll('animals'),
    search: async (query, deptId) => {
      const animals = deptId
        ? await getByIndex('animals', 'department', deptId)
        : await getAll('animals');
      const q = query.toLowerCase();
      return animals.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.species.toLowerCase().includes(q) ||
        a.zims_id.toLowerCase().includes(q)
      );
    },
    getSpeciesByDept: async (deptId) => {
      const animals = await getByIndex('animals', 'department', deptId);
      return [...new Set(animals.map(a => a.species))].sort();
    },
  };

  function createRecordService(storeName) {
    return {
      getByAnimal: (animalId) => getByIndex(storeName, 'animal_id', animalId),
      getById: (id) => get(storeName, id),
      create: (data) => add(storeName, data),
      update: (data) => update(storeName, data),
      remove: (id) => remove(storeName, id),
      getAll: () => getAll(storeName),
      getByDepartment: async (deptId) => {
        const animals = await getByIndex('animals', 'department', deptId);
        const animalIds = new Set(animals.map(a => a.id));
        const allRecords = await getAll(storeName);
        return allRecords.filter(r => animalIds.has(r.animal_id));
      },
    };
  }

  const DietService = createRecordService('diets');
  const TrainingService = createRecordService('trainings');
  const WeightService = createRecordService('weights');
  const EnrichmentService = createRecordService('enrichments');
  const VeterinaryService = createRecordService('veterinary');

  /**
   * Get the appropriate service for a record type.
   */
  function getService(type) {
    const map = {
      diets: DietService,
      trainings: TrainingService,
      weights: WeightService,
      enrichments: EnrichmentService,
      veterinary: VeterinaryService,
      animals: AnimalService,
    };
    return map[type];
  }

  return {
    init,
    getDB,
    add,
    get,
    getAll,
    getByIndex,
    update,
    remove,
    count,
    clear,
    isSeeded,
    exportAll,
    importAll,
    STORES,
    AnimalService,
    DietService,
    TrainingService,
    WeightService,
    EnrichmentService,
    VeterinaryService,
    getService,
  };
})();

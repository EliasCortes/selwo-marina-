-- ============================================================
-- CONTROL ANIMAL SELWO — Esquema completo desde cero
-- Ejecutar en Supabase SQL Editor (en orden)
-- ============================================================

-- 1. Extensión para gen_random_uuid() (normalmente ya existe en Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ────────────────────────────────────────────────────────────
-- TABLA PRINCIPAL: animales
-- ────────────────────────────────────────────────────────────
CREATE TABLE animales (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre          TEXT NOT NULL,
  especie         TEXT NOT NULL,
  sexo            TEXT DEFAULT 'Desconocido',
  fecha_nacimiento DATE,
  zims_id         TEXT,
  microchip       TEXT,
  estado          TEXT DEFAULT 'Activo',
  ubicacion       TEXT,
  departamento_id TEXT,
  observaciones   TEXT,
  foto_url        TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- TABLAS HISTÓRICAS (todas con ON DELETE CASCADE)
-- ────────────────────────────────────────────────────────────

-- Dietas
CREATE TABLE diet_records (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id       UUID NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
  fecha           DATE NOT NULL DEFAULT CURRENT_DATE,
  alimento        TEXT,
  cantidad_gramos TEXT,
  observaciones   TEXT,
  -- Campos específicos Leones Marinos
  departamento_id TEXT,
  dieta_total     NUMERIC,
  arenque_grande  NUMERIC DEFAULT 0,
  arenque_pequeno NUMERIC DEFAULT 0,
  capelin         NUMERIC DEFAULT 0,
  sprat           NUMERIC DEFAULT 0,
  caballa         NUMERIC DEFAULT 0,
  bacaladilla     NUMERIC DEFAULT 0,
  vitaminas       TEXT,
  sesiones        JSONB DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Entrenamientos
CREATE TABLE entrenamientos (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id           UUID NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
  fecha               DATE NOT NULL DEFAULT CURRENT_DATE,
  conducta_entrenada  TEXT,
  resultado           TEXT,
  comentarios         TEXT,
  numero_sesion       INTEGER DEFAULT 1,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- Pesos
CREATE TABLE pesos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id   UUID NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
  fecha       DATE NOT NULL DEFAULT CURRENT_DATE,
  peso_kg     NUMERIC,
  observaciones TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Enriquecimientos
CREATE TABLE enriquecimientos (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id             UUID NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
  fecha                 DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo_enriquecimiento  TEXT,
  respuesta_animal      TEXT,
  observaciones         TEXT,
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- Veterinaria
CREATE TABLE veterinaria (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id     UUID NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
  fecha         DATE NOT NULL DEFAULT CURRENT_DATE,
  diagnostico   TEXT,
  tratamiento   TEXT,
  medicacion    TEXT,
  estado_salud  TEXT,
  observaciones TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- ÍNDICES para rendimiento en consultas por animal_id
-- ────────────────────────────────────────────────────────────
CREATE INDEX idx_diet_records_animal    ON diet_records(animal_id);
CREATE INDEX idx_entrenamientos_animal  ON entrenamientos(animal_id);
CREATE INDEX idx_pesos_animal           ON pesos(animal_id);
CREATE INDEX idx_enriquecimientos_animal ON enriquecimientos(animal_id);
CREATE INDEX idx_veterinaria_animal     ON veterinaria(animal_id);

-- ────────────────────────────────────────────────────────────
-- RLS: Políticas permisivas (acceso anon/authenticated)
-- ────────────────────────────────────────────────────────────
ALTER TABLE animales         ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_records     ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrenamientos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE enriquecimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinaria      ENABLE ROW LEVEL SECURITY;

-- Política: acceso total para anon y authenticated
CREATE POLICY "Acceso total animales"         ON animales         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total diet_records"     ON diet_records     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total entrenamientos"   ON entrenamientos   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total pesos"            ON pesos            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total enriquecimientos" ON enriquecimientos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total veterinaria"      ON veterinaria      FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Migración: add_animal_detail_columns
-- Añade columnas para sexo, ZIMS ID, microchip,
-- ubicación y estado a la tabla animales.
-- ============================================

ALTER TABLE animales ADD COLUMN IF NOT EXISTS sexo TEXT DEFAULT 'Desconocido';
ALTER TABLE animales ADD COLUMN IF NOT EXISTS zims_id TEXT;
ALTER TABLE animales ADD COLUMN IF NOT EXISTS microchip TEXT;
ALTER TABLE animales ADD COLUMN IF NOT EXISTS ubicacion TEXT;
ALTER TABLE animales ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'Activo';

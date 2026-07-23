-- Migración para añadir soporte a pescados de Delfines
-- Pescados a añadir: sardina, merlan, merluza
-- Los pescados caballa, sprat y bacaladilla ya existen en la tabla.

ALTER TABLE diet_records
ADD COLUMN IF NOT EXISTS sardina NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS merlan NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS merluza NUMERIC DEFAULT 0;

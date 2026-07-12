-- ============================================
-- Tabla: animales
-- App: selwo-marina- (Control Animal Selwo)
-- ============================================

CREATE TABLE IF NOT EXISTS animales (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre        TEXT        NOT NULL,
  especie       TEXT        NOT NULL,
  edad          INTEGER     NOT NULL CHECK (edad >= 0),
  foto_url      TEXT,
  historial_medico TEXT,
  fecha_ingreso DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsquedas frecuentes por especie
CREATE INDEX IF NOT EXISTS idx_animales_especie ON animales (especie);

-- Índice para ordenar por fecha de ingreso
CREATE INDEX IF NOT EXISTS idx_animales_fecha_ingreso ON animales (fecha_ingreso DESC);

-- Función trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_animales_updated_at
  BEFORE UPDATE ON animales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE animales ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública (ajustar según necesidad)
CREATE POLICY "Lectura pública de animales"
  ON animales FOR SELECT
  USING (true);

-- Política de inserción autenticada
CREATE POLICY "Inserción autenticada de animales"
  ON animales FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política de actualización autenticada
CREATE POLICY "Actualización autenticada de animales"
  ON animales FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política de eliminación autenticada
CREATE POLICY "Eliminación autenticada de animales"
  ON animales FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- TRAINING SESSIONS — Sesiones de entrenamiento diarias
-- Ejecutar en Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS training_sessions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id       UUID NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
  session_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  session_number  INTEGER NOT NULL DEFAULT 1,
  attitude        TEXT NOT NULL DEFAULT 'Bueno',
  trainer         TEXT,
  enrichment      TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_training_sessions_animal ON training_sessions(animal_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date   ON training_sessions(session_date);

ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso total training_sessions"
  ON training_sessions FOR ALL
  USING (true) WITH CHECK (true);

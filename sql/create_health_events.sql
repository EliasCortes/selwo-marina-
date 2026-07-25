-- ============================================================
-- CONTROL ANIMAL SELWO — Migración: Tabla animal_health_events
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- TABLA: animal_health_events
-- Registra episodios de comportamiento y salud (tos, síntomas, etc.)
-- ────────────────────────────────────────────────────────────
CREATE TABLE animal_health_events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id   UUID NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL DEFAULT 'Tos',
  event_time  TIMESTAMPTZ NOT NULL DEFAULT now(),
  frequency   INTEGER NOT NULL DEFAULT 1,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Índice para consultas rápidas por animal ────────────────
CREATE INDEX idx_health_events_animal ON animal_health_events(animal_id);

-- ── Índice para ordenar por fecha/hora ──────────────────────
CREATE INDEX idx_health_events_time ON animal_health_events(event_time);

-- ── RLS: Acceso total (mismo patrón que las demás tablas) ───
ALTER TABLE animal_health_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso total animal_health_events"
  ON animal_health_events
  FOR ALL USING (true) WITH CHECK (true);

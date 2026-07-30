-- ============================================================
-- CONTROL ANIMAL SELWO — Autenticación, RBAC y Trazabilidad
-- Ejecutar en el editor SQL de Supabase
-- ============================================================

-- 1. EXTENSIONES Y TIPOS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('admin', 'head', 'trainer');

-- 2. TABLA: DEPARTAMENTOS
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

-- Insertar departamentos iniciales solicitados
INSERT INTO departments (name, slug) VALUES 
  ('Aves', 'aves'),
  ('Pingüinos', 'pinguinos'),
  ('Mamíferos Marinos', 'mamiferos-marinos'),
  ('Amazonía', 'amazonia')
ON CONFLICT (slug) DO NOTHING;

-- 3. TABLA: PERFILES (Vinculada a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'trainer'
);

-- 4. TABLA INTERMEDIA: USUARIO - DEPARTAMENTOS (Asignación Múltiple)
CREATE TABLE IF NOT EXISTS user_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  UNIQUE(user_id, department_id)
);

-- 4.5 ASEGURAR QUE LAS TABLAS SECUNDARIAS EXISTAN ANTES DE APLICAR TRAZABILIDAD
-- (Por si el usuario no ejecutó create_training_sessions.sql y create_health_events.sql antes)

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

CREATE TABLE IF NOT EXISTS animal_health_events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id   UUID NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL DEFAULT 'Tos',
  event_time  TIMESTAMPTZ NOT NULL DEFAULT now(),
  frequency   INTEGER NOT NULL DEFAULT 1,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_health_events_animal ON animal_health_events(animal_id);
CREATE INDEX IF NOT EXISTS idx_health_events_time ON animal_health_events(event_time);

-- 5. AJUSTAR TABLA ANIMALES
-- Nota: En schema_completo.sql `departamento_id` era TEXT.
-- Recomendamos cambiarlo a UUID para mantener consistencia.
-- Si la base de datos está vacía, podemos recrear la columna:
ALTER TABLE animales DROP COLUMN IF EXISTS departamento_id;
ALTER TABLE animales ADD COLUMN departamento_id UUID REFERENCES departments(id);

-- 6. AÑADIR TRAZABILIDAD (Audit Trail)
-- Añadir `created_by` a las tablas de registros (created_at ya existe)
ALTER TABLE animales ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE diet_records ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE entrenamientos ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE pesos ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE enriquecimientos ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE veterinaria ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE animal_health_events ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- 7. TRIGGERS PARA ASIGNACIÓN AUTOMÁTICA DE CREATED_BY
CREATE OR REPLACE FUNCTION trigger_set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo se establece si estamos en un contexto autenticado de Supabase
  IF auth.uid() IS NOT NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar el trigger a todas las tablas de datos
DROP TRIGGER IF EXISTS trg_animales_created_by ON animales;
CREATE TRIGGER trg_animales_created_by BEFORE INSERT ON animales FOR EACH ROW EXECUTE FUNCTION trigger_set_created_by();

DROP TRIGGER IF EXISTS trg_diet_records_created_by ON diet_records;
CREATE TRIGGER trg_diet_records_created_by BEFORE INSERT ON diet_records FOR EACH ROW EXECUTE FUNCTION trigger_set_created_by();

DROP TRIGGER IF EXISTS trg_entrenamientos_created_by ON entrenamientos;
CREATE TRIGGER trg_entrenamientos_created_by BEFORE INSERT ON entrenamientos FOR EACH ROW EXECUTE FUNCTION trigger_set_created_by();

DROP TRIGGER IF EXISTS trg_pesos_created_by ON pesos;
CREATE TRIGGER trg_pesos_created_by BEFORE INSERT ON pesos FOR EACH ROW EXECUTE FUNCTION trigger_set_created_by();

DROP TRIGGER IF EXISTS trg_enriquecimientos_created_by ON enriquecimientos;
CREATE TRIGGER trg_enriquecimientos_created_by BEFORE INSERT ON enriquecimientos FOR EACH ROW EXECUTE FUNCTION trigger_set_created_by();

DROP TRIGGER IF EXISTS trg_veterinaria_created_by ON veterinaria;
CREATE TRIGGER trg_veterinaria_created_by BEFORE INSERT ON veterinaria FOR EACH ROW EXECUTE FUNCTION trigger_set_created_by();

DROP TRIGGER IF EXISTS trg_training_sessions_created_by ON training_sessions;
CREATE TRIGGER trg_training_sessions_created_by BEFORE INSERT ON training_sessions FOR EACH ROW EXECUTE FUNCTION trigger_set_created_by();

DROP TRIGGER IF EXISTS trg_health_events_created_by ON animal_health_events;
CREATE TRIGGER trg_health_events_created_by BEFORE INSERT ON animal_health_events FOR EACH ROW EXECUTE FUNCTION trigger_set_created_by();

-- 8. FUNCIÓN AUXILIAR PARA RLS
-- Verifica si el usuario actual tiene acceso al departamento especificado
CREATE OR REPLACE FUNCTION user_can_access_department(dept_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_role user_role;
BEGIN
  -- Obtener el rol del usuario autenticado
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
  
  -- Los administradores (admin y veterinarios root) acceden a todo
  IF v_role = 'admin' THEN
    RETURN TRUE;
  END IF;

  -- Para entrenadores y jefes, verificar la tabla intermedia
  RETURN EXISTS (
    SELECT 1 FROM user_departments 
    WHERE user_id = auth.uid() AND department_id = dept_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 9. POLÍTICAS RLS (Row Level Security)
-- Activar RLS en las nuevas tablas
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_departments ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura de configuración (pública o para autenticados)
CREATE POLICY "Lectura pública departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Lectura perfiles autenticados" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuario ve sus propios perfiles" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Lectura user_departments" ON user_departments FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Eliminar políticas antiguas (si las hubiera del schema_completo)
DROP POLICY IF EXISTS "Acceso total animales" ON animales;
DROP POLICY IF EXISTS "Acceso total diet_records" ON diet_records;
DROP POLICY IF EXISTS "Acceso total entrenamientos" ON entrenamientos;
DROP POLICY IF EXISTS "Acceso total pesos" ON pesos;
DROP POLICY IF EXISTS "Acceso total enriquecimientos" ON enriquecimientos;
DROP POLICY IF EXISTS "Acceso total veterinaria" ON veterinaria;
DROP POLICY IF EXISTS "Acceso total training_sessions" ON training_sessions;
DROP POLICY IF EXISTS "Acceso total animal_health_events" ON animal_health_events;

-- Políticas para Animales (Lectura y Escritura)
CREATE POLICY "Acceso restringido animales" ON animales
  FOR ALL USING (
    user_can_access_department(departamento_id)
  ) WITH CHECK (
    user_can_access_department(departamento_id)
  );

-- Para las tablas hijas (pesos, dietas, etc.), deben unirse a animales para ver el departamento
-- Creamos una función helper para obtener el departamento de un animal
CREATE OR REPLACE FUNCTION get_animal_department(p_animal_id UUID)
RETURNS UUID AS $$
  SELECT departamento_id FROM animales WHERE id = p_animal_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Políticas para Tablas Hijas
CREATE POLICY "Acceso restringido diet_records" ON diet_records
  FOR ALL USING (user_can_access_department(get_animal_department(animal_id)))
  WITH CHECK (user_can_access_department(get_animal_department(animal_id)));

CREATE POLICY "Acceso restringido entrenamientos" ON entrenamientos
  FOR ALL USING (user_can_access_department(get_animal_department(animal_id)))
  WITH CHECK (user_can_access_department(get_animal_department(animal_id)));

CREATE POLICY "Acceso restringido pesos" ON pesos
  FOR ALL USING (user_can_access_department(get_animal_department(animal_id)))
  WITH CHECK (user_can_access_department(get_animal_department(animal_id)));

CREATE POLICY "Acceso restringido enriquecimientos" ON enriquecimientos
  FOR ALL USING (user_can_access_department(get_animal_department(animal_id)))
  WITH CHECK (user_can_access_department(get_animal_department(animal_id)));

CREATE POLICY "Acceso restringido veterinaria" ON veterinaria
  FOR ALL USING (user_can_access_department(get_animal_department(animal_id)))
  WITH CHECK (user_can_access_department(get_animal_department(animal_id)));
  
CREATE POLICY "Acceso restringido training_sessions" ON training_sessions
  FOR ALL USING (user_can_access_department(get_animal_department(animal_id)))
  WITH CHECK (user_can_access_department(get_animal_department(animal_id)));

CREATE POLICY "Acceso restringido animal_health_events" ON animal_health_events
  FOR ALL USING (user_can_access_department(get_animal_department(animal_id)))
  WITH CHECK (user_can_access_department(get_animal_department(animal_id)));

-- 10. TRIGGER PARA CREAR PERFIL AUTOMÁTICO EN SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'trainer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 1: Lock down schema-level access
REVOKE USAGE ON SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

-- Apply to all future tables/sequences created by migrations
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;

-- 2: A function that enables RLS + adds block policies
CREATE OR REPLACE FUNCTION secure_table(target_table text, target_schema text DEFAULT 'public')
RETURNS void
LANGUAGE plpgsql
SET search_path = pg_catalog  -- 🔒 SECURITY FIX: Lock schema resolution
AS $$
BEGIN
  -- Enable RLS
  EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', target_schema, target_table);

  -- Drop existing block policies if they exist (idempotent)
  EXECUTE format('DROP POLICY IF EXISTS block_anon ON %I.%I', target_schema, target_table);
  EXECUTE format('DROP POLICY IF EXISTS block_authenticated ON %I.%I', target_schema, target_table);

  -- Create restrictive block policies
  EXECUTE format(
    'CREATE POLICY block_anon ON %I.%I AS RESTRICTIVE FOR ALL TO anon USING (false)',
    target_schema, target_table
  );
  EXECUTE format(
    'CREATE POLICY block_authenticated ON %I.%I AS RESTRICTIVE FOR ALL TO authenticated USING (false)',
    target_schema, target_table
  );
END;
$$;

-- 3: Dynamically secure ALL existing tables in public schema
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      -- Exclude Supabase internal, migration tracking, and audit tables
      AND tablename NOT LIKE '%migration%'
      AND tablename NOT LIKE 'supabase_%'
      AND tablename NOT LIKE 'rls_%'
  LOOP
    PERFORM secure_table(tbl.tablename, 'public');
  END LOOP;
END $$;

-- 4: Audit view — see which tables are protected
CREATE OR REPLACE VIEW public.rls_audit AS
SELECT
  t.tablename,
  t.rowsecurity AS rls_enabled,
  COUNT(p.policyname) FILTER (
    WHERE p.policyname IN ('block_anon','block_authenticated')
  ) AS block_policies_count,
  CASE
    WHEN t.rowsecurity AND COUNT(p.policyname) FILTER (
      WHERE p.policyname IN ('block_anon','block_authenticated')
    ) = 2 THEN 'protected'
    WHEN t.rowsecurity THEN 'rls_on_but_incomplete'
    ELSE 'unprotected'
  END AS status
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename
  AND p.schemaname = 'public'
WHERE t.schemaname = 'public'
  AND t.tablename NOT LIKE 'rls_%'   -- exclude this view's backing tables
GROUP BY t.tablename, t.rowsecurity;
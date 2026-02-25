-- ===================================================================
-- VERIFY: announcements constraints + category health check
-- ===================================================================
-- Run this in Supabase SQL Editor
-- ===================================================================

-- 1) List all constraints on announcements
SELECT
  c.conname AS constraint_name,
  CASE c.contype
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'u' THEN 'UNIQUE'
    WHEN 'c' THEN 'CHECK'
    WHEN 'x' THEN 'EXCLUDE'
    ELSE c.contype::text
  END AS constraint_type,
  pg_get_constraintdef(c.oid) AS definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND t.relname = 'announcements'
ORDER BY constraint_type, constraint_name;

-- 2) Current category distribution
SELECT
  COALESCE(category, '(NULL)') AS category,
  COUNT(*) AS row_count
FROM public.announcements
GROUP BY category
ORDER BY row_count DESC, category;

-- 3) Rows that violate expected categories (should return 0 rows)
SELECT
  id,
  category,
  title,
  created_at
FROM public.announcements
WHERE category IS DISTINCT FROM NULL
  AND category NOT IN ('car', 'house', 'land', 'other')
ORDER BY created_at DESC
LIMIT 100;

-- 4) Quick status breakdown (optional sanity check)
SELECT
  COALESCE(status, '(NULL)') AS status,
  COUNT(*) AS row_count
FROM public.announcements
GROUP BY status
ORDER BY row_count DESC, status;

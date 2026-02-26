-- ===================================================================
-- FIX: Allow world/sport/local categories in articles
-- ===================================================================
-- Run this in Supabase SQL Editor.
-- ===================================================================

-- 1) Drop known/legacy category constraints if present
ALTER TABLE public.articles
DROP CONSTRAINT IF EXISTS category_check;

ALTER TABLE public.articles
DROP CONSTRAINT IF EXISTS articles_category_check;

-- 2) Add a strict category constraint used by the app
ALTER TABLE public.articles
ADD CONSTRAINT articles_category_check
CHECK (category IN ('world', 'sport', 'local'));

-- 3) Optional verification
-- SELECT conname, pg_get_constraintdef(c.oid)
-- FROM pg_constraint c
-- JOIN pg_class t ON c.conrelid = t.oid
-- JOIN pg_namespace n ON t.relnamespace = n.oid
-- WHERE n.nspname = 'public' AND t.relname = 'articles' AND c.contype = 'c';

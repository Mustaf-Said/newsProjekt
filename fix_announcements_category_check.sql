-- ===================================================================
-- FIX: Allow "other" category in announcements
-- ===================================================================
-- Error solved:
-- new row for relation "announcements" violates check constraint "category_check" (23514)
--
-- Run this in Supabase SQL Editor.
-- ===================================================================

ALTER TABLE public.announcements
DROP CONSTRAINT IF EXISTS category_check;

ALTER TABLE public.announcements
ADD CONSTRAINT category_check
CHECK (category IN ('car', 'house', 'land', 'other'));

-- Optional verification
-- SELECT conname, pg_get_constraintdef(c.oid)
-- FROM pg_constraint c
-- JOIN pg_class t ON c.conrelid = t.oid
-- WHERE t.relname = 'announcements' AND c.conname = 'category_check';

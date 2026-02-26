-- ===================================================================
-- FIX: Secure news_update_logs table with RLS
-- ===================================================================
-- Run this in Supabase SQL Editor
-- ===================================================================

ALTER TABLE public.news_update_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_update_logs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read news update logs" ON public.news_update_logs;
DROP POLICY IF EXISTS "Service role can insert news update logs" ON public.news_update_logs;

CREATE POLICY "Admins can read news update logs"
  ON public.news_update_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Service role can insert news update logs"
  ON public.news_update_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Optional verification:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'news_update_logs';
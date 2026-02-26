-- Logs each execution of /api/cron/update-news so runs can be verified in Supabase
CREATE TABLE IF NOT EXISTS public.news_update_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  job_name TEXT NOT NULL DEFAULT 'update-news',
  status TEXT NOT NULL CHECK (status IN ('success', 'skipped', 'error')),
  inserted_count INTEGER NOT NULL DEFAULT 0,
  world_fetched INTEGER NOT NULL DEFAULT 0,
  sport_fetched INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_update_logs_ran_at
  ON public.news_update_logs (ran_at DESC);

COMMENT ON TABLE public.news_update_logs IS 'Execution logs for daily world and football news cron updates';
COMMENT ON COLUMN public.news_update_logs.status IS 'success, skipped, or error';

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
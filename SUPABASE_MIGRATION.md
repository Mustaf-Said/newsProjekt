# Supabase Migration: Add Translation Columns

Run this SQL in your Supabase SQL Editor:

```sql
-- Add Somali translation columns to articles table
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS title_so TEXT,
ADD COLUMN IF NOT EXISTS content_so TEXT;

-- Add comment for documentation
COMMENT ON COLUMN articles.title_so IS 'Somali translation of title';
COMMENT ON COLUMN articles.content_so IS 'Somali translation of content';
```

After running this SQL:

1. Restart your Next.js dev server
2. Hit `/api/cron/update-news` to populate world and sport articles with translations
3. Verify `sport` category appears in the database
4. Check `/FootballNews` page

## Alternative: Remove Translation Features

If you don't want translations, I can update the code to remove all `title_so`/`content_so` references.

## Cron Run Logs (Recommended)

To verify that daily Vercel cron runs are working, also run:

```sql
-- create table used by /api/cron/update-news for execution logs
-- file: create_news_update_logs_table.sql
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
```

After deployment, open `public.news_update_logs` in Supabase Table Editor and sort by `ran_at` descending.

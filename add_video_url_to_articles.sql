-- Add video_url column to articles table
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN articles.video_url IS 'Optional YouTube video URL for local news';

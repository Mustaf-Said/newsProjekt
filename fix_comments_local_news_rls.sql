-- FIX: Comments moderation rules for Local News
-- Goal:
-- 1) New comments are pending until admin approval
-- 2) Public can read only approved comments
-- 3) Only authenticated users can insert comments for Local News articles
-- 4) Admin can approve/reject/remove comments

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.comments
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'comments_status_check'
      AND conrelid = 'public.comments'::regclass
  ) THEN
    ALTER TABLE public.comments
    ADD CONSTRAINT comments_status_check
    CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

UPDATE public.comments
SET status = 'approved'
WHERE status IS NULL;

DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'comments'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.comments;', p.policyname);
  END LOOP;
END $$;

CREATE POLICY "Anyone can read approved comments"
ON public.comments
FOR SELECT
USING (status = 'approved');

CREATE POLICY "Authenticated users can insert pending comments on local news"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND article_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.articles a
    WHERE a.id = comments.article_id
      AND a.category = 'local'
  )
);

CREATE POLICY "Admins can read all comments"
ON public.comments
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can update comment moderation"
ON public.comments
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete comments"
ON public.comments
FOR DELETE
TO authenticated
USING (public.is_admin());

-- =========================================
-- OPTIMIZATION CACHE TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS public.resume_optimization_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(resume_id)
);

ALTER TABLE public.resume_optimization_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "resume_optimization_cache_all_own" ON public.resume_optimization_cache;
CREATE POLICY "resume_optimization_cache_all_own" ON public.resume_optimization_cache
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.resumes r 
      WHERE r.id = resume_optimization_cache.resume_id 
      AND r.user_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS resume_optimization_cache_touch ON public.resume_optimization_cache;
CREATE TRIGGER resume_optimization_cache_touch BEFORE UPDATE ON public.resume_optimization_cache
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================
-- ADD NEW METADATA COLUMNS TO RESUME_VERSIONS
-- =========================================
ALTER TABLE public.resume_versions
  ADD COLUMN IF NOT EXISTS ai_provider TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS ai_model TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS ats_before INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ats_after INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS changes_summary TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS pdf_path TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS docx_path TEXT DEFAULT '';

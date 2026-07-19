-- =========================================
-- USER AI SETTINGS
-- =========================================
CREATE TABLE IF NOT EXISTS public.user_ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'gemini', -- gemini | grok
  api_key TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_ai_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_ai_settings_select_own" ON public.user_ai_settings;
CREATE POLICY "user_ai_settings_select_own" ON public.user_ai_settings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_ai_settings_insert_own" ON public.user_ai_settings;
CREATE POLICY "user_ai_settings_insert_own" ON public.user_ai_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_ai_settings_update_own" ON public.user_ai_settings;
CREATE POLICY "user_ai_settings_update_own" ON public.user_ai_settings
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_ai_settings_delete_own" ON public.user_ai_settings;
CREATE POLICY "user_ai_settings_delete_own" ON public.user_ai_settings
  FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS user_ai_settings_touch ON public.user_ai_settings;
CREATE TRIGGER user_ai_settings_touch BEFORE UPDATE ON public.user_ai_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================
-- RESUME VERSIONS
-- =========================================
CREATE TABLE IF NOT EXISTS public.resume_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  is_original BOOLEAN NOT NULL DEFAULT false,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  markdown TEXT DEFAULT '',
  plain_text TEXT DEFAULT '',
  optimization_questions JSONB DEFAULT '[]'::jsonb,
  user_answers JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "resume_versions_select_own" ON public.resume_versions;
CREATE POLICY "resume_versions_select_own" ON public.resume_versions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "resume_versions_insert_own" ON public.resume_versions;
CREATE POLICY "resume_versions_insert_own" ON public.resume_versions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "resume_versions_update_own" ON public.resume_versions;
CREATE POLICY "resume_versions_update_own" ON public.resume_versions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "resume_versions_delete_own" ON public.resume_versions;
CREATE POLICY "resume_versions_delete_own" ON public.resume_versions
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS resume_versions_resume_idx ON public.resume_versions(resume_id, version_number DESC);

-- =========================================
-- Update resumes table to include ai_analysis
-- =========================================
ALTER TABLE public.resumes
ADD COLUMN IF NOT EXISTS ai_analysis JSONB DEFAULT '{}'::jsonb;

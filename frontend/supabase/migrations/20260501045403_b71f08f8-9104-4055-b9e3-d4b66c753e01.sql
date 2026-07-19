
-- =========================================
-- PROFILES
-- =========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  current_title TEXT DEFAULT '',
  current_company TEXT DEFAULT '',
  location TEXT DEFAULT '',
  years_of_experience NUMERIC DEFAULT 0,
  target_role TEXT DEFAULT '',
  target_salary_min INTEGER DEFAULT 0,
  target_salary_max INTEGER DEFAULT 0,
  target_location TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  portfolio_url TEXT DEFAULT '',
  career_dna_score NUMERIC DEFAULT 0,
  total_analyses INTEGER DEFAULT 0,
  is_onboarded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================
-- RESUMES
-- =========================================
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Resume',
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  file_size INTEGER DEFAULT 0,
  raw_text TEXT DEFAULT '',
  parsed_data JSONB DEFAULT '{}'::jsonb,
  extracted_skills JSONB DEFAULT '[]'::jsonb,
  total_experience_years NUMERIC DEFAULT 0,
  education_level TEXT DEFAULT '',
  career_dna JSONB DEFAULT '{}'::jsonb,
  word_count INTEGER DEFAULT 0,
  is_ats_friendly BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  parse_status TEXT NOT NULL DEFAULT 'pending', -- pending | parsing | done | error
  parse_error TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "resumes_select_own" ON public.resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "resumes_insert_own" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "resumes_update_own" ON public.resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "resumes_delete_own" ON public.resumes FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER resumes_touch BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX resumes_user_idx ON public.resumes(user_id, created_at DESC);

-- =========================================
-- ANALYSES (per-job analysis)
-- =========================================
CREATE TABLE public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL DEFAULT '',
  company_name TEXT DEFAULT '',
  job_description TEXT NOT NULL DEFAULT '',
  company_description TEXT DEFAULT '',
  location TEXT DEFAULT '',
  -- Scores
  ats_score INTEGER DEFAULT 0,
  keyword_match_percent INTEGER DEFAULT 0,
  interview_probability INTEGER DEFAULT 0,
  skills_match_score INTEGER DEFAULT 0,
  experience_match_score INTEGER DEFAULT 0,
  education_match_score INTEGER DEFAULT 0,
  culture_fit_score INTEGER DEFAULT 0,
  negotiation_power_score INTEGER DEFAULT 0,
  competitor_percentile INTEGER DEFAULT 0,
  salary_min INTEGER DEFAULT 0,
  salary_max INTEGER DEFAULT 0,
  salary_median INTEGER DEFAULT 0,
  salary_currency TEXT DEFAULT 'USD',
  grade TEXT DEFAULT 'C',
  -- JSON payloads
  score_breakdown JSONB DEFAULT '{}'::jsonb,
  matched_keywords JSONB DEFAULT '[]'::jsonb,
  missing_keywords JSONB DEFAULT '[]'::jsonb,
  skill_gaps JSONB DEFAULT '[]'::jsonb,
  skill_roadmap JSONB DEFAULT '[]'::jsonb,
  transferable_skills JSONB DEFAULT '[]'::jsonb,
  ats_issues JSONB DEFAULT '[]'::jsonb,
  career_trajectory JSONB DEFAULT '[]'::jsonb,
  uvp_points JSONB DEFAULT '[]'::jsonb,
  culture_signals JSONB DEFAULT '{}'::jsonb,
  salary_boosters JSONB DEFAULT '[]'::jsonb,
  quick_wins JSONB DEFAULT '[]'::jsonb,
  blockers JSONB DEFAULT '[]'::jsonb,
  cover_letter_professional TEXT DEFAULT '',
  cover_letter_conversational TEXT DEFAULT '',
  cover_letter_creative TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending', -- pending | running | done | error
  error_message TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analyses_select_own" ON public.analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "analyses_insert_own" ON public.analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "analyses_update_own" ON public.analyses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "analyses_delete_own" ON public.analyses FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER analyses_touch BEFORE UPDATE ON public.analyses
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX analyses_user_idx ON public.analyses(user_id, created_at DESC);
CREATE INDEX analyses_resume_idx ON public.analyses(resume_id);

-- =========================================
-- JOB APPLICATIONS (Kanban)
-- =========================================
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL DEFAULT '',
  job_title TEXT NOT NULL DEFAULT '',
  job_url TEXT DEFAULT '',
  location TEXT DEFAULT '',
  job_type TEXT DEFAULT 'full_time',
  salary_offered INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'wishlist',
  -- wishlist | applied | phone_screen | interview | technical | final_round | offer | accepted | rejected | withdrawn | ghosted
  applied_date DATE,
  deadline DATE,
  contact_person TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  follow_up_date DATE,
  interview_date DATE,
  offer_amount INTEGER DEFAULT 0,
  excitement_level INTEGER DEFAULT 3,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs_select_own" ON public.job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "jobs_insert_own" ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "jobs_update_own" ON public.job_applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "jobs_delete_own" ON public.job_applications FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER jobs_touch BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX jobs_user_status_idx ON public.job_applications(user_id, status, position);

-- =========================================
-- STORAGE: resumes bucket (private)
-- =========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "resumes_storage_select_own" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "resumes_storage_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "resumes_storage_update_own" ON storage.objects
  FOR UPDATE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "resumes_storage_delete_own" ON storage.objects
  FOR DELETE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

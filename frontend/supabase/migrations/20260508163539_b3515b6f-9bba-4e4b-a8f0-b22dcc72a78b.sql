CREATE TABLE public.interview_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  resume_id uuid,
  difficulty text NOT NULL DEFAULT 'medium',
  mode text NOT NULL DEFAULT 'text',
  language text NOT NULL DEFAULT 'en',
  status text NOT NULL DEFAULT 'in_progress',
  total_questions integer NOT NULL DEFAULT 10,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  performance_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  overall_score integer NOT NULL DEFAULT 0,
  grade text NOT NULL DEFAULT '',
  strengths jsonb NOT NULL DEFAULT '[]'::jsonb,
  improvements jsonb NOT NULL DEFAULT '[]'::jsonb,
  duration_seconds integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interview_sessions_select_own" ON public.interview_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "interview_sessions_insert_own" ON public.interview_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "interview_sessions_update_own" ON public.interview_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "interview_sessions_delete_own" ON public.interview_sessions
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_interview_sessions_user ON public.interview_sessions(user_id, created_at DESC);

CREATE TRIGGER interview_sessions_touch
  BEFORE UPDATE ON public.interview_sessions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
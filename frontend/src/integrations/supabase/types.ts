export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analyses: {
        Row: {
          ats_issues: Json | null
          ats_score: number | null
          blockers: Json | null
          career_trajectory: Json | null
          company_description: string | null
          company_name: string | null
          competitor_percentile: number | null
          cover_letter_conversational: string | null
          cover_letter_creative: string | null
          cover_letter_professional: string | null
          created_at: string
          culture_fit_score: number | null
          culture_signals: Json | null
          education_match_score: number | null
          error_message: string | null
          experience_match_score: number | null
          grade: string | null
          id: string
          interview_probability: number | null
          job_description: string
          job_title: string
          keyword_match_percent: number | null
          location: string | null
          matched_keywords: Json | null
          missing_keywords: Json | null
          negotiation_power_score: number | null
          quick_wins: Json | null
          resume_id: string
          salary_boosters: Json | null
          salary_currency: string | null
          salary_max: number | null
          salary_median: number | null
          salary_min: number | null
          score_breakdown: Json | null
          skill_gaps: Json | null
          skill_roadmap: Json | null
          skills_match_score: number | null
          status: string
          transferable_skills: Json | null
          updated_at: string
          user_id: string
          uvp_points: Json | null
        }
        Insert: {
          ats_issues?: Json | null
          ats_score?: number | null
          blockers?: Json | null
          career_trajectory?: Json | null
          company_description?: string | null
          company_name?: string | null
          competitor_percentile?: number | null
          cover_letter_conversational?: string | null
          cover_letter_creative?: string | null
          cover_letter_professional?: string | null
          created_at?: string
          culture_fit_score?: number | null
          culture_signals?: Json | null
          education_match_score?: number | null
          error_message?: string | null
          experience_match_score?: number | null
          grade?: string | null
          id?: string
          interview_probability?: number | null
          job_description?: string
          job_title?: string
          keyword_match_percent?: number | null
          location?: string | null
          matched_keywords?: Json | null
          missing_keywords?: Json | null
          negotiation_power_score?: number | null
          quick_wins?: Json | null
          resume_id: string
          salary_boosters?: Json | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_median?: number | null
          salary_min?: number | null
          score_breakdown?: Json | null
          skill_gaps?: Json | null
          skill_roadmap?: Json | null
          skills_match_score?: number | null
          status?: string
          transferable_skills?: Json | null
          updated_at?: string
          user_id: string
          uvp_points?: Json | null
        }
        Update: {
          ats_issues?: Json | null
          ats_score?: number | null
          blockers?: Json | null
          career_trajectory?: Json | null
          company_description?: string | null
          company_name?: string | null
          competitor_percentile?: number | null
          cover_letter_conversational?: string | null
          cover_letter_creative?: string | null
          cover_letter_professional?: string | null
          created_at?: string
          culture_fit_score?: number | null
          culture_signals?: Json | null
          education_match_score?: number | null
          error_message?: string | null
          experience_match_score?: number | null
          grade?: string | null
          id?: string
          interview_probability?: number | null
          job_description?: string
          job_title?: string
          keyword_match_percent?: number | null
          location?: string | null
          matched_keywords?: Json | null
          missing_keywords?: Json | null
          negotiation_power_score?: number | null
          quick_wins?: Json | null
          resume_id?: string
          salary_boosters?: Json | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_median?: number | null
          salary_min?: number | null
          score_breakdown?: Json | null
          skill_gaps?: Json | null
          skill_roadmap?: Json | null
          skills_match_score?: number | null
          status?: string
          transferable_skills?: Json | null
          updated_at?: string
          user_id?: string
          uvp_points?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "analyses_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          answers: Json
          created_at: string
          difficulty: string
          duration_seconds: number
          ended_at: string | null
          grade: string
          id: string
          improvements: Json
          language: string
          mode: string
          overall_score: number
          performance_breakdown: Json
          questions: Json
          resume_id: string | null
          scores: Json
          started_at: string
          status: string
          strengths: Json
          total_questions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          difficulty?: string
          duration_seconds?: number
          ended_at?: string | null
          grade?: string
          id?: string
          improvements?: Json
          language?: string
          mode?: string
          overall_score?: number
          performance_breakdown?: Json
          questions?: Json
          resume_id?: string | null
          scores?: Json
          started_at?: string
          status?: string
          strengths?: Json
          total_questions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          difficulty?: string
          duration_seconds?: number
          ended_at?: string | null
          grade?: string
          id?: string
          improvements?: Json
          language?: string
          mode?: string
          overall_score?: number
          performance_breakdown?: Json
          questions?: Json
          resume_id?: string | null
          scores?: Json
          started_at?: string
          status?: string
          strengths?: Json
          total_questions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          analysis_id: string | null
          applied_date: string | null
          company_name: string
          contact_email: string | null
          contact_person: string | null
          created_at: string
          deadline: string | null
          excitement_level: number | null
          follow_up_date: string | null
          id: string
          interview_date: string | null
          job_title: string
          job_type: string | null
          job_url: string | null
          location: string | null
          notes: string | null
          offer_amount: number | null
          position: number | null
          resume_id: string | null
          salary_offered: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          applied_date?: string | null
          company_name?: string
          contact_email?: string | null
          contact_person?: string | null
          created_at?: string
          deadline?: string | null
          excitement_level?: number | null
          follow_up_date?: string | null
          id?: string
          interview_date?: string | null
          job_title?: string
          job_type?: string | null
          job_url?: string | null
          location?: string | null
          notes?: string | null
          offer_amount?: number | null
          position?: number | null
          resume_id?: string | null
          salary_offered?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          applied_date?: string | null
          company_name?: string
          contact_email?: string | null
          contact_person?: string | null
          created_at?: string
          deadline?: string | null
          excitement_level?: number | null
          follow_up_date?: string | null
          id?: string
          interview_date?: string | null
          job_title?: string
          job_type?: string | null
          job_url?: string | null
          location?: string | null
          notes?: string | null
          offer_amount?: number | null
          position?: number | null
          resume_id?: string | null
          salary_offered?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          career_dna_score: number | null
          created_at: string
          current_company: string | null
          current_title: string | null
          email: string | null
          full_name: string | null
          github_url: string | null
          id: string
          is_onboarded: boolean | null
          linkedin_url: string | null
          location: string | null
          portfolio_url: string | null
          target_location: string | null
          target_role: string | null
          target_salary_max: number | null
          target_salary_min: number | null
          total_analyses: number | null
          updated_at: string
          years_of_experience: number | null
        }
        Insert: {
          career_dna_score?: number | null
          created_at?: string
          current_company?: string | null
          current_title?: string | null
          email?: string | null
          full_name?: string | null
          github_url?: string | null
          id: string
          is_onboarded?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          portfolio_url?: string | null
          target_location?: string | null
          target_role?: string | null
          target_salary_max?: number | null
          target_salary_min?: number | null
          total_analyses?: number | null
          updated_at?: string
          years_of_experience?: number | null
        }
        Update: {
          career_dna_score?: number | null
          created_at?: string
          current_company?: string | null
          current_title?: string | null
          email?: string | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          is_onboarded?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          portfolio_url?: string | null
          target_location?: string | null
          target_role?: string | null
          target_salary_max?: number | null
          target_salary_min?: number | null
          total_analyses?: number | null
          updated_at?: string
          years_of_experience?: number | null
        }
        Relationships: []
      }
      user_ai_settings: {
        Row: {
          id: string
          user_id: string
          provider: string
          api_key: string
          model: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider?: string
          api_key?: string
          model?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          api_key?: string
          model?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      resume_versions: {
        Row: {
          id: string
          resume_id: string
          user_id: string
          version_number: number
          is_original: boolean
          content: Json
          markdown: string | null
          plain_text: string | null
          optimization_questions: Json | null
          user_answers: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          resume_id: string
          user_id: string
          version_number?: number
          is_original?: boolean
          content?: Json
          markdown?: string | null
          plain_text?: string | null
          optimization_questions?: Json | null
          user_answers?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          resume_id?: string
          user_id?: string
          version_number?: number
          is_original?: boolean
          content?: Json
          markdown?: string | null
          plain_text?: string | null
          optimization_questions?: Json | null
          user_answers?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          career_dna: Json | null
          created_at: string
          education_level: string | null
          extracted_skills: Json | null
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          is_ats_friendly: boolean | null
          is_primary: boolean | null
          parse_error: string | null
          parse_status: string
          parsed_data: Json | null
          raw_text: string | null
          title: string
          total_experience_years: number | null
          updated_at: string
          user_id: string
          word_count: number | null
          ai_analysis: Json | null
        }
        Insert: {
          career_dna?: Json | null
          created_at?: string
          education_level?: string | null
          extracted_skills?: Json | null
          file_path: string
          file_size?: number | null
          file_type?: string
          id?: string
          is_ats_friendly?: boolean | null
          is_primary?: boolean | null
          parse_error?: string | null
          parse_status?: string
          parsed_data?: Json | null
          raw_text?: string | null
          title?: string
          total_experience_years?: number | null
          updated_at?: string
          user_id: string
          word_count?: number | null
          ai_analysis?: Json | null
        }
        Update: {
          career_dna?: Json | null
          created_at?: string
          education_level?: string | null
          extracted_skills?: Json | null
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          is_ats_friendly?: boolean | null
          is_primary?: boolean | null
          parse_error?: string | null
          parse_status?: string
          parsed_data?: Json | null
          raw_text?: string | null
          title?: string
          total_experience_years?: number | null
          updated_at?: string
          user_id?: string
          word_count?: number | null
          ai_analysis?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

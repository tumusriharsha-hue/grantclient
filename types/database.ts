export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      applications: {
        Row: {
          amount: string | null;
          amount_requested: number | null;
          application_url: string | null;
          created_at: string;
          decision_at: string | null;
          draft_content: Json;
          grant_category: string | null;
          grant_funder: string | null;
          grant_id: string | null;
          grant_snapshot: Json;
          grant_title: string | null;
          id: string;
          last_updated_at: string;
          organization_id: string | null;
          progress: number;
          status: string;
          status_note: string | null;
          setup_data: Json;
          submitted_at: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount?: string | null;
          amount_requested?: number | null;
          application_url?: string | null;
          created_at?: string;
          decision_at?: string | null;
          draft_content?: Json;
          grant_category?: string | null;
          grant_funder?: string | null;
          grant_id?: string | null;
          grant_snapshot?: Json;
          grant_title?: string | null;
          id?: string;
          last_updated_at?: string;
          organization_id?: string | null;
          progress?: number;
          status?: string;
          status_note?: string | null;
          setup_data?: Json;
          submitted_at?: string | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount?: string | null;
          amount_requested?: number | null;
          application_url?: string | null;
          created_at?: string;
          decision_at?: string | null;
          draft_content?: Json;
          grant_category?: string | null;
          grant_funder?: string | null;
          grant_id?: string | null;
          grant_snapshot?: Json;
          grant_title?: string | null;
          id?: string;
          last_updated_at?: string;
          organization_id?: string | null;
          progress?: number;
          status?: string;
          status_note?: string | null;
          setup_data?: Json;
          submitted_at?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      grants: {
        Row: {
        amount: number | null;
          application_open_date: string | null;
          application_questions: Json | null;
          application_url: string;
          award_max: number | null;
          award_min: number | null;
          category: string;
          created_at: string;
          deadline: string | null;
          deadline_timezone: string | null;
          deadline_type: string;
          description: string;
          eligibility_summary: string | null;
          eligible_locations: string[] | null;
          eligible_organization_types: string[] | null;
          focus_areas: string[] | null;
          funder: string;
          geographic_scope: string | null;
          id: string;
          invitation_only: boolean;
          maximum_annual_budget: number | null;
          maximum_request_amount: number | null;
          minimum_annual_budget: number | null;
          minimum_request_amount: number | null;
          populations_served: string[] | null;
          required_documents: string[] | null;
          required_nonprofit_status: string | null;
          requirements: string[] | null;
          region: string;
          official_url: string | null;
          next_review_at: string | null;
          confidence_level: string;
          unsolicited_applications_accepted: boolean | null;
          restrictions: string[] | null;
          typical_award: number | null;
          rolling_deadline: boolean;
          source_url: string | null;
          status: string;
          title: string;
          updated_at: string;
          verified_at: string | null;
          verification_notes: string | null;
        };
        Insert: {
          amount?: number | null;
          application_open_date?: string | null;
          application_questions?: Json | null;
          application_url: string;
          award_max?: number | null;
          award_min?: number | null;
          category: string;
          created_at?: string;
          deadline?: string | null;
          deadline_timezone?: string | null;
          deadline_type?: string;
          description: string;
          eligibility_summary?: string | null;
          eligible_locations?: string[] | null;
          eligible_organization_types?: string[] | null;
          focus_areas?: string[] | null;
          funder: string;
          geographic_scope?: string | null;
          id: string;
          invitation_only?: boolean;
          maximum_annual_budget?: number | null;
          maximum_request_amount?: number | null;
          minimum_annual_budget?: number | null;
          minimum_request_amount?: number | null;
          populations_served?: string[] | null;
          required_documents?: string[] | null;
          required_nonprofit_status?: string | null;
          requirements?: string[] | null;
          region: string;
          official_url?: string | null;
          next_review_at?: string | null;
          confidence_level?: string;
          unsolicited_applications_accepted?: boolean | null;
          restrictions?: string[] | null;
          typical_award?: number | null;
          rolling_deadline?: boolean;
          source_url?: string | null;
          status?: string;
          title: string;
          updated_at?: string;
          verified_at?: string | null;
          verification_notes?: string | null;
        };
        Update: {
          amount?: number | null;
          application_open_date?: string | null;
          application_questions?: Json | null;
          application_url?: string;
          award_max?: number | null;
          award_min?: number | null;
          category?: string;
          created_at?: string;
          deadline?: string | null;
          deadline_timezone?: string | null;
          deadline_type?: string;
          description?: string;
          eligibility_summary?: string | null;
          eligible_locations?: string[] | null;
          eligible_organization_types?: string[] | null;
          focus_areas?: string[] | null;
          funder?: string;
          geographic_scope?: string | null;
          id?: string;
          invitation_only?: boolean;
          maximum_annual_budget?: number | null;
          maximum_request_amount?: number | null;
          minimum_annual_budget?: number | null;
          minimum_request_amount?: number | null;
          populations_served?: string[] | null;
          required_documents?: string[] | null;
          required_nonprofit_status?: string | null;
          requirements?: string[] | null;
          region?: string;
          official_url?: string | null;
          next_review_at?: string | null;
          confidence_level?: string;
          unsolicited_applications_accepted?: boolean | null;
          restrictions?: string[] | null;
          typical_award?: number | null;
          rolling_deadline?: boolean;
          source_url?: string | null;
          status?: string;
          title?: string;
          updated_at?: string;
          verified_at?: string | null;
          verification_notes?: string | null;
        };
        Relationships: [];
      };
      generated_proposals: {
        Row: {
          created_at: string | null;
          draft_type: string;
          grant_id: string;
          id: string;
          proposal: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          draft_type: string;
          grant_id: string;
          id?: string;
          proposal: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          draft_type?: string;
          grant_id?: string;
          id?: string;
          proposal?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          accept_government_grants: boolean | null;
          annual_budget_range: string | null;
          budget: number | null;
          city: string | null;
          country: string | null;
          created_at: string | null;
          employee_count: number | null;
          funding_needs: string | null;
          geographic_service_area: string[] | null;
          has_501c3: boolean | null;
          id: string;
          impact_goals: string | null;
          is_501c3: boolean | null;
          keywords: string[] | null;
          location: string | null;
          mission: string | null;
          mission_categories: string[] | null;
          nonprofit_status: string | null;
          onboarding_completed: boolean | null;
          onboarding_step: number | null;
          organization_age_range: string | null;
          organization_name: string;
          organization_type: string;
          populations_served: string[] | null;
          previous_grant_experience: string | null;
          preferred_grant_amount: string | null;
          preferred_grant_types: string[] | null;
          profile_picture_url: string | null;
          programs: string[] | null;
          requested_funding_max: number | null;
          requested_funding_min: number | null;
          state: string | null;
          updated_at: string;
          user_id: string;
          volunteer_count: number | null;
          website: string | null;
          year_founded: number | null;
        };
        Insert: {
          accept_government_grants?: boolean | null;
          annual_budget_range?: string | null;
          budget?: number | null;
          city?: string | null;
          country?: string | null;
          created_at?: string | null;
          employee_count?: number | null;
          funding_needs?: string | null;
          geographic_service_area?: string[] | null;
          has_501c3?: boolean | null;
          id?: string;
          impact_goals?: string | null;
          is_501c3?: boolean | null;
          keywords?: string[] | null;
          location?: string | null;
          mission?: string | null;
          mission_categories?: string[] | null;
          nonprofit_status?: string | null;
          onboarding_completed?: boolean | null;
          onboarding_step?: number | null;
          organization_age_range?: string | null;
          organization_name: string;
          organization_type: string;
          populations_served?: string[] | null;
          previous_grant_experience?: string | null;
          preferred_grant_amount?: string | null;
          preferred_grant_types?: string[] | null;
          profile_picture_url?: string | null;
          programs?: string[] | null;
          requested_funding_max?: number | null;
          requested_funding_min?: number | null;
          state?: string | null;
          updated_at?: string;
          user_id: string;
          volunteer_count?: number | null;
          website?: string | null;
          year_founded?: number | null;
        };
        Update: {
          accept_government_grants?: boolean | null;
          annual_budget_range?: string | null;
          budget?: number | null;
          city?: string | null;
          country?: string | null;
          created_at?: string | null;
          employee_count?: number | null;
          funding_needs?: string | null;
          geographic_service_area?: string[] | null;
          has_501c3?: boolean | null;
          id?: string;
          impact_goals?: string | null;
          is_501c3?: boolean | null;
          keywords?: string[] | null;
          location?: string | null;
          mission?: string | null;
          mission_categories?: string[] | null;
          nonprofit_status?: string | null;
          onboarding_completed?: boolean | null;
          onboarding_step?: number | null;
          organization_age_range?: string | null;
          organization_name?: string;
          organization_type?: string;
          populations_served?: string[] | null;
          previous_grant_experience?: string | null;
          preferred_grant_amount?: string | null;
          preferred_grant_types?: string[] | null;
          profile_picture_url?: string | null;
          programs?: string[] | null;
          requested_funding_max?: number | null;
          requested_funding_min?: number | null;
          state?: string | null;
          updated_at?: string;
          user_id?: string;
          volunteer_count?: number | null;
          website?: string | null;
          year_founded?: number | null;
        };
        Relationships: [];
      };
      ai_generation_records: {
        Row: {
          application_id: string | null;
          cache_key: string;
          completed_at: string | null;
          created_at: string;
          error_code: string | null;
          generation_kind: string;
          grant_id: string | null;
          id: string;
          model: string;
          organization_id: string | null;
          prompt_version: string;
          request_hash: string;
          response: Json | null;
          status: string;
          user_id: string;
        };
        Insert: {
          application_id?: string | null;
          cache_key: string;
          completed_at?: string | null;
          created_at?: string;
          error_code?: string | null;
          generation_kind: string;
          grant_id?: string | null;
          id?: string;
          model: string;
          organization_id?: string | null;
          prompt_version: string;
          request_hash: string;
          response?: Json | null;
          status?: string;
          user_id: string;
        };
        Update: {
          application_id?: string | null;
          cache_key?: string;
          completed_at?: string | null;
          created_at?: string;
          error_code?: string | null;
          generation_kind?: string;
          grant_id?: string | null;
          id?: string;
          model?: string;
          organization_id?: string | null;
          prompt_version?: string;
          request_hash?: string;
          response?: Json | null;
          status?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      application_sections: {
        Row: {
          application_id: string;
          content: string;
          created_at: string;
          generated_at: string | null;
          id: string;
          missing_information: Json;
          model: string | null;
          previous_content: string | null;
          prompt_version: string | null;
          section_key: string;
          status: string;
          template_version: string;
          title: string;
          updated_at: string;
          used_source_fields: Json;
          user_id: string;
        };
        Insert: {
          application_id: string;
          content?: string;
          created_at?: string;
          generated_at?: string | null;
          id?: string;
          missing_information?: Json;
          model?: string | null;
          previous_content?: string | null;
          prompt_version?: string | null;
          section_key: string;
          status?: string;
          template_version: string;
          title: string;
          updated_at?: string;
          used_source_fields?: Json;
          user_id: string;
        };
        Update: {
          application_id?: string;
          content?: string;
          created_at?: string;
          generated_at?: string | null;
          id?: string;
          missing_information?: Json;
          model?: string | null;
          previous_content?: string | null;
          prompt_version?: string | null;
          section_key?: string;
          status?: string;
          template_version?: string;
          title?: string;
          updated_at?: string;
          used_source_fields?: Json;
          user_id?: string;
        };
        Relationships: [];
      };
      grant_match_snapshots: {
        Row: {
          cache_key: string;
          created_at: string;
          eligibility_status: string;
          explanation: Json | null;
          generated_at: string | null;
          grant_id: string;
          grant_updated_at: string | null;
          id: string;
          model: string | null;
          organization_id: string;
          organization_updated_at: string | null;
          prompt_version: string | null;
          score: number;
          score_breakdown: Json;
          score_version: string;
          updated_at: string;
          user_id: string;
          verification_items: string[];
        };
        Insert: {
          cache_key: string;
          created_at?: string;
          eligibility_status: string;
          explanation?: Json | null;
          generated_at?: string | null;
          grant_id: string;
          grant_updated_at?: string | null;
          id?: string;
          model?: string | null;
          organization_id: string;
          organization_updated_at?: string | null;
          prompt_version?: string | null;
          score: number;
          score_breakdown: Json;
          score_version: string;
          updated_at?: string;
          user_id: string;
          verification_items?: string[];
        };
        Update: {
          cache_key?: string;
          created_at?: string;
          eligibility_status?: string;
          explanation?: Json | null;
          generated_at?: string | null;
          grant_id?: string;
          grant_updated_at?: string | null;
          id?: string;
          model?: string | null;
          organization_id?: string;
          organization_updated_at?: string | null;
          prompt_version?: string | null;
          score?: number;
          score_breakdown?: Json;
          score_version?: string;
          updated_at?: string;
          user_id?: string;
          verification_items?: string[];
        };
        Relationships: [];
      };
      organization_documents: {
        Row: {
          created_at: string;
          file_name: string;
          id: string;
          mime_type: string;
          organization_id: string;
          size_bytes: number;
          storage_path: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          file_name: string;
          id?: string;
          mime_type: string;
          organization_id: string;
          size_bytes: number;
          storage_path: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          file_name?: string;
          id?: string;
          mime_type?: string;
          organization_id?: string;
          size_bytes?: number;
          storage_path?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      saved_grants: {
        Row: {
          created_at: string | null;
          grant_id: string;
          id: string;
          status: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          grant_id: string;
          id?: string;
          status?: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          grant_id?: string;
          id?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

export type Organization = Tables<"organizations">;
export type OrganizationInsert = TablesInsert<"organizations">;
export type OrganizationUpdate = TablesUpdate<"organizations">;

export type Application = Tables<"applications">;
export type ApplicationInsert = TablesInsert<"applications">;
export type ApplicationUpdate = TablesUpdate<"applications">;

export type GrantRow = Tables<"grants">;
export type GrantInsert = TablesInsert<"grants">;
export type GrantUpdate = TablesUpdate<"grants">;

export type SavedGrant = Tables<"saved_grants">;
export type SavedGrantInsert = TablesInsert<"saved_grants">;
export type SavedGrantUpdate = TablesUpdate<"saved_grants">;

export type GeneratedProposal = Tables<"generated_proposals">;
export type GeneratedProposalInsert = TablesInsert<"generated_proposals">;
export type GeneratedProposalUpdate = TablesUpdate<"generated_proposals">;

export type OrganizationType =
  | "501(c)(3) Nonprofit"
  | "School"
  | "University"
  | "Religious Organization"
  | "Community Group"
  | "Social Enterprise"
  | "Other"
  | "501(c)(3)"
  | "School Organization"
  | "Student Club"
  | "Faith-Based Organization"
  | "Fiscal Sponsor";

export type SavedGrantStatus =
  | "Interested"
  | "Researching"
  | "Drafting"
  | "Submitted"
  | "Awarded"
  | "Rejected";

export type ApplicationStatus =
  | "drafting"
  | "submitted"
  | "approved"
  | "rejected";

export type DraftType =
  | "executive_summary"
  | "letter_of_intent"
  | "impact_statement";

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
          application_url: string | null;
          created_at: string;
          decision_at: string | null;
          draft_content: Json;
          grant_category: string | null;
          grant_funder: string | null;
          grant_id: string | null;
          grant_title: string | null;
          id: string;
          last_updated_at: string;
          progress: number;
          status: string;
          status_note: string | null;
          submitted_at: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount?: string | null;
          application_url?: string | null;
          created_at?: string;
          decision_at?: string | null;
          draft_content?: Json;
          grant_category?: string | null;
          grant_funder?: string | null;
          grant_id?: string | null;
          grant_title?: string | null;
          id?: string;
          last_updated_at?: string;
          progress?: number;
          status?: string;
          status_note?: string | null;
          submitted_at?: string | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount?: string | null;
          application_url?: string | null;
          created_at?: string;
          decision_at?: string | null;
          draft_content?: Json;
          grant_category?: string | null;
          grant_funder?: string | null;
          grant_id?: string | null;
          grant_title?: string | null;
          id?: string;
          last_updated_at?: string;
          progress?: number;
          status?: string;
          status_note?: string | null;
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
          application_url: string;
          category: string;
          created_at: string;
          deadline: string | null;
          description: string;
          funder: string;
          id: string;
          region: string;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          amount?: number | null;
          application_url: string;
          category: string;
          created_at?: string;
          deadline?: string | null;
          description: string;
          funder: string;
          id: string;
          region: string;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          amount?: number | null;
          application_url?: string;
          category?: string;
          created_at?: string;
          deadline?: string | null;
          description?: string;
          funder?: string;
          id?: string;
          region?: string;
          status?: string;
          title?: string;
          updated_at?: string;
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
          created_at: string | null;
          has_501c3: boolean | null;
          id: string;
          is_501c3: boolean | null;
          keywords: string[] | null;
          location: string | null;
          mission: string | null;
          mission_categories: string[] | null;
          onboarding_completed: boolean | null;
          onboarding_step: number | null;
          organization_age_range: string | null;
          organization_name: string;
          organization_type: string;
          populations_served: string[] | null;
          preferred_grant_amount: string | null;
          preferred_grant_types: string[] | null;
          profile_picture_url: string | null;
          state: string | null;
          user_id: string;
        };
        Insert: {
          accept_government_grants?: boolean | null;
          annual_budget_range?: string | null;
          budget?: number | null;
          city?: string | null;
          created_at?: string | null;
          has_501c3?: boolean | null;
          id?: string;
          is_501c3?: boolean | null;
          keywords?: string[] | null;
          location?: string | null;
          mission?: string | null;
          mission_categories?: string[] | null;
          onboarding_completed?: boolean | null;
          onboarding_step?: number | null;
          organization_age_range?: string | null;
          organization_name: string;
          organization_type: string;
          populations_served?: string[] | null;
          preferred_grant_amount?: string | null;
          preferred_grant_types?: string[] | null;
          profile_picture_url?: string | null;
          state?: string | null;
          user_id: string;
        };
        Update: {
          accept_government_grants?: boolean | null;
          annual_budget_range?: string | null;
          budget?: number | null;
          city?: string | null;
          created_at?: string | null;
          has_501c3?: boolean | null;
          id?: string;
          is_501c3?: boolean | null;
          keywords?: string[] | null;
          location?: string | null;
          mission?: string | null;
          mission_categories?: string[] | null;
          onboarding_completed?: boolean | null;
          onboarding_step?: number | null;
          organization_age_range?: string | null;
          organization_name?: string;
          organization_type?: string;
          populations_served?: string[] | null;
          preferred_grant_amount?: string | null;
          preferred_grant_types?: string[] | null;
          profile_picture_url?: string | null;
          state?: string | null;
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

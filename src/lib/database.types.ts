export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: { id: string; name: string; type: string; status: string; created_at: string; updated_at: string };
        Insert: { id?: string; name: string; type?: string; status?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
        Relationships: [];
      };
      profiles: {
        Row: { id: string; email: string; name: string | null; language: string; timezone: string; status: string; system_role: string; created_at: string; updated_at: string };
        Insert: { id: string; email: string; name?: string | null; language?: string; timezone?: string; status?: string; system_role?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      memberships: {
        Row: { id: string; organization_id: string; user_id: string; role: string; status: string; created_at: string; updated_at: string };
        Insert: { id?: string; organization_id: string; user_id: string; role: string; status?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['memberships']['Insert']>;
        Relationships: [];
      };
      invitations: {
        Row: { id: string; organization_id: string; email: string; role: string; status: string; invited_by: string; token: string; expires_at: string; created_at: string };
        Insert: { id?: string; organization_id: string; email: string; role?: string; status?: string; invited_by: string; token?: string; expires_at?: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['invitations']['Insert']>;
        Relationships: [];
      };
      audit_logs: {
        Row: { id: string; organization_id: string | null; actor_id: string | null; action: string; entity_type: string; entity_id: string | null; metadata: Json; created_at: string };
        Insert: { id?: string; organization_id?: string | null; actor_id?: string | null; action: string; entity_type: string; entity_id?: string | null; metadata?: Json; created_at?: string };
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      create_invitation: { Args: { target_org_id: string; invite_email: string; invite_role?: string }; Returns: Database['public']['Tables']['invitations']['Row'] };
      update_membership_role: { Args: { target_membership_id: string; new_role: string }; Returns: Database['public']['Tables']['memberships']['Row'] };
      set_membership_status: { Args: { target_membership_id: string; new_status: string }; Returns: Database['public']['Tables']['memberships']['Row'] };
    };
    Enums: {};
    CompositeTypes: {};
  };
}

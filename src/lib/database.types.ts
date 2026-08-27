export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: { Row: { id: string; name: string; type: string; status: string; created_at: string; updated_at: string }; Insert: { id?: string; name: string; type?: string; status?: string; created_at?: string; updated_at?: string }; Update: Partial<Database['public']['Tables']['organizations']['Insert']>; Relationships: [] };
      profiles: { Row: { id: string; email: string; name: string | null; language: string; timezone: string; status: string; system_role: string; created_at: string; updated_at: string }; Insert: { id: string; email: string; name?: string | null; language?: string; timezone?: string; status?: string; system_role?: string; created_at?: string; updated_at?: string }; Update: Partial<Database['public']['Tables']['profiles']['Insert']>; Relationships: [] };
      memberships: { Row: { id: string; organization_id: string; user_id: string; role: string; status: string; created_at: string; updated_at: string }; Insert: { id?: string; organization_id: string; user_id: string; role: string; status?: string; created_at?: string; updated_at?: string }; Update: Partial<Database['public']['Tables']['memberships']['Insert']>; Relationships: [] };
      invitations: { Row: { id: string; organization_id: string; email: string; role: string; status: string; invited_by: string; token: string; expires_at: string; created_at: string }; Insert: { id?: string; organization_id: string; email: string; role?: string; status?: string; invited_by: string; token?: string; expires_at?: string; created_at?: string }; Update: Partial<Database['public']['Tables']['invitations']['Insert']>; Relationships: [] };
      user_roles: { Row: { id: string; user_id: string; system_role: string; status: string; created_at: string; updated_at: string }; Insert: { id?: string; user_id: string; system_role: string; status?: string; created_at?: string; updated_at?: string }; Update: Partial<Database['public']['Tables']['user_roles']['Insert']>; Relationships: [] };
      consents: { Row: { id: string; user_id: string; type: string; version: string; granted_at: string; revoked_at: string | null; created_at: string }; Insert: { id?: string; user_id: string; type: string; version: string; granted_at?: string; revoked_at?: string | null; created_at?: string }; Update: Partial<Database['public']['Tables']['consents']['Insert']>; Relationships: [] };
      audit_logs: { Row: { id: string; organization_id: string | null; actor_id: string | null; action: string; entity_type: string; entity_id: string | null; metadata: Json; before_data: Json | null; after_data: Json | null; correlation_id: string | null; ip: string | null; user_agent: string | null; created_at: string }; Insert: { id?: string; organization_id?: string | null; actor_id?: string | null; action: string; entity_type: string; entity_id?: string | null; metadata?: Json; before_data?: Json | null; after_data?: Json | null; correlation_id?: string | null; ip?: string | null; user_agent?: string | null; created_at?: string }; Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>; Relationships: [] };
    };
    Views: {};
    Functions: {
      create_invitation: { Args: { target_org_id: string; invite_email: string; invite_role?: string }; Returns: Database['public']['Tables']['invitations']['Row'] };
      update_membership_role: { Args: { target_membership_id: string; new_role: string }; Returns: Database['public']['Tables']['memberships']['Row'] };
      set_membership_status: { Args: { target_membership_id: string; new_status: string }; Returns: Database['public']['Tables']['memberships']['Row'] };
      record_audit_event: { Args: { event_action: string; event_entity_type: string; event_entity_id?: string; event_organization_id?: string; event_metadata?: Json; event_before?: Json; event_after?: Json; event_correlation_id?: string }; Returns: Database['public']['Tables']['audit_logs']['Row'] };
    };
    Enums: {};
    CompositeTypes: {};
  };
}

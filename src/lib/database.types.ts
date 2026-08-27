export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: { id: string; name: string; type: string; status: string; created_at: string; updated_at: string };
        Insert: { id?: string; name: string; type?: string; status?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      profiles: {
        Row: { id: string; email: string; name: string | null; language: string; timezone: string; status: string; system_role: string; created_at: string; updated_at: string };
        Insert: { id: string; email: string; name?: string | null; language?: string; timezone?: string; status?: string; system_role?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      memberships: {
        Row: { id: string; organization_id: string; user_id: string; role: string; status: string; created_at: string; updated_at: string };
        Insert: { id?: string; organization_id: string; user_id: string; role: string; status?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['memberships']['Insert']>;
      };
      audit_logs: {
        Row: { id: string; organization_id: string | null; actor_id: string | null; action: string; entity_type: string; entity_id: string | null; metadata: Json; created_at: string };
        Insert: { id?: string; organization_id?: string | null; actor_id?: string | null; action: string; entity_type: string; entity_id?: string | null; metadata?: Json; created_at?: string };
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
      };
    };
  };
}

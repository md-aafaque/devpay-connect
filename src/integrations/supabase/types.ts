export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          amount: number | null
          client_id: string | null
          created_at: string
          developer_id: string | null
          end_time: string | null
          id: string
          payment_status: string | null
          start_time: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          client_id?: string | null
          created_at?: string
          developer_id?: string | null
          end_time?: string | null
          id?: string
          payment_status?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          client_id?: string | null
          created_at?: string
          developer_id?: string | null
          end_time?: string | null
          id?: string
          payment_status?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      call_requests: {
        Row: {
          amount: number | null
          amount_status: boolean | null
          client_id: string
          created_at: string | null
          developer_id: string
          duration: number | null
          end_time: string | null
          id: string
          start_time: string | null
          status: Database["public"]["Enums"]["call_request_status"] | null
          task_description: string
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          amount_status?: boolean | null
          client_id: string
          created_at?: string | null
          developer_id: string
          duration?: number | null
          end_time?: string | null
          id?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["call_request_status"] | null
          task_description: string
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          amount_status?: boolean | null
          client_id?: string
          created_at?: string | null
          developer_id?: string
          duration?: number | null
          end_time?: string | null
          id?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["call_request_status"] | null
          task_description?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_requests_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      developers: {
        Row: {
          bio: string | null
          created_at: string
          hourly_rate: number
          id: string
          rating: number | null
          skills: string[] | null
          status: Database["public"]["Enums"]["developer_status"] | null
          title: string | null
          total_calls: number | null
          updated_at: string
          wallet_address: string | null
          years_of_experience: number | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          hourly_rate: number
          id: string
          rating?: number | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["developer_status"] | null
          title?: string | null
          total_calls?: number | null
          updated_at?: string
          wallet_address?: string | null
          years_of_experience?: number | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          hourly_rate?: number
          id?: string
          rating?: number | null
          skills?: string[] | null
          status?: Database["public"]["Enums"]["developer_status"] | null
          title?: string | null
          total_calls?: number | null
          updated_at?: string
          wallet_address?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "developers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
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
      call_request_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "completed"
        | "cancelled"
      developer_status: "available" | "busy" | "offline"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

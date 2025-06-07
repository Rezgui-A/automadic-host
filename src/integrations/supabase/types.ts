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
      habits: {
        Row: {
          completed: boolean | null
          created_at: string
          id: string
          skipped: boolean | null
          stack_id: string
          streak: number | null
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          id: string
          skipped?: boolean | null
          stack_id: string
          streak?: number | null
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          id?: string
          skipped?: boolean | null
          stack_id?: string
          streak?: number | null
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      routines: {
        Row: {
          created_at: string
          day_of_month: number | null
          days: string[]
          description: string | null
          id: string
          interval: number | null
          schedule_type: string | null
          stacks: Json | null
          start_date: string | null
          streak: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_month?: number | null
          days: string[]
          description?: string | null
          id: string
          interval?: number | null
          schedule_type?: string | null
          stacks?: Json | null
          start_date?: string | null
          streak?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_month?: number | null
          days?: string[]
          description?: string | null
          id?: string
          interval?: number | null
          schedule_type?: string | null
          stacks?: Json | null
          start_date?: string | null
          streak?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stacks: {
        Row: {
          actions: Json | null
          created_at: string
          day_of_month: number | null
          id: string
          interval: number | null
          is_expanded: boolean | null
          is_schedulable: boolean | null
          routine_id: string | null
          schedule_days: string[] | null
          schedule_type: string | null
          start_date: string | null
          streak: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json | null
          created_at?: string
          day_of_month?: number | null
          id: string
          interval?: number | null
          is_expanded?: boolean | null
          is_schedulable?: boolean | null
          routine_id?: string | null
          schedule_days?: string[] | null
          schedule_type?: string | null
          start_date?: string | null
          streak?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json | null
          created_at?: string
          day_of_month?: number | null
          id?: string
          interval?: number | null
          is_expanded?: boolean | null
          is_schedulable?: boolean | null
          routine_id?: string | null
          schedule_days?: string[] | null
          schedule_type?: string | null
          start_date?: string | null
          streak?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string;
          login_count: number | null;
        };
        Insert: {
          id: string;
          login_count?: number | null;
        };
        Update: {
          id?: string;
          login_count?: number | null;
        };
        Relationships: [];
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

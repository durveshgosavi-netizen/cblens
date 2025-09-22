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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      daily_menus: {
        Row: {
          canteen_location: string
          created_at: string
          date: string
          id: string
          kanpla_item_id: string
        }
        Insert: {
          canteen_location: string
          created_at?: string
          date: string
          id?: string
          kanpla_item_id: string
        }
        Update: {
          canteen_location?: string
          created_at?: string
          date?: string
          id?: string
          kanpla_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_menus_kanpla_item_id_fkey"
            columns: ["kanpla_item_id"]
            isOneToOne: false
            referencedRelation: "kanpla_items"
            referencedColumns: ["id"]
          },
        ]
      }
      dish_notes: {
        Row: {
          created_at: string
          created_by: string
          id: string
          kanpla_item_id: string
          note: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          kanpla_item_id: string
          note: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          kanpla_item_id?: string
          note?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dish_notes_kanpla_item_id_fkey"
            columns: ["kanpla_item_id"]
            isOneToOne: false
            referencedRelation: "kanpla_items"
            referencedColumns: ["id"]
          },
        ]
      }
      kanpla_items: {
        Row: {
          allergens: string[] | null
          calories_per_100g: number | null
          carbs_per_100g: number | null
          category: string
          created_at: string
          fat_per_100g: number | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          is_active: boolean | null
          kanpla_item_id: string
          name: string
          protein_per_100g: number | null
          updated_at: string
        }
        Insert: {
          allergens?: string[] | null
          calories_per_100g?: number | null
          carbs_per_100g?: number | null
          category: string
          created_at?: string
          fat_per_100g?: number | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_active?: boolean | null
          kanpla_item_id: string
          name: string
          protein_per_100g?: number | null
          updated_at?: string
        }
        Update: {
          allergens?: string[] | null
          calories_per_100g?: number | null
          carbs_per_100g?: number | null
          category?: string
          created_at?: string
          fat_per_100g?: number | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_active?: boolean | null
          kanpla_item_id?: string
          name?: string
          protein_per_100g?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          canteen_location: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          canteen_location?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          canteen_location?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scans: {
        Row: {
          alternatives: Json | null
          canteen_location: string
          confidence: Database["public"]["Enums"]["scan_confidence"]
          created_at: string
          estimated_grams: number
          id: string
          kanpla_item_id: string
          manual_override: boolean | null
          notes: string | null
          photo_url: string | null
          portion_preset: Database["public"]["Enums"]["portion_preset"]
          scaled_calories: number
          scaled_carbs: number
          scaled_fat: number
          scaled_protein: number
          scan_timestamp: string
          user_id: string
        }
        Insert: {
          alternatives?: Json | null
          canteen_location: string
          confidence: Database["public"]["Enums"]["scan_confidence"]
          created_at?: string
          estimated_grams: number
          id?: string
          kanpla_item_id: string
          manual_override?: boolean | null
          notes?: string | null
          photo_url?: string | null
          portion_preset?: Database["public"]["Enums"]["portion_preset"]
          scaled_calories: number
          scaled_carbs: number
          scaled_fat: number
          scaled_protein: number
          scan_timestamp?: string
          user_id: string
        }
        Update: {
          alternatives?: Json | null
          canteen_location?: string
          confidence?: Database["public"]["Enums"]["scan_confidence"]
          created_at?: string
          estimated_grams?: number
          id?: string
          kanpla_item_id?: string
          manual_override?: boolean | null
          notes?: string | null
          photo_url?: string | null
          portion_preset?: Database["public"]["Enums"]["portion_preset"]
          scaled_calories?: number
          scaled_carbs?: number
          scaled_fat?: number
          scaled_protein?: number
          scan_timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scans_kanpla_item_id_fkey"
            columns: ["kanpla_item_id"]
            isOneToOne: false
            referencedRelation: "kanpla_items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      portion_preset: "half" | "normal" | "large"
      scan_confidence: "high" | "medium" | "low"
      user_role: "admin" | "manager" | "viewer"
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
    Enums: {
      portion_preset: ["half", "normal", "large"],
      scan_confidence: ["high", "medium", "low"],
      user_role: ["admin", "manager", "viewer"],
    },
  },
} as const

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
      chefs_choice: {
        Row: {
          canteen_location: string
          chef_notes: string | null
          created_at: string
          created_by: string
          description: string | null
          featured_date: string
          id: string
          kanpla_item_id: string
          updated_at: string
        }
        Insert: {
          canteen_location: string
          chef_notes?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          featured_date?: string
          id?: string
          kanpla_item_id: string
          updated_at?: string
        }
        Update: {
          canteen_location?: string
          chef_notes?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          featured_date?: string
          id?: string
          kanpla_item_id?: string
          updated_at?: string
        }
        Relationships: []
      }
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
            referencedRelation: "daily_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_menus_kanpla_item_id_fkey"
            columns: ["kanpla_item_id"]
            isOneToOne: false
            referencedRelation: "kanpla_items"
            referencedColumns: ["id"]
          },
        ]
      }
      dietary_preferences: {
        Row: {
          created_at: string
          id: string
          preference_type: string
          preference_value: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preference_type: string
          preference_value: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preference_type?: string
          preference_value?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
            referencedRelation: "daily_recommendations"
            referencedColumns: ["id"]
          },
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
      meal_ratings: {
        Row: {
          created_at: string
          feedback: string | null
          id: string
          kanpla_item_id: string
          portion_rating: number | null
          rating: number
          scan_id: string | null
          taste_rating: number | null
          user_id: string
          value_rating: number | null
          would_recommend: boolean | null
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          id?: string
          kanpla_item_id: string
          portion_rating?: number | null
          rating: number
          scan_id?: string | null
          taste_rating?: number | null
          user_id: string
          value_rating?: number | null
          would_recommend?: boolean | null
        }
        Update: {
          created_at?: string
          feedback?: string | null
          id?: string
          kanpla_item_id?: string
          portion_rating?: number | null
          rating?: number
          scan_id?: string | null
          taste_rating?: number | null
          user_id?: string
          value_rating?: number | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_ratings_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
      }
      weekly_menus: {
        Row: {
          created_at: string
          day_date: string
          day_name: string
          day_of_week: number
          green_dish: string | null
          hot_dish: string | null
          id: string
          salad_1: string | null
          salad_2: string | null
          updated_at: string
          upload_filename: string | null
          uploaded_by: string | null
          week_start_date: string
        }
        Insert: {
          created_at?: string
          day_date: string
          day_name: string
          day_of_week: number
          green_dish?: string | null
          hot_dish?: string | null
          id?: string
          salad_1?: string | null
          salad_2?: string | null
          updated_at?: string
          upload_filename?: string | null
          uploaded_by?: string | null
          week_start_date: string
        }
        Update: {
          created_at?: string
          day_date?: string
          day_name?: string
          day_of_week?: number
          green_dish?: string | null
          hot_dish?: string | null
          id?: string
          salad_1?: string | null
          salad_2?: string | null
          updated_at?: string
          upload_filename?: string | null
          uploaded_by?: string | null
          week_start_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      daily_recommendations: {
        Row: {
          allergens: string[] | null
          avg_rating: number | null
          calories_per_100g: number | null
          carbs_per_100g: number | null
          category: string | null
          fat_per_100g: number | null
          id: string | null
          is_chefs_choice: boolean | null
          name: string | null
          protein_per_100g: number | null
          rating_count: number | null
        }
        Relationships: []
      }
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

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
      alerts: {
        Row: {
          created_at: string
          farm_id: number
          id: number
          message: string
          resolved: boolean
          severity: Database["public"]["Enums"]["severity_level"]
          type: Database["public"]["Enums"]["alert_type"]
        }
        Insert: {
          created_at?: string
          farm_id: number
          id?: number
          message: string
          resolved?: boolean
          severity: Database["public"]["Enums"]["severity_level"]
          type: Database["public"]["Enums"]["alert_type"]
        }
        Update: {
          created_at?: string
          farm_id?: number
          id?: number
          message?: string
          resolved?: boolean
          severity?: Database["public"]["Enums"]["severity_level"]
          type?: Database["public"]["Enums"]["alert_type"]
        }
        Relationships: [
          {
            foreignKeyName: "alerts_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_queries: {
        Row: {
          created_at: string
          email: string
          id: number
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          message?: string
          name?: string
        }
        Relationships: []
      }
      farms: {
        Row: {
          created_at: string
          crop_type: string
          id: number
          location: string
          name: string
        }
        Insert: {
          created_at?: string
          crop_type: string
          id?: number
          location: string
          name: string
        }
        Update: {
          created_at?: string
          crop_type?: string
          id?: number
          location?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      readings: {
        Row: {
          conductivity: number
          flow_rate: number
          id: number
          pressure: number
          sensor_id: string
          status: string | null
          timestamp: string
        }
        Insert: {
          conductivity: number
          flow_rate: number
          id?: number
          pressure: number
          sensor_id: string
          status?: string | null
          timestamp?: string
        }
        Update: {
          conductivity?: number
          flow_rate?: number
          id?: number
          pressure?: number
          sensor_id?: string
          status?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "readings_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "sensors"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          description: string | null
          file_url: string | null
          id: number
          submitted_at: string
          title: string
          user_id: string
        }
        Insert: {
          description?: string | null
          file_url?: string | null
          id?: number
          submitted_at?: string
          title: string
          user_id: string
        }
        Update: {
          description?: string | null
          file_url?: string | null
          id?: number
          submitted_at?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          created_at: string
          duration: number
          farm_id: number
          fertilizer_amount: number
          id: number
          start_time: string
        }
        Insert: {
          created_at?: string
          duration: number
          farm_id: number
          fertilizer_amount: number
          id?: number
          start_time: string
        }
        Update: {
          created_at?: string
          duration?: number
          farm_id?: number
          fertilizer_amount?: number
          id?: number
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      sensors: {
        Row: {
          farm_id: number
          id: string
          last_update: string | null
          serial_number: string
          type: string
        }
        Insert: {
          farm_id: number
          id: string
          last_update?: string | null
          serial_number: string
          type: string
        }
        Update: {
          farm_id?: number
          id?: string
          last_update?: string | null
          serial_number?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensors_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
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
      alert_type: "Clogging" | "Pressure Drop" | "Low Flow" | "System Error"
      severity_level: "Low" | "Medium" | "High"
      user_role: "Farmer" | "Officer" | "Researcher" | "Admin"
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
      alert_type: ["Clogging", "Pressure Drop", "Low Flow", "System Error"],
      severity_level: ["Low", "Medium", "High"],
      user_role: ["Farmer", "Officer", "Researcher", "Admin"],
    },
  },
} as const

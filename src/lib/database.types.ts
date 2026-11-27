
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "maintenance_completions": {
                  Row: {
                    "completed_at": string,"id": string,"interval_key": string,"notes": string | null,"odometer": number | null,"task_key": string,"user_id": string,"vehicle_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "completed_at"?: string,"id"?: string,"interval_key": string,"notes"?: string | null,"odometer"?: number | null,"task_key": string,"user_id"?: string,"vehicle_id": string
                  }
                  Update: {
                    "completed_at"?: string,"id"?: string,"interval_key"?: string,"notes"?: string | null,"odometer"?: number | null,"task_key"?: string,"user_id"?: string,"vehicle_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "maintenance_completions_vehicle_id_user_id_fkey"
      columns: ["vehicle_id","user_id"]
isOneToOne: false
      referencedRelation: "vehicles"
      referencedColumns: ["id","user_id"]
    }
                  ]
                },"vehicle_data_snapshots": {
                  Row: {
                    "error_code": string | null,"error_text": string | null,"expires_at": string | null,"fetched_at": string,"id": string,"kind": string,"normalized": Json | null,"provider": string,"raw": Json | null,"request_key": string,"status": string,"user_id": string,"vehicle_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "error_code"?: string | null,"error_text"?: string | null,"expires_at"?: string | null,"fetched_at"?: string,"id"?: string,"kind": string,"normalized"?: Json | null,"provider": string,"raw"?: Json | null,"request_key": string,"status": string,"user_id"?: string,"vehicle_id": string
                  }
                  Update: {
                    "error_code"?: string | null,"error_text"?: string | null,"expires_at"?: string | null,"fetched_at"?: string,"id"?: string,"kind"?: string,"normalized"?: Json | null,"provider"?: string,"raw"?: Json | null,"request_key"?: string,"status"?: string,"user_id"?: string,"vehicle_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "vehicle_data_snapshots_vehicle_id_user_id_fkey"
      columns: ["vehicle_id","user_id"]
isOneToOne: false
      referencedRelation: "vehicles"
      referencedColumns: ["id","user_id"]
    }
                  ]
                },"vehicle_external_ids": {
                  Row: {
                    "created_at": string,"id": string,"id_type": string,"provider": string,"updated_at": string,"user_id": string,"value": string,"vehicle_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"id_type": string,"provider": string,"updated_at"?: string,"user_id"?: string,"value": string,"vehicle_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"id_type"?: string,"provider"?: string,"updated_at"?: string,"user_id"?: string,"value"?: string,"vehicle_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "vehicle_external_ids_vehicle_id_user_id_fkey"
      columns: ["vehicle_id","user_id"]
isOneToOne: false
      referencedRelation: "vehicles"
      referencedColumns: ["id","user_id"]
    }
                  ]
                },"vehicles": {
                  Row: {
                    "body_class": string | null,"catalog_key": string | null,"created_at": string,"drive_type": string | null,"engine_cylinders": number | null,"engine_displacement_l": number | null,"fuel_type": string | null,"id": string,"make": string | null,"model": string | null,"model_year": number | null,"nickname": string | null,"notes": string | null,"odometer": number | null,"odometer_unit": string,"purchased_on": string | null,"transmission": string | null,"trim": string | null,"updated_at": string,"user_id": string,"vehicle_type": string,"vin": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "body_class"?: string | null,"catalog_key"?: string | null,"created_at"?: string,"drive_type"?: string | null,"engine_cylinders"?: number | null,"engine_displacement_l"?: number | null,"fuel_type"?: string | null,"id"?: string,"make"?: string | null,"model"?: string | null,"model_year"?: number | null,"nickname"?: string | null,"notes"?: string | null,"odometer"?: number | null,"odometer_unit"?: string,"purchased_on"?: string | null,"transmission"?: string | null,"trim"?: string | null,"updated_at"?: string,"user_id"?: string,"vehicle_type"?: string,"vin"?: string | null
                  }
                  Update: {
                    "body_class"?: string | null,"catalog_key"?: string | null,"created_at"?: string,"drive_type"?: string | null,"engine_cylinders"?: number | null,"engine_displacement_l"?: number | null,"fuel_type"?: string | null,"id"?: string,"make"?: string | null,"model"?: string | null,"model_year"?: number | null,"nickname"?: string | null,"notes"?: string | null,"odometer"?: number | null,"odometer_unit"?: string,"purchased_on"?: string | null,"transmission"?: string | null,"trim"?: string | null,"updated_at"?: string,"user_id"?: string,"vehicle_type"?: string,"vin"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"vin_decode_cache": {
                  Row: {
                    "error_code": string | null,"error_text": string | null,"expires_at": string,"fetched_at": string,"model_year": number | null,"normalized": Json | null,"provider": string,"raw": Json | null,"status": string,"vin": string
                  }
                  ComputedFields: never
                  Insert: {
                    "error_code"?: string | null,"error_text"?: string | null,"expires_at": string,"fetched_at"?: string,"model_year"?: number | null,"normalized"?: Json | null,"provider": string,"raw"?: Json | null,"status": string,"vin": string
                  }
                  Update: {
                    "error_code"?: string | null,"error_text"?: string | null,"expires_at"?: string,"fetched_at"?: string,"model_year"?: number | null,"normalized"?: Json | null,"provider"?: string,"raw"?: Json | null,"status"?: string,"vin"?: string
                  }
                  Relationships: [
                    
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
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const

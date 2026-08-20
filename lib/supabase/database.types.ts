import type { DayOfWeek } from "@/types/exercise";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string;
          name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      workout_plans: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_plans_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      exercises: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          name: string;
          day_of_week: DayOfWeek;
          position: number;
          sets: number;
          reps: string;
          weight: string | null;
          rest_minutes: number | null;
          completed: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          name: string;
          day_of_week: DayOfWeek;
          position?: number;
          sets: number;
          reps: string;
          weight?: string | null;
          rest_minutes?: number | null;
          completed?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          name?: string;
          day_of_week?: DayOfWeek;
          position?: number;
          sets?: number;
          reps?: string;
          weight?: string | null;
          rest_minutes?: number | null;
          completed?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exercises_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exercises_plan_id_fkey";
            columns: ["plan_id"];
            referencedRelation: "workout_plans";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_auth_email_by_username: {
        Args: {
          p_username: string;
        };
        Returns: string | null;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

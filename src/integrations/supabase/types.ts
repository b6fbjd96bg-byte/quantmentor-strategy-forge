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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      allocation_history: {
        Row: {
          allocation_id: string
          created_at: string
          cumulative_pnl: number
          cumulative_pnl_percentage: number
          daily_pnl: number
          daily_pnl_percentage: number
          drawdown: number
          id: string
          max_drawdown: number
          snapshot_date: string
          strategy_distribution: Json
          total_value: number
          volatility_index: number
        }
        Insert: {
          allocation_id: string
          created_at?: string
          cumulative_pnl?: number
          cumulative_pnl_percentage?: number
          daily_pnl?: number
          daily_pnl_percentage?: number
          drawdown?: number
          id?: string
          max_drawdown?: number
          snapshot_date?: string
          strategy_distribution?: Json
          total_value: number
          volatility_index?: number
        }
        Update: {
          allocation_id?: string
          created_at?: string
          cumulative_pnl?: number
          cumulative_pnl_percentage?: number
          daily_pnl?: number
          daily_pnl_percentage?: number
          drawdown?: number
          id?: string
          max_drawdown?: number
          snapshot_date?: string
          strategy_distribution?: Json
          total_value?: number
          volatility_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "allocation_history_allocation_id_fkey"
            columns: ["allocation_id"]
            isOneToOne: false
            referencedRelation: "capital_allocations"
            referencedColumns: ["id"]
          },
        ]
      }
      backtest_results: {
        Row: {
          bot_id: string | null
          created_at: string
          end_date: string
          equity_curve: Json | null
          final_capital: number | null
          id: string
          initial_capital: number
          losing_trades: number | null
          max_drawdown: number | null
          profit_loss: number | null
          profit_loss_percentage: number | null
          sharpe_ratio: number | null
          start_date: string
          symbol: string
          timeframe: string
          total_trades: number | null
          trade_log: Json | null
          user_id: string
          win_rate: number | null
          winning_trades: number | null
        }
        Insert: {
          bot_id?: string | null
          created_at?: string
          end_date: string
          equity_curve?: Json | null
          final_capital?: number | null
          id?: string
          initial_capital?: number
          losing_trades?: number | null
          max_drawdown?: number | null
          profit_loss?: number | null
          profit_loss_percentage?: number | null
          sharpe_ratio?: number | null
          start_date: string
          symbol: string
          timeframe: string
          total_trades?: number | null
          trade_log?: Json | null
          user_id: string
          win_rate?: number | null
          winning_trades?: number | null
        }
        Update: {
          bot_id?: string | null
          created_at?: string
          end_date?: string
          equity_curve?: Json | null
          final_capital?: number | null
          id?: string
          initial_capital?: number
          losing_trades?: number | null
          max_drawdown?: number | null
          profit_loss?: number | null
          profit_loss_percentage?: number | null
          sharpe_ratio?: number | null
          start_date?: string
          symbol?: string
          timeframe?: string
          total_trades?: number | null
          trade_log?: Json | null
          user_id?: string
          win_rate?: number | null
          winning_trades?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "backtest_results_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "strategy_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_trades: {
        Row: {
          bot_id: string | null
          broker: string
          created_at: string
          entry_price: number
          entry_reason: string | null
          entry_time: string
          exit_price: number | null
          exit_reason: string | null
          exit_time: string | null
          id: string
          indicators_at_entry: Json | null
          order_id: string | null
          profit_loss: number | null
          profit_loss_percentage: number | null
          quantity: number
          side: string
          status: string
          symbol: string
          trade_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bot_id?: string | null
          broker: string
          created_at?: string
          entry_price: number
          entry_reason?: string | null
          entry_time?: string
          exit_price?: number | null
          exit_reason?: string | null
          exit_time?: string | null
          id?: string
          indicators_at_entry?: Json | null
          order_id?: string | null
          profit_loss?: number | null
          profit_loss_percentage?: number | null
          quantity: number
          side: string
          status?: string
          symbol: string
          trade_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bot_id?: string | null
          broker?: string
          created_at?: string
          entry_price?: number
          entry_reason?: string | null
          entry_time?: string
          exit_price?: number | null
          exit_reason?: string | null
          exit_time?: string | null
          id?: string
          indicators_at_entry?: Json | null
          order_id?: string | null
          profit_loss?: number | null
          profit_loss_percentage?: number | null
          quantity?: number
          side?: string
          status?: string
          symbol?: string
          trade_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_trades_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "strategy_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_connections: {
        Row: {
          api_key_encrypted: string | null
          api_secret_encrypted: string | null
          broker: string
          connection_status: string | null
          created_at: string
          id: string
          is_connected: boolean | null
          is_paper_trading: boolean | null
          last_synced_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          broker: string
          connection_status?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean | null
          is_paper_trading?: boolean | null
          last_synced_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          broker?: string
          connection_status?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean | null
          is_paper_trading?: boolean | null
          last_synced_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      capital_allocations: {
        Row: {
          capital_amount: number
          created_at: string
          current_value: number
          high_water_mark: number
          id: string
          lock_end_date: string | null
          lock_in_days: number | null
          performance_fee_rate: number
          platform_fee_rate: number
          risk_profile: Database["public"]["Enums"]["risk_profile"]
          status: Database["public"]["Enums"]["allocation_status"]
          total_fees_paid: number
          updated_at: string
          user_id: string
        }
        Insert: {
          capital_amount: number
          created_at?: string
          current_value?: number
          high_water_mark?: number
          id?: string
          lock_end_date?: string | null
          lock_in_days?: number | null
          performance_fee_rate?: number
          platform_fee_rate?: number
          risk_profile?: Database["public"]["Enums"]["risk_profile"]
          status?: Database["public"]["Enums"]["allocation_status"]
          total_fees_paid?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          capital_amount?: number
          created_at?: string
          current_value?: number
          high_water_mark?: number
          id?: string
          lock_end_date?: string | null
          lock_in_days?: number | null
          performance_fee_rate?: number
          platform_fee_rate?: number
          risk_profile?: Database["public"]["Enums"]["risk_profile"]
          status?: Database["public"]["Enums"]["allocation_status"]
          total_fees_paid?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          preferred_markets: string[] | null
          trading_experience: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_markets?: string[] | null
          trading_experience?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_markets?: string[] | null
          trading_experience?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      qualified_strategies: {
        Row: {
          correlation_factor: number
          created_at: string
          description: string | null
          disqualification_reason: string | null
          execution_quality_score: number
          id: string
          is_qualified: boolean
          live_trading_days: number
          markets: string[]
          max_drawdown: number
          name: string
          qualification_date: string | null
          risk_score: number
          sharpe_ratio: number
          slippage_score: number
          sortino_ratio: number
          strategy_id: string | null
          strategy_type: string
          updated_at: string
        }
        Insert: {
          correlation_factor?: number
          created_at?: string
          description?: string | null
          disqualification_reason?: string | null
          execution_quality_score?: number
          id?: string
          is_qualified?: boolean
          live_trading_days?: number
          markets: string[]
          max_drawdown?: number
          name: string
          qualification_date?: string | null
          risk_score?: number
          sharpe_ratio?: number
          slippage_score?: number
          sortino_ratio?: number
          strategy_id?: string | null
          strategy_type: string
          updated_at?: string
        }
        Update: {
          correlation_factor?: number
          created_at?: string
          description?: string | null
          disqualification_reason?: string | null
          execution_quality_score?: number
          id?: string
          is_qualified?: boolean
          live_trading_days?: number
          markets?: string[]
          max_drawdown?: number
          name?: string
          qualification_date?: string | null
          risk_score?: number
          sharpe_ratio?: number
          slippage_score?: number
          sortino_ratio?: number
          strategy_id?: string | null
          strategy_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qualified_strategies_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_control_events: {
        Row: {
          allocation_id: string
          created_at: string
          event_description: string
          event_type: string
          id: string
          new_exposure: number | null
          previous_exposure: number | null
          triggered_by: string
        }
        Insert: {
          allocation_id: string
          created_at?: string
          event_description: string
          event_type: string
          id?: string
          new_exposure?: number | null
          previous_exposure?: number | null
          triggered_by: string
        }
        Update: {
          allocation_id?: string
          created_at?: string
          event_description?: string
          event_type?: string
          id?: string
          new_exposure?: number | null
          previous_exposure?: number | null
          triggered_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_control_events_allocation_id_fkey"
            columns: ["allocation_id"]
            isOneToOne: false
            referencedRelation: "capital_allocations"
            referencedColumns: ["id"]
          },
        ]
      }
      strategies: {
        Row: {
          created_at: string
          description: string | null
          entry_rules: string | null
          exit_rules: string | null
          id: string
          markets: string[]
          max_daily_loss: number | null
          max_positions: number | null
          name: string
          risk_per_trade: number | null
          status: string
          stop_loss_type: string | null
          strategy_type: string
          take_profit_type: string | null
          timeframe: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          entry_rules?: string | null
          exit_rules?: string | null
          id?: string
          markets: string[]
          max_daily_loss?: number | null
          max_positions?: number | null
          name: string
          risk_per_trade?: number | null
          status?: string
          stop_loss_type?: string | null
          strategy_type: string
          take_profit_type?: string | null
          timeframe?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          entry_rules?: string | null
          exit_rules?: string | null
          id?: string
          markets?: string[]
          max_daily_loss?: number | null
          max_positions?: number | null
          name?: string
          risk_per_trade?: number | null
          status?: string
          stop_loss_type?: string | null
          strategy_type?: string
          take_profit_type?: string | null
          timeframe?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      strategy_allocations: {
        Row: {
          allocated_capital: number
          allocation_id: string
          allocation_percentage: number
          created_at: string
          current_value: number
          id: string
          profit_loss: number
          profit_loss_percentage: number
          qualified_strategy_id: string
          updated_at: string
        }
        Insert: {
          allocated_capital?: number
          allocation_id: string
          allocation_percentage?: number
          created_at?: string
          current_value?: number
          id?: string
          profit_loss?: number
          profit_loss_percentage?: number
          qualified_strategy_id: string
          updated_at?: string
        }
        Update: {
          allocated_capital?: number
          allocation_id?: string
          allocation_percentage?: number
          created_at?: string
          current_value?: number
          id?: string
          profit_loss?: number
          profit_loss_percentage?: number
          qualified_strategy_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_allocations_allocation_id_fkey"
            columns: ["allocation_id"]
            isOneToOne: false
            referencedRelation: "capital_allocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategy_allocations_qualified_strategy_id_fkey"
            columns: ["qualified_strategy_id"]
            isOneToOne: false
            referencedRelation: "qualified_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_bots: {
        Row: {
          ai_analysis: string | null
          bot_config: Json | null
          broker: string
          created_at: string
          entry_logic: string | null
          error_message: string | null
          exit_logic: string | null
          generated_code: string | null
          id: string
          indicators: Json | null
          name: string
          risk_params: Json | null
          status: string
          strategy_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_analysis?: string | null
          bot_config?: Json | null
          broker?: string
          created_at?: string
          entry_logic?: string | null
          error_message?: string | null
          exit_logic?: string | null
          generated_code?: string | null
          id?: string
          indicators?: Json | null
          name: string
          risk_params?: Json | null
          status?: string
          strategy_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_analysis?: string | null
          bot_config?: Json | null
          broker?: string
          created_at?: string
          entry_logic?: string | null
          error_message?: string | null
          exit_logic?: string | null
          generated_code?: string | null
          id?: string
          indicators?: Json | null
          name?: string
          risk_params?: Json | null
          status?: string
          strategy_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_bots_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_journal: {
        Row: {
          created_at: string
          emotions: string | null
          entry_date: string
          entry_price: number
          entry_reason: string | null
          exit_date: string | null
          exit_price: number | null
          exit_reason: string | null
          id: string
          lessons_learned: string | null
          market: string
          profit_loss: number | null
          profit_loss_percentage: number | null
          quantity: number
          rating: number | null
          screenshots: string[] | null
          status: string
          strategy_used: string | null
          symbol: string
          tags: string[] | null
          timeframe: string | null
          trade_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emotions?: string | null
          entry_date: string
          entry_price: number
          entry_reason?: string | null
          exit_date?: string | null
          exit_price?: number | null
          exit_reason?: string | null
          id?: string
          lessons_learned?: string | null
          market: string
          profit_loss?: number | null
          profit_loss_percentage?: number | null
          quantity: number
          rating?: number | null
          screenshots?: string[] | null
          status?: string
          strategy_used?: string | null
          symbol: string
          tags?: string[] | null
          timeframe?: string | null
          trade_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emotions?: string | null
          entry_date?: string
          entry_price?: number
          entry_reason?: string | null
          exit_date?: string | null
          exit_price?: number | null
          exit_reason?: string | null
          id?: string
          lessons_learned?: string | null
          market?: string
          profit_loss?: number | null
          profit_loss_percentage?: number | null
          quantity?: number
          rating?: number | null
          screenshots?: string[] | null
          status?: string
          strategy_used?: string | null
          symbol?: string
          tags?: string[] | null
          timeframe?: string | null
          trade_type?: string
          updated_at?: string
          user_id?: string
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
      allocation_status: "pending" | "active" | "paused" | "withdrawn"
      risk_profile: "conservative" | "balanced" | "aggressive"
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
      allocation_status: ["pending", "active", "paused", "withdrawn"],
      risk_profile: ["conservative", "balanced", "aggressive"],
    },
  },
} as const

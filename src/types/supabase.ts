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
      csv_documents: {
        Row: {
          created_at: string | null
          description: string | null
          file_name: string
          file_size: number
          file_url: string
          id: number
          report_period_id: number
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by_employee_id: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_name: string
          file_size: number
          file_url: string
          id?: number
          report_period_id: number
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by_employee_id?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_size?: number
          file_url?: string
          id?: number
          report_period_id?: number
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by_employee_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "csv_documents_report_period_id_fkey"
            columns: ["report_period_id"]
            isOneToOne: false
            referencedRelation: "financial_report_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_statuses: {
        Row: {
          code: string
          created_at: string
          description: string
          id: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          id?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      delivery_statuses: {
        Row: {
          code: string
          created_at: string
          description: string
          id: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          id?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      employee_commission: {
        Row: {
          actual_ship_date: string
          artist_commission_amount_vnd: number | null
          artist_commission_rate: number | null
          artist_employee_id: number | null
          created_at: string | null
          id: number
          order_date: string
          order_earnings_vnd: number | null
          order_id: number
          profit_vnd: number | null
          seller_commission_amount_vnd: number | null
          seller_commission_rate: number | null
          seller_employee_id: number | null
          updated_at: string | null
        }
        Insert: {
          actual_ship_date: string
          artist_commission_amount_vnd?: number | null
          artist_commission_rate?: number | null
          artist_employee_id?: number | null
          created_at?: string | null
          id?: number
          order_date: string
          order_earnings_vnd?: number | null
          order_id: number
          profit_vnd?: number | null
          seller_commission_amount_vnd?: number | null
          seller_commission_rate?: number | null
          seller_employee_id?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_ship_date?: string
          artist_commission_amount_vnd?: number | null
          artist_commission_rate?: number | null
          artist_employee_id?: number | null
          created_at?: string | null
          id?: number
          order_date?: string
          order_earnings_vnd?: number | null
          order_id?: number
          profit_vnd?: number | null
          seller_commission_amount_vnd?: number | null
          seller_commission_rate?: number | null
          seller_employee_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_commission_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_salary: {
        Row: {
          approved_at: string | null
          approved_by: number | null
          artist_commission_total: number | null
          base_salary: number | null
          bonus: number | null
          created_at: string | null
          deduction: number | null
          employee_id: number
          id: number
          notes: string | null
          other_costs: number | null
          paid_at: string | null
          salary_period_month: number | null
          salary_period_year: number
          seller_commission_total: number | null
          status: string | null
          total_salary: number | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: number | null
          artist_commission_total?: number | null
          base_salary?: number | null
          bonus?: number | null
          created_at?: string | null
          deduction?: number | null
          employee_id: number
          id?: number
          notes?: string | null
          other_costs?: number | null
          paid_at?: string | null
          salary_period_month?: number | null
          salary_period_year: number
          seller_commission_total?: number | null
          status?: string | null
          total_salary?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: number | null
          artist_commission_total?: number | null
          base_salary?: number | null
          bonus?: number | null
          created_at?: string | null
          deduction?: number | null
          employee_id?: number
          id?: number
          notes?: string | null
          other_costs?: number | null
          paid_at?: string | null
          salary_period_month?: number | null
          salary_period_year?: number
          seller_commission_total?: number | null
          status?: string | null
          total_salary?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          avatar: string
          base_salary: number | null
          code: string
          created_at: string
          email: string
          id: number
          is_active: boolean
          is_admin: boolean
          name: string
          role: string
          sales_commission_rate: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar: string
          base_salary?: number | null
          code: string
          created_at?: string
          email: string
          id?: number
          is_active?: boolean
          is_admin?: boolean
          name: string
          role: string
          sales_commission_rate?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar?: string
          base_salary?: number | null
          code?: string
          created_at?: string
          email?: string
          id?: number
          is_active?: boolean
          is_admin?: boolean
          name?: string
          role?: string
          sales_commission_rate?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          currency: string
          date: string
          description: string
          id: number
          payment_method: string | null
          receipt_url: string | null
          report_period_id: number
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          currency?: string
          date: string
          description: string
          id?: number
          payment_method?: string | null
          receipt_url?: string | null
          report_period_id: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          currency?: string
          date?: string
          description?: string
          id?: number
          payment_method?: string | null
          receipt_url?: string | null
          report_period_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_report_period_id_fkey"
            columns: ["report_period_id"]
            isOneToOne: false
            referencedRelation: "financial_report_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      factory_statuses: {
        Row: {
          code: string
          created_at: string
          description: string
          id: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          id?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      financial_report_periods: {
        Row: {
          created_at: string | null
          credit_notes: string | null
          id: number
          marketing_fees: number
          month: number
          net_profit: number
          notes: string | null
          period_end: string
          period_start: string
          shop_id: number
          status: string
          total_fees: number
          total_sales: number
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by_employee_id: number | null
          vat_statement_url: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          credit_notes?: string | null
          id?: number
          marketing_fees?: number
          month: number
          net_profit?: number
          notes?: string | null
          period_end: string
          period_start: string
          shop_id: number
          status?: string
          total_fees?: number
          total_sales?: number
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by_employee_id?: number | null
          vat_statement_url?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          credit_notes?: string | null
          id?: number
          marketing_fees?: number
          month?: number
          net_profit?: number
          notes?: string | null
          period_end?: string
          period_start?: string
          shop_id?: number
          status?: string
          total_fees?: number
          total_sales?: number
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by_employee_id?: number | null
          vat_statement_url?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_report_periods_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      general_statuses: {
        Row: {
          code: string
          created_at: string
          description: string
          id: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          id?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      incoming_money: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          date: string
          description: string
          expected_date: string | null
          id: number
          order_id: string | null
          report_period_id: number
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          date: string
          description: string
          expected_date?: string | null
          id?: number
          order_id?: string | null
          report_period_id: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          date?: string
          description?: string
          expected_date?: string | null
          id?: number
          order_id?: string | null
          report_period_id?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incoming_money_report_period_id_fkey"
            columns: ["report_period_id"]
            isOneToOne: false
            referencedRelation: "financial_report_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      money_on_etsy: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          date: string
          description: string
          id: number
          report_period_id: number
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          date: string
          description: string
          id?: number
          report_period_id: number
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          date?: string
          description?: string
          id?: number
          report_period_id?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "money_on_etsy_report_period_id_fkey"
            columns: ["report_period_id"]
            isOneToOne: false
            referencedRelation: "financial_report_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      order_history: {
        Row: {
          action_type: string
          changed_by_employee_id: number | null
          created_at: string
          description: string | null
          field_name: string | null
          id: number
          new_value: string | null
          old_value: string | null
          order_id: number
        }
        Insert: {
          action_type: string
          changed_by_employee_id?: number | null
          created_at?: string
          description?: string | null
          field_name?: string | null
          id?: number
          new_value?: string | null
          old_value?: string | null
          order_id: number
        }
        Update: {
          action_type?: string
          changed_by_employee_id?: number | null
          created_at?: string
          description?: string | null
          field_name?: string | null
          id?: number
          new_value?: string | null
          old_value?: string | null
          order_id?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: number
          order_id: number
          quantity: number
          size: string
          sku: string
          type: string
          unit_price_usd: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          order_id: number
          quantity?: number
          size: string
          sku: string
          type: string
          unit_price_usd?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          order_id?: number
          quantity?: number
          size?: string
          sku?: string
          type?: string
          unit_price_usd?: number
          updated_at?: string
        }
        Relationships: []
      }
      order_preview_pictures: {
        Row: {
          created_at: string
          description: string | null
          file_size: number | null
          id: number
          mime_type: string | null
          order_id: number
          picture_name: string
          picture_url: string
          updated_at: string
          uploaded_by_employee_id: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          id?: number
          mime_type?: string | null
          order_id: number
          picture_name: string
          picture_url: string
          updated_at?: string
          uploaded_by_employee_id?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          id?: number
          mime_type?: string | null
          order_id?: number
          picture_name?: string
          picture_url?: string
          updated_at?: string
          uploaded_by_employee_id?: number | null
        }
        Relationships: []
      }
      order_previews: {
        Row: {
          confirmed_at: string | null
          created_at: string
          created_by_employee_id: number | null
          customer_confirmed: boolean
          customer_feedback: string | null
          file_size: number | null
          id: number
          internal_notes: string | null
          mime_type: string | null
          order_id: number
          picture_name: string
          picture_url: string
          updated_at: string
          uploaded_by_employee_id: number | null
          version_number: number
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          created_by_employee_id?: number | null
          customer_confirmed?: boolean
          customer_feedback?: string | null
          file_size?: number | null
          id?: number
          internal_notes?: string | null
          mime_type?: string | null
          order_id: number
          picture_name: string
          picture_url: string
          updated_at?: string
          uploaded_by_employee_id?: number | null
          version_number?: number
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          created_by_employee_id?: number | null
          customer_confirmed?: boolean
          customer_feedback?: string | null
          file_size?: number | null
          id?: number
          internal_notes?: string | null
          mime_type?: string | null
          order_id?: number
          picture_name?: string
          picture_url?: string
          updated_at?: string
          uploaded_by_employee_id?: number | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_previews_created_by_fkey"
            columns: ["created_by_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_previews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_previews_uploaded_by_fkey"
            columns: ["uploaded_by_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_ship_date: string | null
          artist_commission_rate: number | null
          artist_employee_id: number | null
          buyer_paid_usd: number
          buyer_paid_vnd: number
          carrier_notes: string | null
          carrier_unit: string | null
          created_at: string
          customer_address: string
          customer_email: string | null
          customer_name: string
          customer_notes: string | null
          customer_phone: string | null
          customer_status_id: number | null
          delivery_status_id: number | null
          discount_rate: number
          exchange_rate: number
          factory_status_id: number | null
          general_status_id: number | null
          id: number
          internal_tracking_number: string | null
          is_verified_address: boolean
          verified_customer_address: string | null
          item_total_usd: number
          item_total_vnd: number
          order_date: string
          order_earnings_usd: number
          order_earnings_vnd: number
          order_id: string
          other_bonus_exchange_rate: number
          other_bonus_notes: string | null
          other_bonus_usd: number
          other_bonus_vnd: number
          other_fee_exchange_rate: number
          other_fee_notes: string | null
          other_fee_usd: number
          other_fee_vnd: number
          profit_usd: number
          profit_vnd: number
          refund_fee_exchange_rate: number
          refund_fee_notes: string | null
          refund_fee_usd: number
          refund_fee_vnd: number
          scheduled_ship_date: string | null
          seller_employee_id: number | null
          shipping_exchange_rate: number
          shipping_fee_usd: number
          shipping_fee_vnd: number
          shop_id: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          actual_ship_date?: string | null
          artist_commission_rate?: number | null
          artist_employee_id?: number | null
          buyer_paid_usd?: number
          buyer_paid_vnd?: number
          carrier_notes?: string | null
          carrier_unit?: string | null
          created_at?: string
          customer_address: string
          customer_email?: string | null
          customer_name: string
          customer_notes?: string | null
          customer_phone?: string | null
          customer_status_id?: number | null
          delivery_status_id?: number | null
          discount_rate?: number
          exchange_rate?: number
          factory_status_id?: number | null
          general_status_id?: number | null
          id?: number
          internal_tracking_number?: string | null
          is_verified_address?: boolean
          verified_customer_address?: string | null
          item_total_usd?: number
          item_total_vnd?: number
          order_date: string
          order_earnings_usd?: number
          order_earnings_vnd?: number
          order_id: string
          other_bonus_exchange_rate?: number
          other_bonus_notes?: string | null
          other_bonus_usd?: number
          other_bonus_vnd?: number
          other_fee_exchange_rate?: number
          other_fee_notes?: string | null
          other_fee_usd?: number
          other_fee_vnd?: number
          profit_usd?: number
          profit_vnd?: number
          refund_fee_exchange_rate?: number
          refund_fee_notes?: string | null
          refund_fee_usd?: number
          refund_fee_vnd?: number
          scheduled_ship_date?: string | null
          seller_employee_id?: number | null
          shipping_exchange_rate?: number
          shipping_fee_usd?: number
          shipping_fee_vnd?: number
          shop_id: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          actual_ship_date?: string | null
          artist_commission_rate?: number | null
          artist_employee_id?: number | null
          buyer_paid_usd?: number
          buyer_paid_vnd?: number
          carrier_notes?: string | null
          carrier_unit?: string | null
          created_at?: string
          customer_address?: string
          customer_email?: string | null
          customer_name?: string
          customer_notes?: string | null
          customer_phone?: string | null
          customer_status_id?: number | null
          delivery_status_id?: number | null
          discount_rate?: number
          exchange_rate?: number
          factory_status_id?: number | null
          general_status_id?: number | null
          id?: number
          internal_tracking_number?: string | null
          is_verified_address?: boolean
          verified_customer_address?: string | null
          item_total_usd?: number
          item_total_vnd?: number
          order_date?: string
          order_earnings_usd?: number
          order_earnings_vnd?: number
          order_id?: string
          other_bonus_exchange_rate?: number
          other_bonus_notes?: string | null
          other_bonus_usd?: number
          other_bonus_vnd?: number
          other_fee_exchange_rate?: number
          other_fee_notes?: string | null
          other_fee_usd?: number
          other_fee_vnd?: number
          profit_usd?: number
          profit_vnd?: number
          refund_fee_exchange_rate?: number
          refund_fee_notes?: string | null
          refund_fee_usd?: number
          refund_fee_vnd?: number
          scheduled_ship_date?: string | null
          seller_employee_id?: number | null
          shipping_exchange_rate?: number
          shipping_fee_usd?: number
          shipping_fee_vnd?: number
          shop_id?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          etsy_url: string
          id: number
          image_url: string
          is_active: boolean
          shop_code: string
          sku: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          etsy_url: string
          id?: number
          image_url: string
          is_active?: boolean
          shop_code: string
          sku: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          etsy_url?: string
          id?: number
          image_url?: string
          is_active?: boolean
          shop_code?: string
          sku?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_shop_code_fkey"
            columns: ["shop_code"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["code"]
          },
        ]
      }
      received_money: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          date: string
          description: string
          id: number
          order_id: string | null
          payment_method: string | null
          received_date: string
          report_period_id: number
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          date: string
          description: string
          id?: number
          order_id?: string | null
          payment_method?: string | null
          received_date: string
          report_period_id: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          date?: string
          description?: string
          id?: number
          order_id?: string | null
          payment_method?: string | null
          received_date?: string
          report_period_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "received_money_report_period_id_fkey"
            columns: ["report_period_id"]
            isOneToOne: false
            referencedRelation: "financial_report_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          code: string
          created_at: string
          id: number
          is_active: boolean
          logo: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: number
          is_active?: boolean
          logo: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: number
          is_active?: boolean
          logo?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      transferred_money: {
        Row: {
          amount: number
          bank_account: string | null
          created_at: string | null
          currency: string
          date: string
          description: string
          id: number
          reference_number: string | null
          report_period_id: number
          transfer_date: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          bank_account?: string | null
          created_at?: string | null
          currency?: string
          date: string
          description: string
          id?: number
          reference_number?: string | null
          report_period_id: number
          transfer_date: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bank_account?: string | null
          created_at?: string | null
          currency?: string
          date?: string
          description?: string
          id?: number
          reference_number?: string | null
          report_period_id?: number
          transfer_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transferred_money_report_period_id_fkey"
            columns: ["report_period_id"]
            isOneToOne: false
            referencedRelation: "financial_report_periods"
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
      [_ in never]: never
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
    Enums: {},
  },
} as const

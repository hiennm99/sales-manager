// src/types/supabase.ts

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            products: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    shop_code: string
                    sku: string
                    title: string
                    etsy_url: string
                    image_url: string
                    is_active: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    shop_code?: string
                    sku: string
                    title: string
                    etsy_url: string
                    image_url: string
                    is_active: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    shop_code?: string
                    sku?: string
                    title?: string
                    etsy_url?: string
                    image_url?: string
                    is_active?: boolean
                }
            }
            shops: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    name: string
                    code: string
                    is_active: boolean
                    logo: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    name: string
                    code: string
                    is_active?: boolean
                    logo: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    name?: string
                    code?: string
                    is_active?: boolean
                    logo: string | null
                }
            }
        }
    }
}
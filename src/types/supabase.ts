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
                    sku: string
                    title: string
                    etsy_url: string
                    image_url: string
                    status: 'active' | 'inactive' | 'pending'
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    sku: string
                    title: string
                    etsy_url: string
                    image_url: string
                    status?: 'active' | 'inactive' | 'pending'
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    sku?: string
                    title?: string
                    etsy_url?: string
                    image_url?: string
                    status?: 'active' | 'inactive' | 'pending'
                }
            }
            shops: {
                Row: {
                    id: string
                    created_at: string
                    updated_at: string
                    name: string
                    code: string
                    status: 'active' | 'inactive' | 'pending'
                    logo: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    name: string
                    code: string
                    status?: 'active' | 'inactive' | 'pending'
                    logo?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    name?: string
                    code?: string
                    status?: 'active' | 'inactive' | 'pending'
                    logo?: string | null
                }
            }
        }
    }
}
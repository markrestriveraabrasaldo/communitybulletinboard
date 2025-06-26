export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          description: string
          image_url: string | null
          details: Record<string, unknown> | null
          category_id: string | null
          user_id: string | null
          user_name: string | null
          user_avatar_url: string | null
          status: 'active' | 'resolved' | 'sold' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          image_url?: string | null
          details?: Record<string, unknown> | null
          category_id?: string | null
          user_id?: string | null
          user_name?: string | null
          user_avatar_url?: string | null
          status?: 'active' | 'resolved' | 'sold' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          image_url?: string | null
          details?: Record<string, unknown> | null
          category_id?: string | null
          user_id?: string | null
          user_name?: string | null
          user_avatar_url?: string | null
          status?: 'active' | 'resolved' | 'sold' | 'inactive'
          created_at?: string
          updated_at?: string
        }
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

export type Category = Database['public']['Tables']['categories']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type PostWithCategory = Post & {
  categories: Category | null
}
export type PostInsert = Database['public']['Tables']['posts']['Insert']
export type PostUpdate = Database['public']['Tables']['posts']['Update']
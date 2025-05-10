export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          name: string
          description: string
          short_description: string
          base_price: number
          max_guests: number
          size_sqm: number
          beds: string
          amenities: Json
          images: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          short_description: string
          base_price: number
          max_guests: number
          size_sqm: number
          beds: string
          amenities?: Json
          images?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          short_description?: string
          base_price?: number
          max_guests?: number
          size_sqm?: number
          beds?: string
          amenities?: Json
          images?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      availability: {
        Row: {
          id: string
          room_id: string
          date: string
          is_available: boolean
          price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          date: string
          is_available?: boolean
          price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          date?: string
          is_available?: boolean
          price?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      guests: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          address: string | null
          city: string | null
          country: string | null
          document_type: string | null
          document_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone: string
          address?: string | null
          city?: string | null
          country?: string | null
          document_type?: string | null
          document_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          address?: string | null
          city?: string | null
          country?: string | null
          document_type?: string | null
          document_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          booking_number: string
          room_id: string
          guest_id: string
          check_in: string
          check_out: string
          total_price: number
          num_guests: number
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_number: string
          room_id: string
          guest_id: string
          check_in: string
          check_out: string
          total_price: number
          num_guests: number
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_number?: string
          room_id?: string
          guest_id?: string
          check_in?: string
          check_out?: string
          total_price?: number
          num_guests?: number
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      content: {
        Row: {
          id: string
          section: string
          key: string
          content_it: string
          content_en: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section: string
          key: string
          content_it: string
          content_en: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section?: string
          key?: string
          content_it?: string
          content_en?: string
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name_it: string
          name_en: string
          description_it: string
          description_en: string
          icon: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_it: string
          name_en: string
          description_it: string
          description_en: string
          icon?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name_it?: string
          name_en?: string
          description_it?: string
          description_en?: string
          icon?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      attractions: {
        Row: {
          id: string
          name_it: string
          name_en: string
          description_it: string
          description_en: string
          distance: string
          image: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_it: string
          name_en: string
          description_it: string
          description_en: string
          distance: string
          image?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name_it?: string
          name_en?: string
          description_it?: string
          description_en?: string
          distance?: string
          image?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          type: string
          recipient: string
          content: string
          status: string
          sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          recipient: string
          content: string
          status?: string
          sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          recipient?: string
          content?: string
          status?: string
          sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mimo_logs: {
        Row: {
          id: string
          agent: string
          action: string
          details: Json | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          agent: string
          action: string
          details?: Json | null
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          agent?: string
          action?: string
          details?: Json | null
          status?: string
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
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

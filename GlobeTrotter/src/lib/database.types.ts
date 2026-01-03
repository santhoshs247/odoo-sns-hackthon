export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          city: string | null;
          country: string | null;
          profile_photo_url: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          city?: string | null;
          country?: string | null;
          profile_photo_url?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          city?: string | null;
          country?: string | null;
          profile_photo_url?: string | null;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      trips: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          start_place: string;
          start_date: string;
          end_date: string;
          status: 'upcoming' | 'ongoing' | 'completed';
          total_budget: number;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          start_place: string;
          start_date: string;
          end_date: string;
          status?: 'upcoming' | 'ongoing' | 'completed';
          total_budget?: number;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          start_place?: string;
          start_date?: string;
          end_date?: string;
          status?: 'upcoming' | 'ongoing' | 'completed';
          total_budget?: number;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      itinerary_sections: {
        Row: {
          id: string;
          trip_id: string;
          title: string;
          start_date: string;
          end_date: string;
          budget: number;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          title: string;
          start_date: string;
          end_date: string;
          budget?: number;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          title?: string;
          start_date?: string;
          end_date?: string;
          budget?: number;
          order_index?: number;
          created_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          section_id: string;
          name: string;
          description: string | null;
          expense: number;
          category: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          name: string;
          description?: string | null;
          expense?: number;
          category?: string | null;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          name?: string;
          description?: string | null;
          expense?: number;
          category?: string | null;
          order_index?: number;
          created_at?: string;
        };
      };
      cities: {
        Row: {
          id: string;
          name: string;
          country: string;
          image_url: string | null;
          popularity_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          country: string;
          image_url?: string | null;
          popularity_score?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          country?: string;
          image_url?: string | null;
          popularity_score?: number;
          created_at?: string;
        };
      };
      activity_suggestions: {
        Row: {
          id: string;
          city_id: string | null;
          name: string;
          description: string | null;
          category: string | null;
          estimated_cost: number;
          popularity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          city_id?: string | null;
          name: string;
          description?: string | null;
          category?: string | null;
          estimated_cost?: number;
          popularity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          city_id?: string | null;
          name?: string;
          description?: string | null;
          category?: string | null;
          estimated_cost?: number;
          popularity?: number;
          created_at?: string;
        };
      };
    };
  };
}

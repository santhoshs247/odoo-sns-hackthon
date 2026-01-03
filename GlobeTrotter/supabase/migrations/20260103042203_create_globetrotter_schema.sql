/*
  # GlobeTrotter Application Schema

  ## Overview
  Complete database schema for the GlobeTrotter travel planning application with user profiles,
  trip management, itinerary building, budget tracking, and community features.

  ## New Tables

  ### profiles
  - `id` (uuid, primary key, references auth.users)
  - `first_name` (text)
  - `last_name` (text)
  - `email` (text, unique)
  - `phone` (text)
  - `city` (text)
  - `country` (text)
  - `profile_photo_url` (text)
  - `is_admin` (boolean, default false)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### trips
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `name` (text)
  - `start_place` (text)
  - `start_date` (date)
  - `end_date` (date)
  - `status` (text: 'upcoming', 'ongoing', 'completed')
  - `total_budget` (numeric)
  - `is_public` (boolean, default false)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### itinerary_sections
  - `id` (uuid, primary key)
  - `trip_id` (uuid, references trips)
  - `title` (text)
  - `start_date` (date)
  - `end_date` (date)
  - `budget` (numeric)
  - `order_index` (integer)
  - `created_at` (timestamptz)

  ### activities
  - `id` (uuid, primary key)
  - `section_id` (uuid, references itinerary_sections)
  - `name` (text)
  - `description` (text)
  - `expense` (numeric)
  - `category` (text)
  - `order_index` (integer)
  - `created_at` (timestamptz)

  ### cities
  - `id` (uuid, primary key)
  - `name` (text)
  - `country` (text)
  - `image_url` (text)
  - `popularity_score` (integer)
  - `created_at` (timestamptz)

  ### activity_suggestions
  - `id` (uuid, primary key)
  - `city_id` (uuid, references cities)
  - `name` (text)
  - `description` (text)
  - `category` (text)
  - `estimated_cost` (numeric)
  - `popularity` (integer)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Public trips are readable by all authenticated users
  - Admins have special access to analytics

  ## Important Notes
  1. Trip status is automatically calculated based on dates
  2. Budget calculations aggregate from activities
  3. Community posts show only public trips
  4. Profile photos are stored as URLs (use Supabase Storage)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  city text,
  country text,
  profile_photo_url text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_place text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  total_budget numeric DEFAULT 0,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create itinerary_sections table
CREATE TABLE IF NOT EXISTS itinerary_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  budget numeric DEFAULT 0,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES itinerary_sections(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  expense numeric DEFAULT 0,
  category text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  image_url text,
  popularity_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create activity_suggestions table
CREATE TABLE IF NOT EXISTS activity_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid REFERENCES cities(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text,
  estimated_cost numeric DEFAULT 0,
  popularity integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for trips
CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view public trips"
  ON trips FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can create own trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for itinerary_sections
CREATE POLICY "Users can view sections of accessible trips"
  ON itinerary_sections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = itinerary_sections.trip_id
      AND (trips.user_id = auth.uid() OR trips.is_public = true)
    )
  );

CREATE POLICY "Users can create sections in own trips"
  ON itinerary_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = itinerary_sections.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sections in own trips"
  ON itinerary_sections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = itinerary_sections.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = itinerary_sections.trip_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sections in own trips"
  ON itinerary_sections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = itinerary_sections.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- RLS Policies for activities
CREATE POLICY "Users can view activities in accessible sections"
  ON activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM itinerary_sections
      JOIN trips ON trips.id = itinerary_sections.trip_id
      WHERE itinerary_sections.id = activities.section_id
      AND (trips.user_id = auth.uid() OR trips.is_public = true)
    )
  );

CREATE POLICY "Users can create activities in own sections"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM itinerary_sections
      JOIN trips ON trips.id = itinerary_sections.trip_id
      WHERE itinerary_sections.id = activities.section_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update activities in own sections"
  ON activities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM itinerary_sections
      JOIN trips ON trips.id = itinerary_sections.trip_id
      WHERE itinerary_sections.id = activities.section_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM itinerary_sections
      JOIN trips ON trips.id = itinerary_sections.trip_id
      WHERE itinerary_sections.id = activities.section_id
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete activities in own sections"
  ON activities FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM itinerary_sections
      JOIN trips ON trips.id = itinerary_sections.trip_id
      WHERE itinerary_sections.id = activities.section_id
      AND trips.user_id = auth.uid()
    )
  );

-- RLS Policies for cities (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view cities"
  ON cities FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for activity_suggestions (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view activity suggestions"
  ON activity_suggestions FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_is_public ON trips(is_public);
CREATE INDEX IF NOT EXISTS idx_itinerary_sections_trip_id ON itinerary_sections(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_section_id ON activities(section_id);
CREATE INDEX IF NOT EXISTS idx_activity_suggestions_city_id ON activity_suggestions(city_id);

-- Insert some sample cities and activity suggestions
INSERT INTO cities (name, country, image_url, popularity_score) VALUES
  ('Paris', 'France', 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=800', 95),
  ('Tokyo', 'Japan', 'https://images.pexels.com/photos/2614818/pexels-photo-2614818.jpeg?auto=compress&cs=tinysrgb&w=800', 92),
  ('New York', 'USA', 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=800', 90),
  ('Barcelona', 'Spain', 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800', 88),
  ('Dubai', 'UAE', 'https://images.pexels.com/photos/1470502/pexels-photo-1470502.jpeg?auto=compress&cs=tinysrgb&w=800', 85),
  ('London', 'UK', 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=800', 93),
  ('Rome', 'Italy', 'https://images.pexels.com/photos/2292837/pexels-photo-2292837.jpeg?auto=compress&cs=tinysrgb&w=800', 89),
  ('Bali', 'Indonesia', 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=800', 87)
ON CONFLICT DO NOTHING;

-- Insert sample activity suggestions for Paris
INSERT INTO activity_suggestions (city_id, name, description, category, estimated_cost, popularity)
SELECT id, 'Visit Eiffel Tower', 'Iconic landmark with stunning views', 'Sightseeing', 30, 98
FROM cities WHERE name = 'Paris'
ON CONFLICT DO NOTHING;

INSERT INTO activity_suggestions (city_id, name, description, category, estimated_cost, popularity)
SELECT id, 'Louvre Museum', 'World-famous art museum', 'Culture', 20, 95
FROM cities WHERE name = 'Paris'
ON CONFLICT DO NOTHING;

INSERT INTO activity_suggestions (city_id, name, description, category, estimated_cost, popularity)
SELECT id, 'Seine River Cruise', 'Romantic boat tour', 'Leisure', 45, 90
FROM cities WHERE name = 'Paris'
ON CONFLICT DO NOTHING;
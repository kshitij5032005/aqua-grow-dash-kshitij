-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('Farmer', 'Officer', 'Researcher', 'Admin');

-- Create enum for severity levels
CREATE TYPE public.severity_level AS ENUM ('Low', 'Medium', 'High');

-- Create enum for alert types
CREATE TYPE public.alert_type AS ENUM ('Clogging', 'Pressure Drop', 'Low Flow', 'System Error');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'Farmer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create farms table
CREATE TABLE public.farms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  crop_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on farms
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

-- Farms policies (all authenticated users can view)
CREATE POLICY "Authenticated users can view farms" ON public.farms
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Officers and admins can insert farms" ON public.farms
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('Officer', 'Admin')
    )
  );

-- Create sensors table
CREATE TABLE public.sensors (
  id TEXT PRIMARY KEY,
  farm_id INTEGER NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  last_update TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on sensors
ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sensors" ON public.sensors
  FOR SELECT TO authenticated USING (true);

-- Create readings table
CREATE TABLE public.readings (
  id SERIAL PRIMARY KEY,
  sensor_id TEXT NOT NULL REFERENCES public.sensors(id) ON DELETE CASCADE,
  flow_rate DECIMAL(10,2) NOT NULL,
  pressure DECIMAL(10,2) NOT NULL,
  conductivity DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'Normal',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on readings
ALTER TABLE public.readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view readings" ON public.readings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Farmers and admins can insert readings" ON public.readings
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('Farmer', 'Admin')
    )
  );

-- Create alerts table
CREATE TABLE public.alerts (
  id SERIAL PRIMARY KEY,
  farm_id INTEGER NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  type alert_type NOT NULL,
  severity severity_level NOT NULL,
  message TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on alerts
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view alerts" ON public.alerts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Officers and admins can update alerts" ON public.alerts
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('Officer', 'Admin')
    )
  );

-- Create schedules table
CREATE TABLE public.schedules (
  id SERIAL PRIMARY KEY,
  farm_id INTEGER NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL,
  fertilizer_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on schedules
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view schedules" ON public.schedules
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Farmers and officers can insert schedules" ON public.schedules
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('Farmer', 'Officer', 'Admin')
    )
  );

-- Create reports table
CREATE TABLE public.reports (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT,
  description TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view reports" ON public.reports
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Researchers and admins can insert reports" ON public.reports
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('Researcher', 'Admin')
    )
  );

-- Create contact queries table
CREATE TABLE public.contact_queries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on contact queries
ALTER TABLE public.contact_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact queries" ON public.contact_queries
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can view contact queries" ON public.contact_queries
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Insert demo farms
INSERT INTO public.farms (name, location, crop_type) VALUES
  ('Farm A', 'Pune District', 'Tomatoes'),
  ('Farm B', 'Nashik District', 'Grapes'),
  ('Farm C', 'Ahmednagar District', 'Cotton'),
  ('Farm D', 'Solapur District', 'Sugarcane');

-- Insert demo sensors
INSERT INTO public.sensors (id, farm_id, type, serial_number) VALUES
  ('S001', 1, 'Flow Sensor', 'FS-2024-001'),
  ('S002', 1, 'Pressure Sensor', 'PS-2024-001'),
  ('S003', 2, 'Flow Sensor', 'FS-2024-002'),
  ('S004', 2, 'Pressure Sensor', 'PS-2024-002'),
  ('S005', 3, 'Flow Sensor', 'FS-2024-003'),
  ('S006', 3, 'Conductivity Sensor', 'CS-2024-001'),
  ('S007', 4, 'Flow Sensor', 'FS-2024-004'),
  ('S008', 4, 'Pressure Sensor', 'PS-2024-003');

-- Insert demo readings
INSERT INTO public.readings (sensor_id, flow_rate, pressure, conductivity, status) VALUES
  ('S001', 15.0, 1.2, 3.1, 'Normal'),
  ('S002', 9.0, 0.8, 2.9, '⚠️ Low Flow'),
  ('S003', 12.0, 1.0, 3.2, 'Normal'),
  ('S004', 14.0, 1.1, 3.0, 'Normal'),
  ('S005', 8.5, 0.7, 2.8, '⚠️ Low Flow'),
  ('S006', 13.5, 1.15, 3.15, 'Normal'),
  ('S007', 16.0, 1.3, 3.3, 'Normal'),
  ('S008', 11.0, 0.95, 3.05, 'Normal');

-- Insert demo alerts
INSERT INTO public.alerts (farm_id, type, severity, message, resolved) VALUES
  (1, 'Clogging', 'High', 'Flow rate below 70% threshold detected', false),
  (2, 'Pressure Drop', 'Medium', 'Slight pressure drop detected in system', true),
  (3, 'Low Flow', 'High', 'Significant flow reduction detected', false),
  (4, 'System Error', 'Low', 'Minor sensor calibration issue', true);

-- Insert demo schedules
INSERT INTO public.schedules (farm_id, start_time, duration, fertilizer_amount) VALUES
  (1, NOW() + INTERVAL '1 day', 120, 25.5),
  (2, NOW() + INTERVAL '2 days', 90, 18.0),
  (3, NOW() + INTERVAL '1 day', 150, 30.0),
  (4, NOW() + INTERVAL '3 days', 180, 35.5);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'Farmer')
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
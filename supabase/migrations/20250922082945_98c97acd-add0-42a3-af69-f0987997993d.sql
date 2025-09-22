-- Create enum types
CREATE TYPE public.scan_confidence AS ENUM ('high', 'medium', 'low');
CREATE TYPE public.portion_preset AS ENUM ('half', 'normal', 'large');
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'viewer');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'viewer',
  canteen_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create kanpla_items table for menu data
CREATE TABLE public.kanpla_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kanpla_item_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  ingredients TEXT[],
  allergens TEXT[],
  protein_per_100g DECIMAL(5,2),
  carbs_per_100g DECIMAL(5,2),
  fat_per_100g DECIMAL(5,2),
  calories_per_100g DECIMAL(6,2),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_menus table
CREATE TABLE public.daily_menus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  canteen_location TEXT NOT NULL,
  kanpla_item_id UUID NOT NULL REFERENCES public.kanpla_items(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, canteen_location, kanpla_item_id)
);

-- Create scans table for scan history
CREATE TABLE public.scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  kanpla_item_id UUID NOT NULL REFERENCES public.kanpla_items(id),
  photo_url TEXT,
  confidence scan_confidence NOT NULL,
  portion_preset portion_preset NOT NULL DEFAULT 'normal',
  estimated_grams DECIMAL(6,2) NOT NULL,
  scaled_protein DECIMAL(5,2) NOT NULL,
  scaled_carbs DECIMAL(5,2) NOT NULL,
  scaled_fat DECIMAL(5,2) NOT NULL,
  scaled_calories DECIMAL(6,2) NOT NULL,
  canteen_location TEXT NOT NULL,
  scan_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  manual_override BOOLEAN DEFAULT false,
  alternatives JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dish_notes table for shared admin notes
CREATE TABLE public.dish_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kanpla_item_id UUID NOT NULL REFERENCES public.kanpla_items(id),
  note TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage buckets for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('scan-photos', 'scan-photos', false);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanpla_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dish_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for kanpla_items (readable by authenticated users)
CREATE POLICY "Authenticated users can view kanpla items" ON public.kanpla_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage kanpla items" ON public.kanpla_items
  FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
  ));

-- Create RLS policies for daily_menus
CREATE POLICY "Authenticated users can view daily menus" ON public.daily_menus
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage daily menus" ON public.daily_menus
  FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
  ));

-- Create RLS policies for scans
CREATE POLICY "Users can view scans from their location" ON public.scans
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (canteen_location = scans.canteen_location OR role = 'admin')
  ));

CREATE POLICY "Authenticated users can create scans" ON public.scans
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scans" ON public.scans
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

-- Create RLS policies for dish_notes
CREATE POLICY "Authenticated users can view dish notes" ON public.dish_notes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create dish notes" ON public.dish_notes
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own dish notes" ON public.dish_notes
  FOR UPDATE TO authenticated 
  USING (auth.uid() = created_by);

-- Create storage policies for scan photos
CREATE POLICY "Authenticated users can upload scan photos" ON storage.objects
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'scan-photos');

CREATE POLICY "Users can view scan photos from their scans" ON storage.objects
  FOR SELECT TO authenticated 
  USING (
    bucket_id = 'scan-photos' AND 
    EXISTS (
      SELECT 1 FROM public.scans 
      WHERE scans.photo_url = storage.objects.name 
      AND scans.user_id = auth.uid()
    )
  );

-- Create auto-update triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kanpla_items_updated_at
  BEFORE UPDATE ON public.kanpla_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dish_notes_updated_at
  BEFORE UPDATE ON public.dish_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_scans_user_id ON public.scans(user_id);
CREATE INDEX idx_scans_timestamp ON public.scans(scan_timestamp);
CREATE INDEX idx_scans_location ON public.scans(canteen_location);
CREATE INDEX idx_daily_menus_date_location ON public.daily_menus(date, canteen_location);
CREATE INDEX idx_kanpla_items_active ON public.kanpla_items(is_active);

-- Insert sample data
INSERT INTO public.kanpla_items (kanpla_item_id, name, category, ingredients, allergens, protein_per_100g, carbs_per_100g, fat_per_100g, calories_per_100g, image_url) VALUES
('salmon_quinoa_001', 'Grilled Salmon with Quinoa', 'Main Course', ARRAY['salmon', 'quinoa', 'vegetables'], ARRAY['fish'], 32.0, 28.0, 14.0, 340.0, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&crop=center&auto=format&q=80'),
('mediterranean_bowl_001', 'Mediterranean Bowl', 'Healthy Choice', ARRAY['chickpeas', 'vegetables', 'olive oil', 'nuts'], ARRAY['nuts'], 18.0, 42.0, 12.0, 320.0, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center&auto=format&q=80'),
('chicken_tikka_001', 'Chicken Tikka Masala', 'International', ARRAY['chicken', 'rice', 'cream', 'spices'], ARRAY['dairy'], 28.0, 35.0, 16.0, 380.0, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center&auto=format&q=80'),
('buddha_bowl_001', 'Vegan Buddha Bowl', 'Plant-Based', ARRAY['quinoa', 'vegetables', 'tahini', 'legumes'], ARRAY[], 15.0, 38.0, 10.0, 280.0, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center&auto=format&q=80');

-- Insert today's menu
INSERT INTO public.daily_menus (date, canteen_location, kanpla_item_id)
SELECT 
  CURRENT_DATE,
  'Canteen North Wing',
  ki.id
FROM public.kanpla_items ki
WHERE ki.kanpla_item_id IN ('salmon_quinoa_001', 'mediterranean_bowl_001', 'chicken_tikka_001', 'buddha_bowl_001');
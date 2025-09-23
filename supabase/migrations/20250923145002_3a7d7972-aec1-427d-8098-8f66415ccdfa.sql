-- Create dietary preferences table
CREATE TABLE public.dietary_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  preference_type TEXT NOT NULL,
  preference_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dietary_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for dietary preferences
CREATE POLICY "Users can view their own dietary preferences" 
ON public.dietary_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dietary preferences" 
ON public.dietary_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dietary preferences" 
ON public.dietary_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dietary preferences" 
ON public.dietary_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create chef's choice table
CREATE TABLE public.chefs_choice (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kanpla_item_id TEXT NOT NULL,
  canteen_location TEXT NOT NULL,
  featured_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  chef_notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chefs_choice ENABLE ROW LEVEL SECURITY;

-- Create policies for chef's choice
CREATE POLICY "Everyone can view chef's choice" 
ON public.chefs_choice 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage chef's choice" 
ON public.chefs_choice 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('admin', 'manager')
));

-- Create meal satisfaction ratings table
CREATE TABLE public.meal_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kanpla_item_id TEXT NOT NULL,
  scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  taste_rating INTEGER CHECK (taste_rating >= 1 AND taste_rating <= 5),
  portion_rating INTEGER CHECK (portion_rating >= 1 AND portion_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  feedback TEXT,
  would_recommend BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, scan_id)
);

-- Enable RLS
ALTER TABLE public.meal_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for meal ratings
CREATE POLICY "Users can view their own ratings" 
ON public.meal_ratings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ratings" 
ON public.meal_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.meal_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create daily recommendations view
CREATE OR REPLACE VIEW public.daily_recommendations AS
SELECT DISTINCT
  k.id,
  k.name,
  k.category,
  k.calories_per_100g,
  k.protein_per_100g,
  k.carbs_per_100g,
  k.fat_per_100g,
  k.allergens,
  COALESCE(AVG(mr.rating), 0) as avg_rating,
  COUNT(mr.rating) as rating_count,
  CASE 
    WHEN cc.id IS NOT NULL THEN true 
    ELSE false 
  END as is_chefs_choice
FROM kanpla_items k
LEFT JOIN meal_ratings mr ON k.kanpla_item_id = mr.kanpla_item_id
LEFT JOIN chefs_choice cc ON k.kanpla_item_id = cc.kanpla_item_id 
  AND cc.featured_date = CURRENT_DATE
WHERE k.is_active = true
GROUP BY k.id, k.name, k.category, k.calories_per_100g, k.protein_per_100g, 
         k.carbs_per_100g, k.fat_per_100g, k.allergens, cc.id
ORDER BY is_chefs_choice DESC, avg_rating DESC, k.name;

-- Create trigger for updating timestamps
CREATE TRIGGER update_dietary_preferences_updated_at
BEFORE UPDATE ON public.dietary_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chefs_choice_updated_at
BEFORE UPDATE ON public.chefs_choice
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
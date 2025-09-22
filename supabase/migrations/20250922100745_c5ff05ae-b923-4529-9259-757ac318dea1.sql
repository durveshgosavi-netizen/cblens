-- Create table for weekly menus from Excel uploads
CREATE TABLE public.weekly_menus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start_date DATE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  day_name TEXT NOT NULL,
  day_date DATE NOT NULL,
  hot_dish TEXT,
  green_dish TEXT,
  salad_1 TEXT,
  salad_2 TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  upload_filename TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(day_date, hot_dish),
  UNIQUE(day_date, green_dish)
);

-- Enable RLS
ALTER TABLE public.weekly_menus ENABLE ROW LEVEL SECURITY;

-- RLS policies for weekly menus
CREATE POLICY "Authenticated users can view weekly menus" 
ON public.weekly_menus 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage weekly menus" 
ON public.weekly_menus 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('admin', 'manager')
));

-- Create trigger for timestamps
CREATE TRIGGER update_weekly_menus_updated_at
BEFORE UPDATE ON public.weekly_menus
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create user goals table
CREATE TABLE public.user_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('calories', 'protein', 'carbs', 'fat', 'water', 'weight', 'meals_per_day')),
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  time_period TEXT NOT NULL CHECK (time_period IN ('daily', 'weekly', 'monthly')),
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for user goals
CREATE POLICY "Users can view their own goals" 
ON public.user_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
ON public.user_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.user_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.user_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('nutrition', 'consistency', 'exploration', 'social', 'health')),
  criteria JSONB NOT NULL,
  points INTEGER DEFAULT 10,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, category, criteria, points, rarity) VALUES
('First Scan', 'Complete your first meal scan', 'camera', 'nutrition', '{"scans_count": 1}', 10, 'common'),
('Protein Pioneer', 'Reach your daily protein goal', 'dumbbell', 'nutrition', '{"daily_protein_goal": true}', 15, 'common'),
('Calorie Counter', 'Track 7 days of meals in a row', 'target', 'consistency', '{"consecutive_days": 7}', 25, 'rare'),
('Nutrition Explorer', 'Try 10 different dishes', 'compass', 'exploration', '{"unique_dishes": 10}', 20, 'rare'),
('Balanced Lifestyle', 'Maintain balanced macros for a week', 'balance-scale', 'health', '{"balanced_week": true}', 30, 'epic'),
('Streak Master', 'Track meals for 30 consecutive days', 'flame', 'consistency', '{"consecutive_days": 30}', 50, 'legendary'),
('Chef Favorite', 'Rate 5 chef choice dishes', 'chef-hat', 'social', '{"chefs_choice_ratings": 5}', 20, 'rare'),
('Feedback Champion', 'Leave feedback on 20 meals', 'message-circle', 'social', '{"meal_feedbacks": 20}', 35, 'epic');

-- Create user achievements table (junction table)
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress JSONB,
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for user achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can earn achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create nutrition streaks table
CREATE TABLE public.nutrition_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  streak_type TEXT NOT NULL CHECK (streak_type IN ('daily_tracking', 'goal_achievement', 'balanced_meals', 'hydration')),
  current_count INTEGER DEFAULT 0,
  best_count INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

-- Enable RLS
ALTER TABLE public.nutrition_streaks ENABLE ROW LEVEL SECURITY;

-- Create policies for nutrition streaks
CREATE POLICY "Users can view their own streaks" 
ON public.nutrition_streaks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own streaks" 
ON public.nutrition_streaks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" 
ON public.nutrition_streaks 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create nutrition insights table for trend analysis
CREATE TABLE public.nutrition_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('trend', 'deficiency', 'recommendation', 'prediction')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  is_read BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nutrition_insights ENABLE ROW LEVEL SECURITY;

-- Create policies for nutrition insights
CREATE POLICY "Users can view their own insights" 
ON public.nutrition_insights 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create insights" 
ON public.nutrition_insights 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own insights" 
ON public.nutrition_insights 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_user_goals_updated_at
BEFORE UPDATE ON public.user_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nutrition_streaks_updated_at
BEFORE UPDATE ON public.nutrition_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
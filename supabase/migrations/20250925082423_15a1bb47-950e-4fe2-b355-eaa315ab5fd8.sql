-- Fix security issue by recreating the daily_recommendations view without SECURITY DEFINER
-- and enabling RLS on the achievements table which was missing

-- Drop the existing view
DROP VIEW IF EXISTS public.daily_recommendations;

-- Recreate the view without SECURITY DEFINER (it will use SECURITY INVOKER by default)
CREATE VIEW public.daily_recommendations AS
SELECT DISTINCT 
    k.id,
    k.name,
    k.category,
    k.calories_per_100g,
    k.protein_per_100g,
    k.carbs_per_100g,
    k.fat_per_100g,
    k.allergens,
    COALESCE(avg(mr.rating), 0::numeric) AS avg_rating,
    count(mr.rating) AS rating_count,
    CASE
        WHEN cc.id IS NOT NULL THEN true
        ELSE false
    END AS is_chefs_choice
FROM kanpla_items k
LEFT JOIN meal_ratings mr ON k.kanpla_item_id = mr.kanpla_item_id
LEFT JOIN chefs_choice cc ON k.kanpla_item_id = cc.kanpla_item_id 
    AND cc.featured_date = CURRENT_DATE
WHERE k.is_active = true
GROUP BY k.id, k.name, k.category, k.calories_per_100g, k.protein_per_100g, 
         k.carbs_per_100g, k.fat_per_100g, k.allergens, cc.id
ORDER BY 
    CASE
        WHEN cc.id IS NOT NULL THEN true
        ELSE false
    END DESC, 
    COALESCE(avg(mr.rating), 0::numeric) DESC, 
    k.name;

-- Enable RLS on achievements table (fixing the other security issue)
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read achievements
CREATE POLICY "Everyone can view achievements" 
ON public.achievements 
FOR SELECT 
USING (true);
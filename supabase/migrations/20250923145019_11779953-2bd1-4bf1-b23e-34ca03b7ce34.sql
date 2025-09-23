-- Drop the problematic view and recreate without security definer
DROP VIEW IF EXISTS public.daily_recommendations;

-- Create daily recommendations view without security definer (safer approach)
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
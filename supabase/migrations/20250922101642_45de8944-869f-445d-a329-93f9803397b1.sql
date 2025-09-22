-- Insert Danish menu items into kanpla_items table with estimated nutrition
INSERT INTO public.kanpla_items (kanpla_item_id, name, category, protein_per_100g, carbs_per_100g, fat_per_100g, calories_per_100g, allergens) VALUES
('danish-fransk-logsuppe', 'Fransk løgsuppe m. gratineret ostebrød', 'Main Course', 8, 25, 12, 220, ARRAY['dairy', 'gluten']),
('danish-chili-con-carne', 'Chili con carne', 'Main Course', 22, 15, 8, 210, ARRAY[]::text[]),
('danish-kylling-cheddar', 'Cheddar/bacon marineret kylling bryst', 'Main Course', 28, 12, 18, 290, ARRAY['dairy']),
('danish-dagens-fangst', 'Dagens fangst', 'Main Course', 25, 8, 10, 200, ARRAY['fish']),
('danish-rullesteg', 'Rullesteg m. svesker & æbler', 'Main Course', 20, 20, 15, 280, ARRAY[]::text[]),
('danish-chili-sin-carne', 'Chili sin carne', 'Vegetarian', 12, 30, 6, 200, ARRAY[]::text[]),
('danish-groentsagsbof', 'Paneret grøntsagsbøf', 'Vegetarian', 15, 25, 8, 220, ARRAY['gluten']),
('danish-porre-taerte', 'Porre tærte', 'Vegetarian', 10, 22, 14, 240, ARRAY['dairy', 'eggs']),
('danish-broccoli-nuggets', 'Broccoli nuggets', 'Vegetarian', 8, 18, 7, 150, ARRAY['gluten']),
('danish-pastasalat', 'Pastasalat m. karry, ærter, majs, cherrytomat', 'Salad', 6, 35, 4, 190, ARRAY['gluten']),
('danish-bonnesalat', 'Bønnesalat, spidskål, bønnespirer & vinaigrette', 'Salad', 8, 15, 3, 110, ARRAY[]::text[]),
('danish-spinat-feta', 'Bagbede salat, spinat, feta & græskarkerner', 'Salad', 12, 8, 15, 190, ARRAY['dairy', 'nuts']),
('danish-caesar-salat', 'Caesar salat', 'Salad', 8, 10, 18, 220, ARRAY['dairy', 'fish', 'eggs'])
ON CONFLICT (kanpla_item_id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  protein_per_100g = EXCLUDED.protein_per_100g,
  carbs_per_100g = EXCLUDED.carbs_per_100g,
  fat_per_100g = EXCLUDED.fat_per_100g,
  calories_per_100g = EXCLUDED.calories_per_100g,
  allergens = EXCLUDED.allergens;
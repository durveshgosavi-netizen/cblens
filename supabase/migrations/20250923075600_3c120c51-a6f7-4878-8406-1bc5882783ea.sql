-- First, let's fix the scans table to handle both kanpla items and menu items
ALTER TABLE scans ALTER COLUMN kanpla_item_id TYPE text;

-- Update the user's location so they can see their scans
UPDATE profiles 
SET canteen_location = 'Main Campus' 
WHERE user_id = '40210ca4-8b2b-47fa-9a48-6c7468582463';

-- Add an index on kanpla_item_id for better performance
CREATE INDEX IF NOT EXISTS idx_scans_kanpla_item_id ON scans(kanpla_item_id);
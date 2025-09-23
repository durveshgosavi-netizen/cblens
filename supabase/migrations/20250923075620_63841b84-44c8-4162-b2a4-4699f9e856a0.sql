-- First, drop the foreign key constraint that's preventing the change
ALTER TABLE scans DROP CONSTRAINT IF EXISTS scans_kanpla_item_id_fkey;

-- Now change the column type to text to handle both UUIDs and menu item IDs
ALTER TABLE scans ALTER COLUMN kanpla_item_id TYPE text;

-- Update the user's location so they can see their scans  
UPDATE profiles 
SET canteen_location = 'Main Campus' 
WHERE user_id = '40210ca4-8b2b-47fa-9a48-6c7468582463';

-- Add an index on kanpla_item_id for better performance
CREATE INDEX IF NOT EXISTS idx_scans_kanpla_item_id ON scans(kanpla_item_id);
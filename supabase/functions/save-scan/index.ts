import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SaveScanRequest {
  kanpla_item_id: string;
  confidence: 'high' | 'medium' | 'low';
  portion_preset: 'half' | 'normal' | 'large';
  estimated_grams: number;
  photo_base64?: string | null;
  photo_url?: string | null;
  notes?: string | null;
  canteen_location: string;
  alternatives?: any[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const scanData: SaveScanRequest = await req.json();

    // Get actual dish nutritional data from kanpla_items table
    const { data: dishData, error: dishError } = await supabase
      .from('kanpla_items')
      .select('calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g')
      .eq('kanpla_item_id', scanData.kanpla_item_id)
      .single();

    // Fallback to mock data if dish not found
    const dishNutrition = dishData || {
      calories_per_100g: 150,
      protein_per_100g: 20,
      carbs_per_100g: 25,
      fat_per_100g: 8
    };

    // Calculate scaled nutrition based on portion and estimated grams
    const portionMultiplier = scanData.portion_preset === 'half' ? 0.5 : 
                              scanData.portion_preset === 'large' ? 1.5 : 1;
    const gramsRatio = (scanData.estimated_grams * portionMultiplier) / 100;

    const scaledNutrition = {
      scaled_calories: Math.round(Number(dishNutrition.calories_per_100g || 150) * gramsRatio),
      scaled_protein: Math.round(Number(dishNutrition.protein_per_100g || 20) * gramsRatio),
      scaled_carbs: Math.round(Number(dishNutrition.carbs_per_100g || 25) * gramsRatio),
      scaled_fat: Math.round(Number(dishNutrition.fat_per_100g || 8) * gramsRatio)
    };

    // Handle photo upload if provided
    let photoUrl = scanData.photo_url;
    if (scanData.photo_base64) {
      const fileName = `scan-${user.id}-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('scan-photos')
        .upload(fileName, Buffer.from(scanData.photo_base64, 'base64'), {
          contentType: 'image/jpeg',
        });

      if (!uploadError && uploadData) {
        photoUrl = uploadData.path;
      }
    }

    // Get or create the kanpla_item UUID from the string ID
    let kanplaItemUuid = scanData.kanpla_item_id;
    
    // If it's a string ID, try to find the corresponding UUID
    if (!scanData.kanpla_item_id.includes('-')) {
      const { data: existingItem } = await supabase
        .from('kanpla_items')
        .select('id')
        .eq('kanpla_item_id', scanData.kanpla_item_id)
        .single();
      
      if (existingItem) {
        kanplaItemUuid = existingItem.id;
      } else {
        // Create a new kanpla_item entry if it doesn't exist
        const { data: newItem, error: createError } = await supabase
          .from('kanpla_items')
          .insert({
            kanpla_item_id: scanData.kanpla_item_id,
            name: `Danish Dish (${scanData.kanpla_item_id})`,
            category: 'Danish Cuisine',
            calories_per_100g: dishNutrition.calories_per_100g,
            protein_per_100g: dishNutrition.protein_per_100g,
            carbs_per_100g: dishNutrition.carbs_per_100g,
            fat_per_100g: dishNutrition.fat_per_100g
          })
          .select('id')
          .single();
        
        if (!createError && newItem) {
          kanplaItemUuid = newItem.id;
        } else {
          kanplaItemUuid = crypto.randomUUID();
        }
      }
    }

    // Insert scan record
    const { data: scanRecord, error: insertError } = await supabase
      .from('scans')
      .insert({
        user_id: user.id,
        kanpla_item_id: kanplaItemUuid,
        confidence: scanData.confidence,
        portion_preset: scanData.portion_preset,
        estimated_grams: Math.round(scanData.estimated_grams * portionMultiplier),
        photo_url: photoUrl,
        notes: scanData.notes,
        canteen_location: scanData.canteen_location,
        alternatives: scanData.alternatives || [],
        ...scaledNutrition
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        scanId: scanRecord.id,
        nutrition: scaledNutrition
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Save scan error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to save scan' 
      }),
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});
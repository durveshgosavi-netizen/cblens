import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SaveScanRequest {
  kanpla_item_id: string;
  confidence: 'high' | 'medium' | 'low';
  portion_preset: 'half' | 'normal' | 'large';
  estimated_grams: number;
  canteen_location: string;
  notes?: string;
  alternatives?: any[];
  photo_base64?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const scanData: SaveScanRequest = await req.json();
    console.log('Saving scan for user:', user.id, 'dish:', scanData.kanpla_item_id);

    // Get dish nutritional data
    const { data: dish, error: dishError } = await supabase
      .from('kanpla_items')
      .select('protein_per_100g, carbs_per_100g, fat_per_100g, calories_per_100g')
      .eq('id', scanData.kanpla_item_id)
      .single();

    if (dishError || !dish) {
      return new Response(
        JSON.stringify({ error: 'Dish not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate scaled nutrition based on portion
    const portionMultiplier = scanData.portion_preset === 'half' ? 0.5 : 
                            scanData.portion_preset === 'large' ? 1.5 : 1.0;
    
    const gramsRatio = (scanData.estimated_grams * portionMultiplier) / 100;
    
    const scaledNutrition = {
      scaled_protein: Number((dish.protein_per_100g * gramsRatio).toFixed(2)),
      scaled_carbs: Number((dish.carbs_per_100g * gramsRatio).toFixed(2)),
      scaled_fat: Number((dish.fat_per_100g * gramsRatio).toFixed(2)),
      scaled_calories: Number((dish.calories_per_100g * gramsRatio).toFixed(2)),
    };

    let photoUrl = null;

    // Upload photo if provided
    if (scanData.photo_base64) {
      try {
        const photoBuffer = Uint8Array.from(atob(scanData.photo_base64), c => c.charCodeAt(0));
        const fileName = `scan-${user.id}-${Date.now()}.jpg`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('scan-photos')
          .upload(fileName, photoBuffer, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
        } else {
          photoUrl = fileName;
        }
      } catch (uploadError) {
        console.error('Photo processing error:', uploadError);
      }
    }

    // Save scan record
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .insert({
        user_id: user.id,
        kanpla_item_id: scanData.kanpla_item_id,
        confidence: scanData.confidence,
        portion_preset: scanData.portion_preset,
        estimated_grams: scanData.estimated_grams,
        canteen_location: scanData.canteen_location,
        photo_url: photoUrl,
        notes: scanData.notes,
        alternatives: scanData.alternatives,
        ...scaledNutrition,
      })
      .select()
      .single();

    if (scanError) {
      console.error('Error saving scan:', scanError);
      return new Response(
        JSON.stringify({ error: 'Failed to save scan' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scan saved successfully:', scan.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        scan_id: scan.id,
        nutrition: scaledNutrition
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in save-scan function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
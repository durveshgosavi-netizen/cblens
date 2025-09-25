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
    console.log('Received scan data:', {
      kanpla_item_id: scanData.kanpla_item_id,
      confidence: scanData.confidence,
      portion_preset: scanData.portion_preset
    });

    // Handle menu items vs kanpla items
    let dishNutrition;
    let kanplaItemUuid = scanData.kanpla_item_id;

    if (scanData.kanpla_item_id.startsWith('menu-')) {
      // This is a menu item, extract nutrition from the request data
      const selectedDish = scanData.alternatives?.find(alt => alt.id === scanData.kanpla_item_id) || {};
      dishNutrition = {
        calories_per_100g: selectedDish.calories || 200,
        protein_per_100g: selectedDish.protein || 15,
        carbs_per_100g: selectedDish.carbs || 20,
        fat_per_100g: selectedDish.fat || 8
      };
      
      // For menu items, we'll use the string ID directly
      kanplaItemUuid = scanData.kanpla_item_id;
    } else {
      // Get actual dish nutritional data from kanpla_items table
      const { data: dishData, error: dishError } = await supabase
        .from('kanpla_items')
        .select('id, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g')
        .eq('kanpla_item_id', scanData.kanpla_item_id)
        .single();

      dishNutrition = dishData || {
        calories_per_100g: 150,
        protein_per_100g: 20,
        carbs_per_100g: 25,
        fat_per_100g: 8
      };

      // Use the dish UUID if we found the dish, otherwise use the string ID
      kanplaItemUuid = dishData?.id || scanData.kanpla_item_id;
    }

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
      try {
        const fileName = `scan-${user.id}-${Date.now()}.jpg`;
        
        // Convert base64 to Uint8Array for Deno
        const binaryString = atob(scanData.photo_base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('scan-photos')
          .upload(fileName, bytes, {
            contentType: 'image/jpeg',
          });

        if (!uploadError && uploadData) {
          photoUrl = uploadData.path;
        } else {
          console.error('Photo upload error:', uploadError);
        }
      } catch (uploadError) {
        console.error('Photo processing error:', uploadError);
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

    // Trigger achievements processing asynchronously
    try {
      await supabase.functions.invoke('process-achievements', {
        body: { user_id: user.id }
      });
    } catch (achievementError) {
      console.error('Achievement processing error:', achievementError);
      // Don't fail the scan save if achievements fail
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
        error: (error as Error).message || 'Failed to save scan' 
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
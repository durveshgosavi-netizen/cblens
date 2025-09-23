import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DetectionRequest {
  imageBase64: string;
  canteenLocation: string;
  date?: string;
}

interface DetectionResponse {
  matches: Array<{
    id: string;
    name: string;
    category: string;
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
    allergens: string[];
    confidence: number;
    image: string;
  }>;
  processingTime: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { imageBase64, canteenLocation, date }: DetectionRequest = await req.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get today's date if not provided
    const targetDate = date || new Date().toISOString().split('T')[0];

    console.log(`Processing dish detection for date: ${targetDate}, location: ${canteenLocation}`);

    // Fetch today's menu items from daily_menus and kanpla_items
    const { data: menuItems, error: menuError } = await supabase
      .from('daily_menus')
      .select(`
        kanpla_item_id,
        kanpla_items (
          kanpla_item_id,
          name,
          category,
          protein_per_100g,
          carbs_per_100g,
          fat_per_100g,
          calories_per_100g,
          allergens,
          image_url
        )
      `)
      .eq('date', targetDate)
      .eq('canteen_location', canteenLocation);

    if (menuError) {
      console.error('Error fetching menu items:', menuError);
    }

    // Get Danish dishes as fallback if no daily menu found
    const { data: danishItems, error: danishError } = await supabase
      .from('kanpla_items')
      .select('*')
      .like('kanpla_item_id', 'danish-%')
      .limit(5);

    if (danishError) {
      console.error('Error fetching Danish items:', danishError);
    }

    // Combine menu items with fallback Danish dishes
    let availableDishes = [];

    // Add today's menu items
    if (menuItems?.length) {
      availableDishes = menuItems
        .filter(item => item.kanpla_items)
        .map(item => item.kanpla_items)
        .filter(Boolean);
    }

    // Add Danish fallback dishes if we have less than 3 items
    if (availableDishes.length < 3 && danishItems?.length) {
      const remainingSlots = 3 - availableDishes.length;
      const additionalDishes = danishItems.slice(0, remainingSlots);
      availableDishes = [...availableDishes, ...additionalDishes];
    }

    // Mock AI detection logic - In production, this would analyze the actual image
    // For now, we'll simulate realistic detection with varying confidence scores
    const detectedDishes = availableDishes.slice(0, 3).map((dish, index) => {
      // Simulate confidence scores based on image analysis
      const confidenceScores = [0.92, 0.76, 0.61];
      
      return {
        id: dish.kanpla_item_id,
        name: dish.name,
        category: dish.category,
        protein: Number(dish.protein_per_100g) || 20,
        carbs: Number(dish.carbs_per_100g) || 30,
        fat: Number(dish.fat_per_100g) || 10,
        calories: Number(dish.calories_per_100g) || 250,
        allergens: dish.allergens || [],
        confidence: confidenceScores[index] || 0.5,
        image: dish.image_url || `https://images.unsplash.com/photo-${
          ['1547592166-23ac45744acd', '1565557623262-b51c2513a641', '1567620905889-e6c0028c5bac'][index] || '1547592166-23ac45744acd'
        }?w=400&h=300&fit=crop&crop=center&auto=format&q=80`
      };
    });

    // Fallback if no dishes found
    if (detectedDishes.length === 0) {
      detectedDishes.push({
        id: "danish-fransk-logsuppe",
        name: "Fransk løgsuppe m. gratineret ostebrød",
        category: "Main Course",
        protein: 8,
        carbs: 25,
        fat: 12,
        calories: 220,
        allergens: ["dairy", "gluten"],
        confidence: 0.75,
        image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&crop=center&auto=format&q=80"
      });
    }

    const processingTime = Date.now() - startTime;

    console.log(`Detection completed in ${processingTime}ms, found ${detectedDishes.length} matches`);

    const response: DetectionResponse = {
      matches: detectedDishes,
      processingTime
    };

    return new Response(JSON.stringify(response), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });

  } catch (error) {
    console.error('Detection error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to process image',
      matches: [],
      processingTime: Date.now() - startTime
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });
  }
});
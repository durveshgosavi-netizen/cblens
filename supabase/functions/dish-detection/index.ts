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

    // Fetch today's menu from weekly_menus table
    const { data: weeklyMenu, error: menuError } = await supabase
      .from('weekly_menus')
      .select('*')
      .eq('day_date', targetDate);

    if (menuError) {
      console.error('Error fetching weekly menu:', menuError);
    }

    console.log(`Found weekly menu:`, weeklyMenu);

    // Convert weekly menu dishes to detection format
    let availableDishes = [];

    if (weeklyMenu?.length > 0) {
      const menu = weeklyMenu[0];
      const dishes = [];
      
      // Add hot dish
      if (menu.hot_dish) {
        dishes.push({
          kanpla_item_id: `menu-hot-${targetDate}`,
          name: menu.hot_dish,
          category: "Main Course",
          protein_per_100g: 22,
          carbs_per_100g: 15,
          fat_per_100g: 8,
          calories_per_100g: 210,
          allergens: [],
          image_url: null
        });
      }

      // Add green dish
      if (menu.green_dish) {
        dishes.push({
          kanpla_item_id: `menu-green-${targetDate}`,
          name: menu.green_dish,
          category: "Vegetarian",
          protein_per_100g: 15,
          carbs_per_100g: 20,
          fat_per_100g: 6,
          calories_per_100g: 180,
          allergens: [],
          image_url: null
        });
      }

      // Add salads
      if (menu.salad_1) {
        dishes.push({
          kanpla_item_id: `menu-salad1-${targetDate}`,
          name: menu.salad_1,
          category: "Salad",
          protein_per_100g: 8,
          carbs_per_100g: 10,
          fat_per_100g: 12,
          calories_per_100g: 150,
          allergens: menu.salad_1.toLowerCase().includes('feta') ? ['dairy'] : [],
          image_url: null
        });
      }

      if (menu.salad_2) {
        dishes.push({
          kanpla_item_id: `menu-salad2-${targetDate}`,
          name: menu.salad_2,
          category: "Salad",
          protein_per_100g: 10,
          carbs_per_100g: 8,
          fat_per_100g: 15,
          calories_per_100g: 180,
          allergens: menu.salad_2.toLowerCase().includes('caesar') ? ['dairy', 'eggs'] : [],
          image_url: null
        });
      }

      availableDishes = dishes;
    }

    console.log(`Available dishes for detection:`, availableDishes.map(d => d.name));

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
        id: "fallback-dish",
        name: "No menu items found for today",
        category: "Unknown",
        protein: 15,
        carbs: 20,
        fat: 8,
        calories: 200,
        allergens: [],
        confidence: 0.1,
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
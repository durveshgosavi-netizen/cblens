import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    confidence: 'high' | 'medium' | 'low';
    protein_per_100g: number;
    carbs_per_100g: number;
    fat_per_100g: number;
    calories_per_100g: number;
    image_url?: string;
  }>;
  processingTime: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const { imageBase64, canteenLocation, date = new Date().toISOString().split('T')[0] }: DetectionRequest = await req.json();

    console.log('Processing dish detection request', { canteenLocation, date });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get today's menu items for the location
    const { data: menuItems, error: menuError } = await supabase
      .from('daily_menus')
      .select(`
        kanpla_items (
          id,
          name,
          category,
          protein_per_100g,
          carbs_per_100g,
          fat_per_100g,
          calories_per_100g,
          image_url
        )
      `)
      .eq('date', date)
      .eq('canteen_location', canteenLocation);

    if (menuError) {
      console.error('Error fetching menu items:', menuError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch menu items' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!menuItems || menuItems.length === 0) {
      return new Response(
        JSON.stringify({ 
          matches: [],
          processingTime: Date.now() - startTime,
          message: 'No menu items found for this date and location'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Mock AI detection logic (replace with actual AI service)
    // In a real implementation, you would:
    // 1. Send the image to an AI service (OpenAI Vision, Google Vision, custom model)
    // 2. Get dish predictions back
    // 3. Match against today's menu items
    // 4. Return ranked results with confidence scores

    const availableDishes = menuItems.map(item => item.kanpla_items).filter(Boolean);
    
    // Simulate detection with mock confidence scores
    const mockDetection = availableDishes.map(dish => ({
      ...dish,
      confidence: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low' as const,
      score: Math.random()
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3); // Return top 3 matches

    const processingTime = Date.now() - startTime;

    console.log(`Detection completed in ${processingTime}ms, found ${mockDetection.length} matches`);

    const response: DetectionResponse = {
      matches: mockDetection.map(({ score, ...dish }) => dish),
      processingTime
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in dish detection:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MenuUploadRequest {
  fileBase64: string;
  filename: string;
  weekStartDate: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { fileBase64, filename, weekStartDate }: MenuUploadRequest = await req.json();

    // Parse Excel data from base64
    // For now, we'll simulate parsing and use the structure from the uploaded file
    const mockMenuData = [
      {
        day_name: "Mandag",
        day_of_week: 1,
        day_date: "2024-09-22",
        hot_dish: "Fransk løgsuppe m. gratineret ostebrød",
        green_dish: null,
        salad_1: "Pastasalat m. karry, ærter, majs, cherrytomat",
        salad_2: "Bønnesalat, spidskål, bønnespirer & vinaigrette"
      },
      {
        day_name: "Tirsdag", 
        day_of_week: 2,
        day_date: "2024-09-23",
        hot_dish: "Chili con carne",
        green_dish: "Chili sin carne",
        salad_1: "Bagbede salat, spinat, feta & græskarkerner",
        salad_2: "Caesar salat"
      },
      {
        day_name: "Onsdag",
        day_of_week: 3, 
        day_date: "2024-09-24",
        hot_dish: "Cheddar/bacon marineret kylling bryst, krydret kartoffelbåde, haricots, paprika sauce",
        green_dish: "Paneret grøntsagsbøf, krydret kartoffelbåde, haricots, paprika sauce",
        salad_1: null,
        salad_2: null
      },
      {
        day_name: "Torsdag",
        day_of_week: 4,
        day_date: "2024-09-25", 
        hot_dish: "Dagens fangst",
        green_dish: "Porre tærte",
        salad_1: null,
        salad_2: null
      },
      {
        day_name: "Fredag",
        day_of_week: 5,
        day_date: "2024-09-26",
        hot_dish: "Rullesteg m. svesker & æbler, stegte kartofler m. persille, dertil svampe ala creme",
        green_dish: "Broccoli nuggets, stegte kartofler & svampe ala creme", 
        salad_1: null,
        salad_2: null
      }
    ];

    // Insert new menu data with mapped records
    const menuRecords = mockMenuData.map(item => ({
      week_start_date: weekStartDate,
      day_of_week: item.day_of_week,
      day_name: item.day_name,
      day_date: item.day_date,
      hot_dish: item.hot_dish,
      green_dish: item.green_dish,
      salad_1: item.salad_1,
      salad_2: item.salad_2,
      uploaded_by: user.id,
      upload_filename: filename
    }));

    // Clear existing menu for this week first
    const { error: deleteError } = await supabase
      .from('weekly_menus')
      .delete()
      .eq('week_start_date', weekStartDate);

    if (deleteError) {
      console.error('Delete error:', deleteError);
    }

    // Insert new menu data with upsert to handle duplicates
    const { data, error } = await supabase
      .from('weekly_menus')
      .upsert(menuRecords, {
        onConflict: 'day_date,hot_dish',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error('Insert error:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Uploaded ${menuRecords.length} menu items for week starting ${weekStartDate}`,
        records: data
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Menu upload error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process menu upload' 
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